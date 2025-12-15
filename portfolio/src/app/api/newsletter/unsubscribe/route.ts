import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawToken = String(body?.token ?? "").trim();

    if (!rawToken) {
      return NextResponse.json({ ok: false, error: "Missing token." }, { status: 400 });
    }

    const tokenHash = sha256Hex(rawToken);
    const now = new Date();
    const nowIso = now.toISOString();

    // 1) Find the unsubscribe token
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from("newsletter_tokens")
      .select("id, subscriber_id, expires_at, used_at")
      .eq("type", "unsubscribe")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (tokenErr) {
      return NextResponse.json({ ok: false, error: tokenErr.message }, { status: 500 });
    }

    if (!tokenRow) {
      return NextResponse.json({ ok: false, error: "Invalid link." }, { status: 400 });
    }

    if (tokenRow.used_at) {
      // Idempotent: treat as already handled
      return NextResponse.json({ ok: true, status: "already_unsubscribed" }, { status: 200 });
    }

    if (tokenRow.expires_at && tokenRow.expires_at <= nowIso) {
      return NextResponse.json({ ok: false, error: "Link expired." }, { status: 400 });
    }

    // 2) Update subscriber status to unsubscribed
    const { error: subErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed" })
      .eq("id", tokenRow.subscriber_id);

    if (subErr) {
      return NextResponse.json({ ok: false, error: subErr.message }, { status: 500 });
    }

    // 3) Mark token used
    const { error: usedErr } = await supabaseAdmin
      .from("newsletter_tokens")
      .update({ used_at: nowIso })
      .eq("id", tokenRow.id);

    if (usedErr) {
      // Still succeeded unsubscribing; token bookkeeping failed
      return NextResponse.json({ ok: true, status: "unsubscribed" }, { status: 200 });
    }

    return NextResponse.json({ ok: true, status: "unsubscribed" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown server error." },
      { status: 500 }
    );
  }
}

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
    const nowIso = new Date().toISOString();

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

    if (tokenRow.expires_at && tokenRow.expires_at <= nowIso) {
      return NextResponse.json({ ok: false, error: "Link expired." }, { status: 400 });
    }

    // 1.5) Read subscriber status so we can say "canceled" vs "unsubscribed"
    const { data: sub, error: subErrRead } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("status")
      .eq("id", tokenRow.subscriber_id)
      .maybeSingle();

    if (subErrRead) {
      return NextResponse.json({ ok: false, error: subErrRead.message }, { status: 500 });
    }

    const currentStatus = sub?.status;

    // If token already used, treat as idempotent success
    if (tokenRow.used_at) {
      return NextResponse.json({ ok: true, status: "already_done" }, { status: 200 });
    }

    // Decide what this action means based on current subscriber status
    const action = currentStatus === "pending" ? "canceled" : "unsubscribed";

    // 2) Update subscriber status to unsubscribed (we still store as "unsubscribed" in DB)
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
      // Still succeeded; token bookkeeping failed
      return NextResponse.json({ ok: true, status: action }, { status: 200 });
    }

    return NextResponse.json({ ok: true, status: action }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown server error." },
      { status: 500 }
    );
  }
}

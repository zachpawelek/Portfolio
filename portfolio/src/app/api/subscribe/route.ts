import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const emailRaw = String(body?.email ?? "");
    const email = emailRaw.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
    }

    // If this email already exists, we return success (idempotent).
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("status")
      .eq("email", email)
      .maybeSingle();

    if (existingErr) {
      return NextResponse.json({ ok: false, error: existingErr.message }, { status: 500 });
    }

    // Safety: don't re-add unsubscribed emails automatically.
    if (existing?.status === "unsubscribed") {
      return NextResponse.json(
        { ok: false, error: "That email is unsubscribed." },
        { status: 400 }
      );
    }

    if (existing) {
      return NextResponse.json({ ok: true, status: existing.status }, { status: 200 });
    }

    const { error: insertErr } = await supabaseAdmin.from("newsletter_subscribers").insert({
      email,
      status: "pending",
      subscribed_at: new Date().toISOString(),
    });

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "pending" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown server error." },
      { status: 500 }
    );
  }
}

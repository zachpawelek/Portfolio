import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const emailRaw = String(body?.email ?? "");
    const email = emailRaw.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
    }

    const FROM = process.env.RESEND_FROM;
    if (!FROM) {
      return NextResponse.json({ ok: false, error: "Missing RESEND_FROM env var." }, { status: 500 });
    }

    // 1) Find existing subscriber (if any)
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id,status")
      .eq("email", email)
      .maybeSingle();

    if (existingErr) {
      return NextResponse.json({ ok: false, error: existingErr.message }, { status: 500 });
    }

    const wasUnsubscribed = existing?.status === "unsubscribed";

    // Allow explicit re-subscribe via the form: restart confirmation flow.
    if (wasUnsubscribed && existing?.id) {
      const { error: upErr } = await supabaseAdmin
        .from("newsletter_subscribers")
        .update({
          status: "pending",
          subscribed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (upErr) {
        return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
      }
    }

    let subscriberId = existing?.id as string | undefined;

    // 2) Insert subscriber if new
    if (!subscriberId) {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("newsletter_subscribers")
        .insert({
          email,
          status: "pending",
          subscribed_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertErr) {
        return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
      }

      subscriberId = inserted.id;
    }

    // If already active, we can just return success.
    if (existing?.status === "active") {
      return NextResponse.json({ ok: true, status: "active" }, { status: 200 });
    }

    // Decide status BEFORE emailing
    const responseStatus =
      wasUnsubscribed ? "resubscribed" : existing?.status === "pending" ? "resent" : "pending";

    // 3) Create confirmation token (store HASH only)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    const { error: tokenErr } = await supabaseAdmin.from("newsletter_tokens").insert({
      subscriber_id: subscriberId,
      type: "confirm",
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });

    if (tokenErr) {
      return NextResponse.json({ ok: false, error: tokenErr.message }, { status: 500 });
    }

    // 4) Email the confirmation link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing NEXT_PUBLIC_SITE_URL env var." },
        { status: 500 }
      );
    }

    // Put the token in the PATH (more robust than query strings in email clients)
    const confirmUrl = `${baseUrl}/newsletter/confirm/${encodeURIComponent(rawToken)}`;

    // Create an UNSUBSCRIBE token (store HASH only)
    const rawUnsubToken = crypto.randomBytes(32).toString("hex");
    const unsubHash = sha256Hex(rawUnsubToken);

    // Make unsubscribe links long-lived (e.g. 365 days)
    const unsubExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);

    const { error: unsubErr } = await supabaseAdmin.from("newsletter_tokens").insert({
      subscriber_id: subscriberId,
      type: "unsubscribe",
      token_hash: unsubHash,
      expires_at: unsubExpiresAt.toISOString(),
    });

    if (unsubErr) {
      return NextResponse.json({ ok: false, error: unsubErr.message }, { status: 500 });
    }

    const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe/${encodeURIComponent(rawUnsubToken)}`;

    const { error: emailErr } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "Confirm your subscription",
      html: `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.6;">
          <h2>Confirm your subscription</h2>
          <p>Click the button below to confirm your email address.</p>
          <p>
            <a href="${confirmUrl}" style="display:inline-block;background:#7c0902;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;">
              Confirm subscription
            </a>
          </p>
          <p style="color:#666;font-size:12px;margin-top:18px;">
            Or copy/paste this link:<br />
            <span>${confirmUrl}</span>
          </p>
          <p style="color:#666;font-size:12px;margin-top:18px;">
            Changed your mind?
            <a href="${unsubscribeUrl}">Cancel Subscription Request</a>
          </p>
        </div>
      `,
    });

    if (emailErr) {
      return NextResponse.json({ ok: false, error: "Email failed to send." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: responseStatus }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown server error." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function createUnsubscribeUrl(subscriberId: string, baseUrl: string) {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = sha256Hex(raw);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);

  const { error } = await supabaseAdmin.from("newsletter_tokens").insert({
    subscriber_id: subscriberId,
    type: "unsubscribe",
    token_hash: hash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw new Error(error.message);

  return `${baseUrl}/newsletter/unsubscribe/${encodeURIComponent(raw)}`;
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

    // Env checks for emailing
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing NEXT_PUBLIC_SITE_URL env var." },
        { status: 500 }
      );
    }

    const FROM = process.env.RESEND_FROM;
    if (!FROM) {
      return NextResponse.json({ ok: false, error: "Missing RESEND_FROM env var." }, { status: 500 });
    }

    // Find token row
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from("newsletter_tokens")
      .select("id, subscriber_id, expires_at, used_at")
      .eq("type", "confirm")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (tokenErr) {
      return NextResponse.json({ ok: false, error: tokenErr.message }, { status: 500 });
    }

    if (!tokenRow) {
      return NextResponse.json({ ok: false, error: "Invalid link." }, { status: 400 });
    }

    if (tokenRow.used_at) {
      return NextResponse.json({ ok: true, status: "already_confirmed" }, { status: 200 });
    }

    if (tokenRow.expires_at && tokenRow.expires_at <= nowIso) {
      return NextResponse.json({ ok: false, error: "Link expired." }, { status: 400 });
    }

    // Activate subscriber
    const { error: subErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ status: "active", confirmed_at: nowIso })
      .eq("id", tokenRow.subscriber_id);

    if (subErr) {
      return NextResponse.json({ ok: false, error: subErr.message }, { status: 500 });
    }

    // Mark token used
    const { error: usedErr } = await supabaseAdmin
      .from("newsletter_tokens")
      .update({ used_at: nowIso })
      .eq("id", tokenRow.id);

    if (usedErr) {
      // Subscriber is active; token bookkeeping failed
      return NextResponse.json({ ok: true, status: "confirmed_with_warning" }, { status: 200 });
    }

    // --- Welcome + latest issue (only once) ---

    // Load subscriber email + welcome_sent_at
    const { data: sub, error: subGetErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email, welcome_sent_at")
      .eq("id", tokenRow.subscriber_id)
      .single();

    if (subGetErr) {
      // Confirmation succeeded; welcome email failed to prepare
      return NextResponse.json({ ok: true, status: "confirmed_no_welcome" }, { status: 200 });
    }

    // If already sent, don't send again
    if (sub.welcome_sent_at) {
      return NextResponse.json({ ok: true, status: "confirmed" }, { status: 200 });
    }

    const unsubscribeUrl = await createUnsubscribeUrl(tokenRow.subscriber_id, baseUrl);

    // Fetch latest issue (optional)
    const { data: latest, error: latestErr } = await supabaseAdmin
      .from("newsletters")
      .select("subject, filename, storage_path")
      .eq("is_latest", true)
      .maybeSingle();

    if (latestErr) {
      // Still send a welcome even if latest lookup fails
    }

    let latestUrl = "";
    if (latest?.storage_path) {
      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from("newsletters")
        .createSignedUrl(latest.storage_path, 60 * 60 * 24 * 7); // 7 days

      if (!signErr && signed?.signedUrl) {
        latestUrl = signed.signedUrl;
      }
    }

    const latestBlock = latestUrl
      ? `
        <p style="margin-top:16px;">
          <strong>Latest issue:</strong> ${latest?.filename ?? "Download"}<br />
          <a href="${latestUrl}">Click here to download</a>
        </p>
      `
      : `
        <p style="margin-top:16px;color:#666;">
          (No latest issue available yet — stay tuned!)
        </p>
      `;

    const { error: welcomeErr } = await resend.emails.send({
      from: FROM,
      to: [sub.email],
      subject: "Welcome! Here’s the latest newsletter",
      html: `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome 👋</h2>
          <p>Thanks for confirming your subscription — you’re all set.</p>
          ${latestBlock}
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
          <p style="color:#666;font-size:12px;line-height:1.6;">
            Don’t want these emails?
            <a href="${unsubscribeUrl}">Unsubscribe</a>
          </p>
        </div>
      `,
    });

    if (!welcomeErr) {
      await supabaseAdmin
        .from("newsletter_subscribers")
        .update({ welcome_sent_at: nowIso })
        .eq("id", tokenRow.subscriber_id);
    }

    return NextResponse.json({ ok: true, status: "confirmed" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown server error." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}


async function createUnsubscribeUrl(subscriberId: string, baseUrl: string) {
  // We generate a fresh raw token because we only store hashes in DB.
  const rawUnsubToken = crypto.randomBytes(32).toString("hex");
  const unsubHash = sha256Hex(rawUnsubToken);
  const unsubExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);

  const { error } = await supabaseAdmin.from("newsletter_tokens").insert({
    subscriber_id: subscriberId,
    type: "unsubscribe",
    token_hash: unsubHash,
    expires_at: unsubExpiresAt.toISOString(),
  });

  if (error) throw new Error(error.message);

  return `${baseUrl}/newsletter/unsubscribe/${encodeURIComponent(rawUnsubToken)}`;
}

export async function POST(req: Request) {
  try {
    
    const body = await req.json().catch(() => ({}));
    const subject = String(body?.subject ?? "").trim();
    const html = String(body?.html ?? "").trim();
    const testEmail = String(body?.testEmail ?? "").trim().toLowerCase(); // optional

    if (!subject || !html) {
      return NextResponse.json({ ok: false, error: "Missing subject or html." }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing NEXT_PUBLIC_SITE_URL env var." },
        { status: 500 }
      );
    }

    // 1) Choose recipients
    let recipients: Array<{ id: string; email: string }> = [];

    if (testEmail) {
      const { data, error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("id,email")
        .eq("email", testEmail)
        .maybeSingle();

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      if (!data) return NextResponse.json({ ok: false, error: "Test email not found in DB." }, { status: 400 });

      recipients = [{ id: data.id, email: data.email }];
    } else {
      const { data, error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("id,email")
        .eq("status", "active");

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      recipients = (data ?? []) as Array<{ id: string; email: string }>;
    }

    // 2) Send emails
    const FROM = "Zach <onboarding@resend.dev>";

    let sent = 0;
    const failed: Array<{ email: string; error: string }> = [];

    for (const r of recipients) {
      try {
        const unsubscribeUrl = await createUnsubscribeUrl(r.id, baseUrl);

        const finalHtml = `
          ${html}
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
          <p style="color:#666;font-size:12px;line-height:1.6;">
            Changed your mind?
            <a href="${unsubscribeUrl}">Unsubscribe</a>
          </p>
        `;

        const { error } = await resend.emails.send({
          from: FROM,
          to: [r.email],
          subject,
          html: finalHtml,
        });

        if (error) throw new Error(typeof error === "string" ? error : "Resend error");
        sent += 1;
      } catch (e: any) {
        failed.push({ email: r.email, error: e?.message ?? "Unknown error" });
      }
    }

    return NextResponse.json({ ok: true, sent, failedCount: failed.length, failed }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Unknown server error." }, { status: 500 });
  }
}

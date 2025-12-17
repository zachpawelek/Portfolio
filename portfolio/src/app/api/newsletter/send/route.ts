import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function stringifyResendError(err: any) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err?.message) return String(err.message);
  return JSON.stringify(err);
}

// Retries only on rate-limit (429) errors
async function resendSendWithRetry(sendFn: () => Promise<{ error?: any }>, maxTries = 4) {
  let lastErr: any = null;

  for (let attempt = 1; attempt <= maxTries; attempt++) {
    const res = await sendFn();
    if (!res?.error) return;

    lastErr = res.error;
    const msg = stringifyResendError(lastErr).toLowerCase();

    const is429 =
      msg.includes("429") ||
      msg.includes("too many") ||
      msg.includes("rate limit") ||
      msg.includes("rate_limit_exceeded");

    if (!is429) break;

    // backoff: 700ms, 1400ms, 2800ms...
    await sleep(700 * Math.pow(2, attempt - 1));
  }

  throw new Error(stringifyResendError(lastErr));
}

async function createUnsubscribeUrl(subscriberId: string, baseUrl: string) {
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

    const FROM = process.env.RESEND_FROM;
    if (!FROM) {
      return NextResponse.json({ ok: false, error: "Missing RESEND_FROM env var." }, { status: 500 });
    }

    // 1) Choose recipients
    let recipients: Array<{ id: string; email: string }> = [];

    if (testEmail) {
      const { data, error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("id,email,status")
        .eq("email", testEmail)
        .maybeSingle();

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      if (!data)
        return NextResponse.json({ ok: false, error: "Test email not found in DB." }, { status: 400 });

      if (data.status !== "active") {
        return NextResponse.json(
          { ok: false, error: `Test email is not active (status=${data.status}). Subscribe + confirm first.` },
          { status: 400 }
        );
      }

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

        await resendSendWithRetry(() =>
          resend.emails.send({
            from: FROM,
            to: [r.email],
            subject,
            html: finalHtml,
          })
        );

        // Throttle to stay under ~2 req/sec
        await sleep(600);

        sent += 1;
      } catch (e: any) {
        failed.push({ email: r.email, error: e?.message ?? "Unknown error" });
      }
    }

    return NextResponse.json(
      { ok: true, sent, failedCount: failed.length, failed },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown server error." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

export const runtime = "nodejs";

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

    const form = await req.formData();

    const subject = String(form.get("subject") ?? "").trim();
    const testEmail = String(form.get("testEmail") ?? "").trim().toLowerCase();
    const file = form.get("file");

    if (!subject) {
      return NextResponse.json({ ok: false, error: "Missing subject." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing file upload." }, { status: 400 });
    }

    // basic file guardrails
    const filename = file.name || "newsletter";
    const ext = filename.toLowerCase().split(".").pop();
    const allowedExt = ext === "pdf" || ext === "docx";
    if (!allowedExt) {
      return NextResponse.json(
        { ok: false, error: "Only .pdf or .docx files are allowed." },
        { status: 400 }
      );
    }

    // size guardrail (10MB)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ ok: false, error: "File too large (max 10MB)." }, { status: 400 });
    }

    // Read into Buffer (for Storage + attachment)
    const buf = Buffer.from(await file.arrayBuffer());

    // Upload file to Supabase Storage so "latest issue" can be emailed on confirm
    const storagePath = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}-${filename}`;

    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("newsletters")
      .upload(storagePath, buf, { contentType, upsert: false });

    if (uploadErr) {
      return NextResponse.json({ ok: false, error: uploadErr.message }, { status: 500 });
    }

    // Attachment for the actual send
    const attachment = { filename, content: buf.toString("base64") };

    // recipients
    let recipients: Array<{ id: string; email: string }> = [];

    if (testEmail) {
      const { data, error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("id,email,status")
        .eq("email", testEmail)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ ok: false, error: "Test email not found in DB." }, { status: 400 });
      }

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

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      recipients = (data ?? []) as Array<{ id: string; email: string }>;
    }

    let sent = 0;
    const failed: Array<{ email: string; error: string }> = [];

    for (const r of recipients) {
      try {
        const unsubscribeUrl = await createUnsubscribeUrl(r.id, baseUrl);

        const html = `
          <p>Newsletter attached: <strong>${filename}</strong></p>
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
            html,
            attachments: [attachment],
          })
        );

        // Throttle to stay under ~2 req/sec
        await sleep(600);

        sent += 1;
      } catch (e: any) {
        failed.push({ email: r.email, error: e?.message ?? "Unknown error" });
      }
    }

    // Only update "latest issue" if at least one email was actually sent
    if (sent > 0) {
      const { error: clearErr } = await supabaseAdmin
        .from("newsletters")
        .update({ is_latest: false })
        .eq("is_latest", true);

      if (clearErr) {
        return NextResponse.json({ ok: false, error: clearErr.message }, { status: 500 });
      }

      const { error: issueErr } = await supabaseAdmin.from("newsletters").insert({
        subject,
        filename,
        storage_path: storagePath,
        mime_type: contentType,
        is_latest: true,
      });

      if (issueErr) {
        return NextResponse.json({ ok: false, error: issueErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, sent, failedCount: failed.length, failed }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown server error." },
      { status: 500 }
    );
  }
}

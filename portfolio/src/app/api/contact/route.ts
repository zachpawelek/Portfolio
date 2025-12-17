import { Resend } from "resend";

export const runtime = "nodejs";

type Payload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown; // honeypot
};

function asString(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function isEmailLike(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const name = asString(body.name);
    const email = asString(body.email);
    const subjectRaw = asString(body.subject);
    const message = asString(body.message);
    const company = asString(body.company);

    // Bot trap: if filled, silently succeed (don’t help bots)
    if (company) {
      return Response.json({ ok: true });
    }

    if (!name || name.length > 120) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!email || !isEmailLike(email) || email.length > 200) {
      return Response.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (!message || message.length > 1000) {
      return Response.json(
        { error: "Please enter a message (max 1000 characters)." },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM?.trim();
    const to = process.env.CONTACT_TO?.trim();

    if (!resendKey || !from || !to) {
      return Response.json(
        { error: "Server is not configured for contact messages yet." },
        { status: 500 }
      );
    }

    const resend = new Resend(resendKey);

    const subject = subjectRaw
      ? `Portfolio contact: ${subjectRaw}`.slice(0, 200)
      : `Portfolio contact from ${name}`.slice(0, 200);

    const text = [
      "New portfolio contact message",
      "-----------------------------",
      `Name: ${name}`,
      `Email: ${email}`,
      subjectRaw ? `Subject: ${subjectRaw}` : "",
      "",
      message,
      "",
      `Sent at: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
        <h2>New portfolio contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${subjectRaw ? `<p><strong>Subject:</strong> ${escapeHtml(subjectRaw)}</p>` : ""}
        <hr />
        <pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapeHtml(
          message
        )}</pre>
        <p style="color:#666; font-size:12px;">Sent at: ${new Date().toISOString()}</p>
      </div>
    `;

    const safeName = name.replace(/[^\p{L}\p{N}\s.'-]/gu, "").slice(0, 60) || "Website Visitor";

    // Shows in inbox as: "Jane Doe via zachpawelek.com" (but still from your verified address)
    const fromWithName = `${safeName} via zachpawelek.com <${from.match(/<(.+)>/)?.[1] ?? from}>`;
    
    // Reply goes to the visitor (and many clients show this nicely)
    const replyTo = `${safeName} <${email}>`;
    
    await resend.emails.send({
      from: fromWithName,
      to,
      replyTo,
      subject,
      text,
      html,
    });
    
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

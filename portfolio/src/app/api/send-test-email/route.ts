import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      // Resend allows this sender for quick testing in many cases.
      // If it errors about "from" needing verification, we’ll handle that next.
      from: "Zach <onboarding@resend.dev>",
      to: ["delivered@resend.dev"],
      subject: "Portfolio newsletter test ✅",
      html: "<p>If you see this, sending works!</p>",
    });

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

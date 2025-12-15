import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cinzel, inter } from "@/lib/fonts";
import ConfirmDebugClient from "../ConfirmDebugClient";


function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export default async function ConfirmNewsletterPage({
  params,
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: { token?: string };
}) {
  // Accept token from EITHER:
  // - /newsletter/confirm/<token>   => params.slug[0]
  // - /newsletter/confirm?token=... => searchParams.token
  const tokenFromPath = decodeURIComponent((params?.slug?.[0] ?? "").trim());
  const tokenFromQuery = String(searchParams?.token ?? "").trim();
  const token = tokenFromPath || tokenFromQuery;

  // Add a version marker so you can visually confirm you're on the NEW route file
  const ROUTE_MARKER = "CONFIRM_ROUTE_V2";

  if (!token) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <div className={`${inter.className} text-xs text-white/40`}>{ROUTE_MARKER}</div>
  
          <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>
            Missing token
          </h1>
  
          <p className={`${inter.className} mt-4 text-white/70`}>
            This confirmation link is missing the token. Try opening the link from your email again.
          </p>
  
          {/* TEMP DEBUG: remove once working */}
          <pre className="mt-6 rounded-2xl bg-black/40 p-4 text-xs text-white/60 ring-1 ring-white/10">
            {JSON.stringify({ slug: params?.slug, token: searchParams?.token }, null, 2)}
          </pre>

          <ConfirmDebugClient />
        </div>
      </main>
    );
  }
  

  const tokenHash = sha256Hex(token);
  const nowIso = new Date().toISOString();

  const { data: tokenRow, error: tokenErr } = await supabaseAdmin
    .from("newsletter_tokens")
    .select("id, subscriber_id, expires_at, used_at")
    .eq("type", "confirm")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenErr) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <div className={`${inter.className} text-xs text-white/40`}>{ROUTE_MARKER}</div>
          <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>
            Something went wrong
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>Server error: {tokenErr.message}</p>
        </div>
      </main>
    );
  }

  if (!tokenRow) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <div className={`${inter.className} text-xs text-white/40`}>{ROUTE_MARKER}</div>
          <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>Invalid link</h1>
          <p className={`${inter.className} mt-4 text-white/70`}>
            This confirmation link is invalid or was already used.
          </p>
        </div>
      </main>
    );
  }

  if (tokenRow.used_at) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <div className={`${inter.className} text-xs text-white/40`}>{ROUTE_MARKER}</div>
          <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>
            Already confirmed
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>You’re all set — this link was already used.</p>
        </div>
      </main>
    );
  }

  if (tokenRow.expires_at && tokenRow.expires_at <= nowIso) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <div className={`${inter.className} text-xs text-white/40`}>{ROUTE_MARKER}</div>
          <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>Link expired</h1>
          <p className={`${inter.className} mt-4 text-white/70`}>
            This confirmation link expired. Subscribe again to get a new one.
          </p>
        </div>
      </main>
    );
  }

  const { error: subErr } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({ status: "active", confirmed_at: nowIso })
    .eq("id", tokenRow.subscriber_id);

  if (subErr) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <div className={`${inter.className} text-xs text-white/40`}>{ROUTE_MARKER}</div>
          <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>
            Something went wrong
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>Couldn’t activate subscription: {subErr.message}</p>
        </div>
      </main>
    );
  }

  await supabaseAdmin.from("newsletter_tokens").update({ used_at: nowIso }).eq("id", tokenRow.id);

  return (
    <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
      <div className="mx-auto max-w-2xl">
        <div className={`${inter.className} text-xs text-white/40`}>{ROUTE_MARKER}</div>

        <div className={`${inter.className} text-xs uppercase tracking-[0.35em]`} style={{ color: "#7c0902" }}>
          Newsletter
        </div>

        <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>Confirmed ✅</h1>
        <p className={`${inter.className} mt-4 text-white/70`}>Thanks — your subscription is now active.</p>

        <a
          href="/"
          className="mt-8 inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-black hover:opacity-90"
          style={{ backgroundColor: "#7c0902" }}
        >
          Back to site
        </a>
      </div>
    </main>
  );
}

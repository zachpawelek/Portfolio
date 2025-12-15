import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cinzel, inter } from "@/lib/fonts";

// Helper: hash the raw token the same way we did when inserting into newsletter_tokens
function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export default async function ConfirmNewsletterPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = (searchParams?.token ?? "").trim();

  // Basic guard: missing token
  if (!token) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
            Missing token
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>
            This confirmation link is missing the token. Try opening the link from your email again.
          </p>
        </div>
      </main>
    );
  }

  const tokenHash = sha256Hex(token);
  const nowIso = new Date().toISOString();

  // 1) Find a valid, unused, unexpired confirm token
  const { data: tokenRow, error: tokenErr } = await supabaseAdmin
    .from("newsletter_tokens")
    .select("id, subscriber_id, expires_at, used_at, type")
    .eq("type", "confirm")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenErr) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
            Something went wrong
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>
            Server error: {tokenErr.message}
          </p>
        </div>
      </main>
    );
  }

  // Token not found
  if (!tokenRow) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
            Invalid link
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>
            This confirmation link is invalid or was already used.
          </p>
        </div>
      </main>
    );
  }

  // Token already used
  if (tokenRow.used_at) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
            Already confirmed
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>
            You’re all set — this link was already used.
          </p>
        </div>
      </main>
    );
  }

  // Token expired
  if (tokenRow.expires_at && tokenRow.expires_at <= nowIso) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
            Link expired
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>
            This confirmation link expired. Go back and subscribe again to get a new one.
          </p>
        </div>
      </main>
    );
  }

  // 2) Activate the subscriber
  const { error: subErr } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({ status: "active", confirmed_at: nowIso })
    .eq("id", tokenRow.subscriber_id);

  if (subErr) {
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
            Something went wrong
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>
            Couldn’t activate subscription: {subErr.message}
          </p>
        </div>
      </main>
    );
  }

  // 3) Mark the token as used (so it can’t be reused)
  const { error: usedErr } = await supabaseAdmin
    .from("newsletter_tokens")
    .update({ used_at: nowIso })
    .eq("id", tokenRow.id);

  if (usedErr) {
    // Subscription is already active; token bookkeeping failed.
    // Still show success so user isn't confused.
    return (
      <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
            Confirmed ✅
          </h1>
          <p className={`${inter.className} mt-4 text-white/70`}>
            You’re subscribed! (Internal note: token cleanup failed.)
          </p>
        </div>
      </main>
    );
  }

  // Success!
  return (
    <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
      <div className="mx-auto max-w-2xl">
        <div
          className={`${inter.className} text-xs uppercase tracking-[0.35em]`}
          style={{ color: "#7c0902" }}
        >
          Newsletter
        </div>

        <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>
          Confirmed ✅
        </h1>

        <p className={`${inter.className} mt-4 text-white/70`}>
          Thanks — your subscription is now active.
        </p>

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

"use client";

import { usePathname, useSearchParams } from "next/navigation";

export default function ConfirmDebugClient() {
  const pathname = usePathname();
  const sp = useSearchParams();

  return (
    <pre className="mt-6 rounded-2xl bg-black/40 p-4 text-xs text-white/60 ring-1 ring-white/10">
      {JSON.stringify(
        {
          clientPathname: pathname,
          clientTokenQuery: sp.get("token"),
        },
        null,
        2
      )}
    </pre>
  );
}

"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Server-side details are logged on the server; only the digest reaches the browser.
    console.error("Admin page error", error.digest);
  }, [error]);
  const denied = /not permitted|not signed in/i.test(error.message);
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-bold text-red-900">{denied ? "You do not have permission for this action" : "Something went wrong"}</h1>
      <p className="mt-2 text-sm text-red-800">
        {denied ? "Ask an administrator to change your role if you need access." : "The action could not be completed. No partial changes are shown as saved."}
        {error.digest && <> Reference: <code>{error.digest}</code></>}
      </p>
      <button onClick={reset} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Try again</button>
    </div>
  );
}

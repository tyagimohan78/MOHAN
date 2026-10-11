"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-slate-600">An unexpected error occurred. Please try again. If the problem continues, email sales@NTSO.in.</p>
      <button onClick={reset} className="mt-8 rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800">Try again</button>
    </div>
  );
}

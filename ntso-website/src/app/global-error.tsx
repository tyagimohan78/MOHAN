"use client";

// Last-resort boundary for errors in the root layout itself.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, display: "grid", placeItems: "center", minHeight: "100vh", background: "#f2f6fb", color: "#0b1f3a" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1>NTSO — temporarily unavailable</h1>
          <p>Please try again shortly, or email <a href="mailto:sales@NTSO.in">sales@NTSO.in</a>.</p>
          <button onClick={reset} style={{ padding: "10px 18px", borderRadius: 8, border: 0, background: "#0b1f3a", color: "#fff", cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}

// Fallback for console pages: each page wraps its session-dependent content in
// <Suspense> so navigations between console pages render this immediately.
export function ConsoleLoading() {
  return (
    <p className="eyebrow" role="status">
      Loading…
    </p>
  );
}

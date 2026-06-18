import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout-only route. /news content lives in news.index.tsx so that head()
// metadata is emitted by the leaf only — avoids duplicate canonical/alternate
// tags on /news/$slug pages.
export const Route = createFileRoute("/news")({
  component: () => <Outlet />,
});

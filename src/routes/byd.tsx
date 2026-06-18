import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout-only route. /byd content lives in byd.index.tsx so that head()
// metadata (canonical, hreflang) is emitted by the leaf route only — this
// avoids duplicate canonical/alternate tags on /byd/$slug pages.
export const Route = createFileRoute("/byd")({
  component: () => <Outlet />,
});

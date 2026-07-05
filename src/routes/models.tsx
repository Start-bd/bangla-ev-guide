import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout-only route. Content lives in models.index.tsx and models.$slug.tsx.
export const Route = createFileRoute("/models")({
  component: () => <Outlet />,
});

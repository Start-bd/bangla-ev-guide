import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// A client that navigates away / cancels mid-render aborts the socket. Node
// surfaces that as `Error: aborted` (ECONNRESET) — it is not an app failure and
// must not be reported or turned into a 500 error page.
function isClientAbort(error: unknown): boolean {
  if (error == null || typeof error !== "object") return false;
  const e = error as { code?: unknown; message?: unknown; name?: unknown };
  return (
    e.code === "ECONNRESET" ||
    e.name === "AbortError" ||
    (typeof e.message === "string" && /aborted|ECONNRESET/i.test(e.message))
  );
}

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    if (isClientAbort(error)) {
      return new Response(null, { status: 499 });
    }
    console.error(error);

    try {
      const { captureServerError } = await import("./lib/monitoring.server");
      const url = request ? new URL(request.url) : undefined;
      await captureServerError(error, {
        route: url?.pathname,
        url: url?.href,
        method: request?.method,
      });
    } catch (reportError) {
      console.error("[monitoring] failed to report SSR error", reportError);
    }
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));

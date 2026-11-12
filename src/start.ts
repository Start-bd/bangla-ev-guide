import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// A client that navigates away / cancels mid-render aborts the socket. Node
// surfaces that as `Error: aborted` (ECONNRESET) — it is not an app failure and
// must not be reported or turned into a 500 error page.
function isClientAbort(error: unknown, depth = 0): boolean {
  if (error == null || typeof error !== "object" || depth > 4) return false;
  const e = error as {
    cause?: unknown;
    code?: unknown;
    message?: unknown;
    name?: unknown;
  };
  return (
    e.code === "ECONNRESET" ||
    e.name === "AbortError" ||
    (typeof e.message === "string" && /(?:^|\b)aborted(?:\b|$)|ECONNRESET/i.test(e.message)) ||
    isClientAbort(e.cause, depth + 1)
  );
}

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    // H3 wraps a disconnected socket in an HTTPError with statusCode 500 and
    // keeps the original ECONNRESET under `cause`, so this must run before the
    // generic HTTP-status rethrow below.
    if (request?.signal.aborted || isClientAbort(error)) {
      return new Response(null, { status: 499 });
    }
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
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

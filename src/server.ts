import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

function isClientAbort(error: unknown, depth = 0): boolean {
  if (error == null || typeof error !== "object" || depth > 4) return false;
  const candidate = error as {
    cause?: unknown;
    code?: unknown;
    message?: unknown;
    name?: unknown;
  };
  return (
    candidate.code === "ECONNRESET" ||
    candidate.name === "AbortError" ||
    (typeof candidate.message === "string" &&
      /(?:^|\b)aborted(?:\b|$)|ECONNRESET/i.test(candidate.message)) ||
    isClientAbort(candidate.cause, depth + 1)
  );
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  request: Request,
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  const capturedError = consumeLastCapturedError();
  if (request.signal.aborted || isClientAbort(capturedError)) {
    return new Response(null, {
      status: 499,
      statusText: "Client Closed Request",
    });
  }

  console.error(capturedError ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(request, response);
    } catch (error) {
      if (request.signal.aborted || isClientAbort(error)) {
        return new Response(null, {
          status: 499,
          statusText: "Client Closed Request",
        });
      }
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

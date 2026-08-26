/**
 * Minimal, dependency-free Sentry reporter for the Worker/SSR runtime.
 * The browser SDK cannot run here, so we post a Sentry envelope with fetch.
 * No-ops when SENTRY_DSN is not set.
 */

function parseDsn(dsn: string) {
  // https://<publicKey>@<host>/<projectId>
  const url = new URL(dsn);
  const projectId = url.pathname.replace(/^\//, "");
  return {
    publicKey: url.username,
    host: url.host,
    projectId,
    ingestUrl: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
  };
}

export async function captureServerError(
  error: unknown,
  context: Record<string, unknown> = {},
): Promise<void> {
  const dsn = process.env["SENTRY_DSN"];
  const err = error instanceof Error ? error : new Error(String(error));

  if (!dsn) {
    console.error("[monitoring:server]", err, context);
    return;
  }

  try {
    const { publicKey, ingestUrl } = parseDsn(dsn);
    const eventId = crypto.randomUUID().replace(/-/g, "");
    const sentAt = new Date().toISOString();

    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: "javascript",
      level: "error",
      environment: process.env["SENTRY_ENVIRONMENT"] ?? "production",
      release: process.env["SENTRY_RELEASE"],
      server_name: "banglaev-ssr",
      tags: { site: "banglaev", runtime: "ssr" },
      contexts: { page: context },
      exception: {
        values: [
          {
            type: err.name,
            value: err.message,
            stacktrace: { frames: framesFrom(err) },
            mechanism: { type: "ssr_middleware", handled: false },
          },
        ],
      },
    };

    const body =
      JSON.stringify({ event_id: eventId, sent_at: sentAt }) +
      "\n" +
      JSON.stringify({ type: "event" }) +
      "\n" +
      JSON.stringify(event) +
      "\n";

    await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "content-type": "application/x-sentry-envelope",
        "x-sentry-auth": `Sentry sentry_version=7, sentry_client=banglaev-ssr/1.0, sentry_key=${publicKey}`,
      },
      body,
    });
  } catch (reportingError) {
    console.error("[monitoring:server] failed to report", reportingError);
    console.error("[monitoring:server] original error", err, context);
  }
}

function framesFrom(err: Error) {
  const lines = (err.stack ?? "").split("\n").slice(1);
  return lines
    .map((line) => {
      const match = /at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/.exec(line.trim());
      if (!match) return null;
      return {
        function: match[1] ?? "<anonymous>",
        filename: match[2],
        lineno: Number(match[3]),
        colno: Number(match[4]),
        in_app: !String(match[2]).includes("node_modules"),
      };
    })
    .filter(Boolean)
    .reverse();
}

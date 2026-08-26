import * as Sentry from "@sentry/react";

const DSN = import.meta.env["VITE_SENTRY_DSN"] as string | undefined;

let initialized = false;

/**
 * Initialise client-side error monitoring.
 * No-ops when VITE_SENTRY_DSN is not configured, so local/preview builds stay quiet.
 */
export function initMonitoring() {
  if (initialized || typeof window === "undefined" || !DSN) return;
  initialized = true;

  Sentry.init({
    dsn: DSN,
    environment: (import.meta.env["MODE"] as string) ?? "production",
    release: (import.meta.env["VITE_APP_RELEASE"] as string) ?? undefined,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration()],
  });

  Sentry.setTag("site", "banglaev");
}

/** Report an error with page context (route, url, language). */
export function captureError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!initialized || !DSN) {
    console.error("[monitoring]", error, context);
    return;
  }
  Sentry.withScope((scope) => {
    scope.setContext("page", {
      route: window.location.pathname,
      url: window.location.href,
      search: window.location.search,
      lang: document.documentElement.lang,
      referrer: document.referrer,
    });
    scope.setContext("extra", context);
    Sentry.captureException(error);
  });
}

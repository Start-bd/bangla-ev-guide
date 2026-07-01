// Structured SSR logger. Emits a single JSON line per event so Worker logs
// (production + CI) are greppable by `scope`, `event`, `fn`, or `route`
// without losing the original Error stack.
//
// Use for any server-side failure that would otherwise be swallowed by a
// try/catch returning a fallback value (e.g. server functions that return
// [] on DB outage so the page still renders).

type Level = "error" | "warn" | "info";

type LogFields = {
  scope: string; // "server-fn" | "loader" | "route" | ...
  event: string; // short identifier: "db_read_failed", "loader_caught", ...
  fn?: string;
  route?: string;
  [key: string]: unknown;
};

function serializeError(err: unknown) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause instanceof Error ? { name: err.cause.name, message: err.cause.message } : err.cause,
    };
  }
  if (typeof err === "object" && err !== null) {
    try {
      return JSON.parse(JSON.stringify(err));
    } catch {
      return { value: String(err) };
    }
  }
  return { value: String(err) };
}

function emit(level: Level, fields: LogFields, err?: unknown) {
  const payload = {
    level,
    ts: new Date().toISOString(),
    ...fields,
    ...(err !== undefined ? { error: serializeError(err) } : {}),
  };
  const line = `[ssr] ${JSON.stringify(payload)}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const ssrLog = {
  error: (fields: LogFields, err?: unknown) => emit("error", fields, err),
  warn: (fields: LogFields, err?: unknown) => emit("warn", fields, err),
  info: (fields: LogFields) => emit("info", fields),
};

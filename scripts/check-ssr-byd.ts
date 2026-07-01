#!/usr/bin/env bun
/**
 * SSR loader failure check for /byd.
 *
 * Starts `vite dev`, requests /byd (and a couple of related routes), captures
 * every `[ssr] {...}` JSON line printed to stdout/stderr, writes the collected
 * lines to `logs/ssr-byd.jsonl` (uploaded as a CI artifact), and exits non-zero
 * when any structured SSR log with level="error" is scoped to the /byd route
 * or its backing server functions.
 *
 * Signals a real regression, not a transient backend outage: the log emitter
 * fires only when a server function or loader actually throws / returns via
 * catch, so a green run means /byd rendered without swallowed errors.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const LOG_PATH = resolve(ROOT, "logs/ssr-byd.jsonl");
const PORT = Number(process.env.PORT ?? 5273);
const BASE = `http://localhost:${PORT}`;
const ROUTES = ["/byd", "/byd/seal", "/"];
const WATCH_FNS = new Set([
  "getBydModels",
  "getFeaturedModels",
  "getAllModels",
  "getModelBySlug",
]);
const WATCH_ROUTES = new Set(["/byd", "/byd/$slug"]);

type SsrLine = {
  raw: string;
  parsed: Record<string, unknown> | null;
};

const collected: SsrLine[] = [];

function record(chunk: string) {
  for (const line of chunk.split(/\r?\n/)) {
    const idx = line.indexOf("[ssr] ");
    if (idx === -1) continue;
    const jsonPart = line.slice(idx + "[ssr] ".length).trim();
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(jsonPart) as Record<string, unknown>;
    } catch {
      /* keep raw only */
    }
    collected.push({ raw: line, parsed });
  }
}

function isFailure(entry: SsrLine) {
  const p = entry.parsed;
  if (!p || p.level !== "error") return false;
  const fn = typeof p.fn === "string" ? p.fn : "";
  const route = typeof p.route === "string" ? p.route : "";
  return WATCH_FNS.has(fn) || WATCH_ROUTES.has(route);
}

async function waitForServer(timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE + "/", { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`dev server did not become ready on ${BASE}`);
}

async function main() {
  await mkdir(dirname(LOG_PATH), { recursive: true });

  const child = spawn("bun", ["run", "dev", "--", "--port", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "development" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (b) => {
    const s = b.toString();
    process.stdout.write(s);
    record(s);
  });
  child.stderr.on("data", (b) => {
    const s = b.toString();
    process.stderr.write(s);
    record(s);
  });

  const cleanup = () => {
    if (!child.killed) child.kill("SIGTERM");
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });

  try {
    await waitForServer();
    for (const path of ROUTES) {
      const res = await fetch(BASE + path, { redirect: "manual" });
      // Give the server a beat to flush console output.
      await new Promise((r) => setTimeout(r, 250));
      console.log(`  fetched ${path} → ${res.status}`);
    }
    // Final flush.
    await new Promise((r) => setTimeout(r, 500));
  } finally {
    cleanup();
  }

  const jsonl = collected.map((c) => c.raw).join("\n") + (collected.length ? "\n" : "");
  await writeFile(LOG_PATH, jsonl, "utf8");

  const failures = collected.filter(isFailure);
  console.log(
    `\n[check-ssr-byd] captured ${collected.length} ssr line(s); ${failures.length} failure(s) matching /byd scope.`,
  );
  console.log(`[check-ssr-byd] wrote log artifact → ${LOG_PATH}`);

  if (failures.length > 0) {
    console.error("\n[check-ssr-byd] SSR loader failures detected for /byd:");
    for (const f of failures) console.error("  " + f.raw);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[check-ssr-byd] runner crashed:", err);
  process.exit(1);
});

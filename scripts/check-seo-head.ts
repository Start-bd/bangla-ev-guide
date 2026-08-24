#!/usr/bin/env bun
/**
 * SSR head-content test.
 *
 * For every route advertised in /sitemap.xml, fetch the SSR HTML and assert:
 *   - exactly one  <link rel="canonical" href="..."> matching the route URL
 *   - exactly one  <link rel="alternate" hreflang="bn" href="...">
 *   - exactly one  <link rel="alternate" hreflang="en" href="...?lang=en">
 *   - exactly one  <link rel="alternate" hreflang="x-default" href="...">
 *   - exactly one  <meta property="og:url" content="...">
 *
 * Usage:
 *   BASE_URL=http://localhost:5173 bun scripts/check-seo-head.ts
 *
 * If BASE_URL is unset, spawns `bun run dev` and tears it down on exit.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const SITE_URL = "https://banglaev.com";

type Failure = { route: string; problem: string };
const failures: Failure[] = [];

function countMatches(html: string, re: RegExp): RegExpMatchArray[] {
  return [...html.matchAll(re)];
}

function expectOne(
  route: string,
  html: string,
  label: string,
  re: RegExp,
  expectedHref: string,
) {
  const matches = countMatches(html, re);
  if (matches.length === 0) {
    failures.push({ route, problem: `missing ${label}` });
    return;
  }
  if (matches.length > 1) {
    failures.push({
      route,
      problem: `expected exactly one ${label}, got ${matches.length} (hrefs: ${matches.map((m) => m[1]).join(", ")})`,
    });
    return;
  }
  const href = matches[0][1];
  if (href !== expectedHref) {
    failures.push({
      route,
      problem: `${label} href mismatch — expected "${expectedHref}", got "${href}"`,
    });
  }
}

async function checkRoute(baseUrl: string, path: string) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, { redirect: "manual" });
  if (res.status !== 200) {
    failures.push({ route: path, problem: `HTTP ${res.status}` });
    return;
  }
  const html = await res.text();
  // Extract the <head> only to avoid matching anything in body
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : html;

  const canonical = `${SITE_URL}${path}`;
  const enHref = `${SITE_URL}${path}${path.includes("?") ? "&" : "?"}lang=en`;

  expectOne(
    path,
    head,
    "<link rel=canonical>",
    /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/gi,
    canonical,
  );
  expectOne(
    path,
    head,
    '<link rel=alternate hreflang="bn">',
    /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhref[L|l]ang=["']bn["'])[^>]*\bhref=["']([^"']+)["']/gi,
    canonical,
  );
  expectOne(
    path,
    head,
    '<link rel=alternate hreflang="en">',
    /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhref[L|l]ang=["']en["'])[^>]*\bhref=["']([^"']+)["']/gi,
    enHref,
  );
  expectOne(
    path,
    head,
    '<link rel=alternate hreflang="x-default">',
    /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhref[L|l]ang=["']x-default["'])[^>]*\bhref=["']([^"']+)["']/gi,
    canonical,
  );
  expectOne(
    path,
    head,
    '<meta property="og:url">',
    /<meta\b[^>]*\bproperty=["']og:url["'][^>]*\bcontent=["']([^"']+)["']/gi,
    canonical,
  );

  checkJsonLd(path, html, canonical);
}

/**
 * Parse every application/ld+json block in the document and assert it is
 * valid JSON. On model routes (/models/* and /byd/<model>), also assert a
 * Car node exists whose url self-references the page canonical.
 */
function checkJsonLd(path: string, html: string, canonical: string) {
  const blocks = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((m) => m[1]);

  if (blocks.length === 0) {
    failures.push({ route: path, problem: "no JSON-LD blocks found" });
    return;
  }

  const nodes: any[] = [];
  blocks.forEach((raw, i) => {
    try {
      const parsed = JSON.parse(raw);
      nodes.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch (err) {
      failures.push({
        route: path,
        problem: `JSON-LD block #${i + 1} is not valid JSON (${(err as Error).message})`,
      });
    }
  });

  const isModelRoute =
    /^\/models\/[^/]+$/.test(path) || /^\/byd\/[^/]+$/.test(path);
  if (!isModelRoute) return;

  const cars = nodes.filter((n) => n && n["@type"] === "Car");
  if (cars.length !== 1) {
    failures.push({
      route: path,
      problem: `expected exactly one Car JSON-LD node, got ${cars.length}`,
    });
    return;
  }
  const car = cars[0];
  for (const field of ["name", "brand", "image", "offers"]) {
    if (!car[field]) {
      failures.push({ route: path, problem: `Car JSON-LD missing "${field}"` });
    }
  }
  if (car.url !== canonical) {
    failures.push({
      route: path,
      problem: `Car JSON-LD url "${car.url}" does not match canonical "${canonical}"`,
    });
  }
  if (car.offers && car.offers.priceCurrency !== "BDT") {
    failures.push({
      route: path,
      problem: `Car JSON-LD offers.priceCurrency should be BDT, got "${car.offers?.priceCurrency}"`,
    });
  }
}

async function fetchSitemapPaths(baseUrl: string): Promise<string[]> {
  const res = await fetch(`${baseUrl}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return locs
    .map((u) => u.replace(/^https?:\/\/[^/]+/, ""))
    .map((p) => (p === "" ? "/" : p));
}

async function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* not ready */
    }
    await sleep(500);
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function spawnDev(): Promise<{ baseUrl: string; child: ChildProcess }> {
  const child = spawn("bun", ["run", "dev"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, BROWSER: "none" },
  });
  let baseUrl = "";
  const urlRe = /Local:\s+(https?:\/\/[^\s/]+)/i;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("dev server URL not detected within 60s")), 60_000);
    const onData = (buf: Buffer) => {
      const m = buf.toString().match(urlRe);
      if (m) {
        baseUrl = m[1];
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`dev server exited early with code ${code}`));
    });
  });
  await waitForServer(baseUrl);
  return { baseUrl, child };
}

async function main() {
  const externalBase = process.env.BASE_URL;
  let baseUrl: string;
  let child: ChildProcess | null = null;
  if (externalBase) {
    baseUrl = externalBase.replace(/\/$/, "");
    console.log(`Using BASE_URL=${baseUrl}`);
  } else {
    console.log("BASE_URL not set — spawning `bun run dev` …");
    const spawned = await spawnDev();
    baseUrl = spawned.baseUrl;
    child = spawned.child;
    console.log(`Dev server ready at ${baseUrl}`);
  }

  try {
    const paths = await fetchSitemapPaths(baseUrl);
    if (paths.length === 0) throw new Error("sitemap.xml had no <loc> entries");
    console.log(`Checking ${paths.length} routes from sitemap.xml`);
    for (const p of paths) {
      process.stdout.write(`  ${p} … `);
      const before = failures.length;
      await checkRoute(baseUrl, p);
      console.log(failures.length === before ? "ok" : "FAIL");
    }
  } finally {
    if (child) {
      child.kill("SIGTERM");
      // Give it a moment to die
      await sleep(200);
      if (!child.killed) child.kill("SIGKILL");
    }
  }

  if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} SSR head-tag failure(s):`);
    for (const f of failures) console.error(`  [${f.route}] ${f.problem}`);
    process.exit(1);
  }
  console.log("\n✅ All routes have a unique canonical + bn/en/x-default hreflang + og:url + valid JSON-LD");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

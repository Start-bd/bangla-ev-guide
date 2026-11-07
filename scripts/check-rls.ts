import { mkdir, writeFile } from "node:fs/promises";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Set them as CI secrets.");
  process.exit(1);
}

type Expectation = "denied" | "public-read";
type TableCheck = { table: string; expect: Expectation; why: string };
type CheckResult = {
  table: string;
  expect: Expectation;
  status: number | string;
  rows: number | "n/a";
  ok: boolean;
  detail: string;
};

// Keep this list aligned with Supabase RLS policies and grants.
const CHECKS: TableCheck[] = [
  { table: "profiles", expect: "denied", why: "contains user display names / avatars (PII)" },
  { table: "saved_models", expect: "denied", why: "contains per-user private data" },
  { table: "leads", expect: "denied", why: "contains visitor contact details" },
  { table: "ev_models", expect: "public-read", why: "public EV catalogue" },
  { table: "posts", expect: "public-read", why: "published news articles" },
];

async function selectAnon(table: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: ANON_KEY!, Authorization: `Bearer ${ANON_KEY}` },
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Keep a short raw response for diagnostics.
  }
  return { status: response.status, body };
}

const results: CheckResult[] = [];
for (const check of CHECKS) {
  let status: number | string = "request failed";
  let rows: number | "n/a" = "n/a";
  let ok = false;
  let detail = "";
  let snippet = "";

  try {
    const result = await selectAnon(check.table);
    status = result.status;
    rows = Array.isArray(result.body) ? result.body.length : "n/a";
    snippet = JSON.stringify(result.body).slice(0, 300);

    if (check.expect === "denied") {
      // Any HTTP 200 means the anon role has table SELECT access. An empty
      // result is not proof of denial: a permissive policy can return [].
      ok = status !== 200;
      detail = ok
        ? `anonymous SELECT denied (HTTP ${status})`
        : `anonymous SELECT returned HTTP 200 (${rows} rows); ${check.why}. Remove anon SELECT grants/policies unless access is intentional.`;
    } else {
      ok = status === 200;
      detail = ok
        ? "public read works"
        : `expected public read, got HTTP ${status}: ${snippet}`;
    }
  } catch (error) {
    status = error instanceof Error ? error.message : String(error);
    detail = `request failed: ${status}`;
  }

  const result = { table: check.table, expect: check.expect, status, rows, ok, detail };
  results.push(result);
  console.log(`${ok ? "PASS" : "FAIL"} ${check.table}: ${detail}`);
}

const failures = results.filter((result) => !result.ok);
const report = [
  "### 🔐 RLS regression check",
  "",
  failures.length === 0
    ? "All anonymous-access expectations held."
    : `**${failures.length} check(s) failed.** Review the table grants and RLS policies.`,
  "",
  "| Table | Expectation | Result | HTTP/status | Rows | Details |",
  "| --- | --- | --- | --- | --- | --- |",
  ...results.map(
    (result) =>
      `| ${result.table} | ${result.expect} | ${result.ok ? "✅ pass" : "❌ fail"} | ${result.status} | ${result.rows} | ${result.detail.replace(/\|/g, "\\|")} |`,
  ),
  "",
  "A private table is considered exposed if an anonymous SELECT returns HTTP 200, even when it contains no rows.",
].join("\n");

await mkdir("logs", { recursive: true });
await writeFile("logs/rls-check.log", results.map((result) => `${result.table}: ${result.detail}`).join("\n") + "\n");
await writeFile("logs/rls-report.md", `${report}\n`);

if (failures.length > 0) {
  console.error(`\nRLS regression check failed: ${failures.map((result) => result.table).join(", ")}`);
  process.exit(1);
}

console.log("\nAll anonymous-access regression checks passed.");

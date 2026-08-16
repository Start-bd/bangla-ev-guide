/**
 * RLS regression check.
 *
 * Talks to the backend Data API with the *anonymous* publishable key only and
 * asserts that private tables stay unreadable while public content stays
 * readable. Run in CI so a permissive policy (e.g. `USING (true)` on profiles)
 * can never silently reappear.
 *
 * Usage: bun scripts/check-rls.ts
 * Env:   VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY (falls back to .env)
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {}
  const out: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

const fileEnv = loadEnvFile('.env')
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !ANON_KEY) {
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Set them as CI secrets.',
  )
  process.exit(1)
}

type Expectation = 'denied' | 'public-read'

interface TableCheck {
  table: string
  expect: Expectation
  why: string
}

/**
 * Keep this list in sync with the database policies.
 * `denied`      -> anonymous visitors must NOT be able to read any row.
 * `public-read` -> intentionally public content (marketing data only, no PII).
 */
const CHECKS: TableCheck[] = [
  { table: 'profiles', expect: 'denied', why: 'contains user display names / avatars (PII)' },
  { table: 'saved_models', expect: 'denied', why: 'per-user private data' },
  { table: 'leads', expect: 'denied', why: 'contains contact details submitted by visitors' },
  { table: 'ev_models', expect: 'public-read', why: 'public EV catalogue' },
  { table: 'posts', expect: 'public-read', why: 'public news articles' },
]

async function selectAnon(table: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: ANON_KEY!, Authorization: `Bearer ${ANON_KEY}` },
  })
  const text = await res.text()
  let body: unknown = text
  try {
    body = JSON.parse(text)
  } catch {
    /* keep raw text */
  }
  return { status: res.status, body }
}

const failures: string[] = []
const reportRows: string[] = []
const logLines: string[] = []

// GitHub inline annotations: point reviewers at the exact CHECKS entry that failed.
const SELF_PATH = 'scripts/check-rls.ts'
const selfLines = existsSync(SELF_PATH) ? readFileSync(SELF_PATH, 'utf8').split('\n') : []

function checkLineNumber(table: string): number {
  const idx = selfLines.findIndex((l) => l.includes(`table: '${table}'`) || l.includes(`table: "${table}"`))
  return idx === -1 ? 1 : idx + 1
}

function ghEscape(s: string): string {
  return s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A').replace(/:/g, '%3A').replace(/,/g, '%2C')
}

function annotate(level: 'error' | 'notice', table: string, title: string, message: string) {
  if (!process.env.GITHUB_ACTIONS) return
  const line = checkLineNumber(table)
  console.log(
    `::${level} file=${SELF_PATH},line=${line},col=1,title=${ghEscape(title)}::${ghEscape(message)}`,
  )
}


for (const check of CHECKS) {
  const query = `GET ${SUPABASE_URL}/rest/v1/${check.table}?select=*&limit=1 (role: anon)`
  const { status, body } = await selectAnon(check.table)
  const rows = Array.isArray(body) ? body.length : null
  const snippet = JSON.stringify(body).slice(0, 300)

  let ok: boolean
  let detail: string

  if (check.expect === 'denied') {
    ok = !(status === 200 && (rows ?? 0) > 0)
    detail = ok
      ? `anonymous read blocked (status ${status})`
      : `anonymous SELECT returned ${rows} row(s) — ${check.why}. Restrict the SELECT policy (e.g. \`auth.uid() = user_id\`) and \`REVOKE SELECT ON public.${check.table} FROM anon;\``
  } else {
    ok = status === 200
    detail = ok
      ? `public read works (status ${status})`
      : `expected public read access but got status ${status} — ${snippet}. Ensure a \`TO anon\` SELECT policy plus \`GRANT SELECT ON public.${check.table} TO anon;\` exist.`
  }

  const label = ok ? 'PASS' : 'FAIL'
  console.log(`${label} ${check.table}: ${detail}`)
  logLines.push(`${label} ${check.table}\n  expectation: ${check.expect}\n  query: ${query}\n  status: ${status}\n  rows: ${rows ?? 'n/a'}\n  response: ${snippet}\n  detail: ${detail}\n`)
  reportRows.push(
    `| \`${check.table}\` | ${check.expect} | ${label === 'PASS' ? '✅ pass' : '❌ fail'} | ${status} | ${rows ?? 'n/a'} | ${detail.replace(/\|/g, '\\|')} |`,
  )

  if (!ok) failures.push(`${check.table} (${check.expect}) — ${detail}`)
}

// Write artifacts consumed by the CI PR-comment step.
const report = [
  '### 🔐 RLS regression check',
  '',
  failures.length === 0
    ? 'All anonymous-access expectations held. No RLS policy regressions detected.'
    : `**${failures.length} check(s) failed.** An RLS policy or grant lets the anonymous role reach data it must not (or blocks public content it must serve).`,
  '',
  '| Table | Expectation | Result | HTTP | Rows | What happened / how to fix |',
  '| --- | --- | --- | --- | --- | --- |',
  ...reportRows,
  '',
  `Full test output: [\`rls-check\` job log](${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY ?? ''}/actions/runs/${process.env.GITHUB_RUN_ID ?? ''}) · artifact \`rls-check-logs\` (\`logs/rls-check.log\`)`,
  '',
  '_Source of truth: `scripts/check-rls.ts` (`CHECKS` list)._',
].join('\n')

mkdirSync('logs', { recursive: true })
writeFileSync('logs/rls-check.log', logLines.join('\n'))
writeFileSync('logs/rls-report.md', report + '\n')

if (failures.length > 0) {
  console.error('\nRLS regression check failed:\n' + failures.map((f) => ' - ' + f).join('\n'))
  process.exit(1)
}

console.log('\nAll RLS regression checks passed.')


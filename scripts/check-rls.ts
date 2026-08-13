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

import { readFileSync, existsSync } from 'node:fs'

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

for (const check of CHECKS) {
  const { status, body } = await selectAnon(check.table)
  const rows = Array.isArray(body) ? body.length : null

  if (check.expect === 'denied') {
    const leaked = status === 200 && (rows ?? 0) > 0
    if (leaked) {
      failures.push(
        `FAIL ${check.table}: anonymous SELECT returned ${rows} row(s) — ${check.why}. ` +
          `Restrict the SELECT policy (e.g. auth.uid() = user_id) and revoke SELECT from anon.`,
      )
    } else {
      console.log(`PASS ${check.table}: anonymous read blocked (status ${status})`)
    }
  } else {
    if (status !== 200) {
      failures.push(
        `FAIL ${check.table}: expected public read access but got status ${status} — ${JSON.stringify(body).slice(0, 200)}`,
      )
    } else {
      console.log(`PASS ${check.table}: public read works (status ${status})`)
    }
  }
}

if (failures.length > 0) {
  console.error('\nRLS regression check failed:\n' + failures.map((f) => ' - ' + f).join('\n'))
  process.exit(1)
}

console.log('\nAll RLS regression checks passed.')

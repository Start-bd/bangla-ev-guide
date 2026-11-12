import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// When the configured backend is unreachable (dead host, no network), every
// request would otherwise pay the connect/DNS timeout (~seconds) before the
// per-call try/catch falls back. A tiny circuit breaker trips after the first
// failure and skips backend calls for a cooldown, keeping SSR fast in CI and
// during outages. Local seed data is served while the circuit is open.
const FAILURE_COOLDOWN_MS = 30_000;
let lastFailureAt = 0;

export function backendCircuitOpen(): boolean {
  return Date.now() - lastFailureAt < FAILURE_COOLDOWN_MS;
}

export function noteBackendFailure(): void {
  if (lastFailureAt === 0) lastFailureAt = Date.now() - FAILURE_COOLDOWN_MS - 1;
  lastFailureAt = Date.now();
}

// The publishable key is public by design; only the URL/key *names* are
// infrastructure-dependent, never secrets.
export function pub(): ReturnType<typeof createClient<Database>> | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

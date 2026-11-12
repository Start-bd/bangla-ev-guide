# Bangla EV Guide

Short project overview

BanglaEV is a bilingual (Bangla/English) guide to electric vehicles in Bangladesh. This repository contains the web app (TanStack Start / React + Vite) used to publish model pages, news, and buying guides.

## Runtimes & prerequisites

- Node.js >= 18 (for local dev/build)
- bun (optional) — the repository uses a few utility scripts that run under `bun` (see package.json: `test:seo`, `test:ssr-byd`, `test:rls`). These are optional — you can run the site without bun, but those checks require it.

## Quickstart

1. Install dependencies

```bash
# with npm
npm install

# or yarn
yarn install
```

2. Development server

```bash
# Start dev server
npm run dev
```

3. Build for production

```bash
npm run build
npm run preview
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values. Only `VITE_*` variables are exposed to the browser; the rest are server-side only.

### Required for local dev / build

| Variable | Where used | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser + SSR | Your Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser + SSR | Supabase `anon` / publishable key — safe to commit in `.env.example`, keep real value out of version control |
| `VITE_SENTRY_DSN` | Browser error reporting | Optional — leave blank for local/preview builds |
| `VITE_APP_RELEASE` | Sentry release tag | Optional — set to your deploy version (CI sets this to the commit SHA) |

### Server-side only (SSR / server functions)

These are read from the server-side `.env` and are **not** exposed to the browser. They are also not required for a static/SSR build that falls back to `LOCAL_EV_MODELS` / `LOCAL_POSTS` when Supabase is unreachable.

| Variable | Notes |
| --- | --- |
| `SUPABASE_URL` | Server-side Supabase URL (SSR, server functions, middleware). Same value as `VITE_SUPABASE_URL` typically. |
| `SUPABASE_ANON_KEY` | Server-side Supabase anon key. Same value as `VITE_SUPABASE_PUBLISHABLE_KEY` typically. |
| `SENTRY_DSN` | Server-side Sentry DSN (used by `scripts/report-ci-failure.ts` during CI). Optional. |

### Optional

| Variable | Default | Notes |
| --- | --- | --- |
| `SITE_URL` | `https://banglaev.com` | Absolute canonical site URL used for canonical/og links, sitemap. Set for staging builds (e.g. `https://staging.banglaev.com`). |
| `API_BASE` | — | Base URL for internal API used by placeholder loaders. Optional, rarely needed. |

### Runtime-injected (do not set manually)

The following are injected at runtime by Lovable and should be left blank in your local `.env` unless you are testing a Lovable preview build:

- `LOVABLE_SERVER_URL`
- `LOVABLE_BUILD_ID`
- `LOVABLE_PREVIEW_URL`

## Deploy

### Netlify (primary)

This project is configured for **Netlify** via `netlify.toml`:

- Build command: `bun run build`
- Publish directory: `dist/`
- Node version: `22` (pinned — matches the version the build has been verified on)

To deploy:

1. Create a new site on Netlify and **connect your GitHub repository** (`Start-bd/bangla-ev-guide`). Netlify installs its own GitHub App — no personal access token is required from you.
2. In Netlify site **Site settings → Environment variables**, add the variables listed above (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SENTRY_DSN`, `VITE_APP_RELEASE` for production, plus `SITE_URL` set to your production domain).
3. Netlify automatically builds and deploys on every push to the connected branch. You can also trigger a manual deploy from the Netlify dashboard.

> **Note on the build:** The `netlify.toml` `publish = "dist"` is correct for the Nitro/Netlify preset. Do **not** set the publish directory to `dist/client` — that layout only exists in the Lovable sandbox and causes "Deploy directory 'dist/client' does not exist" errors on a real Netlify site.

### CI (GitHub Actions)

The `.github/workflows/ci.yml` workflow runs on every push to `main` and every pull request. It requires the following GitHub repository secrets (Settings → Secrets and variables → Actions):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SENTRY_DSN`
- `SENTRY_DSN` (used by `scripts/report-ci-failure.ts` to report build failures)

The CI jobs are:

- **Build & basic checks** — install, typecheck, lint, production build
- **SEO SSR head content test** — `bun run test:seo`
- **SSR /byd loader failure check** — `bun run test:ssr-byd`
- **Playwright — featured model images** — `scripts/check-featured-images.py`
- **Playwright — ModelCard hover/focus contrast** — `bun run test:modelcard-hover`
- **Security — RLS regression check** — `bun run test:rls`

### Vercel (stale — remove if not used)

The file `.github/workflows/deploy-vercel.yml` is a stale Vercel deploy workflow. If this project is deployed on Netlify (the primary target), delete that file to avoid confusion. If you are using Vercel instead, keep it and configure `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as GitHub secrets.

- `src/routes/` — file-based routes. See `src/routes/README.md` for routing conventions.
- `src/components/site/ModelCard.tsx` — the model card UI used on listings and the homepage.
- `src/lib/seo.ts` — helpers for building canonical URLs, Open Graph, and JSON-LD (carLd).

## Notes for maintainers

- Image srcset assets are expected to be generated at build time. If you add new model images, ensure the build emits the expected srcset widths (480, 800, 1280) or update `src/components/site/ModelCard.tsx` mapping.
- `SITE_URL` is read from the environment. For staging builds, set `SITE_URL` accordingly.

## Contact

Start-bd <startbdhub@gmail.com>

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

- SITE_URL (optional) — absolute canonical site URL used for canonical/og links. Defaults to `https://banglaev.com`.
  Example: `SITE_URL=https://staging.banglaev.com`
- API_BASE (optional) — base URL for internal API used by placeholder loaders. Example: `API_BASE=https://api.banglaev.com`

## File layout (top-level of interest)

- `src/routes/` — file-based routes. See `src/routes/README.md` for routing conventions.
- `src/components/site/ModelCard.tsx` — the model card UI used on listings and the homepage.
- `src/lib/seo.ts` — helpers for building canonical URLs, Open Graph, and JSON-LD (carLd).

## Notes for maintainers

- Image srcset assets are expected to be generated at build time. If you add new model images, ensure the build emits the expected srcset widths (480, 800, 1280) or update `src/components/site/ModelCard.tsx` mapping.
- `SITE_URL` is read from the environment. For staging builds, set `SITE_URL` accordingly.

## Contact

Start-bd <startbdhub@gmail.com>

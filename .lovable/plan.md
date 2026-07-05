## Goal

Reposition BanglaEV as the Bangladesh EV sector portal (not just BYD). Add a broader set of EVs actually available or announced in Bangladesh, restructure routing so every brand — not just BYD — has real pages, and keep BYD as a highlighted flagship rather than the whole site.

## Scope

### 1. Catalog expansion (data)

Seed `ev_models` with additional EVs relevant to Bangladesh. Proposed shortlist (BEV unless noted):

- **BYD** (keep): Seal, Sealion 6 (PHEV), Atto 3, Dolphin, Yuan Plus, Song Plus (PHEV)
- **MG**: MG 4 (exists), MG ZS EV, MG Marvel R, MG Cyberster
- **Hyundai**: Ioniq 5 (exists), Ioniq 6, Kona Electric
- **Kia**: EV6, Niro EV
- **Tesla** (grey-market presence): Model 3, Model Y
- **Chinese value segment**: Neta V, Dongfeng Nano Box, Wuling Air EV, Zeekr X, Deepal S07
- **Two/three-wheeler segment note (feature card only, no detail pages this pass)**: Bajaj Chetak, Runner Bike, Palki (locally assembled)

Each row: brand, model, slug, type (BEV/PHEV), price_bdt (nullable — many not officially priced yet), range_km, battery_kwh, charging_time_min, zero_to_hundred, specs jsonb (drivetrain, safety, warranty), pros[], cons[], is_featured, display_order.

`is_featured` limited to 6–8 for the homepage carousel; the rest surface on brand and browse pages.

### 2. Routing restructure

Today `/byd/$slug` is BYD-only. Generalize:

- **New**: `/models` — filterable browse page (brand, type, price range, battery, range).
- **New**: `/brands/$brand` — brand hub (e.g. `/brands/mg`, `/brands/hyundai`, `/brands/kia`, `/brands/tesla`), listing that brand's models plus a short brand intro.
- **New**: `/models/$slug` — canonical detail route for every model regardless of brand.
- **Keep**: `/byd` and `/byd/$slug` as SEO-preserving aliases that redirect to `/brands/byd` and `/models/$slug`. Do not break existing indexed URLs.
- **Update**: homepage copy — "Bangladesh's EV guide" framing instead of BYD-first hero. BYD gets a dedicated "Flagship brand" section, not the whole hero.
- **Update**: Compare page — already multi-brand; just widen the default picker to include one non-BYD car.

### 3. ModelCard + image pipeline

- `ModelCard` already resolves images by slug. For new models without dedicated art, fall back to a brand-tinted placeholder card (not the raw Zap icon) — a lightweight SVG per brand — so cards look intentional. The existing runtime assertion + Playwright check keep "real image or intentional placeholder" contract.
- Link target is now `/models/$slug` for every card, so the `isByd` branch that unlinks non-BYD cards goes away.
- Generate hero WebP art for the top ~6 new models this turn (Ioniq 6, Kona EV, EV6, ZS EV, Model Y, Neta V). Others use the brand placeholder until art is added.

### 4. SEO

Per-brand and per-model `head()`:
- `/brands/$brand`: `"<Brand> Electric Cars in Bangladesh 2026 | Price & Specs"`, description mentioning that brand's lineup.
- `/models/$slug`: `"<Brand> <Model> Price in Bangladesh 2026 | Range, Battery, Specs"`, og:image = model hero.
- Update `/` and `/compare` copy + meta to drop "BYD Bangladesh"-only phrasing; keep BYD as one of the target keywords, not the only one.
- Update `sitemap.xml` to enumerate `/brands/*` and `/models/*`.

### 5. CI / tests

- Extend `scripts/check-featured-images.py` route list to include `/models` and `/brands/byd` (once implemented), so the srcset contract is verified on every new listing surface.
- Add a lightweight SSR check that each brand hub returns 200 with a unique `<title>`.

## Technical details

Migrations:
- INSERT-only migration for the new `ev_models` rows (schema already fits).
- No column additions needed; use existing `specs` jsonb for brand-specific fields (e.g. `warranty_km`, `warranty_years`, `drivetrain`, `assembled_in`).

New/changed files:
- `src/routes/models.index.tsx`, `src/routes/models.$slug.tsx`
- `src/routes/brands.$brand.tsx`
- `src/routes/byd.$slug.tsx` and `src/routes/byd.index.tsx` → thin redirect components (`throw redirect(...)`) preserving SEO via 301-equivalent client + `<link rel="canonical">`.
- `src/lib/models.functions.ts`: add `getModelBySlug`, `getModelsByBrand`, `getAllBrands`.
- `src/components/site/ModelCard.tsx`: brand-placeholder SVGs; link every card to `/models/$slug`.
- `src/routes/index.tsx`: new hero, "Featured models" row (all brands), "Explore by brand" strip, "BYD flagship" section.
- `src/assets/models/*.webp`: new hero art for 6 models (imagegen).
- `scripts/check-featured-images.py`: add `/models`, `/brands/byd`.

Order of work (one PR-shaped batch per step):
1. Data migration + brand-placeholder cards (unblocks everything visible).
2. `/models` browse + `/models/$slug` detail (functional multi-brand).
3. `/brands/$brand` hubs + BYD redirects + homepage restructure.
4. New hero images + SEO metadata + sitemap + CI route additions.

## Questions before I start

1. **Model shortlist** — happy with the list above, or want to add/remove specific cars (e.g. Proton eMas 7, Wuling Bingo, GAC Aion)?
2. **Real Bangladesh prices** — should I seed the new rows with `NULL` prices (safe, shows "—") or use best-effort market estimates with a "নির্দেশক মূল্য" (indicative) label?
3. **URL migration** — OK to move canonical model URLs to `/models/$slug` with `/byd/$slug` redirecting, or keep `/byd/$slug` as the canonical for BYD cars and only add `/models/$slug` for non-BYD?

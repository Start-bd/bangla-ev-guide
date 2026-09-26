#!/usr/bin/env python3
"""Playwright test: visits / and /byd across mobile/tablet/desktop and asserts
every featured model card renders a real WebP srcset (480w/800w/1280w) with a
loaded natural size — i.e. no card falls back to the Zap placeholder icon.

Usage: python3 scripts/check-featured-images.py
Requires the dev server on http://localhost:8080 (override with BASE_URL) and
playwright (pre-installed in the Lovable sandbox).
"""
import asyncio
import os
import sys
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8080")
ROUTES = ["/", "/byd", "/compare"]
BREAKPOINTS = [
    ("mobile", 390, 844),
    ("tablet", 820, 1180),
    ("desktop", 1440, 900),
]
EXPECTED_WIDTHS = ["480w", "800w", "1280w"]

CARD_EVAL = """
() => {
  const imgs = Array.from(document.querySelectorAll('img'))
    .filter(i => /\\b480w\\b/.test(i.getAttribute('srcset') || ''));
  return imgs.map(i => ({
    src: i.currentSrc || i.src,
    srcset: i.getAttribute('srcset') || '',
    alt: i.alt,
    naturalWidth: i.naturalWidth,
    complete: i.complete,
  }));
}
"""

async def main():
    failures = []

    def fail(msg):
        failures.append(msg)
        print("FAIL", msg, file=sys.stderr)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            for name, w, h in BREAKPOINTS:
                ctx = await browser.new_context(viewport={"width": w, "height": h})
                page = await ctx.new_page()
                for route in ROUTES:
                    label = f"[{name} {route}]"
                    await page.goto(f"{BASE}{route}", wait_until="networkidle")
                    if route == "/compare":
                        await page.wait_for_selector('[data-testid="compare-image-row"] img', timeout=10000)
                    await page.evaluate(
                        "async () => { window.scrollTo(0, document.body.scrollHeight);"
                        " await new Promise(r => setTimeout(r, 400)); window.scrollTo(0, 0); }"
                    )
                    await page.wait_for_load_state("networkidle")

                    cards = await page.evaluate(CARD_EVAL)
                    if not cards:
                        fail(f"{label} no featured model <img> found")
                        continue

                    for c in cards:
                        ctxlbl = f'{label} alt="{c["alt"]}"'
                        if not c["src"]:
                            fail(f"{ctxlbl} img has no src")
                        if not c["complete"] or c["naturalWidth"] == 0:
                            fail(f"{ctxlbl} image did not load (naturalWidth={c['naturalWidth']})")
                        for want in EXPECTED_WIDTHS:
                            if want not in c["srcset"]:
                                fail(f"{ctxlbl} srcset missing {want}: {c['srcset']}")

                    # No need to check for Zap placeholder separately: the img/placeholder
                    # branches are exclusive, so a valid srcset on every card guarantees
                    # no fallback was rendered.

                    print(f"OK {label} {len(cards)} card(s)")

                    # On /compare, exercise every selectable model chip so every
                    # slug's image is force-mounted at least once at this breakpoint.
                    if route == "/compare":
                        # Clear the default picks first: with an empty selection each
                        # click below *adds* a model, so the just-clicked slug is
                        # always mounted in the row when we validate it.
                        clear_btn = page.locator("section.container-page button", has_text="সব পরিষ্কার").first
                        try:
                            await clear_btn.click(timeout=5000)
                            await page.wait_for_load_state("networkidle")
                        except Exception:
                            pass

                        # Only the selectable model chips carry px-4 padding; picked
                        # pills and brand filter chips use px-3 and change on every
                        # click, so they must stay out of the iterated list.
                        chip_sel = "section.container-page button.px-4.rounded-full"
                        chip_labels = [
                            (await page.locator(chip_sel).nth(i).inner_text()).strip()
                            for i in range(await page.locator(chip_sel).count())
                        ]
                        for i, label in enumerate(chip_labels):
                            chip = page.locator(chip_sel).nth(i)
                            try:
                                await chip.click(timeout=5000)
                            except Exception:
                                # Model chips only disappear when a brand filter is
                                # active; retry once by text after resetting it.
                                try:
                                    brand_reset = page.locator(
                                        "section.container-page button.px-3", has_text="সব ব্র্যান্ড"
                                    ).first
                                    await brand_reset.click(timeout=3000)
                                except Exception:
                                    pass
                                try:
                                    await page.locator(chip_sel, has_text=label).first.click(timeout=5000)
                                except Exception:
                                    fail(f"{label} compare chip \"{label}\" not clickable")
                                    continue
                            await page.wait_for_load_state("networkidle")
                            # Poll until row imgs (if any) have decoded, tolerating the
                            # case where the click deselected the last picked model.
                            try:
                                await page.wait_for_function(
                                    "() => { const imgs = Array.from(document.querySelectorAll("
                                    "'[data-testid=\"compare-image-row\"] img'));"
                                    " return imgs.length === 0 ||"
                                    " imgs.every(i => i.complete && i.naturalWidth > 0); }",
                                    timeout=5000,
                                )
                            except Exception:
                                pass
                            row_imgs = await page.evaluate(
                                "() => Array.from(document.querySelectorAll('[data-testid=\"compare-image-row\"] img'))"
                                ".map(i => ({ src: i.currentSrc || i.src, srcset: i.getAttribute('srcset') || '',"
                                " alt: i.alt, naturalWidth: i.naturalWidth, complete: i.complete }))"
                            )
                            for c in row_imgs:
                                ctxlbl = f'{label} compare chip="{label}" alt="{c["alt"]}"'
                                if not c["srcset"] or not all(w in c["srcset"] for w in EXPECTED_WIDTHS):
                                    fail(f"{ctxlbl} srcset missing widths: {c['srcset']}")
                                if not c["complete"] or c["naturalWidth"] == 0:
                                    fail(f"{ctxlbl} image did not load (naturalWidth={c['naturalWidth']})")
                        print(f"OK {label} exercised {len(chip_labels)} compare chip(s)")
                await ctx.close()
        finally:
            await browser.close()

    if failures:
        print(f"\n{len(failures)} failure(s)", file=sys.stderr)
        sys.exit(1)
    print("\nAll featured model images verified.")

asyncio.run(main())

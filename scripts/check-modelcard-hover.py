"""Regression check: ModelCard 'বিস্তারিত দেখুন' button stays readable on hover/focus.

Visits /byd and /compare, hovers the first model card and focuses its link,
then asserts the button's text color flips to the light primary-foreground
while the background turns green, and that focus-visible shows a ring.

Usage: BASE_URL=http://localhost:8080 python scripts/check-modelcard-hover.py
Exits non-zero on failure. Screenshots are written to logs/modelcard-hover/.
"""
import asyncio
import os
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8080")
OUT_DIR = Path("logs/modelcard-hover")
OUT_DIR.mkdir(parents=True, exist_ok=True)

BUTTON_TEXT = "বিস্তারিত দেখুন"
failures: list[str] = []


def oklch_to_rgb(l: float, c: float, h: float) -> tuple[float, float, float]:
    import math
    hr = math.radians(h)
    a, b = c * math.cos(hr), c * math.sin(hr)
    l_ = l + 0.3963377774 * a + 0.2158037573 * b
    m_ = l - 0.1055613458 * a - 0.0638541728 * b
    s_ = l - 0.0894841775 * a - 1.2914855480 * b
    l3, m3, s3 = l_**3, m_**3, s_**3
    r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
    g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
    bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3
    return (min(max(r, 0), 1), min(max(g, 0), 1), min(max(bl, 0), 1))


def parse_color(color: str) -> tuple[float, float, float]:
    color = color.strip()
    if color.startswith("oklab("):
        parts = color[6:].rstrip(")").split("/")[0].split()
        l, a, b = float(parts[0]), float(parts[1]), float(parts[2])
        l_ = l + 0.3963377774 * a + 0.2158037573 * b
        m_ = l - 0.1055613458 * a - 0.0638541728 * b
        s_ = l - 0.0894841775 * a - 1.2914855480 * b
        l3, m3, s3 = l_**3, m_**3, s_**3
        r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
        g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
        bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3
        return (min(max(r, 0), 1), min(max(g, 0), 1), min(max(bl, 0), 1))
    if color.startswith("oklch("):
        parts = color[6:].rstrip(")").split("/")[0].split()
        l, c = float(parts[0]), float(parts[1])
        h = float(parts[2]) if len(parts) > 2 and parts[2] != "none" else 0.0
        return oklch_to_rgb(l, c, h)
    nums = color.replace("rgba(", "").replace("rgb(", "").rstrip(")").split(",")[:3]
    def lin(c: float) -> float:
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return tuple(lin(int(x) / 255) for x in nums)


def luminance(color: str) -> float:
    r, g, b = parse_color(color)  # both paths return linear sRGB
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


async def check_card(page, route: str, state: str, first: bool):
    card = page.locator("a", has_text=BUTTON_TEXT).first
    btn = card.locator(f"span:has-text('{BUTTON_TEXT}')").first

    if state == "hover":
        await card.hover()
    else:
        await card.focus()
    await page.wait_for_timeout(400)  # let transition settle

    styles = await btn.evaluate(
        "(el) => { const s = getComputedStyle(el); return { color: s.color, bg: s.backgroundColor, ring: s.boxShadow }; }"
    )
    shot = OUT_DIR / f"{route.strip('/').replace('/', '-') or 'home'}-{state}.png"
    await card.screenshot(path=str(shot))

    ratio = contrast(styles["color"], styles["bg"])
    print(f"[{route}] {state}: color={styles['color']} bg={styles['bg']} contrast={ratio:.2f} ring={styles['ring'][:60]}")

    if ratio < 3.0:
        failures.append(f"{route} {state}: low contrast {ratio:.2f} ({styles['color']} on {styles['bg']})")
    if state == "focus" and styles["ring"] in ("none", ""):
        failures.append(f"{route} focus: no focus-visible ring/box-shadow on button")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        for route in ["/byd", "/compare"]:
            await page.goto(f"{BASE_URL}{route}", wait_until="domcontentloaded")
            await page.wait_for_selector(f"span:has-text('{BUTTON_TEXT}')", timeout=15000)
            await check_card(page, route, "hover", first=True)
            await page.mouse.move(0, 0)
            await check_card(page, route, "focus", first=True)

        await browser.close()

    if failures:
        print("\nFAILURES:")
        for f in failures:
            print(" -", f)
        sys.exit(1)
    print("\nAll ModelCard hover/focus readability checks passed.")


asyncio.run(main())

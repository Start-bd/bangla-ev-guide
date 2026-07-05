#!/usr/bin/env node
/**
 * Playwright test: visits / and /byd across mobile/tablet/desktop and asserts
 * every featured model card renders a real WebP srcset (480w/800w/1280w) with
 * a loaded natural size — i.e. no card falls back to the Zap placeholder icon.
 *
 * Run: node scripts/check-featured-images.mjs
 * Requires: dev server on http://localhost:8080 and playwright installed.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:8080";
const ROUTES = ["/", "/byd"];
const BREAKPOINTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1440, height: 900 },
];
const EXPECTED_WIDTHS = ["480w", "800w", "1280w"];

const failures = [];

function fail(msg) {
  failures.push(msg);
  console.error("✗", msg);
}

const browser = await chromium.launch({ headless: true });
try {
  for (const bp of BREAKPOINTS) {
    const ctx = await browser.newContext({ viewport: { width: bp.width, height: bp.height } });
    const page = await ctx.newPage();

    for (const route of ROUTES) {
      const url = `${BASE}${route}`;
      const label = `[${bp.name} ${route}]`;
      await page.goto(url, { waitUntil: "networkidle" });
      // Force lazy images to load.
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 400));
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");

      const cards = await page.$$eval("a[href^='/byd/'], .group", (nodes) =>
        nodes
          .map((n) => n.querySelector("img"))
          .filter((img) => img && /\/assets\/models\//.test(img.currentSrc || img.src))
          .map((img) => ({
            src: img.currentSrc || img.src,
            srcset: img.getAttribute("srcset") ?? "",
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            complete: img.complete,
            hasPlaceholder: !!img.closest(".group")?.querySelector("svg.lucide-zap"),
          })),
      );

      if (cards.length === 0) {
        fail(`${label} no featured model <img> found`);
        continue;
      }

      for (const c of cards) {
        const ctx = `${label} alt="${c.alt}"`;
        if (!/\.webp/i.test(c.src)) fail(`${ctx} src is not webp: ${c.src}`);
        if (!c.complete || c.naturalWidth === 0) fail(`${ctx} image did not load (naturalWidth=${c.naturalWidth})`);
        for (const w of EXPECTED_WIDTHS) {
          if (!c.srcset.includes(w)) fail(`${ctx} srcset missing ${w}: ${c.srcset}`);
        }
      }

      // Assert no placeholder Zap icon rendered inside any card image slot.
      const placeholderCount = await page.locator(".group .aspect-\\[16\\/10\\] > .grid svg.lucide-zap").count();
      if (placeholderCount > 0) fail(`${label} ${placeholderCount} card(s) fell back to Zap placeholder`);

      console.log(`✓ ${label} ${cards.length} card(s) OK`);
    }

    await ctx.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\nAll featured model images verified.");

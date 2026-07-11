import { Link } from "@tanstack/react-router";
import { Zap, Facebook, Youtube, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-[var(--color-navy)] text-[var(--color-navy-foreground)]">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
            BanglaEV
          </div>
          <p className="mt-3 text-sm opacity-80">
            বাংলাদেশের সেরা ইলেকট্রিক গাড়ির গাইড। BYD, MG, Hyundai — সব EV এক জায়গায়।
          </p>
          <div className="mt-4 flex gap-3">
            <a aria-label="Facebook" href="https://www.facebook.com/banglaev" target="_blank" rel="noopener" className="rounded-full bg-white/10 p-2 hover:bg-primary"><Facebook className="h-4 w-4" /></a>
            <a aria-label="YouTube" href="https://www.youtube.com/@banglaev" target="_blank" rel="noopener" className="rounded-full bg-white/10 p-2 hover:bg-primary"><Youtube className="h-4 w-4" /></a>
            <a aria-label="Instagram" href="https://www.instagram.com/banglaev" target="_blank" rel="noopener" className="rounded-full bg-white/10 p-2 hover:bg-primary"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70">BYD মডেল</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/byd/$slug" params={{ slug: "seal" }} className="hover:text-primary">BYD Seal</Link></li>
            <li><Link to="/byd/$slug" params={{ slug: "sealion-6" }} className="hover:text-primary">BYD Sealion 6</Link></li>
            <li><Link to="/byd/$slug" params={{ slug: "atto-3" }} className="hover:text-primary">BYD Atto 3</Link></li>
            <li><Link to="/byd/$slug" params={{ slug: "dolphin" }} className="hover:text-primary">BYD Dolphin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70">তথ্য</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary">আমাদের সম্পর্কে</Link></li>
            <li><Link to="/news" className="hover:text-primary">খবর ও রিভিউ</Link></li>
            <li><Link to="/calculator" className="hover:text-primary">EV কস্ট ক্যালকুলেটর</Link></li>
            <li><Link to="/charging" className="hover:text-primary">চার্জিং গাইড</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-70">যোগাযোগ</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary">যোগাযোগ ফর্ম</Link></li>
            <li><Link to="/about" hash="partnership" className="hover:text-primary">বিজ্ঞাপন ও পার্টনারশিপ</Link></li>
            <li>
              <a href="https://bangla.autos" rel="noopener" className="hover:text-primary">
                রিকন্ডিশন্ড গাড়ির বাজার
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs opacity-80 md:flex-row">
          <p>© 2026 BanglaEV · বাংলাদেশে তৈরি 🇧🇩</p>
          <p className="flex gap-4">
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-banglaev.png";

const nav = [
  { to: "/models", label: "সকল EV" },
  { to: "/byd", label: "BYD" },
  { to: "/compare", label: "তুলনা" },
  { to: "/calculator", label: "ক্যালকুলেটর" },
  { to: "/charging", label: "চার্জিং" },
  { to: "/news", label: "খবর" },
  { to: "/about", label: "আমাদের সম্পর্কে" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="BanglaEV — home">
          <img
            src={logo}
            alt="BanglaEV logo"
            width={1536}
            height={512}
            className="h-9 w-auto"
            decoding="async"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/byd"
            hash="showrooms"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            <Zap className="h-4 w-4" /> শোরুম খুঁজুন
          </Link>
        </div>

        <button
          className="md:hidden rounded-md p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground/90 hover:bg-accent"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/byd"
              hash="showrooms"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              শোরুম খুঁজুন
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

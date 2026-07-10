import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { submitLead } from "@/lib/leads.functions";
import { localeLinks, ogMeta } from "@/lib/seo";

const ABOUT_TITLE = "আমাদের সম্পর্কে — BanglaEV";
const ABOUT_DESC = "BanglaEV বাংলাদেশের স্বাধীন EV রিসার্চ ও তথ্য প্ল্যাটফর্ম। যোগাযোগ ও বিজ্ঞাপন পার্টনারশিপের তথ্য।";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: ABOUT_TITLE },
      { name: "description", content: ABOUT_DESC },
      ...ogMeta({ title: ABOUT_TITLE, description: ABOUT_DESC, path: "/about" }),
    ],
    links: localeLinks("/about"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "BanglaEV",
          description: ABOUT_DESC,
          url: "https://bangla-ev-guide.lovable.app/about",
          email: "hello@banglaev.com",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Mymensingh",
            addressCountry: "BD",
          },
          areaServed: "BD",
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16">
          <h1 className="text-4xl font-extrabold md:text-5xl">আমাদের সম্পর্কে</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            BanglaEV বাংলাদেশের স্বাধীন EV রিসার্চ ও তথ্য প্ল্যাটফর্ম।
          </p>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">আমাদের লক্ষ্য</h2>
          <p className="mt-3 text-muted-foreground">
            বাংলাদেশে ইলেকট্রিক গাড়ির গ্রহণযোগ্যতা বাড়াতে আমরা স্বচ্ছ, নির্ভরযোগ্য তথ্য সরবরাহ করি — দাম,
            স্পেক্স, রিভিউ, চার্জিং ও পলিসি — সবই বাংলা ও ইংরেজিতে।
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> অবস্থান: ময়মনসিংহ, বাংলাদেশ</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> hello@banglaev.com</li>
          </ul>

          <div id="partnership" className="mt-10 rounded-2xl bg-accent p-6">
            <h3 className="font-bold">বিজ্ঞাপন ও পার্টনারশিপ</h3>
            <p className="mt-2 text-sm">
              BYD, MG, Hyundai ডিলারশিপ ও EV ব্র্যান্ডগুলির জন্য বিশেষ পার্টনারশিপ প্যাকেজ। যোগাযোগ ফর্মে বার্তা পাঠান।
            </p>
          </div>
        </div>

        <ContactForm />
      </section>
    </>
  );
}

function ContactForm() {
  const submit = useServerFn(submitLead);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const m = useMutation({
    mutationFn: () => submit({ data: { ...form, source: "/about" } }),
    onSuccess: () => setDone(true),
  });

  if (done) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-accent p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h3 className="mt-3 text-xl font-bold">ধন্যবাদ!</h3>
        <p className="mt-2 text-sm text-muted-foreground">আপনার বার্তা পেয়েছি। ২৪ ঘণ্টার মধ্যে যোগাযোগ করব।</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <h3 className="text-xl font-bold">যোগাযোগ ফর্ম</h3>
      <Field label="নাম" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required maxLength={100} />
      <Field label="ইমেইল" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required maxLength={200} />
      <Field label="ফোন (ঐচ্ছিক)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} maxLength={30} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">বার্তা</span>
        <textarea
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          rows={4}
          maxLength={2000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>
      {m.error && <p className="text-sm text-destructive">পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।</p>}
      <button
        type="submit"
        disabled={m.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50"
      >
        <Send className="h-4 w-4" /> {m.isPending ? "পাঠানো হচ্ছে…" : "বার্তা পাঠান"}
      </button>
    </form>
  );
}

function Field({
  label, value, onChange, type = "text", required, maxLength,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; maxLength?: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        type={type}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}

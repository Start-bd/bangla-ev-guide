import { createFileRoute, Link } from "@tanstack/react-router";
import { localeLinks, ogMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => {
    const t = "Terms of Use — BanglaEV";
    const d = "BanglaEV ব্যবহারের শর্তাবলি — কন্টেন্ট, দাম ও স্পেসিফিকেশনের নির্ভুলতা সম্পর্কে গুরুত্বপূর্ণ তথ্য।";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        ...ogMeta({ title: t, description: d, path: "/terms" }),
      ],
      links: localeLinks("/terms"),
    };
  },
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="container-page max-w-3xl py-16 prose-bn">
      <h1 className="text-4xl font-extrabold">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted-foreground">সর্বশেষ আপডেট: জুলাই ২০২৬</p>

      <h2 className="mt-8 text-2xl font-bold">কন্টেন্টের ভূমিকা</h2>
      <p className="mt-3">
        BanglaEV-তে প্রদর্শিত সকল দাম, স্পেসিফিকেশন ও তথ্য শুধুমাত্র সাধারণ জ্ঞানের উদ্দেশ্যে
        প্রদান করা হয়েছে। প্রকৃত দাম, ভেরিয়েন্ট ও সহজলভ্যতা সংশ্লিষ্ট অনুমোদিত ডিলার
        (যেমন BYD-এর জন্য CG Runner BD Ltd) থেকে যাচাই করে নিন।
      </p>

      <h2 className="mt-8 text-2xl font-bold">কোনো ওয়ারেন্টি নেই</h2>
      <p className="mt-3">
        সাইটের তথ্য "যেমন আছে তেমনই" প্রদান করা হয়। সঠিকতা, সম্পূর্ণতা বা হালনাগাদ থাকার
        বিষয়ে কোনো ওয়ারেন্টি দেওয়া হয় না। এই তথ্যের উপর ভিত্তি করে নেওয়া সিদ্ধান্তের জন্য
        BanglaEV দায়ী নয়।
      </p>

      <h2 className="mt-8 text-2xl font-bold">ব্র্যান্ড ও ট্রেডমার্ক</h2>
      <p className="mt-3">
        BYD, MG, Hyundai সহ উল্লেখিত সকল ব্র্যান্ড নাম ও লোগো তাদের নিজ নিজ মালিকের সম্পত্তি।
        BanglaEV কোনো নির্মাতা বা ডিলারের সাথে আনুষ্ঠানিকভাবে সংযুক্ত নয়, যদি না স্পষ্টভাবে
        উল্লেখ করা হয়।
      </p>

      <h2 className="mt-8 text-2xl font-bold">যোগাযোগ</h2>
      <p className="mt-3">
        শর্তাবলি সম্পর্কে প্রশ্ন থাকলে{" "}
        <Link to="/about" className="text-primary font-semibold">যোগাযোগ পেজ</Link> দেখুন।
      </p>
    </article>
  );
}

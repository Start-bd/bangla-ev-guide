import { createFileRoute, Link } from "@tanstack/react-router";
import { localeLinks, ogMeta, breadcrumbLd, absUrl, ogImage } from "@/lib/seo";
import heroImg from "@/assets/guides/electric-bikes-bangladesh.jpg";

const PATH = "/guide/best-electric-bikes-bangladesh";
const TITLE = "বাংলাদেশে সেরা ইলেকট্রিক বাইক (২০২৬) — ক্রয়ের গাইড | BanglaEV";
const DESC =
  "বাংলাদেশে সেরা ইলেকট্রিক বাইকগুলো জানুন — বাজেট পিক, লং-রেঞ্জ মডেল, ব্যাটারি ও রেঞ্জ পরামর্শ, রক্ষণাবেক্ষণ টিপস এবং কোথায় কেনা যায়। BanglaEV থেকে আপডেটেড গাইড।";
const DATE_PUBLISHED = "2026-08-13";
const HERO_ALT = "ঢাকার রাস্তায় ইলেকট্রিক বাইক — বাংলাদেশে সেরা ইলেকট্রিক বাইক গাইড";

const FAQS: { q: string; a: string }[] = [
  {
    q: "ইলেকট্রিক বাইক কতদূর যায়?",
    a: "আধুনিক Li-ion বাইক সাধারণত ৬০–১৫০ কিমি/চার্জ দেয়; বাস্তবে ম্যানুফ্যাকচারারের দাবির ৬০–৮০% ধরা উচিত।",
  },
  {
    q: "লিথিয়াম ব্যাটারি কি বাংলাদেশের আবহাওয়ায় সুরক্ষিত?",
    a: "হ্যাঁ—মানসম্মত Li-ion ব্যাটারি বিভিন্ন তাপমাত্রায় নিরাপদে কাজ করে। তবে অতি-উচ্চ তাপ এড়িয়ে চলা, BMS থাকা ও নির্মাতার নির্দেশ মেনে চলা প্রয়োজন।",
  },
  {
    q: "একবার চার্জ করতে খরচ কত?",
    a: "ব্যাটারি কেপাসিটি (kWh) × বিদ্যুৎ হার (BDT/kWh)। উদাহরণ: ১.৫ kWh × ১০ BDT/kWh = ১৫ BDT প্রতিটি পূর্ণ চার্জ।",
  },
  {
    q: "ব্যাটারি কি স্থানীয়ভাবে পরিবর্তন করা যায়?",
    a: "অনেক ব্র্যান্ডের অনুমোদিত ডিলার ব্যাটারি পরিবর্তন প্রদান করে; ব্যাটারি পাওয়া ও খরচ ভিন্ন হতে পারে—কিনার আগে জেনে নিন।",
  },
  {
    q: "নির্ভরযোগ্য শোরুম ও সার্ভিস সেন্টার কোথায় পাব?",
    a: "banglaev.com-এর ব্র্যান্ড পেজ ও মডেল তালিকা থেকে শুরু করুন; স্থানীয় ডিলার নেটওয়ার্ক আছে এমন মডেলকে অগ্রাধিকার দিন।",
  },
];

export const Route = createFileRoute("/guide/best-electric-bikes-bangladesh")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      ...ogMeta({
        title: TITLE,
        description: DESC,
        path: PATH,
        type: "article",
        image: heroImg,
        imageAlt: HERO_ALT,
      }),
    ],
    links: localeLinks(PATH),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "বাংলাদেশে সেরা ইলেকট্রিক বাইক — ক্রেতার গাইড ও শীর্ষ পিক",
          datePublished: DATE_PUBLISHED,
          dateModified: DATE_PUBLISHED,
          author: { "@type": "Organization", name: "BanglaEV" },
          publisher: {
            "@type": "Organization",
            name: "BanglaEV",
            logo: { "@type": "ImageObject", url: "https://banglaev.com/favicon.png" },
          },
          image: [ogImage(heroImg)],
          mainEntityOfPage: absUrl(PATH),
          inLanguage: "bn",
        }),
      },
      breadcrumbLd([
        { name: "হোম", path: "/" },
        { name: "গাইড", path: "/charging" },
        { name: "সেরা ইলেকট্রিক বাইক", path: PATH },
      ]),
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">BanglaEV গাইড</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">
            বাংলাদেশে সেরা ইলেকট্রিক বাইক — ক্রেতার গাইড ও শীর্ষ পিক
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            মূল্য, রেঞ্জ, ব্যাটারি, বিক্রোত্তর সেবা ও স্থানীয় রোড কন্ডিশন মিলিয়ে সঠিক ইলেকট্রিক বাইক বেছে
            নেওয়ার সম্পূর্ণ গাইড। আপডেট: {DATE_PUBLISHED}
          </p>
        </div>
      </section>

      <section className="container-page pt-10">
        <img
          src={heroImg}
          alt={HERO_ALT}
          width={1408}
          height={800}
          loading="lazy"
          decoding="async"
          className="w-full rounded-2xl object-cover shadow-md"
        />
      </section>

      <article className="container-page max-w-3xl py-16">
        <div className="prose-bn space-y-5 text-lg leading-relaxed">
          <p>
            বাংলাদেশে সঠিক ইলেকট্রিক বাইক বেছে নেওয়া মানে হচ্ছে মূল্য, রেঞ্জ, ব্যাটারি ধরনের সাথে বিক্রোত্তর
            সেবা ও স্থানীয় রোড কন্ডিশন মিলিয়ে সিদ্ধান্ত নেওয়া। এই গাইডটি শহরের যাত্রী, দৈনন্দিন কমিউটার
            এবং বাজেট সচেতন ক্রেতাদের সাহায্যের জন্য—মডেলগুলোর তুলনা, বাস্তব খরচ, রক্ষণাবেক্ষণ ও চার্জিং
            পরামর্শসহ। নিচে আপনার চাহিদা অনুযায়ী শীর্ষ ক্যাটাগরি (বাজেট, লং-রেঞ্জ, ভ্যালু), ক্রয়
            চেকলিস্ট, রক্ষণাবেক্ষণ টিপস এবং সংক্ষিপ্ত FAQ দেয়া আছে। কেনার আগে সম্পূর্ণ তালিকা দেখুন:{" "}
            <Link to="/models" className="text-primary font-semibold underline">সকল মডেল</Link>।
          </p>

          <h2 className="mt-10 text-2xl font-bold">কেন বাংলাদেশে ইলেকট্রিক বাইক বেছে নেবেন?</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>পেট্রোলের চেয়ে কম চলার খরচ (প্রতি কিমি বিদ্যুৎ সস্তা)।</li>
            <li>শব্দ কম, সার্ভিস কম, তেল পরিবর্তন নেই।</li>
            <li>শহরভিত্তিক যাত্রার জন্য উপযুক্ত—ঢাকা, চট্টগ্রাম, সিলেট ইত্যাদি।</li>
            <li>সরকারি প্রণোদনা ও চার্জিং অবকাঠামো ধীরে ধীরে বাড়ছে (বিস্তারিত: <Link to="/charging" className="text-primary underline">চার্জিং গাইড</Link>)।</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">আমরা মডেলগুলো কিভাবে সাজাই</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>বাস্তব রেঞ্জ — উৎপাদকের দাবির চাইতে বাস্তবে ৬০–৮০% রেঞ্জ ধরা ভালো।</li>
            <li>ব্যাটারি ধরন ও ক্ষমতা — Li-ion পছন্দনীয় (ওজন, আয়ু, চার্জিং)।</li>
            <li>মোটর পাওয়ার ও টর্ক — ঢালু অংশে উঠা ও স্টার্ট-আপে গুরুত্বপূর্ণ।</li>
            <li>বিল্ড কোয়ালিটি ও স্থানীয় সেবা — শোরুম ও সার্ভিস থাকা জরুরি।</li>
            <li>ওয়ারেন্টি ও ব্যাটারি রিপ্লেসমেন্ট শর্ত।</li>
            <li>মূল্য বনাম সুবিধা — ফ্রি সার্ভিস, অ্যাকসেসরি, চার্জার টাইপ ইত্যাদি বিবেচনা করুন।</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">শীর্ষ ক্যাটাগরি ও প্রস্তাবনাসমূহ</h2>
          <p className="text-muted-foreground">
            মডেল নাম নির্দিষ্ট না রেখে কী খুঁজবেন তা উল্লেখ করা হচ্ছে — বর্তমান তালিকা ও দামের জন্য{" "}
            <Link to="/models" className="text-primary underline">সকল মডেল</Link> দেখুন।
          </p>

          <h3 className="mt-6 text-xl font-bold">১) বাজেট ইলেকট্রিক বাইক</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>কি পাবেন: ৩০–৬০ কিমি রেঞ্জ, ছোট Li-ion বা পুরানো লিড-অ্যাসিড ব্যাটারি, ধীর গতি।</li>
            <li>উপযোগী: ছোট দূরত্ব, ছাত্রছাত্রী, প্রথমবার ইভি ব্যবহারকারী।</li>
            <li>লক্ষণ: রিমুভেবল ব্যাটারি, স্থানীয় সেবা এবং ব্যাটারি ওয়ারেন্টি।</li>
          </ul>

          <h3 className="mt-6 text-xl font-bold">২) লং-রেঞ্জ ইলেকট্রিক বাইক</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>কি পাবেন: ৮০–১৫০+ কিমি রেঞ্জ, বড় লিথিয়াম প্যাক বা সোয়াপ-এবল ব্যাটারি অপশন।</li>
            <li>উপযোগী: দীর্ঘ দূরত্ব, শহরের বাইরের যাত্রী।</li>
            <li>লক্ষণ: উচ্চ-ক্ষমতার Li-ion, BMS, ফাস্ট-চার্জিং সাপোর্ট।</li>
          </ul>

          <h3 className="mt-6 text-xl font-bold">৩) ভ্যালু/অল-রাউন্ডার</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>সমন্বিত রেঞ্জ (৬০–১০০ কিমি), শক্তিশালী মোটর, নির্ভরযোগ্য বিল্ড ও ডিলার নেটওয়ার্ক।</li>
            <li>উপযোগী: দৈনন্দিন ব্যবহারকারীরা যারা অতিরিক্ত খরচ ছাড়াই নির্ভরযোগ্যতা চান।</li>
          </ul>

          <h3 className="mt-6 text-xl font-bold">৪) ঢাকা/শহর ব্যবহার</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>টর্ক, তাত্ক্ষণিক এক্সিলারেশন ও ভিড়ের মধ্যে সহজ চালনার সুবিধা অগ্রাধিকার দিন।</li>
            <li>আন্ডার-সিট স্টোরেজ ও দ্রুত চার্জিং সুবিধা।</li>
          </ul>

          <h3 className="mt-6 text-xl font-bold">৫) গ্রামীণ/অপকেন্দ্রিক রাস্তা</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>শক্তিশালী সাসপেনশন, বড় চাকা ও মজবুত ফ্রেম খুঁজবেন; বেশি টর্ক দরকার।</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">বাংলাদেশে প্রাপ্ত ব্র্যান্ড</h2>
          <p>
            Walton, Runner, Akij সহ কিছু লোকাল নির্মাতা এবং আমদানি হওয়া ব্র্যান্ডগুলো—কোনো ব্র্যান্ড বাছার
            আগে শোরুম ও স্পেয়ার পার্টস সহজলভ্যতা যাচাই করুন। ব্যাটারি ধরন (কোন ব্র্যান্ডের ব্যাটারি
            ব্যবহার করা হচ্ছে) ও রিপ্লেসমেন্ট খরচ সম্পর্কে বিস্তারিত জিজ্ঞেস করুন।
          </p>

          <h2 className="mt-10 text-2xl font-bold">বাস্তব খরচ (স্টিকার দামের পরেও)</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>পূর্ণ চার্জ খরচ = ব্যাটারি কেপাসিটি (kWh) × বিদ্যুৎ হার (BDT/kWh)।</li>
            <li>ব্যাটারি পরিবর্তন: লিথিয়াম ব্যাটারি সাধারণত সবচেয়ে বড় খরচ; পূর্বেই দাম জেনে নিন।</li>
            <li>সার্ভিস ও স্পেয়ার পার্টস — নিকটবর্তী সার্ভিস সেন্টারের দূরত্ব বিবেচনায় রাখুন।</li>
            <li>বীমা ও রেজিস্ট্রেশন (BRTA) সম্পর্কিত খরচও যোগ করুন।</li>
          </ul>
          <p>
            মাসিক সাশ্রয় হিসাব করতে চাইলে{" "}
            <Link to="/calculator" className="text-primary underline">কস্ট ক্যালকুলেটর</Link>
            ব্যবহার করুন।
          </p>

          <h2 className="mt-10 text-2xl font-bold">ব্যাটারি ও চার্জিং বেসিক</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Li-ion ক্যালিফাইড; লিড-অ্যাসিডের থেকে Li-ion ভালো আয়ু ও ওজন মানে বেশি রেঞ্জ।</li>
            <li>BMS থাকা আবশ্যক—ব্যাটারি লাইফ ও নিরাপত্তার জন্য।</li>
            <li>চার্জিং টিপস: নিয়মিত সম্পূর্ণ ডেভোয়ালভ না করা, ২০–৯০% রেঞ্জ বজায় রাখলে জীবন বাড়ে।</li>
            <li>চার্জিং অপশন: হোম চার্জার, পাবলিক ফাস্ট চার্জার ও ভবিষ্যতে ব্যাটারি-স্ব্যাপ সার্ভিস।</li>
          </ul>
          <p>
            স্টেশন ম্যাপ ও চার্জিং খরচের বিস্তারিত জানতে{" "}
            <Link to="/charging" className="text-primary underline">চার্জিং গাইড</Link> দেখুন।
          </p>

          <h2 className="mt-10 text-2xl font-bold">রক্ষণাবেক্ষণ চেকলিস্ট</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>ব্যাটারি কানেক্টর ও তার রক্ষণাবেক্ষণ দেখুন।</li>
            <li>টায়ারের প্রেসার ঠিক রাখুন—কম চাপ হলে রেঞ্জ কমে।</li>
            <li>মোটর, কনট্রোলার ও ড্রাইভট্রেন সময়ে সময়ে সার্ভিস করান।</li>
            <li>ব্যাটারি ঠান্ডা, শুষ্ক স্থানে রাখুন; দীর্ঘ স্টোরেজে পূর্ণ চার্জ এড়িয়ে চলুন।</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">টেস্ট-রাইড কিভাবে করবেন</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>স্টার্ট-আপে এক্সিলারেশন চেক করুন, ঢালু অংশে উঠা পরীক্ষা করুন এবং আপনার সাধারণ লোড সহ বাস্তব রেঞ্জ টেস্ট করুন।</li>
            <li>আরাম—সিট উচ্চতা, হ্যান্ডেলবার রিচ—পরীক্ষা করুন।</li>
            <li>ডিলারকে চার্জিং প্রক্রিয়া ও চার্জার ধরন ডেমো করতে বলুন।</li>
            <li>লিখিত ওয়ারেন্টি শর্ত, নিকটতম সার্ভিস সেন্টারের ঠিকানা ও স্পেয়ার অংশের ডেলিভারি টাইম জানতে বলুন।</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">সংক্ষিপ্ত ক্রয় চেকলিস্ট</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>দৈনিক রাউন্ডট্রিপ + ২০% বাফার: বাস্তব-রেঞ্জ।</li>
            <li>ব্যাটারি ধরন = Li-ion (পছন্দনীয়); ক্ষমতা (Ah / kWh) জেনে নিন।</li>
            <li>স্থানীয় শোরুম ও সার্ভিস ৩০–৬০ কিমির মধ্যে আছে কি না।</li>
            <li>ওয়ারেন্টি: ব্যাটারি ও মোটরের শর্তপত্র লিখিতভাবে।</li>
            <li>চার্জার দেয়া আছে? স্পেয়ার ব্যাটারি/স্ব্যাপ অপশন আছে কি?</li>
            <li>মোট মালিকানার খরচ: বিদ্যুৎ + সার্ভিস + ভবিষ্যৎ ব্যাটারি পরিবর্তন।</li>
          </ul>

          <h2 className="mt-10 text-2xl font-bold">প্রায়শই জিজ্ঞাস্য (FAQ)</h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {FAQS.map((f) => (
              <details key={f.q} className="group p-6">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold">কোথায় কেনা — পরবর্তী ধাপ</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>মডেল ও মূল্য তুলনা করুন: <Link to="/models" className="text-primary underline">সকল মডেল</Link>।</li>
            <li>মাসিক সাশ্রয় হিসাব: <Link to="/calculator" className="text-primary underline">কস্ট ক্যালকুলেটর</Link>।</li>
            <li>চার্জিং ও রেজিস্ট্রেশন: <Link to="/charging" className="text-primary underline">চার্জিং গাইড</Link>।</li>
            <li>ব্র্যান্ড ও শোরুম: <Link to="/about" className="text-primary underline">সম্পর্কে</Link>।</li>
          </ul>

          <div className="mt-8 rounded-2xl border border-primary/30 bg-accent/50 p-6">
            <p className="font-semibold">তুলনা করে দেখুন এবং সেরা বিকল্প বেছে নিন</p>
            <p className="mt-2 text-muted-foreground">
              মডেল ফিল্টার করুন, মাসিক সাশ্রয় হিসাব করুন বা নিকটস্থ শোরুমে টেস্ট-রাইড বুক করুন।
            </p>
            <Link
              to="/models"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              সকল মডেল দেখুন →
            </Link>
          </div>
        </div>

        <details className="mt-12 rounded-2xl border border-border bg-card p-6">
          <summary className="cursor-pointer font-semibold">Read in English</summary>
          <div className="mt-4 space-y-4 text-foreground/90">
            <p>
              Choosing the right electric bike in Bangladesh means balancing price, range, battery
              type, after-sales support and local road conditions. This guide helps buyers—first-time
              commuters, city riders in Dhaka, and value-conscious shoppers—compare options, understand
              real-world costs, and pick the best electric bike for their needs.
            </p>
            <p>
              <strong>Why choose an electric bike?</strong> Lower running cost vs petrol, quieter with
              less maintenance, ideal for short-to-medium urban commutes, and supported by growing
              charging infrastructure (see the <Link to="/charging" className="text-primary underline">charging guide</Link>).
            </p>
            <p>
              <strong>How we recommend models:</strong> real-world range (60–80% of manufacturer
              claims), lithium battery preferred, motor torque for hills, local service availability,
              warranty terms, and value for money. Browse the full list on{" "}
              <Link to="/models" className="text-primary underline">All models</Link>.
            </p>
            <p>
              <strong>Top categories:</strong> budget (30–60 km, short city commutes), long-range
              (80–150+ km with high-capacity Li-ion and BMS), value/all-rounder (60–100 km, reliable
              dealer network), urban/Dhaka (torque and compact size), and rural/rough roads (stronger
              suspension, larger wheels).
            </p>
            <p>
              <strong>Real costs:</strong> charge cost = battery kWh × electricity rate (e.g. 1.5 kWh ×
              10 BDT = 15 BDT/full charge); factor in battery replacement, service, insurance and BRTA
              registration. Estimate monthly savings with the{" "}
              <Link to="/calculator" className="text-primary underline">cost calculator</Link>.
            </p>
            <p>
              <strong>Battery & charging:</strong> prefer Li-ion with BMS, keep charge between
              20–90%, avoid full depletion. <strong>Maintenance:</strong> check connectors and wiring,
              maintain tyre pressure, service the motor/drivetrain, store the battery cool and dry.
            </p>
            <p>
              <strong>Buying checklist:</strong> real-world range ≥ daily roundtrip + 20% buffer; Li-ion
              battery with confirmed capacity; local showroom within 30–60 km; written warranty; charger
              and spare/swap options; total cost of ownership estimate.
            </p>
            <p>
              <strong>Next steps:</strong> compare models on{" "}
              <Link to="/models" className="text-primary underline">All models</Link>, estimate savings
              with the <Link to="/calculator" className="text-primary underline">calculator</Link>, and
              read the <Link to="/charging" className="text-primary underline">charging guide</Link> for
              station locations and costs.
            </p>
          </div>
        </details>

        <Link to="/charging" className="mt-12 inline-block text-primary font-semibold">
          ← চার্জিং গাইডে ফিরুন
        </Link>
      </article>
    </>
  );
}

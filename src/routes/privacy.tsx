import { createFileRoute, Link } from "@tanstack/react-router";
import { localeLinks, ogMeta } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => {
    const t = "Privacy Policy — BanglaEV";
    const d = "BanglaEV কীভাবে আপনার তথ্য সংগ্রহ ও ব্যবহার করে — লিড ফর্ম, কুকি ও তৃতীয় পক্ষের সেবা সম্পর্কে বিস্তারিত।";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        ...ogMeta({ title: t, description: d, path: "/privacy" }),
      ],
      links: localeLinks("/privacy"),
    };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="container-page max-w-3xl py-16 prose-bn">
      <h1 className="text-4xl font-extrabold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">সর্বশেষ আপডেট: জুলাই ২০২৬</p>

      <h2 className="mt-8 text-2xl font-bold">তথ্য সংগ্রহ</h2>
      <p className="mt-3">
        BanglaEV একটি তথ্যভিত্তিক ওয়েবসাইট। আপনি যখন যোগাযোগ ফর্ম বা টেস্ট-ড্রাইভ রিকোয়েস্ট
        জমা দেন, তখন আমরা শুধু নাম, ইমেইল, ঐচ্ছিক ফোন নম্বর এবং আপনার বার্তা সংরক্ষণ করি।
        এই তথ্য শুধুমাত্র আপনার অনুরোধের জবাব দেওয়ার জন্য ব্যবহৃত হয়।
      </p>

      <h2 className="mt-8 text-2xl font-bold">তৃতীয় পক্ষের সেবা</h2>
      <p className="mt-3">
        সাইট ট্রাফিক বিশ্লেষণের জন্য আমরা মানসম্মত অ্যানালিটিক্স ব্যবহার করি (যেমন Google Analytics)।
        হোস্টিং সরবরাহ করে Lovable। কোনো তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করা হয় না।
      </p>

      <h2 className="mt-8 text-2xl font-bold">কুকি</h2>
      <p className="mt-3">
        ব্রাউজিং অভিজ্ঞতা উন্নত করার জন্য অপরিহার্য কুকি ব্যবহৃত হয়। ব্রাউজার সেটিংস থেকে আপনি
        কুকি নিষ্ক্রিয় করতে পারেন।
      </p>

      <h2 className="mt-8 text-2xl font-bold">যোগাযোগ</h2>
      <p className="mt-3">
        তথ্য মুছে ফেলার অনুরোধ বা প্রশ্নের জন্য{" "}
        <Link to="/about" className="text-primary font-semibold">যোগাযোগ ফর্ম</Link> ব্যবহার করুন।
      </p>
    </article>
  );
}

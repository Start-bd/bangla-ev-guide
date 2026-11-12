import { CircleAlert } from "lucide-react";

type DataSourceNoticeProps = {
  kind: "models" | "news";
};

const COPY = {
  models: "সার্ভার থেকে সর্বশেষ মডেল তথ্য পাওয়া যাচ্ছে না। প্রদর্শিত দাম পুরোনো হতে পারে—কেনার আগে শোরুমে যাচাই করুন।",
  news: "সার্ভার থেকে সর্বশেষ খবর পাওয়া যাচ্ছে না। এখানে সংরক্ষিত পুরোনো খবর দেখানো হচ্ছে।",
};

export function DataSourceNotice({ kind }: DataSourceNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground"
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <p>{COPY[kind]}</p>
    </div>
  );
}
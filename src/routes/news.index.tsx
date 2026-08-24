import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { getPosts } from "@/lib/posts.functions";
import { localeLinks, ogMeta, breadcrumbLd } from "@/lib/seo";
import newsHero from "@/assets/pages/news-hero.jpg";

const postsQO = queryOptions({ queryKey: ["posts", 50], queryFn: () => getPosts({ data: { limit: 50 } }) });

const NEWS_TITLE = "EV ও অটো খবর — বাংলাদেশ | BanglaEV";
const NEWS_DESC = "ইলেকট্রিক গাড়ি, BYD, চার্জিং, EV পলিসি — বাংলাদেশের সর্বশেষ অটো খবর ও রিভিউ।";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: NEWS_TITLE },
      { name: "description", content: NEWS_DESC },
      ...ogMeta({ title: NEWS_TITLE, description: NEWS_DESC, path: "/news" }),
    ],
    links: localeLinks("/news"),
    scripts: [
      breadcrumbLd([
        { name: "হোম", path: "/" },
        { name: "খবর", path: "/news" },
      ]),
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQO),
  component: NewsPage,
});

function NewsPage() {
  const { data: posts } = useSuspenseQuery(postsQO);
  return (
    <>
      <section className="hero-gradient text-white">
        <div className="container-page py-16">
          <h1 className="text-4xl font-extrabold md:text-5xl">EV ও অটো খবর</h1>
          <p className="mt-3 max-w-2xl text-white/80">বাংলাদেশের EV ইকোসিস্টেম, রিভিউ ও পলিসি আপডেট।</p>
        </div>
      </section>

      <section className="container-page pt-10">
        <img
          src={newsHero}
          alt="EV ও অটো খবর"
          width={1600}
          height={700}
          loading="lazy"
          decoding="async"
          className="w-full rounded-2xl object-cover shadow-md"
        />
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} to="/news/$slug" params={{ slug: p.slug }} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg">
              <div className="aspect-[16/10] bg-gradient-to-br from-[var(--color-navy)] to-primary/50">
                <div className="grid h-full place-items-center">
                  <Zap className="h-12 w-12 text-white/30" />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-semibold uppercase text-primary">{p.category}</span>
                <h2 className="mt-2 line-clamp-3 font-display text-lg font-bold leading-snug group-hover:text-primary">{p.title_bn}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt_bn}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {p.author} · {p.published_at ? new Date(p.published_at).toLocaleDateString("bn-BD") : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

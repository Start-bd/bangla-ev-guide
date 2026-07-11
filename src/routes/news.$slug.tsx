import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getPostBySlug } from "@/lib/posts.functions";
import { localeLinks, ogMeta, breadcrumbLd, absUrl } from "@/lib/seo";

const postQO = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: async () => {
      const p = await getPostBySlug({ data: { slug } });
      if (!p) throw notFound();
      return p;
    },
  });

export const Route = createFileRoute("/news/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(postQO(params.slug)),
  head: ({ params, loaderData }) => {
    const title = loaderData?.title_bn ?? loaderData?.meta_title ?? params.slug;
    const desc =
      loaderData?.meta_description ??
      loaderData?.excerpt_bn ??
      "BanglaEV — বাংলাদেশের EV খবর ও রিভিউ।";
    const fullTitle = `${title} | BanglaEV`;
    return {
      meta: [
        { title: fullTitle },
        { name: "description", content: desc },
        ...ogMeta({
          title: fullTitle,
          description: desc,
          path: `/news/${params.slug}`,
          type: "article",
          image: loaderData?.cover_url ?? null,
          imageAlt: title,
        }),
      ],
      links: localeLinks(`/news/${params.slug}`),
      scripts: [
        breadcrumbLd([
          { name: "হোম", path: "/" },
          { name: "খবর", path: "/news" },
          { name: title, path: `/news/${params.slug}` },
        ]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">পোস্ট পাওয়া যায়নি</h1>
      <Link to="/news" className="mt-4 inline-block text-primary underline">খবরের তালিকায় ফিরুন</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-page py-24 text-center">
      <p>লোড করতে সমস্যা।</p>
      <button onClick={reset} className="mt-3 rounded-full bg-primary px-4 py-2 text-primary-foreground">আবার চেষ্টা</button>
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(postQO(slug));
  const date = p.published_at ? new Date(p.published_at).toLocaleDateString("bn-BD") : "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.title_bn,
            datePublished: p.published_at,
            author: { "@type": "Organization", name: p.author ?? "BanglaEV" },
            inLanguage: "bn",
          }),
        }}
      />

      <article className="container-page max-w-3xl py-16">
        <p className="text-sm font-semibold uppercase text-primary">{p.category}</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-5xl">{p.title_bn}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{p.author} · {date}</p>

        {p.excerpt_bn && (
          <p className="mt-6 border-l-4 border-primary bg-accent/50 p-4 text-lg italic">{p.excerpt_bn}</p>
        )}

        <div className="prose-bn mt-8 space-y-5 text-lg leading-relaxed">
          {(p.content_bn ?? "").split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {p.content_en && (
          <details className="mt-12 rounded-2xl border border-border bg-card p-6">
            <summary className="cursor-pointer font-semibold">Read in English</summary>
            <div className="mt-4 space-y-4 text-foreground/90">
              {p.content_en.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </details>
        )}

        <Link to="/news" className="mt-12 inline-block text-primary font-semibold">← সব খবর</Link>
      </article>
    </>
  );
}

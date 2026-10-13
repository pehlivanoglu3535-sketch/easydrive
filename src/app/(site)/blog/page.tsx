import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "İş dünyası, vergi, göçmenlik ve teknoloji üzerine uzman içgörüler ve rehberler.",
};

export default async function BlogPage() {
  const posts = await getDb().query.post.findMany({
    where: (p, { eq }) => eq(p.published, true),
    orderBy: (p, { desc }) => desc(p.publishedAt),
  });

  const [featured, ...rest] = posts;

  return (
    <>
      <section className="border-b bg-brand-50/60">
        <div className="container-site py-16 md:py-20">
          <span className="eyebrow">Blog</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">İçgörüler & Rehberler</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            İş dünyası, finans, mevzuat ve teknolojiye dair güncel yazılar.
          </p>
        </div>
      </section>

      <section className="container-site py-16 md:py-20">
        {posts.length === 0 ? (
          <p className="text-slate-500">Henüz yazı yayımlanmadı.</p>
        ) : (
          <>
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="card card-hover group grid overflow-hidden md:grid-cols-2">
                <div className="flex min-h-56 items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 p-8">
                  <span className="text-center text-2xl font-bold text-white/90">{featured.title}</span>
                </div>
                <div className="flex flex-col justify-center p-8">
                  <div className="flex items-center gap-3 text-xs">
                    {featured.category && <span className="font-semibold uppercase tracking-wide text-accent-600">{featured.category}</span>}
                    <span className="text-slate-400">{formatDate(featured.publishedAt)}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-bold leading-tight group-hover:text-brand-700">{featured.title}</h2>
                  <p className="mt-3 text-slate-600">{featured.excerpt}</p>
                  <span className="mt-5 text-sm font-semibold text-brand-700">Yazıyı oku →</span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="card card-hover group flex flex-col overflow-hidden">
                    <div className="flex h-44 items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 p-6">
                      <span className="text-center text-lg font-semibold text-white/90">{p.title}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2 text-xs">
                        {p.category && <span className="font-semibold uppercase tracking-wide text-accent-600">{p.category}</span>}
                        <span className="text-slate-400">{formatDate(p.publishedAt)}</span>
                      </div>
                      <h3 className="mt-1.5 font-semibold leading-snug group-hover:text-brand-700">{p.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{p.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { RichText } from "@/components/RichText";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Yazı bulunamadı" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({ where: { slug, published: true } });
  if (!post) notFound();

  const more = await prisma.post.findMany({
    where: { published: true, NOT: { id: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 2,
  });

  return (
    <>
      <article>
        <header className="border-b bg-brand-50/60">
          <div className="container-site max-w-3xl py-14 md:py-16">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700">
              <ArrowLeft size={15} /> Tüm yazılar
            </Link>
            {post.category && (
              <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-wide text-accent-600">{post.category}</span>
            )}
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><User size={15} /> {post.author}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar size={15} /> {formatDate(post.publishedAt)}</span>
            </div>
          </div>
        </header>

        <div className="container-site max-w-3xl py-12 md:py-16">
          <p className="mb-8 border-l-4 border-accent pl-5 text-lg font-medium text-slate-700">{post.excerpt}</p>
          <RichText text={post.content} />
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t bg-slate-50">
          <div className="container-site py-14">
            <h2 className="text-2xl font-bold tracking-tight">Devamını okuyun</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {more.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="card card-hover group flex flex-col p-6">
                  {p.category && <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">{p.category}</span>}
                  <h3 className="mt-1 text-lg font-semibold group-hover:text-brand-700">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-500">{p.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                    Oku <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

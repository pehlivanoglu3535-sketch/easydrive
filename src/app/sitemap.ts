import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { site } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/hizmetler`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/wolt-kurye`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/hakkimizda`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/iletisim`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/randevu`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  try {
    const db = getDb();
    const [services, posts] = await Promise.all([
      db.query.service.findMany({ where: (s, { eq }) => eq(s.published, true), columns: { slug: true, updatedAt: true } }),
      db.query.post.findMany({ where: (p, { eq }) => eq(p.published, true), columns: { slug: true, updatedAt: true } }),
    ]);
    const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
      url: `${base}/hizmetler/${s.slug}`,
      lastModified: s.updatedAt ?? now,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
    const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
    return [...staticRoutes, ...serviceRoutes, ...postRoutes];
  } catch {
    // D1'e ulaşılamazsa en azından statik sayfaları döndür
    return staticRoutes;
  }
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EasyDrive — Araç Kiralama Yönetimi",
    short_name: "EasyDrive",
    description: "Kosova için bulut tabanlı araç kiralama yönetim platformu",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#1e3a8a",
    lang: "tr",
    icons: [
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
    ],
  };
}

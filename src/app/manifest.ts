import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RentFlow — Araç Kiralama Yönetimi",
    short_name: "RentFlow",
    description: "Kosova için bulut tabanlı araç kiralama yönetim platformu",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#4f46e5",
    lang: "tr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}

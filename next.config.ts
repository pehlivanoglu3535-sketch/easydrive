import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker/VPS: `next start`. Cloudflare: @opennextjs/cloudflare adaptörü ile build edilir.
};

export default nextConfig;

// Yerel `next dev` sırasında getCloudflareContext() (D1 binding) erişimi için.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

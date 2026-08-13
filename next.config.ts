import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker/production: bağımsız (standalone) çıktı — küçük imaj, node_modules kopyalanmaz.
  output: "standalone",
};

export default nextConfig;

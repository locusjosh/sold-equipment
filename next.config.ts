import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/sold-equipment",
  assetPrefix: "/sold-equipment",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

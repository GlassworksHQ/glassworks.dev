import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Hosts allowed to load dev-server resources (HMR, dev chunks) when you open
  // `pnpm dev` from another machine. Comma-separated, set in .env.local.
  allowedDevOrigins: process.env.DEV_ORIGINS?.split(",").map((h) => h.trim()).filter(Boolean),
};

export default nextConfig;

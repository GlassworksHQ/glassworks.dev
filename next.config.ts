import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The frame card ships TypeScript and CSS modules, not built JavaScript (vendor/s1-unleashed).
  transpilePackages: ["@glassworks/frame-card"],
  // The site reads only frames/*/design from the main repo; don't trace the rest into server bundles.
  outputFileTracingExcludes: {
    "*": ["vendor/s1-unleashed/{app,kiln,branding,docs,tools,LICENSES}/**", "vendor/s1-unleashed/frames/*/installer/**"],
  },
  // Hosts allowed to load dev-server resources (HMR, dev chunks) when you open
  // `pnpm dev` from another machine. Comma-separated, set in .env.local.
  allowedDevOrigins: process.env.DEV_ORIGINS?.split(",").map((h) => h.trim()).filter(Boolean),
  redirects() {
    return [
      // The S1's page was /frames/aqara-s1 before the catalog came from frame.json, whose id is aqara-s1-plus.
      { source: "/frames/aqara-s1", destination: "/frames/aqara-s1-plus", permanent: true },
    ];
  },
};

export default nextConfig;

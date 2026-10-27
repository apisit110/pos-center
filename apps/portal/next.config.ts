import type { NextConfig } from "next";

// `pnpm export` (or NEXT_OUTPUT=export) builds static files into out/ for S3 + CloudFront (serverless);
// the default standalone build is the node server of the docker image
const isExport = process.env.NEXT_OUTPUT === "export" || process.env.npm_lifecycle_event === "export";

const nextConfig: NextConfig = {
  output: isExport ? "export" : "standalone",
  // the static export calls the api on its own origin (CloudFront routes /api/* to Lambda) unless NEXT_PUBLIC_API_URL is set
  ...(isExport && { env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "" } }),
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_OUTPUT=export builds static files into out/ for S3 + CloudFront (serverless);
  // the default standalone build is the node server of the docker image
  output: process.env.NEXT_OUTPUT === "export" ? "export" : "standalone",
};

export default nextConfig;

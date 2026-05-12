import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle into .next/standalone — minimal
  // Docker image, no need to ship node_modules or .next at runtime.
  output: "standalone",
};

export default nextConfig;

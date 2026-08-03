import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function trainingApiDirectUrl(): string | null {
  const u =
    process.env.HIPAA_TRAINING_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL?.trim();
  return u || null;
}

const nextConfig: NextConfig = {
  /** Monorepo: trace deps from repo root (lockfile + hoisted node_modules). */
  outputFileTracingRoot: path.join(__dirname, "../.."),
  /**
   * Repo root eslint + @typescript-eslint versions can crash during lint (context.getScope).
   * Vercel runs `next build` with CI; failing lint must not block deploy.
   */
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const api = trainingApiDirectUrl()?.replace(/\/$/, "");
    if (!api) return [];
    return [
      {
        source: "/api/staff-auth/:path*",
        destination: `${api}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/grow", destination: "/learn", permanent: true },
      { source: "/grow/sops", destination: "/memory/knowledge/sops", permanent: true },
      { source: "/grow/sop-builder", destination: "/memory/knowledge/sop-builder", permanent: true },
      { source: "/level-up", destination: "/learn/practice", permanent: true },
      { source: "/learn/training", destination: "/training", permanent: true },
    ];
  },
};

export default nextConfig;

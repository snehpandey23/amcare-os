import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
};

export default nextConfig;

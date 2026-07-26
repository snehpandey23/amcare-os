import type { NextConfig } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(__dirname, '../..')
const hasMonorepo = fs.existsSync(path.join(monorepoRoot, 'package-lock.json'))

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(hasMonorepo ? { outputFileTracingRoot: monorepoRoot } : {}),
}

export default nextConfig

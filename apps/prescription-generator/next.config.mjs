/** @type {import('next').NextConfig} */
const api = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL?.replace(/\/$/, "");

const nextConfig = {
  async rewrites() {
    if (!api) return [];
    return [{ source: "/api/staff-auth/:path*", destination: `${api}/:path*` }];
  },
};

export default nextConfig;

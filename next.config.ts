import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Prevent react-pdf / pdfjs-dist from being bundled at compile time.
  // They are dynamically imported client-side only, so excluding them here
  // eliminates the multi-second Turbopack compile stall on first page load.
  serverExternalPackages: ["canvas"],
  transpilePackages: [],
};

export default nextConfig;

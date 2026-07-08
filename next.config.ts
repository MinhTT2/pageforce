import type { NextConfig } from "next";

// Only Supabase Storage uploads and the fixed marketing imagery go through the
// image optimizer; user-supplied external image URLs render unoptimized (see
// isSupabasePublicAssetUrl). Keeping the patterns scoped prevents /_next/image
// from acting as an open proxy.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

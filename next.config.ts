import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Anciennes URL de la première version du site : elles peuvent déjà être
  // indexées ou partagées, on ne les casse pas.
  async redirects() {
    return [
      { source: "/alimentation", destination: "/rations", permanent: true },
      { source: "/dashboard", destination: "/app", permanent: true },
      { source: "/abonnement", destination: "/tarifs", permanent: true },
    ];
  },
};

export default nextConfig;

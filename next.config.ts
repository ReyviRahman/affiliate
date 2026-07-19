import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yantotanjung.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;

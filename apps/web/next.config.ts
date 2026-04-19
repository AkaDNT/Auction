import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname:
          "auction-image-s3-393303632574-ap-southeast-1-an.s3.ap-southeast-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;

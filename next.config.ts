import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "192.168.1.4:3000", "192.168.1.4"],
  images: {
    qualities: [75, 85],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "10.197.173.197",
    "10.197.173.197:3000",
    "192.168.1.7",
    "192.168.1.7:3000",
    "192.168.201.243",
    "192.168.201.243:3000",
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
  ],
};

export default nextConfig;

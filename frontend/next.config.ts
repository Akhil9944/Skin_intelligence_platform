import type { NextConfig } from "next";
import os from "os";

// Automatically retrieve all local machine IP addresses so Wi-Fi / DHCP changes never cause cross-origin dev errors
const localIps = Object.values(os.networkInterfaces())
  .flat()
  .filter((iface) => iface && iface.family === "IPv4")
  .map((iface) => iface!.address);

const dynamicOrigins = localIps.flatMap((ip) => [ip, `${ip}:3000`]);

const nextConfig: NextConfig = {
  allowedDevOrigins: Array.from(
    new Set([
      "localhost",
      "localhost:3000",
      "127.0.0.1",
      "127.0.0.1:3000",
      "192.168.201.40",
      "192.168.201.40:3000",
      "192.168.1.7",
      "192.168.1.7:3000",
      "192.168.201.243",
      "192.168.201.243:3000",
      "10.197.173.197",
      "10.197.173.197:3000",
      ...dynamicOrigins,
    ])
  ),
};

export default nextConfig;

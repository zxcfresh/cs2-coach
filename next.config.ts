import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Большие демки
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
  // cs2parser использует WASM / native-ish код
  serverExternalPackages: ["cs2parser"],
};

export default nextConfig;

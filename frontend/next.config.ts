import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autonome pour le déploiement CI/CD vers l'hébergement mutualisé
  // (cPanel Setup Node.js App / Passenger) — voir xsel-deploy-mutualise ADR-0003.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8091" },
      { protocol: "http", hostname: "127.0.0.1", port: "8091" },
    ],
    // Le backend tourne en local (localhost) en développement — sans danger ici.
    // En production, NEXT_PUBLIC_API_URL pointera vers un domaine public réel.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;

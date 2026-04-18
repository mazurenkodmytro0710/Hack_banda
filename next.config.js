const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    // Keep dev artifacts separate from production builds to avoid corrupting
    // the running `next dev` cache after local rebuilds during the hackathon.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    // Leaflet ships CSS that must not be tree-shaken; transpile for SSR safety
    transpilePackages: ["leaflet", "react-leaflet"],
    webpack: (config, { dev }) => {
      if (dev) {
        config.cache = false;
      }

      return config;
    },
  };

  return nextConfig;
};

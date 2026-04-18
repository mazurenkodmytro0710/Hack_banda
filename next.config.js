/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Leaflet ships CSS that must not be tree-shaken; transpile for SSR safety
  transpilePackages: ["leaflet", "react-leaflet"],
};

module.exports = nextConfig;

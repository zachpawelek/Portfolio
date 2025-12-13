/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config: { module: { rules: { test: RegExp; issuer: RegExp; use: string[]; }[]; }; }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

module.exports = nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turns off typechecking
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    reactCompiler: true,
  },

  // This is needed for the build to be static
  output: "export",

  // Add basePath for GitHub Pages
  basePath: process.env.NODE_ENV === "production" ? "/labyrinth-solver" : "",

  images: {
    unoptimized: true,
  },
};

export default nextConfig;

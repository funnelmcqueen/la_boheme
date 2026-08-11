import type { NextConfig } from "next";

const config: NextConfig = {
  // Downloads/ has its own lockfile, so Next infers the wrong workspace root and
  // traces half the filesystem. Pin it to this project.
  outputFileTracingRoot: import.meta.dirname,


  // "/" is a temporary redirect, never permanent: it becomes the La Bohème group
  // page as soon as a second venue exists, and a cached 308 would be very hard to
  // walk back. See BUILD-BRIEF §3.
  async redirects() {
    return [
      { source: "/", destination: "/vajana", permanent: false },
      { source: "/en", destination: "/en/vajana", permanent: false },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default config;

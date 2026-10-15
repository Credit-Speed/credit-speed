/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // The Image Optimization API carries two unauthenticated-RCE advisories
    // that are only fixed in Next 15.5.24+, and this site is still on 14.x,
    // which no longer receives those fixes. Nothing here uses next/image —
    // Logo.tsx deliberately renders a plain <img> — so the optimizer is
    // attack surface we get nothing in return for. Turning it off costs us
    // no functionality and is not a substitute for the Next 15 upgrade;
    // it is what buys the time to do that upgrade properly.
    unoptimized: true,
    remotePatterns: [],
  },
};
module.exports = nextConfig;

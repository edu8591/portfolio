import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // End-to-end runs boot a second dev server (the one whose transport is
  // configured to fail), and Next refuses to run two dev servers out of the
  // same build directory. The variable is set only by that second server.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

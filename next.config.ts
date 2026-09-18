import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * The dev-tools badge floats over the bottom-left of every screen in `next dev` —
   * a gradient-filled SVG that is not in the Phase-4 handoff set and looked like a
   * stray graphic on the splash. Compile and runtime errors are still surfaced.
   * See node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/devIndicators.md
   */
  devIndicators: false,
};

export default nextConfig;

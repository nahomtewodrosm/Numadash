import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NUMA RUN — 3D endless runner",
    short_name: "NUMA RUN",
    description:
      "A browser-native 3D endless runner with a global score leaderboard.",
    start_url: "/",
    display: "standalone",
    background_color: "#080807",
    theme_color: "#ef6b1b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

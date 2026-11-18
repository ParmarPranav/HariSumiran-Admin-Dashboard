import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HariSumiran — Mandir Operations & Push Studio",
    short_name: "HariSumiran",
    description:
      "Authenticated temple operations, seva scheduling, devotee directory & push notifications for HariPrabodham, Nadiad.",
    start_url: "/super-admin",
    id: "/super-admin",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "window-controls-overlay"],
    background_color: "#FAF8F5",
    theme_color: "#D97706",
    orientation: "portrait",
    categories: ["productivity", "lifestyle", "utilities"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Super Admin Studio",
        short_name: "Super Admin",
        description: "Root governance, roles & notification broadcast hub",
        url: "/super-admin",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Push Notification Studio",
        short_name: "Push Studio",
        description: "Broadcast instant FCM alerts to registered devices",
        url: "/super-admin?tab=notifications",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Sabha Schedule & Pass",
        short_name: "Sabha",
        description: "View upcoming sabha timing and QR pass",
        url: "/sabha",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Devotee Thal Rotation",
        short_name: "Thal",
        description: "Devotee thal seva calendar and captain duties",
        url: "/thal",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}

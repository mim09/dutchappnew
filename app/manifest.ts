import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nederlands B1 naar C1",
    short_name: "Nederlands",
    description: "Leer Nederlands van B1 naar C1 met lessen, luisteren, spreken, lezen en schrijven.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "nl",
    categories: ["education"],
    prefer_related_applications: false,
    background_color: "#4f46e5",
    theme_color: "#4f46e5",
    screenshots: [
      { src: "/screenshots/dashboard-wide.png", sizes: "1642x871", type: "image/png", form_factor: "wide", label: "Dashboard met dagplan" },
      { src: "/screenshots/today-narrow.png", sizes: "505x732", type: "image/png", form_factor: "narrow", label: "De les van vandaag" },
    ],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

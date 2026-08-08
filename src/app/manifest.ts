import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
    short_name: "O‘zBYE",
    description:
      "O‘zbekiston rivojiga munosib hissa qo‘shayotgan bunyodkor yoshlar ensiklopediyasi.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0043a4",
    icons: [
      {
        src: "/tilda/images/ozbye-new-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

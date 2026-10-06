import IconInstagram from "~icons/ph/instagram-logo";
import IconYoutube from "~icons/ph/youtube-logo";
import IconX from "~icons/ph/x-logo";
import IconReddit from "~icons/ph/reddit-logo";

export const BASE_TYPES = ["Guerra", "Liga", "Competitivo", "Mejora"] as const;

export type BaseType = (typeof BASE_TYPES)[number];

export const BASE_STATUSES = ["pending", "approved", "rejected"] as const;

export type BaseStatus = (typeof BASE_STATUSES)[number];

export const BASE_LEVELS = Array.from({ length: 16 }, (_, i) => i + 3);

export const CONTACT_EMAIL = "deivermph@gmail.com";

export const SOCIAL_LINKS = [
  { name: "Instagram", icon: IconInstagram, href: "https://www.instagram.com/deivermph" },
  { name: "YouTube", icon: IconYoutube, href: "https://www.youtube.com/@deivermph" },
  { name: "X", icon: IconX, href: "https://x.com/deivermph" },
  { name: "Reddit", icon: IconReddit, href: "https://www.reddit.com/user/deivermph" },
];

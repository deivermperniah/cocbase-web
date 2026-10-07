import type { Component } from "vue";
import IconHouse from "~icons/ph/house";
import IconLayers from "~icons/ph/stack";
import IconHeart from "~icons/ph/heart";
import IconUpload from "~icons/ph/upload-simple";
import IconDashboard from "~icons/ph/squares-four";
import { loginUrl } from "@/lib/auth";

export interface NavItem {
  name: string;
  icon: Component;
  path: string;
  href: string;
  badge?: number;
}

export function getNavItems(signedIn: boolean, admin: boolean, pending: number): NavItem[] {
  const privateHref = (path: string) => (signedIn ? path : loginUrl(path));
  return [
    { name: "Inicio", icon: IconHouse, path: "/", href: "/" },
    { name: "Bases", icon: IconLayers, path: "/bases", href: "/bases" },
    { name: "Favoritos", icon: IconHeart, path: "/favoritos", href: privateHref("/favoritos") },
    admin
      ? { name: "Panel", icon: IconDashboard, path: "/panel", href: "/panel", badge: pending }
      : { name: "Contribuir", icon: IconUpload, path: "/contribuir", href: privateHref("/contribuir") },
  ];
}

export function isActive(path: string, current: string) {
  return path === "/" ? current === "/" : current === path || current.startsWith(`${path}/`);
}

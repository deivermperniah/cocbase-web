import IconHouse from "~icons/ph/house";
import IconLayers from "~icons/ph/stack";
import IconHeart from "~icons/ph/heart";
import IconUpload from "~icons/ph/upload-simple";

export const NAV_ITEMS = [
  { name: "Inicio", icon: IconHouse, href: "/" },
  { name: "Bases", icon: IconLayers, href: "/bases" },
  { name: "Favoritos", icon: IconHeart, href: "/favoritos" },
  { name: "Contribuir", icon: IconUpload, href: "/contribuir" },
];

export function isActive(href: string, current: string) {
  return href === "/" ? current === "/" : current === href || current.startsWith(`${href}/`);
}

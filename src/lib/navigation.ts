import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import IconHouse from "~icons/ph/house";
import IconLayers from "~icons/ph/stack";
import IconDownload from "~icons/ph/download-simple";
import IconHeart from "~icons/ph/heart";
import IconUpload from "~icons/ph/upload-simple";
import IconDashboard from "~icons/ph/squares-four";
import IconClipboard from "~icons/ph/clipboard-text";
import IconImage from "~icons/ph/image";
import { signOut, session, isAdmin } from "@/lib/auth";

export interface NavItem {
  name: string;
  icon: any;
  path: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

const publicItems: NavItem[] = [
  { name: "Inicio", icon: IconHouse, path: "/" },
  { name: "Bases", icon: IconLayers, path: "/bases" },
  { name: "Descargar app", icon: IconDownload, path: "/descargar" },
];

const userItems: NavItem[] = [
  { name: "Favoritos", icon: IconHeart, path: "/favoritos", requiresAuth: true },
  { name: "Contribuir", icon: IconUpload, path: "/contribuir", requiresAuth: true },
];

const adminItems: NavItem[] = [
  { name: "Dashboard", icon: IconDashboard, path: "/dashboard", adminOnly: true },
  { name: "Revisión", icon: IconClipboard, path: "/revision", adminOnly: true },
  { name: "Imágenes", icon: IconImage, path: "/imagenes", adminOnly: true },
];

export function useNavigation() {
  const router = useRouter();
  const isSigningOut = ref(false);

  const navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [...publicItems];
    if (isAdmin.value) {
      items.push(...adminItems);
    } else {
      items.push(...userItems);
    }
    return items;
  });

  function isLocked(item: NavItem) {
    return Boolean(item.requiresAuth) && !session.value;
  }

  function handleNavClick(e: MouseEvent, item: NavItem, navigate?: () => void) {
    e.preventDefault();
    if (isLocked(item)) {
      router.push({ name: "login", query: { redirect: item.path } });
      return;
    }
    navigate?.();
  }

  async function handleSignOut() {
    if (isSigningOut.value) return;
    isSigningOut.value = true;

    try {
      await signOut();
      await router.replace({ name: "home" });
    } finally {
      isSigningOut.value = false;
    }
  }

  return { navItems, isLocked, handleNavClick, handleSignOut, isSigningOut };
}

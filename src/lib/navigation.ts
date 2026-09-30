import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import IconHouse from "~icons/ph/house";
import IconLayers from "~icons/ph/stack";
import IconDownload from "~icons/ph/download-simple";
import IconHeart from "~icons/ph/heart";
import IconUpload from "~icons/ph/upload-simple";
import IconDashboard from "~icons/ph/squares-four";
import { signOut, session, isAdmin } from "@/lib/auth";
import { pendingCount, refreshPendingCount } from "@/lib/admin";

export interface NavItem {
  name: string;
  icon: any;
  path: string;
  requiresAuth?: boolean;
  badge?: number;
}

const publicItems: NavItem[] = [
  { name: "Inicio", icon: IconHouse, path: "/" },
  { name: "Bases", icon: IconLayers, path: "/bases" },
  { name: "Descargar app", icon: IconDownload, path: "/descargar" },
];

const favoritesItem: NavItem = {
  name: "Favoritos",
  icon: IconHeart,
  path: "/favoritos",
  requiresAuth: true,
};

const userItems: NavItem[] = [
  { name: "Contribuir", icon: IconUpload, path: "/contribuir", requiresAuth: true },
];

const adminItems: NavItem[] = [
  { name: "Panel", icon: IconDashboard, path: "/panel" },
];

watch(
  isAdmin,
  (admin) => {
    if (!admin) {
      pendingCount.value = 0;
      return;
    }
    refreshPendingCount().catch((error) => console.error("Error fetching pending count:", error));
  },
  { immediate: true }
);

export function useNavigation() {
  const router = useRouter();
  const isSigningOut = ref(false);

  const navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [...publicItems, favoritesItem];
    items.push(
      ...(isAdmin.value
        ? adminItems.map((item) => ({ ...item, badge: pendingCount.value }))
        : userItems)
    );
    return items;
  });

  function prefetchRoute(path: string) {
    for (const record of router.resolve(path).matched) {
      const component = record.components?.default;
      if (typeof component === "function") {
        (component as () => Promise<unknown>)().catch(() => {});
      }
    }
  }

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

  return { navItems, handleNavClick, handleSignOut, isSigningOut, prefetchRoute };
}

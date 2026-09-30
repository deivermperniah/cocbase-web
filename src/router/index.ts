import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import { initializeAuth, session, isAdmin, hasStoredSession } from "@/lib/auth";
import { BASE_LEVELS } from "@/lib/constants";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "Bases de Clash of Clans por ayuntamiento",
        description:
          "Encuentra, guarda y comparte bases de Clash of Clans organizadas por nivel de ayuntamiento (TH3 a TH18): guerra, liga, mejora y recursos. Revisadas por la comunidad.",
      },
    },
    {
      path: "/bases/:level(th-\\d+)?",
      name: "bases",
      component: () => import("@/views/BasesView.vue"),
      meta: {
        title: "Bases de Clash of Clans",
        description:
          "Todas las bases de Clash of Clans para guerra, liga, mejora y recursos. Filtra por nivel de ayuntamiento y copia el enlace directo al juego.",
      },
      beforeEnter: (to) => {
        const queryLevel = to.query.level;
        if (typeof queryLevel === "string" && /^\d+$/.test(queryLevel)) {
          return {
            path: BASE_LEVELS.includes(Number(queryLevel)) ? `/bases/th-${queryLevel}` : "/bases",
            replace: true,
          };
        }
        const level = typeof to.params.level === "string" && to.params.level ? Number(to.params.level.slice(3)) : null;
        if (level !== null && !BASE_LEVELS.includes(level)) {
          return { name: "not-found", params: { pathMatch: to.path.slice(1).split("/") }, replace: true };
        }
      },
    },
    {
      path: "/descargar",
      name: "descargar",
      component: () => import("@/views/DescargarAppView.vue"),
      meta: {
        title: "Descargar app",
        description: "Descarga la app de cocbase para Android y ten a mano las mejores bases de Clash of Clans.",
      },
    },
    {
      path: "/favoritos",
      name: "favoritos",
      component: () => import("@/views/FavoritosView.vue"),
      meta: { title: "Favoritos", requiresAuth: true },
    },
    {
      path: "/contribuir",
      name: "contribuir",
      component: () => import("@/views/ContribuirView.vue"),
      meta: { title: "Contribuir", requiresAuth: true, userOnly: true },
    },
    {
      path: "/panel",
      name: "panel",
      component: () => import("@/views/Dashboard.vue"),
      meta: { title: "Panel", requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/comunidad",
      name: "comunidad",
      component: () => import("@/views/RevisionView.vue"),
      meta: { title: "Comunidad", requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/dashboard",
      redirect: "/panel",
    },
    {
      path: "/revision",
      redirect: "/comunidad",
    },
    {
      path: "/imagenes",
      name: "imagenes",
      component: () => import("@/views/ImagesView.vue"),
      meta: { title: "Imágenes", requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
      meta: { title: "Iniciar sesión", noindex: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/RegisterView.vue"),
      meta: { title: "Crear cuenta", noindex: true },
    },
    {
      path: "/aviso-legal",
      name: "aviso-legal",
      component: () => import("@/views/LegalView.vue"),
      meta: {
        title: "Aviso legal",
        description: "Aviso legal de cocbase, sitio de fans no oficial de Clash of Clans.",
      },
    },
    {
      path: "/privacidad",
      name: "privacidad",
      component: () => import("@/views/PrivacidadView.vue"),
      meta: {
        title: "Privacidad",
        description: "Política de privacidad de cocbase: qué datos recogemos y cómo los usamos.",
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
      meta: { title: "Página no encontrada", noindex: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const needsAuthState = to.meta.requiresAuth || to.meta.userOnly || to.name === "login" || to.name === "register";
  if (!needsAuthState && !hasStoredSession()) {
    initializeAuth().catch(() => {});
    return;
  }
  await initializeAuth().catch(() => {});

  if (to.meta.requiresAuth && !session.value) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresAdmin && !isAdmin.value) {
    return { name: "home" };
  }

  if (to.meta.userOnly && isAdmin.value) {
    return { name: "panel" };
  }

  if ((to.name === "login" || to.name === "register") && session.value) {
    return { name: "home" };
  }
});

const SITE_URL = "https://cocbase.vercel.app";
const DEFAULT_DESCRIPTION =
  "Encuentra, guarda y comparte bases de Clash of Clans organizadas por nivel de ayuntamiento (TH3 a TH18): guerra, liga, mejora y recursos. Revisadas por la comunidad.";

function setMeta(selector: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(selector.startsWith("link") ? "href" : "content", value);
}

function setBreadcrumb(items: [name: string, path: string][] | null) {
  let script = document.getElementById("ld-breadcrumb");
  if (!items) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.id = "ld-breadcrumb";
    script.setAttribute("type", "application/ld+json");
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: SITE_URL + path,
    })),
  });
}

router.afterEach((to) => {
  let title = to.meta.title as string | undefined;
  let description = (to.meta.description as string | undefined) ?? DEFAULT_DESCRIPTION;
  const level = to.name === "bases" && typeof to.params.level === "string" ? to.params.level.slice(3) : null;
  if (level) {
    title = `Bases de Clash of Clans para Ayuntamiento ${level} (TH${level})`;
    description = `Las mejores bases para Ayuntamiento ${level} (TH${level}) de Clash of Clans: guerra, liga, mejora y recursos, con enlace directo para copiarlas en el juego.`;
  }
  const fullTitle = title ? `${title} · cocbase` : "cocbase";
  const url = SITE_URL + (to.path === "/" ? "/" : to.path.replace(/\/$/, ""));
  const indexable = !to.meta.noindex && !to.meta.requiresAuth;

  document.title = fullTitle;
  setMeta('meta[name="description"]', description);
  setMeta('meta[name="robots"]', indexable ? "index, follow" : "noindex, nofollow");
  setMeta('link[rel="canonical"]', url);
  setMeta('meta[property="og:title"]', fullTitle);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', url);
  setMeta('meta[name="twitter:title"]', fullTitle);
  setMeta('meta[name="twitter:description"]', description);
  setBreadcrumb(
    to.name === "bases"
      ? [
          ["Inicio", "/"],
          ["Bases", "/bases"],
          ...(level ? [[`Ayuntamiento ${level}`, to.path] as [string, string]] : []),
        ]
      : null,
  );
});

export default router;

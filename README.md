# cocbase

Colección de bases de Clash of Clans organizadas por nivel de ayuntamiento (TH3–TH18) y categoría (guerra, liga, mejora y recursos). Los usuarios pueden guardar favoritas y enviar sus propias bases, que un administrador revisa antes de publicarlas.

Producción: https://cocbase.vercel.app

## Stack

- Vue 3 + TypeScript + Vite
- Tailwind CSS 4 y componentes shadcn-vue (reka-ui)
- Iconos Phosphor vía `unplugin-icons`
- Supabase (auth, base de datos y storage)
- PWA con `vite-plugin-pwa`
- Prerender estático con Puppeteer para SEO

## Requisitos

- Node.js 20 o superior
- Un proyecto de Supabase

## Puesta en marcha

```bash
npm install
cp .env.example .env   # rellena las variables
npm run dev
```

Variables de entorno (`.env`):

| Variable                 | Descripción                       |
| ------------------------ | --------------------------------- |
| `VITE_SUPABASE_URL`      | URL del proyecto de Supabase      |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (anon) del proyecto |

## Scripts

| Script                 | Qué hace                                              |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                                |
| `npm run build`        | Typecheck + build + prerender de las páginas públicas |
| `npm run preview`      | Sirve `dist/` en local                                |
| `npm run typecheck`    | Comprobación de tipos con `vue-tsc`                   |
| `npm run lint`         | ESLint (Vue + TypeScript)                             |
| `npm run format`       | Formatea el proyecto con Prettier                     |
| `npm run format:check` | Comprueba el formato sin modificar archivos           |
| `npm test`             | Tests unitarios con Vitest                            |

## Estructura

```
src/
├── assets/images/   # Logo, ayuntamientos, avatares e imágenes del hero
├── components/      # Componentes de la app (BaseCard, ImageViewer, BaseForm…)
│   └── ui/          # Primitivas reutilizables (shadcn-vue, ModalShell, PageHeader…)
├── layout/          # MainLayout, TopBar y Sidebar
├── lib/             # Lógica compartida: auth, Supabase, navegación, constantes, utilidades
├── router/          # Rutas, guards de autenticación y metadatos SEO por ruta
└── views/           # Una vista por página
scripts/
└── prerender.mjs    # Genera sitemap.xml, robots.txt, app.html y el HTML estático de las rutas públicas
```

## SEO y prerender

`npm run build` ejecuta `scripts/prerender.mjs` tras el build de Vite:

1. Genera `sitemap.xml` y `robots.txt` (las rutas privadas quedan en `Disallow`).
2. Crea `app.html`: el shell de la SPA con `noindex`, usado por las rutas privadas.
3. Abre cada ruta pública con Puppeteer y guarda su HTML ya renderizado (`/`, `/bases`, `/bases/th-3` … `/bases/th-18`, `/descargar`, `/aviso-legal`, `/privacidad` y `404.html`). Las páginas de bases incluyen los datos iniciales en `window.__BASES__`, para que la app no vuelva a mostrar un spinner al arrancar.

El router actualiza en cada navegación el título, la descripción, el canonical, las etiquetas Open Graph y Twitter, y el JSON-LD de migas de pan.

Si Chromium no puede arrancar, el prerender se omite con un aviso y el build sigue. En ese caso las rutas públicas se sirven desde `app.html` gracias a los rewrites de `vercel.json`. Después de cada deploy, revisa que el log del build muestre las líneas `[prerender] /…`.

## Deploy

Se despliega en Vercel como sitio estático (`dist/`). `vercel.json` define:

- `trailingSlash: false`
- Rewrites de las rutas privadas (y, como respaldo, las públicas) a `app.html`

## Calidad

Antes de hacer commit:

```bash
npm run lint && npm run typecheck && npm test && npm run format:check
```

Formato de commits: `<tipo>: <descripción en inglés, minúsculas, imperativo>` con los tipos `feat`, `fix`, `style`, `refactor`, `chore` o `docs` (ver `AGENTS.md`).

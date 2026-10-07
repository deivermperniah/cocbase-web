## Reglas de comportamiento (obligatorias)

- Haz SOLO el cambio mínimo necesario para resolver lo que se pide. Nada de "mientras estaba aquí, también...".
- No generes código, componentes, archivos ni carpetas que no se hayan pedido, salvo que sean indispensables para el cambio.
- No refactorices, reorganices ni "mejores" código que no forme parte de la tarea.
- No modifiques estilos, layout ni estructura visual si no se pidió.
- No agregues comentarios ni documentación dentro del código salvo que se pida.
- Si hay dudas sobre el alcance, pregunta antes de tocar código adicional.
- No repitas código: antes de crear algo, busca si ya existe en `src/components/ui/` o `src/lib/` y reutilízalo.
- Nada de lógica compleja: prefiere la solución más simple que funcione.

## Stack

- Astro 7 con salida estática (sin adapter ni SSR).
- Vue 3 solo para las partes interactivas (islas).
- Tailwind CSS v4 (tema en `src/styles/global.css`).
- Supabase (auth, base de datos y storage) desde el cliente.
- Iconos Phosphor con `unplugin-icons` (`~icons/ph/<nombre>`).

## Estructura

- `src/pages/`: una página `.astro` por ruta. Deben ser finas: layout + contenido estático o una isla.
- `src/layouts/`: `BaseLayout`, `MainLayout`, `AuthLayout`, `LegalLayout`.
- `src/components/ui/`: componentes reutilizables (AppButton, IconButton, Modal, ConfirmModal, FormField, FormSelect, Badge, CountBadge, PageHeader, EmptyState, CardSkeletonGrid, Icon, Logo, SocialLinks).
- `src/components/<sección>/`: componentes de cada sección (bases, favorites, contribute, admin, auth, layout, home, download).
- `src/lib/`: lógica y consultas a Supabase, agrupadas por tema (auth, bases, favorites, admin, storage, image, navigation, toast, constants).
- `src/data/`: textos estáticos (legales).

## Convenciones

- Las consultas a Supabase van solo en `src/lib/`, nunca directamente en los componentes.
- Las islas usan `client:load` (no `client:only`), para que su estado inicial (títulos, textos y skeletons) salga en el HTML. Los componentes Vue solo de presentación se usan en `.astro` sin directiva.
- Las páginas privadas usan `<AuthGate access="auth|user|admin|guest">` para redirigir y cargar datos en `@ready`. Solo envuelve contenido que depende de datos; el contenido estático va fuera y se ve siempre.
- La navegación es con `<a href>` y `window.location`; no hay router.
- Iconos en `.astro`: usar el wrapper `<Icon icon={...} />`. En Vue, el componente del icono directamente.
- Imágenes en `.astro`: `<Image>` de `astro:assets`. En Vue, `import img from "...webp"` y usar `img.src`.
- Colores con los tokens del tema (`primary`, `card`, `chrome`, `secondary`, `border`, `muted-foreground`), no con colores sueltos. Los listados en cuadrícula usan la clase `card-grid`.
- Los textos y el contenido estático siempre se ven, también mientras carga. Los skeletons (clase `skeleton` o `CardSkeletonGrid`, una sola fila) son solo para datos que vienen de Supabase. El spinner solo va en botones de acción (`AppButton` con `loading`).
- Nada debe mostrar un estado de sesión equivocado mientras carga: el header usa la sesión y el rol guardados en el navegador (`restoreStoredAuth`) hasta que Supabase confirma.
- Variables de entorno con prefijo `PUBLIC_` y declaradas en `src/env.d.ts`.
- Textos de la interfaz en español; código (nombres, variables) en inglés.

## Fuera de alcance por ahora

No agregar SEO, accesibilidad, PWA, linters ni tests salvo que se pida explícitamente.

## Verificación

- Antes de cada commit: `npm run build` sin errores.
- Si el cambio es visual o interactivo, comprobarlo en el navegador.
- No escribir datos de prueba en Supabase.

## Git y commits

- Commits pequeños, uno por cambio, solo cuando el usuario lo pida.
- Nunca hacer push, crear ramas ni reescribir el historial sin que se pida.
- Formato: `<tipo>: <descripción breve en inglés, minúsculas, imperativo>`.
- Tipos permitidos: feat, fix, style, refactor, chore, docs.
- Máximo ~60 caracteres, sin punto final.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

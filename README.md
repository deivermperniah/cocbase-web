# cocbase

Web para explorar y compartir bases de Clash of Clans: catálogo, favoritos, aportes de la comunidad y panel de administración.

## Stack

- Astro 7 con salida estática.
- Vue 3 solo para las partes interactivas (islas).
- Tailwind CSS 4.
- Supabase (auth, base de datos y storage) desde el cliente.
- Iconos Phosphor con `unplugin-icons`.

## Estructura

```text
src/
├── pages/              # Rutas (index, bases, favoritos, contribuir, panel, login…)
├── layouts/            # BaseLayout, MainLayout, AuthLayout, LegalLayout
├── components/
│   ├── ui/             # Componentes reutilizables (AppButton, Modal, Badge…)
│   └── <sección>/      # bases, favorites, contribute, admin, auth, home…
├── lib/                # Lógica y consultas a Supabase, por tema
├── data/               # Textos estáticos (legales)
└── styles/             # Tema global de Tailwind
```

## Puesta en marcha

1. Instala dependencias:

   ```sh
   npm install
   ```

2. Crea `.env` con las credenciales de tu proyecto Supabase:

   ```sh
   PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=<anon key>
   # Opcional: enlace al APK de la app
   PUBLIC_APP_APK_URL=
   ```

3. Inicia el servidor de desarrollo en `http://localhost:4321`:

   ```sh
   npm run dev
   ```

## Comandos

| Comando | Acción |
| :-- | :-- |
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Previsualiza el build localmente |

# Clash of Clans Base Manager

Una aplicación web moderna para gestionar y analizar bases de Clash of Clans, desarrollada con Vue 3, TypeScript y Supabase.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Licencia](#licencia)

## 🎯 Descripción

Clash of Clans Base Manager es una aplicación táctica diseñada para jugadores y clans que desean organizar, analizar y compartir estrategias de bases. Permite almacenar capturas de pantallas de bases, categorizarlas por tipo y nivel TH, y acceder rápidamente a enlaces de ataque.

## ✨ Características

### 🏰 Gestión de Bases
- **Registro de bases**: Guarda enlaces de bases de Clash of Clans
- **Capturas de pantalla**: Almacena imágenes de bases con validación de formato y tamaño
- **Categorización**: Clasifica bases por tipo (Guerra, Liga, Mejora, Recursos)
- **Niveles TH**: Soporte para todos los niveles Town Hall (1-18)

### 🖼️ Gestión de Imágenes
- **Upload seguro**: Validación de archivos (JPG, PNG, WebP, max 5MB)
- **Previo visual**: Preview inmediato de imágenes seleccionadas
- **Detección de duplicados**: Evita subir imágenes repetidas
- **Storage optimizado**: Integración con Supabase Storage

### 🔍 Validaciones Robustas
- **Validación de enlaces**: Verificación de URLs de Clash of Clans
- **Detección de espacios**: Previene enlaces malformados
- **Control de duplicados**: Evita registrar bases existentes
- **Validación de imágenes**: Formato y tamaño de archivo

### 📱 Interfaz de Usuario
- **Diseño táctico**: UI inspirada en temas militares
- **Responsive**: Compatible con desktop y móvil
- **Modos de visualización**: Grid y list view para bases
- **Estados vacíos**: Mensajes informativos y llamadas a la acción

### ⚡ Rendimiento
- **Lazy loading**: Carga optimizada de imágenes
- **Skeleton loaders**: Estados de carga fluidos
- **Memory management**: Limpieza de object URLs
- **Error handling**: Manejo robusto de errores

## 🛠️ Tecnologías

### Frontend
- **Vue 3** - Framework JavaScript progresivo
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Build tool rápido y moderno
- **Vue Router** - Enrutamiento de SPA
- **TailwindCSS** - Framework CSS utility-first
- **Lucide Icons** - Iconos modernos y consistentes

### UI Components
- **Reka UI** - Componentes UI accesibles
- **Headless UI** - Componentes sin estilos predefinidos

### Backend & Database
- **Supabase** - Backend as a Service
  - Database PostgreSQL
  - Authentication
  - Storage
  - Real-time subscriptions

### Development
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **TypeScript** - Tipado estático

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd cocbase-admin
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

4. **Configurar Supabase**
   - Crear proyecto en [Supabase](https://supabase.com)
   - Obtener URL y API Key
   - Configurar bucket `bases-fotos`
   - Ejecutar migraciones SQL (ver sección Base de Datos)

5. **Iniciar desarrollo**
```bash
npm run dev
```

6. **Construir para producción**
```bash
npm run build
npm run preview
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` con las siguientes variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Configuración de Supabase

1. **Crear bucket de storage**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('bases-fotos', 'bases-fotos', true);
```

2. **Políticas de acceso (RLS)**
```sql
-- Política para leer imágenes
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'bases-fotos');

-- Política para subir imágenes
CREATE POLICY "Upload Images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bases-fotos');

-- Política para eliminar imágenes
CREATE POLICY "Delete Images" ON storage.objects
FOR DELETE USING (bucket_id = 'bases-fotos');
```

## 📁 Estructura del Proyecto

```
cocbase-admin/
├── public/                 # Assets estáticos
├── src/
│   ├── components/         # Componentes Vue
│   │   ├── ui/           # Componentes UI reutilizables
│   │   └── BaseForm.vue  # Formulario de registro
│   ├── lib/              # Utilidades y configuración
│   │   └── supabase.ts   # Cliente Supabase
│   ├── layout/           # Layout components
│   │   └── MainLayout.vue
│   ├── views/            # Páginas principales
│   │   ├── Dashboard.vue
│   │   ├── BasesView.vue
│   │   └── ImagesView.vue
│   ├── router/           # Configuración de rutas
│   ├── App.vue           # Componente raíz
│   └── main.ts           # Punto de entrada
├── .env                  # Variables de entorno
├── package.json          # Dependencias y scripts
├── tailwind.config.js    # Configuración Tailwind
├── tsconfig.json         # Configuración TypeScript
└── README.md            # Documentación
```

## 🔧 Funcionalidades Detalladas

### 1. Dashboard
- **Estadísticas generales**: Resumen de bases registradas
- **Categorización**: Conteo por tipo de base
- **Quick actions**: Acceso rápido a funciones principales

### 2. Gestión de Bases (BasesView)
- **Registro**: Modal con formulario completo
- **Visualización**: Grid y list view
- **Acciones**: Ver enlace, eliminar base
- **Filtros**: Por tipo y nivel TH

### 3. Gestión de Imágenes (ImagesView)
- **Galería**: Visualización en grid
- **Información**: Tamaño de archivo, fecha
- **Acciones**: Ver imagen, eliminar
- **Estadísticas**: Total de imágenes y tamaño

### 4. Formulario de Registro (BaseForm)
- **Validación en tiempo real**
- **Preview de imágenes**
- **Detección de duplicados**
- **Feedback inmediato**

## 🗄️ Base de Datos

### Schema PostgreSQL

```sql
-- Tabla de bases
CREATE TABLE bases (
    id SERIAL PRIMARY KEY,
    link TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('Guerra', 'Liga', 'Mejora', 'Recursos')),
    level_th INTEGER NOT NULL CHECK (level_th >= 1 AND level_th <= 18),
    url_foto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_bases_type ON bases(type);
CREATE INDEX idx_bases_level_th ON bases(level_th);
CREATE INDEX idx_bases_created_at ON bases(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bases_updated_at 
    BEFORE UPDATE ON bases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Storage Configuration

- **Bucket**: `bases-fotos`
- **Formatos permitidos**: jpg, jpeg, png, webp
- **Tamaño máximo**: 5MB por archivo
- **Nomenclatura**: `{timestamp}_{random}.{ext}`

## 🌐 API Endpoints

La aplicación utiliza el cliente Supabase para interactuar con la API:

### Bases
- `GET /rest/v1/bases` - Obtener todas las bases
- `POST /rest/v1/bases` - Crear nueva base
- `DELETE /rest/v1/bases?id=eq.{id}` - Eliminar base

### Storage
- `POST /storage/v1/bases-fotos/upload` - Subir imagen
- `GET /storage/v1/bases-fotos/object/public/{path}` - Obtener imagen pública
- `DELETE /storage/v1/bases-fotos/object/{path}` - Eliminar imagen

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Netlify
```bash
# Construir
npm run build

# Desplegar carpeta dist
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contribución

### Flujo de trabajo
1. Fork del repositorio
2. Crear feature branch: `git checkout -b feature/amazing-feature`
3. Commit cambios: `git commit -m 'Add amazing feature'`
4. Push al branch: `git push origin feature/amazing-feature`
5. Crear Pull Request

### Guía de Estilo
- Usar TypeScript para todo código nuevo
- Seguir convenciones de Vue 3 Composition API
- Componentes con `<script setup>`
- Estilos con TailwindCSS
- Commits descriptivos y semánticos

### Testing
```bash
# Ejecutar tests
npm run test

# Linting
npm run lint

# Formatear código
npm run format
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión Supabase**
   - Verificar variables de entorno
   - Confirmar URL y API key correctas
   - Revisar políticas RLS

2. **Error al subir imágenes**
   - Verificar bucket existente
   - Confirmar políticas de storage
   - Revisar tamaño y formato de archivo

3. **Selects detrás de modal**
   - Verificar z-index CSS
   - Revisar estilos de Radix UI

4. **Build errors**
   - Limpiar node_modules: `rm -rf node_modules && npm install`
   - Verificar versión de Node.js
   - Revisar configuración TypeScript

## 📝 Changelog

### v1.0.0 (Latest)
- ✅ Gestión completa de bases
- ✅ Upload de imágenes con validación
- ✅ Validaciones robustas
- ✅ UI táctica responsive
- ✅ Integración Supabase

### Roadmap
- 🔄 Sincronización con API oficial de Clash of Clans
- 📊 Análisis avanzado de bases
- 👥 Gestión de equipos/clanes
- 🎯 Sistema de recomendaciones
- 📱 App móvil nativa

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **Proyecto**: Clash of Clans Base Manager
- **Autor**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]
- **Issues**: [GitHub Issues](https://github.com/user/repo/issues)

## 🙏 Agradecimientos

- **Vue.js** - Framework increíble
- **Supabase** - Backend as a Service genial
- **TailwindCSS** - Utility-first CSS framework
- **Lucide** - Iconos hermosos y consistentes
- **Clash of Clans** - Por el juego inspirador

---

**Hecho con ❤️ para la comunidad de Clash of Clans**

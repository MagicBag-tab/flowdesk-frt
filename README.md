# Flowdesk Frontend

Flowdesk es un sistema de gestión de inventario que permite administrar productos, proveedores, movimientos de inventario, empleados y roles dentro de una organización.

Este repositorio contiene el frontend de Flowdesk, construido con Vue 3 + TypeScript + Vite. Consume la API REST de [Flowdesk Backend](https://github.com/fabianpradod/flowdesk-bck).

## Stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- Vitest (testing)
- lucide-vue-next (íconos)
- Docker + Docker Compose
- Netlify (deploy)

## Requisitos

- Node.js (LTS recomendado)
- npm

## Configuración del entorno

El archivo `.env` no se sube al repo. Copiar `.env.example` a `.env` y completar los valores.

```bash
cp .env.example .env
```

Por defecto, el frontend debe apuntar a la API de producción del backend:

```
http://3.235.13.20
```

Si el equipo de backend está corriendo la API localmente, ajustar la variable correspondiente en `.env` para apuntar a `http://localhost:8000` (o el puerto que use el backend).

## Instalación y desarrollo local


**Instalar dependencias**
```bash
npm install
```

**Levantar servidor de desarrollo**
```bash
npm run dev
```

**Compilar para producción**
```bash
npm run build
```

**Previsualizar el build**
```bash
npm run preview
```

**Correr tests**
```bash
npm run test
```

> Los nombres exactos de los scripts están definidos en `package.json`; ajusta los comandos anteriores si difieren.

## Estructura del proyecto

El proyecto sigue una arquitectura organizada por features dentro de `src/`:

- **`app/`** — bootstrap de la app (layouts, router, `App.vue`)
- **`features/`** — módulos por dominio: analytics, auth, employees, inventory, inventorymovement, landingPage, products, roles, tasks
- **`services/`** — cliente HTTP y conexión con la API (`apiClient.ts`, `authStorage.ts`, `env.ts`)
- **`stores/`** — estado global de la app
- **`styles/`** — estilos globales y design tokens
- **`utils/`** — utilidades compartidas (ej. `roles.ts`)
- **`tests/`** — tests unitarios organizados por feature

## Integración con el backend

Este frontend consume la API de Flowdesk Backend. Documentación interactiva completa de los endpoints en `http://3.235.13.20/docs`.

## Manejo de roles

El manejo de roles/permisos en el frontend está centralizado en `src/utils/roles.ts`, y debe mantenerse alineado con los roles definidos por el backend (`admin+`, `manager+`, etc.) usados para condicionar el acceso a vistas y acciones en la UI.

## Deploy

### Netlify

El proyecto incluye `netlify.toml` y una carpeta `netlify/` con la configuración necesaria para el deploy automático. El build (`dist/`) se genera con `npm run build`.

### Docker

También se puede levantar con Docker:

```bash
docker compose up --build
```

Revisar `Dockerfile` y `docker-compose.yml` para el detalle de la configuración.

## Testing

Los tests están organizados por feature dentro de `src/tests/` usando Vitest.

```bash
npm run test
```
---
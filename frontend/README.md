# Payment Test Frontend

Frontend del flujo de pagos construido con Vue 3 + Vite + Vuex + Vuetify.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm 10+

## Configuracion de entorno

Este proyecto usa Vite y variables con prefijo `VITE_`.

Ejemplo (produccion):

```
VITE_API_BASE_URL=https://payment-test-system-production.up.railway.app
```

Para desarrollo local, crea un archivo `.env.local`:

```
VITE_API_BASE_URL=http://localhost:3000
```

Tambien tienes un ejemplo en `.env.example`.

## Instalacion

```
npm install
```

## Comandos utiles

```
npm run dev
npm run build
npm run preview
npm run lint
```

## Estructura rapida

- `src/api/` clientes HTTP (axios)
- `src/store/` estado global (Vuex)
- `src/views/` pantallas
- `src/components/` componentes reutilizables
- `src/utils/` utilidades

## Despliegue en Vercel

1) En Vercel, crea la variable de entorno:
   - `VITE_API_BASE_URL` = `https://payment-test-system-production.up.railway.app`
2) Ejecuta un nuevo deploy para que el build tome la variable.

## Notas

- La URL del backend se configura solo por variable de entorno.
- Si cambias rutas del backend, actualiza `VITE_API_BASE_URL`.

# payment-test-system
Sistema fullstack de procesamiento de pagos con frontend en Vue 3 y backend en NestJS. Incluye flujo de compra, manejo de productos y transacciones, e integracion con Wompi.

## Contenido
- Arquitectura general
- Requisitos
- Instalacion y ejecucion local
- Configuracion de entorno
- Pruebas y cobertura
- Endpoints principales
- Despliegue

## Arquitectura general
- Frontend: Vue 3 + Vite + Vuex + Vuetify
- Backend: NestJS + TypeORM + PostgreSQL
- Pagos: Wompi

## Requisitos
Backend:
- Node.js 18+
- PostgreSQL (local o Railway)

Frontend:
- Node.js 20.19+ o 22.12+
- npm 10+

## Instalacion y ejecucion local

1) Backend
```
cd backend
npm install
npm run start:dev
```
El backend queda en `http://localhost:3000`.

2) Frontend
```
cd frontend
npm install
npm run dev
```
El frontend queda en `http://localhost:5173`.

## Configuracion de entorno

Backend (`backend/.env` solo para desarrollo local):
```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

DATABASE_URL=

WOMPI_URL=
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_INTEGRITY_KEY=

PORT=3000
CORS_ORIGIN=http://localhost:5173
SEED_ON_START=false
```

Notas:
- En Railway, se usa `DATABASE_URL` y variables en el panel (no se lee `.env`).
- `CORS_ORIGIN` acepta varios origenes separados por coma.
- Si `SEED_ON_START=true`, se cargan productos al iniciar.

Frontend (`frontend/.env.local`):
```
VITE_API_BASE_URL=http://localhost:3000
```

Produccion (ejemplo):
```
VITE_API_BASE_URL=https://payment-test-system-production.up.railway.app
```

Tambien hay un ejemplo en `frontend/.env.example`.

## Scripts utiles

Backend:
```
npm run start:dev
npm run build
npm run start:prod
npm run test
npm run test:e2e
npm run test:cov
```

Frontend:
```
npm run dev
npm run build
npm run preview
npm run lint
npm test
```

## Pruebas y cobertura

Backend (ultima ejecucion: 2026-02-02):
- Test suites: 30 passed, 30 total
- Tests: 105 passed, 105 total
- Fallos: ninguno
- Coverage (Jest --coverage):
  - Statements: 99.76%
  - Branches: 85.06%
  - Functions: 100%
  - Lines: 99.73%

Frontend (ultima ejecucion: 2026-02-02):
- Test suites: 14 passed, 14 total
- Tests: 43 passed, 43 total
- Fallos: ninguno
- Coverage (Jest --coverage):
  - Statements: 89.88%
  - Branches: 80.53%
  - Functions: 90%
  - Lines: 91.54%

## Endpoints principales (backend)
Base URL: `http://localhost:3000`

Productos:
- `GET /products` -> lista de productos

Transacciones:
- `POST /transactions`
```
{
  "productId": "string",
  "quantity": 1
}
```

- `PATCH /transactions/{id}/status`
```
{
  "status": "APPROVED"
}
```
Nota: si el status es APPROVED, se descuenta el stock.

Pagos:
- `GET /payments/acceptance-token` -> token de aceptacion de Wompi
- `POST /payments/pay`
```
{
  "productId": "string",
  "quantity": 1,
  "cardToken": "string",
  "email": "user@example.com"
}
```
Nota: `POST /payments/pay` no descuenta stock. El stock se descuenta cuando se confirma el pago con `PATCH /transactions/{id}/status`.

## Despliegue

Backend en Railway:
1) Crear proyecto y agregar Postgres.
2) Configurar variables:
   - `DATABASE_URL`
   - `WOMPI_URL`, `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_KEY`
   - `CORS_ORIGIN` (dominio del frontend)
   - `SEED_ON_START` (opcional)
3) Build Command: `npm run build`
4) Start Command: `npm run start:prod`

Frontend en Vercel:
1) Crear variable `VITE_API_BASE_URL` con la URL del backend.
2) Ejecutar un nuevo deploy para que el build tome la variable.

## Estructura rapida
- `backend/src/domain`: entidades, DTOs, puertos y casos de uso
- `backend/src/infrastructure`: adaptadores HTTP, repositorios y gateways externos
- `backend/src/database`: semillas de datos
- `frontend/src/api/`: clientes HTTP (axios)
- `frontend/src/store/`: estado global (Vuex)
- `frontend/src/views/`: pantallas
- `frontend/src/components/`: componentes reutilizables
- `frontend/src/utils/`: utilidades

## Licencia
UNLICENSED

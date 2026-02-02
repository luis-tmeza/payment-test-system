# Payment Test - Backend

Backend en NestJS para manejo de productos, transacciones y pagos con Wompi. Incluye arquitectura en capas (domain/infrastructure), repositorios TypeORM y una semilla opcional de productos.

## Tecnologias
- Node.js + TypeScript
- NestJS
- TypeORM + PostgreSQL
- Wompi (pasarela de pagos)

## Requisitos
- Node.js 18+
- PostgreSQL (local o Railway)

## Instalacion
```bash
npm install
```

## Variables de entorno
Crea un archivo `.env` (solo para desarrollo local) con estas variables:

```env
# Base de datos (local) o Railway
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Alternativa recomendada en Railway
DATABASE_URL=

# Wompi
WOMPI_URL=
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_INTEGRITY_KEY=

# Opcionales
PORT=3000
CORS_ORIGIN=http://localhost:5173
SEED_ON_START=false
```

Notas:
- En Railway, usa `DATABASE_URL` y configura variables en el panel (no se lee `.env`).
- `CORS_ORIGIN` acepta varios orígenes separados por coma.
- Si `SEED_ON_START=true`, se cargan productos al iniciar.

## Scripts
```bash
# desarrollo
npm run start:dev

# produccion (compilar y correr)
npm run build
npm run start:prod

# pruebas
npm run test
npm run test:e2e
npm run test:cov
```

## Pruebas y cobertura (backend)
Fecha de ejecucion: 2026-02-02

Comandos ejecutados:
- `npm run test`

Resultado:
- Test suites: 30 passed, 30 total
- Tests: 105 passed, 105 total
- Fallos: ninguno

Cobertura (Jest --coverage):
- Statements: 99.76%
- Branches: 85.06%
- Functions: 100%
- Lines: 99.73%

## Endpoints
Base URL: `http://localhost:3000`

### Productos
- `GET /products` -> lista de productos

### Transacciones
- `POST /transactions`

Body:
```json
{
  "productId": "string",
  "quantity": 1
}
```


- `PATCH /transactions/{id}/status`

Body:
```json
{
  "status": "APPROVED"
}
```
Nota: si el status es APPROVED, se descuenta el stock.

### Pagos
- `GET /payments/acceptance-token` -> token de aceptacion de Wompi
- `POST /payments/pay`

Body:
```json
{
  "productId": "string",
  "quantity": 1,
  "cardToken": "string",
  "email": "user@example.com"
}
```
Nota: `POST /payments/pay` no descuenta stock. El stock se descuenta cuando se confirma el pago con `PATCH /transactions/{id}/status`.


## Seed de productos
La semilla solo se ejecuta si `SEED_ON_START=true`.

## Despliegue en Railway
1. Crear proyecto en Railway y agregar Postgres.
2. Configurar variables de entorno:
   - `DATABASE_URL` (automatico al crear Postgres)
   - `WOMPI_URL`, `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_KEY`
   - `CORS_ORIGIN` (dominio del frontend)
   - `SEED_ON_START` (opcional)
3. Build Command: `npm run build`
4. Start Command: `npm run start:prod`

## Estructura
- `src/domain`: entidades, DTOs, puertos y casos de uso
- `src/infrastructure`: adaptadores HTTP, repositorios y gateways externos
- `src/database`: semillas de datos

## Licencia
UNLICENSED


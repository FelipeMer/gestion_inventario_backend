# Backend - Sistema de Gestión de Inventarios (SGIA)

Backend desarrollado con **NestJS** + **PostgreSQL** + **TypeORM** para la app móvil de control y gestión de inventarios de un almacén de ropa deportiva.

Proyecto complementario al desarrollo Android (Room Database, offline-first) del curso de Computación Móvil - UNIMINUTO.

---

## 📋 Requisitos previos

- Node.js 18+ y npm
- PostgreSQL 14+ (local o vía Docker)
- Cuenta/cliente para probar la API: Swagger UI (incluido), Postman o `curl`

---

## 🚀 Instalación

```bash
# Clonar el repositorio (o ubicarse en la carpeta del proyecto)
cd gestion_inventario_backend

# Instalar dependencias
npm install
```

### Dependencias clave del proyecto

| Paquete | Uso |
|---|---|
| `@nestjs/typeorm`, `typeorm`, `pg` | ORM y driver de conexión a PostgreSQL |
| `@nestjs/config` | Manejo de variables de entorno |
| `class-validator`, `class-transformer` | Validación y transformación de DTOs |
| `@nestjs/mapped-types` | `PartialType` para los DTOs de actualización |
| `@nestjs/swagger` | Documentación interactiva de la API |
| `bcrypt` | Hash de contraseñas |
| `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` | Autenticación (pendiente de completar) |

---

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=inventario_db
```

### Levantar PostgreSQL con Docker (opcional)

```bash
docker run --name inventario-db \
  -e POSTGRES_PASSWORD=tu_password \
  -e POSTGRES_DB=inventario_db \
  -p 5432:5432 \
  -d postgres:16
```

> ⚠️ El proyecto usa `synchronize: true` en TypeORM, lo que crea/actualiza las tablas automáticamente a partir de las entidades. **Esto es solo para desarrollo.** Antes de producción, se debe migrar a `migrations` explícitas para evitar pérdida de datos.

---

## ▶️ Ejecutar el proyecto

```bash
# Modo desarrollo (con recarga automática)
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

El servidor queda disponible en `http://localhost:3000`.

La documentación interactiva de Swagger queda en `http://localhost:3000/api`.

---

## 🗂️ Estructura del proyecto

```
src/
├── common/                   # guards, interceptors, filters, pipes globales
├── config/                   # configuración de base de datos y entorno
├── modules/
│   ├── auth/                 # usuarios, roles, autenticación
│   │   ├── entities/         # usuario.entity.ts, rol.entity.ts
│   │   └── dto/
│   ├── catalog/               # productos, categorías, clientes, proveedores
│   │   ├── entities/
│   │   └── dto/
│   ├── inventory/             # inventario, movimientos, tipos de movimiento (ledger)
│   │   ├── entities/
│   │   └── dto/
│   ├── purchases/              # entradas (compras a proveedores)
│   │   ├── entities/
│   │   └── dto/
│   └── sales/                  # salidas (ventas a clientes)
│       ├── entities/
│       └── dto/
├── app.module.ts
└── main.ts
```

### Principio de diseño: patrón de libro contable (ledger)

El módulo `inventory` es el **único** punto de entrada para modificar el stock. Ni `Inventario`, ni `Movimiento`, ni `Referencia` se crean o editan directamente por el usuario vía endpoints propios — solo se generan como efecto de `InventoryService.registrarMovimiento()`, invocado desde:

- `PurchasesService.createEntrada()` → suma stock (tipo `ENTRADA`)
- `SalesService.createSalida()` → resta stock (tipo `SALIDA`)
- `InventoryService.crearAjuste()` → ajuste manual (tipo `AJUSTE`)

Esto garantiza trazabilidad completa: todo cambio de stock queda registrado en el historial de movimientos.

---

## 🔑 Datos semilla necesarios antes de probar

Estos registros deben crearse **una sola vez** antes de poder usar `purchases` y `sales`:

### 1. Roles (vía SQL directo, no hay endpoint aún)

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- si gen_random_uuid() no existe

INSERT INTO roles (id_rol, nombre, descripcion)
VALUES (gen_random_uuid(), 'VENDEDOR', 'Usuario con acceso operativo');
```

### 2. Tipos de movimiento (vía Swagger/API)

```http
POST /inventory/tipos-movimiento
{ "nombre": "ENTRADA", "signo": 1, "descripcion": "Compra a proveedor" }

POST /inventory/tipos-movimiento
{ "nombre": "SALIDA", "signo": -1, "descripcion": "Venta a cliente" }

POST /inventory/tipos-movimiento
{ "nombre": "AJUSTE", "signo": 1, "descripcion": "Ajuste manual de conteo físico" }
```

### 3. Usuario de prueba

```http
POST /auth/register
{
  "nombre": "Admin Prueba",
  "email": "admin@test.com",
  "password": "123456"
}
```

---

## 🧪 Flujo de pruebas end-to-end

Con los datos semilla ya creados, sigue este orden (cada paso usa el `id` devuelto por el anterior):

1. **Crear proveedor** — `POST /catalog/proveedores`
2. **Crear cliente** — `POST /catalog/clientes`
3. **Crear categoría** — `POST /catalog/categorias`
4. **Crear producto** — `POST /catalog/productos` (usa el `id_categoria` del paso 3)
5. **Registrar una entrada (compra)** — `POST /purchases/entradas`
   ```json
   {
     "proveedor_id": "<id_proveedor>",
     "usuario_id": "<id_usuario>",
     "detalles": [
       { "producto_id": "<id_producto>", "cantidad": 20, "precio_compra": 80000 }
     ]
   }
   ```
6. **Confirmar stock** — `GET /inventory/<id_producto>` → debe mostrar `cantidad: 20`
7. **Registrar una salida (venta)** — `POST /sales/salidas`
   ```json
   {
     "cliente_id": "<id_cliente>",
     "usuario_id": "<id_usuario>",
     "detalles": [
       { "producto_id": "<id_producto>", "cantidad": 5, "precio_venta": 150000 }
     ]
   }
   ```
8. **Confirmar stock** — `GET /inventory/<id_producto>` → debe mostrar `cantidad: 15`
9. **Probar rollback** — intenta una salida con `cantidad: 999` (más de lo disponible). Debe responder `400 Bad Request` y el stock **no** debe cambiar — confirma que la transacción se revirtió por completo.

---

## 📌 Endpoints principales

| Módulo | Método | Ruta | Descripción |
|---|---|---|---|
| auth | POST | `/auth/register` | Crear usuario |
| catalog | POST/GET/PATCH/DELETE | `/catalog/productos` | CRUD de productos |
| catalog | POST/GET | `/catalog/categorias` | CRUD de categorías |
| catalog | POST/GET | `/catalog/clientes` | CRUD de clientes |
| catalog | POST/GET | `/catalog/proveedores` | CRUD de proveedores |
| inventory | POST/GET | `/inventory/tipos-movimiento` | Tipos de movimiento (setup) |
| inventory | GET | `/inventory` | Stock de todos los productos |
| inventory | GET | `/inventory/:productoId` | Stock de un producto |
| inventory | GET | `/inventory/movimientos/historial` | Historial de movimientos |
| inventory | POST | `/inventory/ajustes/incremento` | Ajuste manual (+) |
| inventory | POST | `/inventory/ajustes/decremento` | Ajuste manual (-) |
| purchases | POST/GET | `/purchases/entradas` | Registrar/consultar compras |
| sales | POST/GET | `/sales/salidas` | Registrar/consultar ventas |

---

## 🚧 Pendiente por implementar

- [ ] `AuthService.login()` con JWT + `Guards` para proteger rutas
- [ ] CRUD de `Rol` vía endpoints (actualmente se crea por SQL directo)
- [ ] Migraciones de TypeORM (reemplazar `synchronize: true` antes de producción)
- [ ] Tipos monetarios `NUMERIC` con precisión — validado en DTOs, revisar en reportes agregados
- [ ] Tests unitarios y e2e

---

## 🛠️ Stack técnico

- **Framework:** NestJS
- **Base de datos:** PostgreSQL
- **ORM:** TypeORM
- **Validación:** class-validator / class-transformer
- **Documentación API:** Swagger (OpenAPI)
- **Autenticación:** JWT + bcrypt (en progreso)
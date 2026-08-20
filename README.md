# Sistema de Gestión de Inventarios (SGIA)

Proyecto full-stack para control y gestión de inventarios de un almacén de ropa deportiva, desarrollado como parte del curso de Computación Móvil - UNIMINUTO.

- **Backend:** NestJS + PostgreSQL + TypeORM
- **Frontend:** Android nativo (Java) con Room Database, offline-first y escaneo de código de barras (ML Kit)

---

# 🖥️ Backend

## 📋 Requisitos previos

- Node.js 18+ y npm
- PostgreSQL 14+ (local o vía Docker)
- Cliente para probar la API: Swagger UI (incluido), Postman o `curl`

## 🚀 Instalación

```bash
cd gestion_inventario_backend
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
| `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` | Autenticación con JWT |

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=inventario_db

JWT_SECRET=una_clave_larga_y_dificil_de_adivinar_cambiala_en_produccion
JWT_EXPIRES_IN=8h
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

## ▶️ Ejecutar el proyecto

```bash
# Modo desarrollo (con recarga automática)
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

El servidor queda disponible en `http://localhost:3000`.
Documentación interactiva de Swagger: `http://localhost:3000/api`.

## 🗂️ Estructura del proyecto

```
src/
├── common/                   # guards, interceptors, filters, pipes globales
├── config/                   # configuración de base de datos y entorno
├── modules/
│   ├── auth/                  # usuarios, roles, autenticación JWT
│   │   ├── entities/           # usuario.entity.ts, rol.entity.ts
│   │   ├── strategies/          # jwt.strategy.ts
│   │   ├── guards/               # jwt-auth.guard.ts
│   │   └── dto/                   # register.dto.ts, login.dto.ts
│   ├── catalog/                # productos, categorías, clientes, proveedores
│   │   ├── entities/
│   │   └── dto/
│   ├── inventory/               # inventario, movimientos, tipos de movimiento (ledger)
│   │   ├── entities/
│   │   └── dto/
│   ├── purchases/                # entradas (compras a proveedores)
│   │   ├── entities/
│   │   └── dto/
│   └── sales/                     # salidas (ventas a clientes)
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

### Autenticación JWT

- `POST /auth/register` crea el usuario (password hasheado con bcrypt).
- `POST /auth/login` valida credenciales y devuelve `access_token` + datos del usuario.
- `JwtStrategy` valida el token en cada request protegida, extrayéndolo del header `Authorization: Bearer <token>`.
- `JwtAuthGuard` está disponible para proteger controllers (`@UseGuards(JwtAuthGuard)`), pero **aún no se ha aplicado a los módulos de negocio** (catalog, inventory, purchases, sales) — se activará una vez el frontend Android tenga el flujo de login probado de punta a punta.

## 🔑 Datos semilla necesarios antes de probar

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

## 🧪 Flujo de pruebas end-to-end

1. **Login** — `POST /auth/login` con el usuario de prueba → guarda el `access_token`
2. **Crear proveedor** — `POST /catalog/proveedores`
3. **Crear cliente** — `POST /catalog/clientes`
4. **Crear categoría** — `POST /catalog/categorias`
5. **Crear producto** — `POST /catalog/productos` (usa el `id_categoria` del paso 4)
6. **Registrar una entrada (compra)** — `POST /purchases/entradas`
   ```json
   {
     "proveedor_id": "<id_proveedor>",
     "usuario_id": "<id_usuario>",
     "detalles": [
       { "producto_id": "<id_producto>", "cantidad": 20, "precio_compra": 80000 }
     ]
   }
   ```
7. **Confirmar stock** — `GET /inventory/<id_producto>` → debe mostrar `cantidad: 20`
8. **Registrar una salida (venta)** — `POST /sales/salidas`
   ```json
   {
     "cliente_id": "<id_cliente>",
     "usuario_id": "<id_usuario>",
     "detalles": [
       { "producto_id": "<id_producto>", "cantidad": 5, "precio_venta": 150000 }
     ]
   }
   ```
9. **Confirmar stock** — `GET /inventory/<id_producto>` → debe mostrar `cantidad: 15`
10. **Probar rollback** — intenta una salida con `cantidad: 999` (más de lo disponible). Debe responder `400 Bad Request` y el stock **no** debe cambiar.

## 📌 Endpoints principales

| Módulo | Método | Ruta | Descripción |
|---|---|---|---|
| auth | POST | `/auth/register` | Crear usuario |
| auth | POST | `/auth/login` | Login, devuelve `access_token` |
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

## 🚧 Pendiente por implementar (backend)

- [ ] Aplicar `@UseGuards(JwtAuthGuard)` a catalog, inventory, purchases y sales
- [ ] CRUD de `Rol` vía endpoints (actualmente se crea por SQL directo)
- [ ] Migraciones de TypeORM (reemplazar `synchronize: true` antes de producción)
- [ ] Tests unitarios y e2e

---

# 📱 Frontend (Android - Java)

## Stack técnico

- **Lenguaje:** Java
- **Arquitectura:** MVVM offline-first
- **UI:** XML + View Binding, `Fragment` + Navigation Component, `BottomNavigationView` (Material 3)
- **Red:** Retrofit + OkHttp (interceptor de logging + interceptor de JWT)
- **Caché local:** Room
- **Escaneo de productos:** ML Kit Barcode Scanning + CameraX
- **Sesión:** `EncryptedSharedPreferences` para el JWT

## Arquitectura de capas

```
UI (Fragment) → ViewModel (LiveData) → Repository → Remote (Retrofit) o Local (Room)
```

El `Repository` es el único que decide si los datos vienen del backend o del caché local, replicando offline-first el mismo principio de separación de capas usado en el backend (controller → service → entity).

## 🗂️ Estructura de paquetes

```
app/src/main/java/com/codebyfelipe/appinventarios/
├── MainActivity.java
├── data/
│   ├── local/                    # Room
│   │   ├── entity/
│   │   ├── dao/
│   │   └── AppDatabase.java
│   ├── remote/                   # Retrofit
│   │   ├── ApiClient.java
│   │   ├── ApiService.java
│   │   ├── AuthInterceptor.java
│   │   └── dto/
│   └── repository/
│       ├── AuthRepository.java
│       ├── CatalogRepository.java
│       ├── InventoryRepository.java
│       ├── PurchasesRepository.java
│       └── SalesRepository.java
├── ui/
│   ├── auth/
│   ├── dashboard/
│   ├── catalog/
│   │   ├── product/
│   │   ├── category/
│   │   ├── client/
│   │   └── provider/
│   ├── movements/
│   │   ├── entrada/
│   │   ├── salida/
│   │   └── history/
│   ├── profile/
│   └── scanner/
└── util/
    ├── SessionManager.java        # guarda/lee el JWT cifrado
    ├── Constants.java               # BASE_URL, claves de preferencias
    ├── Resource.java                 # wrapper {LOADING, SUCCESS, ERROR}
    └── NetworkUtils.java
```

## Navegación

`Login` → `MainActivity` con `BottomNavigationView` de 4 pestañas:

| Pestaña | Contenido |
|---|---|
| Dashboard | Resumen, alertas de stock bajo |
| Catálogo | Productos, categorías, clientes, proveedores |
| Movimientos | Registrar/consultar compras (entradas) y ventas (salidas) |
| Perfil | Datos del usuario, cerrar sesión |

## ⚙️ Configuración

En `util/Constants.java`, ajustar `BASE_URL` según el entorno de prueba:

```java
// Emulador de Android Studio → apunta al localhost de la PC
public static final String BASE_URL = "http://10.0.2.2:3000/";

// Celular físico → IP local de la PC en la misma red Wi-Fi
// public static final String BASE_URL = "http://192.168.1.X:3000/";
```

`AndroidManifest.xml` requiere:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<application android:usesCleartextTraffic="true" ...>
```
> ⚠️ `usesCleartextTraffic="true"` es solo para desarrollo contra HTTP sin SSL — quitar antes de producción.

## ✅ Progreso actual

- [x] Estructura de paquetes creada
- [x] `AndroidManifest.xml` configurado (permisos de red y cámara)
- [x] `Constants.java` y `SessionManager.java` (sesión cifrada)
- [x] `ApiClient.java`, `ApiService.java`, `AuthInterceptor.java`
- [x] DTOs de `auth`: `LoginRequest`, `LoginResponse`, `RegisterRequest`, `Usuario`, `Rol`
- [x] `AuthRepository.java` (login/register) + `Resource.java`
- [ ] `LoginViewModel.java` + `LoginFragment.java` (siguiente paso)
- [ ] `MainActivity.java` + `nav_graph.xml` + `bottom_nav_menu.xml`
- [ ] DTOs y repositories de `catalog`, `inventory`, `purchases`, `sales`
- [ ] Pantallas de catálogo (lista, detalle, formulario con escaneo)
- [ ] Pantallas de movimientos (entrada/salida) con escaneo ML Kit
- [ ] Room (entities, DAOs, `AppDatabase`) para el caché offline
- [ ] Prueba end-to-end: login real desde la app contra el backend

---

## 🛠️ Stack técnico resumen

| Capa | Tecnología |
|---|---|
| Backend | NestJS, PostgreSQL, TypeORM |
| Validación | class-validator / class-transformer |
| Documentación API | Swagger (OpenAPI) |
| Autenticación | JWT + bcrypt |
| Frontend | Android (Java), MVVM offline-first |
| Red (Android) | Retrofit + OkHttp |
| Caché local (Android) | Room |
| Escaneo de productos | ML Kit + CameraX |
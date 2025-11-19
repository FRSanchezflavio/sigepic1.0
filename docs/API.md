# 📚 API Documentation - SIGEPIC

## Tabla de Contenidos

- [Autenticación](#autenticación)
- [Personal](#personal)
- [Jerarquías](#jerarquías)
- [Secciones](#secciones)
- [Auditoría](#auditoría)
- [Usuarios](#usuarios)

---

## 🔐 Autenticación

### POST `/api/auth/login`

Autenticar usuario y obtener token JWT.

**Request:**

```json
{
  "usuario": "admin",
  "password": "Admin123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": {
      "id": 1,
      "usuario": "admin",
      "rol": "admin",
      "nombre_completo": "Administrador del Sistema"
    }
  },
  "message": "Inicio de sesión exitoso"
}
```

### POST `/api/auth/logout`

Cerrar sesión actual.

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### PUT `/api/auth/cambiar-password`

Cambiar contraseña del usuario actual.

**Headers:** `Authorization: Bearer {token}`

**Request:**

```json
{
  "passwordActual": "OldPassword123!",
  "passwordNueva": "NewPassword123!",
  "confirmarPassword": "NewPassword123!"
}
```

---

## 👥 Personal

### GET `/api/personal`

Listar personal con búsqueda y paginación.

**Headers:** `Authorization: Bearer {token}`

**Query Params:**

- `page` (default: 1)
- `limit` (default: 10)
- `busqueda` - Buscar por nombre, CI, jerarquía
- `estado` - Filtrar por estado: ACTIVO, INACTIVO, BAJA
- `jerarquiaId` - Filtrar por jerarquía
- `seccionId` - Filtrar por sección

**Example:**

```
GET /api/personal?page=1&limit=10&busqueda=Juan&estado=ACTIVO
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombres": "Juan Carlos",
      "apellidos": "Pérez López",
      "ci": "12345678",
      "jerarquia": {
        "nombre": "Teniente"
      },
      "seccion": {
        "nombre": "D-2"
      },
      "estado": "ACTIVO"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### GET `/api/personal/:id`

Obtener detalles de un personal.

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombres": "Juan Carlos",
    "apellidos": "Pérez López",
    "ci": "12345678",
    "expedicion": "LP",
    "fecha_nacimiento": "1990-05-15T00:00:00.000Z",
    "genero": "M",
    "estado_civil": "CASADO",
    "telefono": "70123456",
    "correo": "juan.perez@policia.gob.bo",
    "direccion": "Av. Arce #1234",
    "jerarquia": {
      "id": 5,
      "nombre": "Teniente",
      "tipo": "SUPERIOR"
    },
    "seccion": {
      "id": 1,
      "nombre": "D-2",
      "descripcion": "Departamento de Inteligencia Criminal"
    },
    "especialidad": "Investigación Criminal",
    "fecha_ingreso": "2015-03-10T00:00:00.000Z",
    "estado": "ACTIVO",
    "foto": "/uploads/fotos/12345678.jpg"
  }
}
```

### POST `/api/personal`

Crear nuevo registro de personal.

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Permisos:** admin, supervisor

**Request:**

```json
{
  "nombres": "María Elena",
  "apellidos": "Rodríguez García",
  "ci": "87654321",
  "expedicion": "CB",
  "fecha_nacimiento": "1992-08-20",
  "genero": "F",
  "estado_civil": "SOLTERO",
  "telefono": "71234567",
  "correo": "maria.rodriguez@policia.gob.bo",
  "direccion": "Calle Libertad #567",
  "jerarquiaId": 3,
  "especialidad": "Análisis de Información",
  "seccionId": 1,
  "fecha_ingreso": "2018-06-15",
  "grupo_sanguineo": "O+",
  "contacto_emergencia": "Pedro Rodríguez",
  "telefono_emergencia": "72345678"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "nombres": "María Elena",
    "apellidos": "Rodríguez García",
    ...
  },
  "message": "Personal creado exitosamente"
}
```

### PUT `/api/personal/:id`

Actualizar registro de personal.

**Headers:** `Authorization: Bearer {token}`

**Permisos:** admin, supervisor

**Request:** (campos opcionales para actualizar)

```json
{
  "telefono": "71111111",
  "direccion": "Nueva dirección",
  "estado": "ACTIVO"
}
```

### DELETE `/api/personal/:id`

Eliminar registro de personal.

**Headers:** `Authorization: Bearer {token}`

**Permisos:** admin únicamente

---

## 📊 Estadísticas

### GET `/api/personal/estadisticas`

Obtener estadísticas generales del personal.

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "success": true,
  "data": {
    "totalActivo": 120,
    "totalInactivo": 15,
    "totalSuperiores": 45,
    "totalSubalternos": 90,
    "porJerarquia": [
      { "nombre": "Coronel", "cantidad": 5 },
      { "nombre": "Teniente Coronel", "cantidad": 10 }
    ],
    "porSeccion": [
      { "nombre": "D-2", "cantidad": 80 }
    ]
  }
}
```

---

## 📁 Archivos

### POST `/api/personal/:id/foto`

Subir foto del personal.

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Permisos:** admin, supervisor

**Form Data:**

- `foto` - Archivo imagen (JPG, PNG, max 5MB)

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "/uploads/fotos/12345678_1234567890.jpg"
  },
  "message": "Foto subida exitosamente"
}
```

### POST `/api/personal/:id/archivos`

Subir documentos del personal.

**Headers:**

- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Permisos:** admin, supervisor

**Form Data:**

- `archivos` - Archivos (PDF, DOC, DOCX, max 10MB c/u)

---

## 🔗 Jerarquías

### GET `/api/jerarquias`

Listar todas las jerarquías.

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "General de Policía",
      "abreviatura": "Gral.",
      "tipo": "SUPERIOR",
      "nivel": 1
    }
  ]
}
```

### POST `/api/jerarquias`

Crear nueva jerarquía.

**Permisos:** admin únicamente

---

## 🏢 Secciones

### GET `/api/secciones`

Listar todas las secciones.

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "D-2",
      "descripcion": "Departamento de Inteligencia Criminal",
      "activo": true
    }
  ]
}
```

---

## 📜 Auditoría

### GET `/api/auditorias`

Consultar logs de auditoría.

**Headers:** `Authorization: Bearer {token}`

**Permisos:** admin, auditor

**Query Params:**

- `entidad` - Filtrar por entidad
- `accion` - Filtrar por acción (CREAR, ACTUALIZAR, ELIMINAR)
- `usuarioId` - Filtrar por usuario
- `fechaInicio` - Fecha inicio (YYYY-MM-DD)
- `fechaFin` - Fecha fin (YYYY-MM-DD)
- `page`, `limit` - Paginación

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "entidad": "Personal",
      "registroId": 25,
      "accion": "ACTUALIZAR",
      "cambios": {
        "telefono": {
          "anterior": "70123456",
          "nuevo": "71111111"
        }
      },
      "usuario": {
        "usuario": "admin",
        "nombre_completo": "Administrador"
      },
      "ip": "192.168.1.100",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 👤 Usuarios

### GET `/api/usuarios`

Listar usuarios del sistema.

**Headers:** `Authorization: Bearer {token}`

**Permisos:** admin únicamente

### POST `/api/usuarios`

Crear nuevo usuario.

**Permisos:** admin únicamente

**Request:**

```json
{
  "usuario": "jperez",
  "password": "Password123!",
  "rol": "usuario",
  "personalId": 25
}
```

### PUT `/api/usuarios/:id`

Actualizar usuario.

**Permisos:** admin únicamente

### DELETE `/api/usuarios/:id`

Eliminar usuario.

**Permisos:** admin únicamente

---

## 🔒 Roles y Permisos

| Rol            | Permisos                          |
| -------------- | --------------------------------- |
| **admin**      | Acceso total al sistema           |
| **supervisor** | Crear, leer y actualizar personal |
| **usuario**    | Solo lectura                      |
| **auditor**    | Lectura + acceso a auditorías     |

---

## ⚠️ Códigos de Error

| Código | Descripción                              |
| ------ | ---------------------------------------- |
| 400    | Bad Request - Datos inválidos            |
| 401    | Unauthorized - Token inválido o expirado |
| 403    | Forbidden - Sin permisos                 |
| 404    | Not Found - Recurso no encontrado        |
| 409    | Conflict - Conflicto (ej: CI duplicado)  |
| 429    | Too Many Requests - Rate limit excedido  |
| 500    | Internal Server Error                    |

**Formato de Error:**

```json
{
  "success": false,
  "error": {
    "message": "Descripción del error",
    "code": "ERROR_CODE"
  }
}
```

---

## 🚦 Rate Limiting

- **General:** 100 requests por 15 minutos
- **Login:** 5 intentos por 15 minutos
- **Crear registros:** 10 requests por 15 minutos

---

## 📝 Notas

- Todos los timestamps están en formato ISO 8601
- Las fechas de nacimiento e ingreso son en formato `YYYY-MM-DD`
- Los archivos subidos se almacenan en `/uploads`
- El token JWT expira en 7 días
- Todas las respuestas incluyen `success: true/false`

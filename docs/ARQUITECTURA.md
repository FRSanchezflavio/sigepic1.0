# 🏗️ Arquitectura del Sistema - SIGEPIC

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Flujo de Datos](#flujo-de-datos)
6. [Seguridad](#seguridad)
7. [Modelos de Datos](#modelos-de-datos)

---

## 1. Visión General

SIGEPIC es una aplicación web full-stack diseñada con arquitectura de tres capas:

- **Frontend**: SPA (Single Page Application) con React
- **Backend**: API RESTful con Node.js/Express
- **Base de Datos**: PostgreSQL con Prisma ORM

### Principios de Diseño

- **Separación de Responsabilidades**: Frontend, Backend y DB separados
- **RESTful API**: Endpoints diseñados siguiendo convenciones REST
- **Stateless Authentication**: JWT sin estado en servidor
- **Auditoría Completa**: Todos los cambios registrados
- **Escalabilidad Horizontal**: Arquitectura preparada para múltiples instancias
- **Seguridad por Capas**: Múltiples niveles de validación

---

## 2. Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────┐
│                      USUARIO                             │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   NGINX (Reverse Proxy)                  │
│  - SSL Termination                                       │
│  - Static Files (Frontend)                               │
│  - Load Balancing                                        │
└───────────┬───────────────────────────┬─────────────────┘
            │ /                          │ /api
            ▼                            ▼
┌─────────────────────┐    ┌────────────────────────────┐
│   FRONTEND          │    │    BACKEND API             │
│   (React SPA)       │    │    (Node.js/Express)       │
│                     │    │                            │
│  - React Router     │    │  - Authentication          │
│  - State Management │    │  - Business Logic          │
│  - UI Components    │    │  - File Upload             │
│  - API Client       │    │  - Email Service           │
│                     │    │  - PDF Generation          │
└─────────────────────┘    └──────────┬─────────────────┘
                                      │ Prisma ORM
                                      ▼
                           ┌──────────────────────┐
                           │   PostgreSQL         │
                           │   - Usuario          │
                           │   - Personal         │
                           │   - Auditoria        │
                           │   - Jerarquia        │
                           │   - Seccion          │
                           │   - Licencia         │
                           │   - Capacitacion     │
                           │   - Sancion          │
                           └──────────────────────┘
```

---

## 3. Stack Tecnológico

### Frontend

- **React 18.2.0**: Framework UI
- **Vite 5.0.8**: Build tool y dev server
- **React Router 6.20.1**: Navegación SPA
- **Tailwind CSS 3.4.0**: Estilos utility-first
- **Axios 1.6.2**: Cliente HTTP
- **Lucide React**: Iconos
- **class-variance-authority**: Variantes de componentes

### Backend

- **Node.js 18+**: Runtime
- **Express 4.18.2**: Framework web
- **Prisma 5.7.1**: ORM
- **JWT 9.0.2**: Autenticación
- **bcrypt 5.1.1**: Hashing de passwords
- **Winston 3.11.0**: Logging
- **Multer 1.4.5**: Upload de archivos
- **PDFKit 0.13.0**: Generación de PDFs
- **Nodemailer 6.9.7**: Envío de emails

### Base de Datos

- **PostgreSQL 15**: RDBMS
- **Prisma Migrate**: Migraciones

### DevOps

- **Docker 24+**: Containerización
- **Docker Compose**: Orquestación
- **Nginx**: Reverse proxy
- **GitHub Actions**: CI/CD

### Testing

- **Jest 29.7.0**: Testing backend
- **Supertest 6.3.3**: Testing API
- **Vitest 1.1.0**: Testing frontend
- **React Testing Library 14.1.2**: Testing componentes

---

## 4. Estructura del Proyecto

```
SIGEPIC/
├── backend/                      # Backend API
│   ├── src/
│   │   ├── config/              # Configuración
│   │   │   ├── database.js      # Prisma client
│   │   │   └── env.js           # Variables de entorno
│   │   ├── controllers/         # Controladores
│   │   │   ├── authController.js
│   │   │   ├── personalController.js
│   │   │   ├── jerarquiaController.js
│   │   │   ├── seccionController.js
│   │   │   ├── auditoriaController.js
│   │   │   └── usuarioController.js
│   │   ├── middlewares/         # Middlewares
│   │   │   ├── auth.js          # Autenticación JWT
│   │   │   ├── errorHandler.js  # Manejo de errores
│   │   │   ├── rateLimiter.js   # Rate limiting
│   │   │   └── upload.js        # Upload de archivos
│   │   ├── routes/              # Rutas API
│   │   │   ├── auth.js
│   │   │   ├── personal.js
│   │   │   ├── jerarquia.js
│   │   │   ├── seccion.js
│   │   │   ├── auditoria.js
│   │   │   └── usuario.js
│   │   ├── services/            # Servicios
│   │   │   ├── logger.js        # Winston logger
│   │   │   ├── validators.js    # Validaciones Joi
│   │   │   ├── pdfService.js    # Generación PDFs
│   │   │   └── emailService.js  # Envío emails
│   │   ├── utils/               # Utilidades
│   │   │   └── jwt.js           # JWT helper
│   │   ├── app.js               # Express app
│   │   └── server.js            # Entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Schema Prisma
│   │   └── migrations/          # Migraciones
│   ├── tests/                   # Tests
│   │   ├── unit/
│   │   └── integration/
│   ├── uploads/                 # Archivos subidos
│   ├── reports/                 # PDFs generados
│   └── logs/                    # Logs
│
├── frontend/                    # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes
│   │   │   ├── ui/              # UI primitivos
│   │   │   │   ├── button.jsx
│   │   │   │   ├── input.jsx
│   │   │   │   ├── card.jsx
│   │   │   │   ├── alert.jsx
│   │   │   │   ├── select.jsx
│   │   │   │   ├── dialog.jsx
│   │   │   │   ├── table.jsx
│   │   │   │   ├── badge.jsx
│   │   │   │   └── textarea.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/            # Context API
│   │   │   └── AuthContext.jsx  # Auth global state
│   │   ├── pages/               # Páginas
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PersonalList.jsx
│   │   │   ├── PersonalNew.jsx
│   │   │   ├── PersonalEdit.jsx
│   │   │   └── PersonalDetail.jsx
│   │   ├── services/            # API clients
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── personalService.js
│   │   ├── utils/               # Utilidades
│   │   │   └── cn.js            # className merger
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Entry point
│   ├── tests/                   # Tests
│   └── public/                  # Assets estáticos
│
├── docker/                      # Docker configs
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
│
├── .github/                     # CI/CD
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── scripts/                     # Scripts
│   ├── setup-dev.sh
│   ├── deploy.sh
│   └── backup-db.sh
│
└── docs/                        # Documentación
    ├── API.md
    ├── MANUAL_USUARIO.md
    ├── DEPLOYMENT.md
    └── ARQUITECTURA.md
```

---

## 5. Flujo de Datos

### 5.1 Autenticación

```
Usuario → Login Form → POST /api/auth/login
                            ↓
                    Validar credenciales
                            ↓
                    bcrypt.compare(password)
                            ↓
                    Generar JWT Token
                            ↓
                    Return { token, user }
                            ↓
Frontend almacena en localStorage
                            ↓
Incluye en header: Authorization: Bearer {token}
```

### 5.2 Operación CRUD (Ejemplo: Crear Personal)

```
1. Frontend
   PersonalNew.jsx
   ↓ handleSubmit()
   ↓
   personalService.create(data)
   ↓
   axios.post('/api/personal', data, { headers: { Authorization } })

2. Backend
   POST /api/personal
   ↓
   auth middleware → Verificar JWT
   ↓
   personalController.crearPersonal()
   ↓
   Validar con Joi
   ↓
   prisma.personal.create()
   ↓
   Crear registro Auditoria
   ↓
   Enviar email bienvenida
   ↓
   Return 201 { personal }

3. Frontend
   Recibe response
   ↓
   Actualiza UI
   ↓
   Redirige a lista
```

### 5.3 Generación de Reportes

```
Usuario → Click "Exportar PDF"
   ↓
GET /api/personal/:id/reporte
   ↓
personalController.generarReporte()
   ↓
pdfService.generarReportePersonal(data)
   ↓
PDFKit genera documento
   ↓
Guarda en /reports/
   ↓
Return { url, path }
   ↓
Frontend descarga archivo
```

---

## 6. Seguridad

### 6.1 Capas de Seguridad

**1. Network Layer**

- HTTPS (SSL/TLS)
- Nginx reverse proxy
- Firewall (solo puertos 80, 443)

**2. Application Layer**

- Helmet.js (security headers)
- CORS configurado
- Rate limiting (15 req/min por IP)
- Input sanitization

**3. Authentication Layer**

- JWT stateless
- bcrypt (10 rounds)
- Password policy (8+ chars, mayúscula, número, especial)

**4. Authorization Layer**

- Middleware de roles
- Permisos por endpoint
- Validación en cada request

**5. Data Layer**

- Prepared statements (Prisma)
- SQL injection prevention
- XSS prevention

### 6.2 Flujo de Autorización

```javascript
// Middleware stack
[
  auth,              // 1. Verificar JWT
  checkRole(['ADMIN', 'SUPERVISOR']),  // 2. Verificar rol
  validateInput,     // 3. Validar datos
  controller         // 4. Ejecutar lógica
]
```

### 6.3 Headers de Seguridad

```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  xFrameOptions: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
})
```

---

## 7. Modelos de Datos

### 7.1 Diagrama ER

```
┌──────────────┐       ┌──────────────┐
│   Usuario    │       │  Personal    │
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ usuario      │       │ ci           │
│ password     │       │ nombres      │
│ rol          │───┐   │ apellidos    │
│ personalId   │   │   │ jerarquiaId  │──┐
└──────────────┘   │   │ seccionId    │  │
                   │   └──────────────┘  │
                   │                     │
                   │   ┌──────────────┐  │
                   └──▶│  Personal    │◀─┘
                       ├──────────────┤
                       │ (ver arriba) │
                       └──────┬───────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌───────────┐      ┌────────────┐     ┌───────────┐
    │ Licencia  │      │Capacitacion│     │  Sancion  │
    ├───────────┤      ├────────────┤     ├───────────┤
    │ id        │      │ id         │     │ id        │
    │personalId │      │ personalId │     │personalId │
    │tipo       │      │ nombre     │     │tipo       │
    │fechaInicio│      │institucion │     │motivo     │
    │fechaFin   │      │ fechaInicio│     │fecha      │
    │estado     │      │ fechaFin   │     │gravedad   │
    └───────────┘      └────────────┘     └───────────┘

┌──────────────┐       ┌──────────────┐
│  Jerarquia   │       │   Seccion    │
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ nombre       │       │ nombre       │
│ abreviatura  │       │ descripcion  │
│ nivel        │       │ activo       │
└──────────────┘       └──────────────┘

┌──────────────┐
│  Auditoria   │
├──────────────┤
│ id           │
│ usuarioId    │
│ entidad      │
│ accion       │
│ datosAnteriores│
│ datosNuevos  │
│ ip           │
│ userAgent    │
│ fecha        │
└──────────────┘
```

### 7.2 Relaciones Clave

- **Usuario** 1:1 **Personal** (un usuario por personal)
- **Personal** N:1 **Jerarquia** (muchos personales, una jerarquía)
- **Personal** N:1 **Seccion** (muchos personales, una sección)
- **Personal** 1:N **Licencia** (un personal, muchas licencias)
- **Personal** 1:N **Capacitacion** (un personal, muchas capacitaciones)
- **Personal** 1:N **Sancion** (un personal, muchas sanciones)

---

## 8. Patrones de Diseño

### 8.1 Backend

**MVC (Model-View-Controller)**

- **Model**: Prisma Schema
- **View**: JSON responses
- **Controller**: Controllers

**Repository Pattern**

- Prisma como abstracción de DB
- Separación de lógica de negocio y acceso a datos

**Middleware Pattern**

- Autenticación
- Autorización
- Validación
- Error handling

**Service Layer**

- Lógica compleja (PDF, Email)
- Reutilización de código

### 8.2 Frontend

**Component-Based Architecture**

- Componentes reutilizables
- Composición sobre herencia

**Container/Presentational Pattern**

- Pages (containers) con lógica
- UI components (presentational) sin estado

**Context API**

- Estado global de autenticación
- Evita prop drilling

---

## 9. Consideraciones de Performance

### 9.1 Base de Datos

**Índices:**

```sql
-- Prisma genera automáticamente
@@index([ci])              -- Búsqueda por CI
@@index([jerarquiaId])     -- Filtro por jerarquía
@@index([seccionId])       -- Filtro por sección
@@index([estado])          -- Filtro por estado
```

**Optimización de Queries:**

```javascript
// Usar select para campos específicos
prisma.personal.findMany({
  select: {
    id: true,
    nombres: true,
    apellidos: true
  }
})

// Usar include para relaciones
prisma.personal.findUnique({
  where: { id },
  include: {
    jerarquia: true,
    seccion: true
  }
})
```

### 9.2 Frontend

**Code Splitting:**

```javascript
// Lazy loading de rutas
const PersonalList = lazy(() => import('./pages/PersonalList'))
```

**Memoización:**

```javascript
// useMemo para cálculos costosos
const filteredData = useMemo(() => {
  return data.filter(item => item.estado === 'ACTIVO')
}, [data])
```

### 9.3 Caching

**Browser:**

- Assets estáticos (1 año)
- API responses (no-cache para datos sensibles)

**Server:**

- Static files en Nginx
- CDN para assets (futuro)

---

## 10. Escalabilidad

### 10.1 Horizontal Scaling

```
         Load Balancer
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
 Backend   Backend   Backend
 Instance  Instance  Instance
    │         │         │
    └─────────┼─────────┘
              ▼
          PostgreSQL
         (Primary/Replica)
```

### 10.2 Puntos de Escalabilidad

- **Stateless Backend**: Múltiples instancias
- **Session Storage**: JWT (no cookies)
- **File Storage**: S3-compatible (futuro)
- **DB Scaling**: Read replicas
- **Caching**: Redis (futuro)

---

© 2024 Policía Boliviana - Departamento de Inteligencia Criminal D-2

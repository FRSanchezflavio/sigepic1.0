# 🔧 Solución de Problemas - Base de Datos PostgreSQL

## Error: P1010 - Usuario denegado acceso a la base de datos

### Descripción del Problema

```
Error: P1010: User `sigepic_user` was denied access on the database `sigepic_db.public`
```

Este error ocurre cuando el usuario de PostgreSQL no tiene los permisos necesarios para acceder a la base de datos o al schema público.

---

## ✅ Solución Automática (Recomendada)

### Windows

Ejecuta el script de configuración automática:

```bash
cd scripts
./setup-database.bat
```

### Linux/Mac

```bash
cd scripts
chmod +x setup-database.sh
./setup-database.sh
```

---

## 🛠️ Solución Manual

Si prefieres configurar la base de datos manualmente, sigue estos pasos:

### Paso 1: Crear el usuario

```bash
psql -U postgres -c "CREATE USER sigepic_user WITH PASSWORD '30101995' CREATEDB;"
```

**Nota:** El permiso `CREATEDB` es necesario para que Prisma pueda crear la "shadow database" durante las migraciones.

### Paso 2: Crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE sigepic_db OWNER sigepic_user;"
```

### Paso 3: Otorgar privilegios en la base de datos

```bash
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sigepic_db TO sigepic_user;"
```

### Paso 4: Otorgar privilegios en el schema público

```bash
psql -U postgres -d sigepic_db -c "GRANT ALL ON SCHEMA public TO sigepic_user;"
psql -U postgres -d sigepic_db -c "ALTER SCHEMA public OWNER TO sigepic_user;"
```

### Paso 5: Configurar privilegios por defecto

```bash
psql -U postgres -d sigepic_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sigepic_user;"
psql -U postgres -d sigepic_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sigepic_user;"
psql -U postgres -d sigepic_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO sigepic_user;"
```

### Paso 6: Verificar configuración

```bash
# Verificar que el usuario existe
psql -U postgres -c "\du sigepic_user"

# Verificar que la base de datos existe
psql -U postgres -c "\l sigepic_db"

# Probar conexión
psql -U sigepic_user -d sigepic_db -c "SELECT version();"
```

---

## 📝 Verificar archivo .env

Asegúrate de que el archivo `backend/.env` tenga la configuración correcta:

```env
DATABASE_URL="postgresql://sigepic_user:30101995@localhost:5432/sigepic_db?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sigepic_db
DB_USER=sigepic_user
DB_PASSWORD=30101995
```

**⚠️ IMPORTANTE:** La contraseña en `DATABASE_URL` debe coincidir con `DB_PASSWORD`.

---

## 🚀 Ejecutar Migraciones

Una vez configurada la base de datos:

```bash
cd backend

# Ejecutar migraciones
npx prisma migrate dev

# Cargar datos iniciales
npx prisma db seed

# Verificar que todo funciona
npm run dev
```

---

## 🔍 Otros Errores Comunes

### Error: P3014 - Shadow database

```
Error: P3014
Prisma Migrate could not create the shadow database.
```

**Solución:** El usuario necesita permiso para crear bases de datos:

```bash
psql -U postgres -c "ALTER USER sigepic_user CREATEDB;"
```

### Error: connection refused

```
Error: connect ECONNREFUSED ::1:5432
```

**Causas posibles:**

1. PostgreSQL no está corriendo
2. PostgreSQL está escuchando en una dirección/puerto diferente
3. Firewall bloqueando la conexión

**Solución:**

```bash
# Verificar si PostgreSQL está corriendo
# Windows
sc query postgresql-x64-15

# Linux
sudo systemctl status postgresql

# Mac
brew services list

# Iniciar PostgreSQL si no está corriendo
# Windows (como administrador)
sc start postgresql-x64-15

# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql
```

### Error: authentication failed

```
Error: password authentication failed for user "sigepic_user"
```

**Solución:** Verificar que la contraseña en `.env` sea correcta y coincida con la contraseña del usuario en PostgreSQL.

```bash
# Cambiar contraseña del usuario
psql -U postgres -c "ALTER USER sigepic_user WITH PASSWORD '30101995';"
```

---

## 🔐 Configuración de pg_hba.conf (Avanzado)

Si tienes problemas de autenticación, verifica el archivo `pg_hba.conf`:

**Ubicaciones comunes:**

- Windows: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`
- Linux: `/etc/postgresql/15/main/pg_hba.conf`
- Mac: `/usr/local/var/postgres/pg_hba.conf`

Asegúrate de tener estas líneas:

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Después de modificar, reinicia PostgreSQL:

```bash
# Windows (como administrador)
sc stop postgresql-x64-15
sc start postgresql-x64-15

# Linux
sudo systemctl restart postgresql

# Mac
brew services restart postgresql
```

---

## 📊 Verificar Estado de la Base de Datos

```bash
# Conectarse a la base de datos
psql -U sigepic_user -d sigepic_db

# Dentro de psql:
\dt          # Listar tablas
\d Usuario   # Ver estructura de tabla Usuario
\du          # Listar usuarios
\l           # Listar bases de datos
\q           # Salir
```

---

## 🆘 Resetear Todo (Último Recurso)

Si nada funciona, puedes resetear completamente:

```bash
# Eliminar base de datos y usuario
psql -U postgres -c "DROP DATABASE IF EXISTS sigepic_db;"
psql -U postgres -c "DROP USER IF EXISTS sigepic_user;"

# Ejecutar script de configuración nuevamente
cd scripts
./setup-database.bat   # Windows
./setup-database.sh    # Linux/Mac

# Ejecutar migraciones
cd backend
npx prisma migrate dev
npx prisma db seed
```

---

## 📞 Soporte Adicional

Si el problema persiste después de seguir estas instrucciones:

1. Verifica los logs de PostgreSQL
2. Revisa el output completo del error
3. Consulta la documentación de Prisma: https://www.prisma.io/docs/
4. Abre un issue en el repositorio con el error completo

---

© 2024 SIGEPIC - Departamento de Inteligencia Criminal D-2

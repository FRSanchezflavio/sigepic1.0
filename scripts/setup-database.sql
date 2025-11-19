-- ================================================
-- Script de configuración de base de datos PostgreSQL
-- SIGEPIC - Sistema de Gestión del Personal
-- ================================================

-- Conectarse como usuario postgres (superusuario)
-- Ejecutar: psql -U postgres -f setup-database.sql

-- 1. Crear el usuario si no existe
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'sigepic_user') THEN
      CREATE USER sigepic_user WITH PASSWORD '30101995';
   END IF;
END
$$;

-- 2. Crear la base de datos si no existe
SELECT 'CREATE DATABASE sigepic_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sigepic_db')\gexec

-- 3. Otorgar todos los privilegios al usuario
GRANT ALL PRIVILEGES ON DATABASE sigepic_db TO sigepic_user;

-- 4. Conectarse a la base de datos sigepic_db
\c sigepic_db

-- 5. Otorgar privilegios en el schema public
GRANT ALL ON SCHEMA public TO sigepic_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sigepic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sigepic_user;

-- 6. Otorgar privilegios por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sigepic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sigepic_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO sigepic_user;

-- 7. Hacer al usuario propietario del schema public (opcional pero recomendado)
ALTER SCHEMA public OWNER TO sigepic_user;

-- 8. Verificación
\du sigepic_user
\l sigepic_db
\dn+

-- Mensaje de confirmación
\echo '✅ Base de datos y usuario configurados correctamente'
\echo '📝 Usuario: sigepic_user'
\echo '📝 Base de datos: sigepic_db'
\echo '📝 Próximo paso: Ejecutar "npx prisma migrate dev" en el directorio backend'

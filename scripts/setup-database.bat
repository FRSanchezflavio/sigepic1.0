@echo off
REM ================================================
REM Script de configuración de base de datos Windows
REM SIGEPIC - Sistema de Gestión del Personal
REM ================================================

echo ================================================
echo Configuracion de Base de Datos PostgreSQL
echo SIGEPIC - Sistema de Gestion del Personal
echo ================================================
echo.

REM Verificar si PostgreSQL está instalado
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL no esta instalado o no esta en el PATH
    echo Por favor instale PostgreSQL desde: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo [INFO] PostgreSQL encontrado
echo.

REM Solicitar contraseña del superusuario postgres
echo Ingrese la contrasena del usuario postgres cuando se le solicite
echo.

REM Crear usuario (si no existe, se ignora el error)
psql -U postgres -c "CREATE USER sigepic_user WITH PASSWORD '30101995' CREATEDB;" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Usuario sigepic_user creado
) else (
    echo [INFO] Usuario ya existe, otorgando permisos CREATEDB...
    psql -U postgres -c "ALTER USER sigepic_user CREATEDB;"
)

REM Crear base de datos
psql -U postgres -c "CREATE DATABASE sigepic_db OWNER sigepic_user;" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Base de datos sigepic_db creada
) else (
    echo [INFO] Base de datos ya existe
)

REM Otorgar privilegios
echo [INFO] Configurando privilegios...
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sigepic_db TO sigepic_user;"
psql -U postgres -d sigepic_db -c "GRANT ALL ON SCHEMA public TO sigepic_user;"
psql -U postgres -d sigepic_db -c "ALTER SCHEMA public OWNER TO sigepic_user;"
psql -U postgres -d sigepic_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sigepic_user;"
psql -U postgres -d sigepic_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sigepic_user;"
psql -U postgres -d sigepic_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO sigepic_user;"

echo.
echo ================================================
echo Base de datos configurada correctamente
echo ================================================
echo.
echo Usuario: sigepic_user
echo Contrasena: 30101995
echo Base de datos: sigepic_db
echo Host: localhost
echo Puerto: 5432
echo.
echo Proximos pasos:
echo 1. Ir al directorio backend: cd backend
echo 2. Verificar archivo .env
echo 3. Ejecutar migraciones: npx prisma migrate dev
echo 4. Cargar datos iniciales: npx prisma db seed
echo.
pause

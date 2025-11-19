#!/bin/bash
# ================================================
# Script de configuración de base de datos Linux/Mac
# SIGEPIC - Sistema de Gestión del Personal
# ================================================

set -e

echo "================================================"
echo "Configuración de Base de Datos PostgreSQL"
echo "SIGEPIC - Sistema de Gestión del Personal"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
DB_USER="sigepic_user"
DB_PASSWORD="30101995"
DB_NAME="sigepic_db"
DB_HOST="localhost"
DB_PORT="5432"

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} PostgreSQL no está instalado"
    echo "Por favor instale PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  MacOS: brew install postgresql"
    exit 1
fi

echo -e "${GREEN}[INFO]${NC} PostgreSQL encontrado"
echo ""

# Verificar si el servicio está corriendo
if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
    echo -e "${YELLOW}[WARN]${NC} PostgreSQL no está corriendo. Intentando iniciar..."
    
    # Intentar iniciar en Linux
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    # Intentar iniciar en MacOS
    elif command -v brew &> /dev/null; then
        brew services start postgresql
    else
        echo -e "${RED}[ERROR]${NC} No se pudo iniciar PostgreSQL automáticamente"
        echo "Por favor inicie PostgreSQL manualmente"
        exit 1
    fi
    
    sleep 2
fi

echo -e "${GREEN}[INFO]${NC} PostgreSQL está corriendo"
echo ""

# Crear usuario y base de datos
echo -e "${YELLOW}[INFO]${NC} Ingrese la contraseña del usuario postgres cuando se le solicite"
echo ""

# Crear usuario
psql -U postgres -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DB_USER') THEN CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD'; END IF; END \$\$;" || {
    echo -e "${RED}[ERROR]${NC} No se pudo crear el usuario"
    exit 1
}

# Crear base de datos
psql -U postgres -c "SELECT 'CREATE DATABASE $DB_NAME' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\\gexec" || true

# Otorgar privilegios
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
psql -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
psql -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
psql -U postgres -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
psql -U postgres -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
psql -U postgres -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_USER;"
psql -U postgres -d $DB_NAME -c "ALTER SCHEMA public OWNER TO $DB_USER;"

echo ""
echo "================================================"
echo -e "${GREEN}✅ Base de datos configurada correctamente${NC}"
echo "================================================"
echo ""
echo -e "📝 Usuario: ${GREEN}$DB_USER${NC}"
echo -e "📝 Contraseña: ${GREEN}$DB_PASSWORD${NC}"
echo -e "📝 Base de datos: ${GREEN}$DB_NAME${NC}"
echo -e "📝 Host: ${GREEN}$DB_HOST${NC}"
echo -e "📝 Puerto: ${GREEN}$DB_PORT${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Ir al directorio backend: cd backend"
echo "2. Verificar archivo .env con la configuración correcta"
echo "3. Ejecutar migraciones: npx prisma migrate dev"
echo "4. Cargar datos iniciales: npx prisma db seed"
echo ""

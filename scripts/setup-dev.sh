#!/bin/bash

# Script de setup para desarrollo local

set -e

echo "🚀 Iniciando setup de desarrollo SIGEPIC..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar requisitos
echo ""
echo "📋 Verificando requisitos..."

command -v node >/dev/null 2>&1 || { print_error "Node.js no está instalado"; exit 1; }
print_message "Node.js: $(node --version)"

command -v npm >/dev/null 2>&1 || { print_error "npm no está instalado"; exit 1; }
print_message "npm: $(npm --version)"

command -v psql >/dev/null 2>&1 && print_message "PostgreSQL instalado" || print_warning "PostgreSQL no detectado (opcional si usas Docker)"

# Backend setup
echo ""
echo "📦 Configurando Backend..."
cd backend

if [ ! -f .env ]; then
    print_warning "Creando archivo .env desde .env.example"
    cp .env.example .env
    print_warning "Por favor, edita backend/.env con tus credenciales"
    read -p "Presiona Enter cuando hayas configurado el .env..."
fi

print_message "Instalando dependencias del backend..."
npm install

print_message "Generando Prisma Client..."
npx prisma generate

# Preguntar sobre base de datos
echo ""
read -p "¿Deseas ejecutar las migraciones de la base de datos ahora? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_message "Ejecutando migraciones..."
    npx prisma migrate dev --name init
    
    read -p "¿Deseas cargar datos de prueba (seeds)? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "Cargando seeds..."
        npx prisma db seed
    fi
fi

cd ..

# Frontend setup
echo ""
echo "📦 Configurando Frontend..."
cd frontend

if [ ! -f .env ]; then
    print_warning "Creando archivo .env desde .env.example"
    cp .env.example .env
fi

print_message "Instalando dependencias del frontend..."
npm install

cd ..

# Docker setup
echo ""
read -p "¿Deseas configurar Docker? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v docker >/dev/null 2>&1; then
        print_message "Docker: $(docker --version)"
        print_message "Puedes iniciar los contenedores con: docker-compose up -d"
    else
        print_warning "Docker no está instalado"
    fi
fi

# Finalización
echo ""
echo "✨ Setup completado exitosamente!"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "   1. Configurar variables de entorno:"
echo "      - backend/.env"
echo "      - frontend/.env"
echo ""
echo "   2. Iniciar servicios:"
echo "      Backend:  cd backend && npm run dev"
echo "      Frontend: cd frontend && npm run dev"
echo ""
echo "   3. O usar Docker:"
echo "      docker-compose up -d"
echo ""
echo "   4. Acceder a la aplicación:"
echo "      Frontend: http://localhost:5173"
echo "      Backend:  http://localhost:3000"
echo "      Login:    admin / Admin123!"
echo ""

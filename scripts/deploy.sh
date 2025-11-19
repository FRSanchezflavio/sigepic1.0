#!/bin/bash

# Script de deployment para producción

set -e

echo "🚀 Iniciando deployment de SIGEPIC..."

# Verificar que estamos en la rama correcta
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  No estás en la rama main. Rama actual: $BRANCH"
    read -p "¿Continuar de todas formas? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pull últimos cambios
echo "📥 Actualizando código..."
git pull origin main

# Backup de base de datos
echo "💾 Creando backup de base de datos..."
./scripts/backup-db.sh

# Build y deploy con Docker
echo "🐳 Construyendo contenedores..."
docker-compose build

echo "🔄 Deteniendo contenedores antiguos..."
docker-compose down

echo "🚀 Iniciando nuevos contenedores..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
docker-compose exec -T backend npx prisma migrate deploy

# Health check
echo "🏥 Verificando salud de los servicios..."
sleep 5

BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)

if [ "$BACKEND_HEALTH" = "200" ] && [ "$FRONTEND_HEALTH" = "200" ]; then
    echo "✅ Deployment exitoso!"
    echo ""
    echo "Servicios disponibles:"
    echo "  Frontend: http://localhost"
    echo "  Backend:  http://localhost:3000"
else
    echo "❌ Error en el deployment"
    echo "  Backend health: $BACKEND_HEALTH"
    echo "  Frontend health: $FRONTEND_HEALTH"
    exit 1
fi

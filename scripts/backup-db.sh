#!/bin/bash

# Script de backup de base de datos

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sigepic_backup_$DATE.sql"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

echo "💾 Creando backup de base de datos..."

# Cargar variables de entorno
if [ -f backend/.env ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
fi

# Crear backup
docker-compose exec -T postgres pg_dump -U ${DB_USER:-sigepic_user} ${DB_NAME:-sigepic_db} > $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE

echo "✅ Backup creado: ${BACKUP_FILE}.gz"

# Limpiar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "🗑️  Backups antiguos eliminados"

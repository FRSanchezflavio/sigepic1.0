# 🚀 Guía de Deployment - SIGEPIC

## Tabla de Contenidos

1. [Preparación del Servidor](#preparación-del-servidor)
2. [Deployment con Docker](#deployment-con-docker)
3. [Deployment Manual](#deployment-manual)
4. [Configuración de Nginx](#configuración-de-nginx)
5. [SSL/HTTPS](#ssl-https)
6. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

---

## 1. Preparación del Servidor

### 1.1 Requisitos del Servidor

**Hardware Mínimo:**

- CPU: 2 cores
- RAM: 4GB
- Disco: 50GB SSD
- Red: 100Mbps

**Hardware Recomendado:**

- CPU: 4+ cores
- RAM: 8GB+
- Disco: 100GB+ SSD
- Red: 1Gbps

**Software:**

- Ubuntu 22.04 LTS o superior
- Docker 24.0+ y Docker Compose 2.0+
- Git
- Nginx (opcional si no usa Docker)

### 1.2 Configuración Inicial del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias básicas
sudo apt install -y curl git wget

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install -y docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

---

## 2. Deployment con Docker (Recomendado)

### 2.1 Clonar Repositorio

```bash
# Crear directorio
sudo mkdir -p /opt/sigepic
cd /opt/sigepic

# Clonar repositorio
git clone https://github.com/FRSanchezflavio/sigepic1.0.git .
```

### 2.2 Configurar Variables de Entorno

```bash
# Backend
cp backend/.env.example backend/.env
nano backend/.env
```

**Variables críticas a configurar:**

```env
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_USER=sigepic_user
DB_PASSWORD=[GENERAR_PASSWORD_SEGURO]
DB_NAME=sigepic_db
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# JWT
JWT_SECRET=[GENERAR_SECRET_SEGURO]
JWT_EXPIRES_IN=7d

# Aplicación
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-dominio.com

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password-app
SMTP_FROM=noreply@policia.gob.bo
```

**Generar secrets seguros:**

```bash
# JWT Secret
openssl rand -base64 32

# DB Password
openssl rand -base64 24
```

```bash
# Frontend
cp frontend/.env.example frontend/.env
nano frontend/.env
```

```env
VITE_API_URL=https://tu-dominio.com/api
```

### 2.3 Iniciar Servicios

```bash
# Build y start
docker compose up -d --build

# Verificar logs
docker compose logs -f

# Verificar servicios corriendo
docker compose ps
```

### 2.4 Ejecutar Migraciones

```bash
# Ejecutar migraciones de Prisma
docker compose exec backend npx prisma migrate deploy

# Cargar datos iniciales (seeds)
docker compose exec backend npx prisma db seed
```

### 2.5 Verificar Deployment

```bash
# Health check backend
curl http://localhost:3000/health

# Health check frontend
curl http://localhost/health

# Ver logs
docker compose logs backend
docker compose logs frontend
```

---

## 3. Deployment Manual (Sin Docker)

### 3.1 Instalar Node.js

```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 3.2 Instalar PostgreSQL

```bash
# Instalar PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib-15

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear base de datos y usuario
sudo -u postgres psql

CREATE DATABASE sigepic_db;
CREATE USER sigepic_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE sigepic_db TO sigepic_user;
\q
```

### 3.3 Deploy Backend

```bash
cd /opt/sigepic/backend

# Instalar dependencias
npm ci --only=production

# Configurar .env
cp .env.example .env
nano .env

# Ejecutar migraciones
npx prisma migrate deploy
npx prisma generate
npx prisma db seed

# Instalar PM2 para process management
sudo npm install -g pm2

# Iniciar con PM2
pm2 start src/server.js --name sigepic-backend
pm2 save
pm2 startup
```

### 3.4 Deploy Frontend

```bash
cd /opt/sigepic/frontend

# Instalar dependencias
npm ci

# Build
npm run build

# Los archivos estáticos estarán en dist/
```

---

## 4. Configuración de Nginx

### 4.1 Instalar Nginx

```bash
sudo apt install -y nginx
```

### 4.2 Configurar Virtual Host

```bash
sudo nano /etc/nginx/sites-available/sigepic
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /opt/sigepic/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Cache para assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/sigepic_access.log;
    error_log /var/log/nginx/sigepic_error.log;
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/sigepic /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 5. SSL/HTTPS con Let's Encrypt

### 5.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Obtener Certificado SSL

```bash
sudo certbot --nginx -d tu-dominio.com

# Seguir instrucciones interactivas
```

### 5.3 Renovación Automática

```bash
# Certbot configura renovación automática
# Verificar timer
sudo systemctl status certbot.timer

# Test de renovación
sudo certbot renew --dry-run
```

---

## 6. Monitoreo y Mantenimiento

### 6.1 Monitoreo con PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs sigepic-backend

# Monitoreo en tiempo real
pm2 monit
```

### 6.2 Backups de Base de Datos

**Script de Backup Automático:**

```bash
sudo nano /opt/sigepic/scripts/backup-cron.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/sigepic"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Backup con Docker
docker compose exec -T postgres pg_dump -U sigepic_user sigepic_db > $BACKUP_FILE

# Comprimir
gzip $BACKUP_FILE

# Limpiar backups > 30 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completado: ${BACKUP_FILE}.gz"
```

```bash
chmod +x /opt/sigepic/scripts/backup-cron.sh

# Agregar a crontab (backup diario a las 2 AM)
sudo crontab -e
0 2 * * * /opt/sigepic/scripts/backup-cron.sh >> /var/log/sigepic-backup.log 2>&1
```

### 6.3 Actualización del Sistema

```bash
cd /opt/sigepic

# Pull últimos cambios
git pull origin main

# Rebuild con Docker
docker compose down
docker compose up -d --build

# Ejecutar migraciones
docker compose exec backend npx prisma migrate deploy

# Sin Docker
cd backend
npm ci
npx prisma migrate deploy
pm2 restart sigepic-backend

cd ../frontend
npm ci
npm run build
```

### 6.4 Logs y Debugging

```bash
# Logs de Docker
docker compose logs -f backend
docker compose logs -f frontend

# Logs de Nginx
sudo tail -f /var/log/nginx/sigepic_error.log

# Logs de la aplicación
tail -f /opt/sigepic/backend/logs/app.log
```

---

## 7. Checklist de Deployment

- [ ] Servidor configurado con requisitos mínimos
- [ ] Docker y Docker Compose instalados
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Secrets generados (JWT, DB password)
- [ ] Servicios iniciados con Docker Compose
- [ ] Migraciones ejecutadas
- [ ] Seeds cargados
- [ ] Nginx configurado
- [ ] SSL/HTTPS configurado
- [ ] Backups automáticos configurados
- [ ] Health checks funcionando
- [ ] Firewall configurado
- [ ] Logs rotados

---

## 8. Troubleshooting

### Backend no inicia

```bash
# Verificar logs
docker compose logs backend

# Verificar variables de entorno
docker compose exec backend env | grep DB

# Verificar conexión a DB
docker compose exec backend npx prisma db pull
```

### Error de conexión a base de datos

```bash
# Verificar que Postgres está corriendo
docker compose ps postgres

# Verificar DATABASE_URL
echo $DATABASE_URL
```

### Frontend muestra página en blanco

```bash
# Verificar build
cd frontend
npm run build

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

© 2024 Policía Boliviana - Departamento de Inteligencia Criminal D-2

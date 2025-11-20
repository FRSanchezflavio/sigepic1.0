const app = require('./app');
const logger = require('./utils/logger');
const { PrismaClient } = require('@prisma/client');
const createUploadDirs = require('./utils/createUploadDirs');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Crear directorios de uploads
createUploadDirs();

// Manejo de errores no capturados
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Iniciar servidor
async function startServer() {
  try {
    // Verificar conexión a BD
    await prisma.$connect();
    logger.info('✅ Conectado a PostgreSQL');

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
      logger.info(`📡 API disponible en http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = async signal => {
      logger.info(`\n${signal} recibido, cerrando servidor...`);

      server.close(async () => {
        logger.info('Servidor HTTP cerrado');
        await prisma.$disconnect();
        logger.info('Conexión a BD cerrada');
        process.exit(0);
      });

      // Forzar cierre después de 10s
      setTimeout(() => {
        logger.error('Forzando cierre...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();

/**
 * Script para desbloquear el usuario admin
 * Ejecutar desde el directorio backend:
 * node scripts/desbloquear-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function desbloquearAdmin() {
  console.log('🔓 Desbloqueando usuario admin...\n');

  try {
    // Buscar el usuario admin
    const admin = await prisma.usuario.findUnique({
      where: { username: 'admin' },
    });

    if (!admin) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    console.log('📋 Estado actual del usuario admin:');
    console.log(`   - Username: ${admin.username}`);
    console.log(`   - Activo: ${admin.activo}`);
    console.log(`   - Intentos fallidos: ${admin.intentosFallidos}`);
    console.log(`   - Bloqueado hasta: ${admin.bloqueadoHasta || 'No bloqueado'}`);
    console.log('');

    // Desbloquear
    await prisma.usuario.update({
      where: { username: 'admin' },
      data: {
        bloqueadoHasta: null,
        intentosFallidos: 0,
        activo: true,
      },
    });

    console.log('✅ Usuario admin desbloqueado exitosamente!');
    console.log('');
    console.log('📝 Credenciales:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: Admin123!');
    console.log('');
    console.log('Ahora puede iniciar sesión nuevamente.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

desbloquearAdmin();

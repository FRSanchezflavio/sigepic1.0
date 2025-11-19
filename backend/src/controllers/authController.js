const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { generateToken } = require('../config/jwt');
const logger = require('../utils/logger');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { username },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Verificar si está bloqueado
    if (usuario.bloqueadoHasta && new Date() < usuario.bloqueadoHasta) {
      return res.status(403).json({
        error: 'Usuario bloqueado temporalmente',
        bloqueadoHasta: usuario.bloqueadoHasta,
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValida) {
      // Incrementar intentos fallidos
      const intentos = usuario.intentosFallidos + 1;
      const maxIntentos = parseInt(process.env.MAX_INTENTOS_LOGIN) || 3;

      const updateData = {
        intentosFallidos: intentos,
      };

      // Bloquear si excede intentos
      if (intentos >= maxIntentos) {
        const tiempoBloqueo = parseInt(process.env.TIEMPO_BLOQUEO) || 30;
        updateData.bloqueadoHasta = new Date(
          Date.now() + tiempoBloqueo * 60 * 1000
        );
      }

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: updateData,
      });

      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Login exitoso - resetear intentos
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        intentosFallidos: 0,
        bloqueadoHasta: null,
        ultimoAcceso: new Date(),
      },
    });

    // Generar token
    const token = generateToken({
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
    });

    // Crear sesión
    await prisma.sesion.create({
      data: {
        usuarioId: usuario.id,
        token,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown',
        expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });

    logger.info(`Login exitoso: ${username}`, { ip: req.ip });

    res.json({
      token,
      user: {
        id: usuario.id,
        username: usuario.username,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol,
        cambiarPassword: usuario.cambiarPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.substring(7);

    if (token) {
      await prisma.sesion.updateMany({
        where: { token, activo: true },
        data: { activo: false },
      });
    }

    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    next(error);
  }
};

const cambiarPassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const usuarioId = req.user.id;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(
      passwordActual,
      usuario.passwordHash
    );
    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hashear nueva contraseña
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const nuevoHash = await bcrypt.hash(passwordNueva, bcryptRounds);

    // Actualizar
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        passwordHash: nuevoHash,
        cambiarPassword: false,
      },
    });

    logger.info(`Contraseña cambiada: ${usuario.username}`);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    next(error);
  }
};

const perfil = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        ultimoAcceso: true,
        createdAt: true,
      },
    });

    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  cambiarPassword,
  perfil,
};

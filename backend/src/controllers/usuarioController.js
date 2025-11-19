const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const logger = require('../utils/logger');

const listar = async (req, res, next) => {
  try {
    const { activo, rol, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (rol) where.rol = rol;

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          username: true,
          nombreCompleto: true,
          email: true,
          rol: true,
          activo: true,
          ultimoAcceso: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ]);

    res.json({
      data: usuarios,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const { password, ...datos } = req.body;

    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, bcryptRounds);

    const usuario = await prisma.usuario.create({
      data: {
        ...datos,
        passwordHash,
        cambiarPassword: true,
      },
      select: {
        id: true,
        username: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        activo: true,
      },
    });

    logger.info(`Usuario creado: ${usuario.username}`, {
      creador: req.user.username,
    });

    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    if (datos.password) {
      const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      datos.passwordHash = await bcrypt.hash(datos.password, bcryptRounds);
      delete datos.password;
    }

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: datos,
      select: {
        id: true,
        username: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        activo: true,
      },
    });

    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;

    // No permitir eliminar el propio usuario
    if (parseInt(id) === req.user.id) {
      return res
        .status(400)
        .json({ error: 'No puedes eliminar tu propio usuario' });
    }

    await prisma.usuario.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listar,
  crear,
  actualizar,
  eliminar,
};

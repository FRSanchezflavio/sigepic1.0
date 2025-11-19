const prisma = require('../config/database');

const listar = async (req, res, next) => {
  try {
    const {
      tabla,
      usuarioId,
      fechaDesde,
      fechaHasta,
      page = 1,
      limit = 50,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (tabla) where.tabla = tabla;
    if (usuarioId) where.usuarioId = parseInt(usuarioId);
    if (fechaDesde || fechaHasta) {
      where.timestamp = {};
      if (fechaDesde) where.timestamp.gte = new Date(fechaDesde);
      if (fechaHasta) where.timestamp.lte = new Date(fechaHasta);
    }

    const [auditoria, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: 'desc' },
        include: {
          usuario: {
            select: {
              username: true,
              nombreCompleto: true,
            },
          },
        },
      }),
      prisma.auditoria.count({ where }),
    ]);

    res.json({
      data: auditoria,
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

module.exports = {
  listar,
};

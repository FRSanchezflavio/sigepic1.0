const prisma = require('../config/database');

const listar = async (req, res, next) => {
  try {
    const { tipo, activo = 'true' } = req.query;

    const where = {};
    if (tipo) where.tipo = tipo;
    if (activo !== 'all') where.activo = activo === 'true';

    const jerarquias = await prisma.jerarquia.findMany({
      where,
      orderBy: [{ tipo: 'asc' }, { orden: 'asc' }],
    });

    res.json(jerarquias);
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const jerarquia = await prisma.jerarquia.create({
      data: req.body,
    });

    res.status(201).json(jerarquia);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const jerarquia = await prisma.jerarquia.update({
      where: { id: parseInt(id) },
      data: req.body,
    });

    res.json(jerarquia);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.jerarquia.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Jerarquía eliminada' });
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

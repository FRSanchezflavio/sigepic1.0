const prisma = require('../config/database');

const listar = async (req, res, next) => {
  try {
    const { activo = 'true' } = req.query;

    const where = activo !== 'all' ? { activo: activo === 'true' } : {};

    const secciones = await prisma.seccion.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });

    res.json(secciones);
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const seccion = await prisma.seccion.create({
      data: req.body,
    });

    res.status(201).json(seccion);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const seccion = await prisma.seccion.update({
      where: { id: parseInt(id) },
      data: req.body,
    });

    res.json(seccion);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.seccion.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Sección eliminada' });
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

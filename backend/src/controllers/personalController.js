const prisma = require('../config/database');
const logger = require('../utils/logger');

const buscar = async (req, res, next) => {
  try {
    const {
      search = '',
      tipoPersonal,
      jerarquia,
      seccion,
      estadoServicio,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtros
    const where = {};

    if (search) {
      where.OR = [
        { apellidos: { contains: search, mode: 'insensitive' } },
        { nombres: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
        { numeroAsignacion: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tipoPersonal) where.tipoPersonal = tipoPersonal;
    if (jerarquia) where.jerarquia = jerarquia;
    if (seccion) where.seccion = seccion;
    if (estadoServicio) where.estadoServicio = estadoServicio;

    // Consultar
    const [personal, total] = await Promise.all([
      prisma.personal.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          apellidos: true,
          nombres: true,
          numeroAsignacion: true,
          dni: true,
          tipoPersonal: true,
          jerarquia: true,
          cargo: true,
          seccion: true,
          estadoServicio: true,
          fotoUrl: true,
          createdAt: true,
        },
      }),
      prisma.personal.count({ where }),
    ]);

    res.json({
      data: personal,
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

const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const personal = await prisma.personal.findUnique({
      where: { id: parseInt(id) },
      include: {
        licencias: {
          orderBy: { fechaInicio: 'desc' },
          take: 10,
        },
        capacitaciones: {
          orderBy: { fechaInicio: 'desc' },
          take: 10,
        },
        sanciones: {
          orderBy: { fecha: 'desc' },
          take: 10,
        },
      },
    });

    if (!personal) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }

    res.json(personal);
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const datos = req.body;
    const usuarioId = req.user.id;

    const personal = await prisma.personal.create({
      data: {
        ...datos,
        createdBy: usuarioId,
      },
    });

    // Registrar auditoría
    await prisma.auditoria.create({
      data: {
        tabla: 'personal',
        registroId: personal.id,
        accion: 'CREATE',
        cambios: datos,
        usuarioId,
        personalId: personal.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    logger.info(`Personal creado: ${personal.id}`, {
      usuario: req.user.username,
    });

    res.status(201).json(personal);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = req.body;
    const usuarioId = req.user.id;

    // Obtener datos anteriores
    const anterior = await prisma.personal.findUnique({
      where: { id: parseInt(id) },
    });

    if (!anterior) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }

    // Actualizar
    const personal = await prisma.personal.update({
      where: { id: parseInt(id) },
      data: {
        ...datos,
        updatedBy: usuarioId,
      },
    });

    // Registrar auditoría
    await prisma.auditoria.create({
      data: {
        tabla: 'personal',
        registroId: personal.id,
        accion: 'UPDATE',
        cambios: {
          anterior: anterior,
          nuevo: datos,
        },
        usuarioId,
        personalId: personal.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    logger.info(`Personal actualizado: ${personal.id}`, {
      usuario: req.user.username,
    });

    res.json(personal);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const personal = await prisma.personal.findUnique({
      where: { id: parseInt(id) },
    });

    if (!personal) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }

    // Eliminar
    await prisma.personal.delete({
      where: { id: parseInt(id) },
    });

    // Registrar auditoría
    await prisma.auditoria.create({
      data: {
        tabla: 'personal',
        registroId: parseInt(id),
        accion: 'DELETE',
        cambios: personal,
        usuarioId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    logger.info(`Personal eliminado: ${id}`, { usuario: req.user.username });

    res.json({ message: 'Personal eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

const estadisticas = async (req, res, next) => {
  try {
    const [totalActivos, totalInactivos, porTipo, porJerarquia, porSeccion] =
      await Promise.all([
        prisma.personal.count({ where: { estadoServicio: 'ACTIVO' } }),
        prisma.personal.count({ where: { estadoServicio: { not: 'ACTIVO' } } }),
        prisma.personal.groupBy({
          by: ['tipoPersonal'],
          _count: true,
        }),
        prisma.personal.groupBy({
          by: ['jerarquia'],
          _count: true,
          orderBy: { _count: { jerarquia: 'desc' } },
          take: 10,
        }),
        prisma.personal.groupBy({
          by: ['seccion'],
          _count: true,
          where: { seccion: { not: null } },
          orderBy: { _count: { seccion: 'desc' } },
          take: 10,
        }),
      ]);

    res.json({
      totalActivos,
      totalInactivos,
      porTipo,
      porJerarquia,
      porSeccion,
    });
  } catch (error) {
    next(error);
  }
};

const subirFoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const fotoUrl = `/uploads/fotos/${req.file.filename}`;

    const personal = await prisma.personal.update({
      where: { id: parseInt(id) },
      data: { fotoUrl },
    });

    res.json({ fotoUrl: personal.fotoUrl });
  } catch (error) {
    next(error);
  }
};

const subirArchivos = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const archivos = req.files.map(file => ({
      nombre: file.originalname,
      url: `/uploads/documentos/${file.filename}`,
      tipo: file.mimetype,
      tamano: file.size,
      fecha: new Date(),
    }));

    const personal = await prisma.personal.findUnique({
      where: { id: parseInt(id) },
    });

    const archivosActuales = personal.archivosAdjuntos || [];
    const archivosNuevos = [...archivosActuales, ...archivos];

    await prisma.personal.update({
      where: { id: parseInt(id) },
      data: { archivosAdjuntos: archivosNuevos },
    });

    res.json({ archivos: archivosNuevos });
  } catch (error) {
    next(error);
  }
};

const obtenerHistorial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const historial = await prisma.auditoria.findMany({
      where: { personalId: parseInt(id) },
      orderBy: { timestamp: 'desc' },
      include: {
        usuario: {
          select: {
            username: true,
            nombreCompleto: true,
          },
        },
      },
    });

    res.json(historial);
  } catch (error) {
    next(error);
  }
};

const generarPlanillas = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const pdfService = require('../services/pdfService');

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de IDs' });
    }

    // Obtener personal
    const personal = await prisma.personal.findMany({
      where: { id: { in: ids.map(id => parseInt(id)) } },
      include: {
        jerarquia: true,
        seccion: true,
      },
    });

    if (personal.length === 0) {
      return res.status(404).json({ error: 'No se encontró personal' });
    }

    // Generar PDF
    const { filePath, fileName } = await pdfService.generarPlanillasPersonal(personal);

    // Enviar archivo
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error al enviar archivo:', err);
        next(err);
      }
      // Opcional: eliminar archivo después de enviarlo
      // fs.unlinkSync(filePath);
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buscar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  estadisticas,
  subirFoto,
  subirArchivos,
  obtenerHistorial,
  generarPlanillas,
};

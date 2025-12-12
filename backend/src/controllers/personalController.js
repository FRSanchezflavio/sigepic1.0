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

    console.log('Datos recibidos:', datos);
    console.log('Archivos recibidos:', req.files);

    // Convertir valores booleanos desde FormData (vienen como strings)
    const booleanFields = [
      'conduceAutos',
      'conduceMotos',
      'conduceOtros',
      'poseeCarnetManejo',
      'poseeCredencialPolicial',
      'poseeChalecoAsignado',
    ];

    booleanFields.forEach(field => {
      if (datos[field] !== undefined) {
        datos[field] = datos[field] === 'true' || datos[field] === true;
      }
    });

    // Asignar jerarquia desde jerarquiaId si existe
    if (datos.jerarquiaId) {
      datos.jerarquia = datos.jerarquiaId;
    }

    // Asignar seccion desde seccionId si existe
    if (datos.seccionId) {
      datos.seccion = datos.seccionId;
    }

    // Manejar foto si se subió (viene de req.files.foto)
    if (req.files && req.files.foto && req.files.foto[0]) {
      datos.fotoUrl = `/uploads/fotos/${req.files.foto[0].filename}`;
    }

    // Manejar archivos adjuntos si se subieron
    if (req.files && req.files.archivos && req.files.archivos.length > 0) {
      const archivos = req.files.archivos.map(file => ({
        nombre: file.originalname,
        url: `/uploads/documentos/${file.filename}`,
        tipo: file.mimetype,
        tamano: file.size,
        fecha: new Date(),
      }));
      datos.archivosAdjuntos = archivos;
    }

    // Manejar contactos adicionales (viene como JSON string desde FormData)
    if (datos.contactosAdicionales) {
      try {
        datos.contactosAdicionales = JSON.parse(datos.contactosAdicionales);
      } catch (e) {
        console.error('Error parsing contactosAdicionales:', e);
        datos.contactosAdicionales = [];
      }
    }

    // Limpiar campos vacíos o null (excepto booleanos que pueden ser false)
    Object.keys(datos).forEach(key => {
      if (
        datos[key] === '' ||
        datos[key] === 'null' ||
        datos[key] === 'undefined'
      ) {
        delete datos[key];
      }
    });

    console.log('Datos procesados para crear:', datos);

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
    console.error('Error completo al crear personal:', error);
    logger.error('Error al crear personal:', error);
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

    // Convertir valores booleanos desde FormData (vienen como strings)
    const booleanFields = [
      'conduceAutos',
      'conduceMotos',
      'conduceOtros',
      'poseeCarnetManejo',
      'poseeCredencialPolicial',
      'poseeChalecoAsignado',
    ];

    booleanFields.forEach(field => {
      if (datos[field] !== undefined) {
        datos[field] = datos[field] === 'true' || datos[field] === true;
      }
    });

    // Asignar jerarquia desde jerarquiaId si existe
    if (datos.jerarquiaId) {
      datos.jerarquia = datos.jerarquiaId;
    }

    // Asignar seccion desde seccionId si existe
    if (datos.seccionId) {
      datos.seccion = datos.seccionId;
    }

    // Manejar foto si se subió
    if (req.files && req.files.foto && req.files.foto[0]) {
      datos.fotoUrl = `/uploads/fotos/${req.files.foto[0].filename}`;
    }

    // Manejar archivos adjuntos nuevos
    if (req.files && req.files.archivos && req.files.archivos.length > 0) {
      const nuevosArchivos = req.files.archivos.map(file => ({
        nombre: file.originalname,
        url: `/uploads/documentos/${file.filename}`,
        tipo: file.mimetype,
        tamano: file.size,
        fecha: new Date(),
      }));
      
      // Combinar con archivos existentes si se desea mantenerlos
      // Nota: La lógica actual en frontend no envía los archivos existentes de vuelta,
      // solo los nuevos. Para mantener los viejos, deberíamos obtenerlos del registro anterior
      // y concatenar.
      const archivosAnteriores = anterior.archivosAdjuntos && Array.isArray(anterior.archivosAdjuntos) 
        ? anterior.archivosAdjuntos 
        : [];
      
      datos.archivosAdjuntos = [...archivosAnteriores, ...nuevosArchivos];
    }

    // Manejar contactos adicionales (viene como JSON string desde FormData)
    if (datos.contactosAdicionales) {
      try {
        datos.contactosAdicionales = JSON.parse(datos.contactosAdicionales);
      } catch (e) {
        console.error('Error parsing contactosAdicionales:', e);
        // Mantener los contactos anteriores si hay error
        datos.contactosAdicionales = anterior.contactosAdicionales || [];
      }
    }

    // Limpiar campos vacíos o null (excepto booleanos)
    Object.keys(datos).forEach(key => {
      if (
        datos[key] === '' ||
        datos[key] === 'null' ||
        datos[key] === 'undefined'
      ) {
        delete datos[key];
      }
    });

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
    console.error('Error al actualizar personal:', error);
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
    });

    if (personal.length === 0) {
      return res.status(404).json({ error: 'No se encontró personal' });
    }

    // Generar PDF
    const { filePath, fileName } = await pdfService.generarPlanillasPersonal(
      personal
    );

    // Enviar archivo
    res.download(filePath, fileName, err => {
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

const exportar = async (req, res, next) => {
  try {
    const {
      search = '',
      tipoPersonal,
      jerarquia,
      seccion,
      estadoServicio,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Construir filtros (reutilizando lógica de buscar)
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

    const personal = await prisma.personal.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      select: {
        numeroAsignacion: true,
        apellidos: true,
        nombres: true,
        dni: true,
        jerarquia: true,
        seccion: true,
        estadoServicio: true,
        cargo: true,
        tipoPersonal: true,
      },
    });

    // Generar CSV
    const campos = [
      'N° Asignación',
      'Apellidos',
      'Nombres',
      'DNI',
      'Jerarquía',
      'Sección',
      'Estado',
      'Cargo',
      'Tipo Personal',
    ];

    let csvContent = campos.join(',') + '\n';

    personal.forEach(p => {
      const row = [
        p.numeroAsignacion || '',
        `"${p.apellidos}"`,
        `"${p.nombres}"`,
        p.dni,
        p.jerarquia || '',
        p.seccion || '',
        p.estadoServicio,
        p.cargo || '',
        p.tipoPersonal || '',
      ];
      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=personal_export.csv'
    );
    res.status(200).send(csvContent);
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
  exportar,
};

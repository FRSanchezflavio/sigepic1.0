const { verifyToken } = require('../config/jwt');
const { AppError } = require('./errorHandler');

const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token no proporcionado', 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    if (
      error.message === 'Token inválido' ||
      error.message === 'jwt malformed'
    ) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.message === 'jwt expired') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    next(error);
  }
};

const verificarPermiso = (recurso, accion) => {
  return (req, res, next) => {
    const { rol } = req.user;

    const permisos = {
      admin: {
        personal: ['create', 'read', 'update', 'delete'],
        jerarquia: ['create', 'read', 'update', 'delete'],
        seccion: ['create', 'read', 'update', 'delete'],
        usuario: ['create', 'read', 'update', 'delete'],
        auditoria: ['read'],
        reporte: ['read', 'create'],
      },
      supervisor: {
        personal: ['create', 'read', 'update'],
        jerarquia: ['read'],
        seccion: ['read'],
        usuario: ['read'],
        auditoria: ['read'],
        reporte: ['read', 'create'],
      },
      usuario: {
        personal: ['read'],
        jerarquia: ['read'],
        seccion: ['read'],
        usuario: ['read'],
        reporte: ['read'],
      },
      auditor: {
        personal: ['read'],
        jerarquia: ['read'],
        seccion: ['read'],
        usuario: ['read'],
        auditoria: ['read'],
        reporte: ['read'],
      },
    };

    const permisosRol = permisos[rol];

    if (!permisosRol) {
      return res.status(403).json({ error: 'Rol no válido' });
    }

    const permisosRecurso = permisosRol[recurso];

    if (!permisosRecurso || !permisosRecurso.includes(accion)) {
      return res
        .status(403)
        .json({ error: 'No tiene permisos para esta acción' });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarPermiso,
};

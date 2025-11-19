const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personalController');
const {
  verificarToken,
  verificarPermiso,
} = require('../middlewares/authMiddleware');
const { validarDatos } = require('../middlewares/validator');
const {
  schemaPersonal,
  schemaPersonalActualizar,
} = require('../utils/validators');
const {
  uploadFoto,
  uploadArchivos,
} = require('../middlewares/uploadMiddleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/personal - Buscar/Listar personal
router.get(
  '/',
  verificarPermiso('personal', 'read'),
  personalController.buscar
);

// GET /api/personal/estadisticas
router.get(
  '/estadisticas',
  verificarPermiso('personal', 'read'),
  personalController.estadisticas
);

// POST /api/personal/planillas - Generar planillas PDF
router.post(
  '/planillas',
  verificarPermiso('personal', 'read'),
  personalController.generarPlanillas
);

// GET /api/personal/:id - Obtener por ID
router.get(
  '/:id',
  verificarPermiso('personal', 'read'),
  personalController.obtenerPorId
);

// POST /api/personal - Crear nuevo
router.post(
  '/',
  verificarPermiso('personal', 'create'),
  validarDatos(schemaPersonal),
  personalController.crear
);

// PUT /api/personal/:id - Actualizar
router.put(
  '/:id',
  verificarPermiso('personal', 'update'),
  validarDatos(schemaPersonalActualizar),
  personalController.actualizar
);

// DELETE /api/personal/:id - Eliminar
router.delete(
  '/:id',
  verificarPermiso('personal', 'delete'),
  personalController.eliminar
);

// POST /api/personal/:id/foto - Subir foto
router.post(
  '/:id/foto',
  verificarPermiso('personal', 'update'),
  uploadFoto,
  personalController.subirFoto
);

// POST /api/personal/:id/archivos - Subir archivos
router.post(
  '/:id/archivos',
  verificarPermiso('personal', 'update'),
  uploadArchivos,
  personalController.subirArchivos
);

// GET /api/personal/:id/historial - Historial de cambios
router.get(
  '/:id/historial',
  verificarPermiso('auditoria', 'read'),
  personalController.obtenerHistorial
);

module.exports = router;

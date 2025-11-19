const express = require('express');
const router = express.Router();
const seccionController = require('../controllers/seccionController');
const {
  verificarToken,
  verificarPermiso,
} = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', verificarPermiso('seccion', 'read'), seccionController.listar);

router.post(
  '/',
  verificarPermiso('seccion', 'create'),
  seccionController.crear
);

router.put(
  '/:id',
  verificarPermiso('seccion', 'update'),
  seccionController.actualizar
);

router.delete(
  '/:id',
  verificarPermiso('seccion', 'delete'),
  seccionController.eliminar
);

module.exports = router;

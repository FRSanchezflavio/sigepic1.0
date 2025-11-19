const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const {
  verificarToken,
  verificarPermiso,
} = require('../middlewares/authMiddleware');
const { validarDatos } = require('../middlewares/validator');
const { schemaUsuario } = require('../utils/validators');

router.use(verificarToken);

router.get('/', verificarPermiso('usuario', 'read'), usuarioController.listar);

router.post(
  '/',
  verificarPermiso('usuario', 'create'),
  validarDatos(schemaUsuario),
  usuarioController.crear
);

router.put(
  '/:id',
  verificarPermiso('usuario', 'update'),
  usuarioController.actualizar
);

router.delete(
  '/:id',
  verificarPermiso('usuario', 'delete'),
  usuarioController.eliminar
);

module.exports = router;

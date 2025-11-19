const express = require('express');
const router = express.Router();
const jerarquiaController = require('../controllers/jerarquiaController');
const {
  verificarToken,
  verificarPermiso,
} = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get(
  '/',
  verificarPermiso('jerarquia', 'read'),
  jerarquiaController.listar
);

router.post(
  '/',
  verificarPermiso('jerarquia', 'create'),
  jerarquiaController.crear
);

router.put(
  '/:id',
  verificarPermiso('jerarquia', 'update'),
  jerarquiaController.actualizar
);

router.delete(
  '/:id',
  verificarPermiso('jerarquia', 'delete'),
  jerarquiaController.eliminar
);

module.exports = router;

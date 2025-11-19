const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');
const {
  verificarToken,
  verificarPermiso,
} = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get(
  '/',
  verificarPermiso('auditoria', 'read'),
  auditoriaController.listar
);

module.exports = router;

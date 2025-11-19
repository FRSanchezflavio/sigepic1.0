const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { validarDatos } = require('../middlewares/validator');
const { schemaLogin } = require('../utils/validators');
const { verificarToken } = require('../middlewares/authMiddleware');

// Login
router.post(
  '/login',
  loginLimiter,
  validarDatos(schemaLogin),
  authController.login
);

// Logout
router.post('/logout', verificarToken, authController.logout);

// Cambiar contraseña
router.post(
  '/cambiar-password',
  verificarToken,
  authController.cambiarPassword
);

// Perfil
router.get('/perfil', verificarToken, authController.perfil);

module.exports = router;

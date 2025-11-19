const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const personalRoutes = require('./personal.routes');
const jerarquiaRoutes = require('./jerarquia.routes');
const seccionRoutes = require('./seccion.routes');
const auditoriaRoutes = require('./auditoria.routes');
const usuarioRoutes = require('./usuario.routes');

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
router.use('/personal', personalRoutes);
router.use('/jerarquias', jerarquiaRoutes);
router.use('/secciones', seccionRoutes);
router.use('/auditoria', auditoriaRoutes);
router.use('/usuarios', usuarioRoutes);

module.exports = router;

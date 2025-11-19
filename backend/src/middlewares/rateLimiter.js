const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Limiter general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: 'Demasiadas peticiones, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit excedido', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Demasiadas peticiones, intenta más tarde',
    });
  },
});

// Limiter para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos por ventana
  skipSuccessfulRequests: true,
  message: 'Demasiados intentos de login, intenta más tarde',
});

// Limiter para creación
const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Límite de creación alcanzado, espera un minuto',
});

module.exports = {
  generalLimiter,
  loginLimiter,
  createLimiter,
};

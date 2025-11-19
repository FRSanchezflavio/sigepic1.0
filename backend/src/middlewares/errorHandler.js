const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
  });

  // Prisma Errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'campo';
    error.message = `El ${field} ya existe`;
    error.statusCode = 400;
  }

  if (err.code === 'P2025') {
    error.message = 'Registro no encontrado';
    error.statusCode = 404;
  }

  if (err.code === 'P2003') {
    error.message = 'Error de referencia en base de datos';
    error.statusCode = 400;
  }

  // Validation Errors
  if (err.name === 'ValidationError') {
    error.message = 'Error de validación';
    error.statusCode = 400;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token inválido';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expirado';
    error.statusCode = 401;
  }

  // Multer Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.message = 'Archivo muy grande';
      error.statusCode = 400;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error.message = 'Campo de archivo inesperado';
      error.statusCode = 400;
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler, AppError };

const Joi = require('joi');

const validarDatos = schema => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errores = error.details.map(detail => ({
        campo: detail.path.join('.'),
        mensaje: detail.message,
      }));

      return res.status(400).json({
        error: 'Error de validación',
        detalles: errores,
      });
    }

    next();
  };
};

module.exports = { validarDatos };

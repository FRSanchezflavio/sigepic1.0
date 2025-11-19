const Joi = require('joi');

// Schema para crear personal
const schemaPersonal = Joi.object({
  // Datos Personales
  apellidos: Joi.string().max(100).required().messages({
    'string.empty': 'Los apellidos son requeridos',
    'any.required': 'Los apellidos son requeridos',
  }),
  nombres: Joi.string().max(100).required().messages({
    'string.empty': 'Los nombres son requeridos',
    'any.required': 'Los nombres son requeridos',
  }),
  numeroAsignacion: Joi.string().max(50).required().messages({
    'string.empty': 'El número de asignación es requerido',
    'any.required': 'El número de asignación es requerido',
  }),
  dni: Joi.string().max(20).required().messages({
    'string.empty': 'El DNI es requerido',
    'any.required': 'El DNI es requerido',
  }),
  cuil: Joi.string().max(20).allow(null, ''),
  fechaNacimiento: Joi.date().required().messages({
    'date.base': 'Fecha de nacimiento inválida',
    'any.required': 'La fecha de nacimiento es requerida',
  }),
  estadoCivil: Joi.string().max(20).allow(null, ''),
  sexo: Joi.string().valid('MASCULINO', 'FEMENINO', 'OTRO').allow(null, ''),
  email: Joi.string().email().max(100).allow(null, ''),
  celular: Joi.string().max(50).allow(null, ''),
  domicilio: Joi.string().allow(null, ''),

  // Datos Jerárquicos
  tipoPersonal: Joi.string()
    .valid('SUPERIOR', 'SUBALTERNO')
    .required()
    .messages({
      'any.required': 'El tipo de personal es requerido',
      'any.only': 'El tipo de personal debe ser SUPERIOR o SUBALTERNO',
    }),
  jerarquiaId: Joi.number().integer().required().messages({
    'number.base': 'La jerarquía debe ser un número',
    'any.required': 'La jerarquía es requerida',
  }),
  numeroCargo: Joi.string().max(50).allow(null, ''),
  seccionId: Joi.number().integer().required().messages({
    'number.base': 'La sección debe ser un número',
    'any.required': 'La sección es requerida',
  }),
  cargo: Joi.string().max(100).allow(null, ''),
  funcionDepto: Joi.string().allow(null, ''),

  // Datos Laborales
  altaDependencia: Joi.date().allow(null),
  bajaDependencia: Joi.date().allow(null),
  motivoBaja: Joi.string().allow(null, ''),
  estadoServicio: Joi.string()
    .valid('ACTIVO', 'INACTIVO', 'RETIRADO', 'BAJA')
    .default('ACTIVO'),
  horarioLaboral: Joi.string().max(100).allow(null, ''),
  profesion: Joi.string().max(100).allow(null, ''),

  // Datos Administrativos
  subsidioSalud: Joi.string().max(50).allow(null, ''),
  prontuario: Joi.string().max(50).allow(null, ''),
  jurisdiccion: Joi.string().max(100).allow(null, ''),
  regional: Joi.string().max(100).allow(null, ''),

  // Equipamiento
  armaTipo: Joi.string().max(100).allow(null, ''),
  nroArma: Joi.string().max(50).allow(null, ''),
  chaleco: Joi.string().max(100).allow(null, ''),
  numeroChaleco: Joi.string().max(50).allow(null, ''),

  // Observaciones
  observaciones: Joi.string().allow(null, ''),
});

// Schema para actualizar personal
const schemaPersonalActualizar = Joi.object({
  apellidos: Joi.string().max(100),
  nombres: Joi.string().max(100),
  numeroAsignacion: Joi.string().max(50),
  dni: Joi.string().max(20),
  cuil: Joi.string().max(20).allow(null, ''),
  fechaNacimiento: Joi.date(),
  estadoCivil: Joi.string().max(20).allow(null, ''),
  sexo: Joi.string().valid('MASCULINO', 'FEMENINO', 'OTRO').allow(null, ''),
  email: Joi.string().email().max(100).allow(null, ''),
  celular: Joi.string().max(50).allow(null, ''),
  domicilio: Joi.string().allow(null, ''),
  tipoPersonal: Joi.string().valid('SUPERIOR', 'SUBALTERNO'),
  jerarquiaId: Joi.number().integer(),
  numeroCargo: Joi.string().max(50).allow(null, ''),
  seccionId: Joi.number().integer(),
  cargo: Joi.string().max(100).allow(null, ''),
  funcionDepto: Joi.string().allow(null, ''),
  altaDependencia: Joi.date().allow(null),
  bajaDependencia: Joi.date().allow(null),
  motivoBaja: Joi.string().allow(null, ''),
  estadoServicio: Joi.string().valid('ACTIVO', 'INACTIVO', 'RETIRADO', 'BAJA'),
  horarioLaboral: Joi.string().max(100).allow(null, ''),
  profesion: Joi.string().max(100).allow(null, ''),
  subsidioSalud: Joi.string().max(50).allow(null, ''),
  prontuario: Joi.string().max(50).allow(null, ''),
  jurisdiccion: Joi.string().max(100).allow(null, ''),
  regional: Joi.string().max(100).allow(null, ''),
  armaTipo: Joi.string().max(100).allow(null, ''),
  nroArma: Joi.string().max(50).allow(null, ''),
  chaleco: Joi.string().max(100).allow(null, ''),
  numeroChaleco: Joi.string().max(50).allow(null, ''),
  observaciones: Joi.string().allow(null, ''),
}).min(1);

// Schema para login
const schemaLogin = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'El usuario es requerido',
    'any.required': 'El usuario es requerido',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es requerida',
    'any.required': 'La contraseña es requerida',
  }),
});

// Schema para crear usuario
const schemaUsuario = Joi.object({
  username: Joi.string().max(50).required(),
  password: Joi.string().min(8).required(),
  nombreCompleto: Joi.string().max(150).allow(null, ''),
  email: Joi.string().email().max(100).allow(null, ''),
  rol: Joi.string()
    .valid('admin', 'supervisor', 'usuario', 'auditor')
    .default('usuario'),
});

module.exports = {
  schemaPersonal,
  schemaPersonalActualizar,
  schemaLogin,
  schemaUsuario,
};

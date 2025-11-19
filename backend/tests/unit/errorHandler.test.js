const {
  errorHandler,
  AppError,
} = require('../../src/middlewares/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test('debe manejar AppError correctamente', () => {
    const error = new AppError('Error personalizado', 400);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        message: 'Error personalizado',
      }),
    });
  });

  test('debe manejar errores de Prisma P2002 (unique constraint)', () => {
    const error = {
      code: 'P2002',
      meta: { target: ['email'] },
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        message: expect.stringContaining('Ya existe un registro'),
      }),
    });
  });

  test('debe manejar errores de Prisma P2025 (not found)', () => {
    const error = {
      code: 'P2025',
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('debe manejar errores genéricos como 500', () => {
    const error = new Error('Error genérico');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        message: 'Error interno del servidor',
      }),
    });
  });

  test('debe incluir stack trace en desarrollo', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Error de desarrollo');

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        stack: expect.any(String),
      }),
    });

    process.env.NODE_ENV = 'test';
  });
});

const { generarToken, verificarToken } = require('../../src/config/jwt');

describe('JWT Configuration', () => {
  const usuarioMock = {
    id: 1,
    usuario: 'testuser',
    rol: 'usuario',
  };

  test('debe generar un token válido', () => {
    const token = generarToken(usuarioMock);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('debe verificar un token válido', () => {
    const token = generarToken(usuarioMock);
    const decoded = verificarToken(token);

    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(usuarioMock.id);
    expect(decoded.usuario).toBe(usuarioMock.usuario);
    expect(decoded.rol).toBe(usuarioMock.rol);
  });

  test('debe lanzar error con token inválido', () => {
    expect(() => {
      verificarToken('token_invalido');
    }).toThrow();
  });

  test('debe incluir fecha de expiración', () => {
    const token = generarToken(usuarioMock);
    const decoded = verificarToken(token);

    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
  });
});

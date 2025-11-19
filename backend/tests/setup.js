// Setup para tests de Jest
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing';
process.env.DATABASE_URL =
  'postgresql://test_user:test_password@localhost:5432/test_db';

// Mock de console para reducir output en tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

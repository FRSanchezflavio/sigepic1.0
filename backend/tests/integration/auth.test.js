const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth.routes');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const prisma = new PrismaClient();

describe('Auth Routes Integration Tests', () => {
  let testUser;

  beforeAll(async () => {
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);

    testUser = await prisma.usuario.create({
      data: {
        usuario: 'testuser',
        password: hashedPassword,
        rol: 'usuario',
        personal: {
          create: {
            nombres: 'Test',
            apellidos: 'User',
            ci: '12345678',
            expedicion: 'LP',
            fecha_nacimiento: new Date('1990-01-01'),
            genero: 'M',
            fecha_ingreso: new Date(),
            jerarquia: {
              connect: { id: 1 },
            },
            seccion: {
              connect: { id: 1 },
            },
          },
        },
      },
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.sesion.deleteMany({ where: { usuarioId: testUser.id } });
    await prisma.personal.delete({ where: { id: testUser.personalId } });
    await prisma.usuario.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    test('debe hacer login con credenciales válidas', async () => {
      const response = await request(app).post('/api/auth/login').send({
        usuario: 'testuser',
        password: 'TestPassword123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.usuario.usuario).toBe('testuser');
    });

    test('debe rechazar credenciales inválidas', async () => {
      const response = await request(app).post('/api/auth/login').send({
        usuario: 'testuser',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('debe rechazar usuario inexistente', async () => {
      const response = await request(app).post('/api/auth/login').send({
        usuario: 'noexiste',
        password: 'Password123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});

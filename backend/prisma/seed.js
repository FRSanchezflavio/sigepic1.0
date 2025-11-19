const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds...');

  // 1. Usuario Administrador
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      nombreCompleto: 'Administrador del Sistema',
      email: 'admin@d2.gob.ar',
      rol: 'admin',
      activo: true,
    },
  });
  console.log('✅ Usuario admin creado');

  // 2. Jerarquías Superiores
  const jerarquiasSuperiores = [
    { nombre: 'Comisario General', orden: 1 },
    { nombre: 'Comisario Mayor', orden: 2 },
    { nombre: 'Comisario Inspector', orden: 3 },
    { nombre: 'Comisario', orden: 4 },
    { nombre: 'Subcomisario', orden: 5 },
    { nombre: 'Principal', orden: 6 },
  ];

  for (const jer of jerarquiasSuperiores) {
    await prisma.jerarquia.upsert({
      where: { nombre: jer.nombre },
      update: {},
      create: {
        tipo: 'SUPERIOR',
        nombre: jer.nombre,
        orden: jer.orden,
        activo: true,
      },
    });
  }
  console.log('✅ Jerarquías superiores creadas');

  // 3. Jerarquías Subalternas
  const jerarquiasSubalternas = [
    { nombre: 'Sargento', orden: 1 },
    { nombre: 'Cabo', orden: 2 },
    { nombre: 'Agente', orden: 3 },
  ];

  for (const jer of jerarquiasSubalternas) {
    await prisma.jerarquia.upsert({
      where: { nombre: jer.nombre },
      update: {},
      create: {
        tipo: 'SUBALTERNO',
        nombre: jer.nombre,
        orden: jer.orden,
        activo: true,
      },
    });
  }
  console.log('✅ Jerarquías subalternas creadas');

  // 4. Secciones
  const secciones = [
    { nombre: 'Análisis Criminal', codigo: 'AC-01' },
    { nombre: 'Inteligencia Operativa', codigo: 'IO-02' },
    { nombre: 'Investigaciones', codigo: 'INV-03' },
    { nombre: 'Tecnología y Comunicaciones', codigo: 'TEC-04' },
    { nombre: 'Administrativo', codigo: 'ADM-05' },
  ];

  for (const sec of secciones) {
    await prisma.seccion.upsert({
      where: { nombre: sec.nombre },
      update: {},
      create: {
        nombre: sec.nombre,
        codigo: sec.codigo,
        activo: true,
      },
    });
  }
  console.log('✅ Secciones creadas');

  // 5. Configuraciones iniciales
  const configs = [
    {
      clave: 'SISTEMA_NOMBRE',
      valor: 'SIGEPIC',
      descripcion: 'Nombre del sistema',
    },
    { clave: 'SISTEMA_VERSION', valor: '2.0.0', descripcion: 'Versión actual' },
    {
      clave: 'MAX_INTENTOS_LOGIN',
      valor: '3',
      tipo: 'number',
      descripcion: 'Intentos máximos de login',
    },
    {
      clave: 'TIEMPO_BLOQUEO',
      valor: '30',
      tipo: 'number',
      descripcion: 'Minutos de bloqueo tras intentos fallidos',
    },
    {
      clave: 'DIAS_EXPIRACION_PASSWORD',
      valor: '90',
      tipo: 'number',
      descripcion: 'Días para expiración de contraseña',
    },
  ];

  for (const config of configs) {
    await prisma.configuracion.upsert({
      where: { clave: config.clave },
      update: {},
      create: config,
    });
  }
  console.log('✅ Configuraciones creadas');

  // 6. Personal D-2 de Prueba
  const jerarquias = await prisma.jerarquia.findMany();
  const seccionesDb = await prisma.seccion.findMany();

  // Obtener IDs específicos
  const comisarioGeneral = jerarquias.find(j => j.nombre === 'Comisario General');
  const comisarioMayor = jerarquias.find(j => j.nombre === 'Comisario Mayor');
  const comisario = jerarquias.find(j => j.nombre === 'Comisario');
  const sargento = jerarquias.find(j => j.nombre === 'Sargento');
  const cabo = jerarquias.find(j => j.nombre === 'Cabo');
  const agente = jerarquias.find(j => j.nombre === 'Agente');

  const analisisCriminal = seccionesDb.find(s => s.nombre === 'Análisis Criminal');
  const inteligencia = seccionesDb.find(s => s.nombre === 'Inteligencia Operativa');
  const investigaciones = seccionesDb.find(s => s.nombre === 'Investigaciones');
  const tecnologia = seccionesDb.find(s => s.nombre === 'Tecnología y Comunicaciones');
  const administrativo = seccionesDb.find(s => s.nombre === 'Administrativo');

  const personalData = [
    {
      apellidos: 'GARCÍA LÓPEZ',
      nombres: 'JUAN CARLOS',
      dni: '28456123',
      cuil: '20-28456123-5',
      fechaNacimiento: new Date('1980-03-15'),
      sexo: 'M',
      estadoCivil: 'CASADO',
      profesion: 'Abogado',
      prontuario: 'P-2024-001',
      celular: '3814567890',
      email: 'jgarcia@d2.gob.ar',
      domicilio: 'Av. Belgrano 1234, San Miguel de Tucumán',
      numeroAsignacion: 'D2-SUP-001',
      tipoPersonal: 'SUPERIOR',
      jerarquiaId: comisarioGeneral?.id,
      jerarquia: 'Comisario General',
      numeroCargo: 'CG-001',
      seccionId: analisisCriminal?.id,
      seccion: 'Análisis Criminal',
      funcionDepto: 'Jefe de División Análisis Criminal',
      horarioLaboral: 'Lunes a Viernes 08:00-16:00',
      altaDependencia: new Date('2015-01-10'),
      jurisdiccion: 'Tucumán Capital',
      regional: 'Norte',
      estadoServicio: 'ACTIVO',
      subsidioSalud: 'OSECAC',
      arma: 'Pistola',
      numeroArma: 'ARM-001-2024',
    },
    {
      apellidos: 'FERNÁNDEZ DÍAZ',
      nombres: 'MARÍA VICTORIA',
      dni: '32789456',
      cuil: '27-32789456-3',
      fechaNacimiento: new Date('1985-07-22'),
      sexo: 'F',
      estadoCivil: 'SOLTERA',
      profesion: 'Licenciada en Criminalística',
      prontuario: 'P-2024-002',
      celular: '3815678901',
      email: 'mfernandez@d2.gob.ar',
      domicilio: 'Calle San Martín 567, Yerba Buena',
      numeroAsignacion: 'D2-SUP-002',
      tipoPersonal: 'SUPERIOR',
      jerarquiaId: comisarioMayor?.id,
      jerarquia: 'Comisario Mayor',
      numeroCargo: 'CM-002',
      seccionId: inteligencia?.id,
      seccion: 'Inteligencia Operativa',
      funcionDepto: 'Subjefe Inteligencia Operativa',
      horarioLaboral: 'Lunes a Viernes 08:00-16:00',
      altaDependencia: new Date('2018-03-20'),
      jurisdiccion: 'Tafí Viejo',
      regional: 'Norte',
      estadoServicio: 'ACTIVO',
      subsidioSalud: 'OSECAC',
      arma: 'Pistola',
      numeroArma: 'ARM-002-2024',
    },
    {
      apellidos: 'RODRÍGUEZ PÉREZ',
      nombres: 'CARLOS ALBERTO',
      dni: '30123789',
      cuil: '20-30123789-8',
      fechaNacimiento: new Date('1982-11-08'),
      sexo: 'M',
      estadoCivil: 'CASADO',
      profesion: 'Técnico en Informática',
      prontuario: 'P-2024-003',
      celular: '3816789012',
      email: 'crodriguez@d2.gob.ar',
      domicilio: 'Av. Aconquija 2345, San Miguel de Tucumán',
      numeroAsignacion: 'D2-SUP-003',
      tipoPersonal: 'SUPERIOR',
      jerarquiaId: comisario?.id,
      jerarquia: 'Comisario',
      numeroCargo: 'COM-003',
      seccionId: tecnologia?.id,
      seccion: 'Tecnología y Comunicaciones',
      funcionDepto: 'Responsable Tecnología',
      horarioLaboral: 'Lunes a Viernes 09:00-17:00',
      altaDependencia: new Date('2019-06-15'),
      jurisdiccion: 'Tucumán Capital',
      regional: 'Norte',
      estadoServicio: 'ACTIVO',
      subsidioSalud: null,
      arma: null,
      numeroArma: null,
    },
    {
      apellidos: 'MARTÍNEZ GÓMEZ',
      nombres: 'ROBERTO DANIEL',
      dni: '25678234',
      cuil: '20-25678234-1',
      fechaNacimiento: new Date('1977-05-30'),
      sexo: 'M',
      estadoCivil: 'DIVORCIADO',
      profesion: 'Técnico en Seguridad',
      prontuario: 'P-2024-004',
      celular: '3817890123',
      email: 'rmartinez@d2.gob.ar',
      domicilio: 'Calle Muñecas 890, Banda del Río Salí',
      numeroAsignacion: 'D2-SUB-004',
      tipoPersonal: 'SUBALTERNO',
      jerarquiaId: sargento?.id,
      jerarquia: 'Sargento',
      numeroCargo: 'SGT-004',
      seccionId: investigaciones?.id,
      seccion: 'Investigaciones',
      funcionDepto: 'Investigador de Campo',
      horarioLaboral: 'Guardias Rotativas 24hs',
      altaDependencia: new Date('2010-02-18'),
      jurisdiccion: 'Banda del Río Salí',
      regional: 'Norte',
      estadoServicio: 'ACTIVO',
      subsidioSalud: 'OSECAC',
      arma: 'Pistola',
      numeroArma: 'ARM-004-2024',
    },
    {
      apellidos: 'LÓPEZ SÁNCHEZ',
      nombres: 'ANA LAURA',
      dni: '34567890',
      cuil: '27-34567890-4',
      fechaNacimiento: new Date('1988-09-12'),
      sexo: 'F',
      estadoCivil: 'CASADA',
      profesion: 'Secundario Completo',
      prontuario: 'P-2024-005',
      celular: '3818901234',
      email: 'alopez@d2.gob.ar',
      domicilio: 'Av. Roca 1567, San Miguel de Tucumán',
      numeroAsignacion: 'D2-SUB-005',
      tipoPersonal: 'SUBALTERNO',
      jerarquiaId: cabo?.id,
      jerarquia: 'Cabo',
      numeroCargo: 'CBO-005',
      seccionId: administrativo?.id,
      seccion: 'Administrativo',
      funcionDepto: 'Asistente Administrativo',
      horarioLaboral: 'Lunes a Viernes 07:00-15:00',
      altaDependencia: new Date('2020-08-25'),
      jurisdiccion: 'Tucumán Capital',
      regional: 'Norte',
      estadoServicio: 'ACTIVO',
      subsidioSalud: 'OSECAC',
      arma: null,
      numeroArma: null,
    },
    {
      apellidos: 'GONZÁLEZ MORALES',
      nombres: 'DIEGO HERNÁN',
      dni: '36789012',
      cuil: '20-36789012-6',
      fechaNacimiento: new Date('1992-01-25'),
      sexo: 'M',
      estadoCivil: 'SOLTERO',
      profesion: 'Secundario Completo',
      prontuario: 'P-2024-006',
      celular: '3819012345',
      email: 'dgonzalez@d2.gob.ar',
      domicilio: 'Calle Junín 678, Concepción',
      numeroAsignacion: 'D2-SUB-006',
      tipoPersonal: 'SUBALTERNO',
      jerarquiaId: agente?.id,
      jerarquia: 'Agente',
      numeroCargo: 'AGT-006',
      seccionId: analisisCriminal?.id,
      seccion: 'Análisis Criminal',
      funcionDepto: 'Agente de Apoyo',
      horarioLaboral: 'Guardias Rotativas 12hs',
      altaDependencia: new Date('2022-11-10'),
      jurisdiccion: 'Concepción',
      regional: 'Sur',
      estadoServicio: 'ACTIVO',
      subsidioSalud: null,
      arma: 'Pistola',
      numeroArma: 'ARM-006-2024',
    },
    {
      apellidos: 'TORRES SILVA',
      nombres: 'GABRIELA BEATRIZ',
      dni: '29345678',
      cuil: '27-29345678-2',
      fechaNacimiento: new Date('1981-04-18'),
      sexo: 'F',
      estadoCivil: 'VIUDA',
      profesion: 'Licenciada en Psicología',
      prontuario: 'P-2024-007',
      celular: '3810123456',
      email: 'gtorres@d2.gob.ar',
      domicilio: 'Av. Mate de Luna 234, San Miguel de Tucumán',
      numeroAsignacion: 'D2-SUP-007',
      tipoPersonal: 'SUPERIOR',
      jerarquiaId: comisario?.id,
      jerarquia: 'Comisario',
      numeroCargo: 'COM-007',
      seccionId: inteligencia?.id,
      seccion: 'Inteligencia Operativa',
      funcionDepto: 'Analista de Perfiles',
      horarioLaboral: 'Lunes a Viernes 08:00-16:00',
      altaDependencia: new Date('2016-09-05'),
      jurisdiccion: 'Tucumán Capital',
      regional: 'Norte',
      estadoServicio: 'LICENCIA',
      subsidioSalud: 'OSECAC',
      arma: null,
      numeroArma: null,
    },
    {
      apellidos: 'RAMÍREZ CASTRO',
      nombres: 'JORGE LUIS',
      dni: '27890123',
      cuil: '20-27890123-9',
      fechaNacimiento: new Date('1979-12-03'),
      sexo: 'M',
      estadoCivil: 'CASADO',
      profesion: 'Contador Público',
      prontuario: 'P-2023-050',
      celular: '3811234567',
      email: 'jramirez@d2.gob.ar',
      domicilio: 'Calle Laprida 456, Tafí Viejo',
      numeroAsignacion: 'D2-SUP-008',
      tipoPersonal: 'SUPERIOR',
      jerarquiaId: comisarioMayor?.id,
      jerarquia: 'Comisario Mayor',
      numeroCargo: 'CM-008',
      seccionId: administrativo?.id,
      seccion: 'Administrativo',
      funcionDepto: 'Jefe Administrativo',
      horarioLaboral: 'Lunes a Viernes 08:00-16:00',
      altaDependencia: new Date('2014-04-12'),
      jurisdiccion: 'Tafí Viejo',
      regional: 'Norte',
      estadoServicio: 'RETIRADO',
      subsidioSalud: null,
      arma: null,
      numeroArma: null,
    },
  ];

  for (const persona of personalData) {
    await prisma.personal.create({
      data: persona,
    });
  }
  console.log('✅ Personal D-2 de prueba creado (8 registros)');

  console.log('✨ Seeds completados exitosamente');
}

main()
  .catch(e => {
    console.error('❌ Error en seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

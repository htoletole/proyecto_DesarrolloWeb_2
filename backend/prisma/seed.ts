// datos de prueba: se cargan con "npx prisma db seed"
// se puede correr varias veces, si el usuario ya existe no lo vuelve a crear
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { aFecha, aTexto, fechaHoyChile, periodoActual, sumarDias } from '../src/comun/fechas';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// los mismos usuarios de prueba del Taller 2
const USUARIOS = [
  { username: 'Pepe', password: 'pepe12345', conEjemplos: true },
  { username: 'Ana', password: 'ana123456', conEjemplos: false },
];

async function main() {
  for (const datos of USUARIOS) {
    const existe = await prisma.usuario.findUnique({ where: { username: datos.username } });
    if (existe) {
      console.log('El usuario ' + datos.username + ' ya existe, no se modifica');
      continue;
    }

    const password = await bcrypt.hash(datos.password, 10);
    const usuario = await prisma.usuario.create({ data: { username: datos.username, password } });

    const actual = periodoActual();
    const periodo = await prisma.periodo.create({
      data: { ...actual, usuarioId: usuario.id },
    });

    if (datos.conEjemplos) {
      await crearEjemplos(usuario.id, periodo.id, aTexto(periodo.fechaInicio), aTexto(periodo.fechaFin));
    }
    console.log('Usuario ' + datos.username + ' creado con el período ' + periodo.nombre);
  }
}

// ramos, evaluaciones, tareas y subtareas para mostrar la app funcionando
async function crearEjemplos(usuarioId: number, periodoId: number, inicio: string, fin: string) {
  const hoy = fechaHoyChile();

  // fecha a "n" dias de hoy, sin salirse del periodo
  function dia(n: number) {
    let fecha = sumarDias(hoy, n);
    if (fecha < inicio) {
      fecha = inicio;
    }
    if (fecha > fin) {
      fecha = fin;
    }
    return aFecha(fecha);
  }

  // momento del dia "n" a mediodia en Chile (para completadaEn)
  function momento(n: number) {
    return new Date(sumarDias(hoy, n) + 'T15:00:00.000Z');
  }

  const web = await prisma.asignatura.create({
    data: { codigo: 'CINF201', nombre: 'Desarrollo Web y Móvil', modalidad: 'PRESENCIAL', color: '#46937C', periodoId },
  });
  const calculo = await prisma.asignatura.create({
    data: { codigo: 'CMAT110', nombre: 'Cálculo II', modalidad: 'PRESENCIAL', color: '#65B5FD', periodoId },
  });
  const datos = await prisma.asignatura.create({
    data: { codigo: 'CINF250', nombre: 'Base de Datos', modalidad: 'ONLINE', color: '#FFAE52', periodoId },
  });

  const hito = await prisma.evaluacion.create({
    data: { nombre: 'Hito 3', tipo: 'PROYECTO', fecha: dia(5), ponderacion: 30, asignaturaId: web.id },
  });
  await prisma.evaluacion.create({
    data: { nombre: 'Taller 2', tipo: 'TRABAJO', fecha: dia(-30), ponderacion: 20, nota: 6.2, asignaturaId: web.id },
  });
  const solemne = await prisma.evaluacion.create({
    data: { nombre: 'Solemne 2', tipo: 'PRUEBA', fecha: dia(10), ponderacion: 35, asignaturaId: calculo.id },
  });
  await prisma.evaluacion.create({
    data: { nombre: 'Solemne 1', tipo: 'PRUEBA', fecha: dia(-40), ponderacion: 35, nota: 4.8, asignaturaId: calculo.id },
  });
  await prisma.evaluacion.create({
    data: { nombre: 'Control 3', tipo: 'CONTROL', fecha: dia(3), ponderacion: 15, asignaturaId: datos.id },
  });

  await prisma.tarea.create({
    data: {
      nombre: 'Backend con NestJS',
      descripcion: 'API REST con Prisma, MongoDB y Swagger',
      estado: 'EN_PROGRESO',
      prioridad: 'ALTA',
      fecha: dia(4),
      horaEntrega: '23:59',
      usuarioId,
      asignaturaId: web.id,
      evaluacionId: hito.id,
      subtareas: {
        create: [
          { nombre: 'Configurar Prisma con Neon', completada: true },
          { nombre: 'Endpoints de tareas', completada: false },
          { nombre: 'Documentar en Swagger', completada: false },
        ],
      },
    },
  });
  await prisma.tarea.create({
    data: { nombre: 'Guía de ejercicios 5', estado: 'PENDIENTE', prioridad: 'MEDIA', fecha: dia(2), usuarioId, asignaturaId: calculo.id },
  });
  await prisma.tarea.create({
    data: {
      nombre: 'Informe de normalización',
      descripcion: 'Llevar el modelo a tercera forma normal',
      estado: 'PENDIENTE',
      prioridad: 'URGENTE',
      fecha: dia(-1),
      usuarioId,
      asignaturaId: datos.id,
    },
  });
  await prisma.tarea.create({
    data: {
      nombre: 'Resumen para la solemne',
      estado: 'PENDIENTE',
      prioridad: 'ALTA',
      fecha: dia(8),
      usuarioId,
      asignaturaId: calculo.id,
      evaluacionId: solemne.id,
    },
  });
  await prisma.tarea.create({
    data: {
      nombre: 'Diagrama entidad-relación',
      estado: 'COMPLETADA',
      prioridad: 'BAJA',
      fecha: dia(-5),
      completadaEn: momento(-6),
      usuarioId,
      asignaturaId: datos.id,
    },
  });
  await prisma.tarea.create({
    data: {
      nombre: 'Wireframes en Figma',
      estado: 'COMPLETADA',
      prioridad: 'MEDIA',
      fecha: dia(-12),
      completadaEn: momento(-11),
      usuarioId,
      asignaturaId: web.id,
    },
  });
}

main()
  .catch((error) => {
    console.error('Error al cargar los datos de prueba:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// guarda y lee los ramos en la API, entregandolos con la misma forma que usa la pantalla de Ramos
import { pedir } from "./api";
import type { Ramo } from "../pages/Ramos";

// asi llega un ramo desde la API
interface RamoApi {
  id: number;
  codigo: string;
  nombre: string;
  modalidad: string;
  color: string;
  logo: string | null;
}

interface PeriodoApi {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

// la API guarda la modalidad en mayusculas y la pantalla la muestra con este texto
const MODALIDAD_TEXTO: Record<string, string> = {
  ONLINE: "Online",
  PRESENCIAL: "Presencial",
  ASINCRONICO: "Asincrónico",
};

const MODALIDAD_API: Record<string, string> = {
  Online: "ONLINE",
  Presencial: "PRESENCIAL",
  "Asincrónico": "ASINCRONICO",
};

// la pantalla identifica al ramo por su ID escrita (codigo); aqui se guarda el id de la base de cada uno
let idsEnLaBase: Record<string, number> = {};

function aRamo(ramo: RamoApi): Ramo {
  return {
    id: ramo.codigo,
    nombre: ramo.nombre,
    modalidad: MODALIDAD_TEXTO[ramo.modalidad] ?? ramo.modalidad,
    colorRamo: ramo.color,
    logo: ramo.logo ?? undefined,
  };
}

function datosParaApi(ramo: Ramo) {
  return {
    codigo: ramo.id,
    nombre: ramo.nombre,
    modalidad: MODALIDAD_API[ramo.modalidad] ?? ramo.modalidad,
    color: ramo.colorRamo,
    logo: ramo.logo ?? null,
  };
}

export async function listarRamos(): Promise<Ramo[]> {
  const lista = await pedir<RamoApi[]>("/asignaturas");

  idsEnLaBase = {};
  for (const ramo of lista) {
    idsEnLaBase[ramo.codigo] = ramo.id;
  }

  return lista.map(aRamo);
}

export async function crearRamo(ramo: Ramo): Promise<Ramo> {
  const periodoId = await periodoActual();
  const creado = await pedir<RamoApi>("/asignaturas", "POST", { ...datosParaApi(ramo), periodoId });
  idsEnLaBase[creado.codigo] = creado.id;
  return aRamo(creado);
}

// idAnterior es la ID que tenia el ramo antes de editarlo (por si el usuario la cambio)
export async function editarRamo(idAnterior: string, ramo: Ramo): Promise<Ramo> {
  const editado = await pedir<RamoApi>("/asignaturas/" + idsEnLaBase[idAnterior], "PATCH", datosParaApi(ramo));
  delete idsEnLaBase[idAnterior];
  idsEnLaBase[editado.codigo] = editado.id;
  return aRamo(editado);
}

// al eliminar un ramo, la base de datos tambien elimina sus tareas
export async function eliminarRamo(id: string): Promise<void> {
  await pedir<void>("/asignaturas/" + idsEnLaBase[id], "DELETE");
  delete idsEnLaBase[id];
}

// id en la base del ramo con ese nombre (lo usan las tareas, que guardan el nombre del ramo)
export async function buscarIdDeRamo(nombre: string): Promise<number> {
  const lista = await pedir<RamoApi[]>("/asignaturas");
  for (const ramo of lista) {
    if (ramo.nombre === nombre) {
      return ramo.id;
    }
  }
  throw new Error("El ramo " + nombre + " ya no existe.");
}

// la API pide que cada ramo pertenezca a un periodo: se usa el que esta en curso
async function periodoActual(): Promise<number> {
  const periodos = await pedir<PeriodoApi[]>("/periodos");
  const hoy = new Date().toISOString().slice(0, 10);

  for (const periodo of periodos) {
    if (periodo.fechaInicio.slice(0, 10) <= hoy && hoy <= periodo.fechaFin.slice(0, 10)) {
      return periodo.id;
    }
  }
  if (periodos.length > 0) {
    return periodos[0].id;
  }

  // si la cuenta no tiene ninguno, se crea el del semestre actual
  const anio = hoy.slice(0, 4);
  const segundoSemestre = Number(hoy.slice(5, 7)) >= 8;
  const nuevo = await pedir<PeriodoApi>("/periodos", "POST", {
    nombre: anio + (segundoSemestre ? "-2" : "-1"),
    fechaInicio: anio + (segundoSemestre ? "-08-01" : "-03-01"),
    fechaFin: anio + (segundoSemestre ? "-12-31" : "-07-31"),
  });
  return nuevo.id;
}

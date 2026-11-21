// datos de la agenda: tareas, subtareas, ramos y evaluaciones (todos vienen de la API del Hito 3)
import { pedir, soloFecha } from "./api";

// ---------- tipos ----------

export type Estado = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";

export type RamoCorto = {
  id: number;
  nombre: string;
  color: string;
};

export type Subtarea = {
  id: number;
  nombre: string;
  completada: boolean;
};

export type Tarea = {
  id: number;
  nombre: string;
  descripcion: string;
  estado: Estado;
  prioridad: string;
  fecha: string; // "AAAA-MM-DD" o "" si no tiene
  horaEntrega: string;
  ramo: RamoCorto;
  subtareas: Subtarea[];
};

export type Evaluacion = {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  ponderacion: number;
  nota: number | null;
  ramo: RamoCorto;
};

export type Ramo = {
  id: number;
  codigo: string;
  nombre: string;
  modalidad: string;
  modalidadValor: string; // como la guarda la API (PRESENCIAL, ONLINE...), para editar
  color: string;
  cantidadTareas: number;
  cantidadEvaluaciones: number;
};

export type Avance = {
  totalTareas: number;
  tareasCompletadas: number;
  porcentajeTareas: number;
  ponderacionTotal: number;
  ponderacionRendida: number;
  promedioParcial: number | null;
};

export type DetalleRamo = Ramo & {
  periodo: string;
  avance: Avance;
  evaluaciones: Evaluacion[];
  tareas: { id: number; nombre: string; estado: Estado; fecha: string }[];
};

// ---------- textos para mostrar ----------

export const ESTADOS: { valor: Estado; texto: string }[] = [
  { valor: "PENDIENTE", texto: "Pendiente" },
  { valor: "EN_PROGRESO", texto: "En progreso" },
  { valor: "COMPLETADA", texto: "Completada" },
];

export function textoEstado(estado: Estado): string {
  const encontrado = ESTADOS.find((e) => e.valor === estado);
  return encontrado ? encontrado.texto : estado;
}

export const PRIORIDADES_LISTA = [
  { valor: "BAJA", texto: "Baja" },
  { valor: "MEDIA", texto: "Media" },
  { valor: "ALTA", texto: "Alta" },
  { valor: "URGENTE", texto: "Urgente" },
];

const PRIORIDADES: Record<string, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export function textoPrioridad(prioridad: string): string {
  return PRIORIDADES[prioridad] ?? prioridad;
}

export const TIPOS_LISTA = [
  { valor: "PRUEBA", texto: "Prueba" },
  { valor: "CONTROL", texto: "Control" },
  { valor: "TRABAJO", texto: "Trabajo" },
  { valor: "PROYECTO", texto: "Proyecto" },
  { valor: "EXAMEN", texto: "Examen" },
  { valor: "PRESENTACION", texto: "Presentación" },
];

const TIPOS: Record<string, string> = {
  PRUEBA: "Prueba",
  CONTROL: "Control",
  TRABAJO: "Trabajo",
  PROYECTO: "Proyecto",
  EXAMEN: "Examen",
  PRESENTACION: "Presentación",
};

export function textoTipo(tipo: string): string {
  return TIPOS[tipo] ?? tipo;
}

const MODALIDADES: Record<string, string> = {
  ONLINE: "Online",
  PRESENCIAL: "Presencial",
  ASINCRONICO: "Asincrónico",
};

// ---------- tareas ----------

type TareaApi = {
  id: number;
  nombre: string;
  descripcion: string;
  estado: Estado;
  prioridad: string;
  fecha: string | null;
  horaEntrega: string | null;
  asignatura: RamoCorto;
  subtareas?: Subtarea[];
};

function aTarea(t: TareaApi): Tarea {
  return {
    id: t.id,
    nombre: t.nombre,
    descripcion: t.descripcion,
    estado: t.estado,
    prioridad: t.prioridad,
    fecha: soloFecha(t.fecha),
    horaEntrega: t.horaEntrega ?? "",
    ramo: { id: t.asignatura.id, nombre: t.asignatura.nombre, color: t.asignatura.color },
    subtareas: t.subtareas ?? [],
  };
}

export async function listarTareas(): Promise<Tarea[]> {
  const lista = await pedir<TareaApi[]>("/tareas");
  return lista.map(aTarea);
}

export async function obtenerTarea(id: number): Promise<Tarea> {
  return aTarea(await pedir<TareaApi>("/tareas/" + id));
}

// solo se manda el estado: la API deja igual el resto de los campos
export async function cambiarEstado(id: number, estado: Estado): Promise<Tarea> {
  return aTarea(await pedir<TareaApi>("/tareas/" + id, "PATCH", { estado }));
}

// datos que pide la API al crear o editar una tarea
export type DatosTarea = {
  nombre: string;
  descripcion: string;
  asignaturaId: number;
  estado: Estado;
  prioridad: string;
  fecha: string | null;
  horaEntrega: string | null;
};

export async function crearTarea(datos: DatosTarea): Promise<Tarea> {
  return aTarea(await pedir<TareaApi>("/tareas", "POST", datos));
}

export async function editarTarea(id: number, datos: DatosTarea): Promise<Tarea> {
  return aTarea(await pedir<TareaApi>("/tareas/" + id, "PATCH", datos));
}

export function eliminarTarea(id: number): Promise<void> {
  return pedir<void>("/tareas/" + id, "DELETE");
}

export function marcarSubtarea(id: number, completada: boolean): Promise<Subtarea> {
  return pedir<Subtarea>("/subtareas/" + id, "PATCH", { completada });
}

export function crearSubtarea(tareaId: number, nombre: string): Promise<Subtarea> {
  return pedir<Subtarea>("/tareas/" + tareaId + "/subtareas", "POST", { nombre });
}

// ---------- evaluaciones ----------

type EvaluacionApi = {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  ponderacion: number;
  nota: number | null;
  asignatura?: RamoCorto;
};

function aEvaluacion(e: EvaluacionApi, ramo?: RamoCorto): Evaluacion {
  return {
    id: e.id,
    nombre: e.nombre,
    tipo: e.tipo,
    fecha: soloFecha(e.fecha),
    ponderacion: e.ponderacion,
    nota: e.nota,
    ramo: e.asignatura ?? ramo ?? { id: 0, nombre: "", color: "#FFAE52" },
  };
}

// sin "desde" trae todas; con "desde" (AAAA-MM-DD) solo las de esa fecha en adelante
export async function listarEvaluaciones(desde?: string): Promise<Evaluacion[]> {
  const ruta = desde ? "/evaluaciones?desde=" + desde : "/evaluaciones";
  const lista = await pedir<EvaluacionApi[]>(ruta);
  return lista.map((e) => aEvaluacion(e));
}

export type DatosEvaluacion = {
  nombre: string;
  tipo: string;
  fecha: string;
  ponderacion: number;
  nota: number | null;
};

export async function crearEvaluacion(asignaturaId: number, datos: DatosEvaluacion): Promise<Evaluacion> {
  return aEvaluacion(await pedir<EvaluacionApi>("/evaluaciones", "POST", { ...datos, asignaturaId }));
}

// al editar no se cambia el ramo (la API no lo permite)
export async function editarEvaluacion(id: number, datos: DatosEvaluacion): Promise<Evaluacion> {
  return aEvaluacion(await pedir<EvaluacionApi>("/evaluaciones/" + id, "PATCH", datos));
}

export function eliminarEvaluacion(id: number): Promise<void> {
  return pedir<void>("/evaluaciones/" + id, "DELETE");
}

// ---------- ramos ----------

type RamoApi = {
  id: number;
  codigo: string;
  nombre: string;
  modalidad: string;
  color: string;
  _count?: { tareas: number; evaluaciones: number };
};

function aRamo(r: RamoApi): Ramo {
  return {
    id: r.id,
    codigo: r.codigo,
    nombre: r.nombre,
    modalidad: MODALIDADES[r.modalidad] ?? r.modalidad,
    modalidadValor: r.modalidad,
    color: r.color,
    cantidadTareas: r._count ? r._count.tareas : 0,
    cantidadEvaluaciones: r._count ? r._count.evaluaciones : 0,
  };
}

export async function listarRamos(): Promise<Ramo[]> {
  const lista = await pedir<RamoApi[]>("/asignaturas");
  return lista.map(aRamo);
}

export const MODALIDADES_LISTA = [
  { valor: "PRESENCIAL", texto: "Presencial" },
  { valor: "ONLINE", texto: "Online" },
  { valor: "ASINCRONICO", texto: "Asincrónico" },
];

export type DatosRamo = {
  codigo: string;
  nombre: string;
  modalidad: string;
  color: string;
};

type PeriodoApi = { id: number; nombre: string; fechaInicio: string; fechaFin: string };

// la API pide que cada ramo pertenezca a un periodo: se usa el que esta en curso (igual que la web)
async function periodoActual(): Promise<number> {
  const periodos = await pedir<PeriodoApi[]>("/periodos");
  const fechaHoy = new Date().toISOString().slice(0, 10);

  for (const periodo of periodos) {
    if (soloFecha(periodo.fechaInicio) <= fechaHoy && fechaHoy <= soloFecha(periodo.fechaFin)) {
      return periodo.id;
    }
  }
  if (periodos.length > 0) {
    return periodos[0].id;
  }

  // si la cuenta no tiene ninguno, se crea el del semestre actual
  const anio = fechaHoy.slice(0, 4);
  const segundoSemestre = Number(fechaHoy.slice(5, 7)) >= 8;
  const nuevo = await pedir<PeriodoApi>("/periodos", "POST", {
    nombre: anio + (segundoSemestre ? "-2" : "-1"),
    fechaInicio: anio + (segundoSemestre ? "-08-01" : "-03-01"),
    fechaFin: anio + (segundoSemestre ? "-12-31" : "-07-31"),
  });
  return nuevo.id;
}

export async function crearRamo(datos: DatosRamo): Promise<Ramo> {
  const periodoId = await periodoActual();
  return aRamo(await pedir<RamoApi>("/asignaturas", "POST", { ...datos, periodoId }));
}

export async function editarRamo(id: number, datos: DatosRamo): Promise<Ramo> {
  return aRamo(await pedir<RamoApi>("/asignaturas/" + id, "PATCH", datos));
}

// al eliminar un ramo, la base de datos tambien elimina sus tareas y evaluaciones
export function eliminarRamo(id: number): Promise<void> {
  return pedir<void>("/asignaturas/" + id, "DELETE");
}

type DetalleRamoApi = RamoApi & {
  periodo: { nombre: string };
  avance: Avance;
  evaluaciones: EvaluacionApi[];
  tareas: { id: number; nombre: string; estado: Estado; fecha: string | null }[];
};

export async function obtenerRamo(id: number): Promise<DetalleRamo> {
  const r = await pedir<DetalleRamoApi>("/asignaturas/" + id);
  const corto: RamoCorto = { id: r.id, nombre: r.nombre, color: r.color };
  return {
    ...aRamo(r),
    cantidadTareas: r.tareas.length,
    cantidadEvaluaciones: r.evaluaciones.length,
    periodo: r.periodo.nombre,
    avance: r.avance,
    evaluaciones: r.evaluaciones.map((e) => aEvaluacion(e, corto)),
    tareas: r.tareas.map((t) => ({ ...t, fecha: soloFecha(t.fecha) })),
  };
}

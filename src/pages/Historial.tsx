import { useEffect, useState } from "react";
import HeaderFixed from "../components/HeaderFixed";
import iconoInfo from "../assets/icons/info.png";
import {
  listarActividad,
  listarPlanificacion,
  listarReprogramadas,
} from "../services/historialApi";
import type { Actividad, EventoPlanificacion, Reprogramada } from "../services/historialApi";
import { fechaCorta } from "../services/fechas";
import { useSesion } from "../services/useSesion";
import "../styles/tareas.css";
import "../styles/historial.css";

type Vista = "actividad" | "planificacion";

const ACCIONES: Record<string, string> = {
  CREAR: "Creado",
  EDITAR: "Editado",
  ELIMINAR: "Eliminado",
  COMPLETAR: "Completado",
  INGRESAR: "Ingreso",
};

const ENTIDADES: Record<string, string> = {
  tarea: "Tarea",
  subtarea: "Subtarea",
  asignatura: "Ramo",
  evaluacion: "Evaluación",
  periodo: "Período",
  usuario: "Cuenta",
};

// nombres de los campos que pueden cambiar, para mostrarlos mas claro
const CAMPOS: Record<string, string> = {
  nombre: "Nombre",
  descripcion: "Descripción",
  estado: "Estado",
  prioridad: "Prioridad",
  fecha: "Fecha",
  horaEntrega: "Hora",
  codigo: "ID",
  modalidad: "Modalidad",
  color: "Color",
  tipo: "Tipo",
  ponderacion: "Ponderación",
  nota: "Nota",
  completada: "Completada",
  fechaInicio: "Inicio",
  fechaFin: "Término",
};

// "2026-11-12T17:32:10.000Z" -> "12/11/2026 14:32" (hora de Chile del navegador)
function fechaHora(texto: string): string {
  const fecha = new Date(texto);
  const dia = fecha.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = fecha.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  return dia.replaceAll("-", "/") + " " + hora;
}

function valorTexto(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "vacío";
  if (valor === true) return "sí";
  if (valor === false) return "no";
  const texto = String(valor);
  // las fechas AAAA-MM-DD se muestran como DD/MM/AAAA
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return fechaCorta(texto);
  return texto;
}

function textoEvento(evento: EventoPlanificacion): string {
  if (evento.tipo === "PROGRAMADA") {
    return "Programada para el " + valorTexto(evento.fechaNueva);
  }
  if (evento.tipo === "REPROGRAMADA") {
    return "Movida del " + valorTexto(evento.fechaAnterior) + " al " + valorTexto(evento.fechaNueva);
  }
  return "Se le quitó la fecha (antes " + valorTexto(evento.fechaAnterior) + ")";
}

function Historial() {
  const sesion = useSesion();

  const [vista, setVista] = useState<Vista>("actividad");
  const [actividad, setActividad] = useState<Actividad[]>([]);
  const [eventos, setEventos] = useState<EventoPlanificacion[]>([]);
  const [reprogramadas, setReprogramadas] = useState<Reprogramada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // todo esto viene de MongoDB a traves de la API
  useEffect(() => {
    if (!sesion) return;

    setCargando(true);
    Promise.all([listarActividad(50), listarPlanificacion(50), listarReprogramadas()])
      .then(([listaActividad, listaEventos, listaReprogramadas]) => {
        setActividad(listaActividad);
        setEventos(listaEventos);
        setReprogramadas(listaReprogramadas);
        setError("");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setCargando(false));
  }, [sesion?.id]);

  return (
    <div className="min-vh-100 w-100 page-container historial-page">
      <HeaderFixed titulo="Historial" />

      <main className="content-container">
        <div className="info-banner info-banner-historial">
          <img src={iconoInfo} alt="Información" className="info-icon-img" />
          <p>Aquí quedan tus últimos cambios y cada vez que moviste la fecha de una tarea o evaluación.</p>
        </div>

        <div className="historial-selector">
          <button
            type="button"
            className={vista === "actividad" ? "active" : ""}
            onClick={() => setVista("actividad")}
          >
            Actividad
          </button>
          <button
            type="button"
            className={vista === "planificacion" ? "active" : ""}
            onClick={() => setVista("planificacion")}
          >
            Planificación
          </button>
        </div>

        {cargando && <p className="historial-vacio">Cargando...</p>}
        {error !== "" && <p className="historial-vacio">{error}</p>}

        {!cargando && error === "" && vista === "actividad" && (
          <div className="historial-lista">
            {actividad.length === 0 && <p className="historial-vacio">Todavía no hay actividad.</p>}

            {actividad.map((item) => (
              <div key={item._id} className="historial-item">
                <div className="historial-item-superior">
                  <span className={`historial-accion accion-${item.accion.toLowerCase()}`}>
                    {ACCIONES[item.accion] ?? item.accion}
                  </span>
                  <span className="historial-entidad">{ENTIDADES[item.entidad] ?? item.entidad}</span>
                  <span className="historial-fecha">{fechaHora(item.fecha)}</span>
                </div>

                <p className="historial-descripcion">{item.descripcion}</p>

                {item.cambios && Object.keys(item.cambios).length > 0 && (
                  <ul className="historial-cambios">
                    {Object.entries(item.cambios).map(([campo, cambio]) => (
                      <li key={campo}>
                        <strong>{CAMPOS[campo] ?? campo}:</strong> {valorTexto(cambio.antes)} → {valorTexto(cambio.despues)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {!cargando && error === "" && vista === "planificacion" && (
          <>
            {reprogramadas.length > 0 && (
              <div className="historial-postergadas">
                <h3>Lo que más has postergado</h3>
                {reprogramadas.map((item) => (
                  <p key={item.entidad + item.entidadId}>
                    {item.titulo} ({ENTIDADES[item.entidad] ?? item.entidad}):{" "}
                    <strong>{item.veces} {item.veces === 1 ? "vez" : "veces"}</strong>
                  </p>
                ))}
              </div>
            )}

            <div className="historial-lista">
              {eventos.length === 0 && <p className="historial-vacio">Todavía no hay eventos de planificación.</p>}

              {eventos.map((evento) => (
                <div key={evento._id} className="historial-item">
                  <div className="historial-item-superior">
                    <span className="historial-entidad">{ENTIDADES[evento.entidad] ?? evento.entidad}</span>
                    <span className="historial-fecha">{fechaHora(evento.creadoEn)}</span>
                  </div>
                  <p className="historial-descripcion">
                    <strong>{evento.titulo}</strong>: {textoEvento(evento)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Historial;

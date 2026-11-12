import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import iconoLapiz from "../assets/icons/lapiz.png";
import type { Ramo } from "../pages/Ramos";
import { listarTareas } from "../services/tareasApi";
import { obtenerAvance } from "../services/ramosApi";
import type { AvanceDeRamo } from "../services/ramosApi";
import { EsqueletoLineas } from "./Esqueletos";
import "../styles/ramos.css";

type TareaRamo = {
  id: string;
  nombre: string;
  asignatura: string;
  estado?: string;
};

type ModalDetalleRamoProps = {
  abierto: boolean;
  ramo: Ramo | null;
  onCerrar: () => void;
  onEditar: (ramo: Ramo) => void;
};

const claseEstado = (estado?: string) => {
  if (estado === "Pendiente") return "pendientes";
  if (estado === "En progreso") return "en-progreso";
  if (estado === "Completada") return "completadas";
  return "sin-estado";
};

const ModalDetalleRamo = ({ abierto, ramo, onCerrar, onEditar }: ModalDetalleRamoProps) => {
  const navigate = useNavigate();
  const [tareasGuardadas, setTareasGuardadas] = useState<TareaRamo[]>([]);
  const [avance, setAvance] = useState<AvanceDeRamo | null>(null);
  const [cargando, setCargando] = useState(true);

  // las tareas se piden a la API cada vez que se abre un ramo
  useEffect(() => {
    if (!abierto) return;

    // mientras llegan las tareas y el avance se ven lineas de carga
    setCargando(true);

    const pedirTareas = listarTareas()
      .then((lista) => setTareasGuardadas(lista))
      .catch(() => setTareasGuardadas([]));

    // el avance lo calcula la API con las tareas y las notas del ramo
    let pedirAvance = Promise.resolve();
    if (ramo) {
      pedirAvance = obtenerAvance(ramo.id)
        .then((datos) => setAvance(datos))
        .catch(() => setAvance(null));
    }

    Promise.allSettled([pedirTareas, pedirAvance]).then(() => setCargando(false));
  }, [abierto, ramo?.id]);

  if (!abierto || !ramo) return null;

  const tareas = tareasGuardadas.filter((tarea) => tarea.asignatura === ramo.nombre);

  return (
    <div className="modal-detalle-ramo-overlay" onClick={onCerrar}>
      <div className="modal-detalle-ramo-content" onClick={(evento) => evento.stopPropagation()}>
        <div className="modal-detalle-ramo-header">
          <button
            type="button"
            className="modal-detalle-ramo-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar detalle del ramo"
          >
            ×
          </button>
        </div>

        <div className="modal-detalle-ramo-body">
          <div className="modal-detalle-ramo-identidad">
            <div className="modal-detalle-ramo-logo-contenedor">
              {ramo.logo ? (
                <img src={ramo.logo} alt={`Logo de ${ramo.nombre}`} className="modal-detalle-ramo-logo" />
              ) : (
                <span className="modal-detalle-ramo-logo-vacio">
                    {ramo.nombre.charAt(0).toUpperCase()}
                  </span>
              )}
            </div>

            <div className="modal-detalle-ramo-datos">
              <h2>{ramo.nombre}</h2>
              <p>{ramo.id}</p>
            </div>
          </div>

          <div className="modal-detalle-ramo-modalidad">
            <span>Modalidad:</span>
            <div className="modal-detalle-ramo-modalidad-valor">{ramo.modalidad}</div>
          </div>

          {cargando && (
            <div className="modal-detalle-ramo-avance">
              <h3>Avance</h3>
              <EsqueletoLineas cantidad={3} />
            </div>
          )}

          {!cargando && avance && (
            <div className="modal-detalle-ramo-avance">
              <h3>Avance</h3>
              <p>
                Tareas completadas: <strong>{avance.tareasCompletadas} de {avance.totalTareas}</strong>
              </p>
              <div className="avance-barra">
                <div
                  className="avance-barra-relleno"
                  style={{ width: avance.porcentajeTareas + "%", backgroundColor: ramo.colorRamo }}
                />
              </div>
              <p>
                Evaluaciones rendidas: <strong>{avance.ponderacionRendida}% de {avance.ponderacionTotal}%</strong>
              </p>
              <p>
                Promedio parcial:{" "}
                <strong>{avance.promedioParcial !== null ? avance.promedioParcial.toFixed(1) : "sin notas"}</strong>
              </p>
              <button
                type="button"
                className="modal-detalle-ramo-ver-evaluaciones"
                onClick={() => navigate("/evaluaciones")}
              >
                Ver evaluaciones ›
              </button>
            </div>
          )}

          <div className="modal-detalle-ramo-tareas">
            <h3>Tareas</h3>
            {cargando ? (
              <EsqueletoLineas cantidad={2} />
            ) : tareas.length > 0 ? (
              <div className="modal-detalle-ramo-lista-tareas">
                {tareas.map((tarea) => (
                  <button
                    type="button"
                    key={tarea.id}
                    className={`modal-detalle-ramo-tarea ${claseEstado(tarea.estado)}`}
                    onClick={() => navigate(`/tareas?id=${tarea.id}`)}
                  >
                    {tarea.nombre}
                  </button>
                ))}
              </div>
            ) : (
              <p className="modal-detalle-ramo-sin-tareas">Sin tareas asociadas.</p>
            )}
          </div>

          <div className="modal-detalle-ramo-footer">
            <button type="button" className="btn-editar-ramo-detalle" onClick={() => onEditar(ramo)}>
              <img src={iconoLapiz} alt="Editar" className="btn-editar-ramo-icono" /> Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleRamo;
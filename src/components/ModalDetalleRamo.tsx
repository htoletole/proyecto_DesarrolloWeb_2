import { useNavigate } from "react-router-dom";
import iconoLapiz from "../assets/icons/lapiz.png";
import type { Ramo } from "../pages/Ramos";
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

const cargarTareas = (): TareaRamo[] => {
  const guardadas = localStorage.getItem("tareas");
  if (!guardadas) return [];

  try {
    return JSON.parse(guardadas) as TareaRamo[];
  } catch {
    return [];
  }
};

const claseEstado = (estado?: string) => {
  if (estado === "Pendiente") return "pendientes";
  if (estado === "En progreso") return "en-progreso";
  if (estado === "Completada") return "completadas";
  return "sin-estado";
};

const ModalDetalleRamo = ({ abierto, ramo, onCerrar, onEditar }: ModalDetalleRamoProps) => {
  const navigate = useNavigate();
  if (!abierto || !ramo) return null;

  const tareas = cargarTareas().filter((tarea) => tarea.asignatura === ramo.nombre);

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

          <div className="modal-detalle-ramo-tareas">
            <h3>Tareas</h3>
            {tareas.length > 0 ? (
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
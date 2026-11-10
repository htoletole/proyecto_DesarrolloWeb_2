import { fechaCorta } from "../services/fechas";
import type { Tarea } from "../services/tareasCalendario";

interface DetalleTareaProps {
  tarea: Tarea;
  onCerrar: () => void;
  onEditar: () => void;
}

function DetalleTarea(props: DetalleTareaProps) {
  const { tarea, onCerrar, onEditar } = props;

  
  let fecha = "Sin fecha";
  if (tarea.fecha) {
    fecha = fechaCorta(tarea.fecha);
  }

  let hora = "Sin hora";
  if (tarea.horaEntrega) {
    hora = tarea.horaEntrega;
  }

  return (
    <div className="cal-overlay" onClick={onCerrar}>
      <div className="cal-detalle" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>Detalle de tarea</h2>
        <h3>{tarea.nombre}</h3>

        <p className="cal-campo">
          <strong>Estado:</strong> {tarea.estado}
        </p>
        <p className="cal-campo">
          <strong>Fecha:</strong> {fecha}
        </p>
        <p className="cal-campo">
          <strong>Hora:</strong> {hora}
        </p>
        <p className="cal-campo">
          <strong>Descripción:</strong> {tarea.descripcion}
        </p>

        <div className="cal-botones">
          <button type="button" className="cal-boton-cerrar" onClick={onCerrar}>
            Cerrar
          </button>
          <button type="button" className="cal-boton-editar" onClick={onEditar}>
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetalleTarea;

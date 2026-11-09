import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import iconoCarga from '../assets/icons/carga.png';
import iconoCalendario from '../assets/icons/calendario.png';
import iconoReloj from '../assets/icons/reloj.png';
import iconoDescripcion from '../assets/icons/descripcion.png';
import iconoLapiz from '../assets/icons/lapiz.png';
import { ESTADOS, PRIORIDADES, fechaCortaTexto } from '../services/etiquetas';
import {
  crearSubtarea,
  eliminarSubtarea,
  listarCambiosDeFecha,
  marcarSubtarea,
  obtenerTarea,
} from '../services/tareasApi';
import type { EventoPlanificacion, Tarea } from '../services/tipos';
import '../styles/tareas.css';

interface ModalDetalleProps {
  abierto: boolean;
  tarea: Tarea | null;
  onCerrar: () => void;
  onEditar?: (tarea: Tarea) => void;
  // se llama cuando cambian las subtareas, para actualizar la lista de la pagina
  onActualizada?: (tarea: Tarea) => void;
  colorTema?: string; // cambia el color
}

const ModalDetalleTarea = ({ abierto, tarea, onCerrar, onEditar, onActualizada, colorTema = '#46937c' }: ModalDetalleProps) => {
  const [nuevaSubtarea, setNuevaSubtarea] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cambiosFecha, setCambiosFecha] = useState<EventoPlanificacion[]>([]);

  // cada vez que se abre una tarea se pide su historial de fechas (MongoDB)
  const idTarea = tarea ? tarea.id : 0;
  useEffect(() => {
    setError('');
    setNuevaSubtarea('');
    setCambiosFecha([]);
    if (idTarea === 0) {
      return;
    }
    listarCambiosDeFecha(idTarea)
      .then(setCambiosFecha)
      .catch(() => setCambiosFecha([]));
  }, [idTarea]);

  if (!abierto || !tarea) return null;

  // hace el cambio en la API y vuelve a pedir la tarea para tener las subtareas al dia
  async function cambiarSubtareas(accion: () => Promise<unknown>) {
    if (!tarea) return;
    setGuardando(true);
    setError('');
    try {
      await accion();
      const actualizada = await obtenerTarea(tarea.id);
      onActualizada?.(actualizada);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  function agregarSubtarea(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!tarea || nuevaSubtarea.trim() === '') return;
    const nombre = nuevaSubtarea.trim();
    setNuevaSubtarea('');
    cambiarSubtareas(() => crearSubtarea(tarea.id, nombre));
  }

  const listas = tarea.subtareas.filter((subtarea) => subtarea.completada).length;

  return (
    <div className="modal-detalle-overlay" onClick={onCerrar}>
      <div className="modal-detalle-content" onClick={(e) => e.stopPropagation()}>

        {/* se puede modificar esta cabecera */}
        <div className="modal-detalle-header" style={{ backgroundColor: colorTema }}>
          <h2>Detalle de tarea</h2>
          <button className="btn-cerrar-detalle" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-detalle-body">
          <h3 className="modal-detalle-titulo">{tarea.nombre}</h3>
          <p className="modal-detalle-ramo">
            {tarea.asignatura.nombre} · Prioridad {PRIORIDADES[tarea.prioridad]}
            {tarea.evaluacion && <> · Prepara: {tarea.evaluacion.nombre}</>}
          </p>

          <div className="modal-detalle-info-box">
            <img src={iconoCarga} alt="Estado" className="info-box-icon" />
            <div className="info-box-textos">
              <span className="info-box-label">Estado:</span>
              <span className="info-box-valor">{ESTADOS[tarea.estado]}</span>
            </div>
          </div>

          <div className="modal-detalle-info-box">
            <img src={iconoCalendario} alt="Fecha" className="info-box-icon" />
            <div className="info-box-textos">
              <span className="info-box-label">Fecha:</span>
              <span className="info-box-valor">{tarea.fecha ? fechaCortaTexto(tarea.fecha) : '--/--/----'}</span>
            </div>
          </div>

          <div className="modal-detalle-info-box">
            <img src={iconoReloj} alt="Hora" className="info-box-icon" />
            <div className="info-box-textos">
              <span className="info-box-label">Hora:</span>
              <span className="info-box-valor">{tarea.horaEntrega || '--:--'}</span>
            </div>
          </div>

          <div className="modal-detalle-info-box">
            <img src={iconoDescripcion} alt="Descripción" className="info-box-icon" />
            <div className="info-box-textos">
              <span className="info-box-label">Descripción:</span>
              <span className="info-box-valor">{tarea.descripcion || 'Sin descripción...'}</span>
            </div>
          </div>

          {/* subtareas: no se puede completar la tarea mientras quede alguna pendiente */}
          <div className="detalle-subtareas">
            <h4>
              Subtareas {tarea.subtareas.length > 0 && <span>({listas}/{tarea.subtareas.length})</span>}
            </h4>

            {tarea.subtareas.length === 0 && <p className="detalle-vacio">Sin subtareas.</p>}

            <ul>
              {tarea.subtareas.map((subtarea) => (
                <li key={subtarea.id} className={subtarea.completada ? 'subtarea-lista' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={subtarea.completada}
                      disabled={guardando}
                      onChange={() => cambiarSubtareas(() => marcarSubtarea(subtarea.id, !subtarea.completada))}
                    />
                    {subtarea.nombre}
                  </label>
                  <button
                    type="button"
                    className="subtarea-quitar"
                    aria-label={'Eliminar ' + subtarea.nombre}
                    disabled={guardando}
                    onClick={() => cambiarSubtareas(() => eliminarSubtarea(subtarea.id))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <form className="subtarea-agregar" onSubmit={agregarSubtarea}>
              <input
                type="text"
                placeholder="Nueva subtarea..."
                value={nuevaSubtarea}
                maxLength={80}
                onChange={(e) => setNuevaSubtarea(e.target.value)}
              />
              <button type="submit" disabled={guardando || nuevaSubtarea.trim() === ''}>
                Agregar
              </button>
            </form>

            {error && <p className="detalle-error" role="alert">{error}</p>}
          </div>

          {/* cambios de fecha guardados en MongoDB */}
          {cambiosFecha.length > 0 && (
            <div className="detalle-fechas">
              <h4>Historial de fechas</h4>
              <ul>
                {cambiosFecha.map((evento) => (
                  <li key={evento._id}>
                    {evento.tipo === 'PROGRAMADA' && <>Programada para el {fechaCortaTexto(evento.fechaNueva ?? null)}</>}
                    {evento.tipo === 'REPROGRAMADA' && (
                      <>Movida del {fechaCortaTexto(evento.fechaAnterior ?? null)} al {fechaCortaTexto(evento.fechaNueva ?? null)}</>
                    )}
                    {evento.tipo === 'SIN_FECHA' && <>Se le quitó la fecha</>}
                    <span> · {new Date(evento.creadoEn).toLocaleDateString('es-CL')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="modal-detalle-footer">
            <button
              className="btn-editar-detalle"
              style={{ backgroundColor: colorTema }}
              onClick={() => onEditar && onEditar(tarea)}
            >
              <img src={iconoLapiz} alt="Editar" className="btn-editar-icon" /> Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleTarea;

import iconoCarga from '../assets/icons/carga.png';
import iconoCalendario from '../assets/icons/calendario.png';
import iconoReloj from '../assets/icons/reloj.png';
import iconoDescripcion from '../assets/icons/descripcion.png';
import iconoLapiz from '../assets/icons/lapiz.png';
import type { Tarea } from '../pages/Tareas';
import '../styles/tareas.css';

interface ModalDetalleProps {
  abierto: boolean;
  tarea: Tarea | null;
  onCerrar: () => void;
  onEditar?: (tarea: Tarea) => void;
  colorTema?: string; // cambia el color
}

const ModalDetalleTarea = ({ abierto, tarea, onCerrar, onEditar, colorTema = '#46937c' }: ModalDetalleProps) => {
  if (!abierto || !tarea) return null;

  // Formatea la fecha de YYYY-MM-DD a DD/MM/YYYY
  const formatearFecha = (fechaStr?: string) => {
    if (!fechaStr) return '--/--/----';
    const partes = fechaStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return fechaStr;
  };

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

          <div className="modal-detalle-info-box">
            <img src={iconoCarga} alt="Estado" className="info-box-icon" />
            <div className="info-box-textos">
              <span className="info-box-label">Estado:</span>
              <span className="info-box-valor">{tarea.estado}</span>
            </div>
          </div>

          <div className="modal-detalle-info-box">
            <img src={iconoCalendario} alt="Fecha" className="info-box-icon" />
            <div className="info-box-textos">
              <span className="info-box-label">Fecha:</span>
              <span className="info-box-valor">{formatearFecha(tarea.fecha)}</span>
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
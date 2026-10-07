// src/components/ModalConfirmacionTareas.tsx
import '../styles/tareas.css';

interface ModalConfirmacionTareasProps {
  abierto: boolean;
  mensaje: string;
  onConfirmar: () => void;
  onDenegar: () => void;
}

const ModalConfirmacionTareas = ({ abierto, mensaje, onConfirmar, onDenegar }: ModalConfirmacionTareasProps) => {
  if (!abierto) return null;

  return (
    <div className="modal-confirmacion-overlay">
      <div className="modal-confirmacion-content">
        <h3>{mensaje}</h3>
        <div className="modal-confirmacion-botones">
          <button className="btn-confirmar" onClick={onConfirmar}>Confirmar</button>
          <button className="btn-denegar" onClick={onDenegar}>Denegar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacionTareas;
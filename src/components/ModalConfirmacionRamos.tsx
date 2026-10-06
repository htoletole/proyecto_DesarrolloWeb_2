import { useState } from "react";

type ModalConfirmacionRamosProps = {
  abierto: boolean;
  mensaje: string;
  elementosAdvertencia?: string[];
  textoAdvertencia?: string;
  onConfirmar: () => void;
  onDenegar: () => void;
};

const ModalConfirmacionRamos = ({
  abierto,
  mensaje,
  elementosAdvertencia = [],
  textoAdvertencia,
  onConfirmar,
  onDenegar,
}: ModalConfirmacionRamosProps) => {
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  if (!abierto) return null;

  const confirmar = () => {
    if (!mostrarAdvertencia && elementosAdvertencia.length > 0) {
      setMostrarAdvertencia(true);
      return;
    }

    setMostrarAdvertencia(false);
    onConfirmar();
  };

  const denegar = () => {
    setMostrarAdvertencia(false);
    onDenegar();
  };

  return (
    <div className="modal-confirmacion-ramos-overlay">
      <div className="modal-confirmacion-ramos-content">
        <h3>{mostrarAdvertencia ? "Los siguientes ramos tienen tareas asignadas:" : mensaje}</h3>

        {mostrarAdvertencia && (
          <>
            <ul className="modal-confirmacion-ramos-lista">
              {elementosAdvertencia.map((ramo) => <li key={ramo}>{ramo}</li>)}
            </ul>
            {textoAdvertencia && <p className="modal-confirmacion-ramos-texto-final">{textoAdvertencia}</p>}
          </>
        )}

        <div className="modal-confirmacion-ramos-botones">
          <button type="button" className="btn-confirmar-ramos" onClick={confirmar}>Confirmar</button>
          <button type="button" className="btn-denegar-ramos" onClick={denegar}>Denegar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacionRamos;
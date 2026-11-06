import { useEffect } from "react";

interface ToastProps {
  mostrar: boolean;
  mensaje: string;
  titulo: string;
  onClose: () => void;
  error?: boolean;
}

function Toast(props: ToastProps) {
  const { mostrar, mensaje, titulo, onClose, error = false } = props;

  // se cierra solo despues de 4 segundos
  useEffect(() => {
    if (!mostrar) return;
    const temporizador = setTimeout(onClose, 4000);
    return () => clearTimeout(temporizador);
  }, [mostrar, mensaje]);

  return (
    <div className={`toast-container position-fixed bottom-0 end-0 p-3`}>
      <div
        id="liveToast"
        className={`toast ${mostrar ? "show" : ""} ${error ? "toast-error" : ""}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="toast-header">
          <strong className="me-auto">{titulo}</strong>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
        <div className="toast-body">{mensaje}</div>
      </div>
    </div>
  );
}

export default Toast;

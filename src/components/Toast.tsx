import { useEffect } from "react";

interface ToastProps {
  mostrar: boolean;
  mensaje: string;
  titulo: string;
  onClose: () => void;
}

function Toast(props: ToastProps) {
  const { mostrar, mensaje, titulo, onClose } = props;

  useEffect(() => {
    if (!mostrar) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000); // 3 segundos

    return () => clearTimeout(timer);
  }, [mostrar, onClose]);

  return (
    <div className={`toast-container position-fixed bottom-0 end-0 p-3`}>
      <div
        id="liveToast"
        className={`toast ${mostrar ? "show" : ""}`}
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

interface EstadoCargaProps {
  cargando: boolean;
  error: string;
  vacio?: boolean;
  mensajeVacio?: string;
  onReintentar?: () => void;
}

// muestra "cargando", el error con un boton para reintentar, o el aviso de que no hay datos
function EstadoCarga(props: EstadoCargaProps) {
  const { cargando, error, vacio = false, mensajeVacio = "No hay datos todavía.", onReintentar } = props;

  if (cargando) {
    return (
      <div className="estado-carga" role="status">
        <div className="spinner-border spinner-border-sm" aria-hidden="true"></div>
        <span>Cargando...</span>
      </div>
    );
  }

  if (error !== "") {
    return (
      <div className="estado-carga estado-carga-error" role="alert">
        <span>{error}</span>
        {onReintentar && (
          <button type="button" className="estado-carga-boton" onClick={onReintentar}>
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (vacio) {
    return (
      <div className="estado-carga estado-carga-vacio">
        <span>{mensajeVacio}</span>
      </div>
    );
  }

  return null;
}

export default EstadoCarga;

interface EstadoProps {
  estado: string;
}

function EstadoTareas(props: EstadoProps) {
  const { estado } = props;

  return (
    <div className="div-estado">
      <div className={`d-flex align-middle linea-estado ${estado}`}>
        <h4>Pendientes</h4>
      </div>
    </div>
  );
}

export default EstadoTareas;

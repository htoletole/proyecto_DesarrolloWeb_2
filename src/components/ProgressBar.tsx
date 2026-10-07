interface ProgressProps {
  porcentaje: number;
  color: string;
}

function ProgressBar(props: ProgressProps) {
  const { porcentaje, color } = props;
  const porcentajeValido = Math.min(100, Math.max(0, porcentaje));

  const radio = 80;
  const circulo = Math.PI * radio;
  const strokeDashoffset = circulo - (porcentajeValido / 100) * circulo;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center position-relative">
      <svg
        width="180"
        height="120"
        viewBox="0 0 200 120"
        className="overflow-visible"
      >
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e9ecef"
          strokeWidth="25px"
          strokeLinecap="round"
        />

        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="25px"
          strokeLinecap="round"
          strokeDasharray={circulo}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />
      </svg>

      <div className="position-absolute text-center" style={{ top: "60px" }}>
        <span className="fs-2 fw-bold d-block">{porcentajeValido}%</span>
      </div>
    </div>
  );
}

export default ProgressBar;

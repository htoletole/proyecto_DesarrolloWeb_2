import { useEffect, useState } from "react";
import { LIMITE_CARGA_LENTA_MS } from "../services/carga";
import { DIAS_SEMANA } from "../services/fechas";
import "../styles/esqueleto.css";

// esqueletos de carga ("bones") de cada vista: tienen la misma forma que la vista real,
// asi los datos aparecen en el mismo lugar y no se ve la pantalla vacia ni a medias

// numeros para repetir piezas con map
function lista(cantidad: number): number[] {
  const numeros: number[] = [];
  for (let i = 0; i < cantidad; i++) {
    numeros.push(i);
  }
  return numeros;
}

// si la carga pasa del limite medido, se avisa (por ejemplo, si se cayo la conexion)
export function AvisoCargaLenta() {
  const [lenta, setLenta] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setLenta(true), LIMITE_CARGA_LENTA_MS);
    return () => clearTimeout(temporizador);
  }, []);

  if (!lenta) return null;

  return (
    <p className="aviso-carga-lenta" role="status">
      Esto está tardando más de lo normal. Revisa tu conexión...
    </p>
  );
}

// fila de tarjetas como las del tablero (tareas y estados del inicio)
function FilaTarjetas() {
  return (
    <div className="kanban-cards-container">
      {lista(3).map((numero) => (
        <div key={numero} className="esqueleto-tarjeta">
          <div className="esqueleto esqueleto-linea" />
          <div className="esqueleto esqueleto-linea corta" />
        </div>
      ))}
    </div>
  );
}

export function EsqueletoTareas() {
  return (
    <div className="kanban-board" aria-busy="true" aria-label="Cargando tareas">
      {lista(3).map((fila) => (
        <div key={fila} className="kanban-row">
          <div className="esqueleto esqueleto-header" />
          <FilaTarjetas />
        </div>
      ))}
      <AvisoCargaLenta />
    </div>
  );
}

export function EsqueletoInicio() {
  return (
    <div aria-busy="true" aria-label="Cargando inicio">
      {/* progreso global y cumplimiento: mismo panel con degradado */}
      {lista(2).map((panel) => (
        <div
          key={panel}
          className="d-flex flex-column align-items-center panel-progreso-semanal esqueleto-panel-progreso"
          style={{ marginTop: panel === 0 ? 0 : 15 }}
        >
          <div className="esqueleto-oscuro esqueleto-pildora" />
          <div className="esqueleto-oscuro esqueleto-linea" style={{ width: 200 }} />
          <div className="row w-100">
            {lista(2).map((medidor) => (
              <div key={medidor} className="col-6 p-0 d-flex justify-content-center">
                <div className="esqueleto-oscuro esqueleto-medidor" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* bloques de estados (vencidas, pendientes...) */}
      <div className="container panel-estados">
        {lista(3).map((estado) => (
          <div key={estado} className="div-estado">
            <div className="esqueleto esqueleto-bloque" style={{ borderRadius: "15px 15px 0 0" }} />
            <FilaTarjetas />
          </div>
        ))}
        <AvisoCargaLenta />
      </div>
    </div>
  );
}

export function EsqueletoRamos({ vista }: { vista: "grid" | "lista" }) {
  return (
    <section className={vista === "grid" ? "ramos-grid" : "ramos-list"} aria-busy="true" aria-label="Cargando ramos">
      {lista(4).map((numero) => (
        <div
          key={numero}
          className="esqueleto-ramo"
          style={vista === "lista" ? { minHeight: 110 } : undefined}
        >
          <div className="esqueleto-ramo-superior">
            <div className="esqueleto esqueleto-circulo" style={{ flex: "none" }} />
            <div>
              <div className="esqueleto esqueleto-linea" />
              <div className="esqueleto esqueleto-linea corta" />
            </div>
          </div>
          <div className="esqueleto esqueleto-linea media" />
        </div>
      ))}
      <AvisoCargaLenta />
    </section>
  );
}

export function EsqueletoCalendario() {
  return (
    <div aria-busy="true" aria-label="Cargando calendario">
      <section className="cal-tarjeta">
        <div className="cal-selectores">
          <div className="esqueleto esqueleto-selector" />
          <div className="esqueleto esqueleto-selector" />
        </div>
        <div className="cal-cuadricula">
          {/* los nombres de los dias son fijos, asi la cuadricula no se mueve al cargar */}
          {DIAS_SEMANA.map((nombre) => (
            <span key={nombre} className="cal-nombre-dia">
              {nombre}
            </span>
          ))}
          {lista(35).map((dia) => (
            <div key={dia} className="esqueleto esqueleto-dia" />
          ))}
        </div>
      </section>

      <section className="cal-dia-detalle">
        <div className="esqueleto esqueleto-linea media" style={{ marginBottom: 12 }} />
        <div className="esqueleto esqueleto-bloque" style={{ borderRadius: 8 }} />
      </section>
      <AvisoCargaLenta />
    </div>
  );
}

// lista generica: un encabezado y filas (evaluaciones, periodos, historial)
export function EsqueletoLista({ grupos = 1, filas = 3, conEncabezado = true }) {
  return (
    <div className="esqueleto-lista" aria-busy="true" aria-label="Cargando">
      {lista(grupos).map((grupo) => (
        <div key={grupo} className="esqueleto-lista" style={{ marginBottom: 10 }}>
          {conEncabezado && <div className="esqueleto esqueleto-bloque" />}
          {lista(filas).map((fila) => (
            <div key={fila} className="esqueleto-fila">
              <div className="esqueleto esqueleto-linea media" />
              <div className="esqueleto esqueleto-linea corta" />
            </div>
          ))}
        </div>
      ))}
      <AvisoCargaLenta />
    </div>
  );
}

// pocas lineas, para secciones chicas dentro de un modal (avance, subtareas)
export function EsqueletoLineas({ cantidad = 2 }) {
  return (
    <div className="esqueleto-lista" aria-busy="true" aria-label="Cargando" style={{ width: "100%", margin: "6px 0" }}>
      {lista(cantidad).map((numero) => (
        <div key={numero} className={`esqueleto esqueleto-linea ${numero % 2 === 1 ? "corta" : ""}`} />
      ))}
    </div>
  );
}

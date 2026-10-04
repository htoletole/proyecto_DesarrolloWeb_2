import { useEffect, useState } from "react";
import HeaderRamos from "../components/HeaderRamos";
import Formulario from "../components/Formulario";
import iconoInfo from "../assets/icons/info.png";
import iconoMas from "../assets/icons/mas.png";
import "../styles/ramos.css";

type VistaRamos = "grid" | "lista";
type Ramo = {
  id: string;
  nombre: string;
  modalidad: string;
  colorRamo: string;
  logo?: string;
};

const convertirImagenBase64 = (
  archivo: File,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => {
      resolve(String(lector.result));
    };

    lector.onerror = () => {
      reject(
        new Error(
          "No se pudo cargar la imagen",
        ),
      );
    };

    lector.readAsDataURL(archivo);
  });
};

function Ramos() {
  const [vista, setVista] =
    useState<VistaRamos>("grid");

  const [ramos, setRamos] =
    useState<Ramo[]>(() => {
      const ramosGuardados =
        localStorage.getItem("ramos");

      if (!ramosGuardados) {
        return [];
      }

      try {
        return JSON.parse(
          ramosGuardados,
        ) as Ramo[];
      } catch {
        return [];
      }
    });

  const [
    formularioAbierto,
    setFormularioAbierto,
  ] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "ramos",
      JSON.stringify(ramos),
    );
  }, [ramos]);

  const crearRamo = async (
    datos: Record<string, FormDataEntryValue>,
  ) => {
    const nombre = String(
      datos.nombre ?? "",
    );

    const id = String(
      datos.id ?? "",
    );

    const modalidad = String(
      datos.modalidad ?? "",
    );

    const colorRamo = String(
      datos.colorRamo ?? "#FFAE52",
    );

    let logo: string | undefined;

    if (
      datos.logo instanceof File &&
      datos.logo.size > 0
    ) {
      logo = await convertirImagenBase64(
        datos.logo,
      );
    }

    const nuevoRamo: Ramo = {
      id,
      nombre,
      modalidad,
      colorRamo,
      logo,
    };

    setRamos((ramosActuales) => [
      ...ramosActuales,
      nuevoRamo,
    ]);

    setFormularioAbierto(false);
  };

  return (
    <div className="min-vh-100 w-100 page-container ramos-page">
      <HeaderRamos />

      <main className="content-container">
        <div className="info-banner info-banner-ramos">
          <img
            src={iconoInfo}
            alt="Información"
            className="info-icon-img"
          />

          <p>
            Presiona un ramo para ver más información
            sobre este.
          </p>
        </div>

        <div className="action-buttons-container">
          <button
            type="button"
            className="btn-crear btn-crear-ramos"
            onClick={() =>
              setFormularioAbierto(true)
            }
          >
            Crear Ramo

            <img
              src={iconoMas}
              alt="Crear ramo"
              className="btn-icon"
            />
          </button>

          <div className="ramos-view-selector">
            <button
              type="button"
              className={
                vista === "lista"
                  ? "ramos-view-button active"
                  : "ramos-view-button"
              }
              onClick={() =>
                setVista("lista")
              }
              aria-label="Vista de lista"
            >
              ☷
            </button>

            <button
              type="button"
              className={
                vista === "grid"
                  ? "ramos-view-button active"
                  : "ramos-view-button"
              }
              onClick={() =>
                setVista("grid")
              }
              aria-label="Vista de cuadrícula"
            >
              ▦
            </button>
          </div>
        </div>

        <section
          className={
            vista === "grid"
              ? "ramos-grid"
              : "ramos-list"
          }
        >
          {ramos.map((ramo, index) => (
            <div
              key={`${ramo.id}-${index}`}
              className="ramo-card"
              style={{
                backgroundColor:
                  ramo.colorRamo,
              }}
            >
              <div className="ramo-card-superior">
                <div className="ramo-card-logo-contenedor">
                  {ramo.logo ? (
                    <img
                      src={ramo.logo}
                      alt={`Logo de ${ramo.nombre}`}
                      className="ramo-card-logo"
                    />
                  ) : (
                    <span className="ramo-card-logo-vacio">
                      R
                    </span>
                  )}
                </div>

                <div className="ramo-card-info">
                  <h3>
                    {ramo.nombre}
                  </h3>

                  <p className="ramo-card-id">
                    {ramo.id}
                  </p>
                </div>

                <span className="ramo-card-flecha">
                  ›
                </span>
              </div>

              <div className="ramo-card-divisor" />

              <div className="ramo-card-detalle">
                <span className="ramo-card-detalle-icono">
                  ◉
                </span>

                <div>
                  <span className="ramo-card-detalle-titulo">
                    Modalidad
                  </span>

                  <p>
                    {ramo.modalidad}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Formulario
        abierto={formularioAbierto}
        tipo="ramo"
        modo="crear"
        onCerrar={() =>
          setFormularioAbierto(false)
        }
        onAceptar={crearRamo}
      />
    </div>
  );
}

export default Ramos;

import { useState } from 'react';
import HeaderRamos from '../components/HeaderRamos';
import iconoInfo from '../assets/icons/info.png';
import iconoMas from '../assets/icons/mas.png';

type VistaRamos = 'grid' | 'lista';

const ramosDemo = [
  { id: 1, nombre: 'Ramo 1' },
  { id: 2, nombre: 'Ramo 2' },
  { id: 3, nombre: 'Ramo 3' },
  { id: 4, nombre: 'Ramo 4' },
  { id: 5, nombre: 'Ramo 5' },
  { id: 6, nombre: 'Ramo 6' },
];

function Ramos() {
  const [vista, setVista] = useState<VistaRamos>('grid');

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
            Presiona un ramo para ver más información sobre este.
          </p>
        </div>

        <div className="action-buttons-container">
          <button
            type="button"
            className="btn-crear btn-crear-ramos"
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
                vista === 'lista'
                  ? 'ramos-view-button active'
                  : 'ramos-view-button'
              }
              onClick={() => setVista('lista')}
              aria-label="Vista de lista"
            >
              ☷
            </button>

            <button
              type="button"
              className={
                vista === 'grid'
                  ? 'ramos-view-button active'
                  : 'ramos-view-button'
              }
              onClick={() => setVista('grid')}
              aria-label="Vista de cuadrícula"
            >
              ▦
            </button>
          </div>
        </div>

        <section
          className={
            vista === 'grid'
              ? 'ramos-grid'
              : 'ramos-list'
          }
        >
          {ramosDemo.map((ramo) => (
            <div
              key={ramo.id}
              className="ramo-card"
              title={ramo.nombre}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default Ramos;

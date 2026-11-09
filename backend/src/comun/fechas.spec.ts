import { aFecha, aTexto, fechaLegible, sumarDias } from './fechas';

describe('funciones de fechas', () => {
  it('suma dias cambiando de mes y de anio', () => {
    expect(sumarDias('2026-11-28', 5)).toBe('2026-12-03');
    expect(sumarDias('2026-12-30', 3)).toBe('2027-01-02');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('convierte de texto a fecha y de vuelta sin correr el dia', () => {
    expect(aTexto(aFecha('2026-09-18'))).toBe('2026-09-18');
  });

  it('muestra la fecha como DD/MM/AAAA', () => {
    expect(fechaLegible('2026-08-01')).toBe('01/08/2026');
  });
});

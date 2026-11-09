import { calcularAvance } from './avance';

describe('calcularAvance', () => {
  it('sin tareas ni evaluaciones todo queda en cero', () => {
    const avance = calcularAvance([], []);

    expect(avance.porcentajeTareas).toBe(0);
    expect(avance.ponderacionTotal).toBe(0);
    expect(avance.promedioParcial).toBeNull();
  });

  it('cuenta el porcentaje de tareas completadas', () => {
    const tareas = [{ estado: 'COMPLETADA' }, { estado: 'PENDIENTE' }, { estado: 'COMPLETADA' }, { estado: 'EN_PROGRESO' }];

    const avance = calcularAvance(tareas, []);

    expect(avance.totalTareas).toBe(4);
    expect(avance.tareasCompletadas).toBe(2);
    expect(avance.porcentajeTareas).toBe(50);
  });

  it('el promedio parcial solo considera las evaluaciones con nota', () => {
    const evaluaciones = [
      { ponderacion: 30, nota: 6.0 },
      { ponderacion: 20, nota: 4.5 },
      { ponderacion: 50, nota: null },
    ];

    const avance = calcularAvance([], evaluaciones);

    expect(avance.ponderacionTotal).toBe(100);
    expect(avance.ponderacionRendida).toBe(50);
    // (6.0 * 30 + 4.5 * 20) / 50 = 5.4
    expect(avance.promedioParcial).toBe(5.4);
  });
});

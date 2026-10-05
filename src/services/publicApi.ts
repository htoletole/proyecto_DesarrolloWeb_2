export interface Feriado {
  fecha: string; // se guarda año-mes-dia (2026-12-25), igual que la API
  nombre: string;
}

// nombre del feriado, o null si no es feriado
export function buscarFeriado(feriados: Feriado[], fecha: string): string | null {
  for (let i = 0; i < feriados.length; i++) {
    if (feriados[i].fecha === fecha) {
      return feriados[i].nombre;
    }
  }

  return null;
}

// pide los feriados de Chile a Nager.Date
export function obtenerFeriados(anio: number): Promise<Feriado[]> {
  return fetch("https://date.nager.at/api/v3/PublicHolidays/" + anio + "/CL")
    .then((respuesta) => {
      if (!respuesta.ok) {
        throw new Error("La API respondio con error");
      }
      return respuesta.json();
    })
    .then((datos) => {
      const lista: Feriado[] = [];

      for (let i = 0; i < datos.length; i++) {
        lista.push({ fecha: datos[i].date, nombre: datos[i].localName });
      }

      return lista;
    });
}

export interface Feriado {
  fecha: string; // formato 2026-12-25
  nombre: string;
}

// nombre del feriado de esa fecha, o null si no es feriado
export function buscarFeriado(feriados: Feriado[], fecha: string): string | null {
  for (let i = 0; i < feriados.length; i++) {
    if (feriados[i].fecha === fecha) {
      return feriados[i].nombre;
    }
  }

  return null;
}

// pide los feriados de chile a Nager.Date, si falla la pagina avisa
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

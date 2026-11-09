// funciones de fechas que usan varios servicios
// las fechas viajan como texto AAAA-MM-DD, igual que el input type="date" del frontend

export const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// fecha de hoy en Chile, en formato AAAA-MM-DD
export function fechaHoyChile(): string {
  return fechaEnChile(new Date());
}

// pasa un momento cualquiera a la fecha que corresponde en Chile
export function fechaEnChile(momento: Date): string {
  const formato = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formato.format(momento);
}

// convierte "AAAA-MM-DD" en Date (medianoche UTC, igual que el tipo DATE de Postgres)
export function aFecha(texto: string): Date {
  return new Date(texto + 'T00:00:00.000Z');
}

// convierte un Date de la base en "AAAA-MM-DD"
export function aTexto(fecha: Date | null): string | null {
  if (!fecha) {
    return null;
  }
  return fecha.toISOString().slice(0, 10);
}

// suma dias a una fecha AAAA-MM-DD
export function sumarDias(texto: string, dias: number): string {
  const fecha = aFecha(texto);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

// muestra una fecha AAAA-MM-DD como DD/MM/AAAA en los mensajes
export function fechaLegible(texto: string): string {
  return texto.slice(8, 10) + '/' + texto.slice(5, 7) + '/' + texto.slice(0, 4);
}

// periodo academico segun la fecha de hoy: marzo a julio es el 1, agosto a diciembre el 2
export function periodoActual() {
  const hoy = fechaHoyChile();
  const anio = Number(hoy.slice(0, 4));
  const mes = Number(hoy.slice(5, 7));

  if (mes >= 8) {
    return {
      nombre: anio + '-2',
      fechaInicio: aFecha(anio + '-08-01'),
      fechaFin: aFecha(anio + '-12-31'),
    };
  }

  return {
    nombre: anio + '-1',
    fechaInicio: aFecha(anio + '-03-01'),
    fechaFin: aFecha(anio + '-07-31'),
  };
}

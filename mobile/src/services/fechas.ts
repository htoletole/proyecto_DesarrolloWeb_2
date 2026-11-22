// ayudas para trabajar con fechas "AAAA-MM-DD" (la hora del celular es la de Chile)

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function aTexto(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return fecha.getFullYear() + "-" + mes + "-" + dia;
}

function aDate(texto: string): Date {
  const partes = texto.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

export function hoy(): string {
  return aTexto(new Date());
}

export function sumarDias(texto: string, dias: number): string {
  const fecha = aDate(texto);
  fecha.setDate(fecha.getDate() + dias);
  return aTexto(fecha);
}

// los 7 dias de la semana (lunes a domingo) que contienen a la fecha
export function semanaDe(texto: string): string[] {
  const fecha = aDate(texto);
  const desdeLunes = (fecha.getDay() + 6) % 7;
  const lunes = sumarDias(texto, -desdeLunes);
  const dias: string[] = [];
  for (let i = 0; i < 7; i++) {
    dias.push(sumarDias(lunes, i));
  }
  return dias;
}

export function nombreDia(texto: string): string {
  return DIAS[aDate(texto).getDay()];
}

export function numeroDia(texto: string): number {
  return aDate(texto).getDate();
}

// "2026-11-20" -> "vie 20 nov"
export function fechaCorta(texto: string): string {
  if (!texto) return "Sin fecha";
  const fecha = aDate(texto);
  return DIAS[fecha.getDay()].toLowerCase() + " " + fecha.getDate() + " " + MESES[fecha.getMonth()];
}

// "2026-11-20" -> "20 nov 2026"
export function fechaConAnio(texto: string): string {
  if (!texto) return "Sin fecha";
  const fecha = aDate(texto);
  return fecha.getDate() + " " + MESES[fecha.getMonth()] + " " + fecha.getFullYear();
}

// dias que faltan desde hoy (negativo si ya paso)
export function diasHasta(texto: string): number {
  const ms = aDate(texto).getTime() - aDate(hoy()).getTime();
  return Math.round(ms / 86400000);
}

export function textoFaltan(texto: string): string {
  const dias = diasHasta(texto);
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  if (dias < 0) return "Hace " + -dias + (dias === -1 ? " día" : " días");
  return "En " + dias + " días";
}

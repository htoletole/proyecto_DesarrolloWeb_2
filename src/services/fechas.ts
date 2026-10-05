export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

// arma el texto año-mes-dia (2026-10-06), el mes va de 0 a 11
export function armarFecha(anio: number, mes: number, dia: number): string {
  const mesTexto = String(mes + 1).padStart(2, "0");
  const diaTexto = String(dia).padStart(2, "0");
  return anio + "-" + mesTexto + "-" + diaTexto;
}

export function fechaDeHoy(): string {
  const hoy = new Date();
  return armarFecha(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

// 2026-10-06 -> Martes 6 de octubre de 2026
export function fechaLarga(fecha: string): string {
  const partes = fecha.split("-");
  const objeto = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));

  const texto = objeto.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sinComa = texto.replace(",", "");
  return sinComa.charAt(0).toUpperCase() + sinComa.slice(1);
}

// 2026-10-06 -> martes, 6 de octubre de 2026 (igual que el encabezado del inicio)
export function fechaEncabezado(fecha: string): string {
  const partes = fecha.split("-");
  const objeto = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));

  return objeto.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 2026-10-06 -> 06/10/2026
export function fechaCorta(fecha: string): string {
  const partes = fecha.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// colores de la app (los mismos de la web) y formula para que el texto se lea sobre el color de un ramo

export const COLORES = {
  azul: "#1B3F73",
  azulClaro: "#EEF2F8",
  verde: "#46937C",
  verdeOscuro: "#3B876E",
  verdeClaro: "#EEF6F1",
  morado: "#8B62DF",
  moradoClaro: "#F1ECFC",
  naranjo: "#FFAE52",
  naranjoClaro: "#FFF2E3",
  rojo: "#E0262A",
  fondo: "#F2F4FA",
  tarjeta: "#FFFFFF",
  texto: "#111827",
  textoSuave: "#6B7280",
  borde: "#E5E7EB",
};

// color de cada seccion, igual que en la web (encabezados, botones y barra de abajo)
export const COLOR_SECCION = {
  hoy: "#1B3F73",
  tareas: "#46937C",
  ramos: "#FFAE52",
  evaluaciones: "#8B62DF",
};

// colores de cada estado, los mismos del inicio de la web:
// medio = barra del titulo, claro = fondo de las tarjetas, fuerte = texto
export const COLOR_ESTADO = {
  PENDIENTE: { fuerte: "#C62828", medio: "#FF989A", claro: "#F6E0EA" },
  EN_PROGRESO: { fuerte: "#9A5B00", medio: "#FFDDB7", claro: "#FFF2E3" },
  COMPLETADA: { fuerte: "#10823C", medio: "#A0DFCA", claro: "#D0F1E6" },
};

// colores de prioridad para los filtros
export const COLOR_PRIORIDAD: Record<string, string> = {
  BAJA: "#10823C",
  MEDIA: "#1B6FC2",
  ALTA: "#C26A00",
  URGENTE: "#C62828",
};

// paleta para elegir el color de un ramo (en el celular no hay selector libre como en la web)
export const PALETA_RAMOS = [
  "#FFAE52", "#65B5FD", "#46937C", "#8B62DF", "#FF989A", "#F9D65C",
  "#1B3F73", "#E0262A", "#2CC4B0", "#A0DFCA", "#B57C4F", "#4B5563",
];

// "#ffae52" -> [255, 174, 82]
function aRgb(hex: string): [number, number, number] {
  let limpio = hex.replace("#", "");
  if (limpio.length === 3) {
    limpio = limpio[0] + limpio[0] + limpio[1] + limpio[1] + limpio[2] + limpio[2];
  }
  const numero = parseInt(limpio, 16);
  if (Number.isNaN(numero) || limpio.length !== 6) {
    return [255, 255, 255];
  }
  return [(numero >> 16) & 255, (numero >> 8) & 255, numero & 255];
}

// luminancia relativa de la WCAG (0 = negro, 1 = blanco)
function luminancia(hex: string): number {
  const canales = aRgb(hex).map((valor) => {
    const c = valor / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
}

function contraste(hex1: string, hex2: string): number {
  const l1 = luminancia(hex1);
  const l2 = luminancia(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// misma formula que la web: texto casi negro o blanco, el que mas contraste tenga con el fondo
export function colorDeTexto(fondo: string): string {
  const conOscuro = contraste("#1A1A1A", fondo);
  const conClaro = contraste("#FFFFFF", fondo);
  if (Math.max(conOscuro, conClaro) >= 4.5) {
    return conOscuro >= conClaro ? "#1A1A1A" : "#FFFFFF";
  }
  return "#000000";
}

// para texto grande y en negrita (encabezados, botones, titulos de grupos) la WCAG pide 3:1.
// asi se mantiene el texto blanco de la web sobre verde, azul y morado,
// y sobre colores claros (como el naranjo de Ramos) se usa la formula de arriba
export function colorDeTextoGrande(fondo: string): string {
  if (contraste("#FFFFFF", fondo) >= 3) {
    return "#FFFFFF";
  }
  return colorDeTexto(fondo);
}

// formulas de color para que el texto siempre se lea encima del color de un ramo

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

// contraste entre dos colores segun la WCAG (de 1 a 21; 4.5 o mas se lee bien)
export function contraste(hex1: string, hex2: string): number {
  const l1 = luminancia(hex1);
  const l2 = luminancia(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// rgb -> tono en grados (0 a 360) y saturacion (0 a 1)
function tonoYSaturacion(hex: string): [number, number] {
  const [r, g, b] = aRgb(hex).map((valor) => valor / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const luz = (max + min) / 2;

  if (delta === 0) {
    return [0, 0];
  }

  const saturacion = delta / (1 - Math.abs(2 * luz - 1));
  let tono;
  if (max === r) {
    tono = 60 * (((g - b) / delta) % 6);
  } else if (max === g) {
    tono = 60 * ((b - r) / delta + 2);
  } else {
    tono = 60 * ((r - g) / delta + 4);
  }
  if (tono < 0) {
    tono += 360;
  }
  return [tono, saturacion];
}

// tono, saturacion y luz -> "#rrggbb"
function desdeHsl(tono: number, saturacion: number, luz: number): string {
  const c = (1 - Math.abs(2 * luz - 1)) * saturacion;
  const x = c * (1 - Math.abs(((tono / 60) % 2) - 1));
  const m = luz - c / 2;

  let rgb = [0, 0, 0];
  if (tono < 60) rgb = [c, x, 0];
  else if (tono < 120) rgb = [x, c, 0];
  else if (tono < 180) rgb = [0, c, x];
  else if (tono < 240) rgb = [0, x, c];
  else if (tono < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return (
    "#" +
    rgb
      .map((valor) => Math.round((valor + m) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

const CONTRASTE_MINIMO = 4.5; // lo minimo que pide la WCAG para texto normal

// busca el complementario mas "colorido" que todavia se lee:
// parte en el extremo (casi negro o casi blanco) y se acerca al medio mientras el contraste alcance
function buscarComplementario(fondo: string, tono: number, saturacion: number, haciaOscuro: boolean): string | null {
  let luz = haciaOscuro ? 0.08 : 0.95;
  const paso = haciaOscuro ? 0.02 : -0.02;
  let mejor = desdeHsl(tono, saturacion, luz);

  // si ni siquiera el extremo se lee, este lado no sirve
  if (contraste(mejor, fondo) < CONTRASTE_MINIMO) {
    return null;
  }

  while (luz + paso > 0.05 && luz + paso < 0.98) {
    const candidato = desdeHsl(tono, saturacion, luz + paso);
    if (contraste(candidato, fondo) < CONTRASTE_MINIMO) {
      break;
    }
    luz += paso;
    mejor = candidato;
  }
  return mejor;
}

// color complementario (tono girado 180°) que siempre se lee encima del fondo
export function colorComplementario(fondo: string): string {
  const [tono, saturacion] = tonoYSaturacion(fondo);
  const fondoClaro = luminancia(fondo) > 0.18;

  // negro, blanco y grises no tienen tono: su "complementario" es el extremo opuesto
  if (saturacion >= 0.1) {
    const tonoOpuesto = (tono + 180) % 360;
    // primero se prueba el lado que mas conviene (oscuro sobre claro, claro sobre oscuro) y despues el otro
    const preferido = buscarComplementario(fondo, tonoOpuesto, saturacion, fondoClaro);
    if (preferido) return preferido;
    const otro = buscarComplementario(fondo, tonoOpuesto, saturacion, !fondoClaro);
    if (otro) return otro;
  }

  // ultimo recurso: casi negro o casi blanco, y si no alcanza, negro o blanco puro
  // (con cualquier fondo, uno de los dos siempre pasa de 4.5)
  const oscuro = contraste("#1a1a1a", fondo) >= CONTRASTE_MINIMO ? "#1a1a1a" : "#000000";
  const claro = contraste("#f5f5f5", fondo) >= CONTRASTE_MINIMO ? "#f5f5f5" : "#ffffff";
  return contraste(oscuro, fondo) >= contraste(claro, fondo) ? oscuro : claro;
}

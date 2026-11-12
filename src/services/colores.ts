// formula de color para que el texto siempre se lea encima del color de un ramo
// el texto va en escala de grises (casi negro o blanco), asi calza con cualquier color

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

const TEXTO_OSCURO = "#1a1a1a"; // casi negro, un poco mas suave que el negro puro
const TEXTO_CLARO = "#ffffff";

// elige el gris (casi negro o blanco) que mas contrasta con el fondo
export function colorDeTexto(fondo: string): string {
  const conOscuro = contraste(TEXTO_OSCURO, fondo);
  const conClaro = contraste(TEXTO_CLARO, fondo);

  // si el mejor de los dos ya se lee bien (4.5 o mas, segun la WCAG), se usa ese
  if (Math.max(conOscuro, conClaro) >= 4.5) {
    return conOscuro >= conClaro ? TEXTO_OSCURO : TEXTO_CLARO;
  }

  // en algunos tonos medios ninguno alcanza: ahi el negro puro siempre llega a 4.5
  return "#000000";
}

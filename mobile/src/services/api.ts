// cliente HTTP comun para hablar con la API del Hito 3 (la misma que usa la web)

// direccion de la API: se configura en mobile/.env (EXPO_PUBLIC_API_URL)
export const URL_API = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.20:3000/api";

// si la API no responde en este tiempo se avisa al usuario
const TIEMPO_MAXIMO_MS = 10000;

// el token lo deja aqui sesion.tsx al iniciar sesion
let tokenActual = "";
// funcion que cierra la sesion cuando la API responde 401 (token vencido)
let alVencerSesion: () => void = () => {};

export function guardarToken(token: string) {
  tokenActual = token;
}

export function registrarCierreDeSesion(funcion: () => void) {
  alVencerSesion = funcion;
}

// hace la peticion y devuelve el JSON; si algo falla lanza un Error con un mensaje para el usuario
export async function pedir<T>(ruta: string, metodo = "GET", cuerpo?: unknown): Promise<T> {
  const cabeceras: Record<string, string> = { "Content-Type": "application/json" };
  if (tokenActual) {
    cabeceras.Authorization = "Bearer " + tokenActual;
  }

  // si la red se queda pegada, se corta la peticion
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_MAXIMO_MS);

  let respuesta: Response;
  try {
    respuesta = await fetch(URL_API + ruta, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: control.signal,
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Revisa que el celular y el PC estén en la misma red Wi-Fi.",
    );
  } finally {
    clearTimeout(temporizador);
  }

  // 204: se borro algo y no hay nada que leer
  if (respuesta.status === 204) {
    return undefined as T;
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // si el token vencio, se cierra la sesion y vuelve el login
    if (respuesta.status === 401 && tokenActual) {
      alVencerSesion();
    }
    throw new Error(mensajeDeError(datos));
  }

  return datos as T;
}

// la API manda el mensaje como texto o como lista (uno por campo)
function mensajeDeError(datos: { message?: string | string[] } | null): string {
  if (!datos || !datos.message) {
    return "Ocurrió un error, intenta de nuevo.";
  }
  if (Array.isArray(datos.message)) {
    return datos.message.join(". ");
  }
  return datos.message;
}

// "2026-11-20T00:00:00.000Z" -> "2026-11-20"
export function soloFecha(texto: string | null | undefined): string {
  if (!texto) {
    return "";
  }
  return texto.slice(0, 10);
}

// cliente HTTP comun para hablar con la API de Syllab
import { ejecutarCerrarSesion } from "./authEvents";

// direccion de la API, se cambia en el archivo .env del frontend (VITE_API_URL)
export const URL_API = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const CLAVE_SESION = "syllab_sesion";

// el token se guarda junto con la sesion (lo deja ahi auth.ts al iniciar sesion)
function tokenActual(): string {
  const texto = sessionStorage.getItem(CLAVE_SESION);
  if (!texto) {
    return "";
  }
  try {
    return JSON.parse(texto).token ?? "";
  } catch {
    return "";
  }
}

// hace la peticion y devuelve el JSON; si algo falla lanza un Error con un mensaje para el usuario
export async function pedir<T>(ruta: string, metodo = "GET", cuerpo?: unknown): Promise<T> {
  const cabeceras: Record<string, string> = { "Content-Type": "application/json" };
  const token = tokenActual();
  if (token) {
    cabeceras.Authorization = "Bearer " + token;
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(URL_API + ruta, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisa que la API esté encendida.");
  }

  // 204: se borro algo y no hay nada que leer
  if (respuesta.status === 204) {
    return undefined as T;
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // si el token vencio, se cierra la sesion y vuelve el login
    if (respuesta.status === 401 && token) {
      ejecutarCerrarSesion();
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
export function soloFecha(texto: string | null | undefined): string | null {
  if (!texto) {
    return null;
  }
  return texto.slice(0, 10);
}

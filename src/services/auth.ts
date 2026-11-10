// login, registro y sesion: ahora los usuarios viven en la base de datos y se consultan por la API
import { pedir } from "./api";

// tipos

export interface Usuario {
  id: number;
  username: string;
}

// lo que se guarda de la sesion: el usuario y su token (nunca la contrasena)
export interface Sesion {
  id: number;
  username: string;
  token: string;
}

// si falla, sesion es null y error trae el mensaje
export interface Resultado {
  sesion: Sesion | null;
  error: string;
}

// lo que responde la API al entrar o registrarse
interface RespuestaSesion {
  token: string;
  usuario: Usuario;
}

// constantes

export const MIN_PASSWORD = 8;

const CLAVE_RECORDADO = "syllab_recordado";
const CLAVE_SESION = "syllab_sesion";

// nombre del aviso que se manda cuando alguien entra o sale
export const EVENTO_SESION = "syllab_sesion_cambio";

// login, registro y restablecer contrasena

export async function iniciarSesion(username: string, password: string): Promise<Resultado> {
  if (username.trim() === "" || password === "") {
    return { sesion: null, error: "Completa usuario y contraseña." };
  }

  try {
    const respuesta = await pedir<RespuestaSesion>("/auth/login", "POST", {
      username: username.trim(),
      password: password,
    });
    return { sesion: armarSesion(respuesta), error: "" };
  } catch (error) {
    return { sesion: null, error: (error as Error).message };
  }
}

export async function registrar(username: string, password: string): Promise<Resultado> {
  // revisamos lo basico antes de llamar a la API (la API vuelve a validar todo)
  if (username.trim() === "") {
    return { sesion: null, error: "Ingresa un nombre de usuario." };
  }
  if (password.length < MIN_PASSWORD) {
    return { sesion: null, error: "La contraseña debe tener al menos " + MIN_PASSWORD + " caracteres." };
  }

  try {
    const respuesta = await pedir<RespuestaSesion>("/auth/registro", "POST", {
      username: username.trim(),
      password: password,
    });
    return { sesion: armarSesion(respuesta), error: "" };
  } catch (error) {
    return { sesion: null, error: (error as Error).message };
  }
}

// devuelve "" si salio bien, o el mensaje de error
export async function restablecerPassword(username: string, nueva: string, repetida: string): Promise<string> {
  if (username.trim() === "") {
    return "Ingresa tu nombre de usuario.";
  }
  if (nueva.length < MIN_PASSWORD) {
    return "La contraseña debe tener al menos " + MIN_PASSWORD + " caracteres.";
  }
  if (nueva !== repetida) {
    return "Las contraseñas no coinciden.";
  }

  try {
    await pedir("/auth/restablecer", "POST", { username: username.trim(), nueva, repetida });
    return "";
  } catch (error) {
    return (error as Error).message;
  }
}

function armarSesion(respuesta: RespuestaSesion): Sesion {
  return { id: respuesta.usuario.id, username: respuesta.usuario.username, token: respuesta.token };
}

// usuario recordado, para la pantalla de bienvenida (guarda su token para entrar sin clave)

export function obtenerRecordado(): Sesion | null {
  return leer(localStorage.getItem(CLAVE_RECORDADO));
}

export function recordarUsuario(sesion: Sesion | null) {
  if (sesion === null) {
    localStorage.removeItem(CLAVE_RECORDADO);
  } else {
    localStorage.setItem(CLAVE_RECORDADO, JSON.stringify(sesion));
  }
}

// sesion activa, dura mientras la pestana este abierta

export function obtenerSesion(): Sesion | null {
  return leer(sessionStorage.getItem(CLAVE_SESION));
}

export function guardarSesion(sesion: Sesion | null) {
  if (sesion === null) {
    sessionStorage.removeItem(CLAVE_SESION);
  } else {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  // avisa a las pantallas que la sesion cambio
  window.dispatchEvent(new Event(EVENTO_SESION));
}

// si el texto guardado esta danado o es de la version anterior, se ignora
function leer(texto: string | null): Sesion | null {
  if (!texto) {
    return null;
  }
  try {
    const datos = JSON.parse(texto);
    if (!datos.token) {
      return null;
    }
    return datos;
  } catch {
    return null;
  }
}

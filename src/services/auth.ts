import usuariosIniciales from "../data/users.json";

export interface Usuario {
  id: number;
  username: string;
  password: string;
}

export type Sesion = Pick<Usuario, "id" | "username">;

export type Resultado = { ok: true; usuario: Usuario } | { ok: false; error: string };

export const MIN_PASSWORD = 8;

const CLAVE_USUARIOS = "syllab_usuarios";
const CLAVE_RECORDADO = "syllab_recordado";
const CLAVE_SESION = "syllab_sesion";

const msgPasswordCorta = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;

// Los usuarios viven en localStorage; users.json solo da los datos iniciales.
export function obtenerUsuarios(): Usuario[] {
  try {
    const guardados: unknown = JSON.parse(localStorage.getItem(CLAVE_USUARIOS) ?? "null");
    if (Array.isArray(guardados)) return guardados as Usuario[];
  } catch {
    // JSON dañado o storage bloqueado: se parte desde los datos iniciales
  }
  guardarUsuarios(usuariosIniciales);
  return usuariosIniciales.slice();
}

function guardarUsuarios(usuarios: Usuario[]): void {
  try {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
  } catch {
    // sin persistencia, la app sigue funcionando en memoria
  }
}

function buscarUsuario(username: string): Usuario | undefined {
  const nombre = username.trim().toLowerCase();
  return obtenerUsuarios().find((u) => u.username.toLowerCase() === nombre);
}

export function registrar(username: string, password: string): Resultado {
  const nombre = username.trim();
  if (!nombre) return { ok: false, error: "Ingresa un nombre de usuario." };
  if (password.length < MIN_PASSWORD) return { ok: false, error: msgPasswordCorta };
  if (buscarUsuario(nombre)) return { ok: false, error: "Ese nombre de usuario ya existe." };

  const usuario: Usuario = { id: Date.now(), username: nombre, password };
  guardarUsuarios([...obtenerUsuarios(), usuario]);
  return { ok: true, usuario };
}

export function iniciarSesion(username: string, password: string): Resultado {
  if (!username.trim() || !password) {
    return { ok: false, error: "Completa usuario y contraseña." };
  }
  const usuario = buscarUsuario(username);
  if (!usuario || usuario.password !== password) {
    return { ok: false, error: "Usuario o contraseña incorrectos." };
  }
  return { ok: true, usuario };
}

export function restablecerPassword(username: string, nueva: string, repetida: string): Resultado {
  if (!username.trim()) return { ok: false, error: "Ingresa tu nombre de usuario." };
  if (nueva.length < MIN_PASSWORD) return { ok: false, error: msgPasswordCorta };
  if (nueva !== repetida) return { ok: false, error: "Las contraseñas no coinciden." };

  const usuario = buscarUsuario(username);
  if (!usuario) return { ok: false, error: "No existe un usuario con ese nombre." };

  const actualizado: Usuario = { ...usuario, password: nueva };
  guardarUsuarios(obtenerUsuarios().map((u) => (u.id === usuario.id ? actualizado : u)));
  return { ok: true, usuario: actualizado };
}

// "Recordarme": guarda el último usuario para la pantalla de bienvenida.
export function obtenerRecordado(): Usuario | null {
  try {
    const nombre = localStorage.getItem(CLAVE_RECORDADO);
    return nombre ? (buscarUsuario(nombre) ?? null) : null;
  } catch {
    return null;
  }
}

export function recordarUsuario(username: string | null): void {
  try {
    if (username) localStorage.setItem(CLAVE_RECORDADO, username);
    else localStorage.removeItem(CLAVE_RECORDADO);
  } catch {
    // opcional
  }
}

// La sesión activa dura lo que dure la pestaña.
export function obtenerSesion(): Sesion | null {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? "null") as Sesion | null;
  } catch {
    return null;
  }
}

export function guardarSesion(usuario: Usuario | null): void {
  try {
    if (usuario) {
      const sesion: Sesion = { id: usuario.id, username: usuario.username };
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } else {
      sessionStorage.removeItem(CLAVE_SESION);
    }
  } catch {
    // opcional
  }
}

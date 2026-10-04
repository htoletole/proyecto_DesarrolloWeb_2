import usuariosIniciales from "../data/users.json";

// tipos

export interface Usuario {
  id: number;
  username: string;
  password: string;
}

// lo que se guarda de la sesion, sin la contrasena
export interface Sesion {
  id: number;
  username: string;
}

// si falla, usuario es null y error trae el mensaje
export interface Resultado {
  usuario: Usuario | null;
  error: string;
}

// constantes

export const MIN_PASSWORD = 8;

const CLAVE_USUARIOS = "syllab_usuarios";
const CLAVE_RECORDADO = "syllab_recordado";
const CLAVE_SESION = "syllab_sesion";

// usuarios, se guardan en localStorage

export function obtenerUsuarios(): Usuario[] {
  const texto = localStorage.getItem(CLAVE_USUARIOS);

  // la primera vez no hay nada guardado, usamos los usuarios iniciales
  if (texto === null) {
    guardarUsuarios(usuariosIniciales);
    return usuariosIniciales;
  }

  return JSON.parse(texto);
}

function guardarUsuarios(usuarios: Usuario[]) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

// devuelve el usuario o null si no existe
function buscarUsuario(username: string): Usuario | null {
  const nombre = username.trim().toLowerCase();
  const usuarios = obtenerUsuarios();

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].username.toLowerCase() === nombre) {
      return usuarios[i];
    }
  }

  return null;
}

// login, registro y restablecer contrasena

export function iniciarSesion(username: string, password: string): Resultado {
  if (username.trim() === "" || password === "") {
    return { usuario: null, error: "Completa usuario y contraseña." };
  }

  const usuario = buscarUsuario(username);

  if (usuario === null || usuario.password !== password) {
    return { usuario: null, error: "Usuario o contraseña incorrectos." };
  }

  return { usuario: usuario, error: "" };
}

export function registrar(username: string, password: string): Resultado {
  const nombre = username.trim();

  if (nombre === "") {
    return { usuario: null, error: "Ingresa un nombre de usuario." };
  }
  if (password.length < MIN_PASSWORD) {
    return { usuario: null, error: "La contraseña debe tener al menos " + MIN_PASSWORD + " caracteres." };
  }
  if (buscarUsuario(nombre) !== null) {
    return { usuario: null, error: "Ese nombre de usuario ya existe." };
  }

  const nuevo: Usuario = { id: Date.now(), username: nombre, password: password };

  const usuarios = obtenerUsuarios();
  usuarios.push(nuevo);
  guardarUsuarios(usuarios);

  return { usuario: nuevo, error: "" };
}

export function restablecerPassword(username: string, nueva: string, repetida: string): Resultado {
  if (username.trim() === "") {
    return { usuario: null, error: "Ingresa tu nombre de usuario." };
  }
  if (nueva.length < MIN_PASSWORD) {
    return { usuario: null, error: "La contraseña debe tener al menos " + MIN_PASSWORD + " caracteres." };
  }
  if (nueva !== repetida) {
    return { usuario: null, error: "Las contraseñas no coinciden." };
  }

  const usuario = buscarUsuario(username);

  if (usuario === null) {
    return { usuario: null, error: "No existe un usuario con ese nombre." };
  }

  // cambiamos la clave y guardamos la lista
  usuario.password = nueva;

  const usuarios = obtenerUsuarios();
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id === usuario.id) {
      usuarios[i].password = nueva;
    }
  }
  guardarUsuarios(usuarios);

  return { usuario: usuario, error: "" };
}

// usuario recordado, para la pantalla de bienvenida

export function obtenerRecordado(): Usuario | null {
  const nombre = localStorage.getItem(CLAVE_RECORDADO);

  if (nombre === null) {
    return null;
  }

  return buscarUsuario(nombre);
}

export function recordarUsuario(username: string | null) {
  if (username === null) {
    localStorage.removeItem(CLAVE_RECORDADO);
  } else {
    localStorage.setItem(CLAVE_RECORDADO, username);
  }
}

// sesion activa, dura mientras la pestana este abierta

export function obtenerSesion(): Sesion | null {
  const texto = sessionStorage.getItem(CLAVE_SESION);

  if (texto === null) {
    return null;
  }

  return JSON.parse(texto);
}

export function guardarSesion(usuario: Usuario | null) {
  if (usuario === null) {
    sessionStorage.removeItem(CLAVE_SESION);
  } else {
    const sesion: Sesion = { id: usuario.id, username: usuario.username };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }
}

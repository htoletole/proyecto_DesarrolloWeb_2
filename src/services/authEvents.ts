let cerrarSesionCallback: (() => void) | null = null;

export function registrarCerrarSesion(callback: () => void) {
  cerrarSesionCallback = callback;
}

export function ejecutarCerrarSesion() {
  cerrarSesionCallback?.();
}

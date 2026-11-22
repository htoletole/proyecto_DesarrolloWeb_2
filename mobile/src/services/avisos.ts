// aviso que deja un formulario al guardar, para mostrarlo en la pantalla a la que se vuelve
export type AvisoPendiente = { tipo: "exito" | "error"; texto: string };

let pendiente: AvisoPendiente | null = null;

export function dejarAviso(tipo: "exito" | "error", texto: string) {
  pendiente = { tipo, texto };
}

// lo devuelve una sola vez
export function tomarAviso(): AvisoPendiente | null {
  const aviso = pendiente;
  pendiente = null;
  return aviso;
}

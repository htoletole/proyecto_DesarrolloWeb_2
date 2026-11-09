// un cambio de un campo, para guardarlo en el historial
export interface Cambio {
  antes: unknown;
  despues: unknown;
}

// compara dos versiones de un registro y devuelve solo los campos que cambiaron
export function compararCambios(antes: object, despues: object, campos: string[]) {
  const cambios: Record<string, Cambio> = {};

  for (const campo of campos) {
    const valorAntes = normalizar(antes[campo]);
    const valorDespues = normalizar(despues[campo]);

    if (valorAntes !== valorDespues) {
      cambios[campo] = { antes: valorAntes, despues: valorDespues };
    }
  }

  return cambios;
}

// deja las fechas como AAAA-MM-DD y los vacios como null, para poder compararlos
function normalizar(valor: unknown) {
  if (valor instanceof Date) {
    return valor.toISOString().slice(0, 10);
  }
  if (valor === undefined) {
    return null;
  }
  return valor;
}

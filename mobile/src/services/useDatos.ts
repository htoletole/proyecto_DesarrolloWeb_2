// carga datos de la API con sus estados: cargando, error, refrescando (deslizar hacia abajo)
// y vuelve a pedirlos cada vez que la pantalla queda visible (por ejemplo al volver del detalle)
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

export function useDatos<T>(pedirDatos: () => Promise<T>) {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");
  const primeraVez = useRef(true);

  const cargar = useCallback(
    async (modo: "inicial" | "refrescar" | "silencioso") => {
      if (modo === "inicial") setCargando(true);
      if (modo === "refrescar") setRefrescando(true);
      try {
        const nuevos = await pedirDatos();
        setDatos(nuevos);
        setError("");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [],
  );

  // la primera vez se muestra la carga completa; al volver a la pantalla se actualiza sin taparla
  useFocusEffect(
    useCallback(() => {
      cargar(primeraVez.current ? "inicial" : "silencioso");
      primeraVez.current = false;
    }, [cargar]),
  );

  return {
    datos,
    cargando,
    refrescando,
    error,
    reintentar: () => cargar("inicial"),
    refrescar: () => cargar("refrescar"),
  };
}

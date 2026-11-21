// aviso corto arriba de la pantalla para confirmar (verde) o avisar un error (rojo)
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { tomarAviso } from "../services/avisos";

type TipoAviso = "exito" | "error";

type DatosAviso = { tipo: TipoAviso; texto: string } | null;

// devuelve el componente del aviso y la funcion para mostrarlo
export function useAviso() {
  const [aviso, setAviso] = useState<DatosAviso>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  function mostrar(tipo: TipoAviso, texto: string) {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAviso({ tipo, texto });
    // los errores se quedan un poco mas para alcanzar a leerlos
    temporizador.current = setTimeout(() => setAviso(null), tipo === "error" ? 5000 : 2500);
  }

  // si un formulario dejo un aviso al guardar, se muestra al volver a esta pantalla
  useFocusEffect(
    useCallback(() => {
      const pendiente = tomarAviso();
      if (pendiente) mostrar(pendiente.tipo, pendiente.texto);
    }, []),
  );

  const elemento = aviso ? (
    <View
      style={[estilos.aviso, aviso.tipo === "exito" ? estilos.exito : estilos.error]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Ionicons
        name={aviso.tipo === "exito" ? "checkmark-circle" : "alert-circle"}
        size={22}
        color="#FFFFFF"
      />
      <Text style={estilos.texto}>{aviso.texto}</Text>
    </View>
  ) : null;

  return { elementoAviso: elemento, mostrarAviso: mostrar };
}

const estilos = StyleSheet.create({
  aviso: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  exito: { backgroundColor: "#10823C" },
  error: { backgroundColor: "#C92A2A" },
  texto: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

// estados de interfaz que se repiten en todas las pantallas: carga, error y vacio
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORES } from "../services/colores";

export function Cargando({ texto = "Cargando..." }: { texto?: string }) {
  return (
    <View style={estilos.centro} accessibilityLabel={texto}>
      <ActivityIndicator size="large" color={COLORES.azul} />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

// muestra el mensaje de la API y un boton para volver a intentar
export function ErrorCarga({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <View style={estilos.centro}>
      <Ionicons name="cloud-offline-outline" size={48} color={COLORES.rojo} />
      <Text style={estilos.titulo}>No se pudieron cargar los datos</Text>
      <Text style={estilos.texto}>{mensaje}</Text>
      <Pressable
        style={({ pressed }) => [estilos.boton, pressed && { opacity: 0.8 }]}
        onPress={onReintentar}
        accessibilityRole="button"
      >
        <Ionicons name="refresh" size={18} color="#FFFFFF" />
        <Text style={estilos.textoBoton}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

export function Vacio({ icono, titulo, texto }: { icono: keyof typeof Ionicons.glyphMap; titulo: string; texto?: string }) {
  return (
    <View style={estilos.vacio}>
      <Ionicons name={icono} size={40} color={COLORES.textoSuave} />
      <Text style={estilos.titulo}>{titulo}</Text>
      {texto ? <Text style={estilos.texto}>{texto}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  vacio: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 6,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORES.texto,
    textAlign: "center",
  },
  texto: {
    fontSize: 15,
    color: COLORES.textoSuave,
    textAlign: "center",
  },
  boton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORES.azul,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});

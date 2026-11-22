// boton redondo abajo a la derecha para crear (como el "Crear ..." de la web)
import { Pressable, StyleSheet, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colorDeTextoGrande } from "../services/colores";

export function BotonFlotante({ texto, color, onPress }: { texto: string; color: string; onPress: () => void }) {
  const colorTexto = colorDeTextoGrande(color);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.boton, { backgroundColor: color }, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={texto}
    >
      <Ionicons name="add" size={24} color={colorTexto} />
      <Text style={[estilos.texto, { color: colorTexto }]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    position: "absolute",
    right: 16,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  texto: {
    fontSize: 16,
    fontWeight: "800",
  },
});

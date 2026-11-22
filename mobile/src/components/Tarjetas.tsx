// piezas que se repiten en las listas: chip de estado, tarjeta de tarea, tarjeta de evaluacion y barra de avance
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Estado, Evaluacion, Tarea } from "../services/agenda";
import { textoEstado, textoPrioridad, textoTipo } from "../services/agenda";
import { COLORES, COLOR_ESTADO, colorDeTexto } from "../services/colores";
import { fechaCorta, textoFaltan } from "../services/fechas";

export function ChipEstado({ estado }: { estado: Estado }) {
  const color = COLOR_ESTADO[estado];
  return (
    <View style={[estilos.chip, { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: color.medio }]}>
      <Text style={[estilos.textoChip, { color: color.fuerte }]}>{textoEstado(estado)}</Text>
    </View>
  );
}

export function BarraAvance({ porcentaje, color }: { porcentaje: number; color: string }) {
  const valor = Math.max(0, Math.min(100, porcentaje));
  return (
    <View style={estilos.barra} accessibilityLabel={"Avance " + valor + "%"}>
      <View style={[estilos.relleno, { width: valor + "%", backgroundColor: color }]} />
    </View>
  );
}

// tarjeta de tarea con los colores de la web:
// estilo "estado" -> fondo claro del estado (como los bloques Pendientes / En progreso / Completadas del inicio)
// estilo "ramo"   -> fondo con el color del ramo y texto legible encima (como el panel de Tareas)
export function TarjetaTarea({
  tarea,
  onPress,
  mostrarFecha = true,
  estilo = "estado",
}: {
  tarea: Tarea;
  onPress: () => void;
  mostrarFecha?: boolean;
  estilo?: "estado" | "ramo";
}) {
  const hechas = tarea.subtareas.filter((s) => s.completada).length;
  const vencida = tarea.estado !== "COMPLETADA" && tarea.fecha !== "" && textoFaltan(tarea.fecha).startsWith("Hace");

  const fondo = estilo === "ramo" ? tarea.ramo.color : COLOR_ESTADO[tarea.estado].claro;
  const texto = estilo === "ramo" ? colorDeTexto(fondo) : "#495E85";
  const textoTitulo = estilo === "ramo" ? texto : COLORES.texto;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.tarjeta, { backgroundColor: fondo, borderColor: "transparent" }, pressed && estilos.presionada]}
      accessibilityRole="button"
      accessibilityLabel={"Tarea " + tarea.nombre + ", " + textoEstado(tarea.estado)}
    >
      {estilo === "estado" ? <View style={[estilos.franja, { backgroundColor: tarea.ramo.color }]} /> : <View style={{ width: 4 }} />}
      <View style={estilos.cuerpo}>
        <View style={estilos.fila}>
          <Text style={[estilos.ramo, { color: texto }]} numberOfLines={1}>{tarea.ramo.nombre}</Text>
          <ChipEstado estado={tarea.estado} />
        </View>
        <Text style={[estilos.titulo, { color: textoTitulo }, tarea.estado === "COMPLETADA" && estilos.tachado]} numberOfLines={2}>
          {tarea.nombre}
        </Text>
        <View style={estilos.detalles}>
          {mostrarFecha ? (
            <Text style={[estilos.dato, { color: texto }, vencida && { fontWeight: "800" }]}>
              <Ionicons name="calendar-outline" size={13} /> {fechaCorta(tarea.fecha)}
              {vencida ? " · vencida" : ""}
            </Text>
          ) : null}
          <Text style={[estilos.dato, { color: texto }]}>
            <Ionicons name="flag-outline" size={13} /> {textoPrioridad(tarea.prioridad)}
          </Text>
          {tarea.subtareas.length > 0 ? (
            <Text style={[estilos.dato, { color: texto }]}>
              <Ionicons name="checkbox-outline" size={13} /> {hechas}/{tarea.subtareas.length}
            </Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={texto} style={{ alignSelf: "center" }} />
    </Pressable>
  );
}

export function TarjetaEvaluacion({ evaluacion, onPress }: { evaluacion: Evaluacion; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={"Evaluación " + evaluacion.nombre}
    >
      <View style={[estilos.franja, { backgroundColor: evaluacion.ramo.color }]} />
      <View style={estilos.cuerpo}>
        <View style={estilos.fila}>
          <Text style={estilos.ramo} numberOfLines={1}>{evaluacion.ramo.nombre}</Text>
          <View style={[estilos.chip, { backgroundColor: COLORES.moradoClaro }]}>
            <Text style={[estilos.textoChip, { color: COLORES.morado }]}>{textoTipo(evaluacion.tipo)}</Text>
          </View>
        </View>
        <Text style={estilos.titulo}>{evaluacion.nombre}</Text>
        <View style={estilos.detalles}>
          <Text style={estilos.dato}>
            <Ionicons name="calendar-outline" size={13} /> {fechaCorta(evaluacion.fecha)} · {textoFaltan(evaluacion.fecha)}
          </Text>
          <Text style={estilos.dato}>{evaluacion.ponderacion}%</Text>
          <Text style={[estilos.dato, { fontWeight: "700", color: COLORES.texto }]}>
            {evaluacion.nota !== null ? "Nota " + evaluacion.nota.toFixed(1) : "Sin nota"}
          </Text>
        </View>
      </View>
      {onPress ? <Ionicons name="create-outline" size={20} color={COLORES.morado} style={{ alignSelf: "center" }} /> : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  textoChip: {
    fontSize: 12,
    fontWeight: "700",
  },
  barra: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORES.borde,
    overflow: "hidden",
  },
  relleno: {
    height: "100%",
    borderRadius: 5,
  },
  tarjeta: {
    flexDirection: "row",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 14,
    marginBottom: 10,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: COLORES.borde,
    overflow: "hidden",
  },
  presionada: {
    opacity: 0.75,
  },
  franja: {
    width: 6,
  },
  cuerpo: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  ramo: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORES.texto,
  },
  tachado: {
    textDecorationLine: "line-through",
    color: COLORES.textoSuave,
  },
  detalles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 2,
  },
  dato: {
    fontSize: 13,
    color: COLORES.textoSuave,
  },
});

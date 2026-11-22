// detalle de una tarea: aqui se actualiza su estado y su avance (subtareas)
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  cambiarEstado,
  crearSubtarea,
  ESTADOS,
  marcarSubtarea,
  obtenerTarea,
  textoEstado,
  textoPrioridad,
} from "../../services/agenda";
import type { Estado, Subtarea, Tarea } from "../../services/agenda";
import { useDatos } from "../../services/useDatos";
import { COLORES, COLOR_ESTADO } from "../../services/colores";
import { fechaCorta, textoFaltan } from "../../services/fechas";
import { Cargando, ErrorCarga } from "../../components/Estados";
import { BarraAvance } from "../../components/Tarjetas";
import { useAviso } from "../../components/Aviso";

const ICONO_ESTADO: Record<Estado, keyof typeof Ionicons.glyphMap> = {
  PENDIENTE: "time-outline",
  EN_PROGRESO: "play-circle-outline",
  COMPLETADA: "checkmark-circle-outline",
};

export default function DetalleTarea() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idTarea = Number(id);
  const { datos, cargando, error, reintentar } = useDatos(() => obtenerTarea(idTarea));
  const { elementoAviso, mostrarAviso } = useAviso();

  // copia local para mostrar los cambios apenas responde la API
  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [guardando, setGuardando] = useState<string>("");
  const [nuevaSubtarea, setNuevaSubtarea] = useState("");

  useEffect(() => {
    if (datos) setTarea(datos);
  }, [datos]);

  if (cargando) return <Cargando texto="Cargando tarea..." />;
  if (error && !tarea) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;
  if (!tarea) return null;

  const hechas = tarea.subtareas.filter((s) => s.completada).length;
  const porcentaje = tarea.subtareas.length > 0 ? Math.round((hechas * 100) / tarea.subtareas.length) : tarea.estado === "COMPLETADA" ? 100 : 0;

  async function actualizarEstado(estado: Estado) {
    if (!tarea || estado === tarea.estado || guardando) return;
    setGuardando("estado-" + estado);
    try {
      const actualizada = await cambiarEstado(tarea.id, estado);
      setTarea(actualizada);
      mostrarAviso("exito", "Estado actualizado a «" + textoEstado(estado) + "»");
    } catch (e) {
      // por ejemplo: no se puede completar con subtareas pendientes (409)
      mostrarAviso("error", (e as Error).message);
    } finally {
      setGuardando("");
    }
  }

  async function alternarSubtarea(subtarea: Subtarea) {
    if (!tarea || guardando) return;
    setGuardando("sub-" + subtarea.id);
    try {
      await marcarSubtarea(subtarea.id, !subtarea.completada);
      // se vuelve a pedir la tarea porque la API puede cambiar su estado (reabrirla)
      setTarea(await obtenerTarea(tarea.id));
      mostrarAviso("exito", subtarea.completada ? "Subtarea marcada como pendiente" : "Subtarea completada");
    } catch (e) {
      mostrarAviso("error", (e as Error).message);
    } finally {
      setGuardando("");
    }
  }

  async function agregarSubtarea() {
    if (!tarea || guardando) return;
    const nombre = nuevaSubtarea.trim();
    if (nombre === "") {
      mostrarAviso("error", "Escribe el nombre de la subtarea.");
      return;
    }
    setGuardando("nueva");
    try {
      await crearSubtarea(tarea.id, nombre);
      setTarea(await obtenerTarea(tarea.id));
      setNuevaSubtarea("");
      mostrarAviso("exito", "Subtarea agregada");
    } catch (e) {
      mostrarAviso("error", (e as Error).message);
    } finally {
      setGuardando("");
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen
        options={{
          title: tarea.ramo.nombre,
          headerRight: () => (
            <Pressable
              onPress={() => router.push({ pathname: "/tarea/formulario", params: { id: String(tarea.id) } })}
              style={{ paddingHorizontal: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Editar tarea"
            >
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </Pressable>
          ),
        }}
      />
      {elementoAviso}
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        {/* encabezado con el color del ramo */}
        <View style={estilos.tarjeta}>
          <View style={[estilos.etiquetaRamo, { backgroundColor: tarea.ramo.color }]} />
          <Text style={estilos.titulo}>{tarea.nombre}</Text>
          <View style={estilos.datos}>
            <Text style={estilos.dato}>
              <Ionicons name="calendar-outline" size={14} /> {fechaCorta(tarea.fecha)}
              {tarea.fecha ? " · " + textoFaltan(tarea.fecha) : ""}
            </Text>
            {tarea.horaEntrega ? (
              <Text style={estilos.dato}>
                <Ionicons name="time-outline" size={14} /> {tarea.horaEntrega}
              </Text>
            ) : null}
            <Text style={estilos.dato}>
              <Ionicons name="flag-outline" size={14} /> {textoPrioridad(tarea.prioridad)}
            </Text>
          </View>
          {tarea.descripcion ? <Text style={estilos.descripcion}>{tarea.descripcion}</Text> : null}
        </View>

        {/* estado: botones grandes para tocar con el dedo */}
        <Text style={estilos.seccion}>Estado</Text>
        <View style={estilos.estados}>
          {ESTADOS.map((e) => {
            const activo = tarea.estado === e.valor;
            const color = COLOR_ESTADO[e.valor];
            return (
              <Pressable
                key={e.valor}
                onPress={() => actualizarEstado(e.valor)}
                disabled={guardando !== ""}
                style={[
                  estilos.botonEstado,
                  { borderColor: activo ? color.fuerte : COLORES.borde, backgroundColor: activo ? color.claro : COLORES.tarjeta },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: activo, disabled: guardando !== "" }}
                accessibilityLabel={e.texto}
              >
                {guardando === "estado-" + e.valor ? (
                  <ActivityIndicator color={color.fuerte} />
                ) : (
                  <Ionicons name={ICONO_ESTADO[e.valor]} size={24} color={activo ? color.fuerte : COLORES.textoSuave} />
                )}
                <Text style={[estilos.textoEstado, { color: activo ? color.fuerte : COLORES.texto }]}>{e.texto}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* avance: subtareas con casilla */}
        <View style={estilos.filaSeccion}>
          <Text style={estilos.seccion}>Avance</Text>
          <Text style={estilos.porcentaje}>{porcentaje}%</Text>
        </View>
        <BarraAvance porcentaje={porcentaje} color={COLOR_ESTADO[tarea.estado].fuerte} />
        <Text style={estilos.ayuda}>
          {tarea.subtareas.length > 0
            ? hechas + " de " + tarea.subtareas.length + " subtareas listas"
            : "Agrega subtareas para dividir el trabajo en pasos."}
        </Text>

        <View style={estilos.tarjetaLista}>
          {tarea.subtareas.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => alternarSubtarea(s)}
              disabled={guardando !== ""}
              style={({ pressed }) => [estilos.subtarea, pressed && { backgroundColor: COLORES.fondo }]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: s.completada }}
            >
              {guardando === "sub-" + s.id ? (
                <ActivityIndicator color={COLORES.verde} style={{ width: 26 }} />
              ) : (
                <Ionicons name={s.completada ? "checkbox" : "square-outline"} size={26} color={s.completada ? COLORES.verde : COLORES.textoSuave} />
              )}
              <Text style={[estilos.textoSubtarea, s.completada && estilos.tachado]}>{s.nombre}</Text>
            </Pressable>
          ))}

          <View style={estilos.nueva}>
            <TextInput
              style={estilos.campo}
              value={nuevaSubtarea}
              onChangeText={setNuevaSubtarea}
              placeholder="Nueva subtarea"
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={agregarSubtarea}
              editable={guardando === ""}
            />
            <Pressable
              onPress={agregarSubtarea}
              disabled={guardando !== ""}
              style={({ pressed }) => [estilos.botonAgregar, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel="Agregar subtarea"
            >
              {guardando === "nueva" ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="add" size={26} color="#FFFFFF" />}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 40,
  },
  tarjeta: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    gap: 8,
  },
  etiquetaRamo: {
    width: 40,
    height: 6,
    borderRadius: 3,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORES.texto,
  },
  datos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  dato: {
    fontSize: 14,
    color: COLORES.textoSuave,
  },
  descripcion: {
    fontSize: 15,
    color: COLORES.texto,
    lineHeight: 21,
  },
  seccion: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORES.texto,
    marginTop: 20,
    marginBottom: 10,
  },
  filaSeccion: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  porcentaje: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORES.texto,
  },
  estados: {
    flexDirection: "row",
    gap: 8,
  },
  botonEstado: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    minHeight: 80,
    justifyContent: "center",
  },
  textoEstado: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  ayuda: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 6,
    marginBottom: 10,
  },
  tarjetaLista: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    overflow: "hidden",
  },
  subtarea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.borde,
  },
  textoSubtarea: {
    flex: 1,
    fontSize: 16,
    color: COLORES.texto,
  },
  tachado: {
    textDecorationLine: "line-through",
    color: COLORES.textoSuave,
  },
  nueva: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
  },
  campo: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  botonAgregar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORES.verde,
    alignItems: "center",
    justifyContent: "center",
  },
});

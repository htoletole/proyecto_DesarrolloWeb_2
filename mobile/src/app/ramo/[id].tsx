// detalle de un ramo: avance de tareas, notas y sus evaluaciones y tareas
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { obtenerRamo, textoTipo } from "../../services/agenda";
import { useDatos } from "../../services/useDatos";
import { COLORES, COLOR_SECCION, colorDeTexto, colorDeTextoGrande } from "../../services/colores";
import { useAviso } from "../../components/Aviso";
import { fechaCorta } from "../../services/fechas";
import { Cargando, ErrorCarga } from "../../components/Estados";
import { BarraAvance, ChipEstado } from "../../components/Tarjetas";

export default function DetalleRamo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { datos: ramo, cargando, error, reintentar } = useDatos(() => obtenerRamo(Number(id)));
  const { elementoAviso } = useAviso();

  if (cargando) return <Cargando texto="Cargando ramo..." />;
  if (error && !ramo) return <ErrorCarga mensaje={error} onReintentar={reintentar} />;
  if (!ramo) return null;

  const texto = colorDeTexto(ramo.color);
  const { avance } = ramo;

  const irAEvaluacion = (params: Record<string, string>) => router.push({ pathname: "/evaluacion/formulario", params });
  const irATareaNueva = () => router.push({ pathname: "/tarea/formulario", params: { ramoId: String(ramo.id) } });

  return (
    <View style={{ flex: 1 }}>
      {elementoAviso}
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Stack.Screen
          options={{
            title: ramo.nombre,
            headerRight: () => (
              <Pressable
                onPress={() => router.push({ pathname: "/ramo/formulario", params: { id: String(ramo.id) } })}
                style={{ paddingHorizontal: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Editar ramo"
              >
                <Ionicons name="create-outline" size={24} color={colorDeTextoGrande(COLOR_SECCION.ramos)} />
              </Pressable>
            ),
          }}
        />

        <View style={[estilos.cabecera, { backgroundColor: ramo.color }]}>
          <Text style={[estilos.nombre, { color: texto }]}>{ramo.nombre}</Text>
          <Text style={[estilos.subtitulo, { color: texto }]}>
            {ramo.codigo} · {ramo.modalidad} · Período {ramo.periodo}
          </Text>
        </View>

        {/* avance: lo calcula la API con las tareas y las notas */}
        <View style={estilos.indicadores}>
          <View style={estilos.indicador}>
            <Text style={estilos.numero}>{avance.porcentajeTareas}%</Text>
            <Text style={estilos.etiqueta}>Tareas listas</Text>
          </View>
          <View style={estilos.indicador}>
            <Text style={estilos.numero}>{avance.promedioParcial !== null ? avance.promedioParcial.toFixed(1) : "–"}</Text>
            <Text style={estilos.etiqueta}>Promedio parcial</Text>
          </View>
          <View style={estilos.indicador}>
            <Text style={estilos.numero}>{avance.ponderacionRendida}%</Text>
            <Text style={estilos.etiqueta}>Rendido de {avance.ponderacionTotal}%</Text>
          </View>
        </View>
        <BarraAvance porcentaje={avance.porcentajeTareas} color={COLORES.verde} />
        <Text style={estilos.ayuda}>
          {avance.tareasCompletadas} de {avance.totalTareas} tareas completadas
        </Text>

        <View style={estilos.filaSeccion}>
          <Text style={estilos.seccion}>Evaluaciones</Text>
          <Pressable onPress={() => irAEvaluacion({ ramoId: String(ramo.id) })} style={[estilos.agregar, { backgroundColor: COLORES.morado }]} accessibilityRole="button">
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={estilos.textoAgregar}>Agregar</Text>
          </Pressable>
        </View>
        {ramo.evaluaciones.length === 0 ? (
          <Text style={estilos.nada}>Este ramo no tiene evaluaciones.</Text>
        ) : (
          <View style={estilos.lista}>
            {ramo.evaluaciones.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => irAEvaluacion({ id: String(e.id) })}
                style={({ pressed }) => [estilos.fila, pressed && { backgroundColor: COLORES.fondo }]}
                accessibilityRole="button"
                accessibilityLabel={"Editar evaluación " + e.nombre}
              >
                <View style={{ flex: 1 }}>
                  <Text style={estilos.titulo}>{e.nombre}</Text>
                  <Text style={estilos.dato}>
                    {textoTipo(e.tipo)} · {fechaCorta(e.fecha)} · {e.ponderacion}%
                  </Text>
                </View>
                <Text style={[estilos.nota, e.nota !== null && e.nota < 4 && { color: COLORES.rojo }]}>
                  {e.nota !== null ? e.nota.toFixed(1) : "Sin nota"}
                </Text>
                <Ionicons name="create-outline" size={18} color={COLORES.morado} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={estilos.filaSeccion}>
          <Text style={estilos.seccion}>Tareas</Text>
          <Pressable onPress={irATareaNueva} style={[estilos.agregar, { backgroundColor: COLOR_SECCION.tareas }]} accessibilityRole="button">
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={estilos.textoAgregar}>Agregar</Text>
          </Pressable>
        </View>
        {ramo.tareas.length === 0 ? (
          <Text style={estilos.nada}>Este ramo no tiene tareas.</Text>
        ) : (
          <View style={estilos.lista}>
            {ramo.tareas.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => router.push({ pathname: "/tarea/[id]", params: { id: String(t.id) } })}
                style={({ pressed }) => [estilos.fila, pressed && { backgroundColor: COLORES.fondo }]}
                accessibilityRole="button"
              >
                <View style={{ flex: 1 }}>
                  <Text style={estilos.titulo}>{t.nombre}</Text>
                  <Text style={estilos.dato}>{fechaCorta(t.fecha)}</Text>
                </View>
                <ChipEstado estado={t.estado} />
                <Ionicons name="chevron-forward" size={18} color={COLORES.textoSuave} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 40,
  },
  cabecera: {
    borderRadius: 16,
    padding: 18,
    gap: 4,
    marginBottom: 14,
  },
  nombre: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: "600",
  },
  indicadores: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  indicador: {
    flex: 1,
    backgroundColor: COLORES.tarjeta,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  numero: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORES.azul,
  },
  etiqueta: {
    fontSize: 12,
    color: COLORES.textoSuave,
    textAlign: "center",
    marginTop: 2,
  },
  ayuda: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 6,
  },
  seccion: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORES.texto,
    marginTop: 22,
    marginBottom: 10,
  },
  filaSeccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  agregar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginTop: 12,
  },
  textoAgregar: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  nada: {
    fontSize: 14,
    color: COLORES.textoSuave,
  },
  lista: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    overflow: "hidden",
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.borde,
  },
  titulo: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.texto,
  },
  dato: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2,
  },
  nota: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORES.texto,
  },
});

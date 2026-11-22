// crear o editar una tarea (mismos campos que el formulario de la web)
// /tarea/formulario            -> crear
// /tarea/formulario?id=5       -> editar la tarea 5
// /tarea/formulario?ramoId=2   -> crear con el ramo ya elegido
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  crearTarea,
  editarTarea,
  eliminarTarea,
  ESTADOS,
  listarRamos,
  obtenerTarea,
  PRIORIDADES_LISTA,
} from "../../services/agenda";
import type { Estado, Ramo } from "../../services/agenda";
import { COLORES, COLOR_ESTADO, COLOR_PRIORIDAD, COLOR_SECCION } from "../../services/colores";
import { dejarAviso } from "../../services/avisos";
import { Cargando, ErrorCarga } from "../../components/Estados";
import { useAviso } from "../../components/Aviso";
import { BotonEliminar, BotonPrincipal, Campo, Opciones, SelectorFecha, SelectorHora } from "../../components/Formulario";

const COLOR = COLOR_SECCION.tareas;

export default function FormularioTarea() {
  const params = useLocalSearchParams<{ id?: string; ramoId?: string }>();
  const idTarea = params.id ? Number(params.id) : 0;
  const editando = idTarea > 0;
  const { elementoAviso, mostrarAviso } = useAviso();

  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // campos del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ramoId, setRamoId] = useState(params.ramoId ?? "");
  const [estado, setEstado] = useState<Estado>("PENDIENTE");
  const [prioridad, setPrioridad] = useState("MEDIA");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  async function cargar() {
    setCargando(true);
    setErrorCarga("");
    try {
      setRamos(await listarRamos());
      // al editar se rellenan los campos con la tarea guardada
      if (editando) {
        const t = await obtenerTarea(idTarea);
        setNombre(t.nombre);
        setDescripcion(t.descripcion);
        setRamoId(String(t.ramo.id));
        setEstado(t.estado);
        setPrioridad(t.prioridad);
        setFecha(t.fecha);
        setHora(t.horaEntrega);
      }
    } catch (e) {
      setErrorCarga((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // se revisa antes de mandar (la API vuelve a validar todo)
  function validar(): boolean {
    const nuevos: Record<string, string> = {};
    if (nombre.trim() === "") nuevos.nombre = "Escribe el nombre de la tarea.";
    else if (nombre.trim().length > 80) nuevos.nombre = "Máximo 80 caracteres.";
    if (descripcion.length > 500) nuevos.descripcion = "Máximo 500 caracteres.";
    if (ramoId === "") nuevos.ramo = "Elige un ramo.";
    if (fecha === "") nuevos.fecha = "Elige la fecha de entrega.";
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function guardar() {
    if (!validar()) {
      mostrarAviso("error", "Revisa los campos marcados.");
      return;
    }
    setGuardando(true);
    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      asignaturaId: Number(ramoId),
      estado,
      prioridad,
      fecha: fecha || null,
      horaEntrega: hora || null,
    };
    try {
      if (editando) {
        await editarTarea(idTarea, datos);
        dejarAviso("exito", "¡La tarea «" + datos.nombre + "» se modificó con éxito!");
      } else {
        await crearTarea(datos);
        dejarAviso("exito", "¡Tarea «" + datos.nombre + "» creada con éxito!");
      }
      router.back();
    } catch (e) {
      // por ejemplo: completar con subtareas pendientes (409)
      mostrarAviso("error", (e as Error).message);
      setGuardando(false);
    }
  }

  function confirmarEliminar() {
    Alert.alert("Eliminar tarea", "¿Desea confirmar la eliminación de «" + nombre + "»? Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setEliminando(true);
          try {
            await eliminarTarea(idTarea);
            dejarAviso("exito", "¡Se eliminó la tarea «" + nombre + "»!");
            // se vuelve hasta la lista (el detalle ya no existe)
            router.dismissTo("/tareas");
          } catch (e) {
            mostrarAviso("error", (e as Error).message);
            setEliminando(false);
          }
        },
      },
    ]);
  }

  const titulo = editando ? "Editar tarea" : "Crear tarea";

  if (cargando) return <Cargando texto="Preparando formulario..." />;
  if (errorCarga) return <ErrorCarga mensaje={errorCarga} onReintentar={cargar} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: titulo }} />
      {elementoAviso}
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        {ramos.length === 0 ? (
          <View style={estilos.alerta}>
            <Text style={estilos.textoAlerta}>Primero crea un ramo en la pestaña Ramos.</Text>
          </View>
        ) : null}

        <Campo etiqueta="Nombre" obligatorio value={nombre} onChangeText={setNombre} placeholder="Ej: Informe de laboratorio" maxLength={80} error={errores.nombre} />
        <Campo
          etiqueta="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Detalles de la tarea (opcional)"
          multiline
          style={{ minHeight: 90, textAlignVertical: "top" }}
          maxLength={500}
          error={errores.descripcion}
        />
        <Opciones
          etiqueta="Ramo"
          obligatorio
          opciones={ramos.map((r) => ({ valor: String(r.id), texto: r.nombre, color: r.color }))}
          valor={ramoId}
          onCambiar={setRamoId}
          error={errores.ramo}
        />
        <Opciones
          etiqueta="Estado"
          opciones={ESTADOS.map((e) => ({ valor: e.valor, texto: e.texto, color: COLOR_ESTADO[e.valor].fuerte }))}
          valor={estado}
          onCambiar={(v) => setEstado(v as Estado)}
        />
        <Opciones
          etiqueta="Prioridad"
          opciones={PRIORIDADES_LISTA.map((p) => ({ ...p, color: COLOR_PRIORIDAD[p.valor] }))}
          valor={prioridad}
          onCambiar={setPrioridad}
        />
        <SelectorFecha etiqueta="Fecha de entrega" obligatorio valor={fecha} onCambiar={setFecha} error={errores.fecha} />
        <SelectorHora etiqueta="Hora de entrega (opcional)" valor={hora} onCambiar={setHora} />

        <BotonPrincipal texto={editando ? "Guardar cambios" : "Crear tarea"} icono="checkmark" color={COLOR} cargando={guardando} onPress={guardar} />
        {editando ? <BotonEliminar texto="Eliminar tarea" cargando={eliminando} onPress={confirmarEliminar} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 40,
  },
  alerta: {
    backgroundColor: COLORES.naranjoClaro,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  textoAlerta: {
    color: "#9A5B00",
    fontWeight: "700",
  },
});

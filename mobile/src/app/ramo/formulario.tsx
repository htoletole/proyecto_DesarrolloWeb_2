// crear o editar un ramo (nombre, ID, modalidad y color, como en la web)
// /ramo/formulario        -> crear
// /ramo/formulario?id=3   -> editar el ramo 3
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { crearRamo, editarRamo, eliminarRamo, MODALIDADES_LISTA, obtenerRamo } from "../../services/agenda";
import { COLOR_SECCION, PALETA_RAMOS } from "../../services/colores";
import { dejarAviso } from "../../services/avisos";
import { Cargando, ErrorCarga } from "../../components/Estados";
import { useAviso } from "../../components/Aviso";
import { BotonEliminar, BotonPrincipal, Campo, Opciones, SelectorColor } from "../../components/Formulario";

const COLOR = COLOR_SECCION.ramos;

export default function FormularioRamo() {
  const params = useLocalSearchParams<{ id?: string }>();
  const idRamo = params.id ? Number(params.id) : 0;
  const editando = idRamo > 0;
  const { elementoAviso, mostrarAviso } = useAviso();

  const [cargando, setCargando] = useState(editando);
  const [errorCarga, setErrorCarga] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cantidadTareas, setCantidadTareas] = useState(0);

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [color, setColor] = useState(PALETA_RAMOS[0]);

  async function cargar() {
    if (!editando) return;
    setCargando(true);
    setErrorCarga("");
    try {
      const r = await obtenerRamo(idRamo);
      setNombre(r.nombre);
      setCodigo(r.codigo);
      setModalidad(r.modalidadValor);
      setColor(r.color);
      setCantidadTareas(r.cantidadTareas + r.cantidadEvaluaciones);
    } catch (e) {
      setErrorCarga((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function validar(): boolean {
    const nuevos: Record<string, string> = {};
    if (nombre.trim() === "") nuevos.nombre = "Escribe el nombre del ramo.";
    if (codigo.trim() === "") nuevos.codigo = "Escribe el ID del ramo (ej: CINF101).";
    if (modalidad === "") nuevos.modalidad = "Elige la modalidad.";
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function guardar() {
    if (!validar()) {
      mostrarAviso("error", "Revisa los campos marcados.");
      return;
    }
    setGuardando(true);
    const datos = { nombre: nombre.trim(), codigo: codigo.trim(), modalidad, color };
    try {
      if (editando) {
        await editarRamo(idRamo, datos);
        dejarAviso("exito", "¡El ramo «" + datos.nombre + "» se editó con éxito!");
      } else {
        await crearRamo(datos);
        dejarAviso("exito", "¡Ramo «" + datos.nombre + "» creado con éxito!");
      }
      router.back();
    } catch (e) {
      // por ejemplo: ya existe un ramo con ese ID o nombre en el periodo (409)
      mostrarAviso("error", (e as Error).message);
      setGuardando(false);
    }
  }

  function confirmarEliminar() {
    const extra = cantidadTareas > 0 ? " También se eliminarán sus tareas y evaluaciones." : "";
    Alert.alert("Eliminar ramo", "¿Desea confirmar la eliminación de «" + nombre + "»?" + extra, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setEliminando(true);
          try {
            await eliminarRamo(idRamo);
            dejarAviso("exito", "¡Se eliminó el ramo «" + nombre + "»!");
            router.dismissTo("/ramos");
          } catch (e) {
            mostrarAviso("error", (e as Error).message);
            setEliminando(false);
          }
        },
      },
    ]);
  }

  if (cargando) return <Cargando texto="Preparando formulario..." />;
  if (errorCarga) return <ErrorCarga mensaje={errorCarga} onReintentar={cargar} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: editando ? "Editar ramo" : "Crear ramo" }} />
      {elementoAviso}
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Campo etiqueta="Nombre" obligatorio value={nombre} onChangeText={setNombre} placeholder="Ej: Cálculo II" maxLength={60} error={errores.nombre} />
        <Campo
          etiqueta="ID"
          obligatorio
          value={codigo}
          onChangeText={setCodigo}
          placeholder="Ej: CMAT110"
          autoCapitalize="characters"
          maxLength={20}
          error={errores.codigo}
        />
        <Opciones etiqueta="Modalidad" obligatorio opciones={MODALIDADES_LISTA} valor={modalidad} onCambiar={setModalidad} colorActivo={COLOR} error={errores.modalidad} />
        <SelectorColor valor={color} onCambiar={setColor} colores={PALETA_RAMOS.includes(color.toUpperCase()) ? PALETA_RAMOS : [color, ...PALETA_RAMOS]} />

        <BotonPrincipal texto={editando ? "Guardar cambios" : "Crear ramo"} icono="checkmark" color={COLOR} cargando={guardando} onPress={guardar} />
        {editando ? <BotonEliminar texto="Eliminar ramo" cargando={eliminando} onPress={confirmarEliminar} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 40,
  },
});

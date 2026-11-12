// tiempos de carga de las vistas
//
// se midio cuanto tarda cada vista en tener todos sus datos al moverse entre ellas
// (8 vueltas por todas las vistas, con la API conectada a Neon y MongoDB Atlas):
//
//   vista          promedio   maximo
//   Inicio           645 ms   738 ms   (/dashboard es la consulta mas pesada)
//   Tareas           188 ms   222 ms
//   Evaluaciones     187 ms   204 ms
//   Calendario       182 ms   193 ms
//   Historial        163 ms   598 ms
//   Ramos             95 ms   106 ms
//   Periodos          95 ms   111 ms
//
// el maximo fue 738 ms (en modo desarrollo, donde React pide todo dos veces, llego a 1241 ms).
// cada vista muestra su esqueleto hasta que llegan TODOS sus datos, y si la carga
// pasa de unas 3 veces el peor caso medido se avisa que esta tardando mas de lo normal
// (por ejemplo, cuando Neon "despierta" despues de estar inactivo).
export const LIMITE_CARGA_LENTA_MS = 4000;

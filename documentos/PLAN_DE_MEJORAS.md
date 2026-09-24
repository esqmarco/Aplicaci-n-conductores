# Plan de mejoras — Calculadora de conductores eléctricos

## Estado actual
- **Último avance:** 2026-09-24 — v5.10.0: los límites de caída DC salen de los criterios de Itaipu #ITA0&EEC010-01 R1A (GE, 2026) §10.3.2: batería → carga 5 %, cargador → batería 3 %. Reemplazan los seis valores por aplicación y el criterio por tensión, que no tenían fuente. En AC se sumó la opción 10 % (fuente → primario de trafo con TAPs, R1A §10.3.1).
- **Sin verificar:** qué revisión de los criterios de Itaipu está aprobada. La R1A 2026 cambia valores respecto de la versión 2023; si el informe es formal, confirmarlo con Ingeniería. También quedan sin verificar los hooks en la PC de Marco (Windows), la columna de aluminio de NBR contra una segunda fuente, el PDF real de impresión y Safari/Firefox.
- **Pendiente de fusión:** el PR con la v5.10.0 (límites R1A).
- **Siguiente paso recomendado:** que Marco decida la fila #14 (caída en la partida de motores): es el criterio de la R1A que la app todavía no verifica.

## Backlog

| # | Pendiente | Evidencia | Prioridad | Decide |
|---|---|---|---|---|
| 2 | Módulo de media tensión (NBR 14039, Mamede Tablas 3.28/3.29) si se necesita dimensionar cables de MT | Retirado en 5.0.0; el selector AC llega a 1000 V | Baja | Marco |
| 7 | Separar el CSS inline de `index.html` a `styles.css` | `index.html` | Baja | Claude |
| 10 | DC: ofrecer los métodos A2, B2 y F (INPACO tiene la columna de 2 conductores) y D. D necesita temperatura y resistividad del suelo; hoy `calcularFactorTemperaturaDC` fuerza aire | Auditoría 2026-09-23; selector `metodo-instalacao-dc` | Baja | Marco |
| 11 | Fuente para la sección mínima de 6 mm² en alimentadores (`obtenerSeccionMinimaNBR`): no tiene cita, y la R1A de Itaipu no la trata. NBR 5410 Tabla 47 pide 2,5 mm² en fuerza | `calculations.js` | Media | Marco |
| 13 | Quitar código y datos sin uso: `validarParametrosBasicos`, `validarPorPestaña`, `validarConsistenciaDC`, `validarResultadosDC`, `validarRango/Lista/Numerico/Requerido`; la sincronización DC (`rellenarSiVacio` sobre selects, no hace nada); `seccionesNominalesDC` (incluye 400–800 sin tabla), `tensionesNominalesDC`, `parametrosBaterias` | Auditoría 2026-09-23 | Baja | Claude |
| 14 | Caída de tensión en la partida de motores (Itaipu R1A §10.3.1.3): 10 % en bornes del motor. Considera todo el sistema de BT, desde el motor hasta el primario del trafo reductor. Sin datos del fabricante: Ip = 6·In, cosφ = 0,3. Es interfaz nueva: se propone antes de hacerla | Criterios R1A, pp. 35–37 | Media | Marco |
| 15 | Alimentadores de motores DC dimensionados al 125 % de la corriente (Itaipu R1A §10.3.2) | Criterios R1A | Baja | Marco |
| 16 | Cables de control (Itaipu R1A §10.3.3): la caída solo se verifica en cables que accionan solenoides (válvulas, bobinas de interruptores) con recorrido mayor que 400 m. Hoy la app no distingue cables de control | Criterios R1A | Baja | Marco |
| 8 | Ideas a futuro: exportar PDF, modo oscuro, cálculo de canalización, comparar 2–3 secciones, catálogo de cables comerciales | — | Baja | Marco |

## Decisiones vigentes
- 2026-09-22 — Fórmula bifásica: `I = P / (Vff · cosφ · η)`, sin √2 (Marco, tras revisar Mamede 3.5.1.1).
- 2026-09-22 — Caída de tensión: `k · I · L · (Rt·cosφ + X·senφ) / n` con R a 70/90 °C (INPACO 4.3, Mamede Ec. 3.18); revisada con Marco.
- 2026-09-22 — Fuente de ampacidad: catálogo INPACO 2021 (cobre, 40 °C aire / 25 °C suelo, 1,0 K·m/W), 2 y 3 conductores cargados.
- 2026-09-22 — Ampacidad AC solo baja tensión (≤ 1000 V). Criterio técnico de Claude; Marco decide si se agrega MT (fila #2).
- 2026-09-22 — Cortocircuito con conductores en paralelo: cada conductor soporta la Icc completa (criterio conservador).
- 2026-09-23 — Método de trabajo v8 adoptado en este proyecto.
- 2026-09-23 — Reactancia AC desde INPACO Tabla 15 (antes valores sin fuente); frecuencia seleccionable 50/60 Hz.
- 2026-09-23 — Aluminio: relación Al/Cu de NBR 5410 Tablas 36–39 aplicada sobre INPACO (mantiene las referencias de 40 °C / 25 °C / 1,0 K·m/W).
- 2026-09-24 — Límites de caída: se usa la R1A 2026 de los criterios de Itaipu (#ITA0&EEC010-01), no la versión 2023 (Marco).
- 2026-09-24 — Temperatura ambiente inicial = referencia de las tablas: 40 °C aire; 25 °C suelo en el método D (Marco).
- 2026-09-23 — Historial en una pestaña propia (elegido por Marco entre pestaña y lista por pestaña).
- 2026-09-23 — Clase del conductor por defecto: flexible (clase 5) en cobre, coherente con los cables de INPACO Tabla 15 y del lado seguro; aluminio solo rígido.

# Plan de mejoras — Calculadora de conductores eléctricos

## Estado actual
- **Último avance:** 2026-09-24 — v5.13.0: la sección mínima de los alimentadores baja de 6 mm² (sin fuente) a 2,5 mm², según NBR 5410 Tabla 47 (fila #11). Antes, v5.12.0: motor DC, cables de control, métodos DC, limpieza y CSS.
- **Sin verificar:**
  - Qué revisión de los criterios de Itaipu está aprobada: la R1A 2026 cambia valores respecto de la versión 2023. Si el informe es formal, confirmarlo con Ingeniería.
  - La fuente escrita de la fórmula del trafo con la Z completa.
  - Los hooks en la PC de Marco, la columna de aluminio de NBR contra una segunda fuente, el PDF real de impresión y Safari/Firefox.
- **Siguiente paso recomendado:** ya no quedan filas que cambien resultados de lo que la app calcula hoy. Las que siguen (#2, #8, #17, #18) son mejoras que decide Marco.

## Backlog

| # | Pendiente | Evidencia | Prioridad | Decide |
|---|---|---|---|---|
| 2 | Módulo de media tensión (NBR 14039, Mamede Tablas 3.28/3.29) si se necesita dimensionar cables de MT | Retirado en 5.0.0; el selector AC llega a 1000 V | Baja | Marco |
| 17 | Cableado interno de tableros (Itaipu R1A §8.4.6.5): mínimo 1,5 mm² en control y supervisión, 4,0 mm² en circuitos de TC y 2,5 mm² en TP y demás. NBR 5410 admite 0,5 mm² en control. La app no tiene tipo de circuito "control" en la ampacidad | Búsqueda en el corpus (2026-09-24) | Baja | Marco |
| 18 | Conductor de puesta a tierra (Itaipu R1A §8.4.6.3 y §12): mínimo 35 mm² Cu. La app calcula el conductor de protección (PE) por NBR 5410 Tabla 58, que es otra cosa | Búsqueda en el corpus (2026-09-24) | Baja | Marco |
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
- 2026-09-24 — Sección mínima de alimentadores: 2,5 mm² Cu, NBR 5410 Tabla 47 (Marco). La búsqueda en el corpus no encontró fuente para 6 mm²: ni NBR 5410, ni Mamede, ni los criterios de Itaipu R1A y 2023. La AEA argentina pide 4 mm² y no se usa.
- 2026-09-24 — Lote #15, #16, #10, #13 y #7 con el diseño propuesto (Marco: "arrancá con todo"). Cables de control: el criterio R1A §10.3.3 se aplica en AC y DC.
- 2026-09-24 — Partida de motor: tres tramos (circuito, alimentador, trafo con Z completa), bloque dentro de Caída AC (Marco aprobó la propuesta y la fórmula del trafo).
- 2026-09-24 — Límites de caída: se usa la R1A 2026 de los criterios de Itaipu (#ITA0&EEC010-01), no la versión 2023 (Marco).
- 2026-09-24 — Temperatura ambiente inicial = referencia de las tablas: 40 °C aire; 25 °C suelo en el método D (Marco).
- 2026-09-23 — Historial en una pestaña propia (elegido por Marco entre pestaña y lista por pestaña).
- 2026-09-23 — Clase del conductor por defecto: flexible (clase 5) en cobre, coherente con los cables de INPACO Tabla 15 y del lado seguro; aluminio solo rígido.

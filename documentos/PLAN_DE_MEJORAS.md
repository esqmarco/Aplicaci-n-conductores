# Plan de mejoras — Calculadora de conductores eléctricos

## Estado actual
- **Último avance:** 2026-09-23 — v5.6.0: pestaña Historial (abrir, borrar, borrar todo) y guardado tolerante a almacenamiento bloqueado. Antes, v5.5.0: memoria de cálculo imprimible/PDF.
- **Bloqueado:** fila #1 (aluminio) — falta la fuente: la red de la sesión en la nube bloquea `guiadaengenharia.com` y `br.prysmian.com`, y no hay PDF con tablas de aluminio en `documentos/`.
- **Sin verificar:** los hooks en la PC de Marco (Windows, `$CLAUDE_PROJECT_DIR` con espacios en la ruta).
- **Siguiente paso recomendado:** conseguir la fuente de la fila #1 (habilitar esos dominios o subir el PDF de NBR 5410 Tablas 36–39). Es la única fila que afecta resultados técnicos.

## Backlog

| # | Pendiente | Evidencia | Prioridad | Decide |
|---|---|---|---|---|
| 1 | Tablas reales de ampacidad de aluminio (NBR 5410 Tablas 36–39) en lugar del factor √(R_Cu/R_Al) | `calculations.js` `obtenerAmpacidadConductor`; INPACO solo publica cobre | Media | Claude (necesita la fuente en `documentos/`) |
| 2 | Módulo de media tensión (NBR 14039, Mamede Tablas 3.28/3.29) si se necesita dimensionar cables de MT | Retirado en 5.0.0; el selector AC llega a 1000 V | Baja | Marco |
| 7 | Separar el CSS inline de `index.html` a `styles.css` | `index.html` | Baja | Claude |
| 8 | Ideas a futuro: exportar PDF, modo oscuro, cálculo de canalización, comparar 2–3 secciones, catálogo de cables comerciales | — | Baja | Marco |

## Decisiones vigentes
- 2026-09-22 — Fórmula bifásica: `I = P / (Vff · cosφ · η)`, sin √2 (Marco, tras revisar Mamede 3.5.1.1).
- 2026-09-22 — Caída de tensión: `k · I · L · (Rt·cosφ + X·senφ) / n` con R a 70/90 °C (INPACO 4.3, Mamede Ec. 3.18); revisada con Marco.
- 2026-09-22 — Fuente de ampacidad: catálogo INPACO 2021 (cobre, 40 °C aire / 25 °C suelo, 1,0 K·m/W), 2 y 3 conductores cargados.
- 2026-09-22 — Ampacidad AC solo baja tensión (≤ 1000 V). Criterio técnico de Claude; Marco decide si se agrega MT (fila #2).
- 2026-09-22 — Cortocircuito con conductores en paralelo: cada conductor soporta la Icc completa (criterio conservador).
- 2026-09-23 — Método de trabajo v8 adoptado en este proyecto.
- 2026-09-23 — Reactancia AC desde INPACO Tabla 15 (antes valores sin fuente); frecuencia seleccionable 50/60 Hz.
- 2026-09-23 — Historial en una pestaña propia (elegido por Marco entre pestaña y lista por pestaña).
- 2026-09-23 — Clase del conductor por defecto: flexible (clase 5) en cobre, coherente con los cables de INPACO Tabla 15 y del lado seguro; aluminio solo rígido.

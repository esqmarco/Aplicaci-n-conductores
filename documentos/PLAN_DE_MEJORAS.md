# Plan de mejoras — Calculadora de conductores eléctricos

## Estado actual
- **Último cierre:** 2026-09-23 — instalado el Método de trabajo v8 (CLAUDE.md, hooks, /verificar, /cierre, /auditar, pre-commit).
- **En main:** v5.1.0 (PR #12). Tablas INPACO corregidas, fórmula bifásica sin √2, caída de tensión con R a 70/90 °C, DC corregido. 90 tests.
- **Sin verificar:** los hooks en la PC de Marco (Windows, `$CLAUDE_PROJECT_DIR` con espacios en la ruta). Ampacidad de aluminio: estimada, no contrastada con tablas NBR de aluminio.
- **Siguiente paso recomendado:** abrir una sesión local y confirmar que el hook de arranque muestra estado, git y tests; después, fila #1 del backlog.

## Backlog

| # | Pendiente | Evidencia | Prioridad | Decide |
|---|---|---|---|---|
| 1 | Tablas reales de ampacidad de aluminio (NBR 5410 Tablas 36–39) en lugar del factor √(R_Cu/R_Al) | `calculations.js` `obtenerAmpacidadConductor`; INPACO solo publica cobre | Media | Claude (necesita la fuente en `documentos/`) |
| 2 | Módulo de media tensión (NBR 14039, Mamede Tablas 3.28/3.29) si se necesita dimensionar cables de MT | Retirado en 5.0.0; el selector AC llega a 1000 V | Baja | Marco |
| 3 | Mostrar el historial de cálculos (hoy se guarda en localStorage pero no hay pantalla) | `app.js` `guardarEnHistorial` | Baja | Claude |
| 4 | Reporte imprimible con datos de entrada y fuentes (hoy imprime solo el resumen) | `app.js` `generarReporteAC/DC` | Baja | Claude |
| 5 | Resistencia en AC con efecto pelicular para ≥ 150 mm² (Rac/Rdc ≈ 1,01–1,05) | INPACO 4.3.1; `calcularCaidaTensionAC` usa R en DC | Baja | Claude |
| 6 | `mostrarMensaje` arma HTML con `innerHTML`; pasar el texto por `textContent` | `app.js` `mostrarMensaje` | Baja | Claude |
| 7 | Separar el CSS inline de `index.html` a `styles.css` | `index.html` | Baja | Claude |
| 8 | Ideas a futuro: exportar PDF, modo oscuro, cálculo de canalización, comparar 2–3 secciones, catálogo de cables comerciales | — | Baja | Marco |

## Decisiones vigentes
- 2026-09-22 — Fórmula bifásica: `I = P / (Vff · cosφ · η)`, sin √2 (Marco, tras revisar Mamede 3.5.1.1).
- 2026-09-22 — Caída de tensión: `k · I · L · (Rt·cosφ + X·senφ) / n` con R a 70/90 °C (INPACO 4.3, Mamede Ec. 3.18); revisada con Marco.
- 2026-09-22 — Fuente de ampacidad: catálogo INPACO 2021 (cobre, 40 °C aire / 25 °C suelo, 1,0 K·m/W), 2 y 3 conductores cargados.
- 2026-09-22 — Ampacidad AC solo baja tensión (≤ 1000 V). Criterio técnico de Claude; Marco decide si se agrega MT (fila #2).
- 2026-09-22 — Cortocircuito con conductores en paralelo: cada conductor soporta la Icc completa (criterio conservador).
- 2026-09-23 — Método de trabajo v8 adoptado en este proyecto.

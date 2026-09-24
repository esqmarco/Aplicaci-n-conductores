# Auditoría 2026-09-24 (después de v5.11.0 y v5.12.0)

Alcance: lo que cambió desde la v5.10.0.
- Partida de motores.
- Motor DC al 125 %.
- Cables de control.
- Métodos DC A2, B2, D y F.
- Limpieza de código sin uso.
- CSS movido a `styles.css`.

Método: `/auditar` v8. La revisión independiente la hizo un subagente de solo lectura sobre `git diff acbf253..HEAD`, y cada hallazgo se reprodujo en Chromium.

## Lentes
- **A · Invariantes:** valores por defecto silenciosos (`|| n`), validación antes de cada cálculo, `innerHTML`.
- **B · Gemelos:**
  - AC ↔ DC: método D, cables de control, estados, porcentajes.
  - Pestaña ↔ resumen ↔ reporte ↔ historial.
- **C · Documentos contra código:** CLAUDE.md, manual, PRD, plan y el pie de la página.
- **D · Revisión independiente:**
  - Regresiones del lote.
  - Estado viejo vigente.
  - Restauración del historial.
  - Referencias a lo eliminado.
  - CSS e impresión.
  - Ancho de 360 px.

## Hallazgos verificados y corregidos

| # | Hallazgo | Evidencia | Estado |
|---|---|---|---|
| 1 | El resumen AC dejaba el color del estado anterior cuando no había cálculo; el gemelo DC sí lo limpiaba | Chromium: "--" en rojo | Corregido con `limpiarEstadoResumen` en AC y DC |
| 2 | Los 10 lugares que pintan CUMPLE / NO CUMPLE pisaban la clase base (`result-value` / `reporte-valor`) y el estado perdía tamaño y peso de letra. Venía de antes | Lectura del código y del CSS | Corregido con `ponerEstado`, más un test estático |
| 3 | El reporte decía que la caída se recalculó con otro paralelo aun cuando no se exige (cable de control) | Chromium | Corregido: solo lo dice si la caída o la partida cuentan |
| 4 | Limpiar en Ampacidad DC no borraba la corriente conocida ni el rendimiento. Lo de la corriente venía de antes | Chromium: recalculaba 50 mm² sin datos | Corregido |
| 5 | El resumen del historial de caída decía "no cumple" en un cable de control donde la caída no se exige | Lectura del código | Corregido con `textoEstadoCaida` |
| 6 | Textos viejos: "Versión R5" en el pie de la página y en el log de consola; comentario huérfano de la sincronización DC | grep | Corregido |
| 7 | Manual: faltaban en Validaciones la partida, el tipo de cable, el tipo de carga y el tramo DC | Lectura del manual | Corregido |

## Sin problemas (verificado)
- **Invariantes:** los `|| n` que quedan en `app.js` son de selects y los cubre el chequeo estático. No hay `innerHTML`. Las 6 pestañas de cálculo validan antes de calcular.
- **Historial:** restaura partida, motor DC, método D con suelo y tipo de cable. Una entrada vieja no hereda lo que hay en pantalla.
- **Método D en AC y DC:** los mismos factores (1 / 0,65 / 0,67) y el mismo aviso cuando hay más de 6 circuitos.
- **Sección final DC por conductor:** mantiene el 125 %.
- **Código eliminado:** ninguna referencia viva.
- **CSS:** `styles.css` es idéntico al bloque `<style>` anterior. `@media print` funciona.
- **Pantalla:** a 360 px no hay desborde en ninguna pestaña y la consola no muestra errores.

## Lo que no se miró
- El diálogo real de `window.print()`: se emuló el medio de impresión.
- Los tooltips al pasar el mouse en celular.
- Safari y Firefox.
- Los hooks en la PC de Marco.
- La fuente escrita de la fórmula del trafo con la Z completa.
- Qué revisión de los criterios de Itaipu está aprobada.

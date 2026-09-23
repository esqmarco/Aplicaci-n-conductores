# Auditoría 2026-09-23 (después de los PR #13 a #18)

Método: `/auditar` v8. Revisión independiente con dos subagentes de solo lectura: uno de cálculo y tablas, otro de interfaz y validaciones. Tenían contexto mínimo: el código, no la historia. Cada hallazgo se reprodujo en node o en Chromium headless antes de aceptarlo.

## Lentes usadas
- **A · Invariantes:**
  - Valores por defecto silenciosos (`|| n`, `?? n`, `return 1.0`).
  - Validación antes de cada cálculo.
  - `innerHTML` con texto no controlado.
- **B · Paridad de gemelos:** AC ↔ DC (cortocircuito, caída, resumen) y pestaña de cálculo ↔ resumen ↔ reporte.
- **C · Drift entre documentos y código:** CLAUDE.md, manual, PRD y backlog contra el código (opciones de los selects, fórmulas, rangos, datos).
- **D · Revisión independiente:**
  - Todas las tablas contra INPACO 2021, NBR 5410 (CSV) e IEC 60228.
  - Todas las fórmulas.
  - Todos los flujos de la interfaz, incluidos historial, reporte y ancho de 360 px.

## Hallazgos verificados y corregidos (v5.8.0)

| # | Hallazgo | Evidencia | Estado |
|---|---|---|---|
| 1 | Al recalcular la ampacidad, la caída y el cortocircuito viejos seguían entrando en el resumen, la sección final y el reporte (AC y DC) | Chromium: 60 kW daba final 50 mm² por ampacidad con la caída de 10 kW; la caída recalculada exige 150 mm². En DC, 25 mm² en vez de 50 mm² | Corregido: se invalidan y se avisa |
| 2 | Una validación fallida no borraba el resultado anterior | Chromium: longitud vacía → el resumen seguía mostrando 3,21 % | Corregido en las 6 pestañas; test estático |
| 3 | Limpiar ocultaba la tarjeta pero dejaba el cálculo en el estado; además ponía 127 V y dejaba vacío el factor de potencia | Chromium | Corregido: invalida y vuelve a los valores iniciales del HTML |
| 4 | Resumen DC sin rama "No calculado" | Chromium: 41,67 A junto a "Sección final: No calculado" | Corregido |
| 5 | Sección final AC con conductores en paralelo y sin ampacidad: perdía el "n ×" y el PE salía para 1 conductor | Chromium: 400 A, 2 × 150 → "50 mm²" | Corregido |
| 6 | Resumen sin el "n ×" en la sección por ampacidad (AC); en DC mostraba la sección de la corriente total | Chromium | Corregido |
| 7 | Circuitos agrupados vacío o 0 se calculaba como 1 circuito, del lado inseguro; el rendimiento y el factor de demanda vacíos se tomaban como 1,0 | node: 3 circuitos → 70 mm²; vacío → 50 mm² | Corregido: error de validación (AC y DC); tests |
| 8 | Cortocircuito DC sin el K reducido de más de 300 mm² en PVC (el gemelo AC sí lo tenía) | node: 60 kA, 0,5 s → DC 400 mm², correcto 500 mm² | Corregido con una función compartida AC/DC; se quitó la tabla K duplicada |
| 9 | Caída DC: "cumple" se decidía con el % redondeado a 2 decimales | node: 5,0038 % se daba como cumple y la sección final elegía 25 mm² | Corregido (igual que AC); test |
| 10 | Sección comercial de cortocircuito menor que 16 mm² en aluminio | node: AC 1 MVA → 10 mm² de Al | Corregido (AC y DC); test |
| 11 | S mín. de cortocircuito informada con el K de la sección elegida, no con el de la sección necesaria | node: 240 mm² elegida → 381 mm², cuando hacen falta 425 mm² | Corregido: S mín. no depende de la elección; test |
| 12 | Conductor de protección por cortocircuito siempre con K de cobre | node, latente (la interfaz no le pasa Icc) | Corregido; test |
| 13 | Temperatura de conductor vacía daba R = NaN | node, latente | Corregido; test |
| 14 | El tiempo de despeje DC aceptaba 0,001 s (AC no) | Chromium | Corregido |
| 15 | La fila de tensión personalizada DC quedaba visible con un selector estándar | Chromium | Corregido |
| 16 | El agrupamiento DC no aclaraba cómo contar los conductores en paralelo | lectura | Tooltip igual al de AC |

**Drift de documentos corregido:**
- **Manual:** era la especificación v2.0. Tenía la caída sin reactancia, la referencia de temperatura errada (30 °C PVC), un caso de 13,8 kV y el "método F enterrado", y no describía DC. Se reescribió según el código. Sus dos ejemplos son tests.
- **PRD:** figuraban "8 pestañas", K Al 74 y la caída sin X. INPACO aparecía con un nombre de organismo inventado. La lista de pendientes estaba duplicada y ahora apunta al plan.
- **CLAUDE.md:** faltaban los métodos DC y las reglas nuevas de invalidación y de campo vacío.

## Verificado sin diferencias
- **INPACO:** las 480 ampacidades de las Tablas 2–5 y las Tablas 6, 7, 9, 10, 11 y 15.
- **NBR 5410:** las 418 filas de las Tablas 36–39.
- **Resistencias:** IEC 60228, clases 2 y 5, y aluminio.
- **Fórmulas:** la Rca de IEC 60287 contra INPACO (0,0872 contra 0,086 a 300 mm²), K, Icc y el factor 0,86.
- **Interfaz:** sin XSS (no hay `innerHTML`), sin errores de consola y sin scroll horizontal a 360 px en las 9 pestañas; el historial restaura bien los formularios.

## No reproducido o latente, al backlog
- DC con el método D: `calcularFactorTemperaturaDC` fuerza aire y no aplica suelo. Es latente porque el selector DC no ofrece D (fila #10).
- Datos sin fuente citada (fila #11):
  - Límites de caída DC por aplicación y por tensión.
  - Sección mínima de 6 mm² para alimentadores.
- Temperatura ambiente por defecto de 30 °C con tablas referidas a 40 °C, lo que da un factor mayor que 1 por defecto (fila #12).
- Código y datos sin uso (fila #13).

## Lo que no se miró
- El PDF real del diálogo de impresión: solo se revisó el contenido del reporte.
- Safari, Firefox y un celular físico.
- Los hooks en la PC de Marco (Windows).
- La columna de aluminio de NBR contra una segunda fuente.
- Las Tablas 7 (ítems 2, 3 y 5) y 8 de INPACO, que no se usan.

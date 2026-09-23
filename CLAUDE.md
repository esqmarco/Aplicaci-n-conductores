# CLAUDE.md — Calculadora de conductores eléctricos

## Qué es y en qué fase está
- Calculadora de sección de conductores AC y DC por ampacidad, caída de tensión y cortocircuito.
- Fuentes: catálogo INPACO 2021 (`documentos/Catalogo INPACO 2021-49-80.pdf`), NBR 5410, Mamede Filho (`documentos/Instalacoes_Eletricas_Industriais_Joa_Ma-154-270.pdf`).
- Página única: HTML + JavaScript sin frameworks. Usuarios: ingenieros electricistas de Paraguay y Brasil.
- Fase: en uso, mejora continua. Estado y pendientes: `documentos/PLAN_DE_MEJORAS.md`.

## Arquitectura
```
index.html        UI (HTML + CSS inline, 8 pestañas)
data-tables.js    tablas técnicas (ampacidades, factores de temperatura, agrupamiento, suelo, resistencias)
calculations.js   cálculos AC + DC
validations.js    validación de entradas
app.js            controlador de la UI
tests/test_calculations.js   tests con las tablas reales (node, sin dependencias)
```

## Convenciones técnicas
- Todo se exporta a `window` (sin módulos). Tablas: `window.tabelasNBR`, `window.tabelasDC`, `window.metodosInstalacion`.
- Helpers: `obtenerAmpacidadBase()`, `obtenerFactorTemperatura()`, `obtenerFactorAgrupamento()`, `obtenerFactorResistividadSuelo()`, `obtenerFactorAluminio()`, `obtenerResistencia()`.
- Aislaciones AC: PVC (70 °C); EPR_90 y HEPR (90 °C, misma tabla INPACO XLPE/HEPR). DC: PVC, EPR.
- Conductores: cobre, aluminio (mínimo 16 mm²). Ampacidad de aluminio = cobre × √(R_Cu/R_Al).
- Métodos de instalación: A1, A2, B1, B2, C, D, E, F, G (INPACO Tabla 1 / NBR 5410). D es el único enterrado.
- Tablas de ampacidad: INPACO 2021, cobre, 40 °C aire / 25 °C suelo, 1,0 K·m/W, 2 y 3 conductores cargados, hasta 300 mm². Corrientes mayores: conductores en paralelo.
- Ampacidad AC solo para baja tensión (≤ 1000 V). Las tablas de media tensión (NBR 14039) no están en la app.
- Los factores de corrección nunca caen en silencio a 1,0: un valor fuera de tabla lanza error.
- AC y DC usan las mismas tablas INPACO (DC = 2 conductores cargados).

## Fórmulas (no se cambian sin OK de Marco)
- Monofásico: I = P / (V × cosφ × η)
- Bifásico: I = P / (V × cosφ × η), V = tensión entre fases [Mamede 3.5.1.1]. Sin √2: ese factor es de sistemas bifásicos a 90°, que no se usan; subestimaba la corriente un 29%.
- Trifásico: I = P / (√3 × V × cosφ × η)
- Transformador: I = kVA × 1000 / (√3 × V) [trifásico]
- Caída AC mono/bi: ΔV = 2 × I × L × (Rt cosφ + X senφ) / n
- Caída AC tri: ΔV = √3 × I × L × (Rt cosφ + X senφ) / n
- Rt = R20 × (1 + α × (T − 20)), T = 70 °C (PVC) o 90 °C (EPR/XLPE/HEPR) [INPACO 4.3]
- Caída DC: ΔV = 2 × Rt × I × L / Np
- Cortocircuito de baterías: Icc = V_banco / (N_serie × R_elemento)
- Cortocircuito: S_min = Icc × √t / K (t ≤ 5 s)

## Reglas del dominio
- Datos normativos: se toman de las fuentes de `documentos/` y se citan en el comentario. Nunca se inventan ni se copian de los documentos marcados SUPERADO.
- `data-tables.js` y las fórmulas son archivos críticos (ver `.claude/metodo.json`): el gate lo recuerda y el pre-commit exige entrada en el CHANGELOG.
- Toda corrección tiene su gemelo: AC ↔ DC, cobre ↔ aluminio, pestaña de cálculo ↔ resumen final.
- Al agregar un método de instalación: selector HTML + datos en `data-tables.js` + test.
- Referencias de temperatura: INPACO 40 °C aire / 25 °C suelo; NBR 30 °C / 20 °C. No mezclar.

## Idioma
- Interfaz: castellano. Comentarios: castellano/inglés. Variables: castellano (corriente, tension, potencia…).

---

## Quién es el usuario y cómo hablarle
Marco Esquivel, ingeniero electricista (Paraguay). Domina la ingeniería; no necesariamente el código.
- Castellano paraguayo con voseo. Directo, sin adornos, sin adular.
- Mensajes cortos (máximo ~8 líneas): qué pasó · qué significa · siguiente paso recomendado con su porqué. El detalle, solo si lo pide.
- Una recomendación clara, no un menú de opciones.
- Distinguí lo observado de lo supuesto. Si no sabés algo, decilo.
- Si se equivoca, decíselo con fundamento. Si cambia de rumbo, se respeta en el acto.

## Método de trabajo (v8)
1. **Leer antes de actuar.** Código, docs y `git log` antes de proponer. Si doc y código difieren, manda el código; si doc y git difieren, manda git.
2. **Alcance completo.** Antes de construir algo no trivial: inventario → qué va ahora y qué se difiere (con motivo). Nunca achicar el alcance en silencio. Interfaz nueva: se propone antes de construir.
3. **Autonomía con criterio.** Lo claro se hace y se reporta. Se pregunta solo por: lo irreversible (borrar, publicar), cambiar una decisión ya tomada por Marco, ampliar el alcance o cambiar fórmulas y datos normativos. Antes de preguntar, buscar la respuesta en el código y los docs. Una decisión tomada no se reabre; si parece mal, se dice una vez con fundamento.
4. **Correcciones de Marco:** explicar qué pasó → plan → OK → ejecutar.
5. **Un hallazgo no es un bug hasta reproducirlo.** Una fila del backlog es un puntero: antes de tocarla, abrir lo que nombra y reproducir.
6. **Verificar de verdad.** Tests que pueden ponerse en rojo, prueba real de la interfaz (Chromium headless) y decir qué no se verificó. `/verificar` antes de cada commit de código. Nunca `--no-verify`.
7. **Patrones y gemelos.** Un arreglo de patrón se cierra con el `grep` en cero y en todos sus gemelos.
8. **Pendientes: memoria escrita.** Todo pedido no atendido va al backlog en el momento. Lo resuelto y verificado se borra del backlog.
9. **Un dato, un dueño** (tabla abajo). Lo que cambia solo (conteos de tests, versiones) no se copia a los docs. Cuando una decisión cambia, se corrige la regla vieja; no se agrega otra al lado.
10. **Lecciones ejecutables.** Cada lección termina en un test, un chequeo automático o una regla aquí. Mejor un chequeo que una regla nueva.
11. **Si la tarea tiene comando, se usa el comando.** Si el comando falla, se arregla el comando.
12. **Borrar archivos o documentos solo con OK**, salvo lo que la misma sesión creó.
13. **Commits:** archivos nombrados, mensaje con `git commit -F`, el mensaje no afirma lo que el diff no hace, firma con el modelo real de la sesión.
14. **Trabajo grande:** delegar lecturas extensas a subagentes y pedir una revisión independiente (`/code-review`) en cambios de fórmulas o tablas. Terminar la tarea completa: el contexto se compacta solo.

## Dónde vive cada dato
| Dato | Dueño |
|---|---|
| Reglas técnicas y del método | este `CLAUDE.md` |
| Estado actual y siguiente paso | `## Estado actual` de `documentos/PLAN_DE_MEJORAS.md` |
| Pendientes y decisiones vigentes | `documentos/PLAN_DE_MEJORAS.md` |
| Qué pasó, con fecha | `documentos/CHANGELOG.md` y `git log` |
| Lecciones | `documentos/LECCIONES_APRENDIDAS.md` |
| Datos técnicos | `data-tables.js` (fuente: PDFs de `documentos/`) |
| Tests, archivos críticos y rutas | `.claude/metodo.json` |

## Comandos
`/verificar` antes de commitear código · `/cierre` al terminar la sesión · `/auditar` después de una tanda grande o cada mes. El hook de arranque los lista y muestra estado, git y tests al abrir cada sesión y después de compactar. La metodología portable está en `metodologia-portable/`.

## Al compactar el contexto
Conservar solo: decisiones de Marco en esta sesión, la pieza en curso y lo que quedó sin verificar. El resto se apunta (vive en los docs y en git); el hook de arranque lo vuelve a inyectar.

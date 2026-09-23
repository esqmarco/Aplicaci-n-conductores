# Método de trabajo v8 — portable (Claude Opus 5.5)

Andamiaje para trabajar con Claude Code en cualquier proyecto: reglas, arranque automático, comandos de verificación y cierre, y un guardarraíl de commits.

Deriva del método consolidado en **Sistema NeuroTEA Agendamientos** (v7a, en producción) y se reescribió para Opus 5.5. Se conserva lo que funcionó; se sacó lo que existía para compensar límites de modelos anteriores.

## Qué contiene

```
plantilla/
├── CLAUDE.md                     reglas del proyecto + método (se carga solo en cada sesión)
├── .claude/
│   ├── metodo.json               lo único específico: nombre, tests, archivos críticos, rutas de docs
│   ├── settings.json             engancha los hooks
│   ├── hooks/arranque.mjs        SessionStart: estado, git, comandos y tests al abrir y tras compactar
│   ├── hooks/gate-critico.mjs    PreToolUse: recordatorio al editar un archivo crítico
│   ├── hooks/pre-commit.mjs      lógica del guardarraíl de commits
│   └── commands/                 /verificar · /cierre · /auditar
├── .githooks/pre-commit          corre los tests y exige changelog si cambió un archivo crítico
└── documentos/                   PLAN_DE_MEJORAS (estado + backlog) · CHANGELOG · LECCIONES_APRENDIDAS
```

Los hooks y comandos son idénticos en todos los proyectos: todo lo que cambia está en `metodo.json` y en las secciones `<PROYECTO>` de `CLAUDE.md`.

## Cómo instalarlo en un proyecto

1. Copiar el contenido de `plantilla/` a la raíz del proyecto (sin pisar docs existentes: si ya hay changelog o backlog, se apuntan desde `metodo.json`).
2. Completar `.claude/metodo.json`: `proyecto`, `testCommand` (tiene que devolver código de salida ≠ 0 si falla), `archivosCriticos`, `mensajeCritico` y rutas de `docs`.
3. Completar las secciones `<PROYECTO>` de `CLAUDE.md`.
4. Crear la sección `## Estado actual` en el backlog.
5. Abrir una sesión: el hook de arranque activa solo el pre-commit (`git config core.hooksPath .githooks`) y muestra estado, git, comandos y tests.

Requisitos: Node.js y git. En Windows, si el hook no arranca con `$CLAUDE_PROJECT_DIR`, poner la ruta absoluta en `settings.json` (así estaba en NeuroTEA).

## Cómo se usa

| Momento | Qué hacer |
|---|---|
| Arrancar | Decir "seguimos" o pedir la tarea. El hook ya inyectó estado, git y tests. |
| Trabajar | Pedir en lenguaje normal. Claude aplica el método de `CLAUDE.md`. |
| Antes de commitear código | `/verificar` (Claude lo corre solo). El pre-commit re-corre los tests. |
| Terminar | `/cierre`: barrido de pedidos, estado, changelog, lecciones, commit. |
| Cada mes o tras una tanda grande | `/auditar`. |

## Qué cambió respecto de v7a (NeuroTEA) y por qué

| v7a | v8 | Motivo |
|---|---|---|
| 332 reglas en `REGLAS.md` (234 KB) + índice derivado generado + verificador | ~14 reglas de una línea en `CLAUDE.md` | El índice existía para no gastar ~44k tokens por sesión. Opus 5.5 aplica bien principios cortos; la historia de cada regla va al changelog. |
| El hook inyectaba las reglas (con tope de 10.000 caracteres y auto-medición) | El hook inyecta el **estado** (git, estado actual, comandos, tests); las reglas las carga `CLAUDE.md` | `CLAUDE.md` se carga solo y no tiene ese tope. El hook sigue auto-midiéndose. |
| `PROMPT-CONTINUIDAD.md` pegado a mano + PASO 0 + confirmación en 6-8 bullets | Nada que pegar: el hook corre al abrir y **después de cada compactación** | El PASO 0 compensaba que el modelo "no se acordaba". Ahora el estado llega solo y se re-inyecta tras compactar. |
| `MEMORY.md` separado con techo de 3 bloques y archivo histórico | `## Estado actual` arriba del backlog | Un dato, un dueño; el estado es corto y se reescribe en cada cierre. En proyectos grandes se puede volver a separar. |
| Énfasis gritado (⛔, MAYÚSCULAS, "NUNCA") y narrativa de incidentes dentro de las reglas | Tono calmo, una línea por regla | NeuroTEA ya lo había medido: el griterío no suma obediencia, solo caracteres. |
| Control cruzado con Codex obligatorio en auditorías | `/code-review` integrado o subagente de solo lectura; Codex opcional | Revisión independiente disponible dentro de Claude Code. Se mantiene la regla: un hallazgo se reproduce antes de aceptarlo. |
| Sin pauta de delegación | Lecturas extensas a subagentes; terminar la tarea completa | Opus 5.5 orquesta subagentes y compacta el contexto solo: no hace falta cortar el trabajo por tokens. |
| Firma de commit escrita a mano ("Opus 4.8") | Firma con el modelo real de la sesión | El renglón fijo quedaba viejo en cada cambio de modelo. |
| Pre-commit con 6 gates propios de la clínica | Pre-commit genérico: tests si toca código + changelog si toca un archivo crítico | Lo específico (datos de menores, elenco demo, mockups) queda para proyectos que lo necesiten. |
| Gates de producción (wrangler, navegador) | Gate genérico de archivos críticos configurable | Se agregan gates propios por proyecto cuando hay producción o cuentas externas. |

**Lo que se conserva sin cambios de fondo:** leer antes de actuar · alcance completo · autonomía con criterio · correcciones con plan y OK · hallazgo ≠ bug hasta reproducirlo · tests que pueden ponerse en rojo · arreglo de patrón con grep en cero · pendientes al backlog en el momento · un dato, un dueño · lecciones con destino ejecutable · si hay comando, se usa · borrar solo con OK · barrido de pedidos uno por uno en el cierre · calibrar el largo de los docs.

## Qué agregar en proyectos con producción
Tomar de NeuroTEA según haga falta: `/deploy` con backup y verificación en vivo, gates PreToolUse sobre comandos que tocan producción, candado de datos sensibles en el pre-commit y pre-push, y `auditoria-estado.json` con recordatorio de auditoría cada N deploys.

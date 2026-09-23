---
description: Cierre de sesión — deja al día estado, backlog, changelog y lecciones, verifica coherencia docs↔código y commitea. Disparadores — "cerremos", "cierre", "dejá todo listo para la próxima".
---

# /cierre — cierre de sesión

Rutas: `.claude/metodo.json` → `docs.plan`, `docs.changelog`, `docs.lecciones`. Escribí sin inventar: si falta un dato (una decisión, un valor), preguntalo antes de escribirlo.

## 1 · Barrido de pedidos, uno por uno
Recorré la conversación de arriba a abajo (no tu resumen) y listá cada pedido del usuario, incluidos los dichos al pasar. Para cada uno: `HECHO (evidencia: commit, test, archivo)` o `PENDIENTE → fila en el backlog`. La fila se escribe antes del commit del cierre. Esta lista va en la entrega final.

## 2 · Documentos vivos
- **Backlog (`docs.plan`)**
  - Reescribí la sección `## Estado actual` (reemplazar, no apilar; máximo ~15 líneas): qué quedó hecho, qué no se verificó, siguiente paso recomendado. El hook de arranque la inyecta en la próxima sesión.
  - Lo verificado como resuelto se borra del backlog; la historia queda en el changelog y en git.
  - Cada fila nueva lleva evidencia: archivo:línea o el caso que lo reproduce.
- **Changelog (`docs.changelog`)**: entrada nueva arriba. `## [versión] - fecha — título` · Quién (con el modelo real de la sesión) · Qué se hizo · Decisiones del usuario con fecha · Hallazgos · Pendiente.
- **Lecciones (`docs.lecciones`)**: solo si hubo una lección nueva. Destilada: qué pasó · por qué · cómo aplicarlo · destino ejecutable (el test, chequeo o regla que la hace cumplir). Si no tiene destino ejecutable, decilo.
- **CLAUDE.md**: solo si cambió una regla o una decisión. Se corrige la regla vieja; no se agrega otra al lado.

## 3 · Drift docs ↔ código
Buscá contradicciones entre CLAUDE.md, el manual y el backlog, y el código real (listas de opciones, fórmulas, rutas, comandos). Corregí lo que encuentres y mencionalo en la entrega.

## 4 · Verificación y commit
- Corré `testCommand`; tiene que pasar.
- Commit con archivos nombrados, mensaje por archivo (`git commit -F`), firmado con el modelo real de la sesión. Releé `git log -1`.
- Push a la rama de trabajo si el proyecto tiene remoto.

## 5 · Entrega (máximo 8 líneas)
Hash del commit · pedidos HECHOS / PENDIENTES (la lista del paso 1, abreviada) · lo que no se verificó · siguiente paso recomendado.

Calibrá el largo: cada cierre tiende a engordar los documentos. Antes de agregar un párrafo, preguntate si dice algo que no esté ya escrito.

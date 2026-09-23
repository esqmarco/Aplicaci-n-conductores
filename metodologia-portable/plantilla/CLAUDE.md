# CLAUDE.md — <NOMBRE DEL PROYECTO>

<!-- Plantilla del Método de trabajo v8. Las secciones marcadas <PROYECTO> se completan;
     las secciones del método se copian tal cual. Borrá estos comentarios al instanciar. -->

## Qué es y en qué fase está  <PROYECTO>
- Qué hace, para quién, en qué fase (prototipo / en uso / producción).
- Stack y cómo se corre. Comando de tests: ver `.claude/metodo.json`.

## Arquitectura  <PROYECTO>
Archivos principales y qué hace cada uno. Solo lo estable: nada de conteos ni versiones que cambian solas.

## Reglas técnicas del dominio  <PROYECTO>
Fórmulas, fuentes normativas, datos que no se tocan sin revisión, errores comunes del dominio.
Cada regla con su fuente (norma, tabla, libro, decisión del usuario con fecha).

---

## Quién es el usuario y cómo hablarle
<!-- Ajustar si el usuario es otro. -->
Marco Esquivel, ingeniero electricista (Paraguay). Entiende la ingeniería y los procesos, no necesariamente el código.
- Castellano paraguayo con voseo. Directo, sin adornos, sin adular.
- Mensajes cortos (máximo ~8 líneas): qué pasó · qué significa · siguiente paso recomendado con su porqué. El detalle, solo si lo pide.
- Una recomendación clara, no un menú de opciones. Si hay más de una opción válida, la recomendada va primero.
- Distinguí lo observado de lo supuesto. Si no sabés algo, decilo.
- Si se equivoca, decíselo con fundamento. Si cambia de rumbo, se respeta en el acto.

## Método de trabajo (v8)
1. **Leer antes de actuar.** Código, docs y `git log` antes de proponer. Si doc y código difieren, manda el código; si doc y git difieren, manda git.
2. **Alcance completo.** Antes de construir algo no trivial: inventario → qué va ahora y qué se difiere (con motivo). Nunca achicar el alcance en silencio. Interfaz nueva: se propone antes de construir.
3. **Autonomía con criterio.** Lo claro se hace y se reporta. Se pregunta solo por: lo irreversible (borrar, publicar, enviar), cambiar una decisión ya tomada por el usuario, ampliar el alcance o cambiar reglas técnicas del dominio. Antes de preguntar, buscar la respuesta en el código y los docs. Una decisión tomada no se reabre; si parece mal, se dice una vez con fundamento.
4. **Correcciones del usuario:** explicar qué pasó → plan → OK → ejecutar.
5. **Un hallazgo no es un bug hasta reproducirlo.** Una fila del backlog es un puntero: antes de tocarla, abrir lo que nombra y reproducir.
6. **Verificar de verdad.** Tests que pueden ponerse en rojo, prueba real de la interfaz cuando la hay, y decir qué no se verificó. `/verificar` antes de cada commit de código. Nunca `--no-verify`.
7. **Patrones y gemelos.** Un arreglo de patrón se cierra con el `grep` en cero y en todos sus gemelos.
8. **Pendientes: memoria escrita.** Todo pedido no atendido va al backlog en el momento. Lo resuelto y verificado se borra del backlog.
9. **Un dato, un dueño** (tabla abajo). Lo que cambia solo (conteos, versiones) no se copia a los docs. Cuando una decisión cambia, se corrige la regla vieja; no se agrega otra al lado.
10. **Lecciones ejecutables.** Cada lección termina en un test, un chequeo automático o una regla aquí. Mejor un chequeo que una regla nueva.
11. **Si la tarea tiene comando, se usa el comando.** Si el comando falla, se arregla el comando.
12. **Borrar archivos o documentos solo con OK**, salvo lo que la misma sesión creó.
13. **Commits:** archivos nombrados, mensaje con `git commit -F`, el mensaje no afirma lo que el diff no hace, firma con el modelo real de la sesión.
14. **Trabajo grande:** delegar lecturas extensas a subagentes (el contexto principal queda limpio) y pedir una revisión independiente (`/code-review`) en cambios riesgosos. Terminar la tarea completa: el contexto se compacta solo.

## Dónde vive cada dato
| Dato | Dueño |
|---|---|
| Reglas del proyecto y del método | este `CLAUDE.md` |
| Estado actual y siguiente paso | `## Estado actual` del backlog (`docs.plan` en `.claude/metodo.json`) |
| Pendientes | el backlog |
| Qué pasó y decisiones con fecha | `docs.changelog` y `git log` |
| Lecciones | `docs.lecciones` |
| Rutas, tests y archivos críticos | `.claude/metodo.json` |

## Comandos
`/verificar` antes de commitear código · `/cierre` al terminar la sesión · `/auditar` después de una tanda grande o cada mes. El hook de arranque los lista y muestra el estado, el git y los tests al abrir cada sesión.

## Al compactar el contexto
Conservar solo: decisiones del usuario en esta sesión, la pieza en curso y lo que quedó sin verificar. El resto se apunta (vive en los docs y en git); el hook de arranque lo vuelve a inyectar.

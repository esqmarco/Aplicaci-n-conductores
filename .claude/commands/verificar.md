---
description: Verificación holística antes de commitear código. Disparadores — "verificá", "¿está listo?", "¿puedo commitear?", o cualquier commit que toque código. Nada se declara listo sin pasar por acá.
---

# /verificar — antes de cada commit de código

Rutas y comandos del proyecto: `.claude/metodo.json` (`testCommand`, `archivosCriticos`, `docs`).

## 0 · Alcance
`git status --short` y `git diff --stat`. Decí en una línea qué vas a verificar. Si el cambio es solo documentación, decilo y pasá al paso 6.

## 1 · Consecuencias
Por cada cambio, respondé por escrito:
- ¿Qué otras funciones, pantallas o cálculos dependen de esto? (`grep` del nombre, no memoria.)
- ¿Tiene gemelos que deben cambiar igual? (Ej.: la misma lógica en otra pestaña, otro material, otro modo de entrada.) Un arreglo de patrón se cierra con el `grep` en cero.
- ¿Algún texto de la interfaz o de la documentación quedó prometiendo algo distinto de lo que hace el código?
Lo que aparezca se arregla antes de seguir.

## 2 · Inventario de salidas
Por cada función existente que tocaste, listá todos sus `return` y `throw`. Cada campo nuevo del resultado tiene que estar en todas las salidas o faltar a propósito. Los caminos cortos (error, caso borde, valor por defecto) son donde se olvida.

## 3 · Tests que pueden fallar
- Corré `testCommand`. Cualquier falla frena todo.
- Si el cambio corrige un error, tiene que haber un test que falle con el código anterior y pase con el nuevo. Un test que nunca pudo estar en rojo no prueba nada.
- Si el cambio toca datos técnicos o fórmulas, el test usa un valor verificado a mano contra la fuente (tabla, norma, libro) y el comentario cita la fuente.

## 4 · Prueba real
Si hay interfaz, probá el flujo tocado en el navegador (Playwright/Chromium headless si está disponible): cargar datos, calcular, leer el resultado y revisar la consola sin errores propios. Lo que no puedas probar, se anota en el veredicto como "no verificado".

## 5 · Limpieza
Sin capturas, temporales ni procesos sueltos en el repo. `git status` muestra solo lo que va al commit.

## 6 · Veredicto (corto, lenguaje simple)
- Qué se verificó y con qué evidencia (número de tests, caso probado).
- Qué no se verificó y por qué.
- Si todo pasó: commit nombrando los archivos (sin `git add -A` si hay otra sesión trabajando), mensaje con `git commit -F`, releer `git log -1`. Si algo falló: plan de arreglo.

Nunca `--no-verify`: si el pre-commit frena, se arregla la causa.

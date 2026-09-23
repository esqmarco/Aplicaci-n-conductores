---
description: Auditoría periódica de coherencia — invariantes del código, paridad entre partes gemelas, drift docs↔código y revisión independiente. Disparadores — "auditá", "revisión general", después de una tanda grande de cambios o cada mes.
---

# /auditar — auditoría de coherencia

La auditoría busca patrones, no features. Antes de mirar, nombrá la lente y lo que queda afuera. Al final, decí qué no se miró: nunca "todo auditado".

## Fase A · Invariantes (barrido completo, no muestreo)
Elegí las reglas que el código siempre tiene que cumplir (ver CLAUDE.md) y barré con `grep` todo el repo. Ejemplos genéricos:
- Ningún valor por defecto silencioso donde falta un dato (un error se muestra como error, nunca como 0 o 1,0).
- Toda entrada del usuario pasa por validación antes del cálculo.
- `innerHTML` solo con texto controlado.
Cada violación: archivo:línea.

## Fase B · Paridad de gemelos
Lo que existe en una parte y debe existir igual en su gemela (otra pestaña, otro modo, otro material, otra variante). Tabla: capacidad × gemelo → ✓ / falta / difiere a propósito (con fuente).

## Fase C · Drift docs ↔ código
CLAUDE.md, manual, PRD y backlog contra el código: listas de opciones, fórmulas, rutas, comandos y cifras. Lo que no coincide se corrige o va al backlog.

## Fase D · Revisión independiente
Usá `/code-review` (o un subagente de solo lectura) con contexto mínimo: el código, no la historia. Pedí hallazgos con archivo:línea y escenario de falla. Después, reproducí cada hallazgo antes de aceptarlo: un hallazgo no es un bug hasta verificarlo. Su veredicto técnico se acepta si se reproduce; su gravedad la decidís vos con el contexto del proyecto.

## Salida
- Informe en `documentos/auditorias/AUDITORIA_<fecha>.md`: lentes usadas, hallazgos (verificado / no reproducido / sin verificar), lo que no se miró.
- Cada hallazgo verificado → arreglo inmediato si es chico y claro, o fila en el backlog con evidencia.
- Lección nueva → con su destino ejecutable (test o chequeo).

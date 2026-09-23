# Lecciones Aprendidas - Calculadora de Cables Electricos

Formato desde el Metodo de trabajo v8: una sola pila, la mas nueva arriba. Cada leccion: que paso · por que · como aplicarlo · destino ejecutable.

## Memoria de calculo (2026-09-23)

### Un resultado derivado se calcula sobre el valor final, no sobre uno intermedio
- **Que paso:** el conductor de proteccion se mostraba sobre la seccion por ampacidad (16 mm2) aunque la seccion adoptada, por cortocircuito, era 95 mm2 (PE correcto: 50 mm2). En DC, la seccion final combinaba la ampacidad de un conductor con la caida calculada para 2 por polo.
- **Por que:** cada valor derivado se calculaba en la pestana donde nacio, sin mirar el resultado final.
- **Como aplicarlo:** lo que depende de la seccion (PE, verificaciones) se calcula despues de decidir la seccion final, con las mismas condiciones (paralelo, conductores por polo).
- **Destino ejecutable:** tests de `calcularSeccionFinalDCDesde`; `/verificar` paso 1 (consecuencias). El PE final no tiene test de node porque vive en app.js (se verifico en el navegador).

## Clase del conductor (2026-09-23)

### Un dato cargado dos veces termina con dos valores
- **Que paso:** la resistencia del aluminio estaba en la tabla AC y en la DC; desde 500 mm2 los valores ya no coincidian. La clase 5 del cobre vivia solo en DC y AC no podia usarla.
- **Por que:** cada pestana se armo con su propia tabla en vez de apuntar a una fuente comun.
- **Como aplicarlo:** una sola tabla por dato; los demas modulos la referencian.
- **Destino ejecutable:** test "Single aluminium resistance table for AC and DC" (compara por identidad, no por valor).

## Revision integral v5 (2026-09-22)

### Los datos tecnicos se toman de la fuente primaria, no de una especificacion intermedia
- **Que paso:** `tablas_universales_cables.md` ordenaba "usar EXACTAMENTE" tablas con columnas INPACO desalineadas y tablas de media tension rotuladas como baja tension. La app las copio tal cual.
- **Por que:** nadie contrasto la especificacion contra el catalogo, que estaba en el mismo repo.
- **Como aplicarlo:** extraer los valores del PDF de la fuente con un script (no a mano) y verificar monotonicidad y coherencia (3 conductores <= 2 conductores).
- **Destino ejecutable:** tests del Grupo 17 fijan valores del catalogo; los documentos intermedios quedaron marcados SUPERADO.

### Una formula "corregida" sin cita es una sospecha
- **Que paso:** en R3 se agrego un sqrt(2) a la formula bifasica tomado del manual interno. Subestimaba la corriente un 29% y quedo protegido como "regla critica" en CLAUDE.md.
- **Por que:** la regla protegia la formula sin exigir la referencia que la justificara.
- **Como aplicarlo:** toda formula lleva su fuente (libro, ecuacion, tabla). Una regla que protege un valor sin fuente se revisa antes de obedecerla.
- **Destino ejecutable:** CLAUDE.md lista cada formula con su fuente; test "Bifasico 7500W 220V -> 10mm2".

### Un campo que se lee pero no se aplica engana al usuario
- **Que paso:** factor de demanda, resistividad del suelo, agrupamiento DC y tipo de aplicacion DC se leian del formulario y no cambiaban el resultado.
- **Por que:** se agregaron a la UI y a `obtenerParametros...` sin conectarlos al calculo.
- **Como aplicarlo:** cada entrada nueva necesita un test donde cambiarla cambia el resultado.
- **Destino ejecutable:** tests de los Grupos 18 y 19; `/verificar` paso 1 (consecuencias).

### Cambiar un formulario sin cambiar su validacion rompe la pestana entera
- **Que paso:** en 4.6.0 la Caida de Tension DC paso de potencia a corriente, pero la validacion siguio pidiendo potencia: la pestana nunca volvio a calcular.
- **Por que:** UI, validacion y calculo son gemelos y se cambio uno solo; no habia test de la validacion.
- **Como aplicarlo:** al cambiar un formulario, revisar juntos UI -> validacion -> calculo y probar la pestana en el navegador.
- **Destino ejecutable:** test "DC voltage drop validation works with current"; `/verificar` pasos 1 y 4.

### Un valor por defecto silencioso esconde el error
- **Que paso:** si no habia factor de temperatura para 42 C, el calculo usaba 1,0 sin avisar; lo mismo con agrupamiento.
- **Por que:** `try/catch` con valor por defecto "para que no se rompa".
- **Como aplicarlo:** interpolar cuando corresponde y lanzar error cuando el dato no existe.
- **Destino ejecutable:** tests "PVC above 60C throws", "Temperature out of range throws"; regla en CLAUDE.md.

---

## 1. Sobre la Arquitectura

### Lo que funciono bien
- Separar datos tecnicos (data-tables.js) de la logica de calculo (calculations.js) fue una excelente decision. Permite actualizar tablas normativas sin tocar el codigo de calculo.
- Usar JavaScript vanilla sin frameworks mantiene la aplicacion simple y sin dependencias externas.

### Lo que no funciono
- Tener el CSS dentro del HTML (inline) hace el archivo muy grande y dificil de mantener. Deberia estar en un archivo separado (styles.css).
- No tener tests automaticos desde el principio permitio que bugs graves (como la formula bifasica) pasaran desapercibidos.

## 2. Sobre los Bugs Encontrados

### Bug mas critico: Formula bifasica
- En R3 se agrego un factor √2 a la formula bifasica tomandolo del manual interno, sin referencia bibliografica. Ese factor solo vale para sistemas bifasicos a 90° (obsoletos) y subestimaba la corriente un 29%. Se quito en 5.1.0 (Mamede 3.5.1.1: I = P / (Vff × cosφ)).
- Leccion: Las formulas de ingenieria deben tener una referencia bibliografica clara y tests que las verifiquen con valores conocidos.

### Funciones que no existian
- Los botones de Caida de Tension AC y Cortocircuito AC llamaban a funciones que nunca se programaron. La interfaz se veia completa pero no funcionaba.
- Leccion: Nunca crear botones que llamen a funciones inexistentes. Usar placeholders visibles ("En desarrollo") si la funcion no esta lista.

### HTML fuera de lugar
- Habia selectores de formulario flotando entre el encabezado y las pestanas, visibles pero sin contexto.
- Leccion: Revisar visualmente la aplicacion despues de cada cambio. Un error de estructura HTML puede no dar error en consola pero verse roto.

### Datos cargados pero no usados
- Las tablas completas de ampacidad estaban cargadas en data-tables.js pero la pestana AC no las usaba. El calculo AC solo llegaba hasta calcular corriente.
- Leccion: Cargar datos no es lo mismo que usarlos. Verificar que cada tabla tenga al menos una funcion que la consuma.

## 3. Sobre la Experiencia de Usuario

### confirm() es molesto
- Usar dialogos nativos del navegador (confirm/alert) para preguntar si sincronizar datos interrumpe el flujo de trabajo del usuario.
- Leccion: Las sincronizaciones deben ser silenciosas o con notificaciones no intrusivas.

### Mensajes acumulados
- Cada calculo generaba mensajes que se apilaban. En una sesion normal se acumulaban docenas.
- Leccion: Limitar mensajes visibles (maximo 3) y auto-eliminarlos despues de pocos segundos.

### Falta de modos de entrada
- Un ingeniero que ya conoce la corriente de su circuito no deberia tener que inventar una potencia para poder usar la calculadora.
- Leccion: Ofrecer multiples puntos de entrada segun el dato disponible (potencia, corriente, kVA del transformador).

## 4. Sobre Calidad de Codigo

### Tests son indispensables
- Sin tests, los bugs en formulas matematicas pasan desapercibidos hasta que un ingeniero nota resultados incorrectos en campo.
- Leccion: Toda formula de calculo debe tener al menos un test con valores verificados manualmente.

### Validaciones no pueden estar vacias
- Las funciones de validacion AC estaban declaradas pero vacias (siempre retornaban "valido"). Esto permitia calcular con datos incorrectos.
- Leccion: Una funcion de validacion vacia es peor que no tener validacion, porque da falsa seguridad.

### Nomenclatura consistente
- El proyecto mezcla portugues (corrente, condutor, isolamento) con espanol (corriente, conductor, aislamiento). Esto causa confusion.
- Leccion: Definir un idioma para las variables y mantenerlo consistente.

## 5. Sobre el Proceso de Desarrollo

### Documentar antes de programar
- No existia un PRD ni especificacion clara de que debia hacer cada pestana. Esto llevo a implementaciones incompletas.
- Leccion: Tener un documento de requisitos (PRD) claro antes de empezar a programar.

### CLAUDE.md como guia
- Crear un archivo de instrucciones para el proyecto permite que cualquier desarrollador (humano o IA) entienda rapidamente la estructura y las reglas.
- Leccion: Mantener un CLAUDE.md actualizado con convenciones, formulas criticas y flujo de trabajo.

### Control de versiones con changelog
- Sin un changelog, es imposible saber que cambio, cuando y por que.
- Leccion: Mantener CHANGELOG.md actualizado con cada version.

## 6. Sobre Cobertura de Tablas de Datos (v4.2)

### Tablas incompletas causan errores silenciosos
- EPR_105 solo tiene metodos A, B, H, I en las tablas de ampacidad. Si el usuario elegia metodo D (enterrado), la app no encontraba datos y decia "corriente excede capacidad maxima" aunque 200A es perfectamente viable.
- HEPR no tiene metodos H ni I. Elegia enterrado y crasheaba.
- Leccion: **Toda combinacion que el usuario pueda seleccionar en la interfaz debe tener datos en las tablas, o un fallback explicito con advertencia visible.**

### IDs de HTML vs JavaScript deben ser identicos
- Los IDs de resultados AC tenian sufijo "-ac" en JS pero no en HTML. Los resultados se calculaban correctamente pero nunca se mostraban.
- Leccion: **Buscar cada getElementById en el JS y verificar que el ID existe exactamente igual en el HTML. Un caracter de diferencia = resultado invisible.**

### Modo de entrada necesita consistencia end-to-end
- El selector de modo (potencia/corriente/transformador) cambiaba visualmente pero la validacion siempre pedia potencia, y el calculo duplicaba logica.
- Leccion: **Cuando hay multiples modos de entrada, la validacion, la UI y el calculo deben manejar TODOS los modos. Probar cada modo antes de commitear.**

## 7. Recomendaciones para el Futuro

1. **Siempre correr tests antes de hacer commit**
2. **Toda formula nueva debe incluir su referencia bibliografica en el codigo**
3. **Revisar visualmente la app despues de cada cambio de HTML**
4. **No dejar funciones placeholder - implementar o marcar visiblemente como pendiente**
5. **Actualizar CHANGELOG.md con cada cambio significativo**
6. **Revisar PLAN_DE_MEJORAS.md periodicamente para priorizar siguiente fase**
7. **Verificar cobertura de tablas: toda combinacion seleccionable debe tener datos o fallback**
8. **Verificar IDs: cada getElementById en JS debe coincidir exactamente con el HTML**
9. **Probar cada modo de entrada end-to-end (UI + validacion + calculo + resultados)**

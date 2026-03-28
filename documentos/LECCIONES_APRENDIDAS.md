# Lecciones Aprendidas - Calculadora de Cables Electricos

## 1. Sobre la Arquitectura

### Lo que funciono bien
- Separar datos tecnicos (data-tables.js) de la logica de calculo (calculations.js) fue una excelente decision. Permite actualizar tablas normativas sin tocar el codigo de calculo.
- Usar JavaScript vanilla sin frameworks mantiene la aplicacion simple y sin dependencias externas.

### Lo que no funciono
- Tener el CSS dentro del HTML (inline) hace el archivo muy grande y dificil de mantener. Deberia estar en un archivo separado (styles.css).
- No tener tests automaticos desde el principio permitio que bugs graves (como la formula bifasica) pasaran desapercibidos.

## 2. Sobre los Bugs Encontrados

### Bug mas critico: Formula bifasica
- La formula para sistemas bifasicos no incluia el factor √2, lo que producia corrientes incorrectas.
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

## 6. Recomendaciones para el Futuro

1. **Siempre correr tests antes de hacer commit**
2. **Toda formula nueva debe incluir su referencia bibliografica en el codigo**
3. **Revisar visualmente la app despues de cada cambio de HTML**
4. **No dejar funciones placeholder - implementar o marcar visiblemente como pendiente**
5. **Actualizar CHANGELOG.md con cada cambio significativo**
6. **Revisar PLAN_DE_MEJORAS.md periodicamente para priorizar siguiente fase**

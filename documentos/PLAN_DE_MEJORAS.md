# Plan de Mejoras - Calculadora de Cables Electricos

## Estado Actual (Version R3 - Reparada)

### Bugs Corregidos
1. **Formula bifasica corregida** - Ahora usa `I = P / (V x cos phi x eta x sqrt(2))` segun manual
2. **Funciones AC calcularCaidaTension() y calcularCortocircuito() implementadas** - Ya no dan error al hacer clic
3. **HTML huerfano eliminado** - Los selectores de material/aislamiento ya no flotan entre header y pestanas
4. **resistenciasInternasBateria definido** - La sugerencia de resistencia interna de bateria funciona
5. **Placeholder de 16mm2 eliminado** - calcularSeccionParaCaidaDC() ahora calcula correctamente
6. **Conversion de unidades implementada** - CV (735.5W), HP (745.7W), kW funcionan correctamente
7. **Dimensionamiento AC completo** - Ahora selecciona seccion real usando tablas de data-tables.js
8. **Validaciones AC completas** - validarParametrosCaidaTensionAC y validarParametrosCortocircuitoAC implementadas
9. **confirm() eliminado** - Sincronizacion silenciosa sin dialogos molestos

### Funcionalidades Nuevas Agregadas
1. **Modo Corriente Directa** - El ingeniero puede ingresar la corriente conocida directamente
2. **Modo Transformador** - Calcula corriente desde kVA del transformador
3. **Pestana Resultados AC** - Consolida los 3 criterios AC y muestra seccion final
4. **Metodos H e I en AC** - Ahora accesibles en el selector de metodo de instalacion
5. **8 pestanas funcionales** - Proyecto AC, Caida Tension AC, Cortocircuito AC, Resultados AC, Ampacidad DC, Caida Tension DC, Cortocircuito DC, Resultados DC

---

## Mejoras Pendientes (Priorizadas)

### FASE 1: Precision Tecnica (Prioridad Alta)

| Mejora | Descripcion | Impacto |
|--------|-------------|---------|
| Factor temperatura DC por aislamiento | Distinguir PVC (70C max) vs EPR (90C max) en factores DC | Los factores actuales son iguales para ambos, lo cual es incorrecto |
| Usar tablas completas de ampacidad DC | Reemplazar tabla simplificada (4 metodos) por data-tables.js completas | Mayor precision en seleccion de seccion DC |
| Constante K aluminio+PVC | Verificar si usar 74 (data-tables) o 76 (NBR 5410) | Afecta calculo de cortocircuito |
| Reactancia inductiva para secciones >= 50mm2 | Agregar componente inductivo en caida de tension AC | Importante para cables de seccion grande |
| Seccion minima por norma | Verificar 2.5mm2 min para tomadas, 1.5mm2 min para iluminacion | Requisito NBR 5410 |

### FASE 2: Funcionalidades de Ingenieria (Prioridad Media)

| Mejora | Descripcion | Impacto |
|--------|-------------|---------|
| Factor de agrupamiento en DC | Agregar selector y calculo de agrupamiento para pestanas DC | DC actualmente no tiene agrupamiento |
| Limites de caida DC por aplicacion | Ofrecer seleccion: UPS (1%), servicios auxiliares (2%), fotovoltaico (3%), etc. | Los datos ya existen en data-tables.js |
| Factor de demanda | Para dimensionamiento de alimentadores con multiples cargas | Importante para proyectos reales |
| Correccion por resistividad del suelo | Para metodos enterrados H e I | Los datos ya existen en fatoresEspeciais |
| Cable de proteccion (tierra) | Calcular calibre del conductor de proteccion | Requisito de toda instalacion |
| Aluminio en AC | Verificar que la seleccion de aluminio funcione correctamente con seccion minima 16mm2 | Completar soporte |

### FASE 3: Experiencia de Usuario (Prioridad Media)

| Mejora | Descripcion | Impacto |
|--------|-------------|---------|
| Tooltips de ayuda | Agregar explicaciones en cada campo del formulario | Facilita uso por ingenieros menos experimentados |
| Indicadores de pestanas completadas | Icono verde en pestanas que ya se calcularon | Mejor navegacion |
| Generacion de reporte imprimible | Reporte HTML formateado para imprimir/guardar como PDF | Documentacion de proyectos |
| Validacion en tiempo real | Mostrar errores mientras se escribe, no solo al calcular | Mejor experiencia |
| Historial de calculos | Guardar ultimos calculos en localStorage | Evitar perder trabajo |

### FASE 4: Funcionalidades Avanzadas (Prioridad Baja)

| Mejora | Descripcion | Impacto |
|--------|-------------|---------|
| Exportacion a PDF nativo | Usar libreria como jsPDF | Reporte profesional descargable |
| Modo oscuro | Tema oscuro para trabajo nocturno | Comodidad visual |
| Soporte multiidioma | Portugues y espanol | Ampliar audiencia |
| Calculo de canalizacion | Determinar tamano de electroducto segun numero de cables | Complemento natural |
| Comparacion de alternativas | Mostrar 2-3 opciones de seccion con pros/contras | Mejor toma de decisiones |
| Base de datos de cables comerciales | Marcas y modelos reales con sus especificaciones | Vincular a productos reales |

---

## Arquitectura Recomendada para Futuras Mejoras

### Estructura de Archivos Actual
```
index.html        - Interfaz (HTML + CSS)
data-tables.js    - Datos tecnicos (tablas INPACO, NBR, Mamede)
calculations.js   - Funciones de calculo AC y DC
validations.js    - Validaciones de entrada
app.js            - Controlador principal y logica de UI
```

### Recomendaciones de Arquitectura
1. **Separar CSS** - Mover estilos a un archivo `styles.css` independiente
2. **Modularizar data-tables** - Separar datos AC y DC en archivos distintos
3. **Testing** - Agregar pruebas unitarias con un framework como Jest
4. **Build system** - Considerar bundler (Vite) si la app crece mucho
5. **PWA** - Convertir en Progressive Web App para uso offline en campo

---

## Notas Tecnicas

### Formulas Implementadas

**Corriente AC:**
- Monofasico: `I = P / (V x fp x eta)`
- Bifasico: `I = P / (V x fp x eta x sqrt(2))`
- Trifasico: `I = P / (sqrt(3) x V x fp x eta)`

**Corriente Corregida:**
- `Ic = I / (ft x fa)` donde ft = factor temperatura, fa = factor agrupamiento

**Caida de Tension AC:**
- Monofasico/Bifasico: `DV = 2 x R x I x L`
- Trifasico: `DV = sqrt(3) x R x I x L`

**Cortocircuito AC:**
- `Icc = Scc / (sqrt(3) x V)`
- `Smin = Icc x sqrt(t) / K`

**Caida de Tension DC:**
- `DV = 2 x R x I x L / Np`

### Fuentes de Datos
- Catalogo INPACO 2021 (Paraguay)
- NBR 5410 (Brasil)
- Mamede Filho - Instalaciones Electricas Industriales

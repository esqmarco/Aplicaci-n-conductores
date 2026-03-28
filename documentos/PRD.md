# PRD - Calculadora de Cables Electricos

## 1. Vision del Producto

Aplicacion web profesional de ingenieria electrica para dimensionar conductores (cables) segun normas INPACO 2021, NBR 5410 y Mamede Filho. Debe servir como herramienta de apoyo a ingenieros electricistas en Paraguay y Brasil.

La aplicacion automatiza el proceso completo de seleccion de seccion de cable, integrando los tres criterios normativos (ampacidad, caida de tension y cortocircuito) en una sola herramienta, eliminando la necesidad de consultar tablas fisicas y realizar calculos manuales.

---

## 2. Usuarios Objetivo

| Perfil | Necesidad Principal |
|--------|-------------------|
| Ingenieros electricistas proyectistas | Dimensionar conductores con precision normativa para proyectos industriales y residenciales |
| Tecnicos electricistas | Verificar rapidamente la seccion adecuada para instalaciones en campo |
| Estudiantes de ingenieria electrica | Aprender y validar calculos de dimensionamiento de cables |
| Empresas de instalaciones electricas | Estandarizar el proceso de seleccion de cables en sus proyectos |

---

## 3. Problema que Resuelve

Dimensionar cables electricos requiere consultar multiples tablas, aplicar factores de correccion y verificar 3 criterios simultaneamente (ampacidad, caida de tension, cortocircuito). Este proceso manual es lento y propenso a errores. La calculadora automatiza todo el proceso.

### Dolor actual del usuario

1. **Consulta manual de tablas**: El ingeniero debe buscar en catalogos fisicos o PDFs las tablas de ampacidad por metodo de instalacion, tipo de aislamiento y material del conductor.
2. **Aplicacion de factores de correccion**: Debe calcular manualmente los factores de temperatura y agrupamiento, y aplicarlos a la corriente de proyecto.
3. **Verificacion cruzada de 3 criterios**: Debe comparar la seccion obtenida por ampacidad con la requerida por caida de tension y por cortocircuito, seleccionando la mayor.
4. **Diferencias normativas**: Las tablas varian entre INPACO (Paraguay) y NBR 5410 (Brasil), generando confusion.
5. **Errores de calculo**: La complejidad del proceso aumenta la probabilidad de errores que pueden resultar en cables subdimensionados (riesgo de incendio) o sobredimensionados (costo innecesario).

---

## 4. Funcionalidades Implementadas (v3.0)

### 4.1 Dimensionamiento AC - Ampacidad

**Modos de entrada de corriente:**
- Calculo de corriente desde potencia (W, kW, CV, HP) con factor de potencia y rendimiento
- Calculo de corriente desde corriente directa conocida (el ingeniero ingresa los Amperes)
- Calculo de corriente desde potencia de transformador (kVA)

**Sistemas electricos soportados:**
- Monofasico: `I = P / (V x fp x eta)`
- Bifasico: `I = P / (V x fp x eta x sqrt(2))`
- Trifasico: `I = P / (sqrt(3) x V x fp x eta)`

**Factores de correccion:**
- Factor de temperatura ambiente (segun aislamiento y metodo de instalacion)
- Factor de agrupamiento (segun cantidad de circuitos)
- Corriente corregida: `Ic = I / (ft x fa)`

**Seleccion automatica de seccion por ampacidad:**
- Consulta de tablas INPACO/NBR 5410 segun metodo de instalacion
- Secciones normalizadas desde 1.5mm2 hasta 500mm2

**Metodos de instalacion (11 metodos):**
- A1: Conductores aislados en conducto embutido en pared aislante
- A2: Cable multipolar en conducto embutido en pared aislante
- B1: Conductores aislados en conducto sobre pared
- B2: Cable multipolar en conducto sobre pared
- C: Cables unipolares o multipolar sobre pared
- D: Cable multipolar en conducto enterrado
- E: Cable multipolar al aire libre
- F: Cables unipolares en contacto al aire libre
- G: Cables unipolares separados al aire libre
- H: Conductores aislados en escalerilla/bandeja perforada
- I: Cables unipolares en bandeja perforada

**Tipos de aislamiento (4 tipos):**
- PVC (70C)
- EPR 90C
- EPR 105C
- HEPR (alta temperatura)

**Materiales conductores:**
- Cobre (Cu)
- Aluminio (Al) - seccion minima 16mm2

### 4.2 Verificacion de Caida de Tension AC

- Calculo de caida de tension en Voltios y porcentaje
- Limite normativo: 4% (NBR 5410)
- Formulas implementadas:
  - Monofasico/Bifasico: `DV = 2 x R x I x L`
  - Trifasico: `DV = sqrt(3) x R x I x L`
- Resistencia del conductor segun seccion y material (tablas INPACO)
- Entrada de distancia en metros

### 4.3 Verificacion de Cortocircuito AC

- Calculo de corriente de cortocircuito desde potencia de cortocircuito en MVA:
  - `Icc = Scc / (sqrt(3) x V)`
- Seccion minima por cortocircuito:
  - `Smin = Icc x sqrt(t) / K`
- Constantes K por material y aislamiento:
  - Cobre + PVC: K = 115
  - Cobre + EPR: K = 143
  - Aluminio + PVC: K = 74 (verificar contra NBR: 76)
  - Aluminio + EPR: K = 94
- Tiempo de actuacion de la proteccion configurable (segundos)

### 4.4 Resultados Consolidados AC

- Integracion simultanea de los 3 criterios:
  1. Seccion por ampacidad
  2. Seccion por caida de tension
  3. Seccion por cortocircuito
- El criterio mas restrictivo (seccion mayor) determina la seccion final recomendada
- Visualizacion clara de cual criterio gobierna la seleccion

### 4.5 Dimensionamiento DC (Completo)

**Ampacidad DC:**
- Seleccion de seccion por corriente continua
- Factores de temperatura ambiente

**Caida de tension DC:**
- Formula: `DV = 2 x R x I x L / Np` (Np = numero de conductores en paralelo)
- Limites segun aplicacion (UPS, servicios auxiliares, fotovoltaico, etc.)

**Cortocircuito DC:**
- Calculo con constantes K para corriente continua
- Soporte para baterias: plomo-acido, litio, niquel-cadmio
- Resistencia interna de bateria (sugerencia automatica segun tipo)

**Resultados consolidados DC:**
- Misma logica de 3 criterios que AC
- Tension personalizable

### 4.6 Interfaz de Usuario

- 8 pestanas funcionales:
  1. Proyecto AC (Ampacidad)
  2. Caida de Tension AC
  3. Cortocircuito AC
  4. Resultados AC
  5. Ampacidad DC
  6. Caida de Tension DC
  7. Cortocircuito DC
  8. Resultados DC
- Sincronizacion silenciosa de parametros entre pestanas (sin dialogos confirm())
- Selectores globales de material y aislamiento en el header

---

## 5. Funcionalidades Pendientes

### FASE 1: Precision Tecnica (Prioridad Alta)

| ID | Funcionalidad | Descripcion | Justificacion |
|----|--------------|-------------|---------------|
| F1.1 | Reactancia inductiva para secciones >= 50mm2 | Agregar componente inductivo `X_L` en calculo de caida de tension AC | Para secciones grandes, ignorar la reactancia produce errores significativos |
| F1.2 | Factor temperatura DC por aislamiento | Distinguir PVC (70C max) vs EPR (90C max) en factores DC | Los factores actuales son identicos para ambos, lo cual es incorrecto |
| F1.3 | Tablas completas de ampacidad DC | Reemplazar tabla simplificada (4 metodos) por tablas completas de data-tables.js | Mayor precision en seleccion de seccion DC |
| F1.4 | Constante K aluminio+PVC | Verificar valor correcto: 74 (data-tables) vs 76 (NBR 5410) | Afecta calculo de cortocircuito para aluminio |
| F1.5 | Seccion minima por norma | 2.5mm2 minimo para tomadas de corriente, 1.5mm2 minimo para iluminacion | Requisito obligatorio NBR 5410 |

### FASE 2: Funcionalidades de Ingenieria (Prioridad Media)

| ID | Funcionalidad | Descripcion | Justificacion |
|----|--------------|-------------|---------------|
| F2.1 | Factor de agrupamiento en DC | Selector y calculo de agrupamiento para pestanas DC | DC actualmente no considera agrupamiento |
| F2.2 | Limites de caida DC por aplicacion | Seleccion: UPS (1%), servicios auxiliares (2%), fotovoltaico (3%) | Los datos ya existen en data-tables.js |
| F2.3 | Factor de demanda | Para dimensionamiento de alimentadores con multiples cargas | Importante para proyectos reales |
| F2.4 | Correccion por resistividad del suelo | Para metodos de instalacion enterrados H e I | Los datos ya existen en fatoresEspeciais |
| F2.5 | Cable de proteccion (tierra) | Calcular calibre del conductor de proteccion segun norma | Requisito de toda instalacion electrica |
| F2.6 | Verificacion de aluminio en AC | Asegurar que aluminio funcione correctamente con seccion minima 16mm2 | Completar soporte de materiales |

### FASE 3: Experiencia de Usuario (Prioridad Media)

| ID | Funcionalidad | Descripcion | Justificacion |
|----|--------------|-------------|---------------|
| F3.1 | Tooltips de ayuda | Explicaciones en cada campo del formulario | Facilita uso por usuarios menos experimentados |
| F3.2 | Indicadores de pestanas completadas | Icono visual en pestanas que ya se calcularon | Mejor navegacion y seguimiento del progreso |
| F3.3 | Generacion de reporte imprimible | Reporte HTML formateado para imprimir o guardar como PDF | Documentacion de proyectos |
| F3.4 | Validacion en tiempo real | Mostrar errores mientras se escribe, no solo al calcular | Reducir ciclos de prueba y error |
| F3.5 | Historial de calculos | Guardar ultimos calculos en localStorage | Evitar perder trabajo entre sesiones |

### FASE 4: Funcionalidades Avanzadas (Prioridad Baja)

| ID | Funcionalidad | Descripcion | Justificacion |
|----|--------------|-------------|---------------|
| F4.1 | Exportacion a PDF nativo | Generar PDF descargable con libreria como jsPDF | Reporte profesional para entregar a clientes |
| F4.2 | Modo oscuro | Tema oscuro para trabajo nocturno o preferencia visual | Comodidad visual |
| F4.3 | Soporte multiidioma | Portugues y espanol | Ampliar audiencia a Brasil y Paraguay |
| F4.4 | Calculo de canalizacion | Determinar tamano de electroducto segun numero de cables | Complemento natural del dimensionamiento |
| F4.5 | Comparacion de alternativas | Mostrar 2-3 opciones de seccion con pros y contras | Mejor toma de decisiones de ingenieria |
| F4.6 | Base de datos de cables comerciales | Marcas y modelos reales con sus especificaciones | Vincular calculos a productos disponibles en el mercado |

---

## 6. Requisitos No Funcionales

| Requisito | Especificacion | Metrica |
|-----------|---------------|---------|
| Rendimiento | Tiempo de carga inicial | < 2 segundos |
| Disponibilidad | Funcionar sin conexion a internet (todo local) | 100% offline |
| Responsividad | Adaptarse a pantallas moviles y desktop | Usable desde 320px de ancho |
| Independencia | Sin dependencias externas | Vanilla JS, sin CDN ni librerias |
| Precision numerica | Corrientes con 2 decimales, secciones exactas de norma | Secciones normalizadas INPACO/NBR |
| Compatibilidad | Navegadores modernos | Chrome, Firefox, Edge, Safari (ultimas 2 versiones) |
| Mantenibilidad | Codigo modular y documentado | Archivos separados por responsabilidad |

---

## 7. Normas de Referencia

| Norma | Organizacion | Pais | Uso en la Aplicacion |
|-------|-------------|------|---------------------|
| INPACO 2021 | Instituto Nacional de Proteccion y Ahorro de la Corriente | Paraguay | Tablas de ampacidad, resistencias, metodos de instalacion |
| NBR 5410 | Associacao Brasileira de Normas Tecnicas (ABNT) | Brasil | Criterios de caida de tension (4%), secciones minimas, constantes K |
| Mamede Filho, Joao - Instalaciones Electricas Industriales (8va edicion) | Referencia academica | Brasil | Formulas de calculo, metodos de dimensionamiento |

---

## 8. Stack Tecnologico

| Componente | Tecnologia | Justificacion |
|-----------|-----------|---------------|
| Estructura | HTML5 | Semantico, accesible |
| Estilos | CSS3 (inline en index.html) | Sin archivo CSS separado (pendiente refactorizacion) |
| Logica | JavaScript vanilla (ES6+) | Sin dependencias, maximo rendimiento |
| Framework | Ninguno | Simplicidad, sin overhead, funciona offline |
| Backend | Ninguno (100% client-side) | Sin servidor, despliegue como archivos estaticos |
| Base de datos | Ninguna (datos embebidos en JS) | Tablas tecnicas como constantes en data-tables.js |

### Estructura de Archivos

```
index.html          - Interfaz de usuario (HTML + CSS inline)
data-tables.js      - Datos tecnicos (tablas INPACO, NBR 5410, Mamede Filho)
calculations.js     - Funciones de calculo AC y DC
validations.js      - Validaciones de entrada de datos
app.js              - Controlador principal y logica de UI
PLAN_DE_MEJORAS.md  - Plan de mejoras priorizado
PRD.md              - Este documento
```

---

## 9. Criterios de Aceptacion Globales

1. **Precision tecnica**: Los resultados deben coincidir con los obtenidos mediante calculo manual usando las mismas tablas y formulas normativas.
2. **Seguridad**: En caso de duda o ambiguedad, la calculadora debe seleccionar la seccion inmediatamente superior (criterio conservador).
3. **Trazabilidad**: El usuario debe poder ver que criterio (ampacidad, caida de tension o cortocircuito) determino la seccion final.
4. **Consistencia**: Los parametros compartidos entre pestanas (material, aislamiento, tension, corriente) deben sincronizarse automaticamente.
5. **Robustez**: Toda entrada del usuario debe ser validada antes del calculo, con mensajes de error claros en espanol.

---

## 10. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Datos incorrectos en tablas | Media | Alto | Verificar contra fuentes originales (catalogo INPACO fisico, NBR 5410 oficial) |
| Formulas con errores | Baja | Alto | Validar con ejemplos resueltos de Mamede Filho |
| Usuario confunde parametros | Media | Medio | Agregar tooltips y validaciones en tiempo real (Fase 3) |
| Incompatibilidad entre normas INPACO y NBR | Baja | Medio | Documentar diferencias y usar la mas conservadora como default |
| Cables de aluminio con seccion < 16mm2 | Media | Medio | Bloquear seleccion de secciones menores a 16mm2 cuando se selecciona aluminio |

---

## 11. Metricas de Exito

- **Precision**: 100% de coincidencia con calculos manuales verificados en al menos 20 casos de prueba representativos.
- **Cobertura**: Soportar los metodos de instalacion y tipos de aislamiento mas comunes (>90% de casos reales).
- **Usabilidad**: Un ingeniero electricista debe poder completar un dimensionamiento completo (3 criterios) en menos de 2 minutos.
- **Adopcion**: Que la herramienta sea referenciada como util por ingenieros electricistas en Paraguay y Brasil.

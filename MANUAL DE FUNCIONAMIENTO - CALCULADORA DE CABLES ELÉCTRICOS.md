# MANUAL DE FUNCIONAMIENTO - CALCULADORA DE CABLES ELÉCTRICOS

## Versión 2.0 - Estructura Modular
### Sistema Profesional de Dimensionamiento según INPACO + NBR 5410 + Mamede Filho

---

## ÍNDICE

1. [Descripción General](#descripción-general)
2. [Objetivos Funcionales](#objetivos-funcionales)
3. [Flujo de Trabajo Principal](#flujo-de-trabajo-principal)
4. [Funcionalidades por Pestaña](#funcionalidades-por-pestaña)
5. [Sistema de Validaciones](#sistema-de-validaciones)
6. [Cálculos y Algoritmos](#cálculos-y-algoritmos)
7. [Manejo de Errores](#manejo-de-errores)
8. [Interfaz de Usuario](#interfaz-de-usuario)
9. [Casos de Uso Típicos](#casos-de-uso-típicos)
10. [Criterios de Aceptación](#criterios-de-aceptación)

---

## DESCRIPCIÓN GENERAL

### Propósito
La calculadora debe dimensionar correctamente cables eléctricos para instalaciones industriales y residenciales, siguiendo las normativas técnicas brasileñas (NBR 5410) y utilizando datos de fabricantes reconocidos (INPACO) complementados con metodologías académicas (Mamede Filho).

### Alcance Técnico
- **Tensiones:** 127V hasta 34.5kV
- **Potencias:** Desde 100W hasta 1000kW
- **Métodos de instalación:** A1 hasta I (11 métodos diferentes)
- **Materiales de aislamiento:** PVC, EPR 90°C, EPR 105°C, HEPR
- **Tipos de sistema:** Monofásico, bifásico, trifásico
- **Conductores:** Cobre y aluminio

### Usuarios Objetivo
- Ingenieros eléctricos
- Técnicos en instalaciones eléctricas
- Estudiantes de ingeniería eléctrica
- Proyectistas de instalaciones industriales

---

## OBJETIVOS FUNCIONALES

### Objetivo Principal
**Determinar la sección mínima de conductor** que satisfaga simultáneamente todos los criterios técnicos:
1. **Capacidad de corriente** (ampacidad corregida)
2. **Límites de caída de tensión** (NBR 5410)
3. **Resistencia a cortocircuito** (tiempo de actuación de protecciones)

### Objetivos Secundarios
- Proporcionar factores de corrección precisos
- Validar cumplimiento normativo
- Generar reportes técnicos
- Educar sobre criterios de dimensionamiento
- Facilitar comparación de alternativas

---

## FLUJO DE TRABAJO PRINCIPAL

### Secuencia Ideal de Uso

1. **ENTRADA DE DATOS BÁSICOS**
   - Usuario ingresa potencia y unidad (W, kW, CV, HP)
   - Selecciona tensión nominal del sistema
   - Define factor de potencia y rendimiento
   - Especifica tipo de sistema eléctrico

2. **CONFIGURACIÓN DE INSTALACIÓN**
   - Selecciona material de aislamiento del cable
   - Define método de instalación (A1 a I)
   - Especifica temperatura ambiente
   - Indica número de circuitos agrupados

3. **CÁLCULO DE PROYECTO**
   - Sistema calcula corriente de proyecto
   - Aplica factores de corrección (temperatura y agrupamiento)
   - Determina corriente corregida
   - Selecciona sección mínima por ampacidad

4. **VERIFICACIÓN DE CAÍDA DE TENSIÓN**
   - Usuario especifica longitud del circuito
   - Sistema calcula caída de tensión
   - Verifica cumplimiento con límites NBR 5410
   - Sugiere sección mayor si es necesario

5. **VERIFICACIÓN DE CORTOCIRCUITO**
   - Usuario ingresa corriente de cortocircuito esperada
   - Define tiempo de actuación de protecciones
   - Sistema verifica resistencia térmica del conductor
   - Confirma o sugiere sección mayor

6. **DIMENSIONAMIENTO FINAL**
   - Sistema integra todos los criterios
   - Selecciona la mayor sección requerida
   - Genera reporte técnico completo
   - Presenta recomendaciones finales

---

## FUNCIONALIDADES POR PESTAÑA

### PESTAÑA 1: PROYECTO

#### Funcionalidades Principales
- **Conversión automática de unidades** de potencia (W ↔ kW ↔ CV ↔ HP)
- **Cálculo de corriente de proyecto** según tipo de sistema
- **Aplicación de factores de corrección** por temperatura y agrupamiento
- **Selección automática de sección mínima** basada en ampacidad

#### Entradas Requeridas
- Potencia nominal de la carga
- Unidad de potencia
- Tensión nominal del sistema
- Factor de potencia (0.3 a 1.0)
- Tipo de sistema (mono/bi/trifásico)
- Rendimiento del equipo (0.5 a 1.0)
- Material de aislamiento
- Método de instalación
- Temperatura ambiente (-10°C a 80°C)
- Número de circuitos agrupados (1 a 50)

#### Salidas Esperadas
- Corriente de proyecto (A)
- Factor de temperatura aplicado
- Factor de agrupamiento aplicado
- Corriente corregida (A)
- Sección mínima recomendada (mm²)
- Ampacidad del conductor seleccionado (A)

#### Validaciones Críticas
- Potencia > 0 y < 1000kW
- Factor de potencia entre 0.3 y 1.0
- Temperatura dentro de rangos del material
- Método compatible con material de aislamiento

### PESTAÑA 2: CAÍDA DE TENSIÓN

#### Funcionalidades Principales
- **Cálculo de caída de tensión** en conductores de cobre y aluminio
- **Verificación automática** contra límites NBR 5410
- **Sugerencia de sección mayor** si no cumple criterios
- **Cálculo de porcentaje de caída** respecto a tensión nominal

#### Entradas Requeridas
- Corriente del circuito (de pestaña anterior o manual)
- Longitud del cable (metros)
- Sección del conductor (mm²)
- Material del conductor (cobre/aluminio)
- Tensión nominal (heredada de pestaña anterior)
- Tipo de sistema (heredado de pestaña anterior)

#### Salidas Esperadas
- Caída de tensión absoluta (V)
- Porcentaje de caída (%)
- Límite NBR 5410 aplicable (%)
- Estado de cumplimiento (SÍ/NO)
- Sección mínima recomendada si no cumple

#### Criterios NBR 5410
- **Instalaciones residenciales:** 4% máximo
- **Instalaciones industriales:** 5% máximo
- **Motores:** 10% máximo en arranque
- **Iluminación:** 3% máximo

### PESTAÑA 3: CORTOCIRCUITO

#### Funcionalidades Principales
- **Cálculo de sección mínima** para resistir cortocircuito
- **Verificación térmica** del conductor durante falla
- **Comparación con sección elegida** en pestañas anteriores
- **Validación de tiempo de actuación** de protecciones

#### Entradas Requeridas
- Corriente de cortocircuito (kA)
- Tiempo de actuación de protecciones (s)
- Sección del conductor elegida (mm²)
- Material del conductor (cobre/aluminio)
- Material de aislamiento (para temperatura máxima)

#### Salidas Esperadas
- Sección mínima para cortocircuito (mm²)
- Sección elegida en proyecto (mm²)
- Estado de cumplimiento (SÍ/NO)
- Temperatura máxima alcanzada durante falla (°C)

#### Criterios de Verificación
- Temperatura del conductor no debe exceder límites del aislamiento
- Tiempo de actuación debe ser realista (0.01s a 5s)
- Corriente de cortocircuito debe ser coherente con instalación

### PESTAÑA 4: RESULTADOS

#### Funcionalidades Principales
- **Integración de todos los cálculos** anteriores
- **Selección de sección final** (la mayor de todos los criterios)
- **Generación de reporte técnico** completo
- **Presentación de recomendaciones** adicionales

#### Contenido del Reporte
- Resumen de parámetros de entrada
- Resultados de cada criterio de dimensionamiento
- Sección final recomendada
- Justificación técnica de la selección
- Advertencias y consideraciones especiales
- Referencias normativas aplicadas

#### Advertencias Automáticas
- Factores de corrección muy bajos (< 0.5)
- Caída de tensión cercana al límite (> 90% del máximo)
- Temperatura ambiente extrema
- Agrupamiento excesivo de circuitos
- Corriente de cortocircuito muy alta

---

## SISTEMA DE VALIDACIONES

### Validaciones de Entrada

#### Datos Numéricos
- **Potencia:** Debe ser positiva y menor a 1000kW
- **Tensión:** Debe estar en lista predefinida de valores estándar
- **Factor de potencia:** Entre 0.3 y 1.0
- **Temperatura:** Dentro de rangos del material seleccionado
- **Longitud:** Positiva y menor a 10km
- **Corriente de cortocircuito:** Coherente con nivel de tensión

#### Compatibilidad de Parámetros
- **Material vs Temperatura:** PVC hasta 70°C, EPR hasta 90°C/105°C
- **Método vs Material:** Algunos métodos no aplican a ciertos materiales
- **Tensión vs Potencia:** Coherencia en rangos típicos
- **Sistema vs Tensión:** Monofásico solo hasta 440V

### Validaciones de Proceso

#### Cálculos Intermedios
- **Factores de corrección:** No pueden ser menores a 0.1
- **Corriente corregida:** Debe tener conductor disponible
- **Sección calculada:** Debe existir en tabla de conductores estándar
- **Caída de tensión:** No puede ser negativa

#### Coherencia de Resultados
- **Ampacidad vs Corriente:** Ampacidad debe ser mayor que corriente corregida
- **Sección por criterios:** Cortocircuito no puede requerir sección menor que ampacidad
- **Límites físicos:** Resultados dentro de rangos técnicamente posibles

### Validaciones de Salida

#### Resultados Finales
- **Sección recomendada:** Debe existir comercialmente
- **Cumplimiento normativo:** Todos los criterios deben estar satisfechos
- **Factibilidad técnica:** Instalación debe ser prácticamente posible
- **Coherencia económica:** Sección no debe ser excesivamente sobredimensionada

---

## CÁLCULOS Y ALGORITMOS

### Cálculo de Corriente de Proyecto

#### Sistemas Monofásicos
```
I = P / (V × cos φ × η)
```

#### Sistemas Bifásicos
```
I = P / (V × cos φ × η × √2)
```

#### Sistemas Trifásicos
```
I = P / (V × cos φ × η × √3)
```

### Factores de Corrección

#### Factor de Temperatura
- Basado en tablas NBR 5410
- Depende del material de aislamiento
- Temperatura de referencia: 30°C para PVC, 40°C para EPR/HEPR
- Interpolación lineal entre valores tabulados

#### Factor de Agrupamiento
- Según número de circuitos agrupados
- Diferente para cada método de instalación
- Valores tabulados en NBR 5410
- Aplicación de factor más restrictivo

### Selección de Sección por Ampacidad

#### Proceso de Selección
1. Calcular corriente corregida: `I_corr = I_projeto / (f_temp × f_agrup)`
2. Buscar en tabla de ampacidades del material/método
3. Seleccionar primera sección con ampacidad ≥ I_corr
4. Verificar disponibilidad comercial

### Cálculo de Caída de Tensión

#### Sistemas Monofásicos
```
ΔV = 2 × I × L × R / 1000
```

#### Sistemas Trifásicos
```
ΔV = √3 × I × L × R / 1000
```

#### Resistencia del Conductor
- Valores tabulados por material y sección
- Corrección por temperatura si necesario
- Consideración de resistencia AC vs DC para grandes secciones

### Verificación de Cortocircuito

#### Sección Mínima por Cortocircuito
```
S_min = I_cc × √t / K
```

Donde:
- I_cc: Corriente de cortocircuito (A)
- t: Tiempo de actuación (s)
- K: Constante del material y aislamiento

#### Constantes K
- **Cobre PVC:** K = 115
- **Cobre EPR/HEPR:** K = 143
- **Aluminio PVC:** K = 76
- **Aluminio EPR/HEPR:** K = 94

---

## MANEJO DE ERRORES

### Tipos de Errores

#### Errores de Entrada
- **Campos vacíos:** Mostrar mensaje específico del campo requerido
- **Valores fuera de rango:** Indicar rango válido
- **Formato incorrecto:** Sugerir formato correcto
- **Incompatibilidades:** Explicar por qué la combinación no es válida

#### Errores de Cálculo
- **División por cero:** Verificar denominadores antes del cálculo
- **Valores indefinidos:** Manejar casos límite
- **Desbordamiento numérico:** Limitar rangos de entrada
- **Precisión insuficiente:** Usar número adecuado de decimales

#### Errores de Sistema
- **Tablas no encontradas:** Verificar integridad de datos
- **Funciones no disponibles:** Degradación elegante
- **Memoria insuficiente:** Optimizar cálculos complejos

### Estrategias de Recuperación

#### Valores por Defecto
- Proporcionar valores típicos para campos opcionales
- Sugerir valores comunes basados en selecciones anteriores
- Mantener última configuración válida

#### Mensajes de Usuario
- **Informativos:** Explicar qué está calculando el sistema
- **Advertencias:** Alertar sobre condiciones límite
- **Errores:** Indicar claramente qué corregir y cómo

#### Validación Progresiva
- Validar campos mientras el usuario escribe
- Mostrar estado de validación en tiempo real
- Permitir corrección antes de proceder

---

## INTERFAZ DE USUARIO

### Principios de Diseño

#### Usabilidad
- **Flujo intuitivo:** Seguir secuencia lógica de dimensionamiento
- **Feedback inmediato:** Mostrar resultados tan pronto como sea posible
- **Prevención de errores:** Validar entradas antes de permitir avance
- **Recuperación fácil:** Permitir corrección sin perder trabajo

#### Accesibilidad
- **Responsive design:** Funcionar en desktop, tablet y móvil
- **Contraste adecuado:** Textos legibles en todas las condiciones
- **Navegación por teclado:** Accesible sin mouse
- **Mensajes claros:** Lenguaje técnico pero comprensible

### Elementos de Interfaz

#### Sistema de Pestañas
- **Indicadores de estado:** Mostrar qué pestañas están completas
- **Navegación libre:** Permitir saltar entre pestañas
- **Persistencia de datos:** Mantener información al cambiar pestañas
- **Indicadores visuales:** Resaltar errores o advertencias

#### Formularios
- **Agrupación lógica:** Campos relacionados juntos
- **Etiquetas descriptivas:** Incluir unidades y rangos
- **Ayuda contextual:** Tooltips con información adicional
- **Validación en tiempo real:** Feedback inmediato

#### Resultados
- **Presentación clara:** Valores destacados con unidades
- **Código de colores:** Verde para OK, amarillo para advertencia, rojo para error
- **Explicaciones:** Justificar por qué se seleccionó cada valor
- **Exportación:** Permitir guardar o imprimir resultados

---

## CASOS DE USO TÍPICOS

### Caso 1: Motor Industrial Trifásico

#### Escenario
Dimensionar alimentación para motor de 50CV, 380V, instalado en electroducto enterrado, distancia 80m.

#### Flujo Esperado
1. **Proyecto:** Ingresar 50CV, 380V, trifásico, método F
2. **Resultado:** Corriente ≈ 76A, sección mínima por ampacidad
3. **Caída:** Verificar con 80m, ajustar sección si necesario
4. **Cortocircuito:** Verificar con Icc típica de 10kA
5. **Final:** Sección que cumpla todos los criterios

#### Resultados Esperados
- Corriente de proyecto: ~76A
- Factor de temperatura: ~0.9 (método F, 40°C)
- Factor de agrupamiento: 1.0 (circuito único)
- Sección mínima: 25mm² o mayor
- Verificación de caída: Puede requerir 35mm²
- Sección final: 35mm² (la mayor de todos los criterios)

### Caso 2: Circuito Residencial Monofásico

#### Escenario
Alimentación para chuveiro 7500W, 220V, instalado en electroducto embutido, distancia 15m.

#### Flujo Esperado
1. **Proyecto:** 7500W, 220V, monofásico, método A1
2. **Resultado:** Corriente ≈ 34A, sección por ampacidad
3. **Caída:** Verificar límite 4% residencial
4. **Cortocircuito:** Verificar con Icc residencial típica
5. **Final:** Sección que cumpla criterios residenciales

#### Resultados Esperados
- Corriente de proyecto: ~34A
- Sección mínima por ampacidad: 6mm²
- Caída de tensión: Dentro de 4% con 6mm²
- Sección final: 6mm²

### Caso 3: Instalación de Alta Tensión

#### Escenario
Alimentador para transformador 500kVA, 13.8kV, cabo subterráneo, distancia 200m.

#### Flujo Esperado
1. **Proyecto:** 500kVA, 13.8kV, trifásico, método D
2. **Resultado:** Corriente ≈ 21A, sección por ampacidad
3. **Caída:** Crítica por distancia y tensión
4. **Cortocircuito:** Verificar con alta corriente de falla
5. **Final:** Sección determinada por cortocircuito

#### Resultados Esperados
- Corriente de proyecto: ~21A
- Sección mínima por ampacidad: 4mm²
- Sección por caída: 16mm² (por distancia)
- Sección por cortocircuito: 50mm² (por alta Icc)
- Sección final: 50mm²

---

## CRITERIOS DE ACEPTACIÓN

### Funcionalidad Básica

#### Cálculos Correctos
- ✅ Corriente de proyecto con error < 1%
- ✅ Factores de corrección según NBR 5410
- ✅ Selección de sección por ampacidad correcta
- ✅ Caída de tensión con precisión de 0.01V
- ✅ Verificación de cortocircuito según norma

#### Validaciones
- ✅ Rechazar entradas inválidas con mensaje claro
- ✅ Detectar incompatibilidades de parámetros
- ✅ Validar rangos de todos los campos numéricos
- ✅ Verificar coherencia entre pestañas

### Usabilidad

#### Interfaz
- ✅ Navegación intuitiva entre pestañas
- ✅ Formularios organizados lógicamente
- ✅ Resultados presentados claramente
- ✅ Mensajes de error comprensibles

#### Rendimiento
- ✅ Cálculos instantáneos (< 100ms)
- ✅ Interfaz responsiva en móviles
- ✅ Carga inicial rápida (< 2s)
- ✅ Sin bloqueos durante cálculos

### Precisión Técnica

#### Conformidad Normativa
- ✅ Tablas NBR 5410 implementadas correctamente
- ✅ Datos INPACO actualizados y precisos
- ✅ Metodología Mamede Filho para métodos H e I
- ✅ Factores de corrección según norma

#### Casos de Prueba
- ✅ Motor 10CV/380V → Corriente 15.3A ± 0.1A
- ✅ Chuveiro 7500W/220V → Sección 6mm² mínima
- ✅ Cabo 50m/25mm²/50A → Caída < 2%
- ✅ Cortocircuito 10kA/0.1s → Sección mínima correcta

### Robustez

#### Manejo de Errores
- ✅ No crashes con entradas inválidas
- ✅ Recuperación elegante de errores
- ✅ Mensajes informativos, no técnicos
- ✅ Preservación de datos válidos

#### Casos Límite
- ✅ Potencias muy pequeñas (< 100W)
- ✅ Potencias muy grandes (> 500kW)
- ✅ Temperaturas extremas (-10°C, 80°C)
- ✅ Distancias largas (> 1km)

---

## CONSIDERACIONES ESPECIALES

### Actualizaciones Futuras

#### Expansión de Normas
- Preparar para inclusión de normas internacionales (IEC, NEC)
- Estructura modular para agregar nuevos métodos
- Flexibilidad para diferentes países/regiones

#### Nuevos Materiales
- Soporte para cables de media tensión
- Materiales de aislamiento emergentes
- Conductores de aleaciones especiales

### Integración

#### Exportación de Datos
- Formato PDF para reportes técnicos
- Excel para análisis adicionales
- Integración con software CAD

#### API Futura
- Endpoints para cálculos automatizados
- Integración con sistemas de gestión
- Batch processing para múltiples circuitos

---

## CONCLUSIÓN

Esta calculadora debe ser una herramienta profesional que combine precisión técnica con facilidad de uso. Debe educar al usuario sobre los criterios de dimensionamiento mientras proporciona resultados confiables para uso en proyectos reales.

El éxito se medirá por:
- **Precisión:** Resultados técnicamente correctos
- **Usabilidad:** Interfaz intuitiva y eficiente
- **Confiabilidad:** Funcionamiento robusto sin errores
- **Utilidad:** Valor real para profesionales del sector

---

*Manual de Funcionamiento v2.0*  
*Calculadora de Cables Eléctricos - INPACO + NBR + Mamede Filho*  
*Estructura Modular | Métodos A1 hasta I | PVC, EPR 90°, EPR 105°, HEPR*


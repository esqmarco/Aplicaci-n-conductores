# Manual de funcionamiento — Calculadora de conductores eléctricos

Describe lo que la app hace hoy. Las fórmulas vigentes, con su fuente, están en `CLAUDE.md` (sección *Fórmulas*); la memoria de cálculo imprimible muestra cada valor usado. Los pendientes están en `documentos/PLAN_DE_MEJORAS.md`.

## Alcance

- Dimensiona conductores de **baja tensión** (hasta 1000 V) en corriente alterna y continua, por tres criterios: ampacidad, caída de tensión y cortocircuito. La sección final es la mayor de las tres.
- **Ampacidad:** catálogo INPACO 2021 (cobre, 40 °C aire / 25 °C suelo, 1,0 K·m/W), 2 y 3 conductores cargados, secciones de 1,5 a 300 mm². Corrientes mayores se resuelven con conductores en paralelo (hasta 6 por fase).
- **Aluminio:** sección mínima 16 mm². Ampacidad = cobre INPACO × relación I_Al/I_Cu de NBR 5410 Tablas 36–39 (mismo método, aislación y conductores cargados). La app muestra un aviso para contrastar con el catálogo del fabricante.
- **Aislaciones:** PVC (70 °C); EPR/XLPE y HEPR (90 °C, misma tabla INPACO).
- **Métodos de instalación (INPACO Tabla 1 / NBR 5410):** en AC A1, A2, B1, B2, C, D, E, F, G (D es el único enterrado). En DC A1, B1, C, E.
- **Media tensión:** no se dimensiona. La pestaña de cortocircuito AC acepta tensiones de MT solo para calcular Icc.

## Pestañas AC

### 1. Proyecto (ampacidad)
- **Corriente de proyecto**, según el modo de entrada:
  - Potencia (W, kW, CV, HP), con factor de potencia, rendimiento y factor de demanda.
  - Corriente conocida.
  - Transformador (kVA, trifásico).
- **Sistema:** monofásico, bifásico (V entre fases) o trifásico. Conductores cargados:
  - Monofásico: 2.
  - Bifásico: 3 (criterio del lado seguro).
  - Trifásico: 3; con el neutro cargado, 4 (0,86 × columna de 3).
- **Factores de corrección:**
  - Temperatura: INPACO Tabla 6, interpolada. El campo arranca en 40 °C (referencia de aire); en el método D pasa a 25 °C (referencia de suelo) si no se escribió otro valor.
  - Agrupamiento: INPACO Tablas 7, 9 y 10. Cada terna en paralelo cuenta como un circuito.
  - Resistividad del suelo, solo en el método D: INPACO Tabla 11. Se elige si es en ducto o directamente enterrado.
  - Un valor fuera de tabla da error. Nunca se usa 1,0 en silencio.
- **Sección:** la menor sección de tabla cuya ampacidad cubre la corriente corregida por conductor. Se respeta la sección mínima por tipo de circuito: 1,5 mm² en iluminación y 2,5 mm² en tomas y fuerza (NBR 5410); 6 mm² en alimentadores (criterio de la app, sin tabla citada).
- Al calcular, la corriente, la sección y los datos del sistema se copian a Caída de Tensión y Cortocircuito AC.

### 2. Caída de tensión AC
- **Entradas:** corriente, tensión, longitud, sección, sistema y factor de potencia. Además: material, aislación, clase del conductor, conductores en paralelo, disposición y frecuencia.
- **Clase del conductor:** en cobre, flexible (clase 5, por defecto) o rígido (clase 2); el aluminio es solo rígido.
- **Disposición:** trébol, tripolar, plano 2D o plano a 20 cm.
- **Frecuencia:** 50 Hz (ANDE) o 60 Hz (Brasil).
- **Cálculo:**
  - La resistencia se toma a la temperatura de servicio: 70 °C en PVC y 90 °C en EPR/XLPE/HEPR.
  - Incluye los efectos pelicular y de proximidad.
  - La reactancia sale de INPACO Tabla 15.
- **Límites a elegir:**
  - 4 %: iluminación / circuito terminal.
  - 5 %: fuerza motriz / desde la red de BT.
  - 7 %: total desde transformador propio.
- Si no cumple, la app indica la menor sección que cumple el límite.

### 3. Cortocircuito AC
- **Corriente de cortocircuito:** Icc = Scc / (√3 · V). Scc se ingresa en MVA y V es la tensión entre fases.
- **Sección mínima:** S = Icc · √t / K, con t ≤ 5 s.
- **Constante K (NBR 5410 Tabla 30):**
  - Cu PVC 115 (103 por encima de 300 mm²); Cu EPR 143.
  - Al PVC 76 (68 por encima de 300 mm²); Al EPR 94.
- La sección comercial se verifica con su propio K. Con conductores en paralelo, cada conductor debe soportar la Icc completa (criterio conservador).

### 4. Resultados AC
- **Sección final:** la mayor entre ampacidad, caída y cortocircuito, con el criterio que la definió.
- **Conductor de protección:** NBR 5410 Tabla 58, calculado sobre la sección de fase adoptada.
- **Botón "Imprimir memoria de cálculo (PDF)":**
  - Abre el diálogo de impresión; para obtener el PDF elegir "Guardar como PDF".
  - Usa los datos con que se calculó cada pestaña, no lo que haya quedado escrito sin calcular.
  - Incluye espacio para responsable y firma.

## Pestañas DC

### 5. Ampacidad DC
- **Entradas:**
  - Corriente conocida, o potencia con tensión. La tensión puede ser estándar (12 a 500 V) o personalizada.
  - Material, aislación (PVC o EPR), temperatura ambiente, método (A1, B1, C, E) y circuitos agrupados.
- **Cálculo:** las mismas tablas INPACO que en AC, con 2 conductores cargados, y los mismos factores de temperatura y agrupamiento.

### 6. Caída de tensión DC
- **Fórmula:** ΔV = 2 · Rt · I · L / Np, con Rt a 70 °C (PVC) o 90 °C (EPR) y Np conductores en paralelo por polo.
- **Clase del conductor:** igual que en AC.
- **Límite:** por aplicación (servicios auxiliares, UPS, control, iluminación de emergencia, telecomunicaciones, fotovoltaico) o, en "General", según la tensión. Estos límites son orientativos: no tienen fuente normativa citada en el repo.

### 7. Cortocircuito DC
- **Corriente de cortocircuito del banco:** Icc = V_banco / (N_serie · R_elemento).
- **Tipos de batería:** plomo-ácido (2,0 V), litio (3,2 V) y níquel-cadmio (1,2 V). La resistencia interna sugerida es orientativa: usar el dato del fabricante.
- **Sección mínima:** S = Icc · √t / K, con los mismos K que en AC.

### 8. Resultados DC
- **Sección final:** la mayor de los tres criterios, recalculada por conductor cuando hay conductores en paralelo.
- **Memoria de cálculo imprimible:** igual que en AC.

## Historial
- Guarda en el navegador los últimos 50 cálculos de todas las pestañas (fecha, tipo y resumen).
- **Abrir** carga los datos en su pestaña y recalcula con la versión actual de la calculadora, así que el resultado puede diferir del original si hubo correcciones posteriores.
- **Borrar** quita una entrada; **Borrar todo** pide un segundo clic.
- Los cálculos guardados antes de la versión 5.6.0 no tienen los datos del formulario: se listan pero no se pueden abrir.
- Si el navegador bloquea el almacenamiento (modo privado), los cálculos funcionan igual y se avisa una sola vez.

## Validaciones
- Cada pestaña valida sus entradas antes de calcular. Un campo vacío o fuera de rango se informa como error; no se reemplaza por un valor por defecto.
- **Rangos principales:**
  - Factor de potencia de 0,1 a 1,0.
  - Rendimiento y factor de demanda mayores que 0 y hasta 1,0.
  - Circuitos agrupados: entero ≥ 1.
  - Temperatura ambiente: la que cubre INPACO Tabla 6 para la aislación elegida.
  - Tiempo de despeje hasta 5 s.
  - Tensión AC hasta 1000 V para ampacidad.
- **Avisos que no bloquean el cálculo:**
  - Ampacidad de aluminio.
  - Más de 6 circuitos enterrados, fuera de la tabla INPACO.
  - Icc poco usual para el nivel de tensión.
  - Ternas en paralelo que suben el número de circuitos agrupados.

## Casos de ejemplo (verificados con la app; son tests en `tests/test_calculations.js`)

**Caso 1: motor trifásico.**
- Entradas: 50 CV, 380 V, cosφ 0,85, η 0,92, cobre PVC, método B1, 40 °C, un circuito.
- Ampacidad: la corriente es 71,4 A y da 25 mm² (78 A).
- Caída con 80 m, en trébol a 50 Hz: 2,19 %, cumple el 5 %.
- Cortocircuito de 10 MVA a 380 V (15,2 kA, 0,1 s): la sección mínima es 41,8 mm² y la comercial 50 mm².
- Sección final: 50 mm², definida por cortocircuito.

**Caso 2: ducha monofásica.**
- Entradas: 7500 W, 220 V, cosφ 1, cobre PVC, método B1, 40 °C.
- Ampacidad: la corriente es 34,1 A y da 6 mm² (36 A).
- Caída con 30 m: 3,67 %, cumple el 4 %.

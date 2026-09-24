# Manual de funcionamiento — Calculadora de conductores eléctricos

Describe lo que la app hace hoy. Las fórmulas vigentes, con su fuente, están en `CLAUDE.md` (sección *Fórmulas*); la memoria de cálculo imprimible muestra cada valor usado. Los pendientes están en `documentos/PLAN_DE_MEJORAS.md`.

## Alcance

- Dimensiona conductores de **baja tensión** (hasta 1000 V) en corriente alterna y continua, por tres criterios: ampacidad, caída de tensión y cortocircuito. La sección final es la mayor de las tres.
- **Ampacidad:** catálogo INPACO 2021 (cobre, 40 °C aire / 25 °C suelo, 1,0 K·m/W), 2 y 3 conductores cargados, secciones de 1,5 a 300 mm². Corrientes mayores se resuelven con conductores en paralelo (hasta 6 por fase).
- **Aluminio:** sección mínima 16 mm². Ampacidad = cobre INPACO × relación I_Al/I_Cu de NBR 5410 Tablas 36–39 (mismo método, aislación y conductores cargados). La app muestra un aviso para contrastar con el catálogo del fabricante.
- **Aislaciones:** PVC (70 °C); EPR/XLPE y HEPR (90 °C, misma tabla INPACO).
- **Métodos de instalación (INPACO Tabla 1 / NBR 5410):** en AC A1, A2, B1, B2, C, D, E, F, G (D es el único enterrado). En DC A1, A2, B1, B2, C, D, E, F (G no tiene columna NBR de 2 conductores para aluminio).
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
- **Sección:** la menor sección de tabla cuya ampacidad cubre la corriente corregida por conductor. Se respeta la sección mínima de cobre por tipo de circuito (NBR 5410 §6.2.6.1.1, Tabla 47): 1,5 mm² en iluminación y 2,5 mm² en tomas, fuerza y alimentadores (un alimentador es un circuito de fuerza; ninguna fuente fija un mínimo propio). En un alimentador la sección real la suelen definir el cortocircuito o la caída.
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
  - 4 %: iluminación / circuito terminal (NBR 5410).
  - 5 %: fuerza motriz / desde la red de BT (NBR 5410). También el tramo del secundario de un trafo con TAPs hasta la carga (Itaipu R1A §10.3.1).
  - 7 %: total desde transformador propio (NBR 5410).
  - 10 %: desde la fuente o el secundario de un trafo hasta el primario del siguiente trafo con TAPs (Itaipu R1A §10.3.1).
  - Según la R1A, los porcentajes cuentan solo la caída en cables, sobre la tensión de operación del circuito.
- Si no cumple, la app indica la menor sección que cumple el límite.
- **Tipo de cable** (Itaipu R1A §10.3.3): potencia, control que acciona solenoides o control sin solenoides. En cables de control la caída solo se exige si accionan solenoides y el recorrido supera 400 m. Si no se exige, el resultado se muestra como "NO EXIGIDA" y no define la sección final.
- **Partida de motor** (opcional, Itaipu R1A §10.3.1.3 y Mamede §3.5.1.2): con "Sí, el circuito alimenta un motor", la corriente de la pestaña se toma como In del motor.
  - Suma la caída de tres tramos: el circuito del motor (Ip = k·In, cosφ de partida), el alimentador del tablero o CCM (opcional) y el transformador (opcional).
  - En el alimentador y el trafo la corriente es la suma vectorial de Ip y las otras cargas en marcha.
  - El trafo se toma trifásico: ΔV = (I / In del trafo) × Z %, con la Z completa (cota superior). Con circuito bifásico (carga F-F) se multiplica por 2/√3, porque la corriente pasa por dos devanados.
  - Límite 10 %. Sin datos del fabricante: Ip/In = 6 y cosφ 0,30. Muestra el aporte de cada tramo y la menor sección del circuito del motor que cumple; esa sección entra en la sección final como criterio "Partida de motor".

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
  - Material, aislación (PVC o EPR), temperatura ambiente, método (A1, A2, B1, B2, C, D, E, F) y circuitos agrupados.
  - En el método D: tipo de instalación enterrada y resistividad del suelo; la temperatura es la del suelo y arranca en 25 °C, igual que en AC.
- **Tipo de carga:** "General" o "Motor DC". El motor se dimensiona al 125 % de la corriente (Itaipu R1A §10.3.2).
  - En modo potencia pide el rendimiento del motor, porque la potencia de placa es mecánica: In = P / (V·η).
  - La caída y el cortocircuito usan la corriente real; solo la ampacidad usa el 125 %.
- **Cálculo:** las mismas tablas INPACO que en AC, con 2 conductores cargados, y los mismos factores de temperatura, agrupamiento y suelo.

### 6. Caída de tensión DC
- **Fórmula:** ΔV = 2 · Rt · I · L / Np, con Rt a 70 °C (PVC) o 90 °C (EPR) y Np conductores en paralelo por polo.
- **Clase del conductor:** igual que en AC.
- **Límite según el tramo** (Itaipu #ITA0&EEC010-01 "Projetos Elétricos – Critérios" R1A, GE 2026, §10.3.2):
  - Batería → carga: 5 %.
  - Cargador → batería: 3 %.
- **Tipo de cable:** igual que en AC (cables de control, Itaipu R1A §10.3.3).

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
  - Rendimiento (AC y motor DC en modo potencia) y factor de demanda mayores que 0 y hasta 1,0.
  - Circuitos agrupados: entero ≥ 1.
  - Temperatura ambiente: la que cubre INPACO Tabla 6 para la aislación elegida.
  - Tiempo de despeje entre 0,01 y 5 s.
  - Tensión AC hasta 1000 V para ampacidad.
  - Partida de motor: Ip/In entre 1 y 12; todo campo del alimentador o del trafo incluido es requerido.
  - Tramo DC, tipo de cable y tipo de carga son requeridos; un valor desconocido (p. ej. de un cálculo viejo del historial) da error.
- **Avisos que no bloquean el cálculo:**
  - Ampacidad de aluminio.
  - Más de 6 circuitos enterrados, fuera de la tabla INPACO.
  - Icc poco usual para el nivel de tensión.
  - Ternas en paralelo que suben el número de circuitos agrupados.
  - Caída "NO EXIGIDA" en cables de control (Itaipu R1A §10.3.3).
  - Partida de motor calculada solo con el circuito, o con una corriente que trae factor de demanda < 1.

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

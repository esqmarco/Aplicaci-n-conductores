# Changelog

All notable changes to the Calculadora de Cables Electricos will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [5.7.0] - 2026-09-23 — Ampacidad de aluminio con NBR 5410 (backlog #1)

- **Quién:** Marco + Claude (Opus 5.5)
- **Qué se hizo:**
  - Fuente nueva en el repo: `documentos/NBR5410_T36-39_ampacidad_Cu_Al.csv` (NBR 5410:2004 comentada, Tablas 36 a 39, pp. 101–104), aportada por Marco. El Excel de origen no se versiona: el CSV es la fuente.
  - Validación antes de usarla: CSV = Excel en las 418 celdas; las 38 series son crecientes con Al < Cu y 3c ≤ 2c; la columna de cobre, llevada a 40 °C (×0,87 PVC / ×0,91 XLPE), coincide con INPACO con desvío máx. 1,5 % (medio 0,03 %). Esta última comparación quedó como test.
  - Ampacidad de aluminio = cobre INPACO × (I_Al/I_Cu) de NBR para el mismo método, aislación y conductores cargados (E/F/G con las mismas columnas que el cobre). Reemplaza la estimación √(R_Cu/R_Al), cuyo comentario decía que quedaba del lado seguro sin haberse verificado.
  - AC y DC usan la misma relación (DC con la columna de 2 conductores).
- **Efecto en resultados:** la ampacidad de aluminio cambia entre −6,9 % (XLPE E 2c) y +4,6 % (XLPE B2 3c) respecto de 5.6.0. Los métodos C, E y F con 2 conductores eran los más sobrestimados (−5 a −7 %).
- **Tests:** 106.

## [5.6.0] - 2026-09-23 — Pestaña Historial (backlog #3)

- **Quién:** Marco + Claude (Opus 5.5)
- **Qué se hizo:**
  - Pestaña **Historial** (diseño elegido por Marco): últimos 50 cálculos de todas las pestañas con fecha, tipo y resumen. **Abrir** repone el formulario guardado en su pestaña y recalcula con la versión actual (sin duplicar la entrada); **Borrar** una entrada; **Borrar todo** con un segundo clic de confirmación. Armada con nodos y `textContent`.
  - Cada entrada guarda ahora la foto del formulario de su pestaña. Las entradas anteriores se listan pero no se pueden abrir.
  - **Error corregido:** si el navegador bloqueaba el almacenamiento local (modo privado, datos bloqueados), el guardado del historial lanzaba un error dentro del cálculo, y desde 5.0.0 eso ocultaba resultados correctos con "Error en cálculo". Ahora el historial nunca rompe un cálculo y se avisa una sola vez.
  - Drift corregido en el manual ("método de instalación A1 a I" → A1 a G).
- **Verificación:** probado en Chromium (guardar, abrir con el mismo resultado y sin duplicar, borrar, entradas viejas, almacenamiento bloqueado, pantalla de 375 px sin desborde). Los tests de node no cubren `app.js`; 102 tests siguen en verde.

## [5.5.0] - 2026-09-23 — Memoria de cálculo imprimible (backlog #4)

- **Quién:** Marco + Claude (Opus 5.5)
- **Qué se hizo:**
  - Botón "Imprimir memoria de cálculo (PDF)" en Resultados AC y DC. Arma un reporte con los datos de entrada y resultados de cada pestaña (los guardados al calcular), la fuente normativa de cada criterio, las advertencias, la sección final con el aporte de cada criterio y espacio para responsable y firma. Se imprime o se guarda como PDF desde el navegador. Construido con nodos y `textContent`.
  - El conductor de protección ahora se informa sobre la sección de fase **adoptada** (en el reporte y en Resultados AC). Antes solo se veía el de la sección por ampacidad: con 16 mm² por ampacidad y 95 mm² por cortocircuito mostraba 16 mm² en lugar de 50 mm².
  - Sección final DC con conductores por polo: la ampacidad se recalcula por conductor (I/Np, cada conductor en paralelo cuenta como circuito), igual que en AC. Antes se mezclaba la sección de un solo conductor con la caída calculada para Np. La lógica quedó en `calculations.js` (`calcularSeccionFinalDCDesde`, con tests) y reemplaza a `dimensionarCompletoDC`, que no se usaba.
  - La sección final AC y DC se calcula en una sola función que usan la pantalla y el reporte.
  - Impresión directa (Ctrl+P) de una pestaña: imprime la pestaña activa.
- **Tests:** 102.

## [5.4.0] - 2026-09-23 — Clase del conductor en caída de tensión (backlog #9)

- **Quién:** Marco + Claude (Opus 5.5)
- **Qué se hizo:**
  - Selector de clase del conductor (IEC 60228) en Caída de Tensión AC y DC: flexible clase 5 (Multifilar, Inpavinil, Inpatox; por defecto en cobre) o rígido clase 2. El aluminio solo existe rígido: la opción flexible se deshabilita y la validación la rechaza.
  - Fuente de la clase 5: multiplicada por el factor de 90 °C reproduce la Rca de INPACO Tabla 15 con ±1 % entre 1,5 y 70 mm² (test).
  - Una sola tabla de resistencias para AC y DC (`tabelasNBR.resistencias`). Antes el aluminio estaba cargado dos veces con valores distintos desde 500 mm², y la clase 5 vivía solo en DC. Se retiraron los valores de clase 5 por encima de 300 mm², que ningún cálculo usa y no tenían contraste.
  - La resistencia fuera de tabla ahora da error (antes DC calculaba con ρ/S sin avisar).
- **Efecto en resultados:** caída AC con cobre, por defecto flexible: sube entre 0 % y ~10 % según la sección respecto de 5.3.0 (clase 2; en 50 mm² las dos clases casi coinciden). Eligiendo rígido se obtiene el valor anterior. DC no cambia por defecto.
- **Tests:** 100.

## [5.3.0] - 2026-09-23 — Resistencia y reactancia AC con fuente (backlog #5 y #6)

- **Quién:** Marco + Claude (Opus 5.5)
- **Qué se hizo:**
  - Caída de tensión AC: resistencia en AC `Rca = Rt (1 + Ys + Yp)` según INPACO 4.3.1 (IEC 60287-1-1), con el diámetro del conductor de INPACO Tabla 15. En conductores en contacto se usa la cota superior dc/S = 1 porque las fuentes no dan el espesor de aislación: a 60 Hz queda entre +1,2 % y +3,1 % sobre Mamede Tabla 3.22 (150–300 mm²), del lado seguro.
  - Reactancia: se reemplazó la tabla sin fuente (0,070 Ω/km en 300 mm²) por INPACO Tabla 15 a 50 Hz según disposición: trébol, tripolar, plano S = 2D y plano S = 20 cm (0,075 / 0,069 / 0,134 / 0,208 Ω/km en 300 mm²). Proporcional a la frecuencia.
  - Nuevos campos en Caída de Tensión AC: disposición (propuesta según el método: A2/B2/E → tripolar, G → plano 2D, resto → trébol) y frecuencia (50 Hz Paraguay / 60 Hz Brasil). El resultado muestra R y X usadas.
  - `mostrarMensaje` arma el mensaje con nodos y `textContent` en lugar de `innerHTML`. No queda `innerHTML` en el código.
  - Tests nuevos: Ys de 300 mm² calculado a mano, contraste con Mamede Tabla 3.22, reactancia por disposición y frecuencia, errores ante disposición o frecuencia desconocidas. 94 tests.
- **Efecto en resultados:** en secciones grandes con fp bajo, la caída calculada sube (más X y Rca); con conductores espaciados o a 60 Hz sube bastante más. Secciones chicas: cambio despreciable.
- **Bloqueado:** backlog #1 (aluminio): sin fuente accesible desde la sesión.

## [5.2.0] - 2026-09-23 — Método de trabajo v8

- **Quién:** Marco + Claude (Opus 5.5)
- **Qué se hizo:**
  - Metodología portable actualizada para Opus 5.5 en `metodologia-portable/` (plantilla + README con los cambios respecto de la v7a de NeuroTEA).
  - Método instalado en este proyecto: `CLAUDE.md` con reglas del método, `.claude/metodo.json`, hook de arranque (estado, git, comandos y tests al abrir y tras compactar), gate de archivos críticos (`calculations.js`, `data-tables.js`), comandos `/verificar`, `/cierre` y `/auditar`, y pre-commit (tests + changelog obligatorio si cambian tablas o fórmulas).
  - `PLAN_DE_MEJORAS.md` reescrito: estado actual, backlog vivo con evidencia y decisiones vigentes. Lo ya resuelto en 5.x salió del backlog.
  - Drift corregido: manual y PRD ya no mencionan métodos H/I, EPR 105 °C ni tensiones de media tensión. Los cuatro documentos de especificación originales quedaron marcados SUPERADO.
  - Lecciones de la revisión v5 agregadas con su destino ejecutable.
- **Decisiones de Marco:** 2026-09-23 — adoptar el método de trabajo de NeuroTEA, actualizado a Opus 5.5.
- **Pendiente:** verificar los hooks en la PC de Marco (Windows).

## [5.1.0] - 2026-09-22

### Fixed
- Formula bifasica: se quita el factor raiz(2). Ahora I = P / (V x cos x eta), con V = tension
  entre fases (Mamede 3.5.1.1). El raiz(2) solo vale para sistemas bifasicos a 90 grados, que no
  se usan; subestimaba la corriente un 29%. Ejemplo: 7500 W, 220 V, fp 0,8, B1 PVC 40 C daba
  30,1 A y 6 mm2; lo correcto es 42,6 A y 10 mm2. Revisado y aprobado por el usuario.

## [5.0.0] - 2026-09-22

Revision integral de calculos, datos y normativa. Varios resultados cambian respecto a 4.x.

### Fixed - Datos (data-tables.js)
- Tablas de ampacidad AC rehechas desde el catalogo INPACO 2021 (Tablas 2 a 5), extraidas
  automaticamente del PDF del repo. Antes las columnas estaban desalineadas: "A2" contenia
  A1 con 3 conductores, "B2" contenia B1 con 3 conductores, y HEPR tenia valores de
  instalacion al aire libre (hasta 37% mas altos que los reales en A1).
- Se agregan columnas de 2 y 3 conductores cargados; antes todo usaba 2 conductores,
  lo que sobreestimaba la ampacidad de circuitos trifasicos en ~10-13%.
- EPR 90 C y HEPR usan la misma tabla (INPACO: XLPE/HEPR 90 C). HEPR figuraba como 125 C.
- Retirados metodos H, I y EPR 105 C: eran tablas de media tension (NBR 14039, Mamede
  3.28/3.29) mal etiquetadas. Ejemplo: "PVC H enterrado" era en realidad XLPE MT al aire libre.
- Retiradas ampacidades 400-1000 mm2 sin fuente. Para corrientes mayores: conductores en paralelo.
- Factores de agrupamiento corregidos segun INPACO Tabla 7 (haz: 9-11 = 0,50, >=20 = 0,38),
  bandeja perforada para E/F/G (antes E usaba valores mas altos y G usaba la tabla de enterrados),
  Tablas 9/10 para el metodo D (directo/ducto).
- Metodo F ya no se trata como enterrado (es al aire libre, INPACO 3.3.3).
- Resistencias de cobre/aluminio 400-1000 mm2 ajustadas a IEC 60228.
- K aluminio-PVC para cortocircuito DC: 74 -> 76 (NBR 5410).

### Fixed - Calculos (calculations.js)
- Aluminio usaba la ampacidad del cobre. Ahora: I_Al = I_Cu x raiz(R_Cu/R_Al) (~0,78), con aviso.
- Factor de temperatura: interpola entre valores de tabla. Antes una temperatura fuera de los
  multiplos de 5 C (ej. 42 C) caia silenciosamente a factor 1,0. Fuera de rango ahora da error
  (PVC admite hasta 60 C).
- Factor de agrupamiento no encontrado ya no se reemplaza por 1,0 en silencio.
- Factor de demanda: se leia pero no se aplicaba. Ahora se aplica en modo Por Potencia.
- Resistividad termica del suelo: se leia pero no se aplicaba. Ahora aplica INPACO Tabla 11
  (referencia 1,0 K.m/W) en el metodo D.
- Caida de tension AC y DC: la resistencia se toma a la temperatura de servicio del conductor
  (70 C PVC / 90 C EPR) como indica INPACO 4.3; antes se usaba 20 C (caida subestimada ~20-28%).
  Formula AC unificada: DV = k.I.L.(R.cos + X.sen) para todas las secciones.
- Caida de tension DC usaba la temperatura AMBIENTE como temperatura del conductor.
- Cortocircuito AC: constante K correcta para cualquier nombre de aislacion (EPR_90/HEPR con
  aluminio caia a K=115); K de PVC > 300 mm2 = 103/68.
- Cortocircuito DC: la resistencia interna es por elemento y se multiplica por los elementos en serie.
  Constantes de estimacion ajustadas a mOhm por elemento.
- Conductor de proteccion: HEPR/EPR 105 usaban K=176 (valor de conductor separado); ahora 143.
- Seccion final AC ahora considera caida de tension (menor seccion que cumple) y usa la seccion
  comercial de cortocircuito (antes mostraba valores como 57,52 mm2).
- Seccion final DC usa la seccion comercial de cortocircuito; si ninguna seccion cumple lo indica.
- Ampacidad DC: tablas INPACO de 2 conductores de la aislacion elegida (antes una tabla interna
  que ignoraba EPR y tenia la columna A1 hasta 14% alta). Se aplica el agrupamiento DC.
- Limite de caida DC por tipo de aplicacion ahora se aplica (antes se ignoraba).

### Fixed - Interfaz y validaciones
- Caida de Tension DC nunca calculaba: la validacion pedia "Potencia" que el formulario ya no tenia.
- Ampacidad DC en modo corriente pedia potencia y tension.
- Tension de cortocircuito AC solo se copia desde Ampacidad en sistemas trifasicos (la formula
  Scc/(raiz(3).V) pide tension de linea).
- Ampacidad AC limitada a baja tension (hasta 1000 V).
- Tiempo de despeje limitado a 5 s (validez del criterio adiabatico).
- Al fallar un calculo se ocultan los resultados anteriores.
- Las advertencias de validacion ahora se muestran.

### Added
- Conductores en paralelo por fase (ampacidad y caida de tension AC).
- Neutro con armonicos (4 conductores cargados, 0,86 x columna de 3).
- Tipo de instalacion enterrada (electroducto / directo) y resistividad del suelo segun INPACO.
- Limite de caida AC seleccionable (4%, 5%, 7%) y aislacion en la pestana de caida AC.
- Resultados: capacidad corregida Iz, caida en V, resistencia usada, seccion minima por caida,
  seccion comercial de cortocircuito, resistencia del banco de baterias.
- Tests cargan las tablas reales (87 tests).

### Pendiente de revision de ingenieria
- Formula de caida de tension AC/DC: ahora usa R a temperatura de servicio y (R.cos + X.sen)
  para todas las secciones, segun INPACO 4.3. Confirmar que es el criterio deseado.
- Cortocircuito con conductores en paralelo: se exige la Icc completa a cada conductor (conservador).

## [4.6.0] - 2026-03-30

### Added
- Modo entrada DC: selector Potencia/Corriente en Ampacidad DC (igual que AC)
- Campo corriente-directa-dc para ingreso directo de corriente DC

### Changed
- Caida Tension DC: campo Potencia reemplazado por Corriente de Proyecto
  Se propaga automaticamente desde Ampacidad DC, editable manualmente
- Caida Tension AC: misma logica, corriente se propaga desde Ampacidad AC
- Flujo unificado AC y DC:
  1. Ampacidad (por potencia o corriente) -> selecciona seccion
  2. Datos se propagan a Caida Tension (corriente, seccion, material, tension)
  3. Ingeniero agrega longitud y verifica. Si no cumple, cambia seccion y recalcula
  4. Datos se propagan a Cortocircuito (seccion, material)
  5. Resultados consolidan los 3 criterios

## [4.5.0] - 2026-03-30

### Changed
- Pestana Caida de Tension AC: reemplazar campo Potencia por Corriente de Proyecto
  La corriente ya fue calculada en Ampacidad (por potencia, corriente directa, o transformador)
  No tiene sentido recalcularla - se propaga directamente
- Propagacion AC ahora envia corriente calculada en vez de potencia
- Validacion caida tension AC pide corriente en vez de potencia
- Tooltip en campo corriente explica que se precarga desde ampacidad

### Fixed
- Incoherencia: modo corriente directa en ampacidad no podia propagar a caida de tension
  (porque caida de tension pedia potencia, que no existia en modo corriente)
- Incoherencia: modo transformador tampoco propagaba datos correctamente

## [4.4.0] - 2026-03-30

### Added
- Propagacion automatica de datos entre pestanas AC Y DC despues de calcular ampacidad
  AC: seccion, tension, tipo sistema, factor potencia, material, potencia -> Caida Tension y Cortocircuito
  DC: seccion, tension, potencia, material, temperatura, aislamiento -> Caida Tension DC y Cortocircuito DC
- El usuario puede modificar manualmente los valores propagados antes de calcular
- Criterio unificado AC y DC: ambos propagan datos de ampacidad a las demas pestanas

### Changed
- Flujo de dimensionamiento AC y DC ahora es secuencial: Ampacidad -> Caida Tension -> Cortocircuito
  Los datos fluyen automaticamente entre pestanas pero son editables

## [4.3.0] - 2026-03-30

### Added
- EPR_105 ampacity data COMPLETE: all 9 methods A-I from Mamede Tabela 3.29 (NBR 14039)
  Previously only had A, B, H, I (4 methods), now has C, D, E, F, G too
- Conductor de proteccion (PE/tierra) mejorado con metodo por cortocircuito
  Ecuacion 3.24 Mamede: Spe = Ift x sqrt(t) / K, con constantes K por aislamiento
- Redondeo a seccion comercial en calcularConductorProteccion
- PDF Mamede Filho como referencia tecnica

### Changed
- EPR_105 ya no depende de fallbacks para metodos C, D, E, F, G
- Cobertura de tablas: PVC 11/11, EPR_90 11/11, EPR_105 11/11 (era 4/11), HEPR 9/11+2 fallback

### Fixed
- EPR_105 con metodo D daba error "no se encontro seccion adecuada" por falta de datos

## [4.2.0] - 2026-03-30

### Fixed
- Modo de entrada AC: campos de corriente/transformador no aparecian al cambiar selector
- Validacion AC: ya no exige potencia en modo corriente o transformador
- HEPR + metodos H/I: crasheaba por falta de datos, ahora usa fallback a metodo D
- IDs de resultados AC caida tension (caida-tension-ac-valor -> caida-tension-valor)
- IDs de resultados AC cortocircuito (3 IDs con sufijo -ac que no existian)
- Propiedad factorAgrupamento -> factorAgrupamiento (typo portugues/espanol)
- Elemento seccion-comercial inexistente eliminado de resultados
- Clase hidden con !important impedia mostrar resultados proyecto AC
- Reset formulario no funcionaba en pestanas Caida Tension AC y Cortocircuito AC
- Calculo corriente en caida tension AC ignoraba tipo de sistema (siempre monofasico)
- Doble conteo de factor de potencia en caida tension para secciones < 50mm2
- Unidad cortocircuito AC: mostraba kA con etiqueta "A"

### Added
- Fallback de metodos de ampacidad: EPR_105 (A1->A, D->H, etc.), HEPR (H->D, I->D)
- Advertencia visible cuando se usa metodo de fallback en dimensionamiento
- Funcion resolverMetodoAmpacidad() con mapeo completo de 11 metodos

### Changed
- calcularProyecto() delega calculo completo a dimensionarPorAmpacidadAC (eliminada duplicacion)
- dimensionarPorAmpacidadAC retorna metodoUsado y advertenciaFallback

## [4.0.0] - 2026-03-28

### Added - Phase 1: Precision Tecnica
- DC temperature factors differentiated by insulation (PVC 70°C vs EPR 90°C)
- Inductive reactance for AC voltage drop on sections >= 50mm² (R×cosφ + X×sinφ)
- Minimum section enforcement per NBR 5410 (iluminacion 1.5, tomadas 2.5, alimentador 6mm²)
- Demand factor function (aplicarFactorDemanda)
- Ground conductor sizing per NBR 5410 Table 58 (calcularConductorProteccion)
- Reactance table for all standard sections (0.070-0.115 Ω/km)

### Added - Phase 2: Funcionalidades de Ingenieria
- DC grouping factor field in Ampacidad DC tab
- DC application type selector for voltage drop limits (UPS 1%, auxiliares 2%, fotovoltaico 3%, etc.)
- Demand factor and circuit type fields in AC Proyecto tab
- Soil resistivity selector for buried installation methods (D, F, H, I)
- Ground conductor result card in AC results
- Tab completion indicators (checkmark after successful calculation)
- Real-time input validation (highlights errors while typing)
- Calculation history saved to localStorage (last 50 calculations)

### Added - Phase 3: Experiencia de Usuario
- Help tooltips on Factor de Potencia, Rendimiento, Circuitos Agrupados
- Printable report generation (window.print with print-specific CSS)
- Print stylesheet hides navigation, shows only results
- generarReporteAC() and generarReporteDC() functions

### Changed
- calcularFactorTemperaturaDC now accepts aislamiento parameter
- calcularCaidaTensionAC uses impedance (R+jX) for sections >= 50mm²
- dimensionarPorAmpacidadAC enforces minimum section by circuit type
- Test suite expanded from 34 to 51 tests

## [3.0.0] - 2026-03-28

### Added
- Complete AC dimensioning by ampacity using INPACO/NBR data tables
- AC voltage drop calculation (calcularCaidaTensionAC) for mono/bi/trifasico systems
- AC short circuit verification (calcularCortocircuitoAC) with K constants
- Consolidated AC Results tab (8 tabs total now)
- Direct current input mode (for when engineer already knows the current)
- Transformer mode (sizing from kVA rating)
- Unit conversion: W, kW, CV (735.5W), HP (745.7W)
- Installation methods H and I (NBR/Mamede buried cables) in AC selector
- Complete AC input validations (validarParametrosCaidaTensionAC, validarParametrosCortocircuitoAC)
- PLAN_DE_MEJORAS.md with prioritized improvement roadmap
- CLAUDE.md project instructions for AI-assisted development
- PRD.md Product Requirements Document
- LECCIONES_APRENDIDAS.md
- Test suite (tests/test_calculations.js)

### Fixed
- Bifasico formula: added missing sqrt(2) factor (I = P / (V x cosφ x η x √2))
- Orphaned HTML elements (material-cc-dc and aislamiento-cc-dc floating between header and tabs)
- calcularCaidaTension() AC function was undefined (button threw error)
- calcularCortocircuito() AC function was undefined (button threw error)
- calcularSeccionNecesariaParaCaida() returned hardcoded 16mm² (placeholder)
- resistenciasInternasBateria object was never defined (battery resistance suggestion broken)

### Changed
- AC Proyecto tab now performs complete dimensioning (was only calculating current)
- Replaced intrusive confirm() dialog with silent DC tab synchronization
- Message system limited to 3 visible messages (was accumulating dozens)
- Removed module verification blocker from app initialization

### Removed
- Unused calcularSeccionNecesariaParaCaida() placeholder function in app.js
- Duplicate DOMContentLoaded listener in app.js

## [2.0.0] - 2026-03-27

### Added
- 7-tab specialized interface (Proyecto AC, Caida Tension AC, Cortocircuito AC, Ampacidad DC, Caida Tension DC, Cortocircuito DC, Resultados DC)
- Custom voltage support for DC tabs
- DC formula correction: DV = 2*R*I*L/Np
- Separated DC functions by criterion
- Cross-tab DC data synchronization
- Complete DC validation system

## [1.0.0] - 2026-03-27

### Added
- Initial release with basic AC current calculation
- Complete INPACO/NBR/Mamede data tables
- DC dimensioning (ampacity, voltage drop, short circuit)
- Professional responsive UI design

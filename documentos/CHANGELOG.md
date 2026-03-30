# Changelog

All notable changes to the Calculadora de Cables Electricos will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

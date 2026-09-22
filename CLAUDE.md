# CLAUDE.md - Project Instructions

## Project Overview
- Electrical conductor sizing calculator (AC + DC)
- Based on INPACO 2021, NBR 5410, Mamede Filho standards
- Single-page web app: HTML + vanilla JavaScript (no frameworks)
- Target users: electrical engineers in Paraguay/Brazil

## Architecture
```
index.html        - UI (HTML + inline CSS, 8 tabs)
data-tables.js    - Technical data tables (ampacities, temp factors, grouping factors)
calculations.js   - Calculation functions (AC + DC)
validations.js    - Input validation functions
app.js            - Main controller, UI logic, event handlers
```

## Key Conventions
- All functions exported to `window` object (no module system)
- Data tables accessed via `window.tabelasNBR`, `window.tabelasDC`, `window.metodosInstalacion`
- Helper functions: `window.obtenerAmpacidadBase()`, `window.obtenerFactorTemperatura()`, `window.obtenerFactorAgrupamento()`, `window.obtenerResistencia()`
- AC insulation types: PVC (70C), EPR_90 and HEPR (both 90C, same INPACO XLPE/HEPR table)
- DC insulation types: PVC, EPR
- Conductor materials: cobre, aluminio (aluminio min section 16mm2)
- Installation methods: A1, A2, B1, B2, C, D, E, F, G (INPACO Tabla 1 / NBR 5410). D is the only buried method
- Ampacity tables: INPACO 2021 (copper, 40C air / 25C soil, 1.0 K.m/W), 2 and 3 loaded conductors, up to 300 mm2
- Aluminium ampacity = copper x sqrt(R_Cu/R_Al); larger currents use conductors in parallel
- AC ampacity is low voltage only (<= 1000 V). MV (NBR 14039) tables are NOT in this app

## Formulas (CRITICAL - do not change without engineering review)
- Monofasico: I = P / (V x cosPhi x eta)
- Bifasico: I = P / (V x cosPhi x eta), V = tension entre fases [Mamede 3.5.1.1]
- Trifasico: I = P / (sqrt(3) x V x cosPhi x eta)
- Transformer: I = kVA x 1000 / (sqrt(3) x V) [trifasico]
- AC voltage drop mono/bi: DV = 2 x I x L x (Rt cosPhi + X sinPhi) / n
- AC voltage drop tri: DV = sqrt(3) x I x L x (Rt cosPhi + X sinPhi) / n
- Rt = R20 x (1 + alpha x (T - 20)), T = 70C (PVC) or 90C (EPR/XLPE/HEPR)  [INPACO 4.3]
- DC voltage drop: DV = 2 x Rt x I x L / Np
- DC battery short circuit: Icc = V_bank / (N_series x R_element)
- Short circuit: Smin = Icc x sqrt(t) / K

## Testing
- Run tests with: open index.html in browser, or use `node tests/test_calculations.js`
- Tests cover: unit conversion, current calculations, ampacity selection, voltage drop, short circuit
- Always run tests before committing

## Development Workflow
1. Read this file and documentos/PLAN_DE_MEJORAS.md before making changes
2. Run existing tests to verify baseline
3. Make changes
4. Run tests again
5. Update documentos/CHANGELOG.md if adding features or fixing bugs
6. Commit with descriptive message

## Common Pitfalls
- Do NOT modify data-tables.js unless updating technical data from standards
- The bifasico formula must NOT include sqrt(2): that factor is only for obsolete 90-degree two-phase systems.
  Bifasico = two phases of a three-phase system; it underestimated current by 29%
- AC and DC ampacity both use the INPACO tables in data-tables.js (DC = 2 loaded conductors)
- Correction factors never fall back silently to 1.0: out-of-table values throw an error
- When adding installation methods, update both the HTML selector AND ensure data exists in data-tables.js
- Temperature factors differ by source (INPACO ref 40C, NBR ref 30C)

## Language
- UI text: Spanish
- Code comments: Spanish/English mix
- Variable names: Spanish (corriente, tension, potencia, etc.)

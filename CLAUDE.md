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
- AC insulation types: PVC, EPR_90, EPR_105, HEPR
- DC insulation types: PVC, EPR
- Conductor materials: cobre, aluminio (aluminio min section 16mm2)
- Installation methods: A1, A2, B1, B2, C, D, E, F, G, H, I
- Sections available: 0.5 to 1000 mm2

## Formulas (CRITICAL - do not change without engineering review)
- Monofasico: I = P / (V x cosPhi x eta)
- Bifasico: I = P / (V x cosPhi x eta x sqrt(2))
- Trifasico: I = P / (sqrt(3) x V x cosPhi x eta)
- Transformer: I = kVA x 1000 / (sqrt(3) x V) [trifasico]
- AC voltage drop mono/bi: DV = 2 x R x I x L
- AC voltage drop tri: DV = sqrt(3) x R x I x L
- DC voltage drop: DV = 2 x R x I x L / Np
- Short circuit: Smin = Icc x sqrt(t) / K

## Testing
- Run tests with: open index.html in browser, or use `node tests/test_calculations.js`
- Tests cover: unit conversion, current calculations, ampacity selection, voltage drop, short circuit
- Always run tests before committing

## Development Workflow
1. Read this file and PLAN_DE_MEJORAS.md before making changes
2. Run existing tests to verify baseline
3. Make changes
4. Run tests again
5. Update CHANGELOG.md if adding features or fixing bugs
6. Commit with descriptive message

## Common Pitfalls
- Do NOT modify data-tables.js unless updating technical data from standards
- The bifasico formula MUST include sqrt(2) (was a previous bug)
- AC functions use data-tables.js tables; DC functions use their own internal tables
- When adding installation methods, update both the HTML selector AND ensure data exists in data-tables.js
- Temperature factors differ by source (INPACO ref 40C, NBR ref 30C)

## Language
- UI text: Spanish
- Code comments: Spanish/English mix
- Variable names: Spanish (corriente, tension, potencia, etc.)

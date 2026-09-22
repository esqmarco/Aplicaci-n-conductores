/**
 * TEST SUITE: calculations.js
 * ============================
 * Standalone Node.js tests - no external dependencies required.
 * Run with: node tests/test_calculations.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// ===================================================================
// Simple test runner
// ===================================================================

let passed = 0, failed = 0, total = 0;

function test(name, fn) {
    total++;
    try { fn(); passed++; console.log(`  PASS: ${name}`); }
    catch(e) { failed++; console.error(`  FAIL: ${name} - ${e.message}`); }
}

function assertEqual(actual, expected, msg) {
    if (actual !== expected) throw new Error(`${msg || ''} Expected ${expected}, got ${actual}`);
}

function assertClose(actual, expected, tolerance, msg) {
    if (Math.abs(actual - expected) > tolerance) throw new Error(`${msg || ''} Expected ~${expected}, got ${actual} (tolerance ${tolerance})`);
}

function assertTrue(val, msg) { if (!val) throw new Error(msg || `Expected true, got ${val}`); }

// ===================================================================
// Cargar data-tables.js, calculations.js y validations.js reales
// ===================================================================

global.window = {};
global.console = global.console; // keep console available

function cargar(archivo) {
    const code = fs.readFileSync(path.join(__dirname, '..', archivo), 'utf8');
    // Ejecutar en el ámbito global para que las funciones queden accesibles
    (0, eval)(code);
}
cargar('data-tables.js');
cargar('calculations.js');
cargar('validations.js');

// ===================================================================
// TEST GROUP 1: Unit Conversion (convertirAWatts)
// ===================================================================

console.log('\n--- Group 1: Unit Conversion (convertirAWatts) ---');

test('1000 W = 1000 W', function() {
    assertEqual(convertirAWatts(1000, 'W'), 1000);
});

test('1 kW = 1000 W', function() {
    assertEqual(convertirAWatts(1, 'kW'), 1000);
});

test('1 CV = 735.5 W', function() {
    assertEqual(convertirAWatts(1, 'CV'), 735.5);
});

test('1 HP = 745.7 W', function() {
    assertEqual(convertirAWatts(1, 'HP'), 745.7);
});

test('0 returns 0 (falsy passthrough)', function() {
    assertEqual(convertirAWatts(0, 'W'), 0);
});

test('null returns null (falsy passthrough)', function() {
    assertEqual(convertirAWatts(null, 'W'), null);
});

// ===================================================================
// TEST GROUP 2: AC Current - Monofasico
// ===================================================================

console.log('\n--- Group 2: AC Current - Monofasico ---');

test('7500W, 220V, fp=0.8, mono -> I = 42.61A', function() {
    const result = calcularCorrenteProyecto({
        potencia: 7500, tension: 220, factorPotencia: 0.8,
        tipoSistema: 'monofasico', rendimiento: 1.0
    });
    // 7500 / (220 * 0.8 * 1) = 42.613... -> rounded to 42.61
    assertClose(result, 42.61, 0.01, 'Monofasico 7500W');
});

test('1000W, 127V, fp=0.9, mono -> I = 8.75A', function() {
    const result = calcularCorrenteProyecto({
        potencia: 1000, tension: 127, factorPotencia: 0.9,
        tipoSistema: 'monofasico', rendimiento: 1.0
    });
    // 1000 / (127 * 0.9) = 8.748... -> rounded to 8.75
    assertClose(result, 8.75, 0.01, 'Monofasico 1000W');
});

// ===================================================================
// TEST GROUP 3: AC Current - Bifasico (CRITICAL - the bug fix)
// ===================================================================

console.log('\n--- Group 3: AC Current - Bifasico (sqrt(2) fix) ---');

test('7500W, 220V, fp=0.8, bifasico -> I = 30.13A (uses sqrt(2))', function() {
    const result = calcularCorrenteProyecto({
        potencia: 7500, tension: 220, factorPotencia: 0.8,
        tipoSistema: 'bifasico', rendimiento: 1.0
    });
    // 7500 / (220 * 0.8 * 1 * sqrt(2)) = 7500 / 248.90... = 30.13...
    assertClose(result, 30.13, 0.02, 'Bifasico 7500W');
});

test('Bifasico gives LOWER current than monofasico for same params', function() {
    const params = { potencia: 7500, tension: 220, factorPotencia: 0.8, rendimiento: 1.0 };
    const mono = calcularCorrenteProyecto({ ...params, tipoSistema: 'monofasico' });
    const bif  = calcularCorrenteProyecto({ ...params, tipoSistema: 'bifasico' });
    assertTrue(bif < mono, `Bifasico (${bif}A) should be less than monofasico (${mono}A)`);
});

test('Bifasico / monofasico ratio is 1/sqrt(2)', function() {
    const params = { potencia: 7500, tension: 220, factorPotencia: 0.8, rendimiento: 1.0 };
    const mono = calcularCorrenteProyecto({ ...params, tipoSistema: 'monofasico' });
    const bif  = calcularCorrenteProyecto({ ...params, tipoSistema: 'bifasico' });
    const ratio = bif / mono;
    assertClose(ratio, 1 / Math.sqrt(2), 0.01, 'Ratio bifasico/monofasico');
});

// ===================================================================
// TEST GROUP 4: AC Current - Trifasico
// ===================================================================

console.log('\n--- Group 4: AC Current - Trifasico ---');

test('7500W, 380V, fp=0.8, trifasico -> I = 14.24A', function() {
    const result = calcularCorrenteProyecto({
        potencia: 7500, tension: 380, factorPotencia: 0.8,
        tipoSistema: 'trifasico', rendimiento: 1.0
    });
    // 7500 / (sqrt(3) * 380 * 0.8) = 7500 / 526.47... = 14.24...
    assertClose(result, 14.24, 0.02, 'Trifasico 7500W');
});

// ===================================================================
// TEST GROUP 5: Transformer Current
// ===================================================================

console.log('\n--- Group 5: Transformer Current ---');

test('75kVA, 380V, trifasico -> I = 113.93A', function() {
    const result = calcularCorrienteTransformador({
        potenciaKVA: 75, tension: 380, tipoSistema: 'trifasico'
    });
    // 75000 / (sqrt(3) * 380) = 113.93...
    assertClose(result, 113.93, 0.02, 'Trafo 75kVA trifasico');
});

test('10kVA, 220V, monofasico -> I = 45.45A', function() {
    const result = calcularCorrienteTransformador({
        potenciaKVA: 10, tension: 220, tipoSistema: 'monofasico'
    });
    // 10000 / 220 = 45.4545...
    assertClose(result, 45.45, 0.01, 'Trafo 10kVA monofasico');
});

// ===================================================================
// TEST GROUP 6: AC Ampacity Dimensioning
// ===================================================================

console.log('\n--- Group 6: AC Ampacity Dimensioning ---');

test('dimensionarPorAmpacidadAC returns valid section for 7500W mono', function() {
    const result = dimensionarPorAmpacidadAC({
        modoEntrada: 'potencia',
        potencia: '7500', unidadPotencia: 'W',
        tension: '220', factorPotencia: '0.8',
        tipoSistema: 'monofasico', rendimiento: '1.0',
        materialAislamento: 'PVC', materialCondutor: 'cobre',
        temperaturaAmbiente: '40', metodoInstalacao: 'B1',
        agrupamento: '1'
    });
    assertTrue(result.seccion > 0, 'Section should be positive');
    assertTrue(result.ampacidad >= result.corrienteCorregida,
        `Ampacity (${result.ampacidad}) should be >= corrected current (${result.corrienteCorregida})`);
    assertClose(result.corriente, 42.61, 0.02, 'Project current');
});

test('dimensionarPorAmpacidadAC corriente mode passes through direct current', function() {
    const result = dimensionarPorAmpacidadAC({
        modoEntrada: 'corriente',
        corrienteDirecta: '50',
        tension: '220', factorPotencia: '0.8',
        tipoSistema: 'monofasico', rendimiento: '1.0',
        materialAislamento: 'PVC', materialCondutor: 'cobre',
        temperaturaAmbiente: '40', metodoInstalacao: 'B1',
        agrupamento: '1'
    });
    assertEqual(result.corriente, 50, 'Direct current should be 50A');
});

test('dimensionarPorAmpacidadAC transformer mode', function() {
    const result = dimensionarPorAmpacidadAC({
        modoEntrada: 'transformador',
        potenciaTransformadorKVA: '75',
        tension: '380', factorPotencia: '0.8',
        tipoSistema: 'trifasico', rendimiento: '1.0',
        materialAislamento: 'PVC', materialCondutor: 'cobre',
        temperaturaAmbiente: '40', metodoInstalacao: 'B1',
        agrupamento: '1'
    });
    assertClose(result.corriente, 113.93, 0.02, 'Transformer current');
});

// ===================================================================
// TEST GROUP 7: AC Voltage Drop
// ===================================================================

console.log('\n--- Group 7: AC Voltage Drop ---');

test('Trifasico voltage drop: 50A, 380V, 100m, 10mm2 cobre PVC', function() {
    const result = calcularCaidaTensionAC({
        corriente: 50, tension: 380, longitud: 100,
        seccion: 10, materialCondutor: 'cobre',
        tipoSistema: 'trifasico', factorPotencia: 0.85, aislamiento: 'PVC'
    });
    // R70 = 1.83 * (1 + 0.00393*50) = 2.1896 ohm/km; X = 0.094; sen = 0.5268
    // dV = sqrt(3) * 50 * 0.1 * (2.1896*0.85 + 0.094*0.5268) = 16.55 V -> 4.35%
    assertClose(result.caidaTensionV, 16.55, 0.02, 'Voltage drop V');
    assertClose(result.caidaTensionPct, 4.35, 0.02, 'Voltage drop %');
    assertEqual(result.temperaturaConductor, 70, 'PVC a 70 C');
});

test('Monofasico voltage drop uses 2*R70*I*L with fp=1', function() {
    const result = calcularCaidaTensionAC({
        corriente: 30, tension: 220, longitud: 50,
        seccion: 4, materialCondutor: 'cobre',
        tipoSistema: 'monofasico', factorPotencia: 1.0
    });
    // R70 = 4.61 * 1.1965 = 5.5159; dV = 2 * 5.5159 * 30 * 0.05 = 16.55 V
    assertClose(result.caidaTensionV, 16.55, 0.02, 'Mono voltage drop V');
    assertTrue(!result.cumple, 'Should exceed 4% limit');
});

test('EPR/XLPE uses resistance at 90 C (higher drop than PVC)', function() {
    const result = calcularCaidaTensionAC({
        corriente: 30, tension: 220, longitud: 50, seccion: 4, materialCondutor: 'cobre',
        tipoSistema: 'monofasico', factorPotencia: 1.0, aislamiento: 'EPR_90'
    });
    // R90 = 4.61 * (1 + 0.00393*70) = 5.8782; dV = 2 * 5.8782 * 30 * 0.05 = 17.63 V
    assertClose(result.caidaTensionV, 17.63, 0.02, 'EPR voltage drop');
});

test('Parallel conductors divide the voltage drop', function() {
    const uno = calcularCaidaTensionAC({ corriente: 400, tension: 380, longitud: 80, seccion: 150,
        materialCondutor: 'cobre', tipoSistema: 'trifasico', factorPotencia: 0.9 });
    const dos = calcularCaidaTensionAC({ corriente: 400, tension: 380, longitud: 80, seccion: 150,
        materialCondutor: 'cobre', tipoSistema: 'trifasico', factorPotencia: 0.9, conductoresPorFase: 2 });
    assertClose(dos.caidaTensionV, uno.caidaTensionV / 2, 0.02, 'Half drop with 2 in parallel');
});

test('Custom limit (5%) is applied', function() {
    const r = calcularCaidaTensionAC({ corriente: 50, tension: 380, longitud: 100, seccion: 10,
        materialCondutor: 'cobre', tipoSistema: 'trifasico', factorPotencia: 0.85, limite: 5 });
    assertEqual(r.limite, 5, 'Limit');
    assertTrue(r.cumple, '4.35% <= 5%');
});

test('Minimum section by voltage drop: 50A 380V 100m -> 16mm2', function() {
    const r = calcularSeccionMinimaCaidaAC({ corriente: 50, tension: 380, longitud: 100,
        materialCondutor: 'cobre', tipoSistema: 'trifasico', factorPotencia: 0.85, aislamiento: 'PVC', limite: 4 });
    // 10mm2 -> 4.35% (no cumple); 16mm2 -> 2.77%
    assertEqual(r.seccion, 16, 'Section by voltage drop');
    assertClose(r.caidaTensionPct, 2.77, 0.02, 'Drop at 16mm2');
});

// ===================================================================
// TEST GROUP 8: AC Short Circuit
// ===================================================================

console.log('\n--- Group 8: AC Short Circuit ---');

test('500MVA, 13.8kV -> Icc = 20.92 kA', function() {
    const result = calcularCortocircuitoAC({
        potenciaCortocircuito: 500, tensionSistema: 13.8,
        tiempoDespeje: 0.1, seccion: 70,
        materialCondutor: 'cobre', materialAislamiento: 'PVC'
    });
    // Icc = 500 / (sqrt(3) * 13.8) = 20.92 kA
    assertClose(result.corrienteCortocircuito, 20.92, 0.02, 'Icc kA');
});

test('Smin = Icc*sqrt(t)/K = 20920*sqrt(0.1)/115 = 57.52mm2', function() {
    const result = calcularCortocircuitoAC({
        potenciaCortocircuito: 500, tensionSistema: 13.8,
        tiempoDespeje: 0.1, seccion: 70,
        materialCondutor: 'cobre', materialAislamiento: 'PVC'
    });
    assertClose(result.seccionMinima, 57.52, 0.5, 'Section minima');
    assertEqual(result.seccionComercial, 70, 'Commercial section');
    assertTrue(result.cumple, '70mm2 should pass for 57.52mm2 requirement');
});

test('Short circuit K accepts EPR_90/HEPR names (aluminio -> 94, cobre -> 143)', function() {
    const al = calcularCortocircuitoAC({ potenciaCortocircuito: 10, tensionSistema: 0.38, tiempoDespeje: 0.1,
        seccion: 25, materialCondutor: 'aluminio', materialAislamiento: 'EPR_90' });
    const cu = calcularCortocircuitoAC({ potenciaCortocircuito: 10, tensionSistema: 0.38, tiempoDespeje: 0.1,
        seccion: 25, materialCondutor: 'cobre', materialAislamiento: 'HEPR' });
    assertEqual(al.constanteK, 94, 'Al EPR');
    assertEqual(cu.constanteK, 143, 'Cu HEPR');
});

test('Short circuit with aluminium uses K=76', function() {
    const result = calcularCortocircuitoAC({
        potenciaCortocircuito: 500, tensionSistema: 13.8,
        tiempoDespeje: 0.1, seccion: 120,
        materialCondutor: 'aluminio', materialAislamiento: 'PVC'
    });
    assertEqual(result.constanteK, 76, 'Aluminium PVC K');
    // Smin = 20920 * sqrt(0.1) / 76 = 87.07
    assertClose(result.seccionMinima, 87.07, 0.5, 'Aluminium section minima');
});

// ===================================================================
// TEST GROUP 9: DC Current
// ===================================================================

console.log('\n--- Group 9: DC Current ---');

test('1000W, 125V -> I = 8A', function() {
    const result = calcularCorrenteDC({ potencia: 1000, tension: 125 });
    assertEqual(result, 8, 'DC current');
});

test('5000W, 48V -> I = 104.17A', function() {
    const result = calcularCorrenteDC({ potencia: 5000, tension: 48 });
    assertClose(result, 104.17, 0.01, 'DC current 5000W');
});

// ===================================================================
// TEST GROUP 10: DC Voltage Drop
// ===================================================================

console.log('\n--- Group 10: DC Voltage Drop ---');

test('DC voltage drop uses 2*R*I*L/Np formula', function() {
    const result = calcularCaidaTensionDC({
        corriente: 100, longitud: 200, resistencia: 0.5,
        Np: 1, tension: 125
    });
    // 2 * 0.5 * 100 * 0.2 / 1 = 20V
    // pct = 20/125 * 100 = 16%
    assertEqual(result.caidaTension, 20, 'DC voltage drop V');
    assertEqual(result.porcentajeCaida, 16, 'DC voltage drop %');
    assertEqual(result.formula_usada, '2*R*I*L/Np');
});

test('DC voltage drop with parallel conductors (Np=2) halves the drop', function() {
    const result = calcularCaidaTensionDC({
        corriente: 100, longitud: 200, resistencia: 0.5,
        Np: 2, tension: 125
    });
    // 2 * 0.5 * 100 * 0.2 / 2 = 10V
    assertEqual(result.caidaTension, 10, 'DC voltage drop with Np=2');
});

// ===================================================================
// TEST GROUP 11: DC Short Circuit
// ===================================================================

console.log('\n--- Group 11: DC Short Circuit ---');

test('Plomo-acido, 60 elements, 5 mohm/element -> V=120V, R=300 mohm, Icc=400A', function() {
    const result = analizarCortocircuitoDC({
        tipoBateria: 'plomo-acido',
        elementosSerie: 60,
        capacidad: 200,
        resistenciaInterna: 5,
        tiempoDespeje: 0.1,
        seccion: 120,
        material: 'cobre',
        aislamiento: 'PVC'
    });
    // V = 60 * 2.0 = 120 V; R banco = 60 * 5 = 300 mohm; Icc = 120 / 0.3 = 400 A
    assertEqual(result.tension_banco, 120, 'Battery bank voltage');
    assertEqual(result.resistencia_banco_mohm, 300, 'Bank resistance');
    assertEqual(result.corriente_cortocircuito, 400, 'DC short circuit current');
});

test('DC short circuit section check with K=115 (cobre PVC)', function() {
    const result = analizarCortocircuitoDC({
        tipoBateria: 'plomo-acido',
        elementosSerie: 60,
        capacidad: 2000,
        resistenciaInterna: 0.1,
        tiempoDespeje: 0.1,
        seccion: 120,
        material: 'cobre',
        aislamiento: 'PVC'
    });
    // R banco = 6 mohm; Icc = 120 / 0.006 = 20000 A
    // Smin = 20000 * sqrt(0.1) / 115 = 55.00 mm2 -> comercial 70 mm2
    assertEqual(result.corriente_cortocircuito, 20000, 'Icc');
    assertClose(result.seccion_minima, 55.0, 0.05, 'DC min section');
    assertEqual(result.seccion_comercial, 70, 'Commercial section');
    assertTrue(result.cumple_criterio, '120mm2 should pass');
    assertEqual(result.constante_K, 115, 'K constant for cobre PVC');
});

test('DC short circuit aluminio PVC uses K=76 (NBR 5410)', function() {
    const r = analizarCortocircuitoDC({ tipoBateria: 'plomo-acido', elementosSerie: 24, resistenciaInterna: 1,
        tiempoDespeje: 0.1, seccion: 35, material: 'aluminio', aislamiento: 'PVC' });
    assertEqual(r.constante_K, 76, 'K Al PVC');
});

test('Litio battery uses 3.2V per element', function() {
    const result = analizarCortocircuitoDC({
        tipoBateria: 'litio',
        elementosSerie: 40,
        capacidad: 100,
        resistenciaInterna: 10,
        tiempoDespeje: 0.05,
        seccion: 50,
        material: 'cobre',
        aislamiento: 'PVC'
    });
    // tensionBanco = 40 * 3.2 = 128V
    assertEqual(result.tension_banco, 128, 'Litio bank voltage');
});

// ===================================================================
// Additional edge case tests
// ===================================================================

console.log('\n--- Additional: Edge Cases & Validation ---');

test('calcularCorrenteProyecto throws on invalid sistema', function() {
    let threw = false;
    try {
        calcularCorrenteProyecto({ potencia: 1000, tension: 220, factorPotencia: 0.8, tipoSistema: 'invalido' });
    } catch(e) { threw = true; }
    assertTrue(threw, 'Should throw on invalid tipoSistema');
});

test('calcularCorrenteProyecto throws on zero potencia', function() {
    let threw = false;
    try {
        calcularCorrenteProyecto({ potencia: 0, tension: 220, factorPotencia: 0.8, tipoSistema: 'monofasico' });
    } catch(e) { threw = true; }
    assertTrue(threw, 'Should throw on zero potencia');
});

test('determinarLimiteCaidaDC returns correct limits', function() {
    assertEqual(determinarLimiteCaidaDC(48), 5.0, '48V limit');
    assertEqual(determinarLimiteCaidaDC(125), 3.0, '125V limit');
    assertEqual(determinarLimiteCaidaDC(250), 2.0, '250V limit');
});

test('determinarLimiteCaidaDC uses application limit when given', function() {
    assertEqual(determinarLimiteCaidaDC(48, 'sistemas_fotovoltaicos'), 3.0, 'FV 3%');
    assertEqual(determinarLimiteCaidaDC(48, 'alimentacion_critica'), 1.0, 'UPS 1%');
    assertEqual(determinarLimiteCaidaDC(48, 'general'), 5.0, 'General by voltage');
});

test('calcularFactorTemperaturaDC PVC returns 1.0 at 40C (INPACO reference)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 40, aislamiento: 'PVC' });
    assertEqual(result, 1.0, 'PVC factor at 40C');
});

test('calcularFactorTemperaturaDC PVC interpolates between table values', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 32, aislamiento: 'PVC' });
    // Entre 30 (1.15) y 35 (1.08): 1.15 - 0.07*2/5 = 1.122
    assertClose(result, 1.122, 0.001, 'Interpolated PVC factor at 32C');
});

// ===================================================================
// TEST GROUP 12: DC Temperature Factor by Insulation (Phase 1)
// ===================================================================

console.log('\n--- Group 12: DC Temperature Factor by Insulation ---');

test('PVC factor at 30C = 1.15 (INPACO Tabla 6)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 30, aislamiento: 'PVC' });
    assertEqual(result, 1.15, 'PVC at 30C');
});

test('EPR factor at 30C = 1.10 (INPACO Tabla 6)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 30, aislamiento: 'EPR' });
    assertEqual(result, 1.10, 'EPR at 30C');
});

test('PVC has lower factor than EPR at high temperature', function() {
    const pvc = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 50, aislamiento: 'PVC' });
    const epr = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 50, aislamiento: 'EPR' });
    assertTrue(pvc < epr, `PVC (${pvc}) should be < EPR (${epr}) at 50C`);
});

test('PVC max usable temp is 60C (factor 0.57)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 60, aislamiento: 'PVC' });
    assertEqual(result, 0.57, 'PVC at 60C');
});

test('PVC above 60C throws instead of using a silent factor', function() {
    let threw = false;
    try { calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 62, aislamiento: 'PVC' }); }
    catch (e) { threw = true; }
    assertTrue(threw, 'Should throw at 62C for PVC');
});

test('EPR allows higher temps (factor at 70C still > 0.5)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 70, aislamiento: 'EPR' });
    assertTrue(result >= 0.50, `EPR at 70C should be >= 0.50, got ${result}`);
});

// ===================================================================
// TEST GROUP 13: Reactance in AC Voltage Drop (Phase 1)
// ===================================================================

console.log('\n--- Group 13: Reactance for Large Sections ---');

test('Voltage drop formula R*cos + X*sin (4mm2, fp 0.8)', function() {
    const result = calcularCaidaTensionAC({
        corriente: 30, tension: 220, longitud: 50, seccion: 4,
        materialCondutor: 'cobre', tipoSistema: 'monofasico', factorPotencia: 0.8
    });
    // R70 = 5.5159, X = 0.107: dV = 2*30*0.05*(5.5159*0.8 + 0.107*0.6) = 13.43 V
    assertClose(result.caidaTensionV, 13.43, 0.02, 'Formula for 4mm2');
});

test('Large section (>=50mm2) includes reactance component', function() {
    const result = calcularCaidaTensionAC({
        corriente: 200, tension: 380, longitud: 100, seccion: 95,
        materialCondutor: 'cobre', tipoSistema: 'trifasico', factorPotencia: 0.85
    });
    // R70 = 0.193*1.1965 = 0.23092; X=0.076; fp=0.85, sen=0.5268
    // dV = √3 * 200 * 0.1 * (0.23092*0.85 + 0.076*0.5268) = √3 * 20 * 0.23632 = 8.19 V
    assertClose(result.caidaTensionV, 8.19, 0.02, 'Large section voltage drop');
});

// ===================================================================
// TEST GROUP 14: Minimum Section per NBR 5410 (Phase 1)
// ===================================================================

console.log('\n--- Group 14: Minimum Section per NBR 5410 ---');

test('obtenerSeccionMinimaNBR returns 1.5 for iluminacion', function() {
    assertEqual(obtenerSeccionMinimaNBR('iluminacion'), 1.5, 'Iluminacion min');
});

test('obtenerSeccionMinimaNBR returns 2.5 for tomadas', function() {
    assertEqual(obtenerSeccionMinimaNBR('tomadas'), 2.5, 'Tomadas min');
});

test('obtenerSeccionMinimaNBR returns 6 for alimentador', function() {
    assertEqual(obtenerSeccionMinimaNBR('alimentador'), 6, 'Alimentador min');
});

test('obtenerSeccionMinimaNBR returns 1.5 for unknown type', function() {
    assertEqual(obtenerSeccionMinimaNBR('desconocido'), 1.5, 'Unknown defaults to 1.5');
});

// ===================================================================
// TEST GROUP 15: Demand Factor (Phase 1)
// ===================================================================

console.log('\n--- Group 15: Demand Factor ---');

test('aplicarFactorDemanda reduces power', function() {
    assertEqual(aplicarFactorDemanda(10000, 0.7), 7000, '10kW with fd=0.7');
});

test('aplicarFactorDemanda with 1.0 keeps same power', function() {
    assertEqual(aplicarFactorDemanda(5000, 1.0), 5000, 'fd=1.0');
});

test('aplicarFactorDemanda defaults invalid to 1.0', function() {
    assertEqual(aplicarFactorDemanda(5000, 0), 5000, 'fd=0 defaults to 1.0');
    assertEqual(aplicarFactorDemanda(5000, -1), 5000, 'fd=-1 defaults to 1.0');
    assertEqual(aplicarFactorDemanda(5000, 1.5), 5000, 'fd=1.5 defaults to 1.0');
});

// ===================================================================
// TEST GROUP 16: Ground Conductor Sizing (Phase 1)
// ===================================================================

console.log('\n--- Group 16: Ground Conductor (NBR 5410 Table 58) ---');

test('Phase <= 16mm2: ground = same as phase', function() {
    assertEqual(calcularConductorProteccion(10), 10, '10mm2 phase -> 10mm2 ground');
    assertEqual(calcularConductorProteccion(16), 16, '16mm2 phase -> 16mm2 ground');
});

test('Phase 16-35mm2: ground = 16mm2', function() {
    assertEqual(calcularConductorProteccion(25), 16, '25mm2 phase -> 16mm2 ground');
    assertEqual(calcularConductorProteccion(35), 16, '35mm2 phase -> 16mm2 ground');
});

test('Phase > 35mm2: ground = half of phase (rounded to commercial section)', function() {
    assertEqual(calcularConductorProteccion(50), 25, '50mm2 phase -> 25mm2 ground');
    assertEqual(calcularConductorProteccion(120), 70, '120mm2 phase -> 60 -> 70mm2 commercial');
    assertEqual(calcularConductorProteccion(240), 120, '240mm2 phase -> 120mm2 ground');
});

test('PE by short circuit: HEPR uses K=143 (not 176)', function() {
    // 10000 A, 0.1 s -> 10000*0.31623/143 = 22.11 -> 25 mm2
    assertEqual(calcularConductorProteccion(16, { corrienteCC: 10000, tiempoDespeje: 0.1, aislamiento: 'HEPR' }), 25, 'PE HEPR');
});

// ===================================================================
// TEST GROUP 17: Tablas INPACO (datos corregidos)
// ===================================================================

console.log('\n--- Group 17: INPACO tables ---');

test('PVC B2 2 conductores 2.5mm2 = 19.5 A (INPACO Tabla 2)', function() {
    assertEqual(obtenerAmpacidadBase('PVC', 'B2', 2.5, 2), 19.5);
});

test('PVC A2 3 conductores 300mm2 = 260 A (INPACO Tabla 2)', function() {
    assertEqual(obtenerAmpacidadBase('PVC', 'A2', 300, 3), 260);
});

test('XLPE D 3 conductores 10mm2 = 69 A (INPACO Tabla 3)', function() {
    assertEqual(obtenerAmpacidadBase('EPR_90', 'D', 10, 3), 69);
});

test('HEPR uses the same 90 C table as EPR/XLPE', function() {
    assertEqual(obtenerAmpacidadBase('HEPR', 'A1', 2.5, 2), obtenerAmpacidadBase('EPR_90', 'A1', 2.5, 2));
    assertEqual(obtenerAmpacidadBase('HEPR', 'A1', 2.5, 2), 24);
});

test('E/F/G columns: E 3c = col 2, F 3c = trefoil, G = vertical', function() {
    assertEqual(obtenerAmpacidadBase('PVC', 'E', 300, 3), 432);
    assertEqual(obtenerAmpacidadBase('PVC', 'F', 300, 3), 488);
    assertEqual(obtenerAmpacidadBase('PVC', 'G', 300, 3), 573);
});

test('4 conductores cargados = 0.86 x columna de 3', function() {
    assertClose(obtenerAmpacidadBase('PVC', 'B1', 10, 4), 44 * 0.86, 0.05);
});

test('Methods H and I (medium voltage data) are no longer accepted', function() {
    let threw = false;
    try { obtenerAmpacidadBase('PVC', 'H', 10, 3); } catch (e) { threw = true; }
    assertTrue(threw, 'H should throw');
});

test('Temperature factor interpolates (PVC 42 C = 0.964)', function() {
    assertEqual(obtenerFactorTemperatura('PVC', 42, 'B1'), 0.964);
});

test('Soil temperature is used for method D (PVC 30 C suelo = 0.94)', function() {
    assertEqual(obtenerFactorTemperatura('PVC', 30, 'D'), 0.94);
});

test('Grouping factors follow INPACO Tabla 7/9/10', function() {
    assertEqual(obtenerFactorAgrupamento('B1', 10), 0.50, 'haz 10');
    assertEqual(obtenerFactorAgrupamento('B1', 25), 0.38, 'haz >=20');
    assertEqual(obtenerFactorAgrupamento('E', 3), 0.82, 'bandeja 3');
    assertEqual(obtenerFactorAgrupamento('E', 12), 0.72, 'bandeja >9 sin reduccion adicional');
    assertEqual(obtenerFactorAgrupamento('D', 3, 'directo'), 0.65, 'directo 3');
    assertEqual(obtenerFactorAgrupamento('D', 3, 'ducto'), 0.70, 'ducto 3');
    assertEqual(obtenerFactorAgrupamento('D', 8, 'ducto'), 0.52, 'ducto >6 conservador');
});

test('Soil resistivity factor (INPACO Tabla 11)', function() {
    assertEqual(obtenerFactorResistividadSuelo(1.0, 'ducto'), 1.0);
    assertEqual(obtenerFactorResistividadSuelo(2.5, 'directo'), 0.67);
    assertEqual(obtenerFactorResistividadSuelo(2.5, 'ducto'), 0.85);
});

// ===================================================================
// TEST GROUP 18: Dimensionamiento AC corregido
// ===================================================================

console.log('\n--- Group 18: AC sizing corrections ---');

const baseAC = {
    modoEntrada: 'corriente', tension: 380, factorPotencia: 0.8, rendimiento: 1,
    materialAislamento: 'PVC', materialCondutor: 'cobre', temperaturaAmbiente: 40,
    metodoInstalacao: 'B1', agrupamento: 1, tipoCircuito: 'general'
};

test('Trifasico uses 3 loaded conductors, monofasico 2', function() {
    const tri = dimensionarPorAmpacidadAC(Object.assign({}, baseAC, { corrienteDirecta: 26, tipoSistema: 'trifasico' }));
    const mono = dimensionarPorAmpacidadAC(Object.assign({}, baseAC, { corrienteDirecta: 26, tipoSistema: 'monofasico' }));
    // B1 PVC: 4mm2 -> 28 A (2c) / 25 A (3c)
    assertEqual(tri.conductoresCargados, 3);
    assertEqual(tri.seccion, 6, 'Tri needs 6mm2');
    assertEqual(mono.conductoresCargados, 2);
    assertEqual(mono.seccion, 4, 'Mono 4mm2');
});

test('Bifasico is sized with 3 loaded conductors (conservative)', function() {
    const r = dimensionarPorAmpacidadAC(Object.assign({}, baseAC, { corrienteDirecta: 26, tipoSistema: 'bifasico' }));
    assertEqual(r.conductoresCargados, 3);
});

test('Aluminio ampacity = cobre x sqrt(RCu/RAl), min 16mm2', function() {
    const r = dimensionarPorAmpacidadAC(Object.assign({}, baseAC, { corrienteDirecta: 40, tipoSistema: 'trifasico', materialCondutor: 'aluminio' }));
    // B1 3c 16mm2 cobre = 59 A -> Al = 59 * sqrt(1.15/1.91) = 45.8 A
    assertEqual(r.seccion, 16);
    assertClose(r.ampacidad, 45.8, 0.05, 'Al ampacity');
    assertTrue(r.advertencias.length > 0, 'Warn about aluminium estimate');
});

test('Demand factor is applied in power mode', function() {
    const r = dimensionarPorAmpacidadAC(Object.assign({}, baseAC, {
        modoEntrada: 'potencia', potencia: 10000, unidadPotencia: 'W', tension: 220,
        factorPotencia: 1, tipoSistema: 'monofasico', factorDemanda: 0.5 }));
    assertClose(r.corriente, 22.73, 0.01, '5000 W / 220 V');
});

test('Parallel conductors: grouping uses at least one circuit per set', function() {
    const r = dimensionarPorAmpacidadAC(Object.assign({}, baseAC, {
        corrienteDirecta: 600, tipoSistema: 'trifasico', materialAislamento: 'EPR_90', conductoresPorFase: 2 }));
    assertEqual(r.circuitosAgrupamiento, 2);
    assertEqual(r.factorAgrupamiento, 0.8);
    assertClose(r.corrientePorConductor, 300, 0.01);
});

test('Buried method applies soil resistivity factor', function() {
    const r = dimensionarPorAmpacidadAC(Object.assign({}, baseAC, {
        corrienteDirecta: 50, tipoSistema: 'trifasico', metodoInstalacao: 'D', temperaturaAmbiente: 25,
        resistividadSuelo: 2.5, tipoEnterrado: 'directo' }));
    assertEqual(r.factorResistividad, 0.67);
    assertEqual(r.factorTemperatura, 1.0, 'Soil reference 25 C');
});

test('Temperature out of range throws (no silent factor 1.0)', function() {
    let threw = false;
    try { dimensionarPorAmpacidadAC(Object.assign({}, baseAC, { corrienteDirecta: 20, tipoSistema: 'trifasico', temperaturaAmbiente: 65 })); }
    catch (e) { threw = true; }
    assertTrue(threw, 'PVC at 65 C must throw');
});

test('Voltage above 1000 V is rejected (LV tables only)', function() {
    let threw = false;
    try { dimensionarPorAmpacidadAC(Object.assign({}, baseAC, { corrienteDirecta: 20, tipoSistema: 'trifasico', tension: 13800 })); }
    catch (e) { threw = true; }
    assertTrue(threw, 'MV must throw');
});

test('Current above 300mm2 capacity asks for parallel conductors', function() {
    let msg = '';
    try { dimensionarPorAmpacidadAC(Object.assign({}, baseAC, { corrienteDirecta: 800, tipoSistema: 'trifasico' })); }
    catch (e) { msg = e.message; }
    assertTrue(/paralelo/.test(msg), 'Message suggests parallel conductors');
});

test('Short circuit commercial section is checked with its own K (PVC > 300 mm2)', function() {
    // Icc tal que S_min(K=115) = 395 mm2 -> 400 mm2 tiene K=103 -> 441 mm2 -> 500 mm2
    const t = 1;
    const IccA = 395 * 115;
    const r = calcularCortocircuitoAC({ potenciaCortocircuito: IccA * Math.sqrt(3) * 0.38 / 1000, tensionSistema: 0.38,
        tiempoDespeje: t, seccion: 240, materialCondutor: 'cobre', materialAislamiento: 'PVC' });
    assertEqual(r.seccionComercial, 500);
});

test('Unknown insulation throws instead of silently using K=143', function() {
    let threw = false;
    try { calcularCortocircuitoAC({ potenciaCortocircuito: 10, tensionSistema: 0.38, tiempoDespeje: 0.1,
        seccion: 25, materialCondutor: 'cobre', materialAislamiento: 'EPR_105' }); } catch (e) { threw = true; }
    assertTrue(threw);
});

test('Invalid demand factor throws', function() {
    let threw = false;
    try { dimensionarPorAmpacidadAC(Object.assign({}, baseAC, { modoEntrada: 'potencia', potencia: 1000,
        unidadPotencia: 'W', tipoSistema: 'trifasico', factorDemanda: 1.2 })); } catch (e) { threw = true; }
    assertTrue(threw);
});

// ===================================================================
// TEST GROUP 19: DC corregido
// ===================================================================

console.log('\n--- Group 19: DC corrections ---');

test('DC ampacity uses INPACO 2-conductor table, EPR and grouping', function() {
    const r = dimensionarPorAmpacidadDC({ modoEntrada: 'corriente', corrienteDirecta: 80, material: 'cobre',
        temperatura: 30, metodo: 'B1', aislamiento: 'EPR', agrupamiento: 2 });
    // ft = 1.10, fa = 0.80 -> Ic = 90.9 A -> XLPE B1 2c: 16mm2 = 91 A
    assertEqual(r.seccion, 16);
    assertEqual(r.ampacidad, 91);
    assertEqual(r.factorAgrupamiento, 0.8);
});

test('DC corriente mode does not require voltage', function() {
    const r = dimensionarPorAmpacidadDC({ modoEntrada: 'corriente', corrienteDirecta: 20, material: 'cobre',
        temperatura: 40, metodo: 'B1', aislamiento: 'PVC', tensionSelector: '' });
    assertEqual(r.corriente, 20);
});

test('DC resistance is taken at service temperature (PVC 70 C)', function() {
    const r = calcularResistenciaCorregida({ material: 'cobre', seccion: 25, aislamiento: 'PVC' });
    // 0.780 * (1 + 0.00393*50) = 0.9333
    assertClose(r.R_temp, 0.9333, 0.0001);
    assertEqual(r.temperatura, 70);
});

test('DC voltage drop validation works with current (no power field)', function() {
    const v = validarParametrosCaidaTensionDC({ corriente: 80, tensionSelector: '48', longitud: 20,
        conductoresPorPolo: 1, seccion: 25, material: 'cobre', aislamiento: 'PVC' });
    assertTrue(v.valido, 'Should be valid: ' + v.errores.join('; '));
});

test('DC ampacity validation in current mode does not ask for power', function() {
    const v = validarParametrosAmpacidadDC({ modoEntrada: 'corriente', corrienteDirecta: 20, material: 'cobre',
        temperatura: 30, metodo: 'B1' });
    assertTrue(v.valido, 'Should be valid: ' + v.errores.join('; '));
});

test('verificarCaidaTensionDC applies application limit', function() {
    const r = verificarCaidaTensionDC({ corriente: 80, tensionSelector: '48', longitud: 20, conductoresPorPolo: 1,
        seccion: 25, material: 'cobre', aislamiento: 'PVC', aplicacionDC: 'sistemas_fotovoltaicos' });
    // R70 = 0.9333; dV = 2*0.9333*80*0.02 = 2.99 V = 6.22%
    assertEqual(r.limite_pct, 3.0);
    assertClose(r.caida_tension_pct, 6.22, 0.01);
    assertTrue(!r.cumple_criterio);
});

test('calcularSeccionParaCaidaDC returns null when 300mm2 is not enough', function() {
    const s = calcularSeccionParaCaidaDC({ corriente: 500, tensionSelector: '12', longitud: 200, conductoresPorPolo: 1,
        material: 'cobre', aislamiento: 'PVC' });
    assertEqual(s, null);
});

// ===================================================================
// Summary
// ===================================================================

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed}/${total} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

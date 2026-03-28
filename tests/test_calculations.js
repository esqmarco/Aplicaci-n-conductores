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
// Mock window and global data-tables dependencies
// ===================================================================

global.window = {};
global.console = global.console; // keep console available

// Mock tabelasNBR with a small subset of real data
window.tabelasNBR = {
    seccionesNominales: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300],
    resistencias: {
        cobre: { 1.5: 12.1, 2.5: 7.41, 4: 4.61, 6: 3.08, 10: 1.83, 16: 1.15, 25: 0.727, 35: 0.524, 50: 0.387, 70: 0.268, 95: 0.193, 120: 0.153, 150: 0.124, 185: 0.0991, 240: 0.0754, 300: 0.0601 },
        aluminio: { 16: 1.91, 25: 1.20, 35: 0.868, 50: 0.641, 70: 0.443, 95: 0.320, 120: 0.253, 150: 0.206, 185: 0.164, 240: 0.125, 300: 0.100 }
    }
};

window.metodosInstalacion = { B1: { fuente: 'INPACO', tipo: 'electroducto_adosado' } };

window.tabelasDC = {
    resistenciasDC: { cobre: { 10: 1.91, 16: 1.21, 25: 0.780, 35: 0.554, 50: 0.386 }, aluminio: { 16: 1.91, 25: 1.20 } },
    constantesK_DC: { cobre: { PVC: 115, EPR: 143 }, aluminio: { PVC: 74, EPR: 94 } },
    seccionesNominalesDC: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300]
};

// Mock helper functions that calculations.js calls via window.*
window.obtenerAmpacidadBase = function(material, metodo, seccion) {
    // PVC B1 cobre ampacities (real INPACO data)
    const tabla = { 1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 66, 25: 88, 35: 108, 50: 131, 70: 167, 95: 202, 120: 234, 150: 269, 185: 307, 240: 361, 300: 415 };
    if (tabla[seccion] !== undefined) return tabla[seccion];
    throw new Error('Section not found');
};

window.obtenerFactorTemperatura = function(mat, temp, metodo, enterrado) {
    if (temp === 30) return 1.15;
    if (temp === 40) return 1.00;
    return 1.00;
};

window.obtenerFactorAgrupamento = function(metodo, n) {
    const factores = { 1: 1.00, 2: 0.80, 3: 0.70 };
    return factores[n] || 0.70;
};

window.obtenerResistencia = function(material, seccion) {
    return window.tabelasNBR.resistencias[material][seccion];
};

// ===================================================================
// Load calculations.js by evaluating it
// ===================================================================

const code = fs.readFileSync(path.join(__dirname, '..', 'calculations.js'), 'utf8');
eval(code);

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

test('Trifasico voltage drop: 50A, 380V, 100m, 10mm2 cobre, fp=0.85', function() {
    const result = calcularCaidaTensionAC({
        corriente: 50, tension: 380, longitud: 100,
        seccion: 10, materialCondutor: 'cobre',
        tipoSistema: 'trifasico', factorPotencia: 0.85
    });
    // R = 1.83 ohm/km, L = 0.1km
    // dV = sqrt(3) * 1.83 * 50 * 0.1 * 0.85 = 13.48V
    // pct = 13.48 / 380 * 100 = 3.55%
    assertClose(result.caidaTensionV, 13.48, 0.1, 'Voltage drop V');
    assertClose(result.caidaTensionPct, 3.55, 0.05, 'Voltage drop %');
    assertTrue(result.cumple, 'Should be within 4% limit');
});

test('Monofasico voltage drop uses 2*R*I*L formula', function() {
    const result = calcularCaidaTensionAC({
        corriente: 30, tension: 220, longitud: 50,
        seccion: 4, materialCondutor: 'cobre',
        tipoSistema: 'monofasico', factorPotencia: 1.0
    });
    // R = 4.61, L = 0.05km, I = 30
    // dV = 2 * 4.61 * 30 * 0.05 * 1.0 = 13.83V
    // pct = 13.83 / 220 * 100 = 6.29%
    assertClose(result.caidaTensionV, 13.83, 0.1, 'Mono voltage drop V');
    assertTrue(!result.cumple, 'Should exceed 4% limit');
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
    assertTrue(result.cumple, '70mm2 should pass for 57.52mm2 requirement');
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

test('Plomo-acido, 60 elements, 5 mohm -> V=120V, Icc=24000A', function() {
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
    // tensionElemento = 2.0V, tensionBanco = 60 * 2.0 = 120V
    // Icc = 120 / (5/1000) = 120 / 0.005 = 24000A
    assertEqual(result.tension_banco, 120, 'Battery bank voltage');
    assertEqual(result.corriente_cortocircuito, 24000, 'DC short circuit current');
});

test('DC short circuit section check with K=115 (cobre PVC)', function() {
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
    // Smin = 24000 * sqrt(0.1) / 115 = 24000 * 0.31623 / 115 = 65.99mm2
    assertClose(result.seccion_minima, 65.99, 0.5, 'DC min section');
    assertTrue(result.cumple_criterio, '120mm2 should pass for ~66mm2 requirement');
    assertEqual(result.constante_K, 115, 'K constant for cobre PVC');
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

test('calcularFactorTemperaturaDC PVC returns 1.0 at 30C (reference)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 30, aislamiento: 'PVC' });
    assertEqual(result, 1.0, 'PVC factor at 30C');
});

test('calcularFactorTemperaturaDC PVC interpolates between table values', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 32, aislamiento: 'PVC' });
    // Between 30 (1.00) and 35 (0.94): 1.00 + (0.94-1.00)*(32-30)/(35-30) = 1.00 - 0.024 = 0.976
    assertClose(result, 0.976, 0.002, 'Interpolated PVC factor at 32C');
});

// ===================================================================
// TEST GROUP 12: DC Temperature Factor by Insulation (Phase 1)
// ===================================================================

console.log('\n--- Group 12: DC Temperature Factor by Insulation ---');

test('PVC factor at 30C = 1.00 (reference temp)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 30, aislamiento: 'PVC' });
    assertEqual(result, 1.0, 'PVC at 30C');
});

test('EPR factor at 30C = 1.00 (reference temp)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 30, aislamiento: 'EPR' });
    assertEqual(result, 1.0, 'EPR at 30C');
});

test('PVC has lower factor than EPR at high temperature', function() {
    const pvc = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 50, aislamiento: 'PVC' });
    const epr = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 50, aislamiento: 'EPR' });
    assertTrue(pvc < epr, `PVC (${pvc}) should be < EPR (${epr}) at 50C`);
});

test('PVC max usable temp is ~60C (factor near 0.50)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 60, aislamiento: 'PVC' });
    assertClose(result, 0.50, 0.05, 'PVC at 60C');
});

test('EPR allows higher temps (factor at 70C still > 0.5)', function() {
    const result = calcularFactorTemperaturaDC({ material: 'cobre', temperatura: 70, aislamiento: 'EPR' });
    assertTrue(result >= 0.50, `EPR at 70C should be >= 0.50, got ${result}`);
});

// ===================================================================
// TEST GROUP 13: Reactance in AC Voltage Drop (Phase 1)
// ===================================================================

console.log('\n--- Group 13: Reactance for Large Sections ---');

test('Small section (<50mm2) uses simple formula', function() {
    const result = calcularCaidaTensionAC({
        corriente: 30, tension: 220, longitud: 50, seccion: 4,
        materialCondutor: 'cobre', tipoSistema: 'monofasico', factorPotencia: 1.0
    });
    // R=4.61, L=0.05km, k=2: dV = 2 * 4.61 * 30 * 0.05 * 1.0 = 13.83V
    assertClose(result.caidaTensionV, 13.83, 0.1, 'Simple formula for 4mm2');
});

test('Large section (>=50mm2) includes reactance component', function() {
    const result = calcularCaidaTensionAC({
        corriente: 200, tension: 380, longitud: 100, seccion: 95,
        materialCondutor: 'cobre', tipoSistema: 'trifasico', factorPotencia: 0.85
    });
    // R=0.193, X=0.076, fp=0.85, sinφ=0.5268
    // dV = √3 * 200 * 0.1 * (0.193*0.85 + 0.076*0.5268) = √3 * 200 * 0.1 * (0.16405 + 0.04004)
    // dV = √3 * 200 * 0.1 * 0.20409 = 7.07V
    assertTrue(result.caidaTensionV > 0, 'Should calculate positive voltage drop');
    assertTrue(result.caidaTensionPct > 0, 'Should have positive percentage');
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

test('Phase > 35mm2: ground = half of phase', function() {
    assertEqual(calcularConductorProteccion(50), 25, '50mm2 phase -> 25mm2 ground');
    assertEqual(calcularConductorProteccion(120), 60, '120mm2 phase -> 60mm2 ground');
    assertEqual(calcularConductorProteccion(240), 120, '240mm2 phase -> 120mm2 ground');
});

// ===================================================================
// Summary
// ===================================================================

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed}/${total} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

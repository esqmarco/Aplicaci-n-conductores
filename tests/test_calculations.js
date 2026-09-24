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
// TEST GROUP 3: AC Current - Bifasico (Mamede 3.5.1.1: I = P / (Vff x cosPhi))
// ===================================================================

console.log('\n--- Group 3: AC Current - Bifasico (sin sqrt(2)) ---');

test('7500W, 220V entre fases, fp=0.8, bifasico -> I = 42.61A', function() {
    const result = calcularCorrenteProyecto({
        potencia: 7500, tension: 220, factorPotencia: 0.8,
        tipoSistema: 'bifasico', rendimiento: 1.0
    });
    // 7500 / (220 * 0.8) = 42.61 A
    assertClose(result, 42.61, 0.01, 'Bifasico 7500W');
});

test('Bifasico does NOT divide by sqrt(2) (ratio to monofasico = 1)', function() {
    const params = { potencia: 7500, tension: 220, factorPotencia: 0.8, rendimiento: 1.0 };
    const mono = calcularCorrenteProyecto({ ...params, tipoSistema: 'monofasico' });
    const bif  = calcularCorrenteProyecto({ ...params, tipoSistema: 'bifasico' });
    assertEqual(bif, mono, 'Misma corriente para la misma tension aplicada a la carga');
});

test('Bifasico 7500W 220V B1 PVC 40C -> 10mm2 (with sqrt(2) it wrongly gave 6mm2)', function() {
    const r = dimensionarPorAmpacidadAC({
        modoEntrada: 'potencia', potencia: 7500, unidadPotencia: 'W', tension: 220,
        factorPotencia: 0.8, tipoSistema: 'bifasico', rendimiento: 1,
        materialAislamento: 'PVC', materialCondutor: 'cobre', temperaturaAmbiente: 40,
        metodoInstalacao: 'B1', agrupamento: 1
    });
    // 42.61 A con 3 conductores cargados: 6mm2 = 32 A (no alcanza), 10mm2 = 44 A
    assertEqual(r.seccion, 10);
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
        seccion: 10, materialCondutor: 'cobre', clase: 'rigido',
        tipoSistema: 'trifasico', factorPotencia: 0.85, aislamiento: 'PVC'
    });
    // R70 = 1.83 * (1 + 0.00393*50) = 2.1896 ohm/km (efecto pelicular despreciable en 10 mm2)
    // X = 0.098 (INPACO Tabla 15, trebol, 50 Hz); sen = 0.5268
    // dV = sqrt(3) * 50 * 0.1 * (2.1898*0.85 + 0.098*0.5268) = 16.57 V -> 4.36%
    assertClose(result.caidaTensionV, 16.57, 0.02, 'Voltage drop V');
    assertClose(result.caidaTensionPct, 4.36, 0.02, 'Voltage drop %');
    assertEqual(result.temperaturaConductor, 70, 'PVC a 70 C');
});

test('Monofasico voltage drop uses 2*R70*I*L with fp=1', function() {
    const result = calcularCaidaTensionAC({
        corriente: 30, tension: 220, longitud: 50,
        seccion: 4, materialCondutor: 'cobre', clase: 'rigido',
        tipoSistema: 'monofasico', factorPotencia: 1.0
    });
    // R70 = 4.61 * 1.1965 = 5.5159; dV = 2 * 5.5159 * 30 * 0.05 = 16.55 V
    assertClose(result.caidaTensionV, 16.55, 0.02, 'Mono voltage drop V');
    assertTrue(!result.cumple, 'Should exceed 4% limit');
});

test('EPR/XLPE uses resistance at 90 C (higher drop than PVC)', function() {
    const result = calcularCaidaTensionAC({
        corriente: 30, tension: 220, longitud: 50, seccion: 4, materialCondutor: 'cobre', clase: 'rigido',
        tipoSistema: 'monofasico', factorPotencia: 1.0, aislamiento: 'EPR_90'
    });
    // R90 = 4.61 * (1 + 0.00393*70) = 5.8782; dV = 2 * 5.8782 * 30 * 0.05 = 17.63 V
    assertClose(result.caidaTensionV, 17.63, 0.02, 'EPR voltage drop');
});

test('Parallel conductors divide the voltage drop', function() {
    const uno = calcularCaidaTensionAC({ corriente: 400, tension: 380, longitud: 80, seccion: 150,
        materialCondutor: 'cobre', clase: 'rigido', tipoSistema: 'trifasico', factorPotencia: 0.9 });
    const dos = calcularCaidaTensionAC({ corriente: 400, tension: 380, longitud: 80, seccion: 150,
        materialCondutor: 'cobre', clase: 'rigido', tipoSistema: 'trifasico', factorPotencia: 0.9, conductoresPorFase: 2 });
    assertClose(dos.caidaTensionV, uno.caidaTensionV / 2, 0.02, 'Half drop with 2 in parallel');
});

test('Custom limit (5%) is applied', function() {
    const r = calcularCaidaTensionAC({ corriente: 50, tension: 380, longitud: 100, seccion: 10,
        materialCondutor: 'cobre', clase: 'rigido', tipoSistema: 'trifasico', factorPotencia: 0.85, limite: 5 });
    assertEqual(r.limite, 5, 'Limit');
    assertTrue(r.cumple, '4.36% <= 5%');
});

test('Minimum section by voltage drop: 50A 380V 100m -> 16mm2', function() {
    const r = calcularSeccionMinimaCaidaAC({ corriente: 50, tension: 380, longitud: 100,
        materialCondutor: 'cobre', clase: 'rigido', tipoSistema: 'trifasico', factorPotencia: 0.85, aislamiento: 'PVC', limite: 4 });
    // 10mm2 -> 4.36% (no cumple); 16mm2 -> ~2.77%
    assertEqual(r.seccion, 16, 'Section by voltage drop');
    assertClose(r.caidaTensionPct, 2.77, 0.03, 'Drop at 16mm2');
});

test('AC resistance: skin effect ys = 0.01385 for 300mm2 XLPE 90C at 50 Hz (IEC 60287)', function() {
    const r = calcularResistenciaAC({ seccion: 300, materialCondutor: 'cobre', clase: 'rigido', aislamiento: 'EPR_90',
        frecuencia: 50, disposicion: 'trebol', conductoresCargados: 3 });
    // R90 = 0.0601*1.2751 = 0.076634 ohm/km; xs^2 = 8*pi*50e-7/7.6634e-5 = 1.6398; ys = xs^4/(192+0.8 xs^4)
    assertClose(r.ys, 0.01385, 0.00002, 'ys');
    assertClose(r.rac, 0.08244, 0.00005, 'Rac = Rt (1 + ys + yp)');
});

test('AC resistance at 60 Hz stays within +0..4% of Mamede Tabla 3.22 (PVC, trebol)', function() {
    // Mamede Tabla 3.22: resistencia de secuencia positiva, PVC/70 C, 60 Hz, trebol (Ohm/km)
    const mamede = { 150: 0.1502, 185: 0.1226, 240: 0.0958, 300: 0.0781 };
    Object.keys(mamede).forEach(function(s) {
        const r = calcularResistenciaAC({ seccion: parseFloat(s), materialCondutor: 'cobre', clase: 'rigido', aislamiento: 'PVC',
            frecuencia: 60, disposicion: 'trebol', conductoresCargados: 3 });
        assertTrue(r.rac >= mamede[s] && r.rac <= mamede[s] * 1.04,
            s + 'mm2: Rac ' + r.rac.toFixed(5) + ' vs Mamede ' + mamede[s]);
    });
});

test('Reactance comes from INPACO Tabla 15 by arrangement and scales with frequency', function() {
    const base = { corriente: 400, tension: 380, longitud: 100, seccion: 300, materialCondutor: 'cobre', clase: 'rigido',
        tipoSistema: 'trifasico', factorPotencia: 0.8, aislamiento: 'EPR_90' };
    const trebol = calcularCaidaTensionAC(Object.assign({}, base));
    const plano60 = calcularCaidaTensionAC(Object.assign({}, base, { frecuencia: 60, disposicion: 'plano_2D' }));
    assertEqual(trebol.reactancia, 0.075, 'trebol 50 Hz');
    assertClose(plano60.reactancia, 0.1608, 0.0001, 'plano S=2D a 60 Hz = 0.134 x 1.2');
    // dV = sqrt(3)*400*0.1*(0.07973*0.8 + 0.1608*0.6) = 11.10 V
    assertClose(plano60.caidaTensionV, 11.10, 0.02, 'drop plano 2D 60 Hz');
});

test('Unknown arrangement or frequency throws', function() {
    let threw = 0;
    const base = { corriente: 50, tension: 380, longitud: 100, seccion: 10, materialCondutor: 'cobre', tipoSistema: 'trifasico', factorPotencia: 0.9 };
    try { calcularCaidaTensionAC(Object.assign({}, base, { disposicion: 'otra' })); } catch (e) { threw++; }
    try { calcularCaidaTensionAC(Object.assign({}, base, { frecuencia: 55 })); } catch (e) { threw++; }
    assertEqual(threw, 2);
});

test('Conductor class: flexible (class 5) is the default for copper and raises R', function() {
    const base = { corriente: 50, tension: 380, longitud: 100, seccion: 10, materialCondutor: 'cobre',
        tipoSistema: 'trifasico', factorPotencia: 0.85, aislamiento: 'PVC' };
    const flex = calcularCaidaTensionAC(Object.assign({}, base));
    const rig = calcularCaidaTensionAC(Object.assign({}, base, { clase: 'rigido' }));
    // Clase 5: R20 = 1.91 -> dV = 17.27 V (4.55 %); clase 2: R20 = 1.83 -> 16.57 V
    assertEqual(flex.clase, 'flexible');
    assertClose(flex.caidaTensionV, 17.27, 0.02, 'flexible');
    assertClose(rig.caidaTensionV, 16.57, 0.02, 'rigido');
});

test('Conductor class: aluminium defaults to rigid and rejects flexible', function() {
    const base = { corriente: 50, tension: 380, longitud: 100, seccion: 16, materialCondutor: 'aluminio',
        tipoSistema: 'trifasico', factorPotencia: 0.85 };
    assertEqual(calcularCaidaTensionAC(Object.assign({}, base)).clase, 'rigido');
    let threw = false;
    try { calcularCaidaTensionAC(Object.assign({}, base, { clase: 'flexible' })); } catch (e) { threw = true; }
    assertTrue(threw, 'Aluminio flexible no existe en IEC 60228');
});

test('Class 5 table reproduces INPACO Tabla 15 Rca at 90 C (1.5 to 70 mm2, within 1%)', function() {
    const inpaco = { 1.5: 16.96, 2.5: 10.18, 4: 6.31, 6: 4.21, 10: 2.44, 16: 1.54, 25: 0.99, 35: 0.71, 50: 0.49, 70: 0.35 };
    Object.keys(inpaco).forEach(function(s) {
        const r90 = obtenerResistencia('cobre', parseFloat(s), 'flexible') * (1 + 0.00393 * 70);
        assertTrue(Math.abs(r90 / inpaco[s] - 1) <= 0.01, s + 'mm2: ' + r90.toFixed(4) + ' vs ' + inpaco[s]);
    });
});

test('Single aluminium resistance table for AC and DC', function() {
    assertTrue(window.tabelasDC.resistenciasDC.aluminio === window.tabelasNBR.resistencias.aluminio, 'misma tabla');
    assertTrue(window.tabelasDC.resistenciasDC.cobre === window.tabelasNBR.resistencias.cobre_flexible, 'DC cobre = clase 5');
});

test('DC voltage drop accepts rigid class', function() {
    const flex = calcularResistenciaCorregida({ material: 'cobre', seccion: 25, aislamiento: 'PVC' });
    const rig = calcularResistenciaCorregida({ material: 'cobre', seccion: 25, aislamiento: 'PVC', clase: 'rigido' });
    // 0.780 (clase 5) y 0.727 (clase 2) x 1.1965
    assertClose(flex.R_temp, 0.9333, 0.0001);
    assertClose(rig.R_temp, 0.8699, 0.0001);
});

test('AC validation rejects flexible aluminium', function() {
    const v = validarParametrosCaidaTensionAC({ corriente: 50, tension: 380, longitud: 100, seccion: 16, tipoSistema: 'trifasico',
        factorPotencia: 0.9, material: 'aluminio', clase: 'flexible' });
    assertTrue(!v.valido, 'debe rechazar');
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

test('DC drop limits by section of the circuit (Itaipu #ITA0&EEC010-01 R1A 10.3.2)', function() {
    assertEqual(determinarLimiteCaidaDC('bateria_carga'), 5.0, 'batería → carga 5 %');
    assertEqual(determinarLimiteCaidaDC('cargador_bateria'), 3.0, 'cargador → batería 3 %');
});

test('Unknown or old DC application has no default limit (error)', function() {
    ['general', 'alimentacion_critica', undefined, ''].forEach(function (a) {
        let lanzo = false;
        try { determinarLimiteCaidaDC(a); } catch (e) { lanzo = true; }
        assertTrue(lanzo, 'debía lanzar para ' + a);
    });
    const v = validarParametrosCaidaTensionDC({ corriente: 10, tensionSelector: '48', longitud: 20, conductoresPorPolo: 1,
        seccion: 16, material: 'cobre', aplicacionDC: 'general' });
    assertTrue(!v.valido, 'la validación rechaza un tramo desconocido');
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
        materialCondutor: 'cobre', clase: 'rigido', tipoSistema: 'monofasico', factorPotencia: 0.8
    });
    // R70 = 5.5159, X = 0.112 (INPACO trebol 50 Hz): dV = 2*30*0.05*(5.5159*0.8 + 0.112*0.6) = 13.44 V
    assertClose(result.caidaTensionV, 13.44, 0.02, 'Formula for 4mm2');
});

test('Large section (>=50mm2) includes reactance component', function() {
    const result = calcularCaidaTensionAC({
        corriente: 200, tension: 380, longitud: 100, seccion: 95,
        materialCondutor: 'cobre', clase: 'rigido', tipoSistema: 'trifasico', factorPotencia: 0.85
    });
    // R70 = 0.193*1.1965 = 0.23092 -> Rac = 0.23294 (IEC 60287 / INPACO 4.3.1)
    // X = 0.079 (INPACO trebol 50 Hz); fp=0.85, sen=0.5268 -> dV = 8.30 V
    assertClose(result.caidaTensionV, 8.30, 0.02, 'Large section voltage drop');
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

test('Aluminio ampacity = INPACO cobre x Al/Cu of NBR 5410 (same method, insulation, conductors)', function() {
    const r = dimensionarPorAmpacidadAC(Object.assign({}, baseAC, { corrienteDirecta: 40, tipoSistema: 'trifasico', materialCondutor: 'aluminio' }));
    // INPACO B1 3c PVC 16 mm2 = 59 A; NBR Tabla 36 B1 3c 16 mm2: Cu 68 / Al 53 -> 59 * 53/68 = 46.0 A
    assertEqual(r.seccion, 16);
    assertClose(r.ampacidad, 46.0, 0.05, 'Al ampacity');
    assertTrue(r.advertencias.length > 0, 'Aviso de origen del dato de aluminio');
});

test('Aluminio: NBR ratio replaces the old estimate where it was non-conservative (XLPE C 2c 25 mm2)', function() {
    // INPACO C 2c XLPE 25 mm2 = 125 A; NBR Tabla 37 C 2c 25: Cu 138 / Al 101 -> 91.5 A
    // (el factor viejo sqrt(R_Cu/R_Al) daba ~97 A: 6 % de más)
    assertClose(obtenerAmpacidadConductor('EPR_90', 'C', 25, 2, 'aluminio'), 91.5, 0.05);
});

test('Aluminio: methods E/F/G use the same columns as copper (G = vertical spaced)', function() {
    // INPACO G PVC 300 mm2 = 573 A; NBR Tabla 38 G vertical 300: Cu 659 / Al 519 -> 451.3 A
    assertClose(obtenerAmpacidadConductor('PVC', 'G', 300, 3, 'aluminio'), 451.3, 0.05);
    assertClose(obtenerFactorAluminio(300, 'PVC', 'G', 2), 519 / 659, 1e-9, 'G sin columna de 2 conductores: usa la de 3');
});

test('Aluminio in DC uses the 2-conductor ratio', function() {
    // INPACO B1 2c PVC 16 = 66 A; NBR Tabla 36 B1 2c 16: Cu 76 / Al 60 -> 52.1 A
    assertClose(obtenerAmpacidadBaseDC('aluminio', 'B1', 16, 'PVC'), 52.1, 0.05);
});

test('NBR copper columns x 40 C factor match INPACO within 2% (transcription check)', function() {
    // NBR 5410 a 30 C x 0.87 (PVC) / 0.91 (XLPE) = INPACO a 40 C, salvo redondeo del catálogo
    const t = window.tabelasNBR.ampacidadesNBR_CuAl;
    let n = 0, max = 0;
    [['PVC', 0.87], ['XLPE_HEPR', 0.91]].forEach(function(par) {
        Object.keys(t[par[0]]).forEach(function(met) {
            if (met === 'D') return; // suelo: referencias distintas (20 C y 2,5 K.m/W vs 25 C y 1,0)
            Object.keys(t[par[0]][met]).forEach(function(nc) {
                Object.keys(t[par[0]][met][nc]).forEach(function(s) {
                    const cuNBR = t[par[0]][met][nc][s][0];
                    const cuINPACO = obtenerAmpacidadBase(par[0], met, parseFloat(s), parseInt(nc, 10));
                    max = Math.max(max, Math.abs(cuNBR * par[1] / cuINPACO - 1)); n++;
                });
            });
        });
    });
    assertTrue(n >= 180, 'celdas comparadas: ' + n);
    assertTrue(max <= 0.02, 'desvio max ' + (100 * max).toFixed(2) + ' %');
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
    const v = validarParametrosCaidaTensionDC({ corriente: 80, aplicacionDC: 'bateria_carga', tensionSelector: '48', longitud: 20,
        conductoresPorPolo: 1, seccion: 25, material: 'cobre', aislamiento: 'PVC' });
    assertTrue(v.valido, 'Should be valid: ' + v.errores.join('; '));
});

test('DC ampacity validation in current mode does not ask for power', function() {
    const v = validarParametrosAmpacidadDC({ modoEntrada: 'corriente', corrienteDirecta: 20, material: 'cobre',
        temperatura: 30, metodo: 'B1', agrupamiento: 1 });
    assertTrue(v.valido, 'Should be valid: ' + v.errores.join('; '));
});

test('Empty grouping is an error in AC and DC, never 1 circuit (auditoria 2026-09-23)', function() {
    // parseFloat('') del campo vacío llega como NaN: tomarlo como 1 circuito daba 50 mm² en vez de 70 mm²
    const baseAC = { modoEntrada: 'potencia', potencia: 50, tension: 380, factorPotencia: 0.85, rendimiento: 1,
        factorDemanda: 1, temperaturaAmbiente: 40 };
    assertTrue(validarParametrosAmpacidadAC(Object.assign({}, baseAC, { agrupamento: 3 })).valido, 'AC con 3 circuitos');
    [NaN, 0, 2.5, -1].forEach(function (n) {
        assertTrue(!validarParametrosAmpacidadAC(Object.assign({}, baseAC, { agrupamento: n })).valido, 'AC agrupamento ' + n);
        assertTrue(!validarParametrosAmpacidadDC({ modoEntrada: 'corriente', corrienteDirecta: 20, material: 'cobre',
            temperatura: 30, metodo: 'B1', agrupamiento: n }).valido, 'DC agrupamiento ' + n);
    });
});

test('Empty efficiency or demand factor is an error in AC power mode', function() {
    const base = { modoEntrada: 'potencia', potencia: 50, tension: 380, factorPotencia: 0.85, rendimiento: 0.9,
        factorDemanda: 1, temperaturaAmbiente: 40, agrupamento: 1 };
    assertTrue(validarParametrosAmpacidadAC(base).valido, 'base válida');
    assertTrue(!validarParametrosAmpacidadAC(Object.assign({}, base, { rendimiento: NaN })).valido, 'rendimiento vacío');
    assertTrue(!validarParametrosAmpacidadAC(Object.assign({}, base, { factorDemanda: NaN })).valido, 'FD vacío');
    // En modo corriente no se piden
    assertTrue(validarParametrosAmpacidadAC({ modoEntrada: 'corriente', corrienteDirecta: 100, tension: 380,
        temperaturaAmbiente: 40, agrupamento: 1 }).valido, 'modo corriente');
});

test('DC short-circuit commercial section uses its own K above 300 mm2 (twin of AC)', function() {
    // 60 kA, 0,5 s, Cu PVC: con K=115 da 369 mm² -> 400; pero 400 mm² tiene K=103 -> necesita 412 mm² -> 500
    const r = analizarCortocircuitoDC({ tipoBateria: 'plomo-acido', elementosSerie: 55, resistenciaInterna: 0.03333,
        tiempoDespeje: 0.5, seccion: 300, material: 'cobre', aislamiento: 'PVC' });
    assertEqual(r.seccion_comercial, 500);
    assertEqual(seccionComercialCortocircuito(60006, 0.5, 'cobre', 'EPR'), 300); // EPR: K=143 en todo el rango
});

test('DC voltage drop "cumple" uses the unrounded percentage (twin of AC)', function() {
    // 48 V, 10 A, 82,95 m, Cu flexible PVC 16 mm²: 5,0038 % se muestra 5,00 % pero NO cumple el 5 %
    const p = { corriente: 10, tensionSelector: '48', longitud: 82.95, conductoresPorPolo: 1, seccion: 16,
        material: 'cobre', aislamiento: 'PVC', clase: 'flexible', aplicacionDC: 'bateria_carga' };
    const r = verificarCaidaTensionDC(p);
    assertEqual(r.limite_pct, 5.0);
    assertTrue(!r.cumple_criterio, 'no cumple con 5,0038 %');
    assertEqual(calcularSeccionParaCaidaDC(p), 25, 'la sección final coincide con la pestaña');
});

test('Aluminium short-circuit commercial section is at least 16 mm2 (AC and DC)', function() {
    const ac = calcularCortocircuitoAC({ potenciaCortocircuito: 1, tensionSistema: 0.38, tiempoDespeje: 0.1,
        seccion: 16, materialCondutor: 'aluminio', materialAislamiento: 'PVC' });
    assertEqual(ac.seccionComercial, 16);
    const dc = analizarCortocircuitoDC({ tipoBateria: 'plomo-acido', elementosSerie: 24, resistenciaInterna: 1,
        tiempoDespeje: 0.1, seccion: 16, material: 'aluminio', aislamiento: 'PVC' });
    assertEqual(dc.seccion_comercial, 16);
});

test('Short-circuit S_min does not depend on the chosen section (K of > 300 mm2 when needed)', function() {
    // Icc 20 kA, 4,8 s, Cu PVC: 20000·√4,8/115 = 381 > 300 -> con K=103: 425,4 mm²
    const Icc = 20000, t = 4.8;
    assertClose(seccionMinimaCortocircuito(Icc, t, 'cobre', 'PVC'), Icc * Math.sqrt(t) / 103, 0.01);
    const dc = analizarCortocircuitoDC({ tipoBateria: 'plomo-acido', elementosSerie: 55, resistenciaInterna: 0.1,
        tiempoDespeje: t, seccion: 240, material: 'cobre', aislamiento: 'PVC' });
    assertClose(dc.seccion_minima, 425.4, 0.1);
    assertEqual(dc.constante_K, 115);          // K de la sección elegida (240 mm²)
    assertEqual(dc.constante_K_minima, 103);   // K con que se calculó la S mín.
    assertEqual(dc.seccion_comercial, 500);
    assertTrue(!dc.cumple_criterio);
    // Por debajo de 300 mm² no cambia nada
    assertClose(seccionMinimaCortocircuito(10000, 0.1, 'cobre', 'PVC'), 10000 * Math.sqrt(0.1) / 115, 0.001);
});

test('PE by short circuit uses the K of the conductor material', function() {
    // 20 kA, 0,5 s, EPR: cobre K=143 -> 98,9 -> 120; aluminio K=94 -> 150,4 -> 185
    assertEqual(calcularConductorProteccion(16, { corrienteCC: 20000, tiempoDespeje: 0.5, aislamiento: 'EPR' }), 120);
    assertEqual(calcularConductorProteccion(16, { corrienteCC: 20000, tiempoDespeje: 0.5, aislamiento: 'EPR', material: 'aluminio' }), 185);
});

test('Empty conductor temperature falls back to service temperature, never NaN', function() {
    const r = calcularResistenciaCorregida({ material: 'cobre', seccion: 16, aislamiento: 'PVC', temperatura: '' });
    assertEqual(r.temperatura, 70);
    assertTrue(!isNaN(r.R_temp));
});

// Chequeos estáticos de app.js (lecciones de la auditoría 2026-09-23)
const appJs = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('Every failed validation in app.js discards that tab result (no stale results)', function() {
    const bloques = appJs.split('if (!validacion.valido) {').slice(1);
    assertTrue(bloques.length >= 6, 'se esperaban 6 validaciones, hay ' + bloques.length);
    bloques.forEach(function (b, i) {
        const cuerpo = b.slice(0, b.indexOf('return;'));
        assertTrue(cuerpo.indexOf('descartarResultados(') !== -1, 'validación #' + (i + 1) + ' no descarta el resultado');
    });
});

test('No user-typed field gets a silent numeric default in app.js (only selects may)', function() {
    // parseX(document.getElementById('id')...) || N  solo se admite si 'id' es un <select> (nunca vacío)
    const re = /parse(?:Int|Float)\(document\.getElementById\('([\w-]+)'\)[^)]*\)\s*\|\|\s*[\d.]+/g;
    let m, encontrados = 0;
    while ((m = re.exec(appJs)) !== null) {
        encontrados++;
        const esSelect = new RegExp('<select[^>]*id="' + m[1] + '"').test(indexHtml);
        assertTrue(esSelect, 'el campo ' + m[1] + ' se puede dejar vacío y recibe un valor por defecto');
    }
    assertTrue(encontrados > 0, 'el patrón no encontró nada: revisar la expresión');
});

test('Initial ambient temperature is the INPACO air reference, 40 C (AC and DC)', function() {
    // Con 30 °C el factor era 1,15 (PVC) sin que el usuario lo eligiera: 80 A B1 daba 25 mm² en vez de 35 mm²
    assertTrue(/id="temperatura-ambiente" value="40"/.test(indexHtml), 'AC');
    assertTrue(/id="temperatura-ambiente-dc" value="40"/.test(indexHtml), 'DC');
    assertTrue(/m === 'D' \? '25' : '40'/.test(appJs), 'método D pasa a 25 °C (suelo)');
});

// Partida de motor (Itaipu #ITA0&EEC010-01 R1A §10.3.1.3; Mamede §3.5.1.2) — backlog #14
const circPartida = { corriente: 71.45, tension: 380, tipoSistema: 'trifasico', longitud: 80, seccion: 25,
    materialCondutor: 'cobre', aislamiento: 'PVC', clase: 'rigido', conductoresPorFase: 1, disposicion: 'trebol', frecuencia: 50 };
const alimPartida = { longitud: 30, seccion: 150, materialCondutor: 'cobre', aislamiento: 'PVC', clase: 'rigido',
    conductoresPorFase: 1, disposicion: 'trebol' };
const partidaCompleta = { circuito: circPartida, relacionIp: 6, fpPartida: 0.3, limite: 10,
    otrasCargas: { corriente: 200, factorPotencia: 0.85 }, alimentador: alimPartida, trafo: { potenciaKVA: 500, impedanciaPct: 5 } };

test('Motor start: three sections add up (hand check, 50 CV motor, 80 m 25 mm2 + 30 m 150 mm2 + 500 kVA 5 %)', function() {
    const r = calcularCaidaPartidaMotor(partidaCompleta);
    // Ip = 6 × 71,45 = 428,7 A. Circuito (R 0,8704 / X 0,090 Ω/km a 70 °C, INPACO Tabla 15 trébol):
    //   √3·428,7·0,08·(0,8704·0,3 + 0,090·0,954)/380 = 5,42 %
    // Alimentador: P = 428,7·0,3 + 200·0,85 = 298,6; Q = 428,7·0,954 + 200·0,527 = 514,4 → I = 594,7 A, cosφ 0,502;
    //   R 0,1515 / X 0,078 → √3·594,7·0,03·(0,1515·0,502 + 0,078·0,865)/380 = 1,17 %
    // Trafo: In = 500000/(√3·380) = 759,7 A → 594,7/759,7 × 5 = 3,91 %
    assertClose(r.corrientePartida, 428.7, 0.01);
    assertClose(r.tramos[0].caidaPct, 5.42, 0.01);
    assertClose(r.tramos[1].corriente, 594.71, 0.01);
    assertClose(r.tramos[1].caidaPct, 1.17, 0.01);
    assertClose(r.tramos[2].corrienteNominalTrafo, 759.7, 0.05);
    assertClose(r.tramos[2].caidaPct, 3.91, 0.01);
    assertClose(r.caidaTotalPct, 10.51, 0.01);
    assertTrue(!r.cumple, '10,51 % no cumple el 10 %');
    const m = calcularSeccionMinimaPartida(partidaCompleta);
    assertEqual(m.seccion, 35);
    assertTrue(m.caidaTotalPct <= 10);
});

test('Motor start with only the motor circuit flags soloCircuito and equals the AC drop formula', function() {
    const r = calcularCaidaPartidaMotor({ circuito: circPartida, relacionIp: 6, fpPartida: 0.3, limite: 10,
        otrasCargas: { corriente: 0, factorPotencia: 0.85 }, alimentador: null, trafo: null });
    assertTrue(r.soloCircuito);
    assertEqual(r.tramos.length, 1);
    const directo = calcularCaidaTensionAC(Object.assign({}, circPartida, { corriente: 428.7, factorPotencia: 0.3 }));
    assertClose(r.caidaTotalPct, directo.caidaTensionPct, 0.005);
});

test('Motor start transformer current: three-phase trafo, single-phase circuit uses S/(3·Vfn)', function() {
    const c = Object.assign({}, circPartida, { tipoSistema: 'monofasico', tension: 220 });
    const r = calcularCaidaPartidaMotor({ circuito: c, relacionIp: 6, fpPartida: 0.3, limite: 10,
        otrasCargas: null, alimentador: null, trafo: { potenciaKVA: 150, impedanciaPct: 4 } });
    const tr = r.tramos[1];
    assertClose(tr.corrienteNominalTrafo, 150000 / (3 * 220), 0.05);   // 227,3 A por fase
    assertClose(tr.caidaPct, 428.7 / (150000 / 660) * 4, 0.01);
});

test('Motor start transformer, two-phase (F-F) load: 2/sqrt(3) factor (current through two windings)', function() {
    // Zfase = Z%·Vff²/S; ΔV = 2·I·Zfase/Vff = (2/√3)·(I/In)·Z%. 400 A, 500 kVA, 5 %, 380 V:
    // In = 759,7 A → (2/√3)·(400/759,7)·5 = 3,040 %
    const c = Object.assign({}, circPartida, { tipoSistema: 'bifasico', corriente: 400 / 6 });
    const r = calcularCaidaPartidaMotor({ circuito: c, relacionIp: 6, fpPartida: 0.3, limite: 10,
        otrasCargas: null, alimentador: null, trafo: { potenciaKVA: 500, impedanciaPct: 5 } });
    assertClose(r.tramos[1].caidaPct, 3.04, 0.005);
});

test('parametrosPartidaDesdeCaida maps the AC drop tab and applies the parallel count', function() {
    const pc = Object.assign({}, circPartida, { partida: { relacionIp: 6, fpPartida: 0.3, limite: 10,
        otrasCargas: { corriente: 200, factorPotencia: 0.85 }, alimentador: { longitud: 30, seccion: 150, conductoresPorFase: 1 },
        trafo: { potenciaKVA: 500, impedanciaPct: 5 } } });
    const pp = parametrosPartidaDesdeCaida(pc);
    assertEqual(pp.alimentador.clase, 'rigido', 'el alimentador hereda la clase del circuito');
    assertClose(calcularCaidaPartidaMotor(pp).caidaTotalPct, 10.51, 0.01);
    assertEqual(parametrosPartidaDesdeCaida(pc, 2).circuito.conductoresPorFase, 2);
    assertEqual(parametrosPartidaDesdeCaida(Object.assign({}, pc, { partida: null })), null);
});

test('Motor start validation: every field of an active block is required', function() {
    const ok = { relacionIp: 6, fpPartida: 0.3, limite: 10, otrasCargas: { corriente: 0, factorPotencia: NaN },
        alimentador: null, trafo: null };
    let e = []; validarParametrosPartida(ok, 'cobre', e); assertEqual(e.length, 0, e.join('; '));
    e = []; validarParametrosPartida(Object.assign({}, ok, { relacionIp: NaN }), 'cobre', e); assertEqual(e.length, 1);
    e = []; validarParametrosPartida(Object.assign({}, ok, { otrasCargas: { corriente: NaN, factorPotencia: 0.85 } }), 'cobre', e); assertEqual(e.length, 1);
    e = []; validarParametrosPartida(Object.assign({}, ok, { alimentador: { longitud: 30, seccion: NaN, conductoresPorFase: 1 } }), 'cobre', e); assertEqual(e.length, 1);
    e = []; validarParametrosPartida(Object.assign({}, ok, { trafo: { potenciaKVA: 500, impedanciaPct: NaN } }), 'cobre', e); assertEqual(e.length, 1);
    e = []; validarParametrosPartida(Object.assign({}, ok, { alimentador: { longitud: 30, seccion: 10, conductoresPorFase: 1 } }), 'aluminio', e); assertEqual(e.length, 1);
});

test('Motor start switches are selects (history stores el.value; a checkbox would always be "on")', function() {
    ['partida-ct', 'alim-partida-ct', 'trafo-partida-ct'].forEach(function (id) {
        assertTrue(new RegExp('<select id="' + id + '"').test(indexHtml), id + ' debe ser select');
    });
});

test('Drop percentages shown next to a verdict go through textoPct (never "10.00 % NO CUMPLE")', function() {
    const directos = appJs.match(/caida(?:TensionPct|_tension_pct|TotalPct)\.toFixed|caida_tension_pct \+ '%'|fmt\(r[a-z]*\.caida(?:TensionPct|_tension_pct|TotalPct)/g);
    assertTrue(!directos, 'porcentaje mostrado sin textoPct: ' + (directos || []).join(', '));
});

test('Manual example 1: motor 50 CV 380 V B1 -> 25 mm2, 2.19 % at 80 m, 50 mm2 by short circuit', function() {
    const r = dimensionarPorAmpacidadAC({ modoEntrada: 'potencia', potencia: 50, unidadPotencia: 'CV', tension: 380,
        factorPotencia: 0.85, rendimiento: 0.92, factorDemanda: 1, tipoSistema: 'trifasico', materialAislamento: 'PVC',
        materialCondutor: 'cobre', temperaturaAmbiente: 40, metodoInstalacao: 'B1', agrupamento: 1, tipoCircuito: 'fuerza' });
    assertClose(r.corriente, 71.45, 0.01);
    assertEqual(r.seccion, 25);
    assertEqual(r.ampacidad, 78);
    const c = calcularCaidaTensionAC({ corriente: r.corriente, tension: 380, longitud: 80, seccion: 25,
        materialCondutor: 'cobre', tipoSistema: 'trifasico', factorPotencia: 0.85, aislamiento: 'PVC', limite: 5,
        frecuencia: 50, disposicion: 'trebol' });
    assertClose(c.caidaTensionPct, 2.19, 0.005);
    const cc = calcularCortocircuitoAC({ potenciaCortocircuito: 10, tensionSistema: 0.38, tiempoDespeje: 0.1,
        seccion: 25, materialCondutor: 'cobre', materialAislamiento: 'PVC' });
    assertClose(cc.seccionMinima, 41.78, 0.01);
    assertEqual(cc.seccionComercial, 50);
});

test('Manual example 2: shower 7500 W 220 V -> 6 mm2, 3.67 % at 30 m', function() {
    const r = dimensionarPorAmpacidadAC({ modoEntrada: 'potencia', potencia: 7500, unidadPotencia: 'W', tension: 220,
        factorPotencia: 1, rendimiento: 1, factorDemanda: 1, tipoSistema: 'monofasico', materialAislamento: 'PVC',
        materialCondutor: 'cobre', temperaturaAmbiente: 40, metodoInstalacao: 'B1', agrupamento: 1, tipoCircuito: 'tomadas' });
    assertClose(r.corriente, 34.09, 0.01);
    assertEqual(r.seccion, 6);
    const c = calcularCaidaTensionAC({ corriente: r.corriente, tension: 220, longitud: 30, seccion: 6,
        materialCondutor: 'cobre', tipoSistema: 'monofasico', factorPotencia: 1, aislamiento: 'PVC', limite: 4,
        frecuencia: 50, disposicion: 'trebol' });
    assertClose(c.caidaTensionPct, 3.67, 0.005);
});

test('verificarCaidaTensionDC applies application limit', function() {
    const r = verificarCaidaTensionDC({ corriente: 80, tensionSelector: '48', longitud: 20, conductoresPorPolo: 1,
        seccion: 25, material: 'cobre', aislamiento: 'PVC', aplicacionDC: 'cargador_bateria' });
    // R70 = 0.9333; dV = 2*0.9333*80*0.02 = 2.99 V = 6.22%
    assertEqual(r.limite_pct, 3.0);
    assertClose(r.caida_tension_pct, 6.22, 0.01);
    assertTrue(!r.cumple_criterio);
});

test('DC final section with 2 conductors per pole: ampacity recalculated per conductor', function() {
    const pAmp = { modoEntrada: 'corriente', corrienteDirecta: 80, material: 'cobre', temperatura: 30,
        metodo: 'A1', aislamiento: 'PVC', agrupamiento: 1 };
    const amp = { parametros: pAmp, resultado: dimensionarPorAmpacidadDC(pAmp) };
    const pCaida = { corriente: 80, aplicacionDC: 'bateria_carga', tensionSelector: '48', longitud: 20, conductoresPorPolo: 2, seccion: 16,
        material: 'cobre', aislamiento: 'PVC' };
    const caida = { parametros: pCaida, resultado: verificarCaidaTensionDC(pCaida) };
    // Un conductor: 80 A / 1.15 = 69.6 A -> PVC A1 2c: 25 mm2 (70 A)
    assertEqual(amp.resultado.seccion, 25);
    const fin = calcularSeccionFinalDCDesde({ ampacidad: amp, caida: caida, cortocircuito: null });
    // Por conductor: 40 A, 2 circuitos (fa 0.80) -> 40/(1.15*0.8) = 43.5 A -> 16 mm2 (53 A)
    const porAmp = fin.criterios.filter(function(c) { return /Ampacidad/.test(c.criterio); })[0];
    assertEqual(porAmp.valor, 16, 'ampacidad por conductor');
    assertEqual(fin.np, 2);
    assertTrue(/^2 × \d+ mm² por polo$/.test(fin.texto), fin.texto);
});

test('DC final section with 1 conductor per pole keeps the ampacity section', function() {
    const pAmp = { modoEntrada: 'corriente', corrienteDirecta: 80, material: 'cobre', temperatura: 30,
        metodo: 'A1', aislamiento: 'PVC', agrupamiento: 1 };
    const fin = calcularSeccionFinalDCDesde({ ampacidad: { parametros: pAmp, resultado: dimensionarPorAmpacidadDC(pAmp) },
        caida: null, cortocircuito: null });
    assertEqual(fin.valor, 25);
    assertEqual(fin.texto, '25 mm²');
});

test('calcularSeccionParaCaidaDC returns null when 300mm2 is not enough', function() {
    const s = calcularSeccionParaCaidaDC({ corriente: 500, aplicacionDC: 'bateria_carga', tensionSelector: '12', longitud: 200, conductoresPorPolo: 1,
        material: 'cobre', aislamiento: 'PVC' });
    assertEqual(s, null);
});

// ===================================================================
// Summary
// ===================================================================

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed}/${total} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

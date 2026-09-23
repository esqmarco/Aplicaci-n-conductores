/**
 * CALCULATIONS.JS - FUNCIONES DE CÁLCULO AC + DC
 * ===============================================
 * Versión R5
 * - Ampacidad AC/DC con tablas INPACO (2 o 3 conductores cargados según el sistema)
 * - Aluminio: ampacidad derivada de la de cobre por √(R_Cu/R_Al)
 * - Factores de temperatura interpolados; errores explícitos (sin 1,0 silencioso)
 * - Factor de demanda, resistividad del suelo y conductores en paralelo aplicados
 * - Caída de tensión: R en AC a 70/90 °C (IEC 60287) y X de INPACO Tabla 15 por disposición y frecuencia
 * - Cortocircuito con sección comercial resultante
 */

// ===================================================================
// CONSTANTES COMUNES
// ===================================================================

// Secciones comerciales (mm²) usadas para redondear resultados
const SECCIONES_COMERCIALES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300,
    400, 500, 630, 800, 1000];

// Secciones con tablas de ampacidad y verificación (INPACO llega a 300 mm²)
const SECCIONES_TABLA = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

// Coeficiente de temperatura de la resistencia (1/°C) - INPACO 4.3.1
const ALFA_RESISTENCIA = { cobre: 0.00393, aluminio: 0.00403 };

/**
 * Redondea una sección calculada a la sección comercial inmediata superior.
 * Devuelve null si excede la mayor sección comercial.
 */
function redondearSeccionComercial(seccion) {
    for (const s of SECCIONES_COMERCIALES) {
        if (s >= seccion - 1e-9) return s;
    }
    return null;
}

/**
 * Temperatura máxima de servicio continuo del conductor según la aislación.
 */
function temperaturaServicioConductor(aislamiento) {
    const clave = window.claveAislacion ? window.claveAislacion(aislamiento)
        : (String(aislamiento || 'PVC').toUpperCase() === 'PVC' ? 'PVC' : 'XLPE_HEPR');
    return clave === 'PVC' ? 70 : 90;
}

function normalizarMaterial(material) {
    const m = String(material || '').toLowerCase();
    if (m !== 'cobre' && m !== 'aluminio') throw new Error(`Material ${material} no soportado`);
    return m;
}

// ===================================================================
// CONVERSIÓN DE UNIDADES
// ===================================================================

function convertirAWatts(valor, unidad) {
    if (!valor || valor <= 0) return valor;
    switch (unidad) {
        case 'kW': return valor * 1000;
        case 'CV': return valor * 735.5;
        case 'HP': return valor * 745.7;
        case 'W': default: return valor;
    }
}

// ===================================================================
// FUNCIONES DE CÁLCULO DE CORRIENTE AC
// ===================================================================

function calcularCorrenteProyecto(parametros) {
    if (!parametros.potencia || parametros.potencia <= 0) {
        throw new Error('Potencia debe ser mayor que 0');
    }
    if (!parametros.tension || parametros.tension <= 0) {
        throw new Error('Tensión debe ser mayor que 0');
    }
    if (!parametros.factorPotencia || parametros.factorPotencia < 0.1 || parametros.factorPotencia > 1.0) {
        throw new Error('Factor de potencia debe estar entre 0.1 y 1.0');
    }

    const { potencia, tension, factorPotencia, tipoSistema, rendimiento = 1.0 } = parametros;
    if (!(rendimiento > 0 && rendimiento <= 1.0)) {
        throw new Error('Rendimiento debe estar entre 0 y 1.0');
    }
    let corriente = 0;

    switch (tipoSistema) {
        case 'monofasico':
            corriente = potencia / (tension * factorPotencia * rendimiento);
            break;
        case 'bifasico':
            // Dos fases de un sistema trifásico (F-F o F-F-N), V = tensión entre fases.
            // Mamede 3.5.1.1: carga entre fases → I = P / (Vff · cosφ). Con cargas
            // repartidas F-N la corriente real es menor (P / (2·Vfn·cosφ)): del lado seguro.
            // No lleva √2: ese factor solo aplica a sistemas bifásicos a 90°, que no se usan.
            corriente = potencia / (tension * factorPotencia * rendimiento);
            break;
        case 'trifasico':
            corriente = potencia / (Math.sqrt(3) * tension * factorPotencia * rendimiento);
            break;
        default:
            throw new Error('Tipo de sistema no válido');
    }

    if (corriente <= 0 || !isFinite(corriente)) {
        throw new Error('Resultado de corriente inválido');
    }

    return Math.round(corriente * 100) / 100;
}

function calcularCorrenteCorregida(parametros) {
    const { corrienteProyecto, factorTemperatura, factorAgrupamento } = parametros;
    if (!corrienteProyecto || corrienteProyecto <= 0) throw new Error('Corriente de proyecto debe ser mayor que 0');
    if (!factorTemperatura || factorTemperatura <= 0) throw new Error('Factor de temperatura inválido');
    if (!factorAgrupamento || factorAgrupamento <= 0) throw new Error('Factor de agrupamiento inválido');

    const corrienteCorregida = corrienteProyecto / (factorTemperatura * factorAgrupamento);
    if (corrienteCorregida <= 0 || !isFinite(corrienteCorregida)) {
        throw new Error('Resultado de corriente corregida inválido');
    }
    return Math.round(corrienteCorregida * 100) / 100;
}

// ===================================================================
// CORRIENTE DE TRANSFORMADOR
// ===================================================================

function calcularCorrienteTransformador(parametros) {
    const { potenciaKVA, tension, tipoSistema } = parametros;
    if (!potenciaKVA || potenciaKVA <= 0) throw new Error('Potencia del transformador debe ser mayor que 0');
    if (!tension || tension <= 0) throw new Error('Tensión debe ser mayor que 0');

    let corriente;
    if (tipoSistema === 'trifasico') {
        corriente = (potenciaKVA * 1000) / (Math.sqrt(3) * tension);
    } else {
        corriente = (potenciaKVA * 1000) / tension;
    }
    return Math.round(corriente * 100) / 100;
}

// ===================================================================
// DIMENSIONAMIENTO AC COMPLETO POR AMPACIDAD
// ===================================================================

function obtenerSeccionMinimaNBR(tipoCircuito) {
    const minimos = {
        'iluminacion': 1.5,
        'tomadas': 2.5,
        'fuerza': 2.5,
        'alimentador': 6,
        'general': 1.5
    };
    return minimos[tipoCircuito] || 1.5;
}

/**
 * Número de conductores cargados según el sistema (INPACO 3.4).
 * Bifásico se toma con 3 conductores (dos fases + neutro), caso más desfavorable.
 * Trifásico con neutro cargado por armónicos = 4.
 */
function obtenerConductoresCargados(tipoSistema, neutroCargado) {
    if (tipoSistema === 'monofasico') return 2;
    if (tipoSistema === 'trifasico' && neutroCargado) return 4;
    return 3;
}

/**
 * Ampacidad base (A) para cobre o aluminio.
 * Aluminio: sección mínima 16 mm² y ampacidad = ampacidad cobre × √(R_Cu/R_Al).
 */
function obtenerAmpacidadConductor(aislamiento, metodo, seccion, conductoresCargados, material) {
    const ampCobre = window.obtenerAmpacidadBase(aislamiento, metodo, seccion, conductoresCargados);
    if (material !== 'aluminio') return ampCobre;
    if (seccion < 16) throw new Error('Aluminio: sección mínima 16 mm²');
    return Math.round(ampCobre * window.obtenerFactorAluminio(seccion) * 10) / 10;
}

function dimensionarPorAmpacidadAC(parametros) {
    const {
        modoEntrada, potencia, unidadPotencia, corrienteDirecta, potenciaTransformadorKVA,
        tension, factorPotencia, tipoSistema, rendimiento, factorDemanda,
        materialAislamento, materialCondutor, temperaturaAmbiente,
        metodoInstalacao, agrupamento, tipoCircuito,
        conductoresPorFase, resistividadSuelo, tipoEnterrado, neutroCargado
    } = parametros;

    const advertencias = [];
    const V = parseFloat(tension);
    if (V > 1000) {
        throw new Error('Las tablas de ampacidad (INPACO / NBR 5410) son para baja tensión (hasta 1000 V). Para media tensión corresponde NBR 14039.');
    }

    // 1. Corriente de proyecto según modo de entrada
    let corriente;
    let fdAplicado = 1.0;
    if (modoEntrada === 'corriente') {
        corriente = parseFloat(corrienteDirecta);
        if (!corriente || corriente <= 0) throw new Error('Corriente directa debe ser mayor que 0');
    } else if (modoEntrada === 'transformador') {
        corriente = calcularCorrienteTransformador({
            potenciaKVA: parseFloat(potenciaTransformadorKVA),
            tension: V,
            tipoSistema
        });
    } else {
        // Modo potencia: se aplica el factor de demanda a la potencia instalada
        const fd = parseFloat(factorDemanda);
        if (!isNaN(fd)) {
            if (!(fd > 0 && fd <= 1)) throw new Error('Factor de demanda debe ser mayor que 0 y como máximo 1,0');
            fdAplicado = fd;
        }
        const potenciaW = convertirAWatts(parseFloat(potencia), unidadPotencia) * fdAplicado;
        corriente = calcularCorrenteProyecto({
            potencia: potenciaW,
            tension: V,
            factorPotencia: parseFloat(factorPotencia),
            tipoSistema,
            rendimiento: isNaN(parseFloat(rendimiento)) ? 1.0 : parseFloat(rendimiento)
        });
    }

    // 2. Conductores cargados, paralelo y agrupamiento
    const metodo = metodoInstalacao;
    const material = normalizarMaterial(materialCondutor);
    const nc = obtenerConductoresCargados(tipoSistema, neutroCargado);
    const nParalelo = Math.max(1, parseInt(conductoresPorFase, 10) || 1);
    let circuitos = Math.max(1, parseInt(agrupamento, 10) || 1);
    if (circuitos < nParalelo) {
        advertencias.push(`Cada terna en paralelo cuenta como un circuito para el agrupamiento: se usaron ${nParalelo} circuitos.`);
        circuitos = nParalelo;
    }
    const esEnterrado = !!(window.metodosInstalacion[metodo] && window.metodosInstalacion[metodo].enterrado);
    const tipoEnt = tipoEnterrado === 'directo' ? 'directo' : 'ducto';

    // 3. Factores de corrección (un dato fuera de tabla es un error, no 1,0)
    const factorTemperatura = window.obtenerFactorTemperatura(materialAislamento, parseFloat(temperaturaAmbiente), metodo, esEnterrado);
    const factorAgrupamiento = window.obtenerFactorAgrupamento(metodo, circuitos, tipoEnt);
    if (esEnterrado && circuitos > 6) {
        advertencias.push('INPACO da factores de agrupamiento enterrado hasta 6 circuitos; para más se usó un valor conservador. Verificar según IEC 60287.');
    }
    const factorResistividad = esEnterrado
        ? window.obtenerFactorResistividadSuelo(resistividadSuelo !== undefined ? resistividadSuelo : 1.0, tipoEnt)
        : 1.0;

    const factorTotal = factorTemperatura * factorAgrupamiento * factorResistividad;
    const corrientePorConductor = corriente / nParalelo;
    const corrienteCorregida = corrientePorConductor / factorTotal;

    // 4. Selección de sección
    const seccionMinimaMaterial = material === 'aluminio' ? 16 : 1.5;
    const seccionMinimaNBR = tipoCircuito ? obtenerSeccionMinimaNBR(tipoCircuito) : 1.5;
    const seccionMinima = Math.max(seccionMinimaMaterial, seccionMinimaNBR);

    let seccionSeleccionada = null;
    let ampacidadSeleccionada = null;

    for (const seccion of SECCIONES_TABLA) {
        if (seccion < seccionMinima) continue;
        let ampacidad;
        try {
            ampacidad = obtenerAmpacidadConductor(materialAislamento, metodo, seccion, nc, material);
        } catch (e) {
            continue;
        }
        if (ampacidad >= corrienteCorregida) {
            seccionSeleccionada = seccion;
            ampacidadSeleccionada = ampacidad;
            break;
        }
    }

    if (!seccionSeleccionada) {
        throw new Error(`Corriente corregida de ${corrienteCorregida.toFixed(1)} A por conductor excede la capacidad de 300 mm². Aumente los conductores en paralelo por fase.`);
    }

    if (material === 'aluminio') {
        advertencias.push('Ampacidad de aluminio estimada desde la tabla de cobre INPACO (factor √(R_Cu/R_Al) ≈ 0,78). Verificar con el catálogo del fabricante.');
    }

    const ampacidadCorregida = ampacidadSeleccionada * factorTotal;
    const margenSeguridad = ((ampacidadSeleccionada - corrienteCorregida) / corrienteCorregida * 100).toFixed(1);

    return {
        corriente: Math.round(corriente * 100) / 100,
        corrientePorConductor: Math.round(corrientePorConductor * 100) / 100,
        conductoresPorFase: nParalelo,
        conductoresCargados: nc,
        circuitosAgrupamiento: circuitos,
        factorDemanda: fdAplicado,
        factorTemperatura: Math.round(factorTemperatura * 1000) / 1000,
        factorAgrupamiento: Math.round(factorAgrupamiento * 1000) / 1000,
        factorResistividad: Math.round(factorResistividad * 1000) / 1000,
        corrienteCorregida: Math.round(corrienteCorregida * 100) / 100,
        seccion: seccionSeleccionada,
        ampacidad: ampacidadSeleccionada,
        // Iz: capacidad real del circuito en las condiciones de instalación (todas las ternas)
        capacidadCorregida: Math.round(ampacidadCorregida * nParalelo * 10) / 10,
        margenSeguridad,
        metodoUsado: metodo,
        advertencias
    };
}

// ===================================================================
// CAÍDA DE TENSIÓN AC
// ===================================================================

// Disposiciones con reactancia publicada en INPACO Tabla 15, y la relación dc/S que se usa
// para el efecto de proximidad. Las fuentes no dan el espesor de aislación, así que en
// conductores en contacto se toma el límite superior dc/S = 1 (conservador: con 300 mm² a
// 60 Hz queda ~3 % por encima de Mamede Tabla 3.22). En plano S = 2D ≥ 2·dc → dc/S ≤ 0,5.
const DISPOSICIONES_AC = {
    trebol:     { dcSobreS: () => 1 },
    tripolar:   { dcSobreS: () => 1 },
    plano_2D:   { dcSobreS: () => 0.5 },
    plano_20cm: { dcSobreS: (dc) => dc / 200 }
};

const FRECUENCIAS_AC = [50, 60]; // 50 Hz Paraguay (ANDE), 60 Hz Brasil

/**
 * Resistencia en corriente alterna a la temperatura de servicio (Ω/km).
 * INPACO 4.3.1 (IEC 60287-1-1): Rca = Rcct (1 + Ys + Yp), Ks = Kp = 1 (conductor circular,
 * aislación extruida).
 *   Xs² = Xp² = 8π·f·10⁻⁷ / R'   (R' en Ω/m)
 *   Ys = Xs⁴ / (192 + 0,8·Xs⁴)
 *   Yp (3 conductores) = F·(dc/S)²·[0,312·(dc/S)² + 1,18/(F + 0,27)],  F = Xp⁴/(192 + 0,8·Xp⁴)
 *   Yp (2 conductores) = F·(dc/S)²·2,9
 */
function calcularResistenciaAC(parametros) {
    const material = normalizarMaterial(parametros.materialCondutor);
    const seccion = parseFloat(parametros.seccion);
    const f = parseFloat(parametros.frecuencia) || 50;
    const disposicion = parametros.disposicion || 'trebol';
    if (!FRECUENCIAS_AC.includes(f)) throw new Error(`Frecuencia ${f} Hz no soportada (50 o 60 Hz)`);
    if (!DISPOSICIONES_AC[disposicion]) throw new Error(`Disposición ${disposicion} no reconocida`);

    const R20 = window.obtenerResistencia(material, seccion);
    const temperaturaConductor = temperaturaServicioConductor(parametros.aislamiento);
    const rt = R20 * (1 + ALFA_RESISTENCIA[material] * (temperaturaConductor - 20));

    const x2 = 8 * Math.PI * f * 1e-7 / (rt / 1000);
    const F = (x2 * x2) / (192 + 0.8 * x2 * x2);
    const ys = F;
    const dc = window.tabelasNBR.diametroConductor[seccion];
    if (dc === undefined) throw new Error(`Diámetro del conductor no disponible para ${seccion} mm²`);
    const r = DISPOSICIONES_AC[disposicion].dcSobreS(dc);
    const yp = parametros.conductoresCargados === 2
        ? F * r * r * 2.9
        : F * r * r * (0.312 * r * r + 1.18 / (F + 0.27));

    return { rt, rac: rt * (1 + ys + yp), ys, yp, R20, temperaturaConductor };
}

/**
 * Reactancia inductiva (Ω/km): INPACO Tabla 15 a 50 Hz según la disposición,
 * proporcional a la frecuencia.
 */
function obtenerReactanciaAC(seccion, disposicion, frecuencia) {
    const tabla = window.tabelasNBR.reactanciasINPACO50Hz[disposicion || 'trebol'];
    if (!tabla) throw new Error(`Disposición ${disposicion} no reconocida`);
    const x50 = tabla[parseFloat(seccion)];
    if (x50 === undefined) throw new Error(`Reactancia no disponible para ${seccion} mm²`);
    return x50 * (parseFloat(frecuencia) || 50) / 50;
}

/**
 * ΔV = k · I · L · (Rca·cosφ + X·senφ) / n   (INPACO 4.3, Mamede Ec. 3.18)
 *  k = 2 (mono/bifásico), √3 (trifásico)
 *  Rca: resistencia AC a 70 °C (PVC) o 90 °C (XLPE/EPR/HEPR), ver calcularResistenciaAC
 *  X: INPACO Tabla 15 según disposición y frecuencia
 *  n = conductores en paralelo por fase
 */
function calcularCaidaTensionAC(parametros) {
    const { corriente, tension, longitud, seccion, materialCondutor, tipoSistema, factorPotencia } = parametros;
    const n = Math.max(1, parseInt(parametros.conductoresPorFase, 10) || 1);
    const limite = parseFloat(parametros.limite) > 0 ? parseFloat(parametros.limite) : 4.0;
    const frecuencia = parseFloat(parametros.frecuencia) || 50;
    const disposicion = parametros.disposicion || 'trebol';

    if (!corriente || corriente <= 0) throw new Error('Corriente debe ser mayor que 0');
    if (!tension || tension <= 0) throw new Error('Tensión debe ser mayor que 0');
    if (!longitud || longitud <= 0) throw new Error('Longitud debe ser mayor que 0');
    if (!seccion || seccion <= 0) throw new Error('Sección debe ser mayor que 0');

    const seccionNum = parseFloat(seccion);
    const rac = calcularResistenciaAC({
        materialCondutor, seccion: seccionNum, aislamiento: parametros.aislamiento || 'PVC',
        frecuencia, disposicion, conductoresCargados: tipoSistema === 'trifasico' ? 3 : 2
    });
    const X = obtenerReactanciaAC(seccionNum, disposicion, frecuencia);

    const L_km = parseFloat(longitud) / 1000;
    const I = parseFloat(corriente);
    const fp = Math.min(1, Math.max(0, parseFloat(factorPotencia) || 1.0));
    const senFi = Math.sqrt(1 - fp * fp);
    const k = tipoSistema === 'trifasico' ? Math.sqrt(3) : 2;

    const caidaV = k * I * L_km * (rac.rac * fp + X * senFi) / n;
    const caidaPct = (caidaV / parseFloat(tension)) * 100;

    return {
        caidaTensionV: Math.round(caidaV * 100) / 100,
        caidaTensionPct: Math.round(caidaPct * 100) / 100,
        limite,
        cumple: caidaPct <= limite,
        resistencia: Math.round(rac.rac * 10000) / 10000,
        resistencia20C: rac.R20,
        temperaturaConductor: rac.temperaturaConductor,
        reactancia: Math.round(X * 10000) / 10000,
        frecuencia,
        disposicion
    };
}

/**
 * Menor sección de tabla que cumple el límite de caída de tensión.
 * Devuelve { seccion, caidaTensionPct } o null si ni 300 mm² alcanza.
 */
function calcularSeccionMinimaCaidaAC(parametros) {
    const material = normalizarMaterial(parametros.materialCondutor);
    for (const seccion of SECCIONES_TABLA) {
        if (material === 'aluminio' && seccion < 16) continue;
        const r = calcularCaidaTensionAC(Object.assign({}, parametros, { seccion }));
        if (r.cumple) return { seccion, caidaTensionPct: r.caidaTensionPct };
    }
    return null;
}

// ===================================================================
// CORTOCIRCUITO AC
// ===================================================================

/**
 * Constante K (A·√s/mm²) - NBR 5410 Tabla 30 / IEC 60364-5-54.
 * PVC: valores para ≤ 300 mm²; para > 300 mm² K es menor (103 Cu / 68 Al).
 */
function esAislacionPVC(aislamiento) {
    return window.claveAislacion(aislamiento || 'PVC') === 'PVC';
}

function obtenerConstanteK(material, aislamiento, seccion) {
    const mat = normalizarMaterial(material);
    const esPVC = esAislacionPVC(aislamiento);
    const grande = parseFloat(seccion) > 300;
    const tabla = {
        cobre:    { PVC: grande ? 103 : 115, EPR: 143 },
        aluminio: { PVC: grande ? 68 : 76,   EPR: 94 }
    };
    return tabla[mat][esPVC ? 'PVC' : 'EPR'];
}

function calcularCortocircuitoAC(parametros) {
    const { potenciaCortocircuito, tensionSistema, tiempoDespeje, seccion, materialCondutor, materialAislamiento } = parametros;

    if (!potenciaCortocircuito || potenciaCortocircuito <= 0) throw new Error('Potencia de cortocircuito debe ser mayor que 0');
    if (!tensionSistema || tensionSistema <= 0) throw new Error('Tensión del sistema debe ser mayor que 0');
    if (!tiempoDespeje || tiempoDespeje <= 0) throw new Error('Tiempo de despeje debe ser mayor que 0');

    // Icc = Scc / (√3 × V)  con Scc en MVA y V (tensión de línea) en kV → kA
    const Scc = parseFloat(potenciaCortocircuito);
    const V = parseFloat(tensionSistema);
    const Icc_kA = Scc / (Math.sqrt(3) * V);
    const Icc_A = Icc_kA * 1000;

    const K = obtenerConstanteK(materialCondutor, materialAislamiento, seccion);

    // Sección mínima (criterio adiabático, válido para t ≤ 5 s): S_min = Icc × √t / K
    const t = parseFloat(tiempoDespeje);
    const seccionMinima = (Icc_A * Math.sqrt(t)) / K;
    const seccionMinRedondeada = Math.round(seccionMinima * 100) / 100;

    const seccionElegida = parseFloat(seccion);
    const cumple = seccionElegida >= seccionMinima;

    // Menor sección comercial que cumple con SU propio K
    let seccionComercial = null;
    for (const s of SECCIONES_COMERCIALES) {
        if (s >= Icc_A * Math.sqrt(t) / obtenerConstanteK(materialCondutor, materialAislamiento, s)) {
            seccionComercial = s;
            break;
        }
    }

    return {
        corrienteCortocircuito: Math.round(Icc_kA * 100) / 100,
        corrienteCortocircuitoA: Math.round(Icc_A),
        seccionMinima: seccionMinRedondeada,
        seccionComercial,
        cumple,
        constanteK: K,
        seccionElegida
    };
}

// ===================================================================
// FUNCIONES DC
// ===================================================================

function calcularCorrenteDC(parametros) {
    if (!parametros.potencia || parametros.potencia <= 0) throw new Error('Potencia DC debe ser mayor que 0');
    if (!parametros.tension || parametros.tension <= 0) throw new Error('Tensión DC debe ser mayor que 0');
    const corriente = parametros.potencia / parametros.tension;
    if (corriente <= 0 || !isFinite(corriente)) throw new Error('Resultado de corriente DC inválido');
    return Math.round(corriente * 100) / 100;
}

/**
 * Resistencia DC corregida a la temperatura del conductor.
 * `temperatura` es la temperatura del CONDUCTOR (no la ambiente); si no se indica,
 * se usa la máxima de servicio de la aislación (70 °C PVC / 90 °C EPR), que es
 * el valor conservador para caída de tensión.
 */
function calcularResistenciaCorregida(parametros) {
    const { material, seccion, aislamiento } = parametros;
    if (!material) throw new Error('Material del conductor es requerido');
    if (!seccion || seccion <= 0) throw new Error('Sección debe ser mayor que 0');

    const temperatura = (parametros.temperatura !== undefined && !isNaN(parametros.temperatura))
        ? parseFloat(parametros.temperatura)
        : temperaturaServicioConductor(aislamiento);
    const mat = normalizarMaterial(material);
    const R20 = obtenerResistencia20C(mat, seccion, aislamiento);
    const alpha = ALFA_RESISTENCIA[mat];
    const R_temp = R20 * (1 + alpha * (temperatura - 20));

    return {
        R20: Math.round(R20 * 10000) / 10000,
        R_temp: Math.round(R_temp * 10000) / 10000,
        temperatura,
        alpha,
        factor_correccion: Math.round((1 + alpha * (temperatura - 20)) * 10000) / 10000
    };
}

function calcularCaidaTensionDC(parametros) {
    const { corriente, longitud, resistencia, Np, tension } = parametros;
    if (!corriente || corriente <= 0) throw new Error('Corriente DC debe ser mayor que 0');
    if (!longitud || longitud <= 0) throw new Error('Longitud debe ser mayor que 0');
    if (!resistencia || resistencia <= 0) throw new Error('Resistencia debe ser mayor que 0');
    if (!Np || Np <= 0) throw new Error('Número de conductores por polo debe ser mayor que 0');

    const longitud_km = longitud / 1000;
    const caidaTension = (2 * resistencia * corriente * longitud_km) / Np;
    let porcentajeCaida = 0;
    if (tension && tension > 0) {
        porcentajeCaida = (caidaTension / tension) * 100;
    }

    return {
        caidaTension: Math.round(caidaTension * 100) / 100,
        porcentajeCaida: Math.round(porcentajeCaida * 100) / 100,
        resistencia,
        Np,
        longitud_km,
        formula_usada: '2*R*I*L/Np'
    };
}

function obtenerTensionEfectiva(tensionSelector, tensionPersonalizada) {
    if (tensionSelector === 'personalizado') {
        if (!tensionPersonalizada || tensionPersonalizada <= 0) throw new Error('Tensión personalizada debe ser mayor que 0');
        return parseFloat(tensionPersonalizada);
    }
    const tension = parseFloat(tensionSelector);
    if (!tension || tension <= 0) throw new Error('Tensión seleccionada no válida');
    return tension;
}

/**
 * Corriente DC: directa (modo corriente) o P/V (modo potencia).
 */
function obtenerCorrienteDC(parametros, tension) {
    if (parametros.modoEntrada === 'corriente' || (parametros.corriente && !parametros.potencia)) {
        const I = parseFloat(parametros.corrienteDirecta !== undefined ? parametros.corrienteDirecta : parametros.corriente);
        if (!I || I <= 0) throw new Error('Corriente DC debe ser mayor que 0');
        return Math.round(I * 100) / 100;
    }
    return calcularCorrenteDC({ potencia: parseFloat(parametros.potencia), tension });
}

function dimensionarPorAmpacidadDC(parametros) {
    const { tensionSelector, tensionPersonalizada, material, temperatura, metodo, aislamiento } = parametros;
    // En modo corriente la tensión no interviene en la ampacidad
    const tension = parametros.modoEntrada === 'corriente' ? null : obtenerTensionEfectiva(tensionSelector, tensionPersonalizada);
    const corriente = obtenerCorrienteDC(parametros, tension);
    const factorTemperatura = calcularFactorTemperaturaDC({ material, temperatura, aislamiento, metodo });
    const circuitos = Math.max(1, parseInt(parametros.agrupamiento, 10) || 1);
    const factorAgrupamiento = window.obtenerFactorAgrupamento(metodo, circuitos);
    const corrienteCorregida = corriente / (factorTemperatura * factorAgrupamiento);
    const seccionInfo = seleccionarSeccionMinimaDC({ corrienteCorregida, material, metodo, aislamiento });
    const resistenciaInfo = calcularResistenciaCorregida({ material, seccion: seccionInfo.seccion, aislamiento });

    return {
        criterio: 'ampacidad',
        corriente,
        corrienteCorregida: Math.round(corrienteCorregida * 100) / 100,
        factorTemperatura,
        factorAgrupamiento,
        seccion: seccionInfo.seccion,
        ampacidad: seccionInfo.ampacidad,
        resistencia_mostrada: resistenciaInfo.R_temp,
        resistencia_20C: resistenciaInfo.R20,
        temperatura_conductor: resistenciaInfo.temperatura,
        factor_correccion_temp: resistenciaInfo.factor_correccion,
        margen_seguridad: seccionInfo.margemSeguranca
    };
}

function verificarCaidaTensionDC(parametros) {
    const { tensionSelector, tensionPersonalizada, longitud, conductoresPorPolo, seccion, material, aislamiento } = parametros;
    const tension = obtenerTensionEfectiva(tensionSelector, tensionPersonalizada);
    const corriente = obtenerCorrienteDC(parametros, tension);
    const resistenciaInfo = calcularResistenciaCorregida({ material, seccion, aislamiento });
    const caidaInfo = calcularCaidaTensionDC({ corriente, longitud, resistencia: resistenciaInfo.R_temp, Np: conductoresPorPolo, tension });
    const limite = determinarLimiteCaidaDC(tension, parametros.aplicacionDC);

    return {
        criterio: 'caida_tension',
        corriente,
        caida_tension_V: caidaInfo.caidaTension,
        caida_tension_pct: caidaInfo.porcentajeCaida,
        limite_pct: limite,
        cumple_criterio: caidaInfo.porcentajeCaida <= limite,
        resistencia_mostrada: resistenciaInfo.R_temp,
        resistencia_20C: resistenciaInfo.R20,
        temperatura_conductor: resistenciaInfo.temperatura,
        conductores_por_polo: conductoresPorPolo,
        formula_usada: caidaInfo.formula_usada,
        longitud_km: caidaInfo.longitud_km
    };
}

/**
 * Cortocircuito en bornes de un banco de baterías (sin resistencia del cable, conservador):
 *   Icc = V_banco / (N_serie × R_elemento)
 * resistenciaInterna: mΩ POR ELEMENTO (celda).
 */
function analizarCortocircuitoDC(parametros) {
    const { tipoBateria, elementosSerie, resistenciaInterna, tiempoDespeje, seccion, material, aislamiento } = parametros;
    const tensionElemento = obtenerTensionElementoBateria(tipoBateria);
    const n = parseInt(elementosSerie, 10);
    const tensionBanco = tensionElemento * n;
    const resistenciaBanco_mOhm = n * parseFloat(resistenciaInterna);
    const corrienteCortocircuito = tensionBanco / (resistenciaBanco_mOhm / 1000);
    const constanteK = obtenerConstanteKDC(material, aislamiento);
    const seccionMinima = (corrienteCortocircuito * Math.sqrt(tiempoDespeje)) / constanteK;
    const cumpleCriterio = seccion >= seccionMinima;

    return {
        criterio: 'cortocircuito',
        tension_banco: Math.round(tensionBanco * 100) / 100,
        resistencia_banco_mohm: Math.round(resistenciaBanco_mOhm * 1000) / 1000,
        corriente_cortocircuito: Math.round(corrienteCortocircuito),
        seccion_minima: Math.round(seccionMinima * 100) / 100,
        seccion_comercial: redondearSeccionComercial(seccionMinima),
        seccion_elegida: seccion,
        cumple_criterio: cumpleCriterio,
        constante_K: constanteK,
        tiempo_despeje: tiempoDespeje,
        margen_seguridad: cumpleCriterio ? ((seccion - seccionMinima) / seccionMinima * 100).toFixed(1) : 0
    };
}

// ===================================================================
// FUNCIONES AUXILIARES DC
// ===================================================================

/**
 * Factor de temperatura DC: mismas tablas que AC (INPACO Tabla 6, referencia 40 °C aire),
 * coherente con las ampacidades INPACO usadas en DC.
 */
function calcularFactorTemperaturaDC(parametros) {
    const { temperatura, aislamiento, metodo } = parametros;
    return window.obtenerFactorTemperatura(aislamiento || 'PVC', parseFloat(temperatura), metodo || 'B1', false);
}

function seleccionarSeccionMinimaDC(parametros) {
    const { corrienteCorregida, material, metodo, aislamiento } = parametros;
    for (const seccion of SECCIONES_TABLA) {
        let ampacidad;
        try {
            ampacidad = obtenerAmpacidadBaseDC(material, metodo, seccion, aislamiento);
        } catch (e) {
            continue;
        }
        if (ampacidad >= corrienteCorregida) {
            return { seccion, ampacidad, margemSeguranca: ((ampacidad - corrienteCorregida) / corrienteCorregida * 100).toFixed(1) };
        }
    }
    throw new Error(`No se encontró sección adecuada para corriente corregida ${corrienteCorregida.toFixed(1)} A (máx. 300 mm²). Use conductores en paralelo.`);
}

/**
 * Resistencia DC a 20 °C (Ω/km). Cobre: IEC 60228 clase 5 (cable flexible, habitual en
 * DC/baterías; algo mayor que la clase 2 usada en AC, del lado seguro). Aluminio: clase 2.
 * Si la sección no está en la tabla, se calcula con la resistividad IACS.
 */
function obtenerResistencia20C(material, seccion, aislamiento) {
    const matKey = normalizarMaterial(material);
    const tablas = window.tabelasDC && window.tabelasDC.resistenciasDC;
    if (tablas && tablas[matKey] && tablas[matKey][seccion] !== undefined) {
        return tablas[matKey][seccion];
    }
    const resistividades = { 'cobre': 0.017241, 'aluminio': 0.028264 };
    return (resistividades[matKey] * 1000) / seccion;
}

/**
 * Ampacidad DC (A): circuito DC = 2 conductores cargados. Usa las tablas INPACO
 * de la aislación indicada; aluminio vía √(R_Cu/R_Al) y sección mínima 16 mm².
 */
function obtenerAmpacidadBaseDC(material, metodo, seccion, aislamiento) {
    return obtenerAmpacidadConductor(aislamiento || 'PVC', metodo, seccion, 2, normalizarMaterial(material));
}

/**
 * Límite de caída DC: por aplicación si se indica (tabelasDC.limitesNormativosDC),
 * si no, criterio general por nivel de tensión.
 */
function determinarLimiteCaidaDC(tension, aplicacion) {
    const limites = window.tabelasDC && window.tabelasDC.limitesNormativosDC;
    if (aplicacion && aplicacion !== 'general' && limites && limites[aplicacion] !== undefined) {
        return limites[aplicacion];
    }
    if (tension <= 48) return 5.0;
    else if (tension <= 125) return 3.0;
    else return 2.0;
}

function obtenerTensionElementoBateria(tipo) {
    return { 'plomo-acido': 2.0, 'litio': 3.2, 'niquel-cadmio': 1.2 }[tipo] || 2.0;
}

function obtenerConstanteKDC(material, aislamiento) {
    const materialKey = normalizarMaterial(material);
    const constantesK = window.tabelasDC && window.tabelasDC.constantesK_DC;
    const esPVC = esAislacionPVC(aislamiento);
    const porDefecto = { cobre: { PVC: 115, EPR: 143 }, aluminio: { PVC: 76, EPR: 94 } };
    const tabla = (constantesK && constantesK[materialKey]) || porDefecto[materialKey];
    return tabla[esPVC ? 'PVC' : 'EPR'];
}

/**
 * Menor sección que cumple el límite de caída DC. Devuelve null si ni 300 mm² alcanza.
 */
function calcularSeccionParaCaidaDC(parametros) {
    const { tensionSelector, tensionPersonalizada, longitud, conductoresPorPolo, material, aislamiento } = parametros;
    const tension = obtenerTensionEfectiva(tensionSelector, tensionPersonalizada);
    const corriente = obtenerCorrienteDC(parametros, tension);
    const limite = determinarLimiteCaidaDC(tension, parametros.aplicacionDC);
    const caidaMaxima = (limite / 100) * tension;
    const longitud_km = longitud / 1000;
    const resistenciaMaxima = (caidaMaxima * conductoresPorPolo) / (2 * corriente * longitud_km);
    const mat = normalizarMaterial(material);

    for (const seccion of SECCIONES_TABLA) {
        if (mat === 'aluminio' && seccion < 16) continue;
        const resistenciaInfo = calcularResistenciaCorregida({ material: mat, seccion, aislamiento });
        if (resistenciaInfo.R_temp <= resistenciaMaxima) return seccion;
    }
    return null;
}

function dimensionarCompletoDC(parametros) {
    const resultados = { ampacidad: null, caida_tension: null, cortocircuito: null, seccion_final: null, criterio_restrictivo: null };
    if (parametros.ampacidad) resultados.ampacidad = dimensionarPorAmpacidadDC(parametros.ampacidad);
    if (parametros.caida_tension) resultados.caida_tension = verificarCaidaTensionDC(parametros.caida_tension);
    if (parametros.cortocircuito) resultados.cortocircuito = analizarCortocircuitoDC(parametros.cortocircuito);

    const secciones = [];
    if (resultados.ampacidad) secciones.push({ valor: resultados.ampacidad.seccion, criterio: 'ampacidad' });
    if (resultados.caida_tension && !resultados.caida_tension.cumple_criterio) {
        const s = calcularSeccionParaCaidaDC(parametros.caida_tension);
        if (s === null) throw new Error('Ninguna sección hasta 300 mm² cumple la caída de tensión: aumente conductores por polo.');
        secciones.push({ valor: s, criterio: 'caida_tension' });
    }
    if (resultados.cortocircuito) secciones.push({ valor: resultados.cortocircuito.seccion_comercial, criterio: 'cortocircuito' });

    if (secciones.length > 0) {
        const max = secciones.reduce((m, c) => c.valor > m.valor ? c : m);
        resultados.seccion_final = max.valor;
        resultados.criterio_restrictivo = max.criterio;
    }
    return resultados;
}

// ===================================================================
// FACTOR DE DEMANDA
// ===================================================================

function aplicarFactorDemanda(potenciaTotal, factorDemanda) {
    if (!factorDemanda || factorDemanda <= 0 || factorDemanda > 1) factorDemanda = 1.0;
    return potenciaTotal * factorDemanda;
}

// ===================================================================
// CONDUCTOR DE PROTECCIÓN (TIERRA) - NBR 5410 Tabla 58 / Mamede Tabla 3.25
// ===================================================================

/**
 * Sección del conductor de protección (PE):
 * Método 1: tabla NBR 5410 (S ≤ 16 → S; 16 < S ≤ 35 → 16; S > 35 → S/2)
 * Método 2: Spe = I × √t / K (si se dan datos de cortocircuito)
 * Retorna la mayor, redondeada a sección comercial.
 */
function calcularConductorProteccion(seccionFase, parametrosCC) {
    let seccionTabla;
    if (seccionFase <= 16) seccionTabla = seccionFase;
    else if (seccionFase <= 35) seccionTabla = 16;
    else seccionTabla = seccionFase / 2;

    // K para PE que forma parte de un cable multipolar o agrupado con los de fase
    // (NBR 5410 Tabla 55): PVC 115, EPR/XLPE/HEPR 143. Es el caso más desfavorable.
    let seccionCC = 0;
    if (parametrosCC && parametrosCC.corrienteCC && parametrosCC.tiempoDespeje) {
        const K = esAislacionPVC(parametrosCC.aislamiento) ? 115 : 143;
        seccionCC = (parametrosCC.corrienteCC * Math.sqrt(parametrosCC.tiempoDespeje)) / K;
    }

    const seccionNecesaria = Math.max(seccionTabla, seccionCC);
    const comercial = redondearSeccionComercial(seccionNecesaria);
    return comercial !== null ? comercial : seccionNecesaria;
}

// ===================================================================
// EXPORTACIONES
// ===================================================================

console.log('✅ Calculations.js R5 cargado - AC + DC con tablas INPACO');

window.SECCIONES_COMERCIALES = SECCIONES_COMERCIALES;
window.SECCIONES_TABLA = SECCIONES_TABLA;
window.redondearSeccionComercial = redondearSeccionComercial;
window.temperaturaServicioConductor = temperaturaServicioConductor;
window.convertirAWatts = convertirAWatts;
window.calcularCorrenteProyecto = calcularCorrenteProyecto;
window.calcularCorrenteCorregida = calcularCorrenteCorregida;
window.calcularCorrienteTransformador = calcularCorrienteTransformador;
window.obtenerConductoresCargados = obtenerConductoresCargados;
window.obtenerAmpacidadConductor = obtenerAmpacidadConductor;
window.dimensionarPorAmpacidadAC = dimensionarPorAmpacidadAC;
window.calcularResistenciaAC = calcularResistenciaAC;
window.obtenerReactanciaAC = obtenerReactanciaAC;
window.calcularCaidaTensionAC = calcularCaidaTensionAC;
window.calcularSeccionMinimaCaidaAC = calcularSeccionMinimaCaidaAC;
window.obtenerConstanteK = obtenerConstanteK;
window.calcularCortocircuitoAC = calcularCortocircuitoAC;
window.calcularCorrenteDC = calcularCorrenteDC;
window.calcularResistenciaCorregida = calcularResistenciaCorregida;
window.calcularCaidaTensionDC = calcularCaidaTensionDC;
window.obtenerTensionEfectiva = obtenerTensionEfectiva;
window.obtenerCorrienteDC = obtenerCorrienteDC;
window.dimensionarPorAmpacidadDC = dimensionarPorAmpacidadDC;
window.verificarCaidaTensionDC = verificarCaidaTensionDC;
window.analizarCortocircuitoDC = analizarCortocircuitoDC;
window.calcularFactorTemperaturaDC = calcularFactorTemperaturaDC;
window.seleccionarSeccionMinimaDC = seleccionarSeccionMinimaDC;
window.obtenerResistencia20C = obtenerResistencia20C;
window.obtenerAmpacidadBaseDC = obtenerAmpacidadBaseDC;
window.determinarLimiteCaidaDC = determinarLimiteCaidaDC;
window.obtenerTensionElementoBateria = obtenerTensionElementoBateria;
window.obtenerConstanteKDC = obtenerConstanteKDC;
window.dimensionarCompletoDC = dimensionarCompletoDC;
window.calcularSeccionParaCaidaDC = calcularSeccionParaCaidaDC;
window.obtenerSeccionMinimaNBR = obtenerSeccionMinimaNBR;
window.aplicarFactorDemanda = aplicarFactorDemanda;
window.calcularConductorProteccion = calcularConductorProteccion;

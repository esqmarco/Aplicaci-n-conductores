/**
 * CALCULATIONS.JS - FUNCIONES DE CÁLCULO COMPLETAS AC + DC
 * =========================================================
 * Versión R3 - Todas las funciones AC implementadas
 * - Fórmula bifásica corregida (√2)
 * - Conversión de unidades (W, kW, CV, HP)
 * - Dimensionamiento AC completo por ampacidad
 * - Caída de tensión AC
 * - Cortocircuito AC
 * - Modo transformador
 * - Todas las funciones DC mantenidas
 */

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
    let corriente = 0;

    switch (tipoSistema) {
        case 'monofasico':
            corriente = potencia / (tension * factorPotencia * rendimiento);
            break;
        case 'bifasico':
            // CORREGIDO: Fórmula bifásica con √2 según manual
            corriente = potencia / (tension * factorPotencia * rendimiento * Math.sqrt(2));
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

function dimensionarPorAmpacidadAC(parametros) {
    const {
        modoEntrada, potencia, unidadPotencia, corrienteDirecta, potenciaTransformadorKVA,
        tension, factorPotencia, tipoSistema, rendimiento,
        materialAislamento, materialCondutor, temperaturaAmbiente,
        metodoInstalacao, agrupamento, tipoCircuito
    } = parametros;

    // 1. Determinar corriente de proyecto según modo de entrada
    let corriente;
    if (modoEntrada === 'corriente') {
        corriente = parseFloat(corrienteDirecta);
        if (!corriente || corriente <= 0) throw new Error('Corriente directa debe ser mayor que 0');
    } else if (modoEntrada === 'transformador') {
        corriente = calcularCorrienteTransformador({
            potenciaKVA: parseFloat(potenciaTransformadorKVA),
            tension: parseFloat(tension),
            tipoSistema
        });
    } else {
        // Modo potencia (default)
        const potenciaW = convertirAWatts(parseFloat(potencia), unidadPotencia);
        corriente = calcularCorrenteProyecto({
            potencia: potenciaW,
            tension: parseFloat(tension),
            factorPotencia: parseFloat(factorPotencia),
            tipoSistema,
            rendimiento: parseFloat(rendimiento)
        });
    }

    // 2. Obtener factores de corrección de data-tables.js
    let factorTemperatura = 1.0;
    let factorAgrupamiento = 1.0;
    const metodo = metodoInstalacao;
    const esEnterrado = ['D', 'F', 'H', 'I'].includes(metodo);

    try {
        factorTemperatura = window.obtenerFactorTemperatura(
            materialAislamento,
            parseInt(temperaturaAmbiente),
            metodo,
            esEnterrado
        );
    } catch (e) {
        console.warn('Factor temperatura no encontrado, usando 1.0:', e.message);
    }

    try {
        factorAgrupamiento = window.obtenerFactorAgrupamento(metodo, parseInt(agrupamento));
    } catch (e) {
        console.warn('Factor agrupamiento no encontrado, usando 1.0:', e.message);
    }

    // 3. Calcular corriente corregida
    const corrienteCorregida = corriente / (factorTemperatura * factorAgrupamiento);

    // 4. Buscar sección mínima en tablas de ampacidad
    const secciones = window.tabelasNBR.seccionesNominales;
    const material = materialCondutor.toLowerCase();
    // Para aluminio, sección mínima es 16mm²
    const seccionMinimaMaterial = material === 'aluminio' ? 16 : 1.5;
    // Enforce NBR 5410 minimum section per circuit type
    const seccionMinimaNBR = tipoCircuito ? obtenerSeccionMinimaNBR(tipoCircuito) : 1.5;
    const seccionMinima = Math.max(seccionMinimaMaterial, seccionMinimaNBR);

    let seccionSeleccionada = null;
    let ampacidadSeleccionada = null;
    let metodoUsado = metodo;

    // Determinar método efectivo para la tabla de ampacidad
    // Algunos aislamientos (EPR_105) solo tienen métodos genéricos (A, B, H, I)
    // HEPR no tiene métodos H, I
    const metodosFallback = resolverMetodoAmpacidad(materialAislamento, metodo);

    for (const seccion of secciones) {
        if (seccion < seccionMinima) continue;
        let ampacidad = null;
        for (const met of metodosFallback) {
            try {
                ampacidad = window.obtenerAmpacidadBase(materialAislamento, met, seccion);
                metodoUsado = met;
                break;
            } catch (e) {
                continue;
            }
        }
        if (ampacidad !== null && ampacidad >= corrienteCorregida) {
            seccionSeleccionada = seccion;
            ampacidadSeleccionada = ampacidad;
            break;
        }
    }

    if (!seccionSeleccionada) {
        throw new Error('No se encontró sección adecuada. La corriente excede la capacidad máxima de las tablas.');
    }

    const margenSeguridad = ((ampacidadSeleccionada - corrienteCorregida) / corrienteCorregida * 100).toFixed(1);
    const usaFallback = metodoUsado !== metodo;
    const advertenciaFallback = usaFallback
        ? `Nota: No hay tabla para ${materialAislamento} método ${metodo}. Se usó método ${metodoUsado} como referencia conservadora.`
        : null;

    return {
        corriente: Math.round(corriente * 100) / 100,
        factorTemperatura: Math.round(factorTemperatura * 1000) / 1000,
        factorAgrupamiento: Math.round(factorAgrupamiento * 1000) / 1000,
        corrienteCorregida: Math.round(corrienteCorregida * 100) / 100,
        seccion: seccionSeleccionada,
        ampacidad: ampacidadSeleccionada,
        margenSeguridad,
        metodoUsado,
        advertenciaFallback
    };
}

// ===================================================================
// RESOLUCIÓN DE MÉTODO DE AMPACIDAD
// ===================================================================

/**
 * Resuelve qué método(s) buscar en las tablas de ampacidad.
 * EPR_105 solo tiene A, B, H, I - necesita mapeo desde métodos específicos.
 * Devuelve array ordenado de métodos a intentar (primero el exacto, luego fallbacks).
 */
function resolverMetodoAmpacidad(aislamiento, metodo) {
    // Primero intentar el método exacto
    const intentos = [metodo];

    // Mapeo de fallback para métodos genéricos (EPR_105 usa A, B en vez de A1, A2, etc.)
    const mapeoGenerico = {
        'A1': ['A'], 'A2': ['A'],
        'B1': ['B'], 'B2': ['B'],
        'D': ['H'],  // Enterrado directo → H (NBR enterrado directo)
        'F': ['H'],  // Enterrado en ducto → H
        'C': ['B', 'A'],  // Sobre pared → B como aproximación conservadora
        'E': ['B'],  // Aire libre → B
        'G': ['B'],  // Sobre aisladores → B
        'H': ['D'],  // H no existe en HEPR → usar D (enterrado INPACO)
        'I': ['H', 'D'],  // I no existe en HEPR → H o D
    };

    if (mapeoGenerico[metodo]) {
        intentos.push(...mapeoGenerico[metodo]);
    }

    return intentos;
}

// ===================================================================
// CAÍDA DE TENSIÓN AC
// ===================================================================

function calcularCaidaTensionAC(parametros) {
    const { corriente, tension, longitud, seccion, materialCondutor, tipoSistema, factorPotencia } = parametros;

    if (!corriente || corriente <= 0) throw new Error('Corriente debe ser mayor que 0');
    if (!tension || tension <= 0) throw new Error('Tensión debe ser mayor que 0');
    if (!longitud || longitud <= 0) throw new Error('Longitud debe ser mayor que 0');
    if (!seccion || seccion <= 0) throw new Error('Sección debe ser mayor que 0');

    // Reactance table (typical values in ohm/km for cables in conduit)
    const reactancias = {
        1.5: 0.115, 2.5: 0.110, 4: 0.107, 6: 0.100, 10: 0.094, 16: 0.090,
        25: 0.086, 35: 0.083, 50: 0.081, 70: 0.078, 95: 0.076, 120: 0.075,
        150: 0.073, 185: 0.072, 240: 0.071, 300: 0.070
    };

    // Obtener resistencia del conductor en Ω/km
    const material = materialCondutor.toLowerCase();
    const resistencia = window.obtenerResistencia(material, parseFloat(seccion));
    const L_km = parseFloat(longitud) / 1000;
    const I = parseFloat(corriente);
    const fp = parseFloat(factorPotencia) || 1.0;
    const seccionNum = parseFloat(seccion);

    let caidaV;

    if (seccionNum >= 50) {
        // For sections >= 50mm², include inductive reactance
        const X = reactancias[seccionNum] || 0.08; // fallback reactance
        const sinFi = Math.sqrt(1 - fp * fp);
        const impedanciaPorKm = resistencia * fp + X * sinFi;
        let k;
        switch (tipoSistema) {
            case 'trifasico':
                k = Math.sqrt(3);
                break;
            case 'bifasico':
            case 'monofasico': default:
                k = 2;
                break;
        }
        caidaV = k * I * L_km * impedanciaPorKm;
    } else {
        // For sections < 50mm², reactance is negligible
        // No multiplicar por fp aquí - ya está incluido en el cálculo de corriente
        switch (tipoSistema) {
            case 'trifasico':
                caidaV = Math.sqrt(3) * resistencia * I * L_km;
                break;
            case 'bifasico':
                caidaV = 2 * resistencia * I * L_km;
                break;
            case 'monofasico': default:
                caidaV = 2 * resistencia * I * L_km;
                break;
        }
    }

    const caidaPct = (caidaV / parseFloat(tension)) * 100;
    const limite = 4.0; // NBR 5410 default

    return {
        caidaTensionV: Math.round(caidaV * 100) / 100,
        caidaTensionPct: Math.round(caidaPct * 100) / 100,
        limite,
        cumple: caidaPct <= limite,
        resistencia: resistencia
    };
}

// ===================================================================
// CORTOCIRCUITO AC
// ===================================================================

function calcularCortocircuitoAC(parametros) {
    const { potenciaCortocircuito, tensionSistema, tiempoDespeje, seccion, materialCondutor, materialAislamiento } = parametros;

    if (!potenciaCortocircuito || potenciaCortocircuito <= 0) throw new Error('Potencia de cortocircuito debe ser mayor que 0');
    if (!tensionSistema || tensionSistema <= 0) throw new Error('Tensión del sistema debe ser mayor que 0');
    if (!tiempoDespeje || tiempoDespeje <= 0) throw new Error('Tiempo de despeje debe ser mayor que 0');

    // Icc = Scc / (√3 × V) donde Scc en MVA, V en kV → resultado en kA
    const Scc = parseFloat(potenciaCortocircuito); // MVA
    const V = parseFloat(tensionSistema); // kV
    const Icc_kA = Scc / (Math.sqrt(3) * V);
    const Icc_A = Icc_kA * 1000;

    // Constante K según material y aislamiento
    const constantesK = {
        cobre:    { PVC: 115, EPR: 143 },
        aluminio: { PVC: 76,  EPR: 94 }
    };
    const mat = materialCondutor.toLowerCase();
    const ais = materialAislamiento || 'PVC';
    const K = constantesK[mat]?.[ais] || 115;

    // Sección mínima: S_min = Icc × √t / K
    const t = parseFloat(tiempoDespeje);
    const seccionMinima = (Icc_A * Math.sqrt(t)) / K;
    const seccionMinRedondeada = Math.round(seccionMinima * 100) / 100;

    const seccionElegida = parseFloat(seccion);
    const cumple = seccionElegida >= seccionMinRedondeada;

    return {
        corrienteCortocircuito: Math.round(Icc_kA * 100) / 100,
        corrienteCortocircuitoA: Math.round(Icc_A),
        seccionMinima: seccionMinRedondeada,
        cumple,
        constanteK: K,
        seccionElegida
    };
}

// ===================================================================
// FUNCIONES DC (MANTENIDAS SIN CAMBIOS)
// ===================================================================

function calcularCorrenteDC(parametros) {
    if (!parametros.potencia || parametros.potencia <= 0) throw new Error('Potencia DC debe ser mayor que 0');
    if (!parametros.tension || parametros.tension <= 0) throw new Error('Tensión DC debe ser mayor que 0');
    const corriente = parametros.potencia / parametros.tension;
    if (corriente <= 0 || !isFinite(corriente)) throw new Error('Resultado de corriente DC inválido');
    return Math.round(corriente * 100) / 100;
}

function calcularResistenciaCorregida(parametros) {
    const { material, seccion, temperatura, aislamiento } = parametros;
    if (!material) throw new Error('Material del conductor es requerido');
    if (!seccion || seccion <= 0) throw new Error('Sección debe ser mayor que 0');

    const R20 = obtenerResistencia20C(material, seccion, aislamiento);
    const alpha = material.toLowerCase() === 'cobre' ? 0.00393 : 0.00403;
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

function dimensionarPorAmpacidadDC(parametros) {
    const { potencia, tensionSelector, tensionPersonalizada, material, temperatura, metodo, aislamiento } = parametros;
    const tension = obtenerTensionEfectiva(tensionSelector, tensionPersonalizada);
    const corriente = calcularCorrenteDC({ potencia, tension });
    const factorTemperatura = calcularFactorTemperaturaDC({ material, temperatura, aislamiento });
    const corrienteCorregida = corriente / factorTemperatura;
    const seccionInfo = seleccionarSeccionMinimaDC({ corrienteCorregida, material, metodo });
    const resistenciaInfo = calcularResistenciaCorregida({ material, seccion: seccionInfo.seccion, temperatura, aislamiento });

    return {
        criterio: 'ampacidad',
        corriente,
        corrienteCorregida,
        factorTemperatura,
        seccion: seccionInfo.seccion,
        ampacidad: seccionInfo.ampacidad,
        resistencia_mostrada: resistenciaInfo.R_temp,
        resistencia_20C: resistenciaInfo.R20,
        factor_correccion_temp: resistenciaInfo.factor_correccion,
        margen_seguridad: seccionInfo.margemSeguranca
    };
}

function verificarCaidaTensionDC(parametros) {
    const { potencia, tensionSelector, tensionPersonalizada, longitud, conductoresPorPolo, seccion, material, temperatura, aislamiento } = parametros;
    const tension = obtenerTensionEfectiva(tensionSelector, tensionPersonalizada);
    const corriente = calcularCorrenteDC({ potencia, tension });
    const resistenciaInfo = calcularResistenciaCorregida({ material, seccion, temperatura, aislamiento });
    const caidaInfo = calcularCaidaTensionDC({ corriente, longitud, resistencia: resistenciaInfo.R_temp, Np: conductoresPorPolo, tension });
    const limite = determinarLimiteCaidaDC(tension);

    return {
        criterio: 'caida_tension',
        corriente,
        caida_tension_V: caidaInfo.caidaTension,
        caida_tension_pct: caidaInfo.porcentajeCaida,
        limite_pct: limite,
        cumple_criterio: caidaInfo.porcentajeCaida <= limite,
        resistencia_mostrada: resistenciaInfo.R_temp,
        resistencia_20C: resistenciaInfo.R20,
        conductores_por_polo: conductoresPorPolo,
        formula_usada: caidaInfo.formula_usada,
        longitud_km: caidaInfo.longitud_km
    };
}

function analizarCortocircuitoDC(parametros) {
    const { tipoBateria, elementosSerie, capacidad, resistenciaInterna, tiempoDespeje, seccion, material, aislamiento } = parametros;
    const tensionElemento = obtenerTensionElementoBateria(tipoBateria);
    const tensionBanco = tensionElemento * elementosSerie;
    const corrienteCortocircuito = tensionBanco / (resistenciaInterna / 1000);
    const constanteK = obtenerConstanteKDC(material, aislamiento);
    const seccionMinima = (corrienteCortocircuito * Math.sqrt(tiempoDespeje)) / constanteK;
    const cumpleCriterio = seccion >= seccionMinima;

    return {
        criterio: 'cortocircuito',
        tension_banco: tensionBanco,
        corriente_cortocircuito: Math.round(corrienteCortocircuito),
        seccion_minima: Math.round(seccionMinima * 100) / 100,
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

function calcularFactorTemperaturaDC(parametros) {
    const { material, temperatura, aislamiento } = parametros;
    const aislamientoKey = (aislamiento || 'PVC').toUpperCase();
    const usarEPR = aislamientoKey.includes('EPR') || aislamientoKey === 'XLPE' || aislamientoKey === 'HEPR';

    // Try to use tables from data-tables.js first
    if (window.tabelasDC && window.tabelasDC.factoresTemperaturaDC) {
        const tablaKey = usarEPR ? 'EPR_XLPE' : 'PVC';
        const tablaFactores = window.tabelasDC.factoresTemperaturaDC[tablaKey];
        if (tablaFactores) {
            const temperaturas = Object.keys(tablaFactores).map(Number).sort((a, b) => a - b);
            if (temperatura <= temperaturas[0]) return tablaFactores[temperaturas[0]];
            if (temperatura >= temperaturas[temperaturas.length - 1]) return tablaFactores[temperaturas[temperaturas.length - 1]];

            for (let i = 0; i < temperaturas.length - 1; i++) {
                if (temperatura >= temperaturas[i] && temperatura <= temperaturas[i + 1]) {
                    const t1 = temperaturas[i], t2 = temperaturas[i + 1];
                    const f1 = tablaFactores[t1], f2 = tablaFactores[t2];
                    return Math.round((f1 + (f2 - f1) * (temperatura - t1) / (t2 - t1)) * 1000) / 1000;
                }
            }
            return 1.0;
        }
    }

    // Fallback: built-in tables differentiated by insulation type
    const factoresPVC = {
        10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00,
        35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50
    };
    const factoresEPR = {
        10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00,
        35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76,
        60: 0.71, 65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41
    };
    const tablaFactores = usarEPR ? factoresEPR : factoresPVC;

    const temperaturas = Object.keys(tablaFactores).map(Number).sort((a, b) => a - b);
    if (temperatura <= temperaturas[0]) return tablaFactores[temperaturas[0]];
    if (temperatura >= temperaturas[temperaturas.length - 1]) return tablaFactores[temperaturas[temperaturas.length - 1]];

    for (let i = 0; i < temperaturas.length - 1; i++) {
        if (temperatura >= temperaturas[i] && temperatura <= temperaturas[i + 1]) {
            const t1 = temperaturas[i], t2 = temperaturas[i + 1];
            const f1 = tablaFactores[t1], f2 = tablaFactores[t2];
            return Math.round((f1 + (f2 - f1) * (temperatura - t1) / (t2 - t1)) * 1000) / 1000;
        }
    }
    return 1.0;
}

function seleccionarSeccionMinimaDC(parametros) {
    const { corrienteCorregida, material, metodo } = parametros;
    const secciones = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
    for (const seccion of secciones) {
        const ampacidad = obtenerAmpacidadBaseDC(material, metodo, seccion);
        if (ampacidad >= corrienteCorregida) {
            return { seccion, ampacidad, margemSeguranca: ((ampacidad - corrienteCorregida) / corrienteCorregida * 100).toFixed(1) };
        }
    }
    throw new Error(`No se encontró sección adecuada para corriente ${corrienteCorregida}A`);
}

function obtenerResistencia20C(material, seccion, aislamiento) {
    const ais = (aislamiento || '').toString().toUpperCase();
    const usaTabla = ais.startsWith('EPR') || ais === 'XLPE' || ais === 'HEPR';
    if (usaTabla) {
        const tablas = window.tabelasDC && window.tabelasDC.resistenciasDC;
        const matKey = material.toLowerCase();
        if (tablas && tablas[matKey] && tablas[matKey][seccion] !== undefined) {
            return tablas[matKey][seccion];
        }
    }
    const resistividades = { 'cobre': 0.01724, 'aluminio': 0.02826 };
    const resistividad = resistividades[material.toLowerCase()];
    if (!resistividad) throw new Error(`Material ${material} no soportado`);
    return (resistividad * 1000) / seccion;
}

function obtenerAmpacidadBaseDC(material, metodo, seccion) {
    const ampacidades = {
        'cobre': {
            'A1': { 1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 68, 25: 89, 35: 110, 50: 134, 70: 171, 95: 207, 120: 239, 150: 272, 185: 310, 240: 364, 300: 419 },
            'B1': { 1.5: 17, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76, 25: 101, 35: 125, 50: 151, 70: 192, 95: 232, 120: 269, 150: 309, 185: 353, 240: 415, 300: 477 },
            'C':  { 1.5: 20, 2.5: 27, 4: 36, 6: 46, 10: 63, 16: 85, 25: 112, 35: 138, 50: 168, 70: 213, 95: 258, 120: 299, 150: 344, 185: 392, 240: 461, 300: 530 },
            'E':  { 1.5: 22, 2.5: 30, 4: 40, 6: 51, 10: 70, 16: 94, 25: 119, 35: 148, 50: 180, 70: 232, 95: 282, 120: 328, 150: 379, 185: 434, 240: 514, 300: 593 }
        },
        'aluminio': {
            'A1': { 1.5: 12, 2.5: 16, 4: 21, 6: 27, 10: 38, 16: 52, 25: 68, 35: 84, 50: 103, 70: 131, 95: 158, 120: 183, 150: 208, 185: 237, 240: 279, 300: 321 },
            'B1': { 1.5: 13, 2.5: 18, 4: 24, 6: 31, 10: 43, 16: 58, 25: 77, 35: 96, 50: 116, 70: 147, 95: 178, 120: 206, 150: 237, 185: 271, 240: 318, 300: 366 },
            'C':  { 1.5: 15, 2.5: 20, 4: 27, 6: 35, 10: 48, 16: 65, 25: 86, 35: 106, 50: 129, 70: 164, 95: 198, 120: 230, 150: 264, 185: 301, 240: 354, 300: 407 },
            'E':  { 1.5: 17, 2.5: 23, 4: 30, 6: 39, 10: 53, 16: 72, 25: 91, 35: 113, 50: 138, 70: 178, 95: 216, 120: 251, 150: 290, 185: 332, 240: 394, 300: 455 }
        }
    };
    const ampacidad = ampacidades[material.toLowerCase()]?.[metodo]?.[seccion];
    if (!ampacidad) throw new Error(`Ampacidad no encontrada para ${material}, método ${metodo}, sección ${seccion}mm²`);
    return ampacidad;
}

function determinarLimiteCaidaDC(tension) {
    if (tension <= 48) return 5.0;
    else if (tension <= 125) return 3.0;
    else return 2.0;
}

function obtenerTensionElementoBateria(tipo) {
    return { 'plomo-acido': 2.0, 'litio': 3.2, 'niquel-cadmio': 1.2 }[tipo] || 2.0;
}

function obtenerConstanteKDC(material, aislamiento) {
    const constantesK = window.tabelasDC?.constantesK_DC;
    if (!constantesK) return 115;
    const materialKey = material.toLowerCase();
    const mapeo = { 'EPR_90': 'EPR', 'EPR_105': 'EPR', 'HEPR': 'EPR' };
    const aislamientoFinal = mapeo[aislamiento] || aislamiento || 'PVC';
    return constantesK[materialKey]?.[aislamientoFinal] || 115;
}

function calcularSeccionParaCaidaDC(parametros) {
    const { potencia, tensionSelector, tensionPersonalizada, longitud, conductoresPorPolo, material, temperatura, aislamiento } = parametros;
    const tension = obtenerTensionEfectiva(tensionSelector, tensionPersonalizada);
    const corriente = calcularCorrenteDC({ potencia, tension });
    const limite = determinarLimiteCaidaDC(tension);
    const caidaMaxima = (limite / 100) * tension;
    const longitud_km = longitud / 1000;
    const resistenciaMaxima = (caidaMaxima * conductoresPorPolo) / (2 * corriente * longitud_km);
    const secciones = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

    for (const seccion of secciones) {
        const resistenciaInfo = calcularResistenciaCorregida({ material, seccion, temperatura, aislamiento });
        if (resistenciaInfo.R_temp <= resistenciaMaxima) return seccion;
    }
    return 300;
}

function dimensionarCompletoDC(parametros) {
    const resultados = { ampacidad: null, caida_tension: null, cortocircuito: null, seccion_final: null, criterio_restrictivo: null };
    if (parametros.ampacidad) resultados.ampacidad = dimensionarPorAmpacidadDC(parametros.ampacidad);
    if (parametros.caida_tension) resultados.caida_tension = verificarCaidaTensionDC(parametros.caida_tension);
    if (parametros.cortocircuito) resultados.cortocircuito = analizarCortocircuitoDC(parametros.cortocircuito);

    const secciones = [];
    if (resultados.ampacidad) secciones.push({ valor: resultados.ampacidad.seccion, criterio: 'ampacidad' });
    if (resultados.caida_tension && !resultados.caida_tension.cumple_criterio) {
        secciones.push({ valor: calcularSeccionParaCaidaDC(parametros.caida_tension), criterio: 'caida_tension' });
    }
    if (resultados.cortocircuito) secciones.push({ valor: resultados.cortocircuito.seccion_minima, criterio: 'cortocircuito' });

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
// CONDUCTOR DE PROTECCIÓN (TIERRA) - NBR 5410 Tabla 58
// ===================================================================

function calcularConductorProteccion(seccionFase) {
    // NBR 5410 Table 58
    if (seccionFase <= 16) return seccionFase;           // Same as phase
    if (seccionFase <= 35) return 16;                     // 16mm²
    return seccionFase / 2;                               // Half of phase
}

// ===================================================================
// EXPORTACIONES
// ===================================================================

console.log('✅ Calculations.js R4 cargado - AC completo + DC + Phase 1 improvements');

window.convertirAWatts = convertirAWatts;
window.calcularCorrenteProyecto = calcularCorrenteProyecto;
window.calcularCorrenteCorregida = calcularCorrenteCorregida;
window.calcularCorrienteTransformador = calcularCorrienteTransformador;
window.dimensionarPorAmpacidadAC = dimensionarPorAmpacidadAC;
window.calcularCaidaTensionAC = calcularCaidaTensionAC;
window.calcularCortocircuitoAC = calcularCortocircuitoAC;
window.calcularCorrenteDC = calcularCorrenteDC;
window.calcularResistenciaCorregida = calcularResistenciaCorregida;
window.calcularCaidaTensionDC = calcularCaidaTensionDC;
window.obtenerTensionEfectiva = obtenerTensionEfectiva;
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

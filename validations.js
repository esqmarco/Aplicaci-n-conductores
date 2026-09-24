/**
 * VALIDATIONS.JS - Validación de entradas por pestaña (AC y DC).
 * Un campo vacío o fuera de rango es un error: nunca se reemplaza por un valor por defecto.
 */

// ===================================================================
// VALIDACIONES DC POR PESTAÑA
// ===================================================================

/**
 * Valida parámetros para pestaña Ampacidad DC
 */
function validarParametrosAmpacidadDC(params) {
    const errores = [];
    const advertencias = [];

    try {
        if (params.modoEntrada === 'corriente') {
            // Validar corriente conocida (la tensión no interviene en la ampacidad)
            if (!params.corrienteDirecta || isNaN(params.corrienteDirecta) || params.corrienteDirecta <= 0) {
                errores.push('Corriente DC es requerida y debe ser mayor que 0');
            }
        } else {
            // Validar potencia DC
            if (!params.potencia || isNaN(params.potencia)) {
                errores.push('Potencia DC es requerida y debe ser numérica');
            } else {
                const potencia = parseFloat(params.potencia);
                if (potencia <= 0) {
                    errores.push('Potencia DC debe ser mayor que 0');
                } else if (potencia > 1000000) { // 1 MW
                    errores.push('Potencia DC debe ser menor que 1MW');
                } else if (potencia < 1) {
                    advertencias.push('Potencia DC muy baja, verificar unidades');
                }
            }

            // Validar tensión DC (incluyendo personalizada)
            const validacionTension = validarTensionDC(params.tensionSelector, params.tensionPersonalizada);
            if (!validacionTension.valido) {
                errores.push(...validacionTension.errores);
            }
            advertencias.push(...validacionTension.advertencias);
        }

        // Validar material del conductor
        if (!params.material) {
            errores.push('Material del conductor es requerido');
        } else if (!['cobre', 'aluminio'].includes(params.material.toLowerCase())) {
            errores.push('Material debe ser cobre o aluminio');
        }

        // Validar temperatura ambiente
        if (params.temperatura === undefined || isNaN(params.temperatura)) {
            errores.push('Temperatura ambiente es requerida y debe ser numérica');
        } else {
            const temp = parseFloat(params.temperatura);
            if (temp < -20 || temp > 80) {
                errores.push('Temperatura ambiente debe estar entre -20°C y 80°C');
            } else if (temp > 60) {
                advertencias.push('Temperatura ambiente muy alta, verificar condiciones');
            }
        }

        // Validar método de instalación
        if (!params.metodo) {
            errores.push('Método de instalación es requerido');
        } else if (!['A1', 'A2', 'B1', 'B2', 'C', 'D', 'E', 'F'].includes(params.metodo)) {
            errores.push('Método de instalación no válido para DC');
        } else if (params.metodo === 'D') {
            if (!['ducto', 'directo'].includes(params.tipoEnterrado)) errores.push('Método D: tipo de instalación enterrada es requerido');
            if (!(typeof params.resistividadSuelo === 'number' && params.resistividadSuelo > 0)) errores.push('Método D: resistividad térmica del suelo es requerida');
        }

        // Tipo de carga: motor DC al 125 % (Itaipu R1A §10.3.2); en modo potencia pide el rendimiento
        if (!['general', 'motor'].includes(params.tipoCarga)) {
            errores.push('Tipo de carga DC es requerido');
        } else if (params.tipoCarga === 'motor' && params.modoEntrada !== 'corriente') {
            const eta = params.rendimiento;
            if (!(typeof eta === 'number' && eta > 0 && eta <= 1)) {
                errores.push('Motor DC: el rendimiento es requerido (mayor que 0 y hasta 1); la potencia de placa es mecánica');
            }
        }

        validarCircuitosAgrupados(params.agrupamiento, errores);

        return {
            valido: errores.length === 0,
            errores: errores,
            advertencias: advertencias
        };
    } catch (error) {
        return {
            valido: false,
            errores: [`Error en validación de ampacidad DC: ${error.message}`],
            advertencias: []
        };
    }
}

/**
 * Valida parámetros para pestaña Caída de Tensión DC
 */
function validarParametrosCaidaTensionDC(params) {
    const errores = [];
    const advertencias = [];

    try {
        // Validar corriente DC
        if (!params.corriente || isNaN(params.corriente) || params.corriente <= 0) {
            errores.push('Corriente DC es requerida y debe ser mayor que 0');
        }

        // Validar tensión DC (incluyendo personalizada)
        const validacionTension = validarTensionDC(params.tensionSelector, params.tensionPersonalizada);
        if (!validacionTension.valido) {
            errores.push(...validacionTension.errores);
        }
        advertencias.push(...validacionTension.advertencias);

        // Validar longitud del circuito
        if (!params.longitud || isNaN(params.longitud)) {
            errores.push('Longitud del circuito es requerida y debe ser numérica');
        } else {
            const longitud = parseFloat(params.longitud);
            if (longitud <= 0) {
                errores.push('Longitud del circuito debe ser mayor que 0');
            } else if (longitud > 10000) {
                errores.push('Longitud del circuito debe ser menor que 10km');
            } else if (longitud > 1000) {
                advertencias.push('Longitud muy grande, verificar viabilidad técnica');
            }
        }

        // Validar conductores por polo (Np)
        if (!params.conductoresPorPolo || isNaN(params.conductoresPorPolo)) {
            errores.push('Número de conductores por polo es requerido');
        } else {
            const Np = parseInt(params.conductoresPorPolo);
            if (Np < 1 || Np > 5) {
                errores.push('Número de conductores por polo debe estar entre 1 y 5');
            }
        }

        // Validar sección del conductor
        if (!params.seccion || isNaN(params.seccion)) {
            errores.push('Sección del conductor es requerida');
        } else {
            const seccion = parseFloat(params.seccion);
            const seccionesValidas = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
            if (!seccionesValidas.includes(seccion)) {
                errores.push('Sección del conductor no es estándar');
            }
        }

        // Validar material del conductor
        if (!params.material) {
            errores.push('Material del conductor es requerido');
        } else if (!['cobre', 'aluminio'].includes(params.material.toLowerCase())) {
            errores.push('Material debe ser cobre o aluminio');
        } else if (params.material.toLowerCase() === 'aluminio' && parseFloat(params.seccion) < 16) {
            errores.push('Aluminio: sección mínima 16 mm²');
        }

        if (params.clase && !['rigido', 'flexible'].includes(params.clase)) {
            errores.push('Clase del conductor debe ser rígido o flexible');
        } else if (params.clase === 'flexible' && params.material && params.material.toLowerCase() === 'aluminio') {
            errores.push('No existe conductor de aluminio flexible: elegir rígido (clase 2)');
        }

        // Tramo DC (define el límite de caída, Itaipu R1A §10.3.2)
        const limites = (typeof window !== 'undefined' && window.tabelasDC && window.tabelasDC.limitesCaidaDC) || {};
        if (!Object.prototype.hasOwnProperty.call(limites, params.aplicacionDC)) {
            errores.push('Tramo DC es requerido: batería → carga o cargador → batería');
        }

        if (!['potencia', 'control_solenoide', 'control'].includes(params.tipoCable)) {
            errores.push('Tipo de cable es requerido');
        }

        return {
            valido: errores.length === 0,
            errores: errores,
            advertencias: advertencias
        };
    } catch (error) {
        return {
            valido: false,
            errores: [`Error en validación de caída de tensión DC: ${error.message}`],
            advertencias: []
        };
    }
}

/**
 * Valida parámetros para pestaña Cortocircuito DC
 */
function validarParametrosCortocircuitoDC(params) {
    const errores = [];
    const advertencias = [];

    try {
        // Validar tipo de batería
        if (!params.tipoBateria) {
            errores.push('Tipo de batería es requerido');
        } else if (!['plomo-acido', 'litio', 'niquel-cadmio'].includes(params.tipoBateria)) {
            errores.push('Tipo de batería no válido');
        }

        // Validar elementos en serie
        if (!params.elementosSerie || isNaN(params.elementosSerie)) {
            errores.push('Número de elementos en serie es requerido');
        } else {
            const elementos = parseInt(params.elementosSerie);
            if (elementos < 1 || elementos > 200) {
                errores.push('Número de elementos en serie debe estar entre 1 y 200');
            } else if (elementos > 100) {
                advertencias.push('Número alto de elementos, verificar configuración');
            }
        }

        // Validar capacidad de la batería
        if (!params.capacidad || isNaN(params.capacidad)) {
            errores.push('Capacidad de la batería es requerida');
        } else {
            const capacidad = parseFloat(params.capacidad);
            if (capacidad <= 0) {
                errores.push('Capacidad de la batería debe ser mayor que 0');
            } else if (capacidad > 10000) {
                errores.push('Capacidad de la batería debe ser menor que 10,000 Ah');
            }
        }

        // Validar resistencia interna
        if (!params.resistenciaInterna || isNaN(params.resistenciaInterna)) {
            errores.push('Resistencia interna es requerida');
        } else {
            const resistencia = parseFloat(params.resistenciaInterna);
            if (resistencia <= 0) {
                errores.push('Resistencia interna debe ser mayor que 0');
            } else if (resistencia > 100) {
                errores.push('Resistencia interna por elemento debe ser menor que 100 mΩ');
            } else if (resistencia < 0.05) {
                advertencias.push('Resistencia interna por elemento muy baja, verificar especificación');
            }
        }

        // Validar tiempo de despeje
        if (!params.tiempoDespeje || isNaN(params.tiempoDespeje)) {
            errores.push('Tiempo de despeje es requerido');
        } else {
            const tiempo = parseFloat(params.tiempoDespeje);
            if (tiempo < 0.01 || tiempo > 5) {
                errores.push('Tiempo de despeje debe estar entre 0.01 s y 5 s (validez del criterio adiabático)');
            }
        }

        // Validar sección del conductor
        if (!params.seccion || isNaN(params.seccion)) {
            errores.push('Sección del conductor es requerida');
        } else {
            const seccion = parseFloat(params.seccion);
            const seccionesValidas = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
            if (!seccionesValidas.includes(seccion)) {
                errores.push('Sección del conductor no es estándar');
            }
        }

        // Validar material del conductor
        if (!params.material) {
            errores.push('Material del conductor es requerido');
        } else if (!['cobre', 'aluminio'].includes(params.material.toLowerCase())) {
            errores.push('Material debe ser cobre o aluminio');
        }

        // Validar aislamiento
        if (!params.aislamiento) {
            errores.push('Material de aislamiento es requerido');
        } else {
            const aislamientoValido = ['PVC', 'EPR', 'EPR_90', 'HEPR', 'XLPE', 'EPR_XLPE'];
            if (!aislamientoValido.includes(params.aislamiento)) {
                errores.push('Material de aislamiento no válido');
            }
        }

        return {
            valido: errores.length === 0,
            errores: errores,
            advertencias: advertencias
        };
    } catch (error) {
        return {
            valido: false,
            errores: [`Error en validación de cortocircuito DC: ${error.message}`],
            advertencias: []
        };
    }
}

// ===================================================================
// VALIDACIÓN DE TENSIÓN PERSONALIZABLE
// ===================================================================

/**
 * Valida tensión DC (predefinida o personalizada)
 */
function validarTensionDC(tensionSelector, tensionPersonalizada) {
    const errores = [];
    const advertencias = [];

    try {
        if (!tensionSelector) {
            errores.push('Tensión DC es requerida');
            return { valido: false, errores, advertencias };
        }

        if (tensionSelector === 'personalizado') {
            // Validar tensión personalizada
            if (!tensionPersonalizada || isNaN(tensionPersonalizada)) {
                errores.push('Tensión personalizada es requerida y debe ser numérica');
            } else {
                const tension = parseFloat(tensionPersonalizada);
                if (tension < 1 || tension > 1000) {
                    errores.push('Tensión personalizada debe estar entre 1V y 1000V');
                } else if (tension < 12) {
                    advertencias.push('Tensión muy baja, verificar aplicación');
                } else if (tension > 500) {
                    advertencias.push('Tensión alta, verificar seguridad y normativas');
                }
                
                // Verificar si es una tensión estándar
                const tensionesEstandar = [12, 24, 48, 110, 125, 220, 250, 380, 500];
                if (tensionesEstandar.includes(tension)) {
                    advertencias.push(`Tensión ${tension}V es estándar, puede usar selector predefinido`);
                }
            }
        } else {
            // Validar tensión predefinida
            const tension = parseFloat(tensionSelector);
            if (isNaN(tension) || tension <= 0) {
                errores.push('Tensión seleccionada no válida');
            } else {
                const tensionesValidas = [12, 24, 48, 110, 125, 220, 250, 380, 500];
                if (!tensionesValidas.includes(tension)) {
                    errores.push('Tensión seleccionada no está en la lista válida');
                }
            }
        }

        return {
            valido: errores.length === 0,
            errores: errores,
            advertencias: advertencias
        };
    } catch (error) {
        return {
            valido: false,
            errores: [`Error en validación de tensión DC: ${error.message}`],
            advertencias: []
        };
    }
}

// ===================================================================
// VALIDACIONES AC POR PESTAÑA
// ===================================================================

/**
 * Número de circuitos agrupados: entero ≥ 1. Un campo vacío es un error:
 * tomarlo como 1 circuito daría el factor más alto (del lado inseguro).
 */
function validarCircuitosAgrupados(valor, errores) {
    const n = Number(valor);
    if (valor === '' || valor === null || valor === undefined || !Number.isInteger(n) || n < 1) {
        errores.push('Circuitos agrupados es requerido y debe ser un entero mayor o igual a 1');
    }
}

/**
 * Valida parámetros de la pestaña Proyecto AC (ampacidad)
 */
function validarParametrosAmpacidadAC(params) {
    const errores = [];
    const advertencias = [];
    const positivo = (v) => typeof v === 'number' && !isNaN(v) && v > 0;
    const fraccion = (v) => positivo(v) && v <= 1.0;

    if (params.modoEntrada === 'corriente') {
        if (!positivo(params.corrienteDirecta)) errores.push('Corriente es requerida y debe ser mayor que 0');
    } else if (params.modoEntrada === 'transformador') {
        if (!positivo(params.potenciaTransformadorKVA)) errores.push('Potencia del transformador (kVA) es requerida y debe ser mayor que 0');
    } else {
        if (!positivo(params.potencia)) errores.push('Potencia es requerida y debe ser mayor que 0');
        if (!(positivo(params.factorPotencia) && params.factorPotencia >= 0.1 && params.factorPotencia <= 1.0)) {
            errores.push('Factor de potencia es requerido y debe estar entre 0,1 y 1,0');
        }
        if (!fraccion(params.rendimiento)) errores.push('Rendimiento es requerido: mayor que 0 y como máximo 1,0');
        if (!fraccion(params.factorDemanda)) errores.push('Factor de demanda es requerido: mayor que 0 y como máximo 1,0');
    }
    if (!positivo(params.tension)) errores.push('Tensión es requerida');
    if (typeof params.temperaturaAmbiente !== 'number' || isNaN(params.temperaturaAmbiente)) {
        errores.push('Temperatura ambiente es requerida y debe ser numérica');
    }
    validarCircuitosAgrupados(params.agrupamento, errores);

    return { valido: errores.length === 0, errores, advertencias };
}

/**
 * Valida parámetros de caída de tensión AC
 */
/**
 * Partida de motor (pestaña Caída AC). Todo campo del bloque activo es requerido.
 */
function validarParametrosPartida(p, material, errores) {
    const num = (v) => typeof v === 'number' && !isNaN(v);
    if (!(num(p.relacionIp) && p.relacionIp >= 1 && p.relacionIp <= 12)) errores.push('Partida: Ip/In es requerido, entre 1 y 12');
    if (!(num(p.fpPartida) && p.fpPartida > 0 && p.fpPartida <= 1)) errores.push('Partida: cosφ de partida es requerido, mayor que 0 y hasta 1');
    if (!(num(p.limite) && p.limite > 0)) errores.push('Partida: límite es requerido');
    const o = p.otrasCargas || {};
    if (!(num(o.corriente) && o.corriente >= 0)) errores.push('Partida: corriente de otras cargas es requerida (0 si no hay)');
    else if (o.corriente > 0 && !(num(o.factorPotencia) && o.factorPotencia > 0 && o.factorPotencia <= 1)) {
        errores.push('Partida: cosφ de las otras cargas es requerido, mayor que 0 y hasta 1');
    }
    if (p.alimentador) {
        const a = p.alimentador;
        if (!(num(a.longitud) && a.longitud > 0)) errores.push('Partida: longitud del alimentador es requerida');
        if (!(num(a.seccion) && a.seccion > 0)) errores.push('Partida: sección del alimentador es requerida');
        else if (material && material.toLowerCase() === 'aluminio' && a.seccion < 16) errores.push('Partida: alimentador de aluminio, sección mínima 16 mm²');
        if (!(num(a.conductoresPorFase) && a.conductoresPorFase >= 1)) errores.push('Partida: conductores en paralelo del alimentador es requerido');
    }
    if (p.trafo) {
        if (!(num(p.trafo.potenciaKVA) && p.trafo.potenciaKVA > 0)) errores.push('Partida: potencia del transformador es requerida');
        if (!(num(p.trafo.impedanciaPct) && p.trafo.impedanciaPct > 0 && p.trafo.impedanciaPct < 30)) errores.push('Partida: impedancia del transformador es requerida, entre 0 y 30 %');
    }
}

function validarParametrosCaidaTensionAC(params) {
    const errores = [];
    const advertencias = [];

    try {
        // Validar corriente
        if (!params.corriente || isNaN(params.corriente)) {
            errores.push('Corriente es requerida y debe ser numérica');
        } else {
            const corriente = parseFloat(params.corriente);
            if (corriente <= 0) {
                errores.push('Corriente debe ser mayor que 0');
            }
        }

        // Validar tensión
        if (!params.tension || isNaN(params.tension)) {
            errores.push('Tensión es requerida y debe ser numérica');
        } else {
            const tension = parseFloat(params.tension);
            const tensionesValidas = [127, 220, 380, 440, 600, 750, 1000];
            if (!tensionesValidas.includes(tension)) {
                errores.push(`Tensión debe ser una de: ${tensionesValidas.join(', ')} V`);
            }
        }

        // Validar longitud
        if (!params.longitud || isNaN(params.longitud)) {
            errores.push('Longitud es requerida y debe ser numérica');
        } else {
            const longitud = parseFloat(params.longitud);
            if (longitud <= 0) {
                errores.push('Longitud debe ser mayor que 0');
            } else if (longitud >= 10000) {
                errores.push('Longitud debe ser menor que 10,000 m');
            } else if (longitud > 1000) {
                advertencias.push('Longitud muy grande, verificar viabilidad técnica');
            }
        }

        // Validar sección del conductor
        if (!params.seccion || isNaN(params.seccion)) {
            errores.push('Sección del conductor es requerida');
        } else {
            const seccion = parseFloat(params.seccion);
            const seccionesValidas = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
            if (!seccionesValidas.includes(seccion)) {
                errores.push('Sección del conductor no es estándar');
            }
        }

        // Validar tipo de sistema
        if (!params.tipoSistema) {
            errores.push('Tipo de sistema es requerido');
        } else if (!['monofasico', 'bifasico', 'trifasico'].includes(params.tipoSistema)) {
            errores.push('Tipo de sistema debe ser monofásico, bifásico o trifásico');
        }

        // Validar factor de potencia
        if (!params.factorPotencia || isNaN(params.factorPotencia)) {
            errores.push('Factor de potencia es requerido y debe ser numérico');
        } else {
            const fp = parseFloat(params.factorPotencia);
            if (fp < 0.1 || fp > 1.0) {
                errores.push('Factor de potencia debe estar entre 0.1 y 1.0');
            } else if (fp < 0.7) {
                advertencias.push('Factor de potencia bajo, considerar corrección');
            }
        }

        // Validar material del conductor
        if (!params.material) {
            errores.push('Material del conductor es requerido');
        } else if (!['cobre', 'aluminio'].includes(params.material.toLowerCase())) {
            errores.push('Material debe ser cobre o aluminio');
        } else if (params.material.toLowerCase() === 'aluminio' && parseFloat(params.seccion) < 16) {
            errores.push('Aluminio: sección mínima 16 mm²');
        }

        if (params.clase && !['rigido', 'flexible'].includes(params.clase)) {
            errores.push('Clase del conductor debe ser rígido o flexible');
        } else if (params.clase === 'flexible' && params.material && params.material.toLowerCase() === 'aluminio') {
            errores.push('No existe conductor de aluminio flexible: elegir rígido (clase 2)');
        }

        if (params.partida) validarParametrosPartida(params.partida, params.material, errores);

        if (!['potencia', 'control_solenoide', 'control'].includes(params.tipoCable)) {
            errores.push('Tipo de cable es requerido');
        }

        return {
            valido: errores.length === 0,
            errores: errores,
            advertencias: advertencias
        };
    } catch (error) {
        return {
            valido: false,
            errores: [`Error en validación de caída de tensión AC: ${error.message}`],
            advertencias: []
        };
    }
}

/**
 * Valida parámetros de cortocircuito AC
 */
function validarParametrosCortocircuitoAC(params) {
    const errores = [];
    const advertencias = [];

    try {
        // Validar potencia de cortocircuito
        if (!params.potenciaCortocircuito || isNaN(params.potenciaCortocircuito)) {
            errores.push('Potencia de cortocircuito es requerida y debe ser numérica');
        } else {
            const potencia = parseFloat(params.potenciaCortocircuito);
            if (potencia <= 0) {
                errores.push('Potencia de cortocircuito debe ser mayor que 0');
            } else if (potencia >= 10000) {
                errores.push('Potencia de cortocircuito debe ser menor que 10,000 MVA');
            } else if (potencia > 5000) {
                advertencias.push('Potencia de cortocircuito muy alta, verificar datos del sistema');
            }
        }

        // Validar tensión del sistema
        if (!params.tensionSistema || isNaN(params.tensionSistema)) {
            errores.push('Tensión del sistema es requerida y debe ser numérica');
        } else {
            const tension = parseFloat(params.tensionSistema);
            if (tension <= 0) {
                errores.push('Tensión del sistema debe ser mayor que 0');
            } else if (params.potenciaCortocircuito > 0) {
                // tensionSistema en kV → Icc en kA
                const icc = params.potenciaCortocircuito / (Math.sqrt(3) * tension);
                if (tension <= 1 && icc > 100) {
                    advertencias.push(`Icc = ${icc.toFixed(1)} kA es muy alta para baja tensión: verificar que la potencia de cortocircuito (MVA) corresponda a este punto del sistema`);
                }
            }
        }

        // Validar tiempo de despeje
        if (!params.tiempoDespeje || isNaN(params.tiempoDespeje)) {
            errores.push('Tiempo de despeje es requerido y debe ser numérico');
        } else {
            const tiempo = parseFloat(params.tiempoDespeje);
            if (tiempo < 0.01 || tiempo > 5) {
                errores.push('Tiempo de despeje debe estar entre 0.01 s y 5 s (validez del criterio adiabático)');
            }
        }

        // Validar sección del conductor
        if (!params.seccion || isNaN(params.seccion)) {
            errores.push('Sección del conductor es requerida');
        } else {
            const seccion = parseFloat(params.seccion);
            const seccionesValidas = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
            if (!seccionesValidas.includes(seccion)) {
                errores.push('Sección del conductor no es estándar');
            }
        }

        // Validar material del conductor
        if (!params.material) {
            errores.push('Material del conductor es requerido');
        } else if (!['cobre', 'aluminio'].includes(params.material.toLowerCase())) {
            errores.push('Material debe ser cobre o aluminio');
        }

        // Validar aislamiento
        if (!params.aislamiento) {
            errores.push('Material de aislamiento es requerido');
        } else if (!['PVC', 'EPR'].includes(params.aislamiento)) {
            errores.push('Material de aislamiento debe ser PVC o EPR');
        }

        return {
            valido: errores.length === 0,
            errores: errores,
            advertencias: advertencias
        };
    } catch (error) {
        return {
            valido: false,
            errores: [`Error en validación de cortocircuito AC: ${error.message}`],
            advertencias: []
        };
    }
}

console.log('✅ Validations.js cargado');

// ===================================================================
// EXPORTACIONES AL OBJETO WINDOW
// ===================================================================

// Exportar todas las funciones de validación al objeto window
window.validarParametrosAmpacidadAC = validarParametrosAmpacidadAC;
window.validarCircuitosAgrupados = validarCircuitosAgrupados;
window.validarParametrosPartida = validarParametrosPartida;
window.validarParametrosAmpacidadDC = validarParametrosAmpacidadDC;
window.validarParametrosCaidaTensionDC = validarParametrosCaidaTensionDC;
window.validarParametrosCortocircuitoDC = validarParametrosCortocircuitoDC;
window.validarTensionDC = validarTensionDC;
window.validarParametrosCaidaTensionAC = validarParametrosCaidaTensionAC;
window.validarParametrosCortocircuitoAC = validarParametrosCortocircuitoAC;


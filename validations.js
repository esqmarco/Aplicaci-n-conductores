/**
 * VALIDATIONS.JS - SISTEMA DE VALIDACIÓN MEJORADO
 * ===============================================
 * 
 * Versión R2 Corregida con:
 * - Validaciones específicas para 7 pestañas
 * - Validación de tensión personalizable
 * - Validaciones cruzadas entre pestañas DC
 * - Manejo robusto de errores
 */

// ===================================================================
// VALIDACIONES BÁSICAS AC (MANTENER EXISTENTES)
// ===================================================================

/**
 * Valida los parámetros básicos del proyecto AC
 */
function validarParametrosBasicos(params) {
    const errores = [];
    const advertencias = [];

    try {
        // Validar potencia
        if (!params.potencia || isNaN(params.potencia)) {
            errores.push('Potencia es requerida y debe ser numérica');
        } else {
            const potencia = parseFloat(params.potencia);
            if (potencia <= 0) {
                errores.push('Potencia debe ser mayor que 0');
            } else if (potencia > 10000000) { // 10 MW
                errores.push('Potencia debe ser menor que 10MW');
            } else if (potencia < 1) {
                advertencias.push('Potencia muy baja, verificar unidades');
            }
        }

        // Validar tensión
        if (!params.tension || isNaN(params.tension)) {
            errores.push('Tensión es requerida y debe ser numérica');
        } else {
            const tension = parseFloat(params.tension);
            const tensionesValidas = [127, 220, 380, 440, 460, 480, 6600, 13800, 23000];
            if (!tensionesValidas.includes(tension)) {
                advertencias.push(`Tensión ${tension}V no es estándar. Valores recomendados: ${tensionesValidas.join(', ')}`);
            }
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

        // Validar tipo de sistema
        if (!params.tipoSistema) {
            errores.push('Tipo de sistema es requerido');
        } else if (!['monofasico', 'bifasico', 'trifasico'].includes(params.tipoSistema)) {
            errores.push('Tipo de sistema debe ser monofásico, bifásico o trifásico');
        }

        // Validar rendimiento
        if (params.rendimiento !== undefined) {
            const rendimiento = parseFloat(params.rendimiento);
            if (isNaN(rendimiento) || rendimiento < 0.5 || rendimiento > 1.0) {
                errores.push('Rendimiento debe estar entre 0.5 y 1.0');
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
            errores: [`Error en validación: ${error.message}`],
            advertencias: []
        };
    }
}

// ===================================================================
// NUEVAS VALIDACIONES DC ESPECÍFICAS POR PESTAÑA
// ===================================================================

/**
 * Valida parámetros para pestaña Ampacidad DC
 */
function validarParametrosAmpacidadDC(params) {
    const errores = [];
    const advertencias = [];

    try {
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
        } else if (!['A1', 'B1', 'C', 'E'].includes(params.metodo)) {
            errores.push('Método de instalación no válido para DC');
        }

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
        // Validar potencia DC
        if (!params.potencia || isNaN(params.potencia)) {
            errores.push('Potencia DC es requerida y debe ser numérica');
        } else {
            const potencia = parseFloat(params.potencia);
            if (potencia <= 0) {
                errores.push('Potencia DC debe ser mayor que 0');
            }
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
        }

        // Validar temperatura ambiente
        if (params.temperatura === undefined || isNaN(params.temperatura)) {
            errores.push('Temperatura ambiente es requerida y debe ser numérica');
        } else {
            const temp = parseFloat(params.temperatura);
            if (temp < -20 || temp > 80) {
                errores.push('Temperatura ambiente debe estar entre -20°C y 80°C');
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
                errores.push('Resistencia interna debe ser menor que 100 mΩ');
            } else if (resistencia < 0.1) {
                advertencias.push('Resistencia interna muy baja, verificar especificación');
            }
        }

        // Validar tiempo de despeje
        if (!params.tiempoDespeje || isNaN(params.tiempoDespeje)) {
            errores.push('Tiempo de despeje es requerido');
        } else {
            const tiempo = parseFloat(params.tiempoDespeje);
            if (tiempo <= 0 || tiempo > 10) {
                errores.push('Tiempo de despeje debe estar entre 0.01s y 10s');
            } else if (tiempo > 5) {
                advertencias.push('Tiempo de despeje muy alto, verificar protección');
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
            const aislamientoValido = ['PVC', 'EPR', 'EPR_90', 'EPR_105', 'HEPR', 'XLPE', 'EPR_XLPE'];
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
// VALIDACIONES CRUZADAS ENTRE PESTAÑAS DC
// ===================================================================

/**
 * Valida consistencia entre pestañas DC
 */
function validarConsistenciaDC(datosAmpacidad, datosCaidaTension, datosCortocircuito) {
    const errores = [];
    const advertencias = [];

    try {
        // Verificar consistencia de potencia entre pestañas
        const potencias = [];
        if (datosAmpacidad?.potencia) potencias.push({ valor: datosAmpacidad.potencia, pestaña: 'ampacidad' });
        if (datosCaidaTension?.potencia) potencias.push({ valor: datosCaidaTension.potencia, pestaña: 'caída de tensión' });

        if (potencias.length > 1) {
            const potenciaBase = potencias[0].valor;
            for (let i = 1; i < potencias.length; i++) {
                const diferencia = Math.abs(potencias[i].valor - potenciaBase) / potenciaBase * 100;
                if (diferencia > 5) { // Más de 5% de diferencia
                    advertencias.push(`Potencia en pestaña ${potencias[i].pestaña} (${potencias[i].valor}W) difiere significativamente de ${potencias[0].pestaña} (${potenciaBase}W)`);
                }
            }
        }

        // Verificar consistencia de tensión entre pestañas
        const tensiones = [];
        if (datosAmpacidad?.tension) tensiones.push({ valor: datosAmpacidad.tension, pestaña: 'ampacidad' });
        if (datosCaidaTension?.tension) tensiones.push({ valor: datosCaidaTension.tension, pestaña: 'caída de tensión' });

        if (tensiones.length > 1) {
            const tensionBase = tensiones[0].valor;
            for (let i = 1; i < tensiones.length; i++) {
                if (tensiones[i].valor !== tensionBase) {
                    advertencias.push(`Tensión en pestaña ${tensiones[i].pestaña} (${tensiones[i].valor}V) difiere de ${tensiones[0].pestaña} (${tensionBase}V)`);
                }
            }
        }

        // Verificar consistencia de material entre pestañas
        const materiales = [];
        if (datosAmpacidad?.material) materiales.push({ valor: datosAmpacidad.material, pestaña: 'ampacidad' });
        if (datosCaidaTension?.material) materiales.push({ valor: datosCaidaTension.material, pestaña: 'caída de tensión' });
        if (datosCortocircuito?.material) materiales.push({ valor: datosCortocircuito.material, pestaña: 'cortocircuito' });

        if (materiales.length > 1) {
            const materialBase = materiales[0].valor;
            for (let i = 1; i < materiales.length; i++) {
                if (materiales[i].valor !== materialBase) {
                    advertencias.push(`Material en pestaña ${materiales[i].pestaña} (${materiales[i].valor}) difiere de ${materiales[0].pestaña} (${materialBase})`);
                }
            }
        }

        // Verificar consistencia de temperatura entre pestañas
        const temperaturas = [];
        if (datosAmpacidad?.temperatura !== undefined) temperaturas.push({ valor: datosAmpacidad.temperatura, pestaña: 'ampacidad' });
        if (datosCaidaTension?.temperatura !== undefined) temperaturas.push({ valor: datosCaidaTension.temperatura, pestaña: 'caída de tensión' });

        if (temperaturas.length > 1) {
            const tempBase = temperaturas[0].valor;
            for (let i = 1; i < temperaturas.length; i++) {
                const diferencia = Math.abs(temperaturas[i].valor - tempBase);
                if (diferencia > 5) { // Más de 5°C de diferencia
                    advertencias.push(`Temperatura en pestaña ${temperaturas[i].pestaña} (${temperaturas[i].valor}°C) difiere de ${temperaturas[0].pestaña} (${tempBase}°C)`);
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
            errores: [`Error en validación de consistencia DC: ${error.message}`],
            advertencias: []
        };
    }
}

// ===================================================================
// VALIDACIONES DE RESULTADOS
// ===================================================================

/**
 * Valida resultados de cálculos DC
 */
function validarResultadosDC(resultados) {
    const errores = [];
    const advertencias = [];

    try {
        // Validar resultado de ampacidad
        if (resultados.ampacidad) {
            const amp = resultados.ampacidad;
            if (!amp.corriente || amp.corriente <= 0) {
                errores.push('Corriente DC calculada inválida');
            }
            if (!amp.seccion || amp.seccion <= 0) {
                errores.push('Sección por ampacidad inválida');
            }
            if (amp.corriente > 1000) {
                advertencias.push('Corriente DC muy alta, verificar cálculos');
            }
        }

        // Validar resultado de caída de tensión
        if (resultados.caida_tension) {
            const ct = resultados.caida_tension;
            if (ct.caida_tension_pct < 0 || ct.caida_tension_pct > 50) {
                errores.push('Porcentaje de caída de tensión fuera de rango válido');
            }
            if (!ct.cumple_criterio && ct.caida_tension_pct > 10) {
                advertencias.push('Caída de tensión muy alta, considerar sección mayor');
            }
            if (ct.caida_tension_pct < 0.1) {
                advertencias.push('Caída de tensión muy baja, verificar cálculos');
            }
        }

        // Validar resultado de cortocircuito
        if (resultados.cortocircuito) {
            const cc = resultados.cortocircuito;
            if (!cc.corriente_cortocircuito || cc.corriente_cortocircuito <= 0) {
                errores.push('Corriente de cortocircuito inválida');
            }
            if (!cc.seccion_minima || cc.seccion_minima <= 0) {
                errores.push('Sección mínima por cortocircuito inválida');
            }
            if (cc.corriente_cortocircuito > 100000) {
                advertencias.push('Corriente de cortocircuito muy alta, verificar configuración');
            }
        }

        // Validar sección final
        if (resultados.seccion_final) {
            const seccionesValidas = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
            if (!seccionesValidas.includes(resultados.seccion_final)) {
                errores.push('Sección final no es estándar');
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
            errores: [`Error en validación de resultados DC: ${error.message}`],
            advertencias: []
        };
    }
}

// ===================================================================
// FUNCIONES AUXILIARES DE VALIDACIÓN
// ===================================================================

/**
 * Valida que un valor esté en un rango específico
 */
function validarRango(valor, min, max, nombre) {
    if (valor < min || valor > max) {
        throw new Error(`${nombre} debe estar entre ${min} y ${max}`);
    }
    return true;
}

/**
 * Valida que un valor esté en una lista de valores válidos
 */
function validarLista(valor, lista, nombre) {
    if (!lista.includes(valor)) {
        throw new Error(`${nombre} debe ser uno de: ${lista.join(', ')}`);
    }
    return true;
}

/**
 * Valida formato numérico
 */
function validarNumerico(valor, nombre) {
    if (isNaN(valor) || valor === null || valor === undefined || valor === '') {
        throw new Error(`${nombre} debe ser un valor numérico válido`);
    }
    return true;
}

/**
 * Valida que un campo sea requerido
 */
function validarRequerido(valor, nombre) {
    if (valor === null || valor === undefined || valor === '') {
        throw new Error(`${nombre} es requerido`);
    }
    return true;
}

// ===================================================================
// FUNCIÓN PRINCIPAL DE VALIDACIÓN POR PESTAÑA
// ===================================================================

/**
 * Valida parámetros según la pestaña activa
 */
function validarPorPestaña(pestaña, parametros) {
    try {
        switch (pestaña) {
            case 'proyecto':
                return validarParametrosBasicos(parametros);
            
            case 'caida-tension':
                return validarParametrosCaidaTensionAC(parametros);
            
            case 'cortocircuito':
                return validarParametrosCortocircuitoAC(parametros);
            
            case 'ampacidad-dc':
                return validarParametrosAmpacidadDC(parametros);
            
            case 'caida-tension-dc':
                return validarParametrosCaidaTensionDC(parametros);
            
            case 'cortocircuito-dc':
                return validarParametrosCortocircuitoDC(parametros);
            
            case 'resultados-dc':
                return validarResultadosDC(parametros);
            
            default:
                return {
                    valido: false,
                    errores: [`Pestaña ${pestaña} no reconocida`],
                    advertencias: []
                };
        }
    } catch (error) {
        return {
            valido: false,
            errores: [`Error en validación de pestaña ${pestaña}: ${error.message}`],
            advertencias: []
        };
    }
}

// ===================================================================
// FUNCIONES DE VALIDACIÓN AC (MANTENER EXISTENTES)
// ===================================================================

/**
 * Valida parámetros de caída de tensión AC
 */
function validarParametrosCaidaTensionAC(params) {
    const errores = [];
    const advertencias = [];

    try {
        // Validar potencia
        if (!params.potencia || isNaN(params.potencia)) {
            errores.push('Potencia es requerida y debe ser numérica');
        } else {
            const potencia = parseFloat(params.potencia);
            if (potencia <= 0) {
                errores.push('Potencia debe ser mayor que 0');
            }
        }

        // Validar tensión
        if (!params.tension || isNaN(params.tension)) {
            errores.push('Tensión es requerida y debe ser numérica');
        } else {
            const tension = parseFloat(params.tension);
            const tensionesValidas = [127, 220, 380, 440];
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
            }
        }

        // Validar tiempo de despeje
        if (!params.tiempoDespeje || isNaN(params.tiempoDespeje)) {
            errores.push('Tiempo de despeje es requerido y debe ser numérico');
        } else {
            const tiempo = parseFloat(params.tiempoDespeje);
            if (tiempo < 0.01 || tiempo > 10) {
                errores.push('Tiempo de despeje debe estar entre 0.01s y 10s');
            } else if (tiempo > 5) {
                advertencias.push('Tiempo de despeje muy alto, verificar protección');
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

console.log('✅ Validations.js R2 Corregido cargado - Validaciones específicas por pestaña y tensión personalizable');

// ===================================================================
// EXPORTACIONES AL OBJETO WINDOW
// ===================================================================

// Exportar todas las funciones de validación al objeto window
window.validarParametrosBasicos = validarParametrosBasicos;
window.validarParametrosAmpacidadDC = validarParametrosAmpacidadDC;
window.validarParametrosCaidaTensionDC = validarParametrosCaidaTensionDC;
window.validarParametrosCortocircuitoDC = validarParametrosCortocircuitoDC;
window.validarTensionDC = validarTensionDC;
window.validarConsistenciaDC = validarConsistenciaDC;
window.validarResultadosDC = validarResultadosDC;
window.validarRango = validarRango;
window.validarLista = validarLista;
window.validarNumerico = validarNumerico;
window.validarRequerido = validarRequerido;
window.validarPorPestaña = validarPorPestaña;
window.validarParametrosCaidaTensionAC = validarParametrosCaidaTensionAC;
window.validarParametrosCortocircuitoAC = validarParametrosCortocircuitoAC;


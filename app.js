/**
 * APP.JS - CONTROLADOR PRINCIPAL
 * Calculadora de dimensionamiento de conductores AC/DC
 */

// ===================================================================
// ESTADO GLOBAL DE LA APLICACION
// ===================================================================

const appState = {
    currentTab: 'proyecto',
    calculos: {
        proyecto: null,
        caidaTension: null,
        cortocircuito: null,
        ampacidadDC: null,
        caidaTensionDC: null,
        cortocircuitoDC: null
    },
    isCalculating: false
};

// ===================================================================
// INICIALIZACION
// ===================================================================

document.addEventListener('DOMContentLoaded', function () {
    configurarPestanas();
    configurarTensionPersonalizable();
    configurarModoEntrada();

    // Eventos de bateria para calculo automatico de resistencia interna
    const capacidadEl = document.getElementById('capacidad-bateria');
    const tipoEl = document.getElementById('tipo-bateria');
    if (capacidadEl) {
        capacidadEl.addEventListener('input', actualizarResistenciaInterna);
    }
    if (tipoEl) {
        tipoEl.addEventListener('change', actualizarResistenciaInterna);
    }

    // Sincronizacion silenciosa de pestanas DC
    configurarSincronizacionDC();
});

// ===================================================================
// SISTEMA DE PESTANAS
// ===================================================================

function configurarPestanas() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    appState.currentTab = tabName;

    document.querySelectorAll('.tab').forEach(function (tab) {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(function (content) {
        content.classList.remove('active');
    });

    var activeTab = document.querySelector('[data-tab="' + tabName + '"]');
    var activeContent = document.getElementById(tabName);

    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeContent.classList.add('active');
        onTabSwitch(tabName);
    }
}

function onTabSwitch(tabName) {
    switch (tabName) {
        case 'ampacidad-dc':
        case 'caida-tension-dc':
        case 'cortocircuito-dc':
            sincronizarDatosCompartidosDC();
            break;
        case 'resultados-dc':
            actualizarResumenDC();
            break;
        case 'resultados-ac':
            actualizarResumenAC();
            break;
    }
}

// ===================================================================
// CONFIGURACION DE TENSION PERSONALIZABLE (DC)
// ===================================================================

function configurarTensionPersonalizable() {
    var pares = [
        { selectId: 'tension-dc', rowId: 'tension-personalizada-row', inputId: 'tension-personalizada' },
        { selectId: 'tension-ct-dc', rowId: 'tension-personalizada-ct-dc-row', inputId: 'tension-personalizada-ct-dc' }
    ];

    pares.forEach(function (par) {
        var select = document.getElementById(par.selectId);
        var row = document.getElementById(par.rowId);
        if (select && row) {
            select.addEventListener('change', function () {
                if (this.value === 'personalizado') {
                    row.style.display = 'block';
                    var input = document.getElementById(par.inputId);
                    if (input) input.focus();
                } else {
                    row.style.display = 'none';
                }
            });
        }
    });
}

// ===================================================================
// MODO DE ENTRADA AC (potencia / corriente / transformador)
// ===================================================================

function configurarModoEntrada() {
    var selector = document.getElementById('modo-entrada');
    if (!selector) return;

    selector.addEventListener('change', function () {
        aplicarModoEntrada(this.value);
    });

    // Aplicar modo inicial
    aplicarModoEntrada(selector.value || 'potencia');
}

function aplicarModoEntrada(modo) {
    // Campos de potencia
    var campoPotencia = document.getElementById('potencia');
    var campoUnidad = document.getElementById('unidad-potencia');
    var filaPotencia = campoPotencia ? campoPotencia.closest('.form-group') : null;
    var filaUnidad = campoUnidad ? campoUnidad.closest('.form-group') : null;

    // Campo corriente directa
    var campoCorriente = document.getElementById('corriente-directa');
    var filaCorriente = campoCorriente ? campoCorriente.closest('.form-group') : null;

    // Campo transformador
    var campoTransformador = document.getElementById('potencia-transformador-kva');
    var filaTransformador = campoTransformador ? campoTransformador.closest('.form-group') : null;

    // Ocultar todos
    if (filaPotencia) filaPotencia.style.display = 'none';
    if (filaUnidad) filaUnidad.style.display = 'none';
    if (filaCorriente) filaCorriente.style.display = 'none';
    if (filaTransformador) filaTransformador.style.display = 'none';

    switch (modo) {
        case 'potencia':
            if (filaPotencia) filaPotencia.style.display = '';
            if (filaUnidad) filaUnidad.style.display = '';
            break;
        case 'corriente':
            if (filaCorriente) filaCorriente.style.display = '';
            break;
        case 'transformador':
            if (filaTransformador) filaTransformador.style.display = '';
            break;
    }
}

// ===================================================================
// SINCRONIZACION SILENCIOSA DC
// ===================================================================

function configurarSincronizacionDC() {
    var camposComunes = [
        { id: 'potencia-dc', campo: 'potencia' },
        { id: 'material-condutor-dc', campo: 'material' },
        { id: 'temperatura-ambiente-dc', campo: 'temperatura' }
    ];

    camposComunes.forEach(function (item) {
        var elemento = document.getElementById(item.id);
        if (elemento) {
            elemento.addEventListener('change', function () {
                sincronizarCampoEnOtrasPestanasDC(item.campo, this.value);
            });
        }
    });
}

function sincronizarDatosCompartidosDC() {
    // Solo rellenar campos vacios silenciosamente, sin confirm()
    var calc = appState.calculos;

    if (calc.ampacidadDC && calc.ampacidadDC.parametros) {
        var params = calc.ampacidadDC.parametros;
        rellenarSiVacio('potencia-ct-dc', params.potencia);
        rellenarSiVacio('material-conductor-ct-dc', params.material);
        rellenarSiVacio('temperatura-ct-dc', params.temperatura);
    }
}

function sincronizarCampoEnOtrasPestanasDC(campo, valor) {
    var selectores = {
        'potencia': ['potencia-ct-dc'],
        'material': ['material-conductor-ct-dc', 'material-cc-dc'],
        'temperatura': ['temperatura-ct-dc']
    };

    var ids = selectores[campo];
    if (ids) {
        ids.forEach(function (id) {
            rellenarSiVacio(id, valor);
        });
    }
}

function rellenarSiVacio(id, valor) {
    var el = document.getElementById(id);
    if (el && !el.value && valor !== undefined && valor !== null) {
        el.value = valor;
    }
}

// ===================================================================
// OBTENCION DE PARAMETROS - AC
// ===================================================================

function obtenerParametrosProyecto() {
    var modo = document.getElementById('modo-entrada') ? document.getElementById('modo-entrada').value : 'potencia';

    var params = {
        modoEntrada: modo,
        tension: parseFloat(document.getElementById('tension').value),
        factorPotencia: parseFloat(document.getElementById('factor-potencia').value),
        tipoSistema: document.getElementById('tipo-sistema').value,
        rendimiento: parseFloat(document.getElementById('rendimiento').value),
        materialAislamento: document.getElementById('material-isolamento').value,
        materialCondutor: document.getElementById('material-condutor').value,
        temperaturaAmbiente: parseFloat(document.getElementById('temperatura-ambiente').value),
        metodoInstalacao: document.getElementById('metodo-instalacao').value,
        agrupamento: parseInt(document.getElementById('agrupamento').value)
    };

    switch (modo) {
        case 'potencia':
            params.potencia = parseFloat(document.getElementById('potencia').value);
            params.unidadPotencia = document.getElementById('unidad-potencia').value;
            break;
        case 'corriente':
            params.corrienteDirecta = parseFloat(document.getElementById('corriente-directa').value);
            break;
        case 'transformador':
            params.potenciaTransformadorKVA = parseFloat(document.getElementById('potencia-transformador-kva').value);
            break;
    }

    return params;
}

function obtenerParametrosCaidaTensionAC() {
    return {
        potencia: parseFloat(document.getElementById('potencia-ct').value),
        tension: parseFloat(document.getElementById('tension-ct').value),
        longitud: parseFloat(document.getElementById('longitud-ct').value),
        seccion: parseFloat(document.getElementById('seccion-ct').value),
        tipoSistema: document.getElementById('tipo-sistema-ct').value,
        factorPotencia: parseFloat(document.getElementById('fp-ct').value),
        materialCondutor: document.getElementById('material-ct').value
    };
}

function obtenerParametrosCortocircuitoAC() {
    return {
        potenciaCortocircuito: parseFloat(document.getElementById('potencia-cc').value),
        tensionSistema: parseFloat(document.getElementById('tension-cc').value),
        tiempoDespeje: parseFloat(document.getElementById('tiempo-despeje').value),
        seccion: parseFloat(document.getElementById('seccion-cc').value),
        materialCondutor: document.getElementById('material-cc').value,
        materialAislamiento: document.getElementById('aislamiento-cc').value
    };
}

// ===================================================================
// OBTENCION DE PARAMETROS - DC
// ===================================================================

function obtenerParametrosAmpacidadDC() {
    var tensionSelector = document.getElementById('tension-dc').value;
    var tensionPersonalizada = document.getElementById('tension-personalizada') ? document.getElementById('tension-personalizada').value : '';

    return {
        potencia: parseFloat(document.getElementById('potencia-dc').value),
        tensionSelector: tensionSelector,
        tensionPersonalizada: tensionPersonalizada,
        material: document.getElementById('material-condutor-dc').value,
        temperatura: parseFloat(document.getElementById('temperatura-ambiente-dc').value),
        metodo: document.getElementById('metodo-instalacao-dc').value,
        aislamiento: document.getElementById('aislamiento-dc') ? document.getElementById('aislamiento-dc').value : 'PVC'
    };
}

function obtenerParametrosCaidaTensionDC() {
    var tensionSelector = document.getElementById('tension-ct-dc').value;
    var tensionPersonalizada = document.getElementById('tension-personalizada-ct-dc') ? document.getElementById('tension-personalizada-ct-dc').value : '';

    return {
        potencia: parseFloat(document.getElementById('potencia-ct-dc').value),
        tensionSelector: tensionSelector,
        tensionPersonalizada: tensionPersonalizada,
        longitud: parseFloat(document.getElementById('longitud-ct-dc').value),
        conductoresPorPolo: parseInt(document.getElementById('conductores-paralelo').value),
        seccion: parseFloat(document.getElementById('seccion-ct-dc').value),
        material: document.getElementById('material-conductor-ct-dc') ? document.getElementById('material-conductor-ct-dc').value : 'cobre',
        temperatura: parseFloat(document.getElementById('temperatura-ct-dc').value),
        aislamiento: document.getElementById('aislamiento-ct-dc') ? document.getElementById('aislamiento-ct-dc').value : 'PVC'
    };
}

function obtenerParametrosCortocircuitoDC() {
    return {
        tipoBateria: document.getElementById('tipo-bateria').value,
        elementosSerie: parseInt(document.getElementById('elementos-serie').value),
        capacidad: parseFloat(document.getElementById('capacidad-bateria').value),
        resistenciaInterna: parseFloat(document.getElementById('resistencia-interna').value),
        tiempoDespeje: parseFloat(document.getElementById('tiempo-despeje-dc').value),
        seccion: parseFloat(document.getElementById('seccion-cc-dc').value),
        material: document.getElementById('material-cc-dc') ? document.getElementById('material-cc-dc').value : 'cobre',
        aislamiento: document.getElementById('aislamiento-cc-dc') ? document.getElementById('aislamiento-cc-dc').value : 'PVC'
    };
}

// ===================================================================
// CALCULO AC - PROYECTO (Dimensionamiento por Ampacidad)
// ===================================================================

function calcularProyecto() {
    try {
        appState.isCalculating = true;

        var parametros = obtenerParametrosProyecto();

        var validacion = validarParametrosBasicos(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }

        // Determinar corriente segun modo de entrada
        var corrienteProyecto;
        var potenciaW;

        switch (parametros.modoEntrada) {
            case 'corriente':
                corrienteProyecto = parametros.corrienteDirecta;
                break;
            case 'transformador':
                corrienteProyecto = calcularCorrienteTransformador({
                    potenciaKVA: parametros.potenciaTransformadorKVA,
                    tension: parametros.tension,
                    tipoSistema: parametros.tipoSistema
                });
                break;
            case 'potencia':
            default:
                potenciaW = convertirAWatts(parametros.potencia, parametros.unidadPotencia);
                corrienteProyecto = calcularCorrenteProyecto({
                    potencia: potenciaW,
                    tension: parametros.tension,
                    factorPotencia: parametros.factorPotencia,
                    tipoSistema: parametros.tipoSistema,
                    rendimiento: parametros.rendimiento
                });
                break;
        }

        // Dimensionar por ampacidad completa
        var resultado = dimensionarPorAmpacidadAC({
            corriente: corrienteProyecto,
            materialCondutor: parametros.materialCondutor,
            materialAislamento: parametros.materialAislamento,
            temperaturaAmbiente: parametros.temperaturaAmbiente,
            metodoInstalacao: parametros.metodoInstalacao,
            agrupamento: parametros.agrupamento
        });

        // Mostrar resultados
        mostrarResultadosProyecto(resultado);

        // Guardar en estado
        appState.calculos.proyecto = {
            parametros: parametros,
            resultado: resultado
        };

        mostrarMensaje('Dimensionamiento AC calculado correctamente', 'exito');
    } catch (error) {
        console.error('Error en calculo de proyecto:', error);
        mostrarMensaje('Error en calculo: ' + error.message, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

function mostrarResultadosProyecto(resultado) {
    var seccion = document.getElementById('resultados-proyecto');
    if (seccion) {
        seccion.style.display = 'block';
    }

    var campos = {
        'corriente-proyecto': resultado.corriente !== undefined ? resultado.corriente.toFixed(2) + ' A' : '--',
        'corriente-corregida': resultado.corrienteCorregida !== undefined ? resultado.corrienteCorregida.toFixed(2) + ' A' : '--',
        'factor-temp-ac': resultado.factorTemperatura !== undefined ? resultado.factorTemperatura.toFixed(2) : '--',
        'factor-agrup-ac': resultado.factorAgrupamento !== undefined ? resultado.factorAgrupamento.toFixed(2) : '--',
        'seccion-comercial': resultado.seccion !== undefined ? resultado.seccion + ' mm2' : '--',
        'ampacidad-seleccionada': resultado.ampacidad !== undefined ? resultado.ampacidad + ' A' : '--',
        'seccion-minima': resultado.seccion !== undefined ? resultado.seccion + ' mm2' : '--'
    };

    Object.keys(campos).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = campos[id];
    });
}

// ===================================================================
// CALCULO AC - CAIDA DE TENSION
// ===================================================================

function calcularCaidaTension() {
    try {
        appState.isCalculating = true;

        var parametros = obtenerParametrosCaidaTensionAC();

        var validacion = validarParametrosCaidaTensionAC(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }

        var resultado = calcularCaidaTensionAC({
            corriente: parametros.potencia / (parametros.tension * parametros.factorPotencia),
            tension: parametros.tension,
            longitud: parametros.longitud,
            seccion: parametros.seccion,
            materialCondutor: parametros.materialCondutor,
            tipoSistema: parametros.tipoSistema,
            factorPotencia: parametros.factorPotencia
        });

        // Mostrar resultados
        mostrarResultadosCaidaTensionAC(resultado);

        // Guardar en estado
        appState.calculos.caidaTension = {
            parametros: parametros,
            resultado: resultado
        };

        mostrarMensaje('Caida de tension AC calculada correctamente', 'exito');
    } catch (error) {
        console.error('Error en calculo de caida de tension AC:', error);
        mostrarMensaje('Error en calculo: ' + error.message, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

function mostrarResultadosCaidaTensionAC(resultado) {
    var seccion = document.getElementById('resultados-caida-tension');
    if (seccion) {
        seccion.style.display = 'block';
    }

    var elPct = document.getElementById('caida-tension-ac-valor');
    if (elPct) elPct.textContent = resultado.caidaTensionPct.toFixed(2) + '%';

    var elStatus = document.getElementById('caida-tension-ac-status');
    if (elStatus) {
        elStatus.textContent = resultado.cumple ? 'CUMPLE' : 'NO CUMPLE';
        elStatus.className = resultado.cumple ? 'resultado-ok' : 'resultado-error';
    }
}

// ===================================================================
// CALCULO AC - CORTOCIRCUITO
// ===================================================================

function calcularCortocircuito() {
    try {
        appState.isCalculating = true;

        var parametros = obtenerParametrosCortocircuitoAC();

        var validacion = validarParametrosCortocircuitoAC(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }

        var resultado = calcularCortocircuitoAC({
            potenciaCortocircuito: parametros.potenciaCortocircuito,
            tensionSistema: parametros.tensionSistema,
            tiempoDespeje: parametros.tiempoDespeje,
            seccion: parametros.seccion,
            materialCondutor: parametros.materialCondutor,
            materialAislamiento: parametros.materialAislamiento
        });

        // Mostrar resultados
        mostrarResultadosCortocircuitoAC(resultado);

        // Guardar en estado
        appState.calculos.cortocircuito = {
            parametros: parametros,
            resultado: resultado
        };

        mostrarMensaje('Cortocircuito AC calculado correctamente', 'exito');
    } catch (error) {
        console.error('Error en calculo de cortocircuito AC:', error);
        mostrarMensaje('Error en calculo: ' + error.message, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

function mostrarResultadosCortocircuitoAC(resultado) {
    var seccion = document.getElementById('resultados-cortocircuito');
    if (seccion) {
        seccion.style.display = 'block';
    }

    var elCorriente = document.getElementById('corriente-cortocircuito-ac');
    if (elCorriente) elCorriente.textContent = resultado.corrienteCortocircuito.toFixed(0) + ' A';

    var elSeccion = document.getElementById('seccion-minima-cc-ac');
    if (elSeccion) elSeccion.textContent = resultado.seccionMinima + ' mm2';

    var elStatus = document.getElementById('cortocircuito-ac-status');
    if (elStatus) {
        elStatus.textContent = resultado.cumple ? 'CUMPLE' : 'NO CUMPLE';
        elStatus.className = resultado.cumple ? 'resultado-ok' : 'resultado-error';
    }
}

// ===================================================================
// RESUMEN CONSOLIDADO AC
// ===================================================================

function actualizarResumenAC() {
    var proyecto = appState.calculos.proyecto;
    var caida = appState.calculos.caidaTension;
    var cc = appState.calculos.cortocircuito;

    // Corriente y seccion por ampacidad
    if (proyecto && proyecto.resultado) {
        var r = proyecto.resultado;
        setTexto('resumen-corriente-ac', r.corriente !== undefined ? r.corriente.toFixed(2) + ' A' : '--');
        setTexto('resumen-seccion-ampacidad-ac', r.seccion !== undefined ? r.seccion + ' mm2' : '--');
    } else {
        setTexto('resumen-corriente-ac', 'No calculado');
        setTexto('resumen-seccion-ampacidad-ac', 'No calculado');
    }

    // Caida de tension
    if (caida && caida.resultado) {
        setTexto('resumen-caida-ac', caida.resultado.caidaTensionPct.toFixed(2) + '%');
        var elEstadoCaida = document.getElementById('resumen-estado-caida-ac');
        if (elEstadoCaida) {
            elEstadoCaida.textContent = caida.resultado.cumple ? 'CUMPLE' : 'NO CUMPLE';
            elEstadoCaida.className = caida.resultado.cumple ? 'resultado-ok' : 'resultado-error';
        }
    } else {
        setTexto('resumen-caida-ac', 'No calculado');
        setTexto('resumen-estado-caida-ac', '--');
    }

    // Cortocircuito
    if (cc && cc.resultado) {
        setTexto('resumen-cc-ac', cc.resultado.corrienteCortocircuito.toFixed(0) + ' A');
        var elEstadoCC = document.getElementById('resumen-estado-cc-ac');
        if (elEstadoCC) {
            elEstadoCC.textContent = cc.resultado.cumple ? 'CUMPLE' : 'NO CUMPLE';
            elEstadoCC.className = cc.resultado.cumple ? 'resultado-ok' : 'resultado-error';
        }
    } else {
        setTexto('resumen-cc-ac', 'No calculado');
        setTexto('resumen-estado-cc-ac', '--');
    }

    // Determinar seccion final (criterio mas restrictivo)
    determinarSeccionFinalAC();
}

function determinarSeccionFinalAC() {
    var proyecto = appState.calculos.proyecto;
    var cc = appState.calculos.cortocircuito;

    var secciones = [];

    if (proyecto && proyecto.resultado && proyecto.resultado.seccion) {
        secciones.push({ valor: proyecto.resultado.seccion, criterio: 'Ampacidad' });
    }

    if (cc && cc.resultado && cc.resultado.seccionMinima) {
        secciones.push({ valor: cc.resultado.seccionMinima, criterio: 'Cortocircuito' });
    }

    if (secciones.length > 0) {
        var maxSeccion = secciones.reduce(function (max, cur) {
            return cur.valor > max.valor ? cur : max;
        });

        setTexto('seccion-final-ac', maxSeccion.valor + ' mm2');
        setTexto('criterio-restrictivo-ac', maxSeccion.criterio);
    } else {
        setTexto('seccion-final-ac', 'No calculado');
        setTexto('criterio-restrictivo-ac', '--');
    }
}

// ===================================================================
// CALCULO DC - AMPACIDAD
// ===================================================================

function calcularAmpacidadDC() {
    try {
        appState.isCalculating = true;

        var parametros = obtenerParametrosAmpacidadDC();

        var validacion = validarParametrosAmpacidadDC(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }

        var resultado = dimensionarPorAmpacidadDC(parametros);

        mostrarResultadosAmpacidadDC(resultado);

        appState.calculos.ampacidadDC = { parametros: parametros, resultado: resultado };

        mostrarMensaje('Ampacidad DC calculada correctamente', 'exito');
    } catch (error) {
        console.error('Error en calculo de ampacidad DC:', error);
        mostrarMensaje('Error en calculo: ' + error.message, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

function mostrarResultadosAmpacidadDC(resultado) {
    var seccion = document.getElementById('resultados-ampacidad-dc');
    if (seccion) {
        seccion.style.display = 'block';
    }

    var campos = {
        'corriente-dc': resultado.corriente + ' A',
        'seccion-ampacidad-dc': resultado.seccion + ' mm2',
        'resistencia-mostrada-dc': resultado.resistencia_mostrada + ' ohm/km'
    };

    Object.keys(campos).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = campos[id];
    });
}

// ===================================================================
// CALCULO DC - CAIDA DE TENSION
// ===================================================================

function calcularCaidaTensionDC_UI() {
    try {
        appState.isCalculating = true;

        var parametros = obtenerParametrosCaidaTensionDC();

        var validacion = validarParametrosCaidaTensionDC(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }

        var resultado = verificarCaidaTensionDC(parametros);

        mostrarResultadosCaidaTensionDC(resultado);

        appState.calculos.caidaTensionDC = { parametros: parametros, resultado: resultado };

        mostrarMensaje('Caida de tension DC calculada correctamente', 'exito');
    } catch (error) {
        console.error('Error en calculo de caida de tension DC:', error);
        mostrarMensaje('Error en calculo: ' + error.message, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

function mostrarResultadosCaidaTensionDC(resultado) {
    var seccion = document.getElementById('resultados-caida-tension-dc');
    if (seccion) {
        seccion.style.display = 'block';
    }

    var elValor = document.getElementById('caida-tension-dc-valor');
    if (elValor) elValor.textContent = resultado.caida_tension_pct + '%';

    var elStatus = document.getElementById('caida-tension-dc-status');
    if (elStatus) {
        elStatus.textContent = resultado.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE';
        elStatus.className = resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error';
    }

    var elRes = document.getElementById('resistencia-real-dc');
    if (elRes) elRes.textContent = resultado.resistencia_mostrada + ' ohm/km';

    var elCorr = document.getElementById('corriente-calculada-dc');
    if (elCorr) elCorr.textContent = resultado.corriente + ' A';
}

// ===================================================================
// CALCULO DC - CORTOCIRCUITO
// ===================================================================

function calcularCortocircuitoDC() {
    try {
        appState.isCalculating = true;

        var parametros = obtenerParametrosCortocircuitoDC();

        var validacion = validarParametrosCortocircuitoDC(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }

        var resultado = analizarCortocircuitoDC(parametros);

        mostrarResultadosCortocircuitoDC(resultado);

        appState.calculos.cortocircuitoDC = { parametros: parametros, resultado: resultado };

        mostrarMensaje('Cortocircuito DC calculado correctamente', 'exito');
    } catch (error) {
        console.error('Error en calculo de cortocircuito DC:', error);
        mostrarMensaje('Error en calculo: ' + error.message, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

function mostrarResultadosCortocircuitoDC(resultado) {
    var seccion = document.getElementById('resultados-cortocircuito-dc');
    if (seccion) {
        seccion.style.display = 'block';
    }

    var elCorriente = document.getElementById('corriente-cortocircuito-dc');
    if (elCorriente) elCorriente.textContent = resultado.corriente_cortocircuito + ' A';

    var elStatus = document.getElementById('cortocircuito-dc-status');
    if (elStatus) {
        elStatus.textContent = resultado.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE';
        elStatus.className = resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error';
    }
}

// ===================================================================
// RESUMEN CONSOLIDADO DC
// ===================================================================

function actualizarResumenDC() {
    var amp = appState.calculos.ampacidadDC;
    var caida = appState.calculos.caidaTensionDC;
    var cc = appState.calculos.cortocircuitoDC;

    if (amp && amp.resultado) {
        setTexto('resumen-corriente-dc', amp.resultado.corriente + ' A');
        setTexto('resumen-seccion-ampacidad', amp.resultado.seccion + ' mm2');
    }

    if (caida && caida.resultado) {
        setTexto('resumen-caida-tension', caida.resultado.caida_tension_pct + '%');
        var elEstado = document.getElementById('resumen-estado-caida');
        if (elEstado) {
            elEstado.textContent = caida.resultado.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE';
            elEstado.className = caida.resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error';
        }
    }

    if (cc && cc.resultado) {
        setTexto('resumen-corriente-cc', cc.resultado.corriente_cortocircuito + ' A');
        var elEstadoCC = document.getElementById('resumen-estado-cc');
        if (elEstadoCC) {
            elEstadoCC.textContent = cc.resultado.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE';
            elEstadoCC.className = cc.resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error';
        }
    }

    determinarSeccionFinalDC();
}

function determinarSeccionFinalDC() {
    var amp = appState.calculos.ampacidadDC;
    var caida = appState.calculos.caidaTensionDC;
    var cc = appState.calculos.cortocircuitoDC;

    var secciones = [];

    if (amp && amp.resultado) {
        secciones.push({ valor: amp.resultado.seccion, criterio: 'Ampacidad' });
    }

    if (caida && caida.resultado && !caida.resultado.cumple_criterio) {
        try {
            var seccionNecesaria = calcularSeccionParaCaidaDC(caida.parametros);
            secciones.push({ valor: seccionNecesaria, criterio: 'Caida de Tension' });
        } catch (e) {
            console.error('Error al calcular seccion necesaria para caida de tension:', e);
        }
    }

    if (cc && cc.resultado) {
        secciones.push({ valor: cc.resultado.seccion_minima, criterio: 'Cortocircuito' });
    }

    if (secciones.length > 0) {
        var maxSeccion = secciones.reduce(function (max, cur) {
            return cur.valor > max.valor ? cur : max;
        });

        setTexto('criterio-restrictivo', maxSeccion.criterio);
        setTexto('seccion-final-dc', maxSeccion.valor + ' mm2');
    }
}

// ===================================================================
// RESISTENCIA INTERNA BATERIA
// ===================================================================

function actualizarResistenciaInterna() {
    var tipo = document.getElementById('tipo-bateria') ? document.getElementById('tipo-bateria').value : null;
    var capacidadInput = document.getElementById('capacidad-bateria');
    var resistenciaInput = document.getElementById('resistencia-interna');
    if (!tipo || !capacidadInput || !resistenciaInput) return;

    var capacidad = parseFloat(capacidadInput.value);
    if (isNaN(capacidad) || capacidad <= 0) return;

    var constantes = window.resistenciasInternasBateria || {};
    var constanteTipo = constantes[tipo];
    if (constanteTipo) {
        var resistencia = constanteTipo / capacidad;
        resistenciaInput.value = (Math.round(resistencia * 1000) / 1000).toFixed(3);
    }
}

// ===================================================================
// RESETEO Y REPORTE
// ===================================================================

function resetearFormulario(pestana) {
    var formularios = {
        'proyecto': ['potencia', 'tension', 'factor-potencia'],
        'ampacidad-dc': ['potencia-dc', 'tension-dc', 'tension-personalizada'],
        'caida-tension-dc': ['potencia-ct-dc', 'tension-ct-dc', 'longitud-ct-dc'],
        'cortocircuito-dc': ['elementos-serie', 'capacidad-bateria', 'resistencia-interna']
    };

    var campos = formularios[pestana];
    if (campos) {
        campos.forEach(function (campoId) {
            var campo = document.getElementById(campoId);
            if (campo) {
                if (campo.type === 'select-one') {
                    campo.selectedIndex = 0;
                } else {
                    campo.value = '';
                }
            }
        });

        var resultados = document.getElementById('resultados-' + pestana);
        if (resultados) {
            resultados.style.display = 'none';
        }

        mostrarMensaje('Formulario limpiado', 'info');
    }
}

function generarReporteDC() {
    var amp = appState.calculos.ampacidadDC;
    var caida = appState.calculos.caidaTensionDC;
    var cc = appState.calculos.cortocircuitoDC;

    if (!amp && !caida && !cc) {
        mostrarMensaje('No hay resultados DC para generar reporte', 'advertencia');
        return;
    }

    mostrarMensaje('Reporte DC generado', 'exito');
}

// ===================================================================
// SISTEMA DE MENSAJES (max 3 visibles, auto-remove 4s)
// ===================================================================

function mostrarMensaje(texto, tipo) {
    tipo = tipo || 'info';

    var contenedor = document.getElementById('contenedor-mensajes');
    if (!contenedor) return;

    // Limitar a 3 mensajes visibles
    var mensajesActuales = contenedor.querySelectorAll('.mensaje');
    while (mensajesActuales.length >= 3) {
        mensajesActuales[0].remove();
        mensajesActuales = contenedor.querySelectorAll('.mensaje');
    }

    var mensaje = document.createElement('div');
    mensaje.className = 'mensaje mensaje-' + tipo;
    mensaje.innerHTML =
        '<span>' + texto + '</span>' +
        '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;font-size:18px;">&times;</button>';

    contenedor.appendChild(mensaje);

    setTimeout(function () {
        if (mensaje.parentElement) {
            mensaje.remove();
        }
    }, 4000);
}

// ===================================================================
// UTILIDADES
// ===================================================================

function setTexto(id, texto) {
    var el = document.getElementById(id);
    if (el) el.textContent = texto;
}

function mostrarErroresValidacion(errores) {
    errores.forEach(function (error) {
        mostrarMensaje(error, 'error');
    });
}

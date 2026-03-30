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

    // Validacion en tiempo real
    configurarValidacionEnTiempoReal();
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
    // Usar los divs contenedores directamente
    var divPotencia = document.getElementById('campos-potencia');
    var divCorriente = document.getElementById('campos-corriente');
    var divTransformador = document.getElementById('campos-transformador');

    // Ocultar todos
    if (divPotencia) divPotencia.style.display = 'none';
    if (divCorriente) divCorriente.style.display = 'none';
    if (divTransformador) divTransformador.style.display = 'none';

    // Mostrar el seleccionado
    switch (modo) {
        case 'potencia':
            if (divPotencia) divPotencia.style.display = '';
            break;
        case 'corriente':
            if (divCorriente) divCorriente.style.display = '';
            break;
        case 'transformador':
            if (divTransformador) divTransformador.style.display = '';
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
        agrupamento: parseInt(document.getElementById('agrupamento').value),
        factorDemanda: parseFloat(document.getElementById('factor-demanda')?.value) || 1.0,
        tipoCircuito: document.getElementById('tipo-circuito')?.value || 'general',
        resistividadSuelo: document.getElementById('resistividad-suelo')?.value || 'normal',
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
        corriente: parseFloat(document.getElementById('corriente-ct').value),
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
        aislamiento: document.getElementById('aislamiento-dc') ? document.getElementById('aislamiento-dc').value : 'PVC',
        agrupamiento: parseInt(document.getElementById('agrupamiento-dc')?.value) || 1,
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
        aislamiento: document.getElementById('aislamiento-ct-dc') ? document.getElementById('aislamiento-ct-dc').value : 'PVC',
        aplicacionDC: document.getElementById('aplicacion-dc')?.value || 'general',
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
// PROPAGACION DE DATOS ENTRE PESTAÑAS DC
// ===================================================================

function propagarDatosAmpacidadDC(parametros, resultado) {
    // --- Pestaña Caída de Tensión DC ---
    // Potencia
    var potCTDC = document.getElementById('potencia-ct-dc');
    if (potCTDC && parametros.potencia) potCTDC.value = parametros.potencia;

    // Tensión (selector)
    var selTensionCTDC = document.getElementById('tension-ct-dc');
    if (selTensionCTDC && parametros.tensionSelector) {
        selTensionCTDC.value = parametros.tensionSelector;
    }

    // Sección (seleccionar la que se calculó por ampacidad)
    var selSeccionCTDC = document.getElementById('seccion-ct-dc');
    if (selSeccionCTDC && resultado.seccion) {
        var secStr = String(resultado.seccion);
        for (var i = 0; i < selSeccionCTDC.options.length; i++) {
            if (selSeccionCTDC.options[i].value === secStr) {
                selSeccionCTDC.selectedIndex = i;
                break;
            }
        }
    }

    // Material
    var matCTDC = document.getElementById('material-conductor-ct-dc');
    if (matCTDC && parametros.material) matCTDC.value = parametros.material;

    // Temperatura
    var tempCTDC = document.getElementById('temperatura-ct-dc');
    if (tempCTDC && parametros.temperatura) tempCTDC.value = parametros.temperatura;

    // Aislamiento
    var aisCTDC = document.getElementById('aislamiento-ct-dc');
    if (aisCTDC && parametros.aislamiento) aisCTDC.value = parametros.aislamiento;

    // --- Pestaña Cortocircuito DC ---
    // Sección
    var selSeccionCCDC = document.getElementById('seccion-cc-dc');
    if (selSeccionCCDC && resultado.seccion) {
        var secStr = String(resultado.seccion);
        for (var i = 0; i < selSeccionCCDC.options.length; i++) {
            if (selSeccionCCDC.options[i].value === secStr) {
                selSeccionCCDC.selectedIndex = i;
                break;
            }
        }
    }

    // Material
    var matCCDC = document.getElementById('material-cc-dc');
    if (matCCDC && parametros.material) matCCDC.value = parametros.material;

    // Aislamiento
    var aisCCDC = document.getElementById('aislamiento-cc-dc');
    if (aisCCDC && parametros.aislamiento) aisCCDC.value = parametros.aislamiento;

    mostrarMensaje('Datos propagados a Caída de Tensión DC y Cortocircuito DC', 'info');
}

// ===================================================================
// CALCULO AC - PROYECTO (Dimensionamiento por Ampacidad)
// ===================================================================

function calcularProyecto() {
    try {
        appState.isCalculating = true;

        var parametros = obtenerParametrosProyecto();

        // Validar segun modo de entrada
        var errores = [];
        if (parametros.modoEntrada === 'potencia') {
            if (!parametros.potencia || isNaN(parametros.potencia) || parametros.potencia <= 0) {
                errores.push('Potencia es requerida y debe ser mayor que 0');
            }
        } else if (parametros.modoEntrada === 'corriente') {
            if (!parametros.corrienteDirecta || isNaN(parametros.corrienteDirecta) || parametros.corrienteDirecta <= 0) {
                errores.push('Corriente es requerida y debe ser mayor que 0');
            }
        } else if (parametros.modoEntrada === 'transformador') {
            if (!parametros.potenciaTransformadorKVA || isNaN(parametros.potenciaTransformadorKVA) || parametros.potenciaTransformadorKVA <= 0) {
                errores.push('Potencia del transformador (kVA) es requerida y debe ser mayor que 0');
            }
        }
        if (!parametros.tension || isNaN(parametros.tension)) {
            errores.push('Tensión es requerida');
        }
        if (errores.length > 0) {
            mostrarErroresValidacion(errores);
            return;
        }

        // Pasar todos los parametros a dimensionarPorAmpacidadAC (maneja los 3 modos internamente)
        var resultado = dimensionarPorAmpacidadAC(parametros);

        // Mostrar resultados
        mostrarResultadosProyecto(resultado);

        // Guardar en estado
        appState.calculos.proyecto = {
            parametros: parametros,
            resultado: resultado
        };

        mostrarMensaje('Dimensionamiento AC calculado correctamente', 'exito');

        // Mostrar advertencia si se usó método fallback
        if (resultado.advertenciaFallback) {
            mostrarMensaje(resultado.advertenciaFallback, 'advertencia');
        }

        // Propagar datos a pestañas de Caída de Tensión y Cortocircuito AC
        propagarDatosAmpacidadAC(parametros, resultado);

        // Mark tab as completed
        var tab = document.querySelector('[data-tab="proyecto"]');
        if (tab && !tab.textContent.includes('\u2713')) {
            tab.textContent = tab.textContent.trim() + ' \u2713';
        }

        guardarEnHistorial('proyecto', parametros, resultado);
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
        seccion.classList.remove('hidden');
        seccion.style.display = 'block';
    }

    var campos = {
        'corriente-proyecto': resultado.corriente !== undefined ? resultado.corriente.toFixed(2) + ' A' : '--',
        'corriente-corregida': resultado.corrienteCorregida !== undefined ? resultado.corrienteCorregida.toFixed(2) + ' A' : '--',
        'factor-temp-ac': resultado.factorTemperatura !== undefined ? resultado.factorTemperatura.toFixed(2) : '--',
        'factor-agrup-ac': resultado.factorAgrupamiento !== undefined ? resultado.factorAgrupamiento.toFixed(2) : '--',
        'seccion-minima': resultado.seccion !== undefined ? resultado.seccion + ' mm\u00B2' : '--',
        'ampacidad-seleccionada': resultado.ampacidad !== undefined ? resultado.ampacidad + ' A' : '--'
    };

    Object.keys(campos).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = campos[id];
    });

    // Show ground conductor
    if (window.calcularConductorProteccion && resultado.seccion) {
        var seccionTierra = window.calcularConductorProteccion(resultado.seccion);
        setTexto('conductor-proteccion', seccionTierra + ' mm\u00B2');
    }
}

// ===================================================================
// PROPAGACION DE DATOS ENTRE PESTAÑAS AC
// ===================================================================

/**
 * Después de calcular ampacidad, propaga sección, corriente y parámetros
 * comunes a las pestañas de caída de tensión y cortocircuito AC.
 * Los campos se pre-llenan pero el usuario puede modificarlos manualmente.
 */
function propagarDatosAmpacidadAC(parametros, resultado) {
    // --- Pestaña Caída de Tensión AC ---
    // Sección del conductor (seleccionar la opción correspondiente)
    var selSeccion = document.getElementById('seccion-ct');
    if (selSeccion) {
        var seccionStr = String(resultado.seccion);
        for (var i = 0; i < selSeccion.options.length; i++) {
            if (selSeccion.options[i].value === seccionStr) {
                selSeccion.selectedIndex = i;
                break;
            }
        }
    }

    // Tensión
    var selTensionCT = document.getElementById('tension-ct');
    if (selTensionCT && parametros.tension) {
        var tensionStr = String(parametros.tension);
        for (var i = 0; i < selTensionCT.options.length; i++) {
            if (selTensionCT.options[i].value === tensionStr) {
                selTensionCT.selectedIndex = i;
                break;
            }
        }
    }

    // Tipo de sistema
    var selSistemaCT = document.getElementById('tipo-sistema-ct');
    if (selSistemaCT && parametros.tipoSistema) {
        selSistemaCT.value = parametros.tipoSistema;
    }

    // Factor de potencia
    var fpCT = document.getElementById('fp-ct');
    if (fpCT && parametros.factorPotencia) {
        fpCT.value = parametros.factorPotencia;
    }

    // Material del conductor
    var matCT = document.getElementById('material-ct');
    if (matCT && parametros.materialCondutor) {
        matCT.value = parametros.materialCondutor;
    }

    // Corriente de proyecto (siempre propagar, independiente del modo de entrada)
    var corrienteCT = document.getElementById('corriente-ct');
    if (corrienteCT && resultado.corriente) {
        corrienteCT.value = resultado.corriente;
    }

    // --- Pestaña Cortocircuito AC ---
    // Sección del conductor
    var selSeccionCC = document.getElementById('seccion-cc');
    if (selSeccionCC) {
        var seccionStr = String(resultado.seccion);
        for (var i = 0; i < selSeccionCC.options.length; i++) {
            if (selSeccionCC.options[i].value === seccionStr) {
                selSeccionCC.selectedIndex = i;
                break;
            }
        }
    }

    // Material del conductor
    var matCC = document.getElementById('material-cc');
    if (matCC && parametros.materialCondutor) {
        matCC.value = parametros.materialCondutor;
    }

    // Aislamiento (mapear aislamiento AC a PVC/EPR para cortocircuito)
    var aisCC = document.getElementById('aislamiento-cc');
    if (aisCC && parametros.materialAislamento) {
        var ais = parametros.materialAislamento;
        // EPR_90, EPR_105, HEPR → EPR; PVC → PVC
        aisCC.value = (ais === 'PVC') ? 'PVC' : 'EPR';
    }

    mostrarMensaje('Datos propagados a Caída de Tensión y Cortocircuito AC', 'info');
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

        // Usar corriente directamente (ya viene del cálculo de ampacidad o ingresada manualmente)
        var resultado = calcularCaidaTensionAC({
            corriente: parametros.corriente,
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

        // Mark tab as completed
        var tab = document.querySelector('[data-tab="caida-tension"]');
        if (tab && !tab.textContent.includes('\u2713')) {
            tab.textContent = tab.textContent.trim() + ' \u2713';
        }

        guardarEnHistorial('caida-tension', parametros, resultado);
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

    var elPct = document.getElementById('caida-tension-valor');
    if (elPct) elPct.textContent = resultado.caidaTensionPct.toFixed(2) + '%';

    var elStatus = document.getElementById('caida-tension-status');
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

        // Mark tab as completed
        var tab = document.querySelector('[data-tab="cortocircuito"]');
        if (tab && !tab.textContent.includes('\u2713')) {
            tab.textContent = tab.textContent.trim() + ' \u2713';
        }

        guardarEnHistorial('cortocircuito', parametros, resultado);
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

    var elCorriente = document.getElementById('corriente-cortocircuito');
    if (elCorriente) elCorriente.textContent = resultado.corrienteCortocircuito.toFixed(2) + ' kA';

    var elSeccion = document.getElementById('seccion-minima-cc');
    if (elSeccion) elSeccion.textContent = resultado.seccionMinima + ' mm\u00B2';

    var elStatus = document.getElementById('cortocircuito-status');
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
        setTexto('resumen-cc-ac', cc.resultado.corrienteCortocircuito.toFixed(2) + ' kA');
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

        // Propagar datos a pestañas de Caída de Tensión DC y Cortocircuito DC
        propagarDatosAmpacidadDC(parametros, resultado);

        // Mark tab as completed
        var tab = document.querySelector('[data-tab="ampacidad-dc"]');
        if (tab && !tab.textContent.includes('\u2713')) {
            tab.textContent = tab.textContent.trim() + ' \u2713';
        }

        guardarEnHistorial('ampacidad-dc', parametros, resultado);
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

        // Mark tab as completed
        var tab = document.querySelector('[data-tab="caida-tension-dc"]');
        if (tab && !tab.textContent.includes('\u2713')) {
            tab.textContent = tab.textContent.trim() + ' \u2713';
        }

        guardarEnHistorial('caida-tension-dc', parametros, resultado);
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

        // Mark tab as completed
        var tab = document.querySelector('[data-tab="cortocircuito-dc"]');
        if (tab && !tab.textContent.includes('\u2713')) {
            tab.textContent = tab.textContent.trim() + ' \u2713';
        }

        guardarEnHistorial('cortocircuito-dc', parametros, resultado);
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
        'proyecto': ['potencia', 'corriente-directa', 'potencia-transformador-kva', 'tension', 'factor-potencia'],
        'caida-tension': ['corriente-ct', 'tension-ct', 'longitud-ct', 'seccion-ct', 'fp-ct'],
        'cortocircuito': ['potencia-cc', 'tension-cc', 'tiempo-despeje', 'seccion-cc'],
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
    actualizarResumenDC();
    const contenido = document.getElementById('resultados-dc');
    if (contenido) {
        contenido.classList.add('print-active');
        window.print();
        setTimeout(() => contenido.classList.remove('print-active'), 1000);
    }
}

function generarReporteAC() {
    actualizarResumenAC();
    const contenido = document.getElementById('resultados-ac');
    if (contenido) {
        contenido.classList.add('print-active');
        window.print();
        setTimeout(() => contenido.classList.remove('print-active'), 1000);
    }
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

// ===================================================================
// VALIDACION EN TIEMPO REAL
// ===================================================================

function configurarValidacionEnTiempoReal() {
    document.querySelectorAll('input[type="number"]').forEach(function (input) {
        input.addEventListener('input', function () {
            this.classList.remove('campo-error');
            var errorEl = this.parentElement.querySelector('.error-campo');
            if (errorEl) errorEl.remove();

            var val = parseFloat(this.value);
            if (this.value && isNaN(val)) {
                this.classList.add('campo-error');
            } else if (this.min && val < parseFloat(this.min)) {
                this.classList.add('campo-error');
            } else if (this.max && val > parseFloat(this.max)) {
                this.classList.add('campo-error');
            }
        });
    });
}

// ===================================================================
// HISTORIAL DE CALCULOS (localStorage)
// ===================================================================

function guardarEnHistorial(tipo, parametros, resultado) {
    var historial = JSON.parse(localStorage.getItem('historialCalculos') || '[]');
    historial.unshift({
        tipo: tipo,
        parametros: parametros,
        resultado: resultado,
        fecha: new Date().toISOString()
    });
    // Keep last 50
    if (historial.length > 50) historial.length = 50;
    localStorage.setItem('historialCalculos', JSON.stringify(historial));
}

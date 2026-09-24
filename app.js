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

    // Validacion en tiempo real
    configurarValidacionEnTiempoReal();

    // Mostrar datos del suelo solo para el método enterrado (D)
    configurarMetodoEnterrado('metodo-instalacao', 'fila-resistividad', 'temperatura-ambiente');
    configurarMetodoEnterrado('metodo-instalacao-dc', 'fila-resistividad-dc', 'temperatura-ambiente-dc');
    configurarRendimientoMotorDC();
    configurarPartidaMotor();

    // Aluminio solo existe rígido: la clase acompaña al material
    configurarClaseConductor('material-ct', 'clase-ct');
    configurarClaseConductor('material-conductor-ct-dc', 'clase-ct-dc');
});

/**
 * Con aluminio, la clase queda en rígido y la opción flexible se deshabilita.
 * Se llama también después de propagar datos desde ampacidad.
 */
function ajustarClaseConductor(idMaterial, idClase) {
    var mat = document.getElementById(idMaterial);
    var clase = document.getElementById(idClase);
    if (!mat || !clase) return;
    var esAluminio = mat.value === 'aluminio';
    var optFlex = clase.querySelector('option[value="flexible"]');
    if (optFlex) optFlex.disabled = esAluminio;
    if (esAluminio) clase.value = 'rigido';
}

function configurarClaseConductor(idMaterial, idClase) {
    var mat = document.getElementById(idMaterial);
    if (!mat) return;
    mat.addEventListener('change', function () { ajustarClaseConductor(idMaterial, idClase); });
    ajustarClaseConductor(idMaterial, idClase);
}

/** Muestra los campos de partida, alimentador y trafo según sus selectores Sí/No. */
function configurarPartidaMotor() {
    [['partida-ct', 'partida-campos'], ['alim-partida-ct', 'alim-partida-campos'], ['trafo-partida-ct', 'trafo-partida-campos']]
        .forEach(function (par) {
            var sel = document.getElementById(par[0]), bloque = document.getElementById(par[1]);
            if (!sel || !bloque) return;
            var actualizar = function () { bloque.style.display = sel.value === 'si' ? '' : 'none'; };
            sel.addEventListener('change', actualizar);
            actualizar();
        });
}

/**
 * Método D (enterrado), AC y DC: muestra la fila de suelo y ajusta la temperatura inicial a la
 * referencia de las tablas INPACO (40 °C aire, 25 °C suelo). La temperatura solo se cambia si
 * el campo tiene la referencia del método anterior y el usuario no la escribió.
 */
function configurarMetodoEnterrado(idMetodo, idFila, idTemp) {
    var metodo = document.getElementById(idMetodo);
    var fila = document.getElementById(idFila);
    if (!metodo || !fila) return;
    var actualizar = function () {
        fila.style.display = metodo.value === 'D' ? '' : 'none';
    };
    metodo.addEventListener('change', actualizar);
    actualizar();

    var temp = document.getElementById(idTemp);
    if (!temp) return;
    var referencia = function (m) { return m === 'D' ? '25' : '40'; };
    var anterior = metodo.value;
    temp.addEventListener('input', function () { temp.dataset.editado = '1'; });
    metodo.addEventListener('change', function () {
        if (!temp.dataset.editado && temp.value === referencia(anterior)) temp.value = referencia(metodo.value);
        anterior = metodo.value;
    });
}

/** Motor DC en modo potencia: pide el rendimiento (la potencia de placa es mecánica). */
function configurarRendimientoMotorDC() {
    var tipo = document.getElementById('tipo-carga-dc'), modo = document.getElementById('modo-entrada-dc');
    var fila = document.getElementById('fila-rendimiento-dc');
    if (!tipo || !modo || !fila) return;
    var actualizar = function () { fila.style.display = tipo.value === 'motor' && modo.value === 'potencia' ? '' : 'none'; };
    tipo.addEventListener('change', actualizar);
    modo.addEventListener('change', actualizar);
    actualizar();
}

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
        case 'resultados-dc':
            actualizarResumenDC();
            break;
        case 'resultados-ac':
            actualizarResumenAC();
            break;
        case 'historial':
            renderHistorial();
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

    // DC mode selector
    var selectorDC = document.getElementById('modo-entrada-dc');
    if (selectorDC) {
        selectorDC.addEventListener('change', function () {
            aplicarModoEntradaDC(this.value);
        });
        aplicarModoEntradaDC(selectorDC.value || 'potencia');
    }
}

function aplicarModoEntradaDC(modo) {
    var divPotencia = document.getElementById('campos-potencia-dc');
    var divCorriente = document.getElementById('campos-corriente-dc');
    if (divPotencia) divPotencia.style.display = modo === 'potencia' ? '' : 'none';
    if (divCorriente) divCorriente.style.display = modo === 'corriente' ? '' : 'none';
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
        agrupamento: parseFloat(document.getElementById('agrupamento').value),
        factorDemanda: parseFloat(document.getElementById('factor-demanda')?.value),
        tipoCircuito: document.getElementById('tipo-circuito')?.value || 'general',
        resistividadSuelo: parseFloat(document.getElementById('resistividad-suelo')?.value) || 1.0,
        tipoEnterrado: document.getElementById('tipo-enterrado')?.value || 'ducto',
        conductoresPorFase: parseInt(document.getElementById('conductores-por-fase')?.value) || 1,
        neutroCargado: document.getElementById('neutro-cargado')?.value === 'si',
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
    var mat = document.getElementById('material-ct').value;
    return {
        corriente: parseFloat(document.getElementById('corriente-ct').value),
        tension: parseFloat(document.getElementById('tension-ct').value),
        longitud: parseFloat(document.getElementById('longitud-ct').value),
        seccion: parseFloat(document.getElementById('seccion-ct').value),
        tipoSistema: document.getElementById('tipo-sistema-ct').value,
        factorPotencia: parseFloat(document.getElementById('fp-ct').value),
        material: mat,
        materialCondutor: mat,
        aislamiento: document.getElementById('aislamiento-ct')?.value || 'PVC',
        conductoresPorFase: parseInt(document.getElementById('paralelo-ct')?.value) || 1,
        limite: parseFloat(document.getElementById('limite-ct')?.value) || 4,
        disposicion: document.getElementById('disposicion-ct')?.value || 'trebol',
        clase: document.getElementById('clase-ct')?.value || undefined,
        frecuencia: parseFloat(document.getElementById('frecuencia-ct')?.value) || 50,
        tipoCable: document.getElementById('tipo-cable-ct').value,
        partida: obtenerParametrosPartida()
    };
}

/** Datos de la partida de motor (null si no se verifica). Los campos vacíos llegan como NaN y los rechaza la validación. */
function obtenerParametrosPartida() {
    var valor = function (id) { return document.getElementById(id).value; };
    if (valor('partida-ct') !== 'si') return null;
    return {
        relacionIp: parseFloat(valor('relacion-ip-ct')),
        fpPartida: parseFloat(valor('fp-partida-ct')),
        limite: parseFloat(valor('limite-partida-ct')),
        otrasCargas: { corriente: parseFloat(valor('otras-cargas-ct')), factorPotencia: parseFloat(valor('fp-otras-ct')) },
        alimentador: valor('alim-partida-ct') === 'si' ? {
            longitud: parseFloat(valor('alim-longitud-ct')),
            seccion: parseFloat(valor('alim-seccion-ct')),
            conductoresPorFase: parseInt(valor('alim-paralelo-ct'), 10)
        } : null,
        trafo: valor('trafo-partida-ct') === 'si' ? {
            potenciaKVA: parseFloat(valor('trafo-kva-ct')),
            impedanciaPct: parseFloat(valor('trafo-z-ct'))
        } : null
    };
}

function obtenerParametrosCortocircuitoAC() {
    var mat = document.getElementById('material-cc').value;
    var ais = document.getElementById('aislamiento-cc').value;
    var tensionV = parseFloat(document.getElementById('tension-cc').value);
    return {
        potenciaCortocircuito: parseFloat(document.getElementById('potencia-cc').value),
        tensionSistema: tensionV / 1000,  // Convertir V a kV para la fórmula
        tiempoDespeje: parseFloat(document.getElementById('tiempo-despeje').value),
        seccion: parseFloat(document.getElementById('seccion-cc').value),
        material: mat,
        materialCondutor: mat,
        aislamiento: ais,
        materialAislamiento: ais
    };
}

// ===================================================================
// OBTENCION DE PARAMETROS - DC
// ===================================================================

function obtenerParametrosAmpacidadDC() {
    var modo = document.getElementById('modo-entrada-dc') ? document.getElementById('modo-entrada-dc').value : 'potencia';
    var tensionSelector = document.getElementById('tension-dc').value;
    var tensionPersonalizada = document.getElementById('tension-personalizada') ? document.getElementById('tension-personalizada').value : '';

    var params = {
        modoEntrada: modo,
        tensionSelector: tensionSelector,
        tensionPersonalizada: tensionPersonalizada,
        material: document.getElementById('material-condutor-dc').value,
        temperatura: parseFloat(document.getElementById('temperatura-ambiente-dc').value),
        metodo: document.getElementById('metodo-instalacao-dc').value,
        aislamiento: document.getElementById('aislamiento-dc') ? document.getElementById('aislamiento-dc').value : 'PVC',
        agrupamiento: parseFloat(document.getElementById('agrupamiento-dc')?.value),
        tipoCarga: document.getElementById('tipo-carga-dc').value,
        tipoEnterrado: document.getElementById('tipo-enterrado-dc').value,
        resistividadSuelo: parseFloat(document.getElementById('resistividad-suelo-dc').value),
    };

    if (modo === 'potencia') {
        params.potencia = parseFloat(document.getElementById('potencia-dc').value);
        if (params.tipoCarga === 'motor') params.rendimiento = parseFloat(document.getElementById('rendimiento-dc').value);
    } else {
        params.corrienteDirecta = parseFloat(document.getElementById('corriente-directa-dc').value);
    }

    return params;
}

function obtenerParametrosCaidaTensionDC() {
    var tensionSelector = document.getElementById('tension-ct-dc').value;
    var tensionPersonalizada = document.getElementById('tension-personalizada-ct-dc') ? document.getElementById('tension-personalizada-ct-dc').value : '';

    return {
        corriente: parseFloat(document.getElementById('corriente-ct-dc').value),
        tensionSelector: tensionSelector,
        tensionPersonalizada: tensionPersonalizada,
        longitud: parseFloat(document.getElementById('longitud-ct-dc').value),
        conductoresPorPolo: parseInt(document.getElementById('conductores-paralelo').value),
        seccion: parseFloat(document.getElementById('seccion-ct-dc').value),
        material: document.getElementById('material-conductor-ct-dc') ? document.getElementById('material-conductor-ct-dc').value : 'cobre',
        aislamiento: document.getElementById('aislamiento-ct-dc') ? document.getElementById('aislamiento-ct-dc').value : 'PVC',
        clase: document.getElementById('clase-ct-dc')?.value || undefined,
        aplicacionDC: document.getElementById('aplicacion-dc').value,
        tipoCable: document.getElementById('tipo-cable-ct-dc').value,
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
    // Corriente (propagada desde ampacidad)
    var corrCTDC = document.getElementById('corriente-ct-dc');
    if (corrCTDC && resultado.corriente) corrCTDC.value = resultado.corriente;

    // Tensión (selector)
    var selTensionCTDC = document.getElementById('tension-ct-dc');
    if (selTensionCTDC && parametros.tensionSelector) {
        selTensionCTDC.value = parametros.tensionSelector;
        var filaPers = document.getElementById('tension-personalizada-ct-dc-row');
        var inputPers = document.getElementById('tension-personalizada-ct-dc');
        if (parametros.tensionSelector === 'personalizado' && filaPers && inputPers) {
            filaPers.style.display = 'block';
            inputPers.value = parametros.tensionPersonalizada;
        } else if (filaPers) {
            filaPers.style.display = 'none';
        }
    }

    // Sección (seleccionar la que se calculó por ampacidad)
    seleccionarOpcionPorValor('seccion-ct-dc', resultado.seccion);

    // Material
    var matCTDC = document.getElementById('material-conductor-ct-dc');
    if (matCTDC && parametros.material) {
        matCTDC.value = parametros.material;
        ajustarClaseConductor('material-conductor-ct-dc', 'clase-ct-dc');
    }

    // Aislamiento
    var aisCTDC = document.getElementById('aislamiento-ct-dc');
    if (aisCTDC && parametros.aislamiento) aisCTDC.value = parametros.aislamiento;

    // --- Pestaña Cortocircuito DC ---
    // Sección
    seleccionarOpcionPorValor('seccion-cc-dc', resultado.seccion);

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

        var validacion = validarParametrosAmpacidadAC(parametros);
        if (!validacion.valido) {
            descartarResultados('proyecto', 'resultados-proyecto');
            mostrarErroresValidacion(validacion.errores);
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

        (resultado.advertencias || []).forEach(function (adv) {
            mostrarMensaje(adv, 'advertencia');
        });

        // Propagar datos a pestañas de Caída de Tensión y Cortocircuito AC
        invalidarDependientes([['caidaTension', 'resultados-caida-tension'], ['cortocircuito', 'resultados-cortocircuito']]);
        propagarDatosAmpacidadAC(parametros, resultado);

        // Mark tab as completed
        var tab = document.querySelector('[data-tab="proyecto"]');
        if (tab && !tab.textContent.includes('\u2713')) {
            tab.textContent = tab.textContent.trim() + ' \u2713';
        }

        guardarEnHistorial('proyecto', parametros, resultado);
    } catch (error) {
        console.error('Error en calculo de proyecto:', error);
        descartarResultados('proyecto', 'resultados-proyecto');
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
        'seccion-minima': resultado.seccion !== undefined
            ? (resultado.conductoresPorFase > 1 ? resultado.conductoresPorFase + ' \u00D7 ' : '') + resultado.seccion + ' mm\u00B2'
            : '--',
        'ampacidad-seleccionada': resultado.ampacidad !== undefined ? resultado.ampacidad + ' A' : '--',
        'capacidad-corregida': resultado.capacidadCorregida !== undefined ? resultado.capacidadCorregida.toFixed(1) + ' A' : '--'
    };

    Object.keys(campos).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = campos[id];
    });

    // Factor de resistividad del suelo: solo relevante en instalaciones enterradas
    var cardResist = document.getElementById('card-factor-resistividad');
    if (cardResist) {
        var enterrado = resultado.metodoUsado === 'D';
        cardResist.style.display = enterrado ? '' : 'none';
        setTexto('factor-resist-ac', enterrado ? resultado.factorResistividad.toFixed(2) : '--');
    }

    setTexto('conductor-proteccion', textoConductorProteccion(resultado));
}

/**
 * Conductor de protección (NBR 5410 Tabla 58) sobre la sección TOTAL de fase.
 */
function textoConductorProteccion(resultado) {
    if (!window.calcularConductorProteccion || !resultado || !resultado.seccion) return '--';
    var n = resultado.conductoresPorFase || 1;
    if (n > 1) {
        var faseTotal = n * resultado.seccion;
        var peTotal = faseTotal <= 16 ? faseTotal : (faseTotal <= 35 ? 16 : faseTotal / 2);
        var pePorTerna = window.redondearSeccionComercial(peTotal / n) || peTotal / n;
        return n + ' \u00D7 ' + pePorTerna + ' mm\u00B2 (\u2265 ' + peTotal + ' mm\u00B2 total)';
    }
    return window.calcularConductorProteccion(resultado.seccion) + ' mm\u00B2';
}

// ===================================================================
// PROPAGACION DE DATOS ENTRE PESTAÑAS AC
// ===================================================================

/**
 * Selecciona en un <select> la opción cuyo value coincide con `valor`.
 * Si no existe, vuelve a la primera opción ("Seleccionar...") para no dejar
 * un valor obsoleto de un cálculo anterior.
 */
function seleccionarOpcionPorValor(id, valor) {
    var sel = document.getElementById(id);
    if (!sel) return false;
    var valorStr = String(valor);
    for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === valorStr) {
            sel.selectedIndex = i;
            return true;
        }
    }
    sel.selectedIndex = 0;
    return false;
}

/**
 * Después de calcular ampacidad, propaga sección, corriente y parámetros
 * comunes a las pestañas de caída de tensión y cortocircuito AC.
 * Los campos se pre-llenan pero el usuario puede modificarlos manualmente.
 */
function propagarDatosAmpacidadAC(parametros, resultado) {
    // --- Pestaña Caída de Tensión AC ---
    // Sección del conductor (seleccionar la opción correspondiente)
    seleccionarOpcionPorValor('seccion-ct', resultado.seccion);

    // Tensión
    if (parametros.tension) {
        seleccionarOpcionPorValor('tension-ct', parametros.tension);
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
        ajustarClaseConductor('material-ct', 'clase-ct');
    }

    // Aislamiento (define la temperatura de servicio para la resistencia)
    var aisCT = document.getElementById('aislamiento-ct');
    if (aisCT && parametros.materialAislamento) {
        aisCT.value = (parametros.materialAislamento === 'PVC') ? 'PVC' : 'EPR_90';
    }

    // Conductores en paralelo por fase
    seleccionarOpcionPorValor('paralelo-ct', resultado.conductoresPorFase || 1);

    // Disposición (define la reactancia): multipolar, unipolares en contacto o espaciados
    var disposicionPorMetodo = { A2: 'tripolar', B2: 'tripolar', E: 'tripolar', G: 'plano_2D' };
    seleccionarOpcionPorValor('disposicion-ct', disposicionPorMetodo[parametros.metodoInstalacao] || 'trebol');

    // Corriente de proyecto (siempre propagar, independiente del modo de entrada)
    var corrienteCT = document.getElementById('corriente-ct');
    if (corrienteCT && resultado.corriente) {
        corrienteCT.value = resultado.corriente;
    }

    // --- Pestaña Cortocircuito AC ---
    // Sección del conductor
    seleccionarOpcionPorValor('seccion-cc', resultado.seccion);

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

    // Tensión de línea: solo se copia si el circuito es trifásico. En mono/bifásico
    // la tensión del circuito puede ser fase-neutro y la fórmula Scc/(√3·V) pide
    // la tensión entre fases, así que se deja para que el usuario la elija.
    if (parametros.tension && parametros.tipoSistema === 'trifasico') {
        seleccionarOpcionPorValor('tension-cc', parametros.tension);
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
            descartarResultados('caidaTension', 'resultados-caida-tension');
            mostrarErroresValidacion(validacion.errores);
            return;
        }
        (validacion.advertencias || []).forEach(function (adv) {
            mostrarMensaje(adv, 'advertencia');
        });

        // Usar corriente directamente (ya viene del cálculo de ampacidad o ingresada manualmente)
        var resultado = calcularCaidaTensionAC(parametros);
        resultado.seccionMinimaCaida = calcularSeccionMinimaCaidaAC(parametros);
        var exigencia = verificacionCaidaExigida(parametros.tipoCable, parametros.longitud);
        resultado.exigida = exigencia.exigida;
        resultado.motivoNoExigida = exigencia.motivo;
        if (!exigencia.exigida) mostrarMensaje(exigencia.motivo + '. El resultado es informativo y no define la sección final.', 'info');
        if (parametros.partida) {
            var pp = parametrosPartidaDesdeCaida(parametros);
            resultado.partida = calcularCaidaPartidaMotor(pp);
            resultado.partida.seccionMinima = calcularSeccionMinimaPartida(pp);
            // La corriente de la pestaña es la In del motor: si vino de Ampacidad con factor de
            // demanda < 1, la Ip queda reducida en la misma proporción (del lado inseguro)
            var pr = appState.calculos.proyecto;
            if (pr && pr.resultado && pr.resultado.factorDemanda < 1 && Math.abs(pr.resultado.corriente - parametros.corriente) < 0.01) {
                mostrarMensaje('Partida: la corriente viene de Ampacidad con factor de demanda ' + pr.resultado.factorDemanda +
                    '. Para la partida ingresá la corriente nominal del motor (sin factor de demanda).', 'advertencia');
            }
        }

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
        descartarResultados('caidaTension', 'resultados-caida-tension');
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
    if (elPct) elPct.textContent = textoPct(resultado.caidaTensionPct, resultado.limite, resultado.cumple) + ' (l\u00EDmite ' + resultado.limite + '%)';
    setTexto('caida-tension-volts', resultado.caidaTensionV.toFixed(2) + ' V');
    setTexto('resistencia-ct', 'R ' + resultado.resistencia + ' / X ' + resultado.reactancia + ' \u03A9/km (' +
        (resultado.clase === 'flexible' ? 'flexible' : 'r\u00EDgido') + ', ' +
        resultado.temperaturaConductor + ' \u00B0C, ' + resultado.frecuencia + ' Hz)');
    setTexto('seccion-minima-ct', resultado.seccionMinimaCaida
        ? resultado.seccionMinimaCaida.seccion + ' mm\u00B2'
        : 'Ninguna \u2264 300 mm\u00B2: aumentar paralelo');

    var elStatus = document.getElementById('caida-tension-status');
    if (elStatus) {
        elStatus.textContent = textoEstadoCaida(resultado.cumple, resultado.exigida);
        elStatus.className = resultado.exigida === false ? '' : (resultado.cumple ? 'resultado-ok' : 'resultado-error');
    }
    mostrarResultadosPartida(resultado.partida);
}

/**
 * Porcentaje para mostrar junto a CUMPLE / NO CUMPLE. El veredicto se decide con el valor
 * exacto: si el redondeo lo deja en el límite pero no cumple, se muestra "> límite".
 */
/** CUMPLE / NO CUMPLE, o NO EXIGIDA en cables de control sin obligación (Itaipu R1A §10.3.3). */
function textoEstadoCaida(cumple, exigida) {
    if (exigida === false) return 'NO EXIGIDA (' + (cumple ? 'cumple' : 'no cumple') + ')';
    return cumple ? 'CUMPLE' : 'NO CUMPLE';
}

function textoPct(pct, limite, cumple) {
    return (!cumple && pct <= limite ? '> ' + Number(limite).toFixed(2) : Number(pct).toFixed(2)) + '%';
}

function mostrarResultadosPartida(rp) {
    var bloque = document.getElementById('resultados-partida-ct');
    if (!bloque) return;
    bloque.style.display = rp ? 'block' : 'none';
    if (!rp) return;
    setTexto('partida-caida-valor', textoPct(rp.caidaTotalPct, rp.limite, rp.cumple) + ' (l\u00EDmite ' + rp.limite + '%)');
    var st = document.getElementById('partida-status');
    st.textContent = rp.cumple ? 'CUMPLE' : 'NO CUMPLE';
    st.className = rp.cumple ? 'resultado-ok' : 'resultado-error';
    setTexto('partida-corriente', rp.corrientePartida.toFixed(1) + ' A');
    setTexto('partida-seccion-minima', rp.seccionMinima ? rp.seccionMinima.seccion + ' mm\u00B2'
        : 'Ninguna \u2264 300 mm\u00B2 (revisar alimentador / trafo)');
    var cont = document.getElementById('partida-tramos');
    cont.textContent = '';
    cont.appendChild(tablaReporte(rp.tramos.map(function (tr) {
        return [tr.tramo, tr.caidaPct.toFixed(2) + ' % \u00B7 ' + tr.corriente.toFixed(1) + ' A \u00B7 cos\u03C6 ' + tr.factorPotencia.toFixed(2)];
    })));
    setTexto('partida-aviso', rp.soloCircuito
        ? 'Solo se calcul\u00F3 el circuito del motor: la R1A pide todo el sistema de BT hasta el primario del trafo (incluir alimentador y trafo).'
        : '');
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
            descartarResultados('cortocircuito', 'resultados-cortocircuito');
            mostrarErroresValidacion(validacion.errores);
            return;
        }
        (validacion.advertencias || []).forEach(function (adv) {
            mostrarMensaje(adv, 'advertencia');
        });

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
        descartarResultados('cortocircuito', 'resultados-cortocircuito');
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
    setTexto('seccion-comercial-cc', resultado.seccionComercial ? resultado.seccionComercial + ' mm\u00B2' : '> 1000 mm\u00B2');

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
        var nAmp = r.conductoresPorFase > 1 ? r.conductoresPorFase + ' \u00D7 ' : '';
        setTexto('resumen-seccion-ampacidad-ac', r.seccion !== undefined ? nAmp + r.seccion + ' mm\u00B2' : '--');
    } else {
        setTexto('resumen-corriente-ac', 'No calculado');
        setTexto('resumen-seccion-ampacidad-ac', 'No calculado');
    }

    // Caida de tension
    if (caida && caida.resultado) {
        setTexto('resumen-caida-ac', textoPct(caida.resultado.caidaTensionPct, caida.resultado.limite, caida.resultado.cumple));
        var elEstadoCaida = document.getElementById('resumen-estado-caida-ac');
        if (elEstadoCaida) {
            elEstadoCaida.textContent = textoEstadoCaida(caida.resultado.cumple, caida.resultado.exigida);
            elEstadoCaida.className = caida.resultado.exigida === false ? '' : (caida.resultado.cumple ? 'resultado-ok' : 'resultado-error');
        }
    } else {
        setTexto('resumen-caida-ac', 'No calculado');
        setTexto('resumen-estado-caida-ac', '--');
    }
    var rpart = caida && caida.resultado && caida.resultado.partida;
    var elPart = document.getElementById('resumen-partida-ac');
    if (elPart) {
        elPart.textContent = rpart ? textoPct(rpart.caidaTotalPct, rpart.limite, rpart.cumple) + ' \u2014 ' + (rpart.cumple ? 'CUMPLE' : 'NO CUMPLE') : 'No verificada';
        elPart.className = rpart ? (rpart.cumple ? 'resultado-ok' : 'resultado-error') : '';
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
    var r = calcularSeccionFinalAC();
    setTexto('seccion-final-ac', r.texto);
    setTexto('criterio-restrictivo-ac', r.criterio);
    setTexto('pe-final-ac', r.valor ? textoConductorProteccion({ seccion: r.valor, conductoresPorFase: r.nParalelo }) : '--');
}

/**
 * Sección final AC = la mayor entre los criterios calculados. Devuelve
 * { texto, criterio, criterios: [{valor, criterio}], nParalelo }.
 */
function calcularSeccionFinalAC() {
    var proyecto = appState.calculos.proyecto;
    var caida = appState.calculos.caidaTension;
    var cc = appState.calculos.cortocircuito;

    var secciones = [];
    var sinSolucion = null;

    if (proyecto && proyecto.resultado && proyecto.resultado.seccion) {
        secciones.push({ valor: proyecto.resultado.seccion, criterio: 'Ampacidad' });
    }

    // Conductores en paralelo: los de la ampacidad; sin ampacidad, los de la caída de tensión
    var nParalelo = (proyecto && proyecto.resultado)
        ? (proyecto.resultado.conductoresPorFase || 1)
        : ((caida && parseInt(caida.parametros.conductoresPorFase, 10)) || 1);

    // Menor sección que cumple la caída de tensión, con el mismo número de
    // conductores en paralelo que el dimensionamiento por ampacidad
    if (caida && caida.resultado) {
        // Cable de control sin obligación (Itaipu R1A §10.3.3): la caída no define la sección
        if (caida.resultado.exigida !== false) {
            var minCaida = caida.resultado.seccionMinimaCaida;
            if (proyecto && proyecto.resultado && caida.parametros.conductoresPorFase !== nParalelo) {
                minCaida = calcularSeccionMinimaCaidaAC(Object.assign({}, caida.parametros, { conductoresPorFase: nParalelo }));
            }
            if (minCaida) {
                secciones.push({ valor: minCaida.seccion, criterio: 'Ca\u00EDda de Tensi\u00F3n' });
            } else {
                sinSolucion = 'Ca\u00EDda de tensi\u00F3n: ninguna secci\u00F3n hasta 300 mm\u00B2 cumple; aumentar conductores en paralelo';
            }
        }
        // Partida de motor: menor sección del circuito del motor que cumple (mismo paralelo)
        if (caida.resultado.partida) {
            var minPartida = caida.resultado.partida.seccionMinima;
            if (proyecto && proyecto.resultado && caida.parametros.conductoresPorFase !== nParalelo) {
                minPartida = calcularSeccionMinimaPartida(parametrosPartidaDesdeCaida(caida.parametros, nParalelo));
            }
            if (minPartida) {
                secciones.push({ valor: minPartida.seccion, criterio: 'Partida de Motor' });
            } else {
                sinSolucion = 'Partida de motor: ninguna secci\u00F3n del circuito hasta 300 mm\u00B2 cumple; revisar alimentador, trafo o paralelo';
            }
        }
    }

    // Cortocircuito: sección comercial mínima. Con conductores en paralelo se exige
    // a CADA conductor (una falla en uno de ellos puede recibir casi toda la Icc).
    if (cc && cc.resultado) {
        if (cc.resultado.seccionComercial) {
            secciones.push({ valor: cc.resultado.seccionComercial, criterio: 'Cortocircuito' });
        } else {
            sinSolucion = 'Cortocircuito: la secci\u00F3n requerida supera 1000 mm\u00B2';
        }
    }

    if (sinSolucion) {
        return { texto: 'Revisar', criterio: sinSolucion, criterios: secciones, nParalelo: nParalelo };
    }
    if (secciones.length > 0) {
        var maxSeccion = secciones.reduce(function (max, cur) {
            return cur.valor > max.valor ? cur : max;
        });
        return {
            texto: (nParalelo > 1 ? nParalelo + ' \u00D7 ' : '') + maxSeccion.valor + ' mm\u00B2',
            criterio: maxSeccion.criterio, criterios: secciones, nParalelo: nParalelo, valor: maxSeccion.valor
        };
    }
    return { texto: 'No calculado', criterio: '--', criterios: [], nParalelo: nParalelo };
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
            descartarResultados('ampacidadDC', 'resultados-ampacidad-dc');
            mostrarErroresValidacion(validacion.errores);
            return;
        }
        (validacion.advertencias || []).forEach(function (adv) {
            mostrarMensaje(adv, 'advertencia');
        });

        var resultado = dimensionarPorAmpacidadDC(parametros);

        mostrarResultadosAmpacidadDC(resultado);

        appState.calculos.ampacidadDC = { parametros: parametros, resultado: resultado };

        mostrarMensaje('Ampacidad DC calculada correctamente', 'exito');
        (resultado.advertencias || []).forEach(function (adv) {
            mostrarMensaje(adv, 'advertencia');
        });

        // Propagar datos a pestañas de Caída de Tensión DC y Cortocircuito DC
        invalidarDependientes([['caidaTensionDC', 'resultados-caida-tension-dc'], ['cortocircuitoDC', 'resultados-cortocircuito-dc']]);
        propagarDatosAmpacidadDC(parametros, resultado);

        // Mark tab as completed
        var tab = document.querySelector('[data-tab="ampacidad-dc"]');
        if (tab && !tab.textContent.includes('\u2713')) {
            tab.textContent = tab.textContent.trim() + ' \u2713';
        }

        guardarEnHistorial('ampacidad-dc', parametros, resultado);
    } catch (error) {
        console.error('Error en calculo de ampacidad DC:', error);
        descartarResultados('ampacidadDC', 'resultados-ampacidad-dc');
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

    var cardDim = document.getElementById('card-corriente-dim-dc');
    if (cardDim) cardDim.style.display = resultado.factorCarga > 1 ? '' : 'none';
    setTexto('corriente-dim-dc', resultado.corrienteDimensionamiento + ' A');

    var campos = {
        'corriente-dc': resultado.corriente + ' A',
        'seccion-ampacidad-dc': resultado.seccion + ' mm2',
        'resistencia-mostrada-dc': resultado.resistencia_mostrada + ' ohm/km a ' + resultado.temperatura_conductor + ' \u00B0C'
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
            descartarResultados('caidaTensionDC', 'resultados-caida-tension-dc');
            mostrarErroresValidacion(validacion.errores);
            return;
        }
        (validacion.advertencias || []).forEach(function (adv) {
            mostrarMensaje(adv, 'advertencia');
        });

        var resultado = verificarCaidaTensionDC(parametros);
        if (!resultado.exigida) mostrarMensaje(resultado.motivoNoExigida + '. El resultado es informativo y no define la sección final.', 'info');

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
        descartarResultados('caidaTensionDC', 'resultados-caida-tension-dc');
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
    if (elValor) elValor.textContent = textoPct(resultado.caida_tension_pct, resultado.limite_pct, resultado.cumple_criterio) + ' (l\u00EDmite ' + resultado.limite_pct + '%)';

    var elStatus = document.getElementById('caida-tension-dc-status');
    if (elStatus) {
        elStatus.textContent = textoEstadoCaida(resultado.cumple_criterio, resultado.exigida);
        elStatus.className = resultado.exigida === false ? '' : (resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error');
    }

    var elRes = document.getElementById('resistencia-real-dc');
    if (elRes) elRes.textContent = resultado.resistencia_mostrada + ' ohm/km a ' + resultado.temperatura_conductor + ' \u00B0C';

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
            descartarResultados('cortocircuitoDC', 'resultados-cortocircuito-dc');
            mostrarErroresValidacion(validacion.errores);
            return;
        }
        (validacion.advertencias || []).forEach(function (adv) {
            mostrarMensaje(adv, 'advertencia');
        });

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
        descartarResultados('cortocircuitoDC', 'resultados-cortocircuito-dc');
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
    setTexto('resistencia-banco-dc', resultado.resistencia_banco_mohm + ' m\u03A9');
    setTexto('seccion-minima-cc-dc', resultado.seccion_minima + ' mm\u00B2 (comercial: ' +
        (resultado.seccion_comercial ? resultado.seccion_comercial + ' mm\u00B2' : '> 1000 mm\u00B2') + ')');

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
        // Con conductores por polo, la sección por ampacidad es la de cada conductor (igual que la final)
        var final = calcularSeccionFinalDC();
        var porAmp = (final.criterios || []).filter(function (c) { return c.criterio.indexOf('Ampacidad') === 0; })[0];
        var np = final.np > 1 ? final.np + ' \u00D7 ' : '';
        setTexto('resumen-corriente-dc', amp.resultado.corriente + ' A');
        setTexto('resumen-seccion-ampacidad', porAmp ? np + porAmp.valor + ' mm\u00B2' : amp.resultado.seccion + ' mm\u00B2');
    } else {
        setTexto('resumen-corriente-dc', 'No calculado');
        setTexto('resumen-seccion-ampacidad', 'No calculado');
    }

    var elEstado = document.getElementById('resumen-estado-caida');
    if (caida && caida.resultado) {
        setTexto('resumen-caida-tension', textoPct(caida.resultado.caida_tension_pct, caida.resultado.limite_pct, caida.resultado.cumple_criterio));
        if (elEstado) {
            elEstado.textContent = textoEstadoCaida(caida.resultado.cumple_criterio, caida.resultado.exigida);
            elEstado.className = caida.resultado.exigida === false ? '' : (caida.resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error');
        }
    } else {
        setTexto('resumen-caida-tension', 'No calculado');
        if (elEstado) { elEstado.textContent = '--'; elEstado.className = ''; }
    }

    var elEstadoCC = document.getElementById('resumen-estado-cc');
    if (cc && cc.resultado) {
        setTexto('resumen-corriente-cc', cc.resultado.corriente_cortocircuito + ' A');
        if (elEstadoCC) {
            elEstadoCC.textContent = cc.resultado.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE';
            elEstadoCC.className = cc.resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error';
        }
    } else {
        setTexto('resumen-corriente-cc', 'No calculado');
        if (elEstadoCC) { elEstadoCC.textContent = '--'; elEstadoCC.className = ''; }
    }

    determinarSeccionFinalDC();
}

function determinarSeccionFinalDC() {
    var r = calcularSeccionFinalDC();
    setTexto('criterio-restrictivo', r.criterio);
    setTexto('seccion-final-dc', r.texto);
}

/**
 * Sección final DC (lógica en calculations.js, compartida con el reporte).
 */
function calcularSeccionFinalDC() {
    var c = appState.calculos;
    return calcularSeccionFinalDCDesde({ ampacidad: c.ampacidadDC, caida: c.caidaTensionDC, cortocircuito: c.cortocircuitoDC });
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

    // Estimación por elemento: R (mΩ) = constante (mΩ·Ah) / capacidad (Ah)
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

/** Vuelve un campo al valor inicial del HTML (no a la primera opción ni a vacío). */
function restaurarValorInicial(campo) {
    if (campo.tagName === 'SELECT') {
        var inicial = 0;
        for (var i = 0; i < campo.options.length; i++) {
            if (campo.options[i].defaultSelected) { inicial = i; break; }
        }
        campo.selectedIndex = inicial;
    } else {
        campo.value = campo.defaultValue;
    }
}

function resetearFormulario(pestana) {
    var formularios = {
        'proyecto': ['potencia', 'corriente-directa', 'potencia-transformador-kva', 'tension', 'factor-potencia'],
        'caida-tension': ['corriente-ct', 'tension-ct', 'longitud-ct', 'seccion-ct', 'fp-ct'],
        'cortocircuito': ['potencia-cc', 'tension-cc', 'tiempo-despeje', 'seccion-cc'],
        'ampacidad-dc': ['potencia-dc', 'tension-dc', 'tension-personalizada'],
        'caida-tension-dc': ['corriente-ct-dc', 'tension-ct-dc', 'longitud-ct-dc'],
        'cortocircuito-dc': ['elementos-serie', 'capacidad-bateria', 'resistencia-interna']
    };

    var campos = formularios[pestana];
    if (campos) {
        campos.forEach(function (campoId) {
            var campo = document.getElementById(campoId);
            if (campo) {
                restaurarValorInicial(campo);
                if (campo.tagName === 'SELECT') campo.dispatchEvent(new Event('change'));
            }
        });

        descartarResultados(CALCULOS_POR_PESTANA[pestana], 'resultados-' + pestana);

        mostrarMensaje('Formulario limpiado', 'info');
    }
}

// ===================================================================
// REPORTE IMPRIMIBLE (memoria de cálculo)
// ===================================================================
// Se arma con los parámetros y resultados GUARDADOS de cada cálculo (appState), no con
// lo que haya en los formularios: el reporte documenta exactamente lo que se calculó.

function nodo(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto !== undefined && texto !== null) e.textContent = texto;
    return e;
}

/** Texto visible de la opción de un <select> (evita duplicar etiquetas). */
function textoOpcion(idSelect, valor) {
    var sel = document.getElementById(idSelect);
    if (sel) {
        for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === String(valor)) return sel.options[i].textContent.trim();
        }
    }
    return valor === undefined || valor === null || valor === '' ? '--' : String(valor);
}

function fmt(v, dec, unidad) {
    if (v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v))) return '--';
    var t = typeof v === 'number' && dec !== undefined && dec !== null ? v.toFixed(dec) : String(v);
    return unidad ? t + ' ' + unidad : t;
}

/** Tabla de dos columnas; omite filas con valor null. */
function tablaReporte(filas) {
    var t = nodo('table', 'reporte-tabla');
    filas.forEach(function (f) {
        if (f === null || f[1] === null) return;
        var tr = nodo('tr');
        tr.appendChild(nodo('th', null, f[0]));
        tr.appendChild(nodo('td', null, f[1]));
        t.appendChild(tr);
    });
    return t;
}

function bloqueReporte(titulo, entradas, resultados, fuente, avisos) {
    var sec = nodo('section', 'reporte-bloque');
    sec.appendChild(nodo('h2', null, titulo));
    if (!entradas) {
        sec.appendChild(nodo('p', 'reporte-nocalc', 'No calculado.'));
        return sec;
    }
    sec.appendChild(nodo('h3', null, 'Datos de entrada'));
    sec.appendChild(tablaReporte(entradas));
    sec.appendChild(nodo('h3', null, 'Resultados'));
    sec.appendChild(tablaReporte(resultados));
    if (avisos && avisos.length) {
        var ul = nodo('ul', 'reporte-avisos');
        avisos.forEach(function (a) { ul.appendChild(nodo('li', null, a)); });
        sec.appendChild(ul);
    }
    sec.appendChild(nodo('p', 'reporte-fuente', 'Fuente: ' + fuente));
    return sec;
}

function encabezadoReporte(titulo) {
    var h = nodo('header', 'reporte-encabezado');
    h.appendChild(nodo('h1', null, titulo));
    h.appendChild(nodo('p', null, 'Calculadora de conductores eléctricos — INPACO 2021 · NBR 5410 · Mamede Filho'));
    h.appendChild(nodo('p', null, 'Fecha: ' + new Date().toLocaleString('es-PY')));
    return h;
}

function pieReporte() {
    var f = nodo('footer', 'reporte-pie');
    f.appendChild(nodo('p', null, 'Cálculo de referencia. Verificar con los datos del fabricante del cable y coordinar la protección (Ib ≤ In ≤ Iz).'));
    f.appendChild(nodo('p', 'reporte-firma', 'Responsable: ______________________________   Firma: ____________________'));
    return f;
}

function construirReporteAC() {
    var cont = nodo('div');
    cont.appendChild(encabezadoReporte('Memoria de cálculo — Conductores AC'));

    // 1. Ampacidad
    var pr = appState.calculos.proyecto;
    var ent = null, res = null, avisos = [];
    if (pr) {
        var p = pr.parametros, r = pr.resultado;
        var entrada = p.modoEntrada === 'corriente' ? ['Corriente de carga', fmt(p.corrienteDirecta, 2, 'A')]
            : p.modoEntrada === 'transformador' ? ['Potencia del transformador', fmt(p.potenciaTransformadorKVA, null, 'kVA')]
            : ['Potencia instalada', fmt(p.potencia, null, p.unidadPotencia)];
        var enterrado = r.metodoUsado === 'D';
        ent = [
            ['Modo de entrada', textoOpcion('modo-entrada', p.modoEntrada)],
            entrada,
            p.modoEntrada === 'potencia' ? ['Factor de demanda', fmt(r.factorDemanda, 2)] : null,
            p.modoEntrada === 'potencia' ? ['Factor de potencia / rendimiento', fmt(p.factorPotencia, 2) + ' / ' + fmt(p.rendimiento, 2)] : null,
            ['Tensión', fmt(p.tension, null, 'V')],
            ['Sistema', textoOpcion('tipo-sistema', p.tipoSistema)],
            ['Tipo de circuito', textoOpcion('tipo-circuito', p.tipoCircuito)],
            ['Aislación / material', textoOpcion('material-isolamento', p.materialAislamento) + ' / ' + textoOpcion('material-condutor', p.materialCondutor)],
            ['Método de instalación', textoOpcion('metodo-instalacao', p.metodoInstalacao)],
            [enterrado ? 'Temperatura del suelo' : 'Temperatura ambiente', fmt(p.temperaturaAmbiente, null, '°C')],
            enterrado ? ['Instalación enterrada', textoOpcion('tipo-enterrado', p.tipoEnterrado)] : null,
            enterrado ? ['Resistividad térmica del suelo', textoOpcion('resistividad-suelo', p.resistividadSuelo)] : null,
            ['Circuitos agrupados', fmt(r.circuitosAgrupamiento)],
            ['Conductores en paralelo por fase', fmt(r.conductoresPorFase)],
            p.tipoSistema === 'trifasico' ? ['Neutro con armónicos', p.neutroCargado ? 'Sí' : 'No'] : null
        ];
        res = [
            ['Corriente de proyecto Ib', fmt(r.corriente, 2, 'A')],
            r.conductoresPorFase > 1 ? ['Corriente por conductor', fmt(r.corrientePorConductor, 2, 'A')] : null,
            ['Conductores cargados', fmt(r.conductoresCargados)],
            ['Factor de temperatura', fmt(r.factorTemperatura, 3)],
            ['Factor de agrupamiento', fmt(r.factorAgrupamiento, 3)],
            enterrado ? ['Factor de resistividad del suelo', fmt(r.factorResistividad, 3)] : null,
            ['Corriente corregida por conductor', fmt(r.corrienteCorregida, 2, 'A')],
            ['Sección por ampacidad', (r.conductoresPorFase > 1 ? r.conductoresPorFase + ' × ' : '') + r.seccion + ' mm²'],
            ['Ampacidad de tabla', fmt(r.ampacidad, null, 'A')],
            ['Capacidad corregida Iz', fmt(r.capacidadCorregida, 1, 'A')]
        ];
        avisos = r.advertencias || [];
    }
    var tablaINPACO = pr && window.claveAislacion && window.claveAislacion(pr.parametros.materialAislamento) === 'PVC'
        ? 'Tablas 2 (A1–D) y 4 (E–G)' : 'Tablas 3 (A1–D) y 5 (E–G)';
    cont.appendChild(bloqueReporte('1. Capacidad de conducción (ampacidad)', ent, res,
        'catálogo INPACO 2021, ' + tablaINPACO + ' (cobre, 40 °C aire / 25 °C suelo); temperatura Tabla 6; agrupamiento Tablas 7, 9 y 10; ' +
        'resistividad del suelo Tabla 11. Corriente según Mamede 3.5.1.1. Conductor de protección: NBR 5410 Tabla 58.', avisos));

    // 2. Caída de tensión
    var ct = appState.calculos.caidaTension;
    ent = null; res = null;
    if (ct) {
        var pc = ct.parametros, rc = ct.resultado;
        ent = [
            ['Corriente', fmt(pc.corriente, 2, 'A')],
            ['Tensión', fmt(pc.tension, null, 'V')],
            ['Longitud', fmt(pc.longitud, null, 'm')],
            ['Sección verificada', (pc.conductoresPorFase > 1 ? pc.conductoresPorFase + ' × ' : '') + pc.seccion + ' mm²'],
            ['Sistema / factor de potencia', textoOpcion('tipo-sistema-ct', pc.tipoSistema) + ' / ' + fmt(pc.factorPotencia, 2)],
            ['Material / clase', textoOpcion('material-ct', pc.materialCondutor) + ' / ' + textoOpcion('clase-ct', rc.clase)],
            ['Aislación', textoOpcion('aislamiento-ct', pc.aislamiento)],
            ['Disposición / frecuencia', textoOpcion('disposicion-ct', rc.disposicion) + ' / ' + rc.frecuencia + ' Hz'],
            ['Límite admitido', fmt(rc.limite, null, '%')],
            ['Tipo de cable', textoOpcion('tipo-cable-ct', pc.tipoCable)]
        ];
        res = [
            ['Resistencia AC a ' + rc.temperaturaConductor + ' °C', fmt(rc.resistencia, 4, 'Ω/km')],
            ['Reactancia', fmt(rc.reactancia, 4, 'Ω/km')],
            ['Caída de tensión', fmt(rc.caidaTensionV, 2, 'V') + ' (' + textoPct(rc.caidaTensionPct, rc.limite, rc.cumple) + ')'],
            ['Estado', textoEstadoCaida(rc.cumple, rc.exigida)],
            ['Sección mínima por caída (' + pc.conductoresPorFase + ' por fase)', rc.seccionMinimaCaida ? rc.seccionMinimaCaida.seccion + ' mm²' : 'ninguna hasta 300 mm²']
        ];
        var rpa = rc.partida, ppa = pc.partida;
        if (rpa) {
            ent.push(['Partida: Ip/In / cosφ de partida', fmt(ppa.relacionIp, null) + ' / ' + fmt(ppa.fpPartida, 2)]);
            if (!rpa.soloCircuito) ent.push(['Partida: otras cargas en marcha (alimentador y trafo)', fmt(ppa.otrasCargas.corriente, null, 'A') +
                (ppa.otrasCargas.corriente > 0 ? ' (cosφ ' + fmt(ppa.otrasCargas.factorPotencia, 2) + ')' : '')]);
            if (ppa.alimentador) ent.push(['Partida: alimentador', (ppa.alimentador.conductoresPorFase > 1 ? ppa.alimentador.conductoresPorFase + ' × ' : '') +
                ppa.alimentador.seccion + ' mm² · ' + fmt(ppa.alimentador.longitud, null, 'm')]);
            if (ppa.trafo) ent.push(['Partida: transformador', fmt(ppa.trafo.potenciaKVA, null, 'kVA') + ' · Z ' + fmt(ppa.trafo.impedanciaPct, null, '%')]);
            rpa.tramos.forEach(function (tr) {
                res.push(['Partida — ' + tr.tramo, fmt(tr.caidaPct, 2, '%') + ' (' + fmt(tr.corriente, 1, 'A') + ', cosφ ' + fmt(tr.factorPotencia, 2) + ')']);
            });
            res.push(['Caída en la partida', textoPct(rpa.caidaTotalPct, rpa.limite, rpa.cumple) + ' — límite ' + rpa.limite + ' % — ' + (rpa.cumple ? 'CUMPLE' : 'NO CUMPLE')]);
            res.push(['Sección mínima del circuito por partida (' + pc.conductoresPorFase + ' por fase)', rpa.seccionMinima ? rpa.seccionMinima.seccion + ' mm²' : 'ninguna hasta 300 mm²']);
            if (rpa.soloCircuito) res.push(['Nota', 'Solo el circuito del motor; la R1A pide todo el sistema de BT hasta el primario del trafo']);
        }
    }
    cont.appendChild(bloqueReporte('2. Caída de tensión', ent, res,
        'ΔV = k·I·L·(Rca·cosφ + X·senφ)/n (INPACO 4.3, Mamede Ec. 3.18); R20 IEC 60228; Rca a temperatura de servicio con ' +
        'efecto pelicular y de proximidad (INPACO 4.3.1 / IEC 60287); X de INPACO Tabla 15. Límites: NBR 5410 4 %, 5 % y 7 %; Itaipu #ITA0&EEC010-01 R1A §10.3.1 5 % y 10 %. ' +
        'Partida de motor: Itaipu R1A §10.3.1.3 y Mamede §3.5.1.2 (10 %, cosφ 0,30, Ip = 6·In sin datos); trafo ΔV = I/In·Z %.'));

    // 3. Cortocircuito
    var cc = appState.calculos.cortocircuito;
    ent = null; res = null;
    if (cc) {
        var pk = cc.parametros, rk = cc.resultado;
        ent = [
            ['Potencia de cortocircuito', fmt(pk.potenciaCortocircuito, null, 'MVA')],
            ['Tensión de línea', fmt(pk.tensionSistema * 1000, 0, 'V')],
            ['Tiempo de despeje', fmt(pk.tiempoDespeje, null, 's')],
            ['Sección verificada (por conductor)', pk.seccion + ' mm²'],
            ['Material / aislación', textoOpcion('material-cc', pk.materialCondutor) + ' / ' + textoOpcion('aislamiento-cc', pk.materialAislamiento)]
        ];
        res = [
            ['Corriente de cortocircuito', fmt(rk.corrienteCortocircuito, 2, 'kA')],
            ['Constante K', fmt(rk.constanteK)],
            ['Sección mínima calculada', fmt(rk.seccionMinima, 2, 'mm²') +
                (rk.constanteKMinima !== rk.constanteK ? ' (con K = ' + rk.constanteKMinima + ', por superar 300 mm²)' : '')],
            ['Sección comercial mínima', rk.seccionComercial ? rk.seccionComercial + ' mm²' : 'mayor a 1000 mm²'],
            ['Estado', rk.cumple ? 'CUMPLE' : 'NO CUMPLE']
        ];
    }
    cont.appendChild(bloqueReporte('3. Cortocircuito', ent, res,
        'Icc = Scc/(√3·V); S = Icc·√t/K, criterio adiabático válido hasta 5 s; K según NBR 5410. Con conductores en paralelo se exige la Icc completa a cada uno.'));

    // Sección final
    var fin = calcularSeccionFinalAC();
    var secFin = nodo('section', 'reporte-bloque reporte-final-bloque');
    secFin.appendChild(nodo('h2', null, 'Sección final'));
    secFin.appendChild(tablaReporte(
        fin.criterios.map(function (c) { return ['Por ' + c.criterio.toLowerCase(), c.valor + ' mm²']; })
            .concat([['Sección adoptada', fin.texto], ['Criterio más restrictivo', fin.criterio],
                // El conductor de protección sigue a la sección de fase ADOPTADA, no a la de ampacidad
                fin.valor ? ['Conductor de protección (sobre la sección adoptada)',
                    textoConductorProteccion({ seccion: fin.valor, conductoresPorFase: fin.nParalelo })] : null])));
    // Caída y partida se recalculan con el paralelo de la ampacidad si la pestaña usó otro
    if (pr && ct && pr.resultado && (pr.resultado.conductoresPorFase || 1) !== ct.parametros.conductoresPorFase) {
        secFin.appendChild(nodo('p', 'reporte-alerta', 'La caída de tensión' + (ct.resultado.partida ? ' y la partida' : '') +
            ' se recalcularon con ' + (pr.resultado.conductoresPorFase || 1) + ' conductor(es) por fase (los de la ampacidad); ' +
            'la pestaña Caída usó ' + ct.parametros.conductoresPorFase + '.'));
    }
    // Coherencia entre pestañas: el mismo material en los tres criterios
    var mats = [pr && pr.parametros.materialCondutor, ct && ct.parametros.materialCondutor, cc && cc.parametros.materialCondutor]
        .filter(Boolean);
    if (mats.some(function (m) { return m !== mats[0]; })) {
        secFin.appendChild(nodo('p', 'reporte-alerta', 'Atención: las pestañas se calcularon con materiales distintos. Recalcular con el mismo material.'));
    }
    cont.appendChild(secFin);
    cont.appendChild(pieReporte());
    return cont;
}

function construirReporteDC() {
    var cont = nodo('div');
    cont.appendChild(encabezadoReporte('Memoria de cálculo — Conductores DC'));

    var am = appState.calculos.ampacidadDC;
    var ent = null, res = null;
    if (am) {
        var p = am.parametros, r = am.resultado;
        ent = [
            ['Modo de entrada', textoOpcion('modo-entrada-dc', p.modoEntrada)],
            p.modoEntrada === 'corriente' ? ['Corriente', fmt(p.corrienteDirecta, 2, 'A')] : ['Potencia', fmt(p.potencia, null, 'W')],
            p.modoEntrada === 'corriente' ? null : ['Tensión', p.tensionSelector === 'personalizado' ? fmt(p.tensionPersonalizada, null, 'V') : fmt(p.tensionSelector, null, 'V')],
            ['Material / aislación', textoOpcion('material-condutor-dc', p.material) + ' / ' + textoOpcion('aislamiento-dc', p.aislamiento)],
            ['Tipo de carga', textoOpcion('tipo-carga-dc', r.tipoCarga)],
            p.tipoCarga === 'motor' && p.modoEntrada !== 'corriente' ? ['Rendimiento del motor', fmt(p.rendimiento, 2)] : null,
            ['Método de instalación', textoOpcion('metodo-instalacao-dc', p.metodo)],
            p.metodo === 'D' ? ['Instalación enterrada / resistividad del suelo', textoOpcion('tipo-enterrado-dc', p.tipoEnterrado) + ' / ' + fmt(p.resistividadSuelo, null, 'K·m/W')] : null,
            [p.metodo === 'D' ? 'Temperatura del suelo' : 'Temperatura ambiente', fmt(p.temperatura, null, '°C')],
            ['Circuitos agrupados', fmt(p.agrupamiento)]
        ];
        res = [
            ['Corriente', fmt(r.corriente, 2, 'A')],
            r.factorCarga > 1 ? ['Corriente de dimensionamiento (motor, × ' + r.factorCarga + ')', fmt(r.corrienteDimensionamiento, 2, 'A')] : null,
            ['Factor de temperatura / agrupamiento', fmt(r.factorTemperatura, 3) + ' / ' + fmt(r.factorAgrupamiento, 3)],
            p.metodo === 'D' ? ['Factor de resistividad del suelo', fmt(r.factorResistividad, 3)] : null,
            ['Corriente corregida', fmt(r.corrienteCorregida, 2, 'A')],
            ['Sección por ampacidad', r.seccion + ' mm²'],
            ['Ampacidad de tabla', fmt(r.ampacidad, null, 'A')]
        ];
    }
    cont.appendChild(bloqueReporte('1. Capacidad de conducción (ampacidad)', ent, res,
        'catálogo INPACO 2021, columnas de 2 conductores cargados; temperatura Tabla 6; agrupamiento Tablas 7, 9 y 10; ' +
        'resistividad del suelo Tabla 11. Motores DC al 125 %: Itaipu #ITA0&EEC010-01 R1A §10.3.2.'));

    var ct = appState.calculos.caidaTensionDC;
    ent = null; res = null;
    if (ct) {
        var pc = ct.parametros, rc = ct.resultado;
        ent = [
            ['Corriente', fmt(pc.corriente, 2, 'A')],
            ['Tensión', pc.tensionSelector === 'personalizado' ? fmt(pc.tensionPersonalizada, null, 'V') : fmt(pc.tensionSelector, null, 'V')],
            ['Longitud', fmt(pc.longitud, null, 'm')],
            ['Sección / conductores por polo', pc.seccion + ' mm² / ' + pc.conductoresPorPolo],
            ['Material / clase', textoOpcion('material-conductor-ct-dc', pc.material) + ' / ' + textoOpcion('clase-ct-dc', pc.clase)],
            ['Aislación', textoOpcion('aislamiento-ct-dc', pc.aislamiento)],
            ['Tramo (límite de caída)', textoOpcion('aplicacion-dc', pc.aplicacionDC)],
            ['Tipo de cable', textoOpcion('tipo-cable-ct-dc', pc.tipoCable)]
        ];
        res = [
            ['Resistencia a ' + rc.temperatura_conductor + ' °C', fmt(rc.resistencia_mostrada, 4, 'Ω/km')],
            ['Caída de tensión', fmt(rc.caida_tension_V, 2, 'V') + ' (' + textoPct(rc.caida_tension_pct, rc.limite_pct, rc.cumple_criterio) + ')'],
            ['Límite', fmt(rc.limite_pct, null, '%')],
            ['Estado', textoEstadoCaida(rc.cumple_criterio, rc.exigida)]
        ];
    }
    cont.appendChild(bloqueReporte('2. Caída de tensión', ent, res,
        'ΔV = 2·Rt·I·L/Np; R20 IEC 60228 corregida a la temperatura de servicio (INPACO 4.3.1).'));

    var cc = appState.calculos.cortocircuitoDC;
    ent = null; res = null;
    if (cc) {
        var pk = cc.parametros, rk = cc.resultado;
        ent = [
            ['Batería', textoOpcion('tipo-bateria', pk.tipoBateria)],
            ['Elementos en serie / capacidad', pk.elementosSerie + ' / ' + fmt(pk.capacidad, null, 'Ah')],
            ['Resistencia interna por elemento', fmt(pk.resistenciaInterna, 3, 'mΩ')],
            ['Tiempo de despeje', fmt(pk.tiempoDespeje, null, 's')],
            ['Sección verificada', pk.seccion + ' mm²'],
            ['Material / aislación', textoOpcion('material-cc-dc', pk.material) + ' / ' + textoOpcion('aislamiento-cc-dc', pk.aislamiento)]
        ];
        res = [
            ['Tensión del banco', fmt(rk.tension_banco, null, 'V')],
            ['Resistencia del banco', fmt(rk.resistencia_banco_mohm, 3, 'mΩ')],
            ['Corriente de cortocircuito', fmt(rk.corriente_cortocircuito, null, 'A')],
            ['Constante K', fmt(rk.constante_K)],
            ['Sección mínima', fmt(rk.seccion_minima, 2, 'mm²') +
                (rk.constante_K_minima !== rk.constante_K ? ' con K = ' + rk.constante_K_minima + ' (> 300 mm²)' : '') +
                ' (comercial ' + (rk.seccion_comercial ? rk.seccion_comercial + ' mm²' : '> 1000 mm²') + ')'],
            ['Estado', rk.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE']
        ];
    }
    cont.appendChild(bloqueReporte('3. Cortocircuito del banco de baterías', ent, res,
        'Icc = V_banco/(N·R_elemento), en bornes y sin resistencia del cable (conservador); S = Icc·√t/K según NBR 5410.'));

    var fin = calcularSeccionFinalDC();
    var secFin = nodo('section', 'reporte-bloque reporte-final-bloque');
    secFin.appendChild(nodo('h2', null, 'Sección final'));
    secFin.appendChild(tablaReporte(
        fin.criterios.map(function (c) { return ['Por ' + c.criterio.toLowerCase(), c.valor + ' mm²']; })
            .concat([['Sección adoptada', fin.texto], ['Criterio más restrictivo', fin.criterio]])));
    cont.appendChild(secFin);
    cont.appendChild(pieReporte());
    return cont;
}

/** Arma el reporte, lo imprime (o guarda como PDF desde el diálogo) y lo retira. */
function imprimirReporte(constructor, actualizarResumen) {
    actualizarResumen();
    var destino = document.getElementById('reporte-impresion');
    if (!destino) return;
    destino.replaceChildren(constructor());
    document.body.classList.add('imprimiendo-reporte');
    var limpiar = function () {
        document.body.classList.remove('imprimiendo-reporte');
        destino.replaceChildren();
        window.removeEventListener('afterprint', limpiar);
    };
    window.addEventListener('afterprint', limpiar);
    window.print();
}

function generarReporteAC() {
    imprimirReporte(construirReporteAC, actualizarResumenAC);
}

function generarReporteDC() {
    imprimirReporte(construirReporteDC, actualizarResumenDC);
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

    // Nodos con textContent: el texto (que puede traer valores ingresados o mensajes de error)
    // nunca se interpreta como HTML
    var mensaje = document.createElement('div');
    mensaje.className = 'mensaje mensaje-' + tipo;
    var cuerpo = document.createElement('span');
    cuerpo.textContent = texto;
    var cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.textContent = '\u00D7';
    cerrar.setAttribute('aria-label', 'Cerrar');
    cerrar.style.cssText = 'background:none;border:none;color:inherit;cursor:pointer;font-size:18px;';
    cerrar.addEventListener('click', function () { mensaje.remove(); });
    mensaje.appendChild(cuerpo);
    mensaje.appendChild(cerrar);

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

/**
 * Oculta resultados y borra el estado de un cálculo que falló, para no dejar
 * en pantalla (ni en el resumen) valores de un cálculo anterior.
 */
// Pestaña ↔ clave del cálculo en appState ↔ tarjeta de resultados
var CALCULOS_POR_PESTANA = {
    'proyecto': 'proyecto', 'caida-tension': 'caidaTension', 'cortocircuito': 'cortocircuito',
    'ampacidad-dc': 'ampacidadDC', 'caida-tension-dc': 'caidaTensionDC', 'cortocircuito-dc': 'cortocircuitoDC'
};

/**
 * Invalida un cálculo: lo borra del estado (resumen y reporte dejan de usarlo),
 * oculta su tarjeta y quita la marca ✓ de su pestaña.
 */
function descartarResultados(clave, idResultados) {
    var hadCalc = !!appState.calculos[clave];
    appState.calculos[clave] = null;
    var el = document.getElementById(idResultados);
    if (el) el.style.display = 'none';
    Object.keys(CALCULOS_POR_PESTANA).forEach(function (pestana) {
        if (CALCULOS_POR_PESTANA[pestana] !== clave) return;
        var tab = document.querySelector('[data-tab="' + pestana + '"]');
        if (tab) tab.textContent = tab.textContent.replace(/\s*\u2713/g, '').trim();
    });
    return hadCalc;
}

/**
 * Al recalcular la ampacidad cambian la corriente y la sección que usan caída y
 * cortocircuito: esos cálculos quedan viejos y se invalidan (hay que re-verificarlos).
 */
function invalidarDependientes(pares) {
    var invalidados = pares.filter(function (par) { return descartarResultados(par[0], par[1]); });
    if (invalidados.length) {
        mostrarMensaje('Cambió la ampacidad: volvé a verificar caída de tensión y cortocircuito con los datos nuevos', 'advertencia');
    }
}

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
// Cada entrada guarda la foto del formulario de su pestaña: "Abrir" la repone y recalcula
// con el código actual. El almacenamiento puede no estar disponible (modo privado, datos
// bloqueados): el historial nunca debe romper un cálculo, por eso todo va en try/catch.

var CLAVE_HISTORIAL = 'historialCalculos';
var MAX_HISTORIAL = 50;

var TIPOS_HISTORIAL = {
    'proyecto':         { nombre: 'Ampacidad AC',         calcular: function () { calcularProyecto(); } },
    'caida-tension':    { nombre: 'Caída de tensión AC',  calcular: function () { calcularCaidaTension(); } },
    'cortocircuito':    { nombre: 'Cortocircuito AC',     calcular: function () { calcularCortocircuito(); } },
    'ampacidad-dc':     { nombre: 'Ampacidad DC',         calcular: function () { calcularAmpacidadDC(); } },
    'caida-tension-dc': { nombre: 'Caída de tensión DC',  calcular: function () { calcularCaidaTensionDC_UI(); } },
    'cortocircuito-dc': { nombre: 'Cortocircuito DC',     calcular: function () { calcularCortocircuitoDC(); } }
};

function leerHistorial() {
    try {
        var h = JSON.parse(localStorage.getItem(CLAVE_HISTORIAL) || '[]');
        return Array.isArray(h) ? h : [];
    } catch (e) {
        return [];
    }
}

function escribirHistorial(historial) {
    try {
        localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
        return true;
    } catch (e) {
        return false;
    }
}

/** Foto de los campos (input/select) de una pestaña: { id: valor }. */
function capturarFormulario(idPestana) {
    var foto = {};
    var cont = document.getElementById(idPestana);
    if (!cont) return foto;
    cont.querySelectorAll('input[id], select[id]').forEach(function (el) {
        foto[el.id] = el.value;
    });
    return foto;
}

function resumenCalculo(tipo, p, r) {
    var n = function (v, d) { return typeof v === 'number' ? (d === undefined ? String(v) : v.toFixed(d)) : String(v); };
    try {
        switch (tipo) {
            case 'proyecto':
                var entrada = p.modoEntrada === 'corriente' ? p.corrienteDirecta + ' A'
                    : p.modoEntrada === 'transformador' ? p.potenciaTransformadorKVA + ' kVA'
                    : p.potencia + ' ' + p.unidadPotencia;
                return entrada + ' · ' + p.tension + ' V · ' + p.metodoInstalacao + ' → ' +
                    (r.conductoresPorFase > 1 ? r.conductoresPorFase + ' × ' : '') + r.seccion + ' mm²';
            case 'caida-tension':
                return n(p.corriente) + ' A · ' + p.longitud + ' m · ' + p.seccion + ' mm² → ' +
                    textoPct(r.caidaTensionPct, r.limite, r.cumple) + ' (' + (r.cumple ? 'cumple' : 'no cumple') + ')' +
                    (r.partida ? ' · partida ' + textoPct(r.partida.caidaTotalPct, r.partida.limite, r.partida.cumple) +
                        ' (' + (r.partida.cumple ? 'cumple' : 'no cumple') + ')' : '');
            case 'cortocircuito':
                return p.potenciaCortocircuito + ' MVA · ' + Math.round(p.tensionSistema * 1000) + ' V · ' + p.tiempoDespeje +
                    ' s → mín. ' + (r.seccionComercial ? r.seccionComercial + ' mm²' : '> 1000 mm²');
            case 'ampacidad-dc':
                return n(r.corriente) + ' A' + (r.factorCarga > 1 ? ' (motor, ×' + r.factorCarga + ')' : '') + ' · ' + p.metodo + ' → ' + r.seccion + ' mm²';
            case 'caida-tension-dc':
                return n(p.corriente) + ' A · ' + p.longitud + ' m · ' + p.seccion + ' mm² → ' +
                    textoPct(r.caida_tension_pct, r.limite_pct, r.cumple_criterio) + ' (' + (r.cumple_criterio ? 'cumple' : 'no cumple') + ')';
            case 'cortocircuito-dc':
                return p.elementosSerie + ' elementos · ' + r.corriente_cortocircuito + ' A → mín. ' +
                    (r.seccion_comercial ? r.seccion_comercial + ' mm²' : '> 1000 mm²');
        }
    } catch (e) { /* resumen incompleto: no rompe el guardado */ }
    return '--';
}

function guardarEnHistorial(tipo, parametros, resultado) {
    if (appState.restaurandoHistorial) return; // reabrir no duplica la entrada
    var historial = leerHistorial();
    historial.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        tipo: tipo,
        fecha: new Date().toISOString(),
        resumen: resumenCalculo(tipo, parametros, resultado),
        formulario: capturarFormulario(tipo),
        parametros: parametros,
        resultado: resultado
    });
    if (historial.length > MAX_HISTORIAL) historial.length = MAX_HISTORIAL;
    if (!escribirHistorial(historial) && !appState.avisoHistorial) {
        appState.avisoHistorial = true;
        mostrarMensaje('El navegador no permite guardar el historial (almacenamiento bloqueado). Los cálculos funcionan igual.', 'advertencia');
    }
}

function renderHistorial() {
    var destino = document.getElementById('historial-lista');
    if (!destino) return;
    var historial = leerHistorial();
    if (!historial.length) {
        destino.replaceChildren(nodo('p', 'historial-vacio', 'Todavía no hay cálculos guardados en este navegador.'));
        return;
    }
    var tabla = nodo('table', 'historial-tabla');
    var cab = nodo('tr');
    ['Fecha', 'Tipo', 'Resumen', ''].forEach(function (t) { cab.appendChild(nodo('th', null, t)); });
    tabla.appendChild(cab);
    historial.forEach(function (h) {
        var tr = nodo('tr');
        var fecha = new Date(h.fecha);
        tr.appendChild(nodo('td', null, isNaN(fecha) ? '--' : fecha.toLocaleString('es-PY', { dateStyle: 'short', timeStyle: 'short' })));
        tr.appendChild(nodo('td', null, (TIPOS_HISTORIAL[h.tipo] || {}).nombre || h.tipo));
        tr.appendChild(nodo('td', null, h.resumen || resumenCalculo(h.tipo, h.parametros || {}, h.resultado || {})));
        var acciones = nodo('td', 'historial-acciones');
        var abrir = nodo('button', 'btn btn-primary', 'Abrir');
        abrir.type = 'button';
        if (!h.formulario || !TIPOS_HISTORIAL[h.tipo]) {
            abrir.disabled = true;
            abrir.title = 'Guardado por una versión anterior, sin los datos del formulario';
        } else {
            abrir.addEventListener('click', function () { abrirDelHistorial(h.id); });
        }
        var borrar = nodo('button', 'btn btn-warning', 'Borrar');
        borrar.type = 'button';
        borrar.addEventListener('click', function () { borrarDelHistorial(h.id); });
        acciones.appendChild(abrir);
        acciones.appendChild(borrar);
        tr.appendChild(acciones);
        tabla.appendChild(tr);
    });
    destino.replaceChildren(tabla);
}

/** Repone el formulario guardado en su pestaña y recalcula con el código actual. */
function abrirDelHistorial(id) {
    var h = leerHistorial().filter(function (x) { return x.id === id; })[0];
    if (!h || !h.formulario || !TIPOS_HISTORIAL[h.tipo]) return;
    switchTab(h.tipo);
    var ids = Object.keys(h.formulario);
    var cont = document.getElementById(h.tipo);
    var campos = cont ? cont.querySelectorAll('input[id], select[id]') : [];
    // Los campos que la entrada no trae (guardada antes de que existieran, p. ej. la partida
    // de motor) vuelven a su valor inicial: no se hereda lo que esté cargado en pantalla
    Array.prototype.forEach.call(campos, function (el) {
        if (!Object.prototype.hasOwnProperty.call(h.formulario, el.id)) restaurarValorInicial(el);
    });
    ids.forEach(function (campo) {
        var el = document.getElementById(campo);
        if (el) el.value = h.formulario[campo];
    });
    // Disparar los cambios para que se muestren/oculten los campos que dependen de los selectores
    Array.prototype.forEach.call(campos, function (el) {
        if (el.tagName === 'SELECT') el.dispatchEvent(new Event('change'));
    });
    // Un 'change' puede ajustar un valor (p. ej. aluminio fuerza clase rígida): se repone lo guardado
    ids.forEach(function (campo) {
        var el = document.getElementById(campo);
        if (el && el.value !== h.formulario[campo]) el.value = h.formulario[campo];
    });
    appState.restaurandoHistorial = true;
    try {
        TIPOS_HISTORIAL[h.tipo].calcular();
    } finally {
        appState.restaurandoHistorial = false;
    }
    mostrarMensaje('Datos del ' + new Date(h.fecha).toLocaleString('es-PY') + ' cargados y recalculados con la versión actual', 'info');
}

function borrarDelHistorial(id) {
    escribirHistorial(leerHistorial().filter(function (x) { return x.id !== id; }));
    renderHistorial();
}

/** Borrar todo pide un segundo clic (sin diálogos del navegador). */
function borrarTodoHistorial() {
    var btn = document.getElementById('btn-borrar-historial');
    if (btn && !btn.dataset.confirmar) {
        btn.dataset.confirmar = '1';
        btn.textContent = '¿Seguro? Clic de nuevo para borrar todo';
        setTimeout(function () {
            delete btn.dataset.confirmar;
            btn.textContent = 'Borrar todo';
        }, 4000);
        return;
    }
    if (btn) { delete btn.dataset.confirmar; btn.textContent = 'Borrar todo'; }
    escribirHistorial([]);
    renderHistorial();
    mostrarMensaje('Historial borrado', 'info');
}

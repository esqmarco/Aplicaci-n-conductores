/**
 * APP.JS - CONTROLADOR PRINCIPAL MEJORADO
 * =======================================
 * 
 * Versión R2 Corregida con:
 * - Lógica para 7 pestañas especializadas
 * - Manejo de tensión personalizable
 * - Funciones separadas por criterio DC
 * - Integración con resistencias corregidas
 */

// ===================================================================
// ESTADO GLOBAL DE LA APLICACIÓN
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
    lastCalculation: null,
    isCalculating: false,
    version: 'R2-Corregida',
    datosCompartidos: {
        // Para mantener consistencia entre pestañas DC
        potencia: null,
        tension: null,
        material: null,
        temperatura: null
    }
};

// ===================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Inicializando Calculadora R2 Corregida - 7 Pestañas Especializadas');
    
    try {
        // Verificar que todos los módulos estén cargados
        if (verificarModulosCargados()) {
            // Registrar event listeners
            registrarEventListeners();
            
            // Configurar sistema de pestañas
            configurarPestanas();
            
            // Configurar tensión personalizable
            configurarTensionPersonalizable();
            
            // Configurar sincronización entre pestañas DC
            configurarSincronizacionDC();
            
            // Establecer valores por defecto
            establecerValoresPorDefecto();
            
            console.log('✅ Aplicación R2 Corregida inicializada correctamente');
            mostrarMensaje('Sistema R2 Corregido listo - 7 pestañas especializadas', 'exito');
        } else {
            console.error('❌ Error en la inicialización');
            mostrarMensaje('Error: No se pudieron cargar todos los módulos', 'error');
        }
    } catch (error) {
        console.error('Error en inicialización:', error);
        mostrarMensaje(`Error de inicialización: ${error.message}`, 'error');
    }
});

// ===================================================================
// VERIFICACIÓN DE MÓDULOS
// ===================================================================

function verificarModulosCargados() {
    const modulosRequeridos = [
        'calcularCorrenteProyecto',
        'calcularCorrenteDC',
        'calcularResistenciaCorregida',
        'calcularCaidaTensionDC',
        'dimensionarPorAmpacidadDC',
        'verificarCaidaTensionDC',
        'analizarCortocircuitoDC',
        'validarParametrosBasicos',
        'validarParametrosAmpacidadDC',
        'validarParametrosCaidaTensionDC',
        'validarParametrosCortocircuitoDC'
    ];
    
    const modulosFaltantes = [];
    
    modulosRequeridos.forEach(modulo => {
        if (typeof window[modulo] === 'undefined') {
            modulosFaltantes.push(modulo);
        }
    });
    
    if (modulosFaltantes.length > 0) {
        console.error('❌ Módulos faltantes:', modulosFaltantes);
        alert(`Error: Faltan módulos requeridos:\n${modulosFaltantes.join('\n')}\n\nVerifique que todos los archivos JavaScript estén cargados.`);
        return false;
    }
    
    console.log('✅ Todos los módulos están cargados correctamente');
    return true;
}

// ===================================================================
// SISTEMA DE PESTAÑAS MEJORADO
// ===================================================================

function configurarPestanas() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    try {
        // Actualizar estado
        appState.currentTab = tabName;
        
        // Actualizar clases de pestañas
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Activar pestaña seleccionada
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(tabName);
        
        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');
            
            // Ejecutar acciones específicas por pestaña
            onTabSwitch(tabName);
            
            console.log(`Pestaña cambiada a: ${tabName}`);
        } else {
            throw new Error(`Pestaña ${tabName} no encontrada`);
        }
    } catch (error) {
        console.error('Error al cambiar pestaña:', error);
        mostrarMensaje(`Error al cambiar pestaña: ${error.message}`, 'error');
    }
}

function onTabSwitch(tabName) {
    // Acciones específicas al cambiar de pestaña
    switch (tabName) {
        case 'ampacidad-dc':
        case 'caida-tension-dc':
        case 'cortocircuito-dc':
            // Sincronizar datos compartidos para pestañas DC
            sincronizarDatosCompartidosDC();
            break;
        case 'resultados-dc':
            // Actualizar resumen automáticamente
            actualizarResumenDC();
            break;
    }
}

// ===================================================================
// CONFIGURACIÓN DE TENSIÓN PERSONALIZABLE
// ===================================================================

function configurarTensionPersonalizable() {
    // Configurar para pestaña Ampacidad DC
    const tensionDC = document.getElementById('tension-dc');
    const tensionPersonalizadaRow = document.getElementById('tension-personalizada-row');
    
    if (tensionDC && tensionPersonalizadaRow) {
        tensionDC.addEventListener('change', function() {
            if (this.value === 'personalizado') {
                tensionPersonalizadaRow.style.display = 'block';
                document.getElementById('tension-personalizada').focus();
            } else {
                tensionPersonalizadaRow.style.display = 'none';
            }
        });
    }
    
    // Configurar para pestaña Caída Tensión DC
    const tensionCTDC = document.getElementById('tension-ct-dc');
    const tensionPersonalizadaCTDCRow = document.getElementById('tension-personalizada-ct-dc-row');
    
    if (tensionCTDC && tensionPersonalizadaCTDCRow) {
        tensionCTDC.addEventListener('change', function() {
            if (this.value === 'personalizado') {
                tensionPersonalizadaCTDCRow.style.display = 'block';
                document.getElementById('tension-personalizada-ct-dc').focus();
            } else {
                tensionPersonalizadaCTDCRow.style.display = 'none';
            }
        });
    }
    
    // Validación en tiempo real para tensión personalizada
    const tensionPersonalizadaInputs = document.querySelectorAll('[id*="tension-personalizada"]');
    tensionPersonalizadaInputs.forEach(input => {
        input.addEventListener('input', function() {
            validarTensionPersonalizadaEnTiempoReal(this);
        });
    });
}

function validarTensionPersonalizadaEnTiempoReal(input) {
    const valor = parseFloat(input.value);
    const errorElement = input.parentElement.querySelector('.error-campo');
    
    // Remover error anterior
    if (errorElement) {
        errorElement.remove();
    }
    input.classList.remove('campo-error');
    
    if (input.value && !isNaN(valor)) {
        if (valor < 1 || valor > 1000) {
            mostrarErrorCampo(input, 'Tensión debe estar entre 1V y 1000V');
        } else if (valor < 12) {
            mostrarAdvertenciaCampo(input, 'Tensión muy baja');
        } else if (valor > 500) {
            mostrarAdvertenciaCampo(input, 'Tensión alta, verificar seguridad');
        }
    }
}

// ===================================================================
// SINCRONIZACIÓN ENTRE PESTAÑAS DC
// ===================================================================

function configurarSincronizacionDC() {
    // Configurar sincronización automática de campos comunes
    const camposComunes = [
        { id: 'potencia-dc', campo: 'potencia' },
        { id: 'material-condutor-dc', campo: 'material' },
        { id: 'temperatura-ambiente-dc', campo: 'temperatura' }
    ];
    
    camposComunes.forEach(({ id, campo }) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('change', function() {
                appState.datosCompartidos[campo] = this.value;
                sincronizarCampoEnOtrasPestañas(campo, this.value);
            });
        }
    });
}

function sincronizarDatosCompartidosDC() {
    // Sincronizar datos entre pestañas DC cuando sea apropiado
    const { potencia, tension, material, temperatura } = appState.datosCompartidos;
    
    if (potencia) {
        const campos = document.querySelectorAll('[id*="potencia"][id*="dc"]');
        campos.forEach(campo => {
            if (campo.value === '') {
                campo.value = potencia;
            }
        });
    }
    
    if (material) {
        const campos = document.querySelectorAll('[id*="material"][id*="dc"]');
        campos.forEach(campo => {
            if (campo.value === '') {
                campo.value = material;
            }
        });
    }
    
    if (temperatura) {
        const campos = document.querySelectorAll('[id*="temperatura"][id*="dc"]');
        campos.forEach(campo => {
            if (campo.value === '') {
                campo.value = temperatura;
            }
        });
    }
}

function sincronizarCampoEnOtrasPestañas(campo, valor) {
    // Sincronizar un campo específico en todas las pestañas DC relevantes
    const selectores = {
        'potencia': '[id*="potencia"][id*="dc"]',
        'material': '[id*="material"][id*="dc"]',
        'temperatura': '[id*="temperatura"][id*="dc"]'
    };
    
    const selector = selectores[campo];
    if (selector) {
        const campos = document.querySelectorAll(selector);
        campos.forEach(elemento => {
            if (elemento.value === '' || confirm(`¿Sincronizar ${campo} en todas las pestañas DC?`)) {
                elemento.value = valor;
            }
        });
    }
}

// ===================================================================
// FUNCIONES DE CÁLCULO POR PESTAÑA
// ===================================================================

/**
 * Cálculo para pestaña Proyecto AC
 */
function calcularProyecto() {
    try {
        appState.isCalculating = true;
        mostrarMensaje('Calculando dimensionamiento AC...', 'info');
        
        // Obtener parámetros del formulario
        const parametros = obtenerParametrosProyecto();
        
        // Validar parámetros
        const validacion = validarParametrosBasicos(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }
        
        // Realizar cálculos AC (mantener lógica existente)
        const corriente = calcularCorrenteProyecto(parametros);
        
        // Mostrar resultados
        mostrarResultadosProyecto({ corriente });
        
        // Guardar en estado
        appState.calculos.proyecto = { parametros, corriente };
        
        mostrarMensaje('Dimensionamiento AC calculado correctamente', 'exito');
    } catch (error) {
        console.error('Error en cálculo de proyecto:', error);
        mostrarMensaje(`Error en cálculo: ${error.message}`, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

/**
 * Cálculo para pestaña Ampacidad DC
 */
function calcularAmpacidadDC() {
    try {
        appState.isCalculating = true;
        mostrarMensaje('Calculando ampacidad DC...', 'info');
        
        // Obtener parámetros del formulario
        const parametros = obtenerParametrosAmpacidadDC();
        
        // Validar parámetros
        const validacion = validarParametrosAmpacidadDC(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }
        
        // Realizar cálculo de ampacidad DC
        const resultado = dimensionarPorAmpacidadDC(parametros);
        
        // Mostrar resultados
        mostrarResultadosAmpacidadDC(resultado);
        
        // Guardar en estado
        appState.calculos.ampacidadDC = { parametros, resultado };
        
        // Actualizar datos compartidos
        actualizarDatosCompartidos(parametros);
        
        mostrarMensaje('Ampacidad DC calculada correctamente', 'exito');
    } catch (error) {
        console.error('Error en cálculo de ampacidad DC:', error);
        mostrarMensaje(`Error en cálculo: ${error.message}`, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

/**
 * Cálculo para pestaña Caída de Tensión DC
 */
/**
 * Maneja el cálculo de la pestaña Caída de Tensión DC.
 * Renombrada para no colisionar con la función de cálculo matemática
 * definida en calculations.js y evitar recursión infinita.
 */
function calcularCaidaTensionDC_UI() {
    try {
        appState.isCalculating = true;
        mostrarMensaje('Calculando caída de tensión DC...', 'info');
        
        // Obtener parámetros del formulario
        const parametros = obtenerParametrosCaidaTensionDC();
        
        // Validar parámetros
        const validacion = validarParametrosCaidaTensionDC(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }
        
        // Realizar cálculo de caída de tensión DC con fórmula CORREGIDA
        // Ejecutar verificación de caída de tensión usando la función de cálculo adecuada
        const resultado = verificarCaidaTensionDC(parametros);
        
        // Mostrar resultados
        mostrarResultadosCaidaTensionDC(resultado);
        
        // Guardar en estado
        appState.calculos.caidaTensionDC = { parametros, resultado };
        
        // Actualizar datos compartidos
        actualizarDatosCompartidos(parametros);
        
        mostrarMensaje('Caída de tensión DC calculada correctamente', 'exito');
    } catch (error) {
        console.error('Error en cálculo de caída de tensión DC:', error);
        mostrarMensaje(`Error en cálculo: ${error.message}`, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

/**
 * Cálculo para pestaña Cortocircuito DC
 */
function calcularCortocircuitoDC() {
    try {
        appState.isCalculating = true;
        mostrarMensaje('Calculando cortocircuito DC...', 'info');
        
        // Obtener parámetros del formulario
        const parametros = obtenerParametrosCortocircuitoDC();
        
        // Validar parámetros
        const validacion = validarParametrosCortocircuitoDC(parametros);
        if (!validacion.valido) {
            mostrarErroresValidacion(validacion.errores);
            return;
        }
        
        // Realizar cálculo de cortocircuito DC
        const resultado = analizarCortocircuitoDC(parametros);
        
        // Mostrar resultados
        mostrarResultadosCortocircuitoDC(resultado);
        
        // Guardar en estado
        appState.calculos.cortocircuitoDC = { parametros, resultado };
        
        mostrarMensaje('Cortocircuito DC calculado correctamente', 'exito');
    } catch (error) {
        console.error('Error en cálculo de cortocircuito DC:', error);
        mostrarMensaje(`Error en cálculo: ${error.message}`, 'error');
    } finally {
        appState.isCalculating = false;
    }
}

// ===================================================================
// FUNCIONES DE OBTENCIÓN DE PARÁMETROS
// ===================================================================

function obtenerParametrosProyecto() {
    return {
        potencia: parseFloat(document.getElementById('potencia').value),
        unidadPotencia: document.getElementById('unidad-potencia').value,
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
}

function obtenerParametrosAmpacidadDC() {
    const tensionSelector = document.getElementById('tension-dc').value;
    const tensionPersonalizada = document.getElementById('tension-personalizada').value;
    
    return {
        potencia: parseFloat(document.getElementById('potencia-dc').value),
        tensionSelector: tensionSelector,
        tensionPersonalizada: tensionPersonalizada,
        material: document.getElementById('material-condutor-dc').value,
        temperatura: parseFloat(document.getElementById('temperatura-ambiente-dc').value),
        metodo: document.getElementById('metodo-instalacao-dc').value,
        // Nuevo: tipo de aislamiento seleccionado para DC (PVC o EPR)
        aislamiento: document.getElementById('aislamiento-dc') ? document.getElementById('aislamiento-dc').value : 'PVC'
    };
}

function obtenerParametrosCaidaTensionDC() {
    const tensionSelector = document.getElementById('tension-ct-dc').value;
    const tensionPersonalizada = document.getElementById('tension-personalizada-ct-dc').value;
    
    return {
        potencia: parseFloat(document.getElementById('potencia-ct-dc').value),
        tensionSelector: tensionSelector,
        tensionPersonalizada: tensionPersonalizada,
        longitud: parseFloat(document.getElementById('longitud-ct-dc').value),
        conductoresPorPolo: parseInt(document.getElementById('conductores-paralelo').value),
        seccion: parseFloat(document.getElementById('seccion-ct-dc').value),
        // Usar el selector correcto para el material específico de la pestaña Caída de Tensión DC
        material: document.getElementById('material-conductor-ct-dc').value || 'cobre',
        temperatura: parseFloat(document.getElementById('temperatura-ct-dc').value),
        // Tipo de aislamiento para caída de tensión DC
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
        // Material seleccionado para cortocircuito DC (Cobre/Aluminio)
        material: document.getElementById('material-cc-dc') ? document.getElementById('material-cc-dc').value : 'cobre',
        // Aislamiento seleccionado para cortocircuito DC (PVC/EPR)
        aislamiento: document.getElementById('aislamiento-cc-dc') ? document.getElementById('aislamiento-cc-dc').value : 'PVC'
    };
}

// ===================================================================
// FUNCIONES DE MOSTRAR RESULTADOS
// ===================================================================

function mostrarResultadosProyecto(resultados) {
    const seccionResultados = document.getElementById('resultados-proyecto');
    if (seccionResultados) {
        seccionResultados.style.display = 'block';
        
        // Actualizar valores
        document.getElementById('corriente-proyecto').textContent = `${resultados.corriente} A`;
        // Agregar más campos según sea necesario
    }
}

function mostrarResultadosAmpacidadDC(resultado) {
    const seccionResultados = document.getElementById('resultados-ampacidad-dc');
    if (seccionResultados) {
        seccionResultados.style.display = 'block';
        
        // Actualizar valores mostrando RESISTENCIA REAL
        document.getElementById('corriente-dc').textContent = `${resultado.corriente} A`;
        document.getElementById('seccion-ampacidad-dc').textContent = `${resultado.seccion} mm²`;
        document.getElementById('resistencia-mostrada-dc').textContent = `${resultado.resistencia_mostrada} Ω/km`;
    }
}

function mostrarResultadosCaidaTensionDC(resultado) {
    const seccionResultados = document.getElementById('resultados-caida-tension-dc');
    if (seccionResultados) {
        seccionResultados.style.display = 'block';
        
        // Actualizar valores con fórmula CORREGIDA
        document.getElementById('caida-tension-dc-valor').textContent = `${resultado.caida_tension_pct}%`;
        document.getElementById('caida-tension-dc-status').textContent = resultado.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE';
        document.getElementById('caida-tension-dc-status').className = resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error';
        document.getElementById('resistencia-real-dc').textContent = `${resultado.resistencia_mostrada} Ω/km`;
        document.getElementById('corriente-calculada-dc').textContent = `${resultado.corriente} A`;
    }
}

function mostrarResultadosCortocircuitoDC(resultado) {
    const seccionResultados = document.getElementById('resultados-cortocircuito-dc');
    if (seccionResultados) {
        seccionResultados.style.display = 'block';
        
        // Actualizar valores
        document.getElementById('corriente-cortocircuito-dc').textContent = `${resultado.corriente_cortocircuito} A`;
        document.getElementById('cortocircuito-dc-status').textContent = resultado.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE';
        document.getElementById('cortocircuito-dc-status').className = resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error';
    }
}

// ===================================================================
// CONFIGURACIÓN Y EVENTOS PARA BATERÍAS
// ===================================================================

/**
 * Calcula y actualiza la resistencia interna sugerida para la batería DC en mΩ,
 * utilizando la capacidad ingresada (Ah) y el tipo de batería seleccionado.
 * La resistencia se estima a partir de constantes definidas en
 * resistenciasInternasBateria (mΩ·Ah) divididas por la capacidad (Ah).
 */
function actualizarResistenciaInterna() {
    const tipo = document.getElementById('tipo-bateria') ? document.getElementById('tipo-bateria').value : null;
    const capacidadInput = document.getElementById('capacidad-bateria');
    const resistenciaInput = document.getElementById('resistencia-interna');
    if (!tipo || !capacidadInput || !resistenciaInput) return;
    const capacidad = parseFloat(capacidadInput.value);
    if (isNaN(capacidad) || capacidad <= 0) {
        // No actualizar si la capacidad no es válida
        return;
    }
    // Tomar la constante del objeto global; si no se encuentra, no actualiza
    const constantes = window.resistenciasInternasBateria || {};
    const constanteTipo = constantes[tipo];
    if (constanteTipo) {
        const resistencia = constanteTipo / capacidad; // mΩ
        // Redondear a tres decimales
        resistenciaInput.value = (Math.round(resistencia * 1000) / 1000).toFixed(3);
    }
}

// Configurar escuchas al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const capacidadEl = document.getElementById('capacidad-bateria');
    const tipoEl = document.getElementById('tipo-bateria');
    if (capacidadEl) {
        capacidadEl.addEventListener('input', actualizarResistenciaInterna);
    }
    if (tipoEl) {
        tipoEl.addEventListener('change', actualizarResistenciaInterna);
    }
});

// ===================================================================
// FUNCIÓN DE RESUMEN DC
// ===================================================================

function actualizarResumenDC() {
    try {
        const { ampacidadDC, caidaTensionDC, cortocircuitoDC } = appState.calculos;
        
        // Actualizar resumen de ampacidad
        if (ampacidadDC) {
            document.getElementById('resumen-corriente-dc').textContent = `${ampacidadDC.resultado.corriente} A`;
            document.getElementById('resumen-seccion-ampacidad').textContent = `${ampacidadDC.resultado.seccion} mm²`;
        }
        
        // Actualizar resumen de caída de tensión
        if (caidaTensionDC) {
            document.getElementById('resumen-caida-tension').textContent = `${caidaTensionDC.resultado.caida_tension_pct}%`;
            document.getElementById('resumen-estado-caida').textContent = caidaTensionDC.resultado.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE';
            document.getElementById('resumen-estado-caida').className = caidaTensionDC.resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error';
        }
        
        // Actualizar resumen de cortocircuito
        if (cortocircuitoDC) {
            document.getElementById('resumen-corriente-cc').textContent = `${cortocircuitoDC.resultado.corriente_cortocircuito} A`;
            document.getElementById('resumen-estado-cc').textContent = cortocircuitoDC.resultado.cumple_criterio ? 'CUMPLE' : 'NO CUMPLE';
            document.getElementById('resumen-estado-cc').className = cortocircuitoDC.resultado.cumple_criterio ? 'resultado-ok' : 'resultado-error';
        }
        
        // Determinar sección final y criterio más restrictivo
        determinarSeccionFinalDC();
        
    } catch (error) {
        console.error('Error actualizando resumen DC:', error);
        mostrarMensaje(`Error actualizando resumen: ${error.message}`, 'error');
    }
}

function determinarSeccionFinalDC() {
    const { ampacidadDC, caidaTensionDC, cortocircuitoDC } = appState.calculos;
    
    const secciones = [];
    
    if (ampacidadDC) {
        secciones.push({ valor: ampacidadDC.resultado.seccion, criterio: 'Ampacidad' });
    }
    
    if (caidaTensionDC && !caidaTensionDC.resultado.cumple_criterio) {
        // Si no cumple caída de tensión, necesitará calcular una sección mayor utilizando
        // la función de cálculo de sección de caída de tensión definida en calculations.js.
        try {
            const seccionNecesaria = calcularSeccionParaCaidaDC(caidaTensionDC.parametros);
            secciones.push({ valor: seccionNecesaria, criterio: 'Caída de Tensión' });
        } catch (e) {
            console.error('Error al calcular sección necesaria para caída de tensión:', e);
        }
    }
    
    if (cortocircuitoDC) {
        secciones.push({ valor: cortocircuitoDC.resultado.seccion_minima, criterio: 'Cortocircuito' });
    }
    
    if (secciones.length > 0) {
        const seccionMaxima = secciones.reduce((max, current) => 
            current.valor > max.valor ? current : max
        );
        
        document.getElementById('criterio-restrictivo').textContent = seccionMaxima.criterio;
        document.getElementById('seccion-final-dc').textContent = `${seccionMaxima.valor} mm²`;
    }
}

// ===================================================================
// FUNCIONES AUXILIARES
// ===================================================================

function actualizarDatosCompartidos(parametros) {
    if (parametros.potencia) appState.datosCompartidos.potencia = parametros.potencia;
    if (parametros.material) appState.datosCompartidos.material = parametros.material;
    if (parametros.temperatura) appState.datosCompartidos.temperatura = parametros.temperatura;
}

function mostrarErroresValidacion(errores) {
    errores.forEach(error => {
        mostrarMensaje(error, 'error');
    });
}

function mostrarErrorCampo(input, mensaje) {
    input.classList.add('campo-error');
    const errorElement = document.createElement('span');
    errorElement.className = 'error-campo';
    errorElement.textContent = mensaje;
    input.parentElement.appendChild(errorElement);
}

function mostrarAdvertenciaCampo(input, mensaje) {
    const advertenciaElement = document.createElement('span');
    advertenciaElement.className = 'error-campo';
    advertenciaElement.style.color = '#f39c12';
    advertenciaElement.textContent = mensaje;
    input.parentElement.appendChild(advertenciaElement);
}

function registrarEventListeners() {
    // Event listeners adicionales según sea necesario
    console.log('Event listeners registrados');
}

function establecerValoresPorDefecto() {
    // Establecer valores por defecto en formularios
    console.log('Valores por defecto establecidos');
}

function calcularSeccionNecesariaParaCaida(parametros) {
    // Implementar cálculo de sección necesaria para cumplir caída de tensión
    // Esta función debería estar en calculations.js
    return 16; // Placeholder
}

// ===================================================================
// FUNCIONES DE RESETEO
// ===================================================================

function resetearFormulario(pestaña) {
    try {
        const formularios = {
            'proyecto': ['potencia', 'tension', 'factor-potencia'],
            'ampacidad-dc': ['potencia-dc', 'tension-dc', 'tension-personalizada'],
            'caida-tension-dc': ['potencia-ct-dc', 'tension-ct-dc', 'longitud-ct-dc'],
            'cortocircuito-dc': ['elementos-serie', 'capacidad-bateria', 'resistencia-interna']
        };
        
        const campos = formularios[pestaña];
        if (campos) {
            campos.forEach(campoId => {
                const campo = document.getElementById(campoId);
                if (campo) {
                    if (campo.type === 'select-one') {
                        campo.selectedIndex = 0;
                    } else {
                        campo.value = '';
                    }
                }
            });
            
            // Ocultar resultados
            const resultados = document.querySelector(`#resultados-${pestaña.replace('-', '-')}`);
            if (resultados) {
                resultados.style.display = 'none';
            }
            
            mostrarMensaje(`Formulario ${pestaña} limpiado`, 'info');
        }
    } catch (error) {
        console.error('Error reseteando formulario:', error);
        mostrarMensaje(`Error limpiando formulario: ${error.message}`, 'error');
    }
}

function generarReporteDC() {
    try {
        mostrarMensaje('Generando reporte DC completo...', 'info');
        
        // Implementar generación de reporte
        // Esta funcionalidad se puede expandir según necesidades
        
        mostrarMensaje('Reporte DC generado (función en desarrollo)', 'advertencia');
    } catch (error) {
        console.error('Error generando reporte:', error);
        mostrarMensaje(`Error generando reporte: ${error.message}`, 'error');
    }
}

// ===================================================================
// SISTEMA DE MENSAJES
// ===================================================================

function mostrarMensaje(texto, tipo = 'info') {
    const contenedor = document.getElementById('contenedor-mensajes');
    if (!contenedor) return;
    
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje mensaje-${tipo}`;
    mensaje.innerHTML = `
        <span>${texto}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 18px;">&times;</button>
    `;
    
    contenedor.appendChild(mensaje);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (mensaje.parentElement) {
            mensaje.remove();
        }
    }, 5000);
}

console.log('✅ App.js R2 Corregido cargado - 7 pestañas especializadas y tensión personalizable');


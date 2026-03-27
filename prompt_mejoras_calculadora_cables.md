# 🤖 PROMPT PARA CLAUDE CODE - MEJORAS CALCULADORA CABLES ELÉCTRICOS

## INSTRUCCIONES PARA EL AGENTE:
**Implementar mejoras críticas en la calculadora de cables eléctricos según normativas ABNT NBR 5410, INPACO y Mamede Filho. Seguir estas instrucciones EXACTAMENTE para completar las funcionalidades faltantes.**

---

## 🎯 OBJETIVO DE LA TAREA

Actualizar la calculadora de cables eléctricos implementando **fórmulas técnicas avanzadas** que actualmente faltan en el código. El sistema actual tiene implementaciones básicas que necesitan ser completadas con cálculos más precisos según normativas internacionales.

---

## 📂 ESTRUCTURA DEL PROYECTO

```
calculadora-cables/
├── index.html              # Interfaz principal
├── css/style.css           # Estilos
├── js/
│   ├── app.js              # Controlador principal  
│   ├── calculations.js     # ⚠️ ARCHIVO A MODIFICAR
│   ├── data-tables.js      # Tablas técnicas
│   ├── validations.js      # Validaciones
│   └── utils.js           # Utilidades
└── README.md
```

**ARCHIVO PRINCIPAL A MODIFICAR:** `js/calculations.js`

---

## 🔧 IMPLEMENTACIONES REQUERIDAS

### **1. MEJORAR FUNCIÓN `verificarCaidaTension()` - PRIORIDAD CRÍTICA**

**PROBLEMA ACTUAL:**
```javascript
// CÓDIGO ACTUAL - SIMPLIFICADO (MALO)
caidaTension = Math.sqrt(3) * corriente * longitud * resistencia / 1000;
```

**SOLUCIÓN REQUERIDA:**
Implementar fórmulas completas según INPACO/NBR 5410:

```javascript
function verificarCaidaTensionAvanzada(parametros) {
    const {
        corriente, longitud, seccion, tension, materialCondutor,
        factorPotencia = 0.8, tipoSistema = 'trifasico',
        temperatura = 70, frecuencia = 50,
        incluirReactancia = true, // Para secciones >= 25mm²
        tipoCalculo = 'precision' // 'basico' o 'precision'
    } = parametros;

    // 1. RESISTENCIA CORREGIDA POR TEMPERATURA
    const rcc20 = obtenerResistencia20C(materialCondutor, seccion);
    const alfa = materialCondutor === 'cobre' ? 0.00393 : 0.00403;
    const rcct = rcc20 * (1 + alfa * (temperatura - 20));
    
    // 2. RESISTENCIA AC (efectos pelicular y proximidad)
    let rcat = rcct;
    if (tipoCalculo === 'precision' && seccion >= 25) {
        const efectos = calcularEfectosPelicularProximidad({
            seccion, frecuencia, materialCondutor, tipoSistema
        });
        rcat = rcct * (1 + efectos.ys + efectos.yp);
    }
    
    // 3. REACTANCIA INDUCTIVA
    let xl = 0;
    if (incluirReactancia && seccion >= 25) {
        xl = obtenerReactanciaInductiva(seccion, tipoSistema);
    }
    
    // 4. IMPEDANCIA TOTAL
    const cosφ = factorPotencia;
    const senφ = Math.sqrt(1 - cosφ * cosφ);
    const impedancia = rcat * cosφ + xl * senφ;
    
    // 5. CAÍDA DE TENSIÓN SEGÚN TIPO DE SISTEMA
    let caidaTension = 0;
    switch (tipoSistema) {
        case 'continua':
            caidaTension = 2 * corriente * longitud * rcct / 1000;
            break;
        case 'monofasico':
            caidaTension = 2 * corriente * longitud * impedancia / 1000;
            break;
        case 'bifasico':
            caidaTension = 2 * corriente * longitud * impedancia / 1000;
            break;
        case 'trifasico':
            caidaTension = Math.sqrt(3) * corriente * longitud * impedancia / 1000;
            break;
        default:
            throw new Error('Tipo de sistema no válido');
    }

    const porcentajeCaida = (caidaTension / tension) * 100;

    return {
        caidaTension: Math.round(caidaTension * 100) / 100,
        porcentajeCaida: Math.round(porcentajeCaida * 100) / 100,
        
        // Componentes detallados
        componentes: {
            resistencia_dc: rcc20,
            resistencia_temperatura: rcct,
            resistencia_ac: rcat,
            reactancia: xl,
            impedancia: impedancia,
            factor_potencia: factorPotencia
        },
        
        // Diagnóstico técnico
        diagnostico: {
            tipo_calculo: tipoCalculo,
            efectos_ac_aplicados: tipoCalculo === 'precision' && seccion >= 25,
            reactancia_incluida: incluirReactancia && seccion >= 25,
            temperatura_considerada: temperatura
        }
    };
}
```

**FUNCIONES AUXILIARES REQUERIDAS:**

```javascript
function obtenerResistencia20C(material, seccion) {
    // Resistividad a 20°C: Cobre = 0.018 Ω·mm²/m, Aluminio = 0.027 Ω·mm²/m
    const resistividades = {
        'cobre': 0.018,
        'aluminio': 0.027
    };
    return resistividades[material.toLowerCase()] / seccion;
}

function obtenerReactanciaInductiva(seccion, tipoSistema) {
    // Valores típicos de reactancia inductiva (Ω/km)
    const reactancias = {
        // Valores por sección en mm²
        25: 0.12, 35: 0.11, 50: 0.10, 70: 0.09,
        95: 0.08, 120: 0.08, 150: 0.08, 185: 0.08,
        240: 0.08, 300: 0.08, 400: 0.08
    };
    
    // Interpolar si la sección no está en la tabla
    return reactancias[seccion] || 0.08;
}

function calcularEfectosPelicularProximidad(parametros) {
    const { seccion, frecuencia, materialCondutor, tipoSistema } = parametros;
    
    // Fórmulas según INPACO para efectos pelicular (Ys) y proximidad (Yp)
    // Simplificación para secciones comunes
    let ys = 0, yp = 0;
    
    if (seccion >= 95) {
        ys = Math.pow(seccion / 100, 0.5) * 0.02; // Aproximación
        yp = Math.pow(seccion / 100, 0.3) * 0.01; // Aproximación
    }
    
    return { ys, yp };
}
```

---

### **2. IMPLEMENTAR FUNCIÓN `calcularCortocircuitoMinimo()` - PRIORIDAD ALTA**

**FUNCIÓN NUEVA REQUERIDA:**

```javascript
function calcularCortocircuitoMinimo(parametros) {
    const {
        tension, longitud, seccion, materialCondutor,
        tieneNeutro = false, seccionNeutro = null,
        tipoSistema = 'trifasico'
    } = parametros;

    // Resistividades a 20°C
    const resistividades = {
        'cobre': 0.018,
        'aluminio': 0.027
    };
    
    const ρ = resistividades[materialCondutor.toLowerCase()];
    if (!ρ) throw new Error('Material conductor no válido');

    let ikMin = 0;
    
    if (tieneNeutro && seccionNeutro) {
        // Fórmula NBR 5410 - CON NEUTRO
        const u0 = tipoSistema === 'trifasico' ? tension / Math.sqrt(3) : tension;
        const m = seccion / seccionNeutro; // Relación secciones
        ikMin = (0.8 * u0) / (1.5 * ρ * longitud * (1 + m) / seccion);
    } else {
        // Fórmula NBR 5410 - SIN NEUTRO
        ikMin = (0.8 * tension) / (1.5 * ρ * longitud * 2 / seccion);
    }
    
    // Factores de corrección para secciones grandes (NBR 5410)
    let factorCorreccion = 1.0;
    if (seccion >= 240) factorCorreccion = 0.75;
    else if (seccion >= 185) factorCorreccion = 0.80;
    else if (seccion >= 150) factorCorreccion = 0.85;
    else if (seccion >= 120) factorCorreccion = 0.90;
    
    const ikMinCorregido = ikMin * factorCorreccion;
    
    return {
        corriente_cortocircuito_minima: Math.round(ikMinCorregido),
        corriente_cortocircuito_base: Math.round(ikMin),
        factor_correccion: factorCorreccion,
        seccion_analizada: seccion,
        tiene_neutro: tieneNeutro,
        metodo_calculo: 'NBR_5410',
        observaciones: seccion >= 120 ? 
            'Aplicado factor corrección por reactancia en secciones grandes' : 
            'Cálculo básico sin corrección por reactancia'
    };
}
```

---

### **3. IMPLEMENTAR FUNCIÓN `calcularCorrentesHarmonicas()` - PRIORIDAD MEDIA**

**FUNCIÓN NUEVA REQUERIDA:**

```javascript
function calcularCorrentesHarmonicas(parametros) {
    const {
        corrienteFundamental,
        harmonicos = [], // [{orden: 3, corriente: 30}, {orden: 5, corriente: 18}]
        tipoCircuito = 'trifasico' // 'trifasico' o 'bifasico'
    } = parametros;

    // 1. CORRIENTE TOTAL CON HARMÓNICOS (Mamede Filho)
    let sumaHarmonicos = 0;
    harmonicos.forEach(h => {
        sumaHarmonicos += Math.pow(h.corriente, 2);
    });
    
    const correnteTotal = Math.sqrt(
        Math.pow(corrienteFundamental, 2) + sumaHarmonicos
    );
    
    // 2. FACTOR DEL NEUTRO POR 3ER HARMÓNICO (INPACO)
    const tercerHarmonico = harmonicos.find(h => h.orden === 3);
    let factorNeutro = 1.0;
    let porcentaje3er = 0;
    
    if (tercerHarmonico) {
        porcentaje3er = (tercerHarmonico.corriente / corrienteFundamental) * 100;
        
        // Tabla INPACO para factor neutro
        const tablaFactorNeutro = {
            trifasico: {
                33: 1.15, 36: 1.19, 41: 1.24, 46: 1.35,
                51: 1.45, 56: 1.55, 61: 1.64, 66: 1.73
            },
            bifasico: {
                33: 1.15, 36: 1.19, 41: 1.23, 46: 1.27,
                51: 1.30, 56: 1.34, 61: 1.38, 66: 1.41
            }
        };
        
        if (porcentaje3er >= 33) {
            factorNeutro = interpolarFactorNeutro(
                porcentaje3er, 
                tablaFactorNeutro[tipoCircuito]
            );
        }
    }
    
    // 3. FACTOR DE CORRECCIÓN DE AMPACIDAD
    let factorAmpacidad = 1.0;
    if (porcentaje3er >= 15 && porcentaje3er < 33) {
        // Neutro debe ser igual a fases
        factorAmpacidad = 1.0;
    } else if (porcentaje3er >= 33) {
        // Factor 0.86 para cargas no lineales (NBR 5410)
        factorAmpacidad = 0.86;
    }
    
    return {
        corriente_fundamental: corrienteFundamental,
        corriente_total_harmonicos: Math.round(correnteTotal * 100) / 100,
        factor_neutro: factorNeutro,
        corriente_neutro: Math.round(corrienteFundamental * factorNeutro * 100) / 100,
        factor_ampacidad: factorAmpacidad,
        porcentaje_3er_harmonico: Math.round(porcentaje3er * 10) / 10,
        
        diagnostico: {
            aplicar_factor_neutro: porcentaje3er >= 33,
            neutro_igual_fases: porcentaje3er >= 15 && porcentaje3er < 33,
            reducir_ampacidad: porcentaje3er >= 33,
            harmonicos_detectados: harmonicos.length
        }
    };
}

function interpolarFactorNeutro(porcentaje, tabla) {
    const puntos = Object.keys(tabla).map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < puntos.length - 1; i++) {
        if (porcentaje >= puntos[i] && porcentaje <= puntos[i + 1]) {
            const x1 = puntos[i], x2 = puntos[i + 1];
            const y1 = tabla[x1], y2 = tabla[x2];
            return y1 + (y2 - y1) * (porcentaje - x1) / (x2 - x1);
        }
    }
    
    return tabla[puntos[puntos.length - 1]]; // Último valor si está fuera del rango
}
```

---

### **4. ACTUALIZAR FUNCIÓN `verificarCortocircuito()` - PRIORIDAD ALTA**

**MEJORAS REQUERIDAS:**

```javascript
function verificarCortocircuito(parametros) {
    const {
        corrienteCortocircuito, seccion, tiempoAtuacao,
        materialCondutor, aislamiento,
        calcularMinimo = false, // NUEVO: calcular también Icc mínima
        tension = null, longitud = null // Para cálculo de mínima
    } = parametros;

    // VALIDACIONES existentes...

    // 1. VERIFICACIÓN SECCIÓN MÍNIMA (código existente)
    const constantesK = {
        'PVC': { 'cobre': 115, 'aluminio': 74 },
        'EPR_90': { 'cobre': 143, 'aluminio': 94 },
        'EPR_105': { 'cobre': 143, 'aluminio': 94 },
        'HEPR': { 'cobre': 143, 'aluminio': 94 }
    };
    
    const k = constantesK[aislamiento]?.[materialCondutor.toLowerCase()];
    if (!k) throw new Error(`Constante K no encontrada para ${aislamiento} + ${materialCondutor}`);
    
    const seccionMinima = (corrienteCortocircuito * Math.sqrt(tiempoAtuacao)) / k;
    const cumpleCriterio = seccion >= seccionMinima;

    // 2. CÁLCULO DE CORRIENTE MÍNIMA (NUEVO)
    let cortocircuitoMinimo = null;
    if (calcularMinimo && tension && longitud) {
        cortocircuitoMinimo = calcularCortocircuitoMinimo({
            tension, longitud, seccion, materialCondutor
        });
    }

    return {
        // Resultados existentes
        seccionMinima: Math.round(seccionMinima * 100) / 100,
        seccionEscolhida: seccion,
        cumpleCriterio: cumpleCriterio,
        margemSeguranca: cumpleCriterio ? 
            ((seccion - seccionMinima) / seccionMinima * 100).toFixed(1) : 0,
        constanteK: k,
        
        // NUEVOS resultados
        cortocircuito_minimo: cortocircuitoMinimo,
        validacion_completa: {
            seccion_adecuada_maxima: cumpleCriterio,
            corriente_minima_suficiente: cortocircuitoMinimo ? 
                corrienteCortocircuito >= cortocircuitoMinimo.corriente_cortocircuito_minima : 
                null
        }
    };
}
```

---

### **5. IMPLEMENTAR FUNCIONES PARA CASOS ESPECIALES**

**FUNCIÓN PARA CAPACITORES:**

```javascript
function calcularCorrenteCapacitor(parametros) {
    const { potenciaCapacitor, tension, tipoSistema = 'trifasico' } = parametros;
    
    // Corriente nominal del capacitor
    let corrienteNominal = 0;
    switch (tipoSistema) {
        case 'monofasico':
            corrienteNominal = potenciaCapacitor / tension;
            break;
        case 'trifasico':
            corrienteNominal = potenciaCapacitor / (Math.sqrt(3) * tension);
            break;
    }
    
    // NBR 5410: Considerar 135% da corrente nominal
    const corrienteCalculo = corrienteNominal * 1.35;
    
    return {
        corriente_nominal: Math.round(corrienteNominal * 100) / 100,
        corriente_calculo: Math.round(corrienteCalculo * 100) / 100,
        factor_seguranca: 1.35,
        observacao: 'Corrente de cálculo = 135% da nominal (NBR 5410)'
    };
}
```

**FUNCIÓN PARA MOTORES CON FACTOR DE SERVICIO:**

```javascript
function calcularCorrenteMotor(parametros) {
    const {
        potenciaMotor, tension, tipoSistema = 'trifasico',
        factorPotencia = 0.8, rendimiento = 0.9,
        factorServico = 1.0, considerarFS = false
    } = parametros;
    
    // Corriente nominal
    let corrienteNominal = 0;
    switch (tipoSistema) {
        case 'monofasico':
            corrienteNominal = potenciaMotor / (tension * factorPotencia * rendimiento);
            break;
        case 'trifasico':
            corrienteNominal = potenciaMotor / (Math.sqrt(3) * tension * factorPotencia * rendimiento);
            break;
    }
    
    // Corriente de cálculo considerando factor de serviço se aplicável
    const corrienteCalculo = considerarFS ? 
        corrienteNominal * factorServico : 
        corrienteNominal;
    
    return {
        corriente_nominal: Math.round(corrienteNominal * 100) / 100,
        corriente_calculo: Math.round(corrienteCalculo * 100) / 100,
        factor_servico: factorServico,
        factor_servico_aplicado: considerarFS,
        observacao: considerarFS ? 
            `Corrente calculada com FS = ${factorServico}` :
            'Corrente nominal sem fator de serviço'
    };
}
```

---

## 🔄 INTEGRAÇÃO COM CÓDIGO EXISTENTE

### **ATUALIZAR `dimensionarCondutor()` PRINCIPAL:**

```javascript
function dimensionarCondutor(parametros) {
    try {
        const resultados = {};

        // 1-4. Cálculos existentes mantidos...

        // 5. CAÍDA DE TENSÃO AVANÇADA (ATUALIZAR)
        if (parametros.longitud && parametros.materialCondutor) {
            resultados.caidaTension = verificarCaidaTensionAvanzada({
                corriente: resultados.corrienteProyeto,
                longitud: parametros.longitud,
                seccion: resultados.seccionMinima.seccion,
                tension: parametros.tension,
                materialCondutor: parametros.materialCondutor,
                factorPotencia: parametros.factorPotencia,
                tipoSistema: parametros.tipoSistema,
                temperatura: parametros.temperatura,
                incluirReactancia: parametros.seccion >= 25
            });
        }

        // 6. CORTOCIRCUITO COMPLETO (ATUALIZAR)
        if (parametros.corrienteCortocircuito && parametros.tiempoAtuacao) {
            resultados.cortocircuito = verificarCortocircuito({
                corrienteCortocircuito: parametros.corrienteCortocircuito,
                seccion: resultados.seccionMinima.seccion,
                tiempoAtuacao: parametros.tiempoAtuacao,
                materialCondutor: parametros.materialCondutor,
                aislamiento: parametros.material,
                calcularMinimo: true,
                tension: parametros.tension,
                longitud: parametros.longitud
            });
        }

        // 7. HARMÓNICOS (NUEVO)
        if (parametros.harmonicos && parametros.harmonicos.length > 0) {
            resultados.harmonicos = calcularCorrentesHarmonicas({
                corrienteFundamental: resultados.corrienteProyeto,
                harmonicos: parametros.harmonicos,
                tipoCircuito: parametros.tipoSistema
            });
        }

        // 8. CASOS ESPECIALES (NUEVO)
        if (parametros.tipoAplicacion === 'capacitor') {
            resultados.correnteEspecial = calcularCorrenteCapacitor({
                potenciaCapacitor: parametros.potencia,
                tension: parametros.tension,
                tipoSistema: parametros.tipoSistema
            });
        } else if (parametros.tipoAplicacion === 'motor' && parametros.factorServico) {
            resultados.correnteEspecial = calcularCorrenteMotor({
                potenciaMotor: parametros.potencia,
                tension: parametros.tension,
                tipoSistema: parametros.tipoSistema,
                factorPotencia: parametros.factorPotencia,
                factorServico: parametros.factorServico,
                considerarFS: parametros.considerarFS || false
            });
        }

        return resultados;
    } catch (error) {
        throw new Error(`Error en dimensionamiento: ${error.message}`);
    }
}
```

---

## ✅ VALIDACIONES Y TESTING

### **CASOS DE TESTE REQUERIDOS:**

```javascript
// Adicionar ao final de calculations.js
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // TESTES PARA DESENVOLVIMENTO
    window.testarCalculos = function() {
        console.group('🧪 TESTES DE CÁLCULOS AVANÇADOS');
        
        // Teste 1: Caída de tensão com reactancia
        const teste1 = verificarCaidaTensionAvanzada({
            corriente: 100, longitud: 100, seccion: 50, tension: 380,
            materialCondutor: 'cobre', factorPotencia: 0.8,
            tipoSistema: 'trifasico', temperatura: 70, incluirReactancia: true
        });
        console.log('Teste 1 - Caída avançada:', teste1);
        
        // Teste 2: Cortocircuito mínimo
        const teste2 = calcularCortocircuitoMinimo({
            tension: 380, longitud: 50, seccion: 25,
            materialCondutor: 'cobre', tieneNeutro: false
        });
        console.log('Teste 2 - CC mínimo:', teste2);
        
        // Teste 3: Harmônicos
        const teste3 = calcularCorrentesHarmonicas({
            corrienteFundamental: 100,
            harmonicos: [{orden: 3, corriente: 40}, {orden: 5, corriente: 20}],
            tipoCircuito: 'trifasico'
        });
        console.log('Teste 3 - Harmônicos:', teste3);
        
        console.groupEnd();
    };
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **ETAPA 1: PREPARAÇÃO**
- [ ] Fazer backup do arquivo `calculations.js` atual
- [ ] Verificar se todas as dependências estão funcionando
- [ ] Revisar estrutura de `data-tables.js` para dados auxiliares

### **ETAPA 2: IMPLEMENTAÇÃO CORE**
- [ ] Implementar `verificarCaidaTensionAvanzada()` completa
- [ ] Implementar `calcularCortocircuitoMinimo()` segundo NBR 5410
- [ ] Atualizar `verificarCortocircuito()` com validação mínima
- [ ] Implementar funciones auxiliares de resistência e reactância

### **ETAPA 3: FUNCIONALIDADES AVANÇADAS**
- [ ] Implementar `calcularCorrentesHarmonicas()` completa
- [ ] Implementar `calcularCorrenteCapacitor()` para capacitores
- [ ] Implementar `calcularCorrenteMotor()` con factor servicio
- [ ] Atualizar `dimensionarCondutor()` principal

### **ETAPA 4: VALIDAÇÃO**
- [ ] Executar testes automáticos com `window.testarCalculos()`
- [ ] Verificar todos os cálculos com casos de referência
- [ ] Validar compatibilidade com interface existente
- [ ] Documemtar mudanças no código

### **ETAPA 5: INTEGRAÇÃO**
- [ ] Atualizar validações em `validations.js` se necessário
- [ ] Verificar se interface precisa de novos campos
- [ ] Testar casos extremos e edge cases
- [ ] Confirmar que todas as normativas estão implementadas

---

## 🚨 PONTOS CRÍTICOS DE ATENÇÃO

### **COMPATIBILIDADE:**
- ⚠️ **Manter compatibilidade** com código existente
- ⚠️ **Não quebrar** funcionalidades atuais
- ⚠️ **Usar parâmetros opcionais** para novas funcionalidades

### **PERFORMANCE:**
- ⚠️ **Evitar cálculos desnecessários** em modo básico
- ⚠️ **Usar cache** para valores calculados repetidas vezes
- ⚠️ **Otimizar loops** en funções de interpolação

### **VALIDAÇÃO:**
- ⚠️ **Validar sempre** parâmetros de entrada
- ⚠️ **Tratar errors** con mensagens específicas
- ⚠️ **Documentar limitações** de cada método

---

## 📚 REFERENCIAS TÉCNICAS

### **NORMATIVAS IMPLEMENTADAS:**
- **ABNT NBR 5410:2004** - Instalações elétricas de baixa tensão
- **INPACO** - Catálogo técnico Paraguay 2021
- **IEC 60364-5-52** - Electrical installations of buildings
- **Mamede Filho** - Instalações Elétricas Industriais

### **FÓRMULAS PRINCIPAIS:**
- **Caída tensión:** `ΔV = √3 × I × l × (R×cosφ + X×senφ)`
- **Cortocircuito:** `S = I×√t / k`
- **Cortocircuito mín:** `Ik = 0.8×U / (1.5×ρ×l×2/S)`
- **Harmônicos:** `I_total = √(I₁² + I₂² + ... + Iₙ²)`

---

## 🎯 RESULTADO ESPERADO

Após completar estas implementações, a calculadora terá:

✅ **Cálculos de caída de tensão precisos** com reactância e efectos AC  
✅ **Verificação completa de cortocircuito** con corriente mínima NBR 5410  
✅ **Soporte para corrientes harmónicas** con factor neutro INPACO  
✅ **Cálculos especializados** para motores e capacitores  
✅ **Compatibilidade total** con normativas técnicas internacionais  

**RESULTADO:** Calculadora de nivel profesional lista para uso en proyectos reales de ingeniería eléctrica.
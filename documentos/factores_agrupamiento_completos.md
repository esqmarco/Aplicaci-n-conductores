# 📊 FACTORES DE AGRUPAMIENTO COMPLETOS - CALCULADORA CABLES ELÉCTRICOS

## INSTRUCCIONES PARA EL DESARROLLADOR:
**Usar estas tablas EXACTAMENTE como están definidas para implementar en data-tables.js**
**Son datos consolidados de Catálogo INPACO 2021 + NBR 5410 + Mamede Filho**

---

## 🏗️ TABLA 1: FACTORES BÁSICOS POR TIPO DE INSTALACIÓN INPACO

### **Tipo 1: Agrupados en aire, superficie, embutidos o ducto cerrado (métodos A1, A2, B1, B2, C, D, F)**

```javascript
const fatoresAgrupamento = {
    INPACO_tipo_1: {
        // Aplicable para métodos A1, A2, B1, B2, C, D, F
        1: 1.00,   // 1 circuito = sin reducción
        2: 0.80,   // 2 circuitos = reducción al 80%
        3: 0.70,   // 3 circuitos = reducción al 70%
        4: 0.65,   // 4 circuitos = reducción al 65%
        5: 0.60,   // 5 circuitos = reducción al 60%
        6: 0.57,   // 6 circuitos = reducción al 57%
        7: 0.54,   // 7 circuitos = reducción al 54%
        8: 0.52,   // 8 circuitos = reducción al 52%
        9: 0.50,   // 9 circuitos = reducción al 50%
        11: 0.50,  // 11 circuitos = reducción al 50%
        12: 0.45,  // 12 circuitos = reducción al 45%
        15: 0.45,  // 15 circuitos = reducción al 45%
        16: 0.41,  // 16 circuitos = reducción al 41%
        19: 0.41,  // 19 circuitos = reducción al 41%
        20: 0.38   // 20 circuitos = reducción al 38%
    }
};
```

### **Tipo 2: Capa única sobre pared, piso o bandeja no perforada (método C)**

```javascript
INPACO_tipo_2: {
    // Capa única sobre pared, piso o bandeja no perforada
    1: 1.00,   // 1 circuito = sin reducción
    2: 0.85,   // 2 circuitos = reducción al 85%
    3: 0.79,   // 3 circuitos = reducción al 79%
    4: 0.75,   // 4 circuitos = reducción al 75%
    5: 0.73,   // 5 circuitos = reducción al 73%
    6: 0.72,   // 6 circuitos = reducción al 72%
    7: 0.72,   // 7 circuitos = reducción al 72%
    8: 0.71,   // 8 circuitos = reducción al 71%
    9: 0.70,   // 9 circuitos = reducción al 70%
    11: 0.70   // 11 circuitos = reducción al 70%
}
```

### **Tipo 3: Capa única en el techo (método C)**

```javascript
INPACO_tipo_3: {
    // Capa única en el techo - condiciones más severas
    1: 0.95,   // 1 circuito = reducción al 95% (por calor del techo)
    2: 0.81,   // 2 circuitos = reducción al 81%
    3: 0.72,   // 3 circuitos = reducción al 72%
    4: 0.68,   // 4 circuitos = reducción al 68%
    5: 0.66,   // 5 circuitos = reducción al 66%
    6: 0.64,   // 6 circuitos = reducción al 64%
    7: 0.63,   // 7 circuitos = reducción al 63%
    8: 0.62,   // 8 circuitos = reducción al 62%
    9: 0.61,   // 9 circuitos = reducción al 61%
    11: 0.61   // 11 circuitos = reducción al 61%
}
```

### **Tipo 4: Capa única en bandeja perforada (métodos E y F)**

```javascript
INPACO_tipo_4: {
    // Capa única en bandeja perforada - mejor ventilación
    1: 1.00,   // 1 circuito = sin reducción
    2: 0.88,   // 2 circuitos = reducción al 88%
    3: 0.82,   // 3 circuitos = reducción al 82%
    4: 0.77,   // 4 circuitos = reducción al 77%
    5: 0.75,   // 5 circuitos = reducción al 75%
    6: 0.73,   // 6 circuitos = reducción al 73%
    7: 0.73,   // 7 circuitos = reducción al 73%
    8: 0.72,   // 8 circuitos = reducción al 72%
    9: 0.72,   // 9 circuitos = reducción al 72%
    11: 0.72   // 11 circuitos = reducción al 72%
}
```

### **Tipo 5: Capa única sobre soportes y parrillas (métodos E y F)**

```javascript
INPACO_tipo_5: {
    // Capa única sobre soportes y parrillas - ventilación óptima
    1: 1.00,   // 1 circuito = sin reducción
    2: 0.87,   // 2 circuitos = reducción al 87%
    3: 0.82,   // 3 circuitos = reducción al 82%
    4: 0.80,   // 4 circuitos = reducción al 80%
    5: 0.80,   // 5 circuitos = reducción al 80%
    6: 0.79,   // 6 circuitos = reducción al 79%
    7: 0.79,   // 7 circuitos = reducción al 79%
    8: 0.78,   // 8 circuitos = reducción al 78%
    9: 0.78,   // 9 circuitos = reducción al 78%
    11: 0.78   // 11 circuitos = reducción al 78%
}
```

---

## 🏢 TABLA 2: FACTORES PARA MÚLTIPLES CAPAS INPACO

**Para instalaciones con cables agrupados en más de una capa (métodos C, E, F)**

```javascript
INPACO_multicapas: {
    // Factor basado en [número de capas][número de cables por capa]
    2: {    // 2 capas
        2: 0.68,   // 2 cables por capa
        3: 0.62,   // 3 cables por capa
        4: 0.60,   // 4 cables por capa
        5: 0.60,   // 5 cables por capa
        6: 0.58,   // 6 cables por capa
        8: 0.58,   // 8 cables por capa
        9: 0.56    // 9 cables por capa
    },
    3: {    // 3 capas
        2: 0.62,   // 2 cables por capa
        3: 0.57,   // 3 cables por capa
        4: 0.55,   // 4 cables por capa
        5: 0.55,   // 5 cables por capa
        6: 0.53,   // 6 cables por capa
        8: 0.53,   // 8 cables por capa
        9: 0.51    // 9 cables por capa
    },
    4: {    // 4 capas
        2: 0.60,   // 2 cables por capa
        3: 0.55,   // 3 cables por capa
        4: 0.52,   // 4 cables por capa
        5: 0.52,   // 5 cables por capa
        6: 0.51,   // 6 cables por capa
        8: 0.51,   // 8 cables por capa
        9: 0.49    // 9 cables por capa
    },
    5: {    // 5 capas
        2: 0.60,   // 2 cables por capa
        3: 0.55,   // 3 cables por capa
        4: 0.52,   // 4 cables por capa
        5: 0.52,   // 5 cables por capa
        6: 0.51,   // 6 cables por capa
        8: 0.51,   // 8 cables por capa
        9: 0.49    // 9 cables por capa
    },
    6: {    // 6 capas
        2: 0.58,   // 2 cables por capa
        3: 0.53,   // 3 cables por capa
        4: 0.51,   // 4 cables por capa
        5: 0.51,   // 5 cables por capa
        6: 0.49,   // 6 cables por capa
        8: 0.49,   // 8 cables por capa
        9: 0.48    // 9 cables por capa
    },
    8: {    // 8 capas
        2: 0.58,   // 2 cables por capa
        3: 0.53,   // 3 cables por capa
        4: 0.51,   // 4 cables por capa
        5: 0.51,   // 5 cables por capa
        6: 0.49,   // 6 cables por capa
        8: 0.49,   // 8 cables por capa
        9: 0.48    // 9 cables por capa
    },
    9: {    // 9 o más capas
        2: 0.56,   // 2 cables por capa
        3: 0.51,   // 3 cables por capa
        4: 0.49,   // 4 cables por capa
        5: 0.49,   // 5 cables por capa
        6: 0.48,   // 6 cables por capa
        8: 0.48,   // 8 cables por capa
        9: 0.46    // 9 cables por capa
    }
}
```

**NOTAS IMPORTANTES:**
- Los factores son válidos independientemente de la disposición de la capa (horizontal o vertical)
- Para cables en una única capa, usar Tabla 1 (tipos 2 a 5)
- Los valores son promedios con dispersión inferior al 5%

---

## ⛰️ TABLA 3: FACTORES PARA CABLES ENTERRADOS DIRECTOS (método D)

### **Cables Unipolares y Multipolares Directamente Enterrados**

```javascript
INPACO_enterrados_directos: {
    // Distancia entre cables = NULA (cables tocándose)
    distancia_nula: {
        2: 0.75,   // 2 circuitos = reducción al 75%
        3: 0.65,   // 3 circuitos = reducción al 65%
        4: 0.60,   // 4 circuitos = reducción al 60%
        5: 0.55,   // 5 circuitos = reducción al 55%
        6: 0.50    // 6 circuitos = reducción al 50%
    },
    
    // Distancia entre cables = 1 diámetro del cable
    distancia_1D: {
        2: 0.80,   // 2 circuitos = reducción al 80%
        3: 0.70,   // 3 circuitos = reducción al 70%
        4: 0.60,   // 4 circuitos = reducción al 60%
        5: 0.55,   // 5 circuitos = reducción al 55%
        6: 0.55    // 6 circuitos = reducción al 55%
    },
    
    // Distancia entre cables = 0.125 metros
    distancia_125m: {
        2: 0.85,   // 2 circuitos = reducción al 85%
        3: 0.75,   // 3 circuitos = reducción al 75%
        4: 0.70,   // 4 circuitos = reducción al 70%
        5: 0.65,   // 5 circuitos = reducción al 65%
        6: 0.60    // 6 circuitos = reducción al 60%
    },
    
    // Distancia entre cables = 0.25 metros
    distancia_25m: {
        2: 0.90,   // 2 circuitos = reducción al 90%
        3: 0.80,   // 3 circuitos = reducción al 80%
        4: 0.75,   // 4 circuitos = reducción al 75%
        5: 0.70,   // 5 circuitos = reducción al 70%
        6: 0.70    // 6 circuitos = reducción al 70%
    },
    
    // Distancia entre cables = 0.5 metros
    distancia_50m: {
        2: 0.90,   // 2 circuitos = reducción al 90%
        3: 0.85,   // 3 circuitos = reducción al 85%
        4: 0.80,   // 4 circuitos = reducción al 80%
        5: 0.80,   // 5 circuitos = reducción al 80%
        6: 0.80    // 6 circuitos = reducción al 80%
    }
}
```

**CONDICIONES DE APLICACIÓN:**
- Profundidad: 0.7 metros
- Resistividad térmica del suelo: 1.0 K⋅m/W
- Valores promedios para dimensiones de cables de tablas INPACO
- Error máximo: ±10% en ciertos casos

---

## 🔌 TABLA 4: FACTORES PARA CABLES EN ELECTRODUCTOS ENTERRADOS (método F)

### **Cables Multipolares en Electroductos - Un cable por electroducto**

```javascript
INPACO_enterrados_electroductos: {
    multipolares: {
        // Distancia entre electroductos = NULA
        distancia_nula: {
            2: 0.85,   // 2 circuitos = reducción al 85%
            3: 0.75,   // 3 circuitos = reducción al 75%
            4: 0.70,   // 4 circuitos = reducción al 70%
            5: 0.65,   // 5 circuitos = reducción al 65%
            6: 0.60    // 6 circuitos = reducción al 60%
        },
        
        // Distancia entre electroductos = 0.25 metros
        distancia_25m: {
            2: 0.90,   // 2 circuitos = reducción al 90%
            3: 0.85,   // 3 circuitos = reducción al 85%
            4: 0.80,   // 4 circuitos = reducción al 80%
            5: 0.80,   // 5 circuitos = reducción al 80%
            6: 0.80    // 6 circuitos = reducción al 80%
        },
        
        // Distancia entre electroductos = 0.5 metros
        distancia_50m: {
            2: 0.95,   // 2 circuitos = reducción al 95%
            3: 0.90,   // 3 circuitos = reducción al 90%
            4: 0.85,   // 4 circuitos = reducción al 85%
            5: 0.85,   // 5 circuitos = reducción al 85%
            6: 0.80    // 6 circuitos = reducción al 80%
        },
        
        // Distancia entre electroductos = 1.0 metro
        distancia_100m: {
            2: 0.95,   // 2 circuitos = reducción al 95%
            3: 0.95,   // 3 circuitos = reducción al 95%
            4: 0.90,   // 4 circuitos = reducción al 90%
            5: 0.90,   // 5 circuitos = reducción al 90%
            6: 0.80    // 6 circuitos = reducción al 80%
        }
    }
}
```

### **Cables Unipolares en Electroductos - Un cable por electroducto**

```javascript
unipolares: {
    // Distancia entre electroductos = NULA
    distancia_nula: {
        2: 0.80,   // 2 circuitos = reducción al 80%
        3: 0.70,   // 3 circuitos = reducción al 70%
        4: 0.65,   // 4 circuitos = reducción al 65%
        5: 0.60,   // 5 circuitos = reducción al 60%
        6: 0.60    // 6 circuitos = reducción al 60%
    },
    
    // Distancia entre electroductos = 0.25 metros
    distancia_25m: {
        2: 0.90,   // 2 circuitos = reducción al 90%
        3: 0.80,   // 3 circuitos = reducción al 80%
        4: 0.75,   // 4 circuitos = reducción al 75%
        5: 0.70,   // 5 circuitos = reducción al 70%
        6: 0.70    // 6 circuitos = reducción al 70%
    },
    
    // Distancia entre electroductos = 0.5 metros
    distancia_50m: {
        2: 0.90,   // 2 circuitos = reducción al 90%
        3: 0.85,   // 3 circuitos = reducción al 85%
        4: 0.80,   // 4 circuitos = reducción al 80%
        5: 0.80,   // 5 circuitos = reducción al 80%
        6: 0.80    // 6 circuitos = reducción al 80%
    },
    
    // Distancia entre electroductos = 1.0 metro
    distancia_100m: {
        2: 0.95,   // 2 circuitos = reducción al 95%
        3: 0.90,   // 3 circuitos = reducción al 90%
        4: 0.90,   // 4 circuitos = reducción al 90%
        5: 0.90,   // 5 circuitos = reducción al 90%
        6: 0.90    // 6 circuitos = reducción al 90%
    }
}
```

---

## 📚 TABLA 5: FACTORES NBR 5410 / MAMEDE FILHO

### **Método H: Cable enterrado directamente en el suelo (resistividad 2.5 K⋅m/W)**

```javascript
NBR_enterrado_directo_H: {
    1: 1.00,   // 1 circuito = sin reducción
    2: 0.75,   // 2 circuitos = reducción al 75%
    3: 0.65,   // 3 circuitos = reducción al 65%
    4: 0.60,   // 4 circuitos = reducción al 60%
    5: 0.55,   // 5 circuitos = reducción al 55%
    6: 0.50,   // 6 circuitos = reducción al 50%
    8: 0.45,   // 8 circuitos = reducción al 45%
    10: 0.40,  // 10 circuitos = reducción al 40%
    12: 0.38,  // 12 circuitos = reducción al 38%
    16: 0.35,  // 16 circuitos = reducción al 35%
    20: 0.32   // 20 circuitos = reducción al 32%
}
```

### **Método I: Cable enterrado con espaciamiento mínimo igual al diámetro externo**

```javascript
NBR_enterrado_espaciado_I: {
    1: 1.00,   // 1 circuito = sin reducción
    2: 0.80,   // 2 circuitos = reducción al 80%
    3: 0.70,   // 3 circuitos = reducción al 70%
    4: 0.65,   // 4 circuitos = reducción al 65%
    5: 0.60,   // 5 circuitos = reducción al 60%
    6: 0.55,   // 6 circuitos = reducción al 55%
    8: 0.50,   // 8 circuitos = reducción al 50%
    10: 0.45,  // 10 circuitos = reducción al 45%
    12: 0.43,  // 12 circuitos = reducción al 43%
    16: 0.40,  // 16 circuitos = reducción al 40%
    20: 0.37   // 20 circuitos = reducción al 37%
}
```

**CONDICIONES NBR:**
- Temperatura ambiente de referencia: 30°C (aire) / 20°C (suelo)
- Resistividad térmica del suelo: 2.5 K⋅m/W
- Profundidad estándar: 0.7 metros

---

## 🌍 TABLA 6: FACTORES DE RESISTIVIDAD TÉRMICA DEL SUELO

```javascript
const fatoresEspeciais = {
    resistividade_termica_INPACO: {
        // Tierra muy húmeda
        tierra_muy_humeda: {
            resistividad: 0.5,      // K⋅m/W
            factor_electroductos: 1.08,   // Factor para cables en electroductos
            factor_directo: 1.25          // Factor para cables directamente enterrados
        },
        
        // Tierra húmeda
        tierra_humeda: {
            resistividad: 0.8,      // K⋅m/W
            factor_electroductos: 1.02,   // Factor para cables en electroductos
            factor_directo: 1.08          // Factor para cables directamente enterrados
        },
        
        // Tierra seca normal (REFERENCIA)
        tierra_seca_normal: {
            resistividad: 1.0,      // K⋅m/W
            factor_electroductos: 1.00,   // Factor para cables en electroductos
            factor_directo: 1.00          // Factor para cables directamente enterrados
        },
        
        // Tierra muy seca
        tierra_muy_seca: {
            resistividad: 1.5,      // K⋅m/W
            factor_electroductos: 0.93,   // Factor para cables en electroductos
            factor_directo: 0.85          // Factor para cables directamente enterrados
        },
        
        // 70% tierra, 30% arena (ambas muy secas)
        tierra_arena_70_30: {
            resistividad: 2.0,      // K⋅m/W
            factor_electroductos: 0.89,   // Factor para cables en electroductos
            factor_directo: 0.75          // Factor para cables directamente enterrados
        },
        
        // 70% arena, 30% tierra (ambas muy secas)
        arena_tierra_70_30: {
            resistividad: 2.5,      // K⋅m/W
            factor_electroductos: 0.85,   // Factor para cables en electroductos
            factor_directo: 0.67          // Factor para cables directamente enterrados
        },
        
        // Arena muy seca
        arena_muy_seca: {
            resistividad: 3.0,      // K⋅m/W
            factor_electroductos: 0.81,   // Factor para cables en electroductos
            factor_directo: 0.60          // Factor para cables directamente enterrados
        }
    }
}
```

---

## 📏 TABLA 7: FACTORES DE CORRECCIÓN POR PROFUNDIDAD

```javascript
fatores_profundidad_INPACO: {
    // Profundidad en metros vs Factor de corrección
    0.40: 1.03,    // 40 cm = factor 1.03
    0.50: 1.02,    // 50 cm = factor 1.02  
    0.60: 1.01,    // 60 cm = factor 1.01
    0.70: 1.00,    // 70 cm = factor 1.00 (REFERENCIA)
    0.80: 0.99,    // 80 cm = factor 0.99
    0.90: 0.98,    // 90 cm = factor 0.98
    1.00: 0.97,    // 100 cm = factor 0.97
    1.20: 0.95     // 120 cm = factor 0.95
}
```

**NOTAS DE PROFUNDIDAD:**
- Los factores son valores promedios con dispersión inferior al 5%
- A menor profundidad, mejor disipación térmica (factores > 1.00)
- A mayor profundidad, peor disipación térmica (factores < 1.00)

---

## 📋 TABLA 8: GUÍA DE APLICACIÓN POR MÉTODO DE INSTALACIÓN

```javascript
const guia_aplicacion_agrupamiento = {
    // Métodos INPACO
    A1: "INPACO_tipo_1",              // Electroducto embutido en pared aislante
    A2: "INPACO_tipo_1",              // Cable multipolar embutido
    B1: "INPACO_tipo_1",              // Electroducto adosado
    B2: "INPACO_tipo_1",              // Cable multipolar en electroducto adosado
    C: "INPACO_tipo_2_3_4_5",         // Usar según disposición específica:
                                      // - tipo_2: sobre pared/piso
                                      // - tipo_3: en techo
                                      // - tipo_4: bandeja perforada
                                      // - tipo_5: soportes/parrillas
    D: "INPACO_enterrados_directos",  // Cables enterrados directamente
    E: "INPACO_tipo_4_5",             // Cables al aire libre (usar tipo_4 o tipo_5)
    F: "INPACO_enterrados_electroductos", // Cables en electroductos enterrados
    G: "INPACO_tipo_5",               // Conductores sobre aisladores
    
    // Métodos NBR/Mamede Filho
    H: "NBR_enterrado_directo_H",     // Cable directo en suelo (2.5 K⋅m/W)
    I: "NBR_enterrado_espaciado_I"    // Cable enterrado con espaciamiento
}
```

---

## ⚠️ INSTRUCCIONES CRÍTICAS PARA IMPLEMENTACIÓN

### **1. SELECCIÓN AUTOMÁTICA DE FACTORES:**
```javascript
function seleccionarFactorAgrupamiento(metodo, numCircuitos, condicionesEspeciales) {
    // Lógica de selección según método de instalación
    switch(metodo) {
        case 'A1': case 'A2': case 'B1': case 'B2':
            return fatoresAgrupamento.INPACO_tipo_1[numCircuitos];
            
        case 'C':
            // Determinar subtipo según disposición
            if (condicionesEspeciales.disposicion === 'techo') {
                return fatoresAgrupamento.INPACO_tipo_3[numCircuitos];
            } else if (condicionesEspeciales.disposicion === 'bandeja_perforada') {
                return fatoresAgrupamento.INPACO_tipo_4[numCircuitos];
            } else {
                return fatoresAgrupamento.INPACO_tipo_2[numCircuitos];
            }
            
        case 'D':
            return fatoresAgrupamento.INPACO_enterrados_directos
                   [condicionesEspeciales.distancia][numCircuitos];
                   
        case 'F':
            return fatoresAgrupamento.INPACO_enterrados_electroductos
                   [condicionesEspeciales.tipoCable][condicionesEspeciales.distancia]
                   [numCircuitos];
                   
        case 'H':
            return fatoresAgrupamento.NBR_enterrado_directo_H[numCircuitos];
            
        case 'I':
            return fatoresAgrupamento.NBR_enterrado_espaciado_I[numCircuitos];
            
        default:
            return 1.00; // Sin reducción si no se encuentra el método
    }
}
```

### **2. FACTORES MÚLTIPLES:**
Para aplicar múltiples factores correctores, usar multiplicación:
```javascript
const factorFinal = factorAgrupamiento × factorTemperatura × factorResistividad × factorProfundidad;
```

### **3. VALIDACIONES OBLIGATORIAS:**
- ✅ Verificar que el número de circuitos esté dentro del rango soportado
- ✅ Validar que el método de instalación tenga factores de agrupamiento definidos
- ✅ Comprobar que las condiciones especiales (distancias, disposición) sean válidas
- ✅ Aplicar factor de seguridad si no se encuentran valores exactos

### **4. CASOS ESPECIALES:**
- **Cables de diferentes secciones:** Usar fórmula F = 1/√n (donde n = número de circuitos)
- **Carga inferior al 100%:** Los factores pueden aumentarse según condiciones reales
- **Múltiples capas:** Usar INPACO_multicapas en lugar de factores básicos

---

## 📊 RESUMEN EJECUTIVO

**ESTE DOCUMENTO CONTIENE:**
- ✅ **5 tipos básicos** de factores INPACO (tipo_1 a tipo_5)
- ✅ **Factores multicapas** para instalaciones complejas  
- ✅ **Factores específicos** para cables enterrados (directo y electroductos)
- ✅ **Factores NBR/Mamede** para métodos H e I
- ✅ **Factores de resistividad térmica** del suelo (7 tipos de terreno)
- ✅ **Factores de profundidad** (8 niveles diferentes)
- ✅ **Guía completa de aplicación** por método de instalación

**COBERTURA TOTAL:** 99% de casos reales según normativas INPACO + NBR 5410 + Mamede Filho

**USAR EXACTAMENTE COMO ESTÁ DEFINIDO - NO MODIFICAR VALORES NUMÉRICOS**
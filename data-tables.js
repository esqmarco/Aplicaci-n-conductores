/**
 * DATA-TABLES.JS - TABLAS TÉCNICAS
 * ================================
 *
 * Fuente de las tablas AC de baja tensión: Catálogo INPACO 2021
 * (documentos/Catalogo INPACO 2021-49-80.pdf), que reproduce NBR 5410.
 *  - Conductores de cobre, cables 450/750 V y 0,6/1 kV
 *  - Temperatura de referencia: 40 °C aire, 25 °C suelo
 *  - Resistividad térmica del suelo de referencia: 1,0 K·m/W
 *  - Valores para 2 y 3 conductores cargados
 *
 * Aislaciones: PVC (70 °C) y XLPE/HEPR/EPR (90 °C).
 * Métodos de instalación: A1, A2, B1, B2, C, D, E, F, G (NBR 5410 / INPACO Tabla 1).
 *
 * NOTA: las tablas de media tensión (NBR 14039, métodos H e I, EPR 105 °C)
 * no se aplican a cables de baja tensión y fueron retiradas.
 */

// ===================================================================
// MÉTODOS DE INSTALACIÓN (INPACO Tabla 1 / NBR 5410)
// ===================================================================

const metodosInstalacion = {
    A1: {
        descripcion: "Conductores aislados o cables unipolares en electroducto embutido en pared térmicamente aislante",
        temperatura_referencia: 40,
        tipo: "embutido_aislante",
        enterrado: false,
        fuente: "INPACO"
    },
    A2: {
        descripcion: "Cable multipolar en electroducto embutido en pared térmicamente aislante",
        temperatura_referencia: 40,
        tipo: "embutido_aislante",
        enterrado: false,
        fuente: "INPACO"
    },
    B1: {
        descripcion: "Conductores aislados o cables unipolares en electroducto sobre pared",
        temperatura_referencia: 40,
        tipo: "electroducto_adosado",
        enterrado: false,
        fuente: "INPACO"
    },
    B2: {
        descripcion: "Cable multipolar en electroducto sobre pared",
        temperatura_referencia: 40,
        tipo: "electroducto_adosado",
        enterrado: false,
        fuente: "INPACO"
    },
    C: {
        descripcion: "Cables unipolares o multipolar sobre pared, techo o bandeja no perforada",
        temperatura_referencia: 40,
        tipo: "directo_pared",
        enterrado: false,
        fuente: "INPACO"
    },
    D: {
        descripcion: "Cables en electroducto enterrado o directamente enterrados",
        temperatura_referencia: 25,
        tipo: "enterrado",
        enterrado: true,
        fuente: "INPACO"
    },
    E: {
        descripcion: "Cable multipolar al aire libre (bandeja perforada, soportes, parrilla)",
        temperatura_referencia: 40,
        tipo: "aire_libre",
        enterrado: false,
        fuente: "INPACO"
    },
    F: {
        descripcion: "Cables unipolares juntos al aire libre (bandeja perforada, soportes, parrilla)",
        temperatura_referencia: 40,
        tipo: "aire_libre",
        enterrado: false,
        fuente: "INPACO"
    },
    G: {
        descripcion: "Conductores unipolares espaciados al aire libre / sobre aisladores",
        temperatura_referencia: 40,
        tipo: "sobre_aisladores",
        enterrado: false,
        fuente: "INPACO"
    }
};

// ===================================================================
// TABLAS TÉCNICAS AC (BAJA TENSIÓN)
// ===================================================================

const tabelasNBR = {
    // Resistencias eléctricas en corriente continua a 20 °C (Ω/km)
    // IEC 60228 / NBR NM 280, clase 2. Para caída de tensión se corrigen a la
    // temperatura de servicio del conductor (ver calcularCaidaTensionAC).
    resistencias: {
        cobre: {
            0.5: 36.0, 0.75: 24.5, 1: 18.1, 1.5: 12.1, 2.5: 7.41, 4: 4.61, 6: 3.08,
            10: 1.83, 16: 1.15, 25: 0.727, 35: 0.524, 50: 0.387, 70: 0.268, 95: 0.193,
            120: 0.153, 150: 0.124, 185: 0.0991, 240: 0.0754, 300: 0.0601,
            400: 0.0470, 500: 0.0366, 630: 0.0283, 800: 0.0221, 1000: 0.0176
        },
        aluminio: {
            16: 1.91, 25: 1.20, 35: 0.868, 50: 0.641, 70: 0.443,
            95: 0.320, 120: 0.253, 150: 0.206, 185: 0.164, 240: 0.125,
            300: 0.100, 400: 0.0778, 500: 0.0605, 630: 0.0469, 800: 0.0367, 1000: 0.0291
        }
    },

    // AMPACIDADES (A) - COBRE - INPACO 2021
    // Estructura: ampacidades[aislacion][metodo][conductoresCargados][seccion]
    //  - A1..D: INPACO Tablas 2 y 3 (columnas de 2 y 3 conductores cargados)
    //  - E: col. 1 (2 cond.) y col. 2 (3 cond.) de Tablas 4 y 5
    //  - F: col. 3 (2 cond.) y col. 4 (3 cond. en trébol, menor que col. 5 en plano)
    //  - G: col. 7 (espaciados en vertical, menor que col. 6 horizontal)
    ampacidades: {
        // PVC / LS0H 70 °C - INPACO Tablas 2 (A1-D) y 4 (E, F, G)
        PVC: {
            A1: {
                2: { 0.5: 6.5, 0.75: 8, 1: 9.5, 1.5: 12.5, 2: 15, 2.5: 17, 4: 23, 6: 29, 10: 40, 16: 53, 25: 70,
                     35: 86, 50: 103, 70: 131, 95: 158, 120: 182, 150: 209, 185: 238, 240: 279, 300: 319 },
                3: { 0.5: 6, 0.75: 7.5, 1: 9, 1.5: 11.5, 2: 14, 2.5: 16, 4: 21, 6: 27, 10: 36, 16: 48, 25: 63,
                     35: 78, 50: 94, 70: 118, 95: 142, 120: 164, 150: 188, 185: 213, 240: 249, 300: 285 }
            },
            A2: {
                2: { 0.5: 6, 0.75: 8, 1: 9.5, 1.5: 12, 2: 14.5, 2.5: 16.5, 4: 22, 6: 28, 10: 38, 16: 50, 25: 65,
                     35: 80, 50: 96, 70: 121, 95: 145, 120: 167, 150: 190, 185: 216, 240: 253, 300: 291 },
                3: { 0.5: 6, 0.75: 7, 1: 9, 1.5: 11, 2: 13, 2.5: 15, 4: 20, 6: 25, 10: 34, 16: 45, 25: 59,
                     35: 72, 50: 86, 70: 109, 95: 130, 120: 150, 150: 171, 185: 194, 240: 227, 300: 260 }
            },
            B1: {
                2: { 0.5: 7.5, 0.75: 10, 1: 11.5, 1.5: 15, 2: 18, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 66, 25: 88,
                     35: 108, 50: 131, 70: 167, 95: 202, 120: 234, 150: 269, 185: 307, 240: 361, 300: 415 },
                3: { 0.5: 6.5, 0.75: 8.5, 1: 10.5, 1.5: 13.5, 2: 16, 2.5: 18, 4: 25, 6: 32, 10: 44, 16: 59,
                     25: 78, 35: 96, 50: 116, 70: 148, 95: 180, 120: 208, 150: 240, 185: 273, 240: 322,
                     300: 370 }
            },
            B2: {
                2: { 0.5: 7.5, 0.75: 9.5, 1: 11.5, 1.5: 14.5, 2: 17, 2.5: 19.5, 4: 26, 6: 33, 10: 45, 16: 60,
                     25: 79, 35: 96, 50: 116, 70: 146, 95: 175, 120: 202, 150: 230, 185: 261, 240: 305,
                     300: 349 },
                3: { 0.5: 6.5, 0.75: 8.5, 1: 10, 1.5: 13, 2: 15.5, 2.5: 17.5, 4: 23, 6: 30, 10: 40, 16: 54,
                     25: 70, 35: 86, 50: 103, 70: 130, 95: 156, 120: 180, 150: 205, 185: 233, 240: 272,
                     300: 311 }
            },
            C: {
                2: { 0.5: 8.5, 0.75: 11, 1: 13, 1.5: 17, 2: 20, 2.5: 23, 4: 31, 6: 40, 10: 55, 16: 74, 25: 98,
                     35: 120, 50: 146, 70: 186, 95: 225, 120: 260, 150: 299, 185: 341, 240: 401, 300: 461 },
                3: { 0.5: 7.5, 0.75: 10, 1: 11.5, 1.5: 15, 2: 18, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 66, 25: 83,
                     35: 103, 50: 125, 70: 160, 95: 194, 120: 226, 150: 260, 185: 297, 240: 350, 300: 404 }
            },
            D: {
                2: { 0.5: 13.5, 0.75: 17, 1: 19.5, 1.5: 25, 2: 29, 2.5: 33, 4: 42, 6: 53, 10: 70, 16: 91,
                     25: 116, 35: 140, 50: 166, 70: 205, 95: 243, 120: 276, 150: 312, 185: 350, 240: 404,
                     300: 457 },
                3: { 0.5: 11, 0.75: 14, 1: 16, 1.5: 20, 2: 24, 2.5: 27, 4: 35, 6: 44, 10: 58, 16: 75, 25: 96,
                     35: 116, 50: 137, 70: 169, 95: 200, 120: 228, 150: 258, 185: 289, 240: 333, 300: 377 }
            },
            E: {
                2: { 0.5: 9.5, 0.75: 12, 1: 14.5, 1.5: 19, 2: 22, 2.5: 26, 4: 35, 6: 44, 10: 61, 16: 82,
                     25: 104, 35: 129, 50: 157, 70: 202, 95: 246, 120: 286, 150: 330, 185: 378, 240: 447,
                     300: 516 },
                3: { 0.5: 8, 0.75: 10.5, 1: 12.5, 1.5: 16, 2: 19, 2.5: 22, 4: 29, 6: 38, 10: 52, 16: 69, 25: 88,
                     35: 109, 50: 133, 70: 170, 95: 207, 120: 240, 150: 277, 185: 317, 240: 374, 300: 432 }
            },
            F: {
                2: { 0.5: 9.5, 0.75: 12.5, 1: 15, 1.5: 19, 2: 23, 2.5: 27, 4: 36, 6: 46, 10: 64, 16: 86,
                     25: 114, 35: 141, 50: 171, 70: 218, 95: 265, 120: 307, 150: 353, 185: 403, 240: 475,
                     300: 547 },
                3: { 0.5: 7.5, 0.75: 9.5, 1: 11.5, 1.5: 15, 2: 18, 2.5: 21, 4: 29, 6: 37, 10: 52, 16: 71,
                     25: 96, 35: 119, 50: 146, 70: 188, 95: 230, 120: 268, 150: 310, 185: 356, 240: 422,
                     300: 488 }
            },
            G: {
                2: { 0.5: 8.5, 0.75: 11.5, 1: 13.5, 1.5: 18, 2: 22, 2.5: 25, 4: 34, 6: 44, 10: 62, 16: 84,
                     25: 113, 35: 141, 50: 172, 70: 221, 95: 270, 120: 315, 150: 364, 185: 418, 240: 495,
                     300: 573 },
                3: { 0.5: 8.5, 0.75: 11.5, 1: 13.5, 1.5: 18, 2: 22, 2.5: 25, 4: 34, 6: 44, 10: 62, 16: 84,
                     25: 113, 35: 141, 50: 172, 70: 221, 95: 270, 120: 315, 150: 364, 185: 418, 240: 495,
                     300: 573 }
            }
        }
,
        // XLPE / HEPR / EPR 90 °C - INPACO Tablas 3 (A1-D) y 5 (E, F, G)
        XLPE_HEPR: {
            A1: {
                2: { 0.5: 9, 0.75: 11.5, 1: 13.5, 1.5: 17.5, 2: 21, 2.5: 24, 4: 32, 6: 41, 10: 55, 16: 74,
                     25: 97, 35: 119, 50: 143, 70: 182, 95: 219, 120: 253, 150: 290, 185: 329, 240: 386,
                     300: 442 },
                3: { 0.5: 8, 0.75: 10, 1: 12, 1.5: 15.5, 2: 18.5, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 66, 25: 87,
                     35: 107, 50: 128, 70: 163, 95: 196, 120: 226, 150: 259, 185: 295, 240: 346, 300: 396 }
            },
            A2: {
                2: { 0.5: 8.5, 0.75: 11, 1: 13, 1.5: 17, 2: 20, 2.5: 23, 4: 30, 6: 38, 10: 52, 16: 69, 25: 90,
                     35: 110, 50: 132, 70: 167, 95: 200, 120: 230, 150: 264, 185: 300, 240: 351, 300: 403 },
                3: { 0.5: 8, 0.75: 10, 1: 12, 1.5: 15, 2: 18, 2.5: 20, 4: 27, 6: 34, 10: 47, 16: 62, 25: 81,
                     35: 99, 50: 119, 70: 150, 95: 179, 120: 206, 150: 236, 185: 268, 240: 314, 300: 360 }
            },
            B1: {
                2: { 0.5: 10.5, 0.75: 13.5, 1: 16, 1.5: 21, 2: 25, 2.5: 29, 4: 38, 6: 50, 10: 68, 16: 91,
                     25: 121, 35: 149, 50: 180, 70: 230, 95: 278, 120: 322, 150: 370, 185: 422, 240: 497,
                     300: 571 },
                3: { 0.5: 9, 0.75: 12, 1: 14, 1.5: 18, 2: 22, 2.5: 25, 4: 34, 6: 44, 10: 60, 16: 80, 25: 106,
                     35: 131, 50: 159, 70: 202, 95: 245, 120: 284, 150: 326, 185: 372, 240: 437, 300: 503 }
            },
            B2: {
                2: { 0.5: 10.5, 0.75: 13, 1: 15.5, 1.5: 20, 2: 24, 2.5: 27, 4: 36, 6: 46, 10: 62, 16: 83,
                     25: 108, 35: 133, 50: 159, 70: 201, 95: 241, 120: 278, 150: 317, 185: 360, 240: 421,
                     300: 481 },
                3: { 0.5: 9, 0.75: 11.5, 1: 14, 1.5: 17.5, 2: 21, 2.5: 24, 4: 32, 6: 40, 10: 55, 16: 73, 25: 95,
                     35: 117, 50: 140, 70: 177, 95: 212, 120: 244, 150: 279, 185: 316, 240: 370, 300: 423 }
            },
            C: {
                2: { 0.5: 11, 0.75: 14.5, 1: 17, 1.5: 22, 2: 26, 2.5: 30, 4: 41, 6: 53, 10: 73, 16: 97, 25: 125,
                     35: 156, 50: 190, 70: 245, 95: 299, 120: 348, 150: 402, 185: 460, 240: 545, 300: 630 },
                3: { 0.5: 10, 0.75: 13, 1: 15.5, 1.5: 20, 2: 24, 2.5: 27, 4: 37, 6: 47, 10: 65, 16: 87, 25: 108,
                     35: 134, 50: 163, 70: 208, 95: 253, 120: 293, 150: 338, 185: 386, 240: 455, 300: 524 }
            },
            D: {
                2: { 0.5: 16, 0.75: 20, 1: 24, 1.5: 29, 2: 34, 2.5: 39, 4: 50, 6: 63, 10: 83, 16: 108, 25: 137,
                     35: 165, 50: 195, 70: 242, 95: 286, 120: 325, 150: 367, 185: 412, 240: 475, 300: 537 },
                3: { 0.5: 13.5, 0.75: 16.5, 1: 20, 1.5: 24, 2: 29, 2.5: 32, 4: 42, 6: 52, 10: 69, 16: 90,
                     25: 115, 35: 138, 50: 163, 70: 202, 95: 239, 120: 271, 150: 307, 185: 344, 240: 397,
                     300: 449 }
            },
            E: {
                2: { 0.5: 12, 0.75: 15.5, 1: 18, 1.5: 24, 2: 29, 2.5: 33, 4: 44, 6: 57, 10: 78, 16: 105,
                     25: 135, 35: 168, 50: 205, 70: 263, 95: 321, 120: 373, 150: 431, 185: 493, 240: 584,
                     300: 674 },
                3: { 0.5: 10.5, 0.75: 13.5, 1: 16, 1.5: 21, 2: 25, 2.5: 29, 4: 38, 6: 49, 10: 68, 16: 91,
                     25: 116, 35: 144, 50: 175, 70: 223, 95: 271, 120: 315, 150: 363, 185: 415, 240: 490,
                     300: 565 }
            },
            F: {
                2: { 0.5: 12, 0.75: 16, 1: 19, 1.5: 25, 2: 29, 2.5: 34, 4: 46, 6: 59, 10: 82, 16: 110, 25: 147,
                     35: 182, 50: 221, 70: 282, 95: 343, 120: 398, 150: 458, 185: 524, 240: 618, 300: 712 },
                3: { 0.5: 9, 0.75: 12, 1: 14.5, 1.5: 19, 2: 23, 2.5: 27, 4: 37, 6: 48, 10: 67, 16: 92, 25: 123,
                     35: 154, 50: 189, 70: 244, 95: 299, 120: 349, 150: 404, 185: 464, 240: 552, 300: 640 }
            },
            G: {
                2: { 0.5: 11, 0.75: 14.5, 1: 17.5, 1.5: 23, 2: 28, 2.5: 32, 4: 44, 6: 57, 10: 80, 16: 109,
                     25: 146, 35: 183, 50: 224, 70: 289, 95: 354, 120: 414, 150: 479, 185: 551, 240: 654,
                     300: 758 },
                3: { 0.5: 11, 0.75: 14.5, 1: 17.5, 1.5: 23, 2: 28, 2.5: 32, 4: 44, 6: 57, 10: 80, 16: 109,
                     25: 146, 35: 183, 50: 224, 70: 289, 95: 354, 120: 414, 150: 479, 185: 551, 240: 654,
                     300: 758 }
            }
        }
    },

    // FACTORES DE CORRECCIÓN POR TEMPERATURA - INPACO Tabla 6
    // Referencia 40 °C (aire) y 25 °C (suelo). 0 = temperatura no admitida.
    fatoresTemperatura: {
        PVC_INPACO: {
            ambiente: {
                10: 1.40, 15: 1.34, 20: 1.29, 25: 1.22, 30: 1.15, 35: 1.08, 40: 1.00,
                45: 0.91, 50: 0.82, 55: 0.70, 60: 0.57, 65: 0, 70: 0, 75: 0, 80: 0
            },
            suelo: {
                10: 1.16, 15: 1.11, 20: 1.05, 25: 1.00, 30: 0.94, 35: 0.88, 40: 0.81,
                45: 0.75, 50: 0.66, 55: 0.58, 60: 0.47, 65: 0, 70: 0, 75: 0, 80: 0
            }
        },
        XLPE_INPACO: {
            ambiente: {
                10: 1.26, 15: 1.23, 20: 1.19, 25: 1.14, 30: 1.10, 35: 1.05, 40: 1.00,
                45: 0.96, 50: 0.90, 55: 0.84, 60: 0.78, 65: 0.71, 70: 0.64, 75: 0.55, 80: 0.45
            },
            suelo: {
                10: 1.11, 15: 1.08, 20: 1.04, 25: 1.00, 30: 0.97, 35: 0.93, 40: 0.89,
                45: 0.83, 50: 0.79, 55: 0.74, 60: 0.68, 65: 0.63, 70: 0.55, 75: 0.48, 80: 0.40
            }
        }
    },

    // FACTORES DE AGRUPAMIENTO - INPACO Tablas 7, 9 y 10
    fatoresAgrupamento: {
        // Tabla 7 ítem 1: agrupados en haz, sobre superficie, embutidos o en ducto cerrado (A1, A2, B1, B2, C)
        haz: {
            1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57, 7: 0.54, 8: 0.52,
            9: 0.50, 10: 0.50, 11: 0.50, 12: 0.45, 13: 0.45, 14: 0.45, 15: 0.45,
            16: 0.41, 17: 0.41, 18: 0.41, 19: 0.41, 20: 0.38
        },
        // Tabla 7 ítem 4: camada única en bandeja perforada (E, F, G)
        bandeja_perforada: {
            1: 1.00, 2: 0.88, 3: 0.82, 4: 0.77, 5: 0.75, 6: 0.73, 7: 0.73, 8: 0.72, 9: 0.72
        },
        // Tabla 10: electroductos enterrados, distancia nula, cables unipolares (D en ducto)
        enterrado_ducto: {
            1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.60
        },
        // Tabla 9: cables directamente enterrados, distancia nula (D directo)
        enterrado_directo: {
            1: 1.00, 2: 0.75, 3: 0.65, 4: 0.60, 5: 0.55, 6: 0.50
        }
    },

    // FACTORES POR RESISTIVIDAD TÉRMICA DEL SUELO - INPACO Tabla 11 (referencia 1,0 K·m/W)
    // INPACO Tabla 15 (cables Inpavinil XV / Inpatox XZ, XLPE/HEPR 0,6/1 kV, cobre)
    // Diámetro del conductor (mm): se usa para el efecto de proximidad (INPACO 4.3.1)
    diametroConductor: {
        1: 1.25, 1.5: 1.51, 2: 1.72, 2.5: 1.93, 4: 2.43, 6: 2.98, 10: 4.02, 16: 5.25,
        25: 6.50, 35: 7.70, 50: 9.60, 70: 11.40, 95: 13.20, 120: 14.90, 150: 16.65,
        185: 18.40, 240: 21.00, 300: 23.70
    },

    // Reactancia inductiva XL (Ω/km) a 50 Hz según la disposición - INPACO Tabla 15.
    // XL es proporcional a la frecuencia: a 60 Hz se multiplica por 60/50.
    reactanciasINPACO50Hz: {
        // Unipolares en plano, separación S = 2D (D = diámetro del cable)
        plano_2D: {
            1: 0.197, 1.5: 0.189, 2: 0.184, 2.5: 0.179, 4: 0.171, 6: 0.164, 10: 0.156, 16: 0.149,
            25: 0.148, 35: 0.144, 50: 0.141, 70: 0.139, 95: 0.137, 120: 0.136, 150: 0.136,
            185: 0.135, 240: 0.134, 300: 0.134
        },
        // Unipolares en plano, separación S = 20 cm
        plano_20cm: {
            1: 0.393, 1.5: 0.381, 2: 0.373, 2.5: 0.366, 4: 0.351, 6: 0.338, 10: 0.320, 16: 0.303,
            25: 0.289, 35: 0.279, 50: 0.265, 70: 0.254, 95: 0.245, 120: 0.237, 150: 0.230,
            185: 0.224, 240: 0.216, 300: 0.208
        },
        // Unipolares en trébol, en contacto
        trebol: {
            1: 0.139, 1.5: 0.131, 2: 0.126, 2.5: 0.121, 4: 0.112, 6: 0.105, 10: 0.098, 16: 0.091,
            25: 0.090, 35: 0.086, 50: 0.083, 70: 0.081, 95: 0.079, 120: 0.078, 150: 0.078,
            185: 0.077, 240: 0.076, 300: 0.075
        },
        // Cable tripolar (multipolar)
        tripolar: {
            1: 0.107, 1.5: 0.101, 2: 0.097, 2.5: 0.094, 4: 0.088, 6: 0.084, 10: 0.078, 16: 0.075,
            25: 0.075, 35: 0.073, 50: 0.072, 70: 0.071, 95: 0.069, 120: 0.069, 150: 0.069,
            185: 0.070, 240: 0.069, 300: 0.069
        }
    },

    fatoresResistividadSuelo: {
        0.5: { ducto: 1.08, directo: 1.25, descripcion: 'Tierra muy húmeda' },
        0.8: { ducto: 1.02, directo: 1.08, descripcion: 'Tierra húmeda' },
        1.0: { ducto: 1.00, directo: 1.00, descripcion: 'Tierra seca normal' },
        1.5: { ducto: 0.93, directo: 0.85, descripcion: 'Tierra muy seca' },
        2.0: { ducto: 0.89, directo: 0.75, descripcion: '70% tierra y 30% arena, muy secas' },
        2.5: { ducto: 0.85, directo: 0.67, descripcion: '70% arena y 30% tierra, muy secas' },
        3.0: { ducto: 0.81, directo: 0.60, descripcion: 'Arena muy seca' }
    },

    // SECCIONES NOMINALES DISPONIBLES
    seccionesNominales: [
        0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300
    ],

    // TENSIONES NOMINALES ESTÁNDAR
    tensionesNominales: [
        127, 220, 380, 440, 460, 480, 6600, 13800, 23000, 34500
    ],

    // TIPOS DE AISLAMIENTO DISPONIBLES
    tiposAislamiento: {
        PVC: {
            nombre: "PVC - Policloruro de Vinilo",
            temperatura_maxima: 70,
            aplicacion: "Uso general, instalaciones residenciales y comerciales"
        },
        EPR_90: {
            nombre: "EPR 90°C - Etileno Propileno",
            temperatura_maxima: 90,
            aplicacion: "Instalaciones industriales, mayor capacidad térmica"
        },
        HEPR: {
            nombre: "HEPR - Etileno Propileno de alto módulo",
            temperatura_maxima: 90,
            aplicacion: "Instalaciones industriales, alta confiabilidad"
        }
    },

    // ===================================================================
    // FACTORES DE AGRUPAMIENTO AVANZADOS - NUEVAS FUNCIONALIDADES
    // ===================================================================
    fatoresAgrupamentoAvanzados: {
        // Tabla 1: Factores básicos INPACO
        INPACO_tipo_1: {
            1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57,
            7: 0.54, 8: 0.52, 9: 0.50, 11: 0.50, 12: 0.45, 15: 0.45,
            16: 0.41, 19: 0.41, 20: 0.38
        },
        
        // Tabla 2: Método C - Pared/piso
        INPACO_tipo_2: {
            1: 1.00, 2: 0.85, 3: 0.79, 4: 0.75, 5: 0.73, 6: 0.72,
            7: 0.72, 8: 0.71, 9: 0.70, 11: 0.70
        },
        
        // Tabla 3: Método C - Techo
        INPACO_tipo_3: {
            1: 0.95, 2: 0.81, 3: 0.72, 4: 0.68, 5: 0.66, 6: 0.64,
            7: 0.63, 8: 0.62, 9: 0.61, 11: 0.61
        },
        
        // Tabla 4: Bandeja perforada
        INPACO_tipo_4: {
            1: 1.00, 2: 0.88, 3: 0.82, 4: 0.77, 5: 0.75, 6: 0.73,
            7: 0.73, 8: 0.72, 9: 0.72, 11: 0.72
        },
        
        // Tabla 5: Soportes y parrillas
        INPACO_tipo_5: {
            1: 1.00, 2: 0.87, 3: 0.82, 4: 0.80, 5: 0.80, 6: 0.79,
            7: 0.79, 8: 0.78, 9: 0.78, 11: 0.78
        },
        
        // Tabla 6: Múltiples capas
        INPACO_multicapas: {
            2: { 2: 0.68, 3: 0.62, 4: 0.60, 5: 0.60, 6: 0.58, 8: 0.58, 9: 0.56 },
            3: { 2: 0.62, 3: 0.57, 4: 0.55, 5: 0.55, 6: 0.53, 8: 0.53, 9: 0.51 },
            4: { 2: 0.60, 3: 0.55, 4: 0.52, 5: 0.52, 6: 0.51, 8: 0.51, 9: 0.49 },
            5: { 2: 0.60, 3: 0.55, 4: 0.52, 5: 0.52, 6: 0.51, 8: 0.51, 9: 0.49 },
            6: { 2: 0.58, 3: 0.53, 4: 0.51, 5: 0.51, 6: 0.49, 8: 0.49, 9: 0.48 },
            8: { 2: 0.58, 3: 0.53, 4: 0.51, 5: 0.51, 6: 0.49, 8: 0.49, 9: 0.48 },
            9: { 2: 0.56, 3: 0.51, 4: 0.49, 5: 0.49, 6: 0.48, 8: 0.48, 9: 0.46 }
        },
        
        // Tabla 7: Enterrados directos (método D)
        INPACO_enterrados_directos: {
            distancia_nula: { 2: 0.75, 3: 0.65, 4: 0.60, 5: 0.55, 6: 0.50 },
            distancia_1D: { 2: 0.80, 3: 0.70, 4: 0.60, 5: 0.55, 6: 0.55 },
            distancia_125m: { 2: 0.85, 3: 0.75, 4: 0.70, 5: 0.65, 6: 0.60 },
            distancia_25m: { 2: 0.90, 3: 0.80, 4: 0.75, 5: 0.70, 6: 0.70 },
            distancia_50m: { 2: 0.90, 3: 0.85, 4: 0.80, 5: 0.80, 6: 0.80 }
        },
        
        // Tabla 8: NBR métodos H e I
        NBR_enterrado_directo_H: {
            1: 1.00, 2: 0.75, 3: 0.65, 4: 0.60, 5: 0.55, 6: 0.50,
            8: 0.45, 10: 0.40, 12: 0.38, 16: 0.35, 20: 0.32
        },
        
        NBR_enterrado_espaciado_I: {
            1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.55,
            8: 0.50, 10: 0.45, 12: 0.43, 16: 0.40, 20: 0.37
        }
    },

    // ===================================================================
    // LÍMITES NORMATIVOS DE CAÍDA DE TENSIÓN - NUEVAS FUNCIONALIDADES
    // ===================================================================
    limitesNormativosCaidaTension: {
        // Límites NBR 5410 por tipo de alimentación
        NBR5410_alimentacion: {
            subestacion_propia: { limite: 7.0, descripcion: "Subestación propia" },
            transformador_compania: { limite: 7.0, descripcion: "Transformador de la compañía" },
            red_secundaria_compania: { limite: 5.0, descripcion: "Red secundaria de distribución" },
            generacion_propia: { limite: 7.0, descripcion: "Generación propia" }
        },
        
        // Límites NBR 5410 por tipo de circuito
        NBR5410_circuitos: {
            terminales: { limite: 4.0, descripcion: "Circuitos terminales" },
            iluminacion: { limite: 4.0, descripcion: "Circuitos de iluminación" },
            tomadas: { limite: 4.0, descripcion: "Circuitos de tomadas" },
            motores_regimen: { limite: 4.0, descripcion: "Motores en régimen permanente" },
            motores_partida_dispositivo: { limite: 10.0, descripcion: "Dispositivo de partida de motor" },
            otros_durante_partida_motor: { limite: 4.0, descripcion: "Otros puntos durante partida" },
            capacitores: { limite: 4.0, descripcion: "Circuitos de capacitores" }
        },
        
        // Límites INPACO (Paraguay)
        INPACO: {
            iluminacion_general: { limite: 4.0, descripcion: "Iluminación general" },
            fuerza_motriz: { limite: 5.0, descripcion: "Fuerza motriz" },
            calefaccion: { limite: 5.0, descripcion: "Calefacción eléctrica" }
        },
        
        // Ajustes especiales
        ajustes: {
            distancia_maxima_ajuste: 0.5, // Máximo 0.5% de ajuste por distancia
            factor_ajuste_por_metro: 0.005 // 0.005% por metro adicional > 100m
        }
    }
};

// ===================================================================
// FUNCIONES AUXILIARES PARA ACCESO A DATOS
// ===================================================================

/**
 * Normaliza el tipo de aislación a la clave de las tablas.
 * PVC → 'PVC'; EPR 90 °C, XLPE y HEPR comparten tabla (90 °C) → 'XLPE_HEPR'.
 */
function claveAislacion(aislamiento) {
    const a = String(aislamiento || '').toUpperCase();
    if (a === 'PVC') return 'PVC';
    if (['EPR', 'EPR_90', 'XLPE', 'HEPR', 'EPR_XLPE', 'XLPE_HEPR'].includes(a)) return 'XLPE_HEPR';
    throw new Error(`Aislación ${aislamiento} no soportada (use PVC, EPR/XLPE o HEPR)`);
}

/**
 * Ampacidad base (A) de un conductor de COBRE según INPACO.
 * conductoresCargados: 2 o 3; con 4 (neutro con armónicos) se aplica 0,86
 * sobre la columna de 3 conductores (INPACO 3.4, nota c).
 */
function obtenerAmpacidadBase(aislamiento, metodo, seccion, conductoresCargados = 3) {
    const tabla = tabelasNBR.ampacidades[claveAislacion(aislamiento)];
    if (!tabla[metodo]) {
        throw new Error(`Método de instalación ${metodo} no disponible`);
    }
    const nc = parseInt(conductoresCargados, 10);
    const columna = nc <= 2 ? tabla[metodo][2] : tabla[metodo][3];
    const ampacidad = columna[seccion];
    if (ampacidad === undefined) {
        throw new Error(`Sección ${seccion} mm² no disponible para ${aislamiento} método ${metodo}`);
    }
    return nc >= 4 ? Math.round(ampacidad * 0.86 * 10) / 10 : ampacidad;
}

/**
 * Factor de corrección por temperatura ambiente (aire) o del suelo (método D).
 * Interpola linealmente entre los valores de INPACO Tabla 6.
 * Debajo de 10 °C usa el factor de 10 °C (conservador).
 * Lanza error si la temperatura supera el máximo admitido por la aislación.
 */
function obtenerFactorTemperatura(aislamiento, temperatura, metodo, esEnterrado) {
    const clave = claveAislacion(aislamiento) === 'PVC' ? 'PVC_INPACO' : 'XLPE_INPACO';
    if (esEnterrado === undefined) {
        esEnterrado = !!(metodosInstalacion[metodo] && metodosInstalacion[metodo].enterrado);
    }
    const tipo = esEnterrado ? 'suelo' : 'ambiente';
    const tabla = tabelasNBR.fatoresTemperatura[clave][tipo];
    const t = parseFloat(temperatura);
    if (isNaN(t)) throw new Error('Temperatura inválida');

    const temps = Object.keys(tabla).map(Number).filter(x => tabla[x] > 0).sort((a, b) => a - b);
    const tMin = temps[0];
    const tMax = temps[temps.length - 1];
    if (t > tMax) {
        throw new Error(`Temperatura ${tipo === 'suelo' ? 'del suelo' : 'ambiente'} de ${t} °C excede el máximo admitido para ${aislamiento} (${tMax} °C)`);
    }
    if (t <= tMin) return tabla[tMin];

    for (let i = 0; i < temps.length - 1; i++) {
        const t1 = temps[i], t2 = temps[i + 1];
        if (t >= t1 && t <= t2) {
            const f = tabla[t1] + (tabla[t2] - tabla[t1]) * (t - t1) / (t2 - t1);
            return Math.round(f * 1000) / 1000;
        }
    }
    return tabla[tMax];
}

/**
 * Factor de agrupamiento según método y número de circuitos (INPACO Tablas 7, 9 y 10).
 * tipoEnterrado ('ducto' | 'directo') solo se usa en el método D.
 */
function obtenerFactorAgrupamento(metodo, numeroCircuitos, tipoEnterrado = 'ducto') {
    const fa = tabelasNBR.fatoresAgrupamento;
    const n = Math.max(1, Math.floor(parseFloat(numeroCircuitos) || 1));
    let tabla;

    if (['A1', 'A2', 'B1', 'B2', 'C'].includes(metodo)) {
        tabla = fa.haz;
    } else if (['E', 'F', 'G'].includes(metodo)) {
        tabla = fa.bandeja_perforada;
    } else if (metodo === 'D') {
        tabla = tipoEnterrado === 'directo' ? fa.enterrado_directo : fa.enterrado_ducto;
    } else {
        throw new Error(`Método ${metodo} no reconocido para factor de agrupamiento`);
    }

    const nMax = Math.max(...Object.keys(tabla).map(Number));
    if (n <= nMax) return tabla[n];

    // Fuera de tabla:
    // - haz: ≥ 20 circuitos usa el valor de 20
    // - bandeja (camada única): sin reducción adicional por encima de 9 (nota IEC 60364-5-52 B.52.17)
    // - enterrados: la tabla llega a 6 circuitos; se toma el menor entre ese valor y el de haz (conservador)
    if (tabla === fa.haz || tabla === fa.bandeja_perforada) return tabla[nMax];
    return Math.min(tabla[nMax], fa.haz[Math.min(n, 20)]);
}

/**
 * Factor por resistividad térmica del suelo (INPACO Tabla 11, referencia 1,0 K·m/W).
 * Interpola entre valores tabulados; por debajo de 0,5 K·m/W usa el valor de 0,5.
 */
function obtenerFactorResistividadSuelo(resistividad, tipoEnterrado = 'ducto') {
    const tabla = tabelasNBR.fatoresResistividadSuelo;
    const r = parseFloat(resistividad);
    if (isNaN(r) || r <= 0) throw new Error('Resistividad térmica del suelo inválida');
    const col = tipoEnterrado === 'directo' ? 'directo' : 'ducto';
    const claves = Object.keys(tabla).map(Number).sort((a, b) => a - b);
    if (r > claves[claves.length - 1]) {
        throw new Error(`Resistividad térmica ${r} K·m/W fuera de tabla (máx. ${claves[claves.length - 1]} K·m/W)`);
    }
    if (r <= claves[0]) return tabla[claves[0]][col];
    for (let i = 0; i < claves.length - 1; i++) {
        const r1 = claves[i], r2 = claves[i + 1];
        if (r >= r1 && r <= r2) {
            const f1 = tabla[r1][col], f2 = tabla[r2][col];
            return Math.round((f1 + (f2 - f1) * (r - r1) / (r2 - r1)) * 1000) / 1000;
        }
    }
    return 1.0;
}

/**
 * Relación de ampacidad aluminio/cobre para la misma sección e igual
 * disipación térmica: I_Al / I_Cu = √(R_Cu / R_Al).
 * INPACO no publica tablas de aluminio; este factor (~0,775) queda del lado
 * seguro frente a las tablas de NBR 5410 (~0,78).
 */
function obtenerFactorAluminio(seccion) {
    const rCu = tabelasNBR.resistencias.cobre[seccion];
    const rAl = tabelasNBR.resistencias.aluminio[seccion];
    if (rCu === undefined || rAl === undefined) {
        throw new Error(`Sección ${seccion} mm² no disponible en aluminio`);
    }
    return Math.sqrt(rCu / rAl);
}

/**
 * Resistencia en corriente continua a 20 °C (Ω/km) por sección y material.
 */
function obtenerResistencia(material, seccion) {
    const materialKey = material.toLowerCase() === 'aluminio' ? 'aluminio' : 'cobre';
    const resistencia = tabelasNBR.resistencias[materialKey][seccion];

    if (resistencia === undefined) {
        throw new Error(`Resistencia no disponible para ${materialKey} sección ${seccion} mm²`);
    }

    return resistencia;
}

// ===================================================================
// EXPORTAR VARIABLES GLOBALES
// ===================================================================

window.tabelasNBR = tabelasNBR;
window.metodosInstalacion = metodosInstalacion;
window.claveAislacion = claveAislacion;
window.obtenerAmpacidadBase = obtenerAmpacidadBase;
window.obtenerFactorTemperatura = obtenerFactorTemperatura;
window.obtenerFactorAgrupamento = obtenerFactorAgrupamento;
window.obtenerFactorResistividadSuelo = obtenerFactorResistividadSuelo;
window.obtenerFactorAluminio = obtenerFactorAluminio;
window.obtenerResistencia = obtenerResistencia;


// ===================================================================
// FACTORES ESPECIALES - RESISTIVIDAD TÉRMICA Y PROFUNDIDAD
// ===================================================================

const fatoresEspeciais = {
    // Resistividad térmica del suelo según INPACO
    resistividade_termica_INPACO: {
        'suelo_seco': 2.5,      // K·m/W
        'suelo_humedo': 1.5,    // K·m/W
        'suelo_muy_humedo': 1.0, // K·m/W
        'arena_seca': 3.0,      // K·m/W
        'arena_humeda': 1.8,    // K·m/W
        'arcilla_seca': 2.0,    // K·m/W
        'arcilla_humeda': 1.2,  // K·m/W
        'concreto': 1.0,        // K·m/W
        'relleno_termico': 0.7  // K·m/W
    },
    
    // Resistividad térmica del suelo según NBR 5410
    resistividade_termica_NBR: {
        'normal': 2.5,          // K·m/W - Condición estándar
        'seco': 3.0,            // K·m/W - Suelo seco
        'humedo': 1.5,          // K·m/W - Suelo húmedo
        'muy_humedo': 1.0,      // K·m/W - Suelo muy húmedo
        'saturado': 0.8         // K·m/W - Suelo saturado
    },
    
    // Profundidad de instalación según INPACO
    profundidade_INPACO: {
        'baja_tension': {
            'minima': 0.6,      // metros
            'recomendada': 0.8, // metros
            'maxima': 1.2       // metros
        },
        'media_tension': {
            'minima': 1.0,      // metros
            'recomendada': 1.2, // metros
            'maxima': 1.5       // metros
        },
        'alta_tension': {
            'minima': 1.5,      // metros
            'recomendada': 2.0, // metros
            'maxima': 2.5       // metros
        }
    },
    
    // Profundidad de instalación según NBR 5410
    profundidade_NBR: {
        'residencial': {
            'minima': 0.6,      // metros
            'recomendada': 0.7  // metros
        },
        'comercial': {
            'minima': 0.7,      // metros
            'recomendada': 0.8  // metros
        },
        'industrial': {
            'minima': 0.8,      // metros
            'recomendada': 1.0  // metros
        },
        'via_publica': {
            'minima': 1.0,      // metros
            'recomendada': 1.2  // metros
        }
    }
};

// Exportar fatoresEspeciais
window.fatoresEspeciais = fatoresEspeciais;


// ===================================================================
// DATOS TÉCNICOS PARA SISTEMAS DC
// ===================================================================

const tabelasDC = {
    // Resistencias DC a 20°C (Ω/km) - Fuente: Catálogos técnicos INPACO/Prysmian
    resistenciasDC: {
        cobre: {
            1.5: 13.3,   2.5: 7.98,   4: 4.95,    6: 3.30,    10: 1.91,
            16: 1.21,    25: 0.780,   35: 0.554,  50: 0.386,  70: 0.272,
            95: 0.206,   120: 0.161,  150: 0.129, 185: 0.106, 240: 0.0801,
            300: 0.0641, 400: 0.0505, 500: 0.0406, 630: 0.0324, 800: 0.0253
        },
        aluminio: {
            16: 1.91,    25: 1.20,    35: 0.868,  50: 0.641,  70: 0.443,
            95: 0.320,   120: 0.253,  150: 0.206, 185: 0.164, 240: 0.125,
            300: 0.100,  400: 0.0778, 500: 0.0618, 630: 0.0490, 800: 0.0386
        }
    },
    
    // Parámetros técnicos de baterías
    parametrosBaterias: {
        plomo_acido: {
            tensionElemento: 2.0,                    // V por elemento
            resistenciaInternaPredeterminada: 1.0,   // mΩ por elemento
            factorDescarga: 1.0,                     // Factor de descarga típico
            descripcion: "Plomo Ácido (VRLA/Gel)"
        },
        litio: {
            tensionElemento: 3.2,                    // V por elemento (LiFePO4)
            resistenciaInternaPredeterminada: 0.5,   // mΩ por elemento
            factorDescarga: 0.95,                    // Factor de descarga típico
            descripcion: "Litio (LiFePO4)"
        },
        niquel_cadmio: {
            tensionElemento: 1.2,                    // V por elemento
            resistenciaInternaPredeterminada: 0.8,   // mΩ por elemento
            factorDescarga: 0.9,                     // Factor de descarga típico
            descripcion: "Níquel Cadmio (NiCd)"
        }
    },
    
    // Tensiones nominales DC estándar
    tensionesNominalesDC: [12, 24, 48, 110, 125, 220, 250, 380, 500],
    
    // Límites normativos para caída de tensión DC según aplicación
    limitesNormativosDC: {
        servicios_auxiliares: 2.0,      // % - Servicios auxiliares de subestaciones
        alimentacion_critica: 1.0,      // % - Alimentación crítica (UPS, emergencia)
        circuitos_control: 3.0,         // % - Circuitos de control y protección
        iluminacion_emergencia: 5.0,    // % - Iluminación de emergencia
        telecomunicaciones: 1.5,        // % - Equipos de telecomunicaciones
        sistemas_fotovoltaicos: 3.0     // % - Sistemas fotovoltaicos
    },
    
    // Constantes K para verificación térmica de cortocircuito DC
    constantesK_DC: {
        cobre: {
            PVC: 115,      // A·s^(1/2)/mm² - Cobre con aislamiento PVC
            EPR: 143,      // A·s^(1/2)/mm² - Cobre con aislamiento EPR/XLPE
            XLPE: 143      // A·s^(1/2)/mm² - Cobre con aislamiento XLPE
        },
        aluminio: {
            PVC: 76,       // A·s^(1/2)/mm² - Aluminio con aislamiento PVC (NBR 5410 Tabla 30)
            EPR: 94,       // A·s^(1/2)/mm² - Aluminio con aislamiento EPR/XLPE
            XLPE: 94       // A·s^(1/2)/mm² - Aluminio con aislamiento XLPE
        }
    },
    
    // Los factores de temperatura DC usan INPACO Tabla 6 (ver obtenerFactorTemperatura),
    // igual que las ampacidades DC, que usan las tablas INPACO de 2 conductores cargados.

    // Secciones nominales disponibles para DC (mm²)
    seccionesNominalesDC: [
        1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800
    ],
    
    // Tipos de aplicación DC con sus características
    aplicacionesDC: {
        ups_datacenter: {
            descripcion: "UPS y Data Centers",
            caidaMaxima: 1.0,
            factorSeguridad: 1.25,
            tiempoDespeje: 0.1
        },
        servicios_auxiliares: {
            descripcion: "Servicios Auxiliares de Subestación",
            caidaMaxima: 2.0,
            factorSeguridad: 1.20,
            tiempoDespeje: 0.2
        },
        fotovoltaico: {
            descripcion: "Sistemas Fotovoltaicos",
            caidaMaxima: 3.0,
            factorSeguridad: 1.25,
            tiempoDespeje: 0.5
        },
        telecomunicaciones: {
            descripcion: "Telecomunicaciones",
            caidaMaxima: 1.5,
            factorSeguridad: 1.30,
            tiempoDespeje: 0.1
        }
    }
};

// ===================================================================
// RESISTENCIA INTERNA DE BATERÍAS POR ELEMENTO (mΩ·Ah)
// Estimación: R_elemento (mΩ) = constante / capacidad (Ah).
// Valores coherentes con parametrosBaterias.resistenciaInternaPredeterminada
// (mΩ por elemento de 100 Ah). La resistencia del banco es N_serie × R_elemento.
// Son valores orientativos: usar siempre el dato del fabricante si está disponible.
// ===================================================================
const resistenciasInternasBateria = {
    // Plomo-ácido (elemento 2 V): ~1 mΩ a 100 Ah
    'plomo-acido': 100,
    // Litio LiFePO4 (elemento 3,2 V): ~0,5 mΩ a 100 Ah
    'litio': 50,
    // Níquel-cadmio (elemento 1,2 V): ~0,8 mΩ a 100 Ah
    'niquel-cadmio': 80
};

// Exponer constantes en objeto global para que app.js pueda acceder. Esto se
// ejecuta solo en contexto de navegador (window definido).
if (typeof window !== 'undefined') {
    window.resistenciasInternasBateria = resistenciasInternasBateria;
}

// Exportar tablas DC
window.tabelasDC = tabelasDC;


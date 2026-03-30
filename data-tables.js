/**
 * DATA-TABLES.JS - TABLAS TÉCNICAS COMPLETAS
 * ==========================================
 * 
 * Tablas completas según:
 * - Catálogo INPACO 2021
 * - NBR 5410
 * - Mamede Filho
 * 
 * Incluye TODOS los métodos A1 hasta I
 * Soporta PVC, EPR 90°, EPR 105° y HEPR
 */

// ===================================================================
// MÉTODOS DE INSTALACIÓN COMPLETOS (INCLUYE H e I)
// ===================================================================

const metodosInstalacion = {
    // MÉTODOS INPACO (Temperatura referencia 40°C aire, 25°C suelo)
    A1: {
        descripcion: "Conductores aislados o cables unipolares en electroducto embutido en pared aislante",
        temperatura_referencia: 40, 
        temperatura_suelo: 25, 
        tipo: "embutido_aislante", 
        fuente: "INPACO"
    },
    A2: {
        descripcion: "Cable multipolar en electroducto embutido en pared aislante", 
        temperatura_referencia: 40, 
        temperatura_suelo: 25, 
        tipo: "embutido_aislante", 
        fuente: "INPACO"
    },
    B1: {
        descripcion: "Conductores aislados o cables unipolares en electroducto adosado",
        temperatura_referencia: 40, 
        temperatura_suelo: 25, 
        tipo: "electroducto_adosado", 
        fuente: "INPACO"
    },
    B2: {
        descripcion: "Cable multipolar en electroducto adosado",
        temperatura_referencia: 40, 
        temperatura_suelo: 25, 
        tipo: "electroducto_adosado", 
        fuente: "INPACO"
    },
    C: {
        descripcion: "Cables fijados directamente sobre pared o techo",
        temperatura_referencia: 40, 
        temperatura_suelo: 25, 
        tipo: "directo_pared", 
        fuente: "INPACO"
    },
    D: {
        descripcion: "Cables enterrados directamente en el suelo",
        temperatura_referencia: 40, 
        temperatura_suelo: 25, 
        tipo: "enterrado_directo", 
        fuente: "INPACO"
    },
    E: {
        descripcion: "Cables al aire libre",
        temperatura_referencia: 40, 
        temperatura_suelo: 25, 
        tipo: "aire_libre", 
        fuente: "INPACO"
    },
    F: {
        descripcion: "Cables en electroductos enterrados",
        temperatura_referencia: 40, 
        temperatura_suelo: 25, 
        tipo: "enterrado_electroducto", 
        fuente: "INPACO"
    },
    G: {
        descripcion: "Conductores desnudos o aislados sobre aisladores",
        temperatura_referencia: 40, 
        temperatura_suelo: 25, 
        tipo: "sobre_aisladores", 
        fuente: "INPACO"
    },
    
    // MÉTODOS NBR ADICIONALES (Temperatura referencia 30°C aire, 20°C suelo)
    H: {
        descripcion: "Cable instalado directamente en el suelo con resistividad 2.5 K⋅m/W",
        temperatura_referencia: 30, 
        temperatura_suelo: 20, 
        tipo: "enterrado_directo_nbr", 
        fuente: "NBR/Mamede"
    },
    I: {
        descripcion: "Cable enterrado con espaciamiento mínimo igual al diámetro externo",
        temperatura_referencia: 30, 
        temperatura_suelo: 20, 
        tipo: "enterrado_espaciado_nbr", 
        fuente: "NBR/Mamede"
    }
};

// ===================================================================
// TABLAS TÉCNICAS COMPLETAS - TODAS LAS FUENTES
// ===================================================================

const tabelasNBR = {
    // Resistencias eléctricas por sección (Ω/km a 20°C)
    resistencias: {
        cobre: {
            0.5: 36.0, 0.75: 24.5, 1: 18.1, 1.5: 12.1, 2.5: 7.41, 4: 4.61, 6: 3.08, 
            10: 1.83, 16: 1.15, 25: 0.727, 35: 0.524, 50: 0.387, 70: 0.268, 95: 0.193,
            120: 0.153, 150: 0.124, 185: 0.0991, 240: 0.0754, 300: 0.0601,
            400: 0.0486, 500: 0.0384, 630: 0.0308, 800: 0.0245, 1000: 0.0193
        },
        aluminio: {
            16: 1.91, 25: 1.20, 35: 0.868, 50: 0.641, 70: 0.443,
            95: 0.320, 120: 0.253, 150: 0.206, 185: 0.164, 240: 0.125, 
            300: 0.100, 400: 0.0778, 500: 0.0618, 630: 0.0495, 800: 0.0386, 1000: 0.0308
        }
    },

    // AMPACIDADES COMPLETAS - TODAS LAS FUENTES
    ampacidades: {
        PVC: {
            // TABLAS INPACO (40°C ambiente, 25°C suelo)
            A1: {
                0.5: 6.5, 0.75: 8, 1: 9.5, 1.5: 12.5, 2: 15, 2.5: 17, 4: 23, 6: 29, 
                10: 40, 16: 53, 25: 70, 35: 86, 50: 103, 70: 131, 95: 158, 120: 182, 
                150: 209, 185: 238, 240: 279, 300: 319, 400: 365, 500: 415, 630: 475, 800: 545, 1000: 615
            },
            A2: {
                0.5: 6, 0.75: 7.5, 1: 9, 1.5: 11.5, 2: 14, 2.5: 16, 4: 21, 6: 27, 
                10: 36, 16: 48, 25: 63, 35: 78, 50: 94, 70: 118, 95: 142, 120: 164, 
                150: 188, 185: 213, 240: 249, 300: 285, 400: 325, 500: 370, 630: 425, 800: 485, 1000: 545
            },
            B1: {
                0.5: 7.5, 0.75: 10, 1: 11.5, 1.5: 15, 2: 18, 2.5: 21, 4: 28, 6: 36, 
                10: 50, 16: 66, 25: 88, 35: 108, 50: 131, 70: 167, 95: 202, 120: 234, 
                150: 269, 185: 307, 240: 361, 300: 415, 400: 475, 500: 540, 630: 620, 800: 710, 1000: 800
            },
            B2: {
                0.5: 6.5, 0.75: 8.5, 1: 10.5, 1.5: 13.5, 2: 16, 2.5: 18, 4: 25, 6: 32, 
                10: 44, 16: 59, 25: 78, 35: 96, 50: 116, 70: 148, 95: 180, 120: 208, 
                150: 240, 185: 273, 240: 322, 300: 370, 400: 425, 500: 485, 630: 555, 800: 635, 1000: 715
            },
            C: {
                0.5: 8.5, 0.75: 11, 1: 13, 1.5: 17, 2: 20, 2.5: 23, 4: 31, 6: 40, 
                10: 55, 16: 74, 25: 98, 35: 120, 50: 146, 70: 186, 95: 225, 120: 260, 
                150: 299, 185: 341, 240: 401, 300: 461, 400: 530, 500: 605, 630: 695, 800: 795, 1000: 895
            },
            D: {
                0.5: 13.5, 0.75: 17, 1: 19.5, 1.5: 25, 2: 29, 2.5: 33, 4: 42, 6: 53, 
                10: 70, 16: 91, 25: 116, 35: 140, 50: 166, 70: 205, 95: 243, 120: 276, 
                150: 312, 185: 350, 240: 404, 300: 457
            },
            E: {
                0.5: 9.5, 0.75: 12, 1: 14.5, 1.5: 19, 2: 22, 2.5: 26, 4: 35, 6: 44, 
                10: 61, 16: 82, 25: 104, 35: 129, 50: 157, 70: 202, 95: 246, 120: 286, 
                150: 330, 185: 378, 240: 447, 300: 516
            },
            F: {
                0.5: 9.5, 0.75: 12.5, 1: 15, 1.5: 19, 2: 23, 2.5: 27, 4: 36, 6: 46, 
                10: 64, 16: 86, 25: 114, 35: 141, 50: 171, 70: 218, 95: 265, 120: 307, 
                150: 353, 185: 403, 240: 475, 300: 547
            },
            G: {
                0.5: 10.5, 0.75: 13.5, 1: 16.5, 1.5: 21, 2: 25, 2.5: 29, 4: 39, 6: 51, 
                10: 71, 16: 95, 25: 127, 35: 157, 50: 191, 70: 244, 95: 297, 120: 344, 
                150: 397, 185: 454, 240: 535, 300: 617
            },
            
            // TABLAS NBR/MAMEDE FILHO (30°C ambiente, 20°C suelo) - MÉTODOS H e I
            H: {
                10: 87, 16: 114, 25: 150, 35: 183, 50: 221, 70: 275, 95: 337, 120: 390, 
                150: 450, 185: 510, 240: 602, 300: 687, 400: 796, 500: 907, 630: 1027, 
                800: 1148, 1000: 1265
            },
            I: {
                10: 105, 16: 137, 25: 181, 35: 221, 50: 267, 70: 333, 95: 407, 120: 470, 
                150: 536, 185: 613, 240: 721, 300: 824, 400: 959, 500: 1100, 630: 1258, 
                800: 1411, 1000: 1571
            }
        },
        
        EPR_90: {
            // EPR/XLPE 90°C - TABLAS INPACO (40°C ambiente, 25°C suelo)
            A1: {
                0.5: 9, 0.75: 11.5, 1: 13.5, 1.5: 17.5, 2: 21, 2.5: 24, 4: 32, 6: 41, 
                10: 55, 16: 74, 25: 97, 35: 119, 50: 143, 70: 182, 95: 219, 120: 253, 
                150: 290, 185: 329, 240: 386, 300: 442
            },
            A2: {
                0.5: 8.5, 0.75: 10.5, 1: 12.5, 1.5: 16, 2: 19.5, 2.5: 22, 4: 29, 6: 37, 
                10: 50, 16: 67, 25: 87, 35: 107, 50: 128, 70: 164, 95: 197, 120: 228, 
                150: 261, 185: 296, 240: 347, 300: 397
            },
            B1: {
                0.5: 10.5, 0.75: 13.5, 1: 16, 1.5: 20.5, 2: 25, 2.5: 29, 4: 38, 6: 49, 
                10: 68, 16: 91, 25: 119, 35: 147, 50: 179, 70: 229, 95: 278, 120: 322, 
                150: 371, 185: 423, 240: 497, 300: 571
            },
            B2: {
                0.5: 9, 0.75: 11.5, 1: 14, 1.5: 18, 2: 22, 2.5: 25, 4: 33, 6: 42, 
                10: 58, 16: 78, 25: 101, 35: 125, 50: 152, 70: 194, 95: 235, 120: 272, 
                150: 313, 185: 356, 240: 419, 300: 481
            },
            C: {
                0.5: 11.5, 0.75: 15, 1: 18, 1.5: 23, 2: 28, 2.5: 32, 4: 42, 6: 54, 
                10: 75, 16: 101, 25: 133, 35: 164, 50: 200, 70: 255, 95: 309, 120: 358, 
                150: 412, 185: 470, 240: 553, 300: 635
            },
            D: {
                0.5: 18.5, 0.75: 23.5, 1: 27, 1.5: 34, 2: 40, 2.5: 45, 4: 58, 6: 73, 
                10: 96, 16: 125, 25: 159, 35: 192, 50: 228, 70: 282, 95: 334, 120: 380, 
                150: 430, 185: 483, 240: 557, 300: 630
            },
            E: {
                0.5: 13, 0.75: 16.5, 1: 20, 1.5: 26, 2: 31, 2.5: 36, 4: 48, 6: 61, 
                10: 84, 16: 113, 25: 143, 35: 177, 50: 216, 70: 278, 95: 338, 120: 393, 
                150: 454, 185: 519, 240: 614, 300: 708
            },
            F: {
                0.5: 13, 0.75: 17, 1: 20.5, 1.5: 26, 2: 32, 2.5: 37, 4: 49, 6: 63, 
                10: 88, 16: 118, 25: 156, 35: 193, 50: 234, 70: 299, 95: 364, 120: 422, 
                150: 486, 185: 554, 240: 654, 300: 753
            },
            G: {
                0.5: 14.5, 0.75: 18.5, 1: 22.5, 1.5: 29, 2: 35, 2.5: 40, 4: 53, 6: 70, 
                10: 97, 16: 131, 25: 174, 35: 215, 50: 262, 70: 335, 95: 408, 120: 473, 
                150: 546, 185: 624, 240: 736, 300: 848
            },
            
            // EPR 90°C - TABLAS NBR/MAMEDE FILHO (30°C ambiente, 20°C suelo)
            H: {
                10: 92, 16: 120, 25: 156, 35: 189, 50: 226, 70: 279, 95: 336, 120: 384, 
                150: 434, 185: 491, 240: 569, 300: 643, 400: 734, 500: 829, 630: 932, 
                800: 1031, 1000: 1126
            },
            I: {
                10: 67, 16: 87, 25: 112, 35: 136, 50: 162, 70: 200, 95: 243, 120: 278, 
                150: 315, 185: 357, 240: 419, 300: 474, 400: 543, 500: 613, 630: 686, 
                800: 761, 1000: 828
            }
        },
        
        EPR_105: {
            // EPR 105°C - Tabela 3.29 Mamede Filho / NBR 14039 (30°C ambiente, 20°C suelo)
            // Cabos unipolares e multipolares, condutor cobre, 3 conductores cargados
            A: {
                10: 97, 16: 127, 25: 167, 35: 204, 50: 246, 70: 307, 95: 376, 120: 435,
                150: 496, 185: 568, 240: 672, 300: 767, 400: 890, 500: 1015, 630: 1151,
                800: 1289, 1000: 1421
            },
            B: {
                10: 116, 16: 152, 25: 201, 35: 245, 50: 297, 70: 370, 95: 453, 120: 523,
                150: 596, 185: 683, 240: 802, 300: 918, 400: 1070, 500: 1229, 630: 1408,
                800: 1580, 1000: 1762
            },
            C: {
                10: 88, 16: 115, 25: 150, 35: 182, 50: 218, 70: 269, 95: 327, 120: 375,
                150: 424, 185: 482, 240: 564, 300: 639, 400: 731, 500: 825, 630: 924,
                800: 1022, 1000: 1112
            },
            D: {
                10: 102, 16: 133, 25: 173, 35: 209, 50: 250, 70: 308, 95: 372, 120: 425,
                150: 479, 185: 543, 240: 630, 300: 712, 400: 814, 500: 920, 630: 1035,
                800: 1146, 1000: 1253
            },
            E: {
                10: 75, 16: 97, 25: 126, 35: 153, 50: 183, 70: 225, 95: 273, 120: 313,
                150: 354, 185: 403, 240: 472, 300: 535, 400: 613, 500: 693, 630: 777,
                800: 863, 1000: 940
            },
            F: {
                10: 60, 16: 76, 25: 98, 35: 117, 50: 138, 70: 168, 95: 200, 120: 227,
                150: 254, 185: 286, 240: 330, 300: 369, 400: 416, 500: 465, 630: 515,
                800: 565, 1000: 608
            },
            G: {
                10: 68, 16: 88, 25: 112, 35: 134, 50: 158, 70: 192, 95: 229, 120: 260,
                150: 291, 185: 328, 240: 379, 300: 426, 400: 483, 500: 543, 630: 609,
                800: 676, 1000: 738
            },
            H: {
                10: 70, 16: 90, 25: 115, 35: 137, 50: 162, 70: 197, 95: 235, 120: 266,
                150: 298, 185: 335, 240: 387, 300: 434, 400: 490, 500: 548, 630: 609,
                800: 671, 1000: 725
            },
            I: {
                10: 84, 16: 107, 25: 136, 35: 162, 50: 190, 70: 229, 95: 270, 120: 303,
                150: 336, 185: 375, 240: 427, 300: 473, 400: 529, 500: 588, 630: 650,
                800: 712, 1000: 769
            }
        },
        
        HEPR: {
            // HEPR - Basado en EPR_90 con designación específica INPACO
            A1: {
                0.5: 12, 0.75: 15.5, 1: 18, 1.5: 24, 2: 29, 2.5: 33, 4: 44, 6: 57, 
                10: 78, 16: 105, 25: 135, 35: 168, 50: 205, 70: 263, 95: 321, 120: 373, 
                150: 431, 185: 493, 240: 584, 300: 674
            },
            A2: {
                0.5: 11.5, 0.75: 14.5, 1: 17, 1.5: 22, 2: 27, 2.5: 30, 4: 40, 6: 51, 
                10: 69, 16: 93, 25: 120, 35: 148, 50: 177, 70: 227, 95: 273, 120: 316, 
                150: 362, 185: 410, 240: 481, 300: 551
            },
            B1: {
                0.5: 14, 0.75: 18.5, 1: 22, 1.5: 28, 2: 34, 2.5: 39, 4: 52, 6: 67, 
                10: 93, 16: 125, 25: 164, 35: 202, 50: 246, 70: 315, 95: 383, 120: 444, 
                150: 511, 185: 583, 240: 686, 300: 788
            },
            B2: {
                0.5: 12, 0.75: 15.5, 1: 19, 1.5: 24.5, 2: 30, 2.5: 34, 4: 45, 6: 58, 
                10: 80, 16: 107, 25: 139, 35: 172, 50: 209, 70: 267, 95: 324, 120: 375, 
                150: 432, 185: 491, 240: 578, 300: 664
            },
            C: {
                0.5: 15.5, 0.75: 20.5, 1: 24.5, 1.5: 31.5, 2: 38, 2.5: 43, 4: 57, 6: 74, 
                10: 103, 16: 139, 25: 183, 35: 226, 50: 275, 70: 351, 95: 426, 120: 494, 
                150: 569, 185: 649, 240: 764, 300: 878
            },
            // Métodos D-I similares con incrementos proporcionales
            D: {
                0.5: 25, 0.75: 32, 1: 37, 1.5: 47, 2: 55, 2.5: 62, 4: 80, 6: 100, 
                10: 132, 16: 172, 25: 219, 35: 265, 50: 314, 70: 389, 95: 461, 120: 524, 
                150: 593, 185: 666, 240: 768, 300: 869
            },
            E: {
                0.5: 17.5, 0.75: 22.5, 1: 27, 1.5: 35, 2: 42, 2.5: 48, 4: 65, 6: 84, 
                10: 116, 16: 156, 25: 197, 35: 244, 50: 298, 70: 383, 95: 466, 120: 542, 
                150: 626, 185: 716, 240: 847, 300: 977
            },
            F: {
                0.5: 17.5, 0.75: 23, 1: 28, 1.5: 35.5, 2: 44, 2.5: 51, 4: 68, 6: 87, 
                10: 121, 16: 163, 25: 215, 35: 266, 50: 323, 70: 412, 95: 502, 120: 582, 
                150: 671, 185: 765, 240: 903, 300: 1040
            },
            G: {
                0.5: 19.5, 0.75: 25, 1: 31, 1.5: 40, 2: 48, 2.5: 55, 4: 73, 6: 96, 
                10: 134, 16: 181, 25: 240, 35: 297, 50: 361, 70: 462, 95: 563, 120: 653, 
                150: 753, 185: 861, 240: 1016, 300: 1171
            }
        }
    },

    // FACTORES DE TEMPERATURA COMPLETOS - TODAS LAS FUENTES
    fatoresTemperatura: {
        // FACTORES INPACO (Referencia 40°C aire, 25°C suelo)
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
        EPR_INPACO: {
            ambiente: {
                10: 1.26, 15: 1.23, 20: 1.19, 25: 1.14, 30: 1.10, 35: 1.05, 40: 1.00, 
                45: 0.96, 50: 0.90, 55: 0.84, 60: 0.78, 65: 0.71, 70: 0.64, 75: 0.55, 80: 0.45
            },
            suelo: {
                10: 1.11, 15: 1.08, 20: 1.04, 25: 1.00, 30: 0.97, 35: 0.93, 40: 0.89, 
                45: 0.83, 50: 0.79, 55: 0.74, 60: 0.68, 65: 0.63, 70: 0.55, 75: 0.48, 80: 0.40
            }
        },
        
        // FACTORES NBR (Referencia 30°C aire, 20°C suelo)
        PVC_NBR: {
            ambiente: {
                10: 1.07, 15: 1.04, 20: 1.03, 25: 1.01, 30: 1.00, 35: 0.97, 40: 0.94, 
                45: 0.91, 50: 0.87, 55: 0.84, 60: 0.80, 65: 0.76, 70: 0.72, 75: 0.68, 80: 0.63
            },
            suelo: {
                10: 1.07, 15: 1.04, 20: 1.03, 25: 0.96, 30: 0.93, 35: 0.89, 40: 0.85, 
                45: 0.80, 50: 0.76, 55: 0.71, 60: 0.65, 65: 0.60, 70: 0.53, 75: 0.46, 80: 0.38
            }
        },
        EPR_90_NBR: {
            ambiente: {
                10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.96, 
                45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71, 65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41
            },
            suelo: {
                10: 1.06, 15: 1.03, 20: 1.00, 25: 0.97, 30: 0.94, 35: 0.91, 40: 0.87, 
                45: 0.84, 50: 0.80, 55: 0.76, 60: 0.72, 65: 0.68, 70: 0.64, 75: 0.59, 80: 0.54
            }
        },
        EPR_105_NBR: {
            ambiente: {
                10: 1.13, 15: 1.10, 20: 1.06, 25: 1.03, 30: 1.00, 35: 0.97, 40: 0.93, 
                45: 0.89, 50: 0.86, 55: 0.82, 60: 0.77, 65: 0.73, 70: 0.68, 75: 0.63, 80: 0.58
            },
            suelo: {
                10: 1.08, 15: 1.05, 20: 1.02, 25: 0.99, 30: 0.96, 35: 0.93, 40: 0.90, 
                45: 0.87, 50: 0.84, 55: 0.81, 60: 0.77, 65: 0.74, 70: 0.70, 75: 0.66, 80: 0.62
            }
        },
        HEPR_INPACO: {
            // HEPR usa los mismos factores que EPR_INPACO
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

    // FACTORES DE AGRUPAMIENTO COMPLETOS
    fatoresAgrupamento: {
        // Factores para métodos A1, A2, B1, B2, C
        metodos_ABCD: {
            1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57, 7: 0.54, 8: 0.52, 
            9: 0.50, 10: 0.48, 11: 0.46, 12: 0.45, 13: 0.44, 14: 0.43, 15: 0.42, 
            16: 0.41, 17: 0.40, 18: 0.40, 19: 0.39, 20: 0.39
        },
        // Factores para métodos enterrados D, F, G, H, I
        metodos_enterrados: {
            1: 1.00, 2: 0.85, 3: 0.75, 4: 0.70, 5: 0.65, 6: 0.62, 7: 0.60, 8: 0.58, 
            9: 0.56, 10: 0.54, 11: 0.53, 12: 0.52, 13: 0.51, 14: 0.50, 15: 0.49, 
            16: 0.48, 17: 0.48, 18: 0.47, 19: 0.47, 20: 0.46
        },
        // Factor especial para método E (aire libre)
        metodo_E: {
            1: 1.00, 2: 0.90, 3: 0.85, 4: 0.82, 5: 0.80, 6: 0.78, 7: 0.76, 8: 0.75, 
            9: 0.74, 10: 0.73, 11: 0.72, 12: 0.71, 13: 0.70, 14: 0.70, 15: 0.69, 
            16: 0.69, 17: 0.68, 18: 0.68, 19: 0.67, 20: 0.67
        }
    },

    // SECCIONES NOMINALES DISPONIBLES
    seccionesNominales: [
        0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 
        400, 500, 630, 800, 1000
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
        EPR_105: {
            nombre: "EPR 105°C - Etileno Propileno Alta Temperatura",
            temperatura_maxima: 105,
            aplicacion: "Instalaciones especiales, alta temperatura"
        },
        HEPR: {
            nombre: "HEPR - Etileno Propileno Reticulado",
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
 * Obtiene la ampacidad base para un material, método y sección específicos
 */
function obtenerAmpacidadBase(material, metodo, seccion) {
    if (!tabelasNBR.ampacidades[material] || !tabelasNBR.ampacidades[material][metodo]) {
        throw new Error(`Material ${material} o método ${metodo} no encontrado`);
    }
    
    const ampacidad = tabelasNBR.ampacidades[material][metodo][seccion];
    if (ampacidad === undefined) {
        throw new Error(`Sección ${seccion} mm² no disponible para ${material} método ${metodo}`);
    }
    
    return ampacidad;
}

/**
 * Obtiene el factor de temperatura apropiado
 */
function obtenerFactorTemperatura(material, temperatura, metodo, esEnterrado = false) {
    let claveMaterial = material;
    
    // Mapear material a clave de factor de temperatura
    if (material === 'EPR_90') {
        claveMaterial = metodosInstalacion[metodo]?.fuente === 'INPACO' ? 'EPR_INPACO' : 'EPR_90_NBR';
    } else if (material === 'EPR_105') {
        claveMaterial = 'EPR_105_NBR';
    } else if (material === 'HEPR') {
        claveMaterial = 'HEPR_INPACO';
    } else if (material === 'PVC') {
        claveMaterial = metodosInstalacion[metodo]?.fuente === 'INPACO' ? 'PVC_INPACO' : 'PVC_NBR';
    }
    
    const tipoAmbiente = esEnterrado ? 'suelo' : 'ambiente';
    const factores = tabelasNBR.fatoresTemperatura[claveMaterial];
    
    if (!factores || !factores[tipoAmbiente]) {
        throw new Error(`Factores de temperatura no encontrados para ${claveMaterial}`);
    }
    
    const factor = factores[tipoAmbiente][temperatura];
    if (factor === undefined) {
        throw new Error(`Factor de temperatura no disponible para ${temperatura}°C`);
    }
    
    return factor;
}

/**
 * Obtiene el factor de agrupamiento según el método y número de circuitos
 */
function obtenerFactorAgrupamento(metodo, numeroCircuitos) {
    let tablaFactores;
    
    if (['A1', 'A2', 'B1', 'B2', 'C'].includes(metodo)) {
        tablaFactores = tabelasNBR.fatoresAgrupamento.metodos_ABCD;
    } else if (metodo === 'E') {
        tablaFactores = tabelasNBR.fatoresAgrupamento.metodo_E;
    } else if (['D', 'F', 'G', 'H', 'I'].includes(metodo)) {
        tablaFactores = tabelasNBR.fatoresAgrupamento.metodos_enterrados;
    } else {
        throw new Error(`Método ${metodo} no reconocido para factor de agrupamiento`);
    }
    
    // Si hay más de 20 circuitos, usar el factor de 20
    const circuitos = Math.min(numeroCircuitos, 20);
    return tablaFactores[circuitos] || tablaFactores[20];
}

/**
 * Obtiene la resistencia eléctrica por sección y material
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

// Hacer las variables disponibles globalmente
window.tabelasNBR = tabelasNBR;
window.metodosInstalacion = metodosInstalacion;
window.obtenerAmpacidadBase = obtenerAmpacidadBase;
window.obtenerFactorTemperatura = obtenerFactorTemperatura;
window.obtenerFactorAgrupamento = obtenerFactorAgrupamento;
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
            PVC: 74,       // A·s^(1/2)/mm² - Aluminio con aislamiento PVC
            EPR: 94,       // A·s^(1/2)/mm² - Aluminio con aislamiento EPR/XLPE
            XLPE: 94       // A·s^(1/2)/mm² - Aluminio con aislamiento XLPE
        }
    },
    
    // Factores de corrección para temperatura ambiente DC
    factoresTemperaturaDC: {
        // Temperatura de referencia: 40°C para cables al aire, 25°C enterrados
        PVC: {
            10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00,
            35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50
        },
        EPR_XLPE: {
            10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00,
            35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76,
            60: 0.71, 65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41, 90: 0.00
        }
    },
    
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
// RESISTENCIAS INTERNAS DE BATERÍAS (mΩ·Ah)
// Estas constantes se utilizan para estimar la resistencia interna en función
// de la capacidad (Ah). Los valores se basan en datos típicos de catálogo y
// pueden ajustarse según fuentes específicas. Se espera que la resistencia
// interna (mΩ) se calcule como constante dividida por la capacidad (Ah).
// Nota: Se utilizan factores diferentes para cada tecnología de batería.
const resistenciasInternasBateria = {
    // Batería de plomo-ácido: alrededor de 5 mΩ a 100 Ah → constante ~500 mΩ·Ah
    'plomo-acido': 500,
    // Batería de litio (LiFePO4): alrededor de 1 mΩ a 100 Ah → constante ~100 mΩ·Ah
    'litio': 100,
    // Batería de níquel-cadmio: alrededor de 2.5 mΩ a 100 Ah → constante ~250 mΩ·Ah
    'niquel-cadmio': 250
};

// Exponer constantes en objeto global para que app.js pueda acceder. Esto se
// ejecuta solo en contexto de navegador (window definido).
if (typeof window !== 'undefined') {
    window.resistenciasInternasBateria = resistenciasInternasBateria;
}

// Exportar tablas DC
window.tabelasDC = tabelasDC;


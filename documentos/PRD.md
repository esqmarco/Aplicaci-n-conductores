# PRD - Calculadora de Cables Electricos

## 1. Vision del Producto

Aplicacion web profesional de ingenieria electrica para dimensionar conductores (cables) segun normas INPACO 2021, NBR 5410 y Mamede Filho. Debe servir como herramienta de apoyo a ingenieros electricistas en Paraguay y Brasil.

La aplicacion automatiza el proceso completo de seleccion de seccion de cable, integrando los tres criterios normativos (ampacidad, caida de tension y cortocircuito) en una sola herramienta, eliminando la necesidad de consultar tablas fisicas y realizar calculos manuales.

---

## 2. Usuarios Objetivo

| Perfil | Necesidad Principal |
|--------|-------------------|
| Ingenieros electricistas proyectistas | Dimensionar conductores con precision normativa para proyectos industriales y residenciales |
| Tecnicos electricistas | Verificar rapidamente la seccion adecuada para instalaciones en campo |
| Estudiantes de ingenieria electrica | Aprender y validar calculos de dimensionamiento de cables |
| Empresas de instalaciones electricas | Estandarizar el proceso de seleccion de cables en sus proyectos |

---

## 3. Problema que Resuelve

Dimensionar cables electricos requiere consultar multiples tablas, aplicar factores de correccion y verificar 3 criterios simultaneamente (ampacidad, caida de tension, cortocircuito). Este proceso manual es lento y propenso a errores. La calculadora automatiza todo el proceso.

### Dolor actual del usuario

1. **Consulta manual de tablas**: El ingeniero debe buscar en catalogos fisicos o PDFs las tablas de ampacidad por metodo de instalacion, tipo de aislamiento y material del conductor.
2. **Aplicacion de factores de correccion**: Debe calcular manualmente los factores de temperatura y agrupamiento, y aplicarlos a la corriente de proyecto.
3. **Verificacion cruzada de 3 criterios**: Debe comparar la seccion obtenida por ampacidad con la requerida por caida de tension y por cortocircuito, seleccionando la mayor.
4. **Diferencias normativas**: Las tablas varian entre INPACO (Paraguay) y NBR 5410 (Brasil), generando confusion.
5. **Errores de calculo**: La complejidad del proceso aumenta la probabilidad de errores que pueden resultar en cables subdimensionados (riesgo de incendio) o sobredimensionados (costo innecesario).

---

## 4. Funcionalidades implementadas

El detalle de cada pestana esta en `documentos/MANUAL DE FUNCIONAMIENTO - CALCULADORA DE CABLES ELÉCTRICOS.md`; las formulas vigentes, con su fuente, en `CLAUDE.md`; la version y los cambios, en `documentos/CHANGELOG.md`.

- **AC (4 pestanas):**
  - Ampacidad: modos potencia, corriente y transformador; sistemas mono, bi y trifasico; metodos A1 a G; PVC, EPR/XLPE y HEPR; cobre y aluminio; factores de temperatura, agrupamiento y resistividad del suelo; conductores en paralelo.
  - Caida de tension con R a temperatura de servicio, efecto pelicular y de proximidad y reactancia INPACO Tabla 15, a 50 o 60 Hz.
  - Cortocircuito por el criterio adiabatico.
  - Resultados con el conductor de proteccion.
- **DC (4 pestanas):** ampacidad (metodos A1, B1, C, E), caida de tension con Np conductores por polo, cortocircuito de bancos de baterias y resultados.
- **Memoria de calculo imprimible** (AC y DC) e **Historial** de los ultimos 50 calculos.
- **Solo baja tension (hasta 1000 V)**: las tablas de media tension (NBR 14039) se retiraron en 5.0.0.

---

## 5. Funcionalidades pendientes

Viven en `documentos/PLAN_DE_MEJORAS.md` (backlog y decisiones vigentes). No se copian aca para que no queden dos listas distintas.

---

## 6. Requisitos No Funcionales

| Requisito | Especificacion | Metrica |
|-----------|---------------|---------|
| Rendimiento | Tiempo de carga inicial | < 2 segundos |
| Disponibilidad | Funcionar sin conexion a internet (todo local) | 100% offline |
| Responsividad | Adaptarse a pantallas moviles y desktop | Usable desde 320px de ancho |
| Independencia | Sin dependencias externas | Vanilla JS, sin CDN ni librerias |
| Precision numerica | Corrientes con 2 decimales, secciones exactas de norma | Secciones normalizadas INPACO/NBR |
| Compatibilidad | Navegadores modernos | Chrome, Firefox, Edge, Safari (ultimas 2 versiones) |
| Mantenibilidad | Codigo modular y documentado | Archivos separados por responsabilidad |

---

## 7. Normas de Referencia

| Norma | Organizacion | Pais | Uso en la Aplicacion |
|-------|-------------|------|---------------------|
| Catalogo INPACO 2021 | INPACO (fabricante de cables) | Paraguay | Tablas de ampacidad, factores de correccion, resistencias, reactancias, metodos de instalacion |
| NBR 5410 | Associacao Brasileira de Normas Tecnicas (ABNT) | Brasil | Limites de caida de tension, secciones minimas, constantes K, conductor de proteccion, relacion aluminio/cobre (Tablas 36-39) |
| Mamede Filho, Joao - Instalaciones Electricas Industriales (8va edicion) | Referencia academica | Brasil | Formulas de calculo, metodos de dimensionamiento |

---

## 8. Stack Tecnologico

| Componente | Tecnologia | Justificacion |
|-----------|-----------|---------------|
| Estructura | HTML5 | Semantico, accesible |
| Estilos | CSS3 (inline en index.html) | Sin archivo CSS separado (pendiente refactorizacion) |
| Logica | JavaScript vanilla (ES6+) | Sin dependencias, maximo rendimiento |
| Framework | Ninguno | Simplicidad, sin overhead, funciona offline |
| Backend | Ninguno (100% client-side) | Sin servidor, despliegue como archivos estaticos |
| Base de datos | Ninguna (datos embebidos en JS) | Tablas tecnicas como constantes en data-tables.js |

### Estructura de Archivos

```
index.html          - Interfaz de usuario (HTML + CSS inline)
data-tables.js      - Datos tecnicos (tablas INPACO, NBR 5410, Mamede Filho)
calculations.js     - Funciones de calculo AC y DC
validations.js      - Validaciones de entrada de datos
app.js              - Controlador principal y logica de UI
tests/              - Tests con las tablas reales (node tests/test_calculations.js)
documentos/         - Fuentes (PDF INPACO, Mamede, CSV NBR 5410), plan, changelog, manual y este PRD
```

---

## 9. Criterios de Aceptacion Globales

1. **Precision tecnica**: Los resultados deben coincidir con los obtenidos mediante calculo manual usando las mismas tablas y formulas normativas.
2. **Seguridad**: En caso de duda o ambiguedad, la calculadora debe seleccionar la seccion inmediatamente superior (criterio conservador).
3. **Trazabilidad**: El usuario debe poder ver que criterio (ampacidad, caida de tension o cortocircuito) determino la seccion final.
4. **Consistencia**: Los parametros compartidos entre pestanas (material, aislamiento, tension, corriente) deben sincronizarse automaticamente.
5. **Robustez**: Toda entrada del usuario debe ser validada antes del calculo, con mensajes de error claros en espanol.

---

## 10. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| Datos incorrectos en tablas | Media | Alto | Verificar contra fuentes originales (catalogo INPACO fisico, NBR 5410 oficial) |
| Formulas con errores | Baja | Alto | Validar con ejemplos resueltos de Mamede Filho |
| Usuario confunde parametros | Media | Medio | Agregar tooltips y validaciones en tiempo real (Fase 3) |
| Incompatibilidad entre normas INPACO y NBR | Baja | Medio | Documentar diferencias y usar la mas conservadora como default |
| Cables de aluminio con seccion < 16mm2 | Media | Medio | Bloquear seleccion de secciones menores a 16mm2 cuando se selecciona aluminio |

---

## 11. Metricas de Exito

- **Precision**: 100% de coincidencia con calculos manuales verificados en al menos 20 casos de prueba representativos.
- **Cobertura**: Soportar los metodos de instalacion y tipos de aislamiento mas comunes (>90% de casos reales).
- **Usabilidad**: Un ingeniero electricista debe poder completar un dimensionamiento completo (3 criterios) en menos de 2 minutos.
- **Adopcion**: Que la herramienta sea referenciada como util por ingenieros electricistas en Paraguay y Brasil.

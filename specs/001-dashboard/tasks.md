# Tareas: dashboard por bloques

Basadas en [plan.md](plan.md) y sujetas a los requisitos y criterios de aceptación de [spec.md](spec.md). Las tareas se marcan al concluir su implementación y comprobación.

## 1. Datos ficticios y atribución

- [x] Definir el catálogo de productos A, B y C con precios de 50 €, 120 € y 80 €, y una comisión común del 15 %.
- [x] Preparar registros de campañas para Instagram, TikTok y YouTube con identificador, nombre, fechas, producto, alcance, clics, ventas, interacciones desglosadas y costes.
- [x] Incluir resultados variados que permitan comparar productos y plataformas y comprobar las dos condiciones de alerta.
- [x] Comprobar que los recuentos son enteros no negativos y que los datos son coherentes con el recorrido alcance → clics → ventas.
- [x] Atribuir cada venta y coste una sola vez; distribuir los costes de campañas con varios registros sin duplicarlos.

## 2. Cálculos, filtros y formatos compartidos

- [x] Centralizar los cálculos de ventas, facturación atribuida, comisiones, interacciones, conversión, CTR sobre alcance, engagement, retorno sobre costes, ROI y coste por venta.
- [x] Calcular las métricas agregadas desde los totales de sus componentes, sin promediar porcentajes individuales ni redondear antes de su presentación.
- [x] Tratar los denominadores cero como «No disponible», manteniendo los casos válidos de conversión del 0 % y ROI del −100 %.
- [x] Centralizar los formatos de importes en euros, recuentos, porcentajes y multiplicadores con configuración de España.
- [x] Implementar filtros combinados de fechas, plataforma y producto, con opciones para todas las plataformas y todos los productos.
- [x] Incluir solo registros cuyo intervalo completo esté dentro del periodo seleccionado, incluidos sus extremos, sin prorratear campañas.
- [x] Validar el orden de las fechas y conservar la última selección válida cuando el intervalo sea incorrecto.
- [x] Implementar el restablecimiento de filtros a la selección inicial.
- [x] Definir una única colección de registros filtrados y agrupaciones por producto y plataforma para alimentar todos los bloques.
- [x] Gestionar la selección sin coincidencias con importes y recuentos cero, tasas sin denominador no disponibles y sin resultados anteriores.
- [x] Centralizar las clasificaciones, reflejando empates y excluyendo métricas no disponibles.

## 3. Estructura y patrones reutilizables

Esta sección puede avanzar en paralelo con la sección 2 una vez definidos los datos.

- [x] Preparar la estructura HTML semántica con los seis bloques en el orden del plan y reutilizar el servidor existente sin modificarlo.
- [x] Incorporar una única versión de Tailwind CSS y aplicar todos los estilos mediante clases utility, sin CSS personalizado ni frameworks adicionales.
- [x] Definir patrones consistentes para tarjetas KPI, encabezados, filtros, filas comparativas, etiquetas de plataforma, tablas, alertas y estados vacíos.
- [x] Reutilizar las funciones de presentación necesarias con JavaScript nativo, sin añadir un sistema de componentes ni abstracciones innecesarias.
- [x] Establecer etiquetas accesibles, foco visible, contraste WCAG AA y estados comprensibles sin depender exclusivamente del color.

## 4. Integración de los bloques

La integración depende de los datos, cálculos y patrones de presentación anteriores. Todos los bloques utilizarán la misma selección filtrada.

### Bloque 1. Contexto y filtros

- [x] Mostrar el título del dashboard, el periodo y la etiqueta «Datos ficticios».
- [x] Integrar los controles de fechas, plataforma y producto y la acción de restablecer.
- [x] Mostrar la semántica de inclusión de campañas, los errores de fechas y el estado sin coincidencias de forma accesible.

### Bloque 2. Resumen ejecutivo

- [x] Mostrar comisiones generadas, ventas atribuidas, conversión y ROI, en ese orden.
- [x] Mostrar alcance acumulado, interacciones y costes como información secundaria.
- [x] Distribuir los KPI en cuatro columnas en escritorio, dos en tamaños intermedios y una en móvil.
- [x] Evitar indicadores de tendencia o variaciones sin datos históricos comparables.

### Bloque 3. Comparativas y conversión

- [x] Comparar plataformas por comisiones y retorno sobre costes, identificando las mejores y los empates.
- [x] Comparar productos por facturación atribuida y comisiones, distinguiendo ambas métricas.
- [x] Mostrar el embudo alcance → clics → ventas con sus recuentos y la conversión total sobre alcance.
- [x] Acompañar las comparativas de valores, unidades y equivalentes textuales, sin librerías gráficas adicionales.

### Bloque 4. Engagement

- [x] Mostrar las comparativas de engagement por plataforma y por producto con el mismo patrón visual.
- [x] Incluir interacciones, alcance y tasa de engagement calculada sobre alcance en cada fila.

### Bloque 5. Alertas

- [x] Mostrar una lista compacta de campañas con ROI negativo, identificando la campaña y el valor que origina la alerta.
- [x] Mostrar las campañas con clics pero sin ventas e indicar los datos que justifican la alerta.
- [x] Mostrar el estado sin alertas cuando corresponda y evitar anomalías, comparaciones históricas o recomendaciones sin respaldo.

### Bloque 6. Detalle operativo

- [x] Crear la tabla de productos con producto, precio, ventas, facturación atribuida, comisiones, conversión, engagement, costes y ROI.
- [x] Crear la tabla de plataformas con plataforma, alcance, interacciones, engagement, ventas, conversión, comisiones, costes, retorno sobre costes y ROI.
- [x] Crear la tabla de campañas con campaña, fechas, plataforma, producto, alcance, clics, ventas, comisiones, costes y ROI.
- [x] Apilar las tres tablas y añadir encabezados semánticos, unidades claras y desplazamiento horizontal interno cuando sea necesario.
- [x] Incorporar las definiciones consultables de métricas, la base del CTR sobre alcance y la aclaración de que el alcance acumulado no representa personas únicas.

## 5. Verificación y aceptación

- [x] Verificar que la interfaz usa exclusivamente HTML, Tailwind y JavaScript nativo, sin CSS personalizado, frameworks adicionales ni fórmulas duplicadas con definiciones diferentes (CA-01).
- [x] Comprobar que 10 ventas de A, 5 de B y 8 de C producen 23 ventas, 1.740,00 € de facturación y 261,00 € de comisiones, con desglose de 75,00 €, 90,00 € y 96,00 € (CA-02).
- [x] Comprobar que 23 ventas, alcance de 10.000, 500 clics, 800 interacciones, 261,00 € de comisiones y 100,00 € de costes producen 0,23 % de conversión, 5,00 % de CTR sobre alcance, 8,00 % de engagement, retorno de 2,61 veces y ROI del 161,00 % (CA-03).
- [x] Comprobar que agregar 10 ventas con alcance 100 y 9 ventas con alcance 900 produce una conversión del 1,90 %, no del 5,50 %, y aplicar el mismo principio a las demás tasas (CA-04).
- [x] Probar denominadores cero, conversión del 0 %, ROI del −100 % y ausencia de valores `NaN` o `Infinity` (CA-05).
- [x] Probar filtros combinados, límites inclusivos del periodo, exclusión de campañas parcialmente incluidas, intervalo inválido y conservación de la última selección válida (CA-06).
- [x] Probar el restablecimiento de filtros y una selección sin coincidencias, comprobando que no quedan filas, clasificaciones o alertas anteriores (CA-06).
- [x] Confirmar que los totales de tablas, comparativas y KPI coinciden para la misma selección, sin duplicar ventas o costes, y que las clasificaciones tratan correctamente empates y valores no disponibles (CA-07).
- [x] Comprobar que 30,00 € de comisiones y 50,00 € de costes producen ROI del −40,00 % y su alerta; verificar también clics sin ventas y el estado sin alertas (CA-08).
- [ ] Revisar a 375, 768 y 1440 px el orden de bloques, la legibilidad, la ausencia de solapamientos y el desplazamiento horizontal limitado a los contenedores de tablas (CA-09).
- [ ] Verificar navegación con teclado, etiquetas accesibles, foco visible, contraste WCAG AA, encabezados de tabla y alternativas textuales de gráficos (CA-09).
- [x] Confirmar la identificación de datos ficticios, periodo y moneda, la distinción entre facturación y comisiones y entre retorno y ROI, y la disponibilidad de las definiciones de métricas y del alcance acumulado (CA-10).
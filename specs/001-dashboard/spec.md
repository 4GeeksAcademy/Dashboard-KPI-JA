# Especificación: dashboard de rendimiento para una influencer

## 1. Objetivo y alcance

Consolidar los resultados de campañas de Instagram, TikTok y YouTube en un dashboard que permita a una influencer supervisar sus comisiones, ventas, conversión, rentabilidad y engagement.

La primera versión utilizará datos ficticios identificados como tales. No incluirá conexiones con API de redes sociales, autenticación, base de datos ni sincronización automática. El servidor existente solo servirá los archivos de la interfaz.

El dashboard debe responder estas preguntas:

- ¿Cuánto dinero estoy generando en comisiones?
- ¿Qué productos generan más facturación atribuida y más comisiones?
- ¿Cómo convierten mis anuncios en relación con su alcance?
- ¿Qué plataformas generan mejor retorno sobre sus costes?
- ¿Cuál es el engagement por plataforma y por producto?

## 2. Restricciones técnicas y de diseño

- La interfaz se implementará con HTML semántico y Tailwind CSS. Se permite JavaScript nativo únicamente para cálculos, filtros y otras interacciones del dashboard.
- No se utilizarán React, Vue, Angular, otros frameworks de interfaz ni tecnologías adicionales para construir la aplicación.
- Todos los estilos se aplicarán mediante clases utility de Tailwind CSS, incluidas sus variantes responsive, de foco y de estado.
- No se mezclarán otros frameworks CSS ni se añadirá CSS personalizado: quedan excluidos archivos CSS propios, bloques `style`, atributos `style`, reglas `@apply` y extensiones con reglas de estilo propias.
- Se utilizará una única versión de Tailwind. El CDN de Tailwind CSS v4 documentado en la plantilla es válido para esta versión del proyecto.
- Los gráficos o indicadores visuales no requerirán librerías adicionales y estarán acompañados de valores numéricos o tablas equivalentes.
- Se reutilizarán al máximo los patrones de estructura y clases: tarjetas KPI, encabezados de sección, filtros, tablas, etiquetas de plataforma y formatos numéricos.
- Los elementos equivalentes compartirán estructura, espaciado, tipografía y estados. Si existe renderizado con JavaScript, se reutilizarán las funciones de presentación y cálculo en lugar de duplicar lógica.
- No se añadirá un sistema de componentes o una abstracción adicional únicamente para conseguir reutilización.
- Se conservará el servidor existente sin introducir un nuevo backend.
- Los textos de la interfaz estarán en español y los importes se expresarán en euros con formato de España.

## 3. Datos y reglas de negocio

### 3.1. Catálogo de productos

La comisión será siempre del 15 % de la facturación atribuida, sin ajustes adicionales por impuestos, devoluciones o descuentos en esta versión.

| Producto | Precio unitario | Comisión por venta |
| --- | ---: | ---: |
| Producto A | 50,00 € | 7,50 € |
| Producto B | 120,00 € | 18,00 € |
| Producto C | 80,00 € | 12,00 € |

### 3.2. Unidad de información

Cada registro representará el resultado de una campaña para un producto en una plataforma durante un intervalo de fechas. Contendrá:

- Identificador y nombre de campaña.
- Fecha de inicio y fecha de fin.
- Plataforma y producto.
- Alcance, clics y ventas atribuidas.
- Me gusta, comentarios, compartidos y guardados.
- Coste de campaña imputado al registro.

Los datos de ejemplo incluirán los tres productos y las tres plataformas, con resultados distintos que permitan compararlos. Los costes y recuentos serán no negativos; los recuentos serán enteros. Los registros se diseñarán de forma coherente con el recorrido alcance → clics → ventas.

Cada venta y cada coste se imputarán una sola vez. Si una campaña tiene varios registros, su coste se distribuirá entre ellos sin repetir el coste completo.

El alcance acumulado será la suma del alcance registrado, no una estimación de personas únicas entre campañas o plataformas. Esta limitación deberá ser visible en el reporte.

### 3.3. Definiciones de métricas

| Métrica | Cálculo |
| --- | --- |
| Ventas o conversiones | Suma de ventas atribuidas |
| Facturación atribuida | Suma de ventas × precio unitario de cada producto |
| Comisiones | Facturación atribuida × 0,15 |
| Interacciones | Me gusta + comentarios + compartidos + guardados |
| Tasa de conversión | Ventas ÷ alcance × 100 |
| CTR | Clics ÷ alcance × 100 |
| Engagement por alcance | Interacciones ÷ alcance × 100 |
| Retorno sobre costes | Comisiones ÷ costes |
| ROI | (Comisiones − costes) ÷ costes × 100 |
| Coste por venta | Costes ÷ ventas |

Para esta especificación, el CTR usa alcance porque no se dispone de impresiones; la interfaz indicará esta base de cálculo. El retorno sobre costes se mostrará como un multiplicador, mientras que el ROI se mostrará como porcentaje. La facturación atribuida no se presentará como ingreso personal de la influencer.

Las tasas de cualquier agrupación se calcularán dividiendo los totales de sus componentes; no se promediarán porcentajes de registros individuales. Los cálculos mantendrán su precisión hasta el momento de presentación.

Cuando un denominador sea cero se mostrará «No disponible», sin valores infinitos ni errores. Si hay alcance y no hay ventas, la conversión será 0 %. Si hay costes y no hay comisiones, el ROI será −100 %.

## 4. Requisitos funcionales

### RF-01. Contexto y filtros

El encabezado identificará el dashboard, el periodo y el carácter ficticio de los datos. Se ofrecerán filtros de periodo, plataforma y producto, con opciones para todas las plataformas y todos los productos.

El filtro temporal incluirá registros cuyo intervalo completo esté dentro de las fechas seleccionadas, incluidos ambos extremos. No se prorratearán campañas parcialmente incluidas. Esta semántica será accesible junto al filtro. Un intervalo con fecha de inicio posterior a la de fin se identificará como inválido y no se aplicará.

Los filtros se combinarán y afectarán de forma consistente a KPI, comparativas, tablas y alertas. Será posible restablecer la selección inicial. Si no hay coincidencias, se mostrará un estado vacío y no se conservarán resultados de la selección anterior.

### RF-02. Bloque superior: resultados principales

Se mostrarán cuatro KPI principales: comisiones generadas, ventas atribuidas, tasa de conversión y ROI. El alcance acumulado, las interacciones y los costes podrán aparecer como información secundaria.

No se mostrarán variaciones frente a periodos anteriores si no existen datos comparables que las justifiquen.

### RF-03. Bloque intermedio: factores del resultado

Se incluirán:

- Comparativa de plataformas por comisiones y retorno sobre costes.
- Comparativa de productos por facturación atribuida y comisiones.
- Engagement por plataforma y por producto.
- Embudo de alcance, clics y ventas, con los recuentos y la conversión total sobre alcance.

Las comparativas identificarán claramente las métricas y sus unidades. Si varias opciones comparten el mejor resultado, se reflejará el empate. Los valores no disponibles no participarán en las clasificaciones.

### RF-04. Bloque inferior: detalle operativo

El reporte contendrá las siguientes tablas:

| Tabla | Información mínima |
| --- | --- |
| Productos | Producto, precio, ventas, facturación atribuida, comisiones, conversión, engagement, costes y ROI |
| Plataformas | Plataforma, alcance, interacciones, engagement, ventas, conversión, comisiones, costes, retorno sobre costes y ROI |
| Campañas | Campaña, fechas, plataforma, producto, alcance, clics, ventas, comisiones, costes y ROI |

Las tablas y comparativas permitirán identificar los productos con más comisiones y las plataformas con mejor conversión, engagement y retorno. Los encabezados y unidades permitirán distinguir importes, porcentajes y recuentos.

### RF-05. Alertas y oportunidades

Se señalarán las campañas con ROI negativo y las campañas con clics pero sin ventas. Cada alerta identificará la campaña y el dato que la motiva. Cuando ninguna campaña cumpla estas condiciones, se mostrará un estado sin alertas.

No se afirmarán caídas, picos o anomalías temporales sin una referencia histórica comparable. No se inventarán umbrales ni recomendaciones sin respaldo en los datos.

### RF-06. Adaptabilidad y accesibilidad

La jerarquía de lectura será resultados → factores → detalle. El diseño será operativo en móvil y escritorio, sin superposición de textos ni desbordamiento horizontal de la página. Las tablas podrán tener desplazamiento horizontal dentro de su propio contenedor.

Los controles tendrán etiquetas accesibles y serán utilizables con teclado, con foco visible. Los estados no dependerán solo del color. Los gráficos tendrán una alternativa textual con los mismos datos y las tablas usarán encabezados semánticos. El contraste del texto cumplirá WCAG AA.

## 5. Criterios de aceptación

### CA-01. Restricciones de implementación

La inspección de la interfaz confirma que utiliza HTML, Tailwind y, cuando es necesario, JavaScript nativo. No hay frameworks de interfaz adicionales, otros frameworks CSS ni CSS personalizado. Los elementos repetidos siguen los mismos patrones visuales y las fórmulas no se duplican con definiciones distintas.

### CA-02. Comisiones y facturación

Con 10 ventas de A, 5 de B y 8 de C, el dashboard muestra 23 ventas, 1.740,00 € de facturación atribuida y 261,00 € de comisiones. El desglose de comisiones es 75,00 €, 90,00 € y 96,00 €, respectivamente. Producto C es el que genera más comisiones en este ejemplo.

### CA-03. Tasas y rentabilidad

Con 23 ventas, alcance de 10.000, 500 clics, 800 interacciones, 261,00 € de comisiones y 100,00 € de costes, se muestran conversión de 0,23 %, CTR sobre alcance de 5,00 %, engagement de 8,00 %, retorno de 2,61 veces y ROI de 161,00 %.

### CA-04. Agregación ponderada

Al combinar un registro de 10 ventas y alcance 100 con otro de 9 ventas y alcance 900, la conversión total es 1,90 %, no 5,50 %. La misma regla de cálculo desde totales se aplica a engagement, CTR, retorno y ROI.

### CA-05. Casos sin denominador

Con alcance cero, conversión, CTR y engagement aparecen como «No disponible». Con costes cero, retorno y ROI aparecen como «No disponible». Con ventas cero, el coste por venta aparece como «No disponible». No se muestran `NaN`, `Infinity` ni errores de cálculo.

### CA-06. Filtros y estado vacío

Al seleccionar una plataforma, un producto y un periodo, todos los bloques muestran únicamente los registros que cumplen los tres filtros. Las campañas parcialmente fuera del periodo quedan excluidas. Un intervalo inválido muestra un error y mantiene la última selección válida.

Al restablecer los filtros se recuperan los totales iniciales. Una selección sin coincidencias muestra el estado vacío, sin filas, clasificaciones o alertas anteriores; los importes y recuentos son cero y las tasas sin denominador no están disponibles.

### CA-07. Coherencia entre bloques

Con los mismos filtros, las sumas de ventas, costes, facturación y comisiones de las tablas coinciden con sus totales y comparativas. Cada venta y coste se cuenta una sola vez. Las clasificaciones respetan empates y excluyen valores no disponibles.

### CA-08. Alertas justificadas

Una campaña con 30,00 € de comisiones y 50,00 € de costes muestra ROI de −40,00 % y una alerta de rentabilidad negativa. Una campaña con clics y ninguna venta activa la alerta correspondiente. No aparecen comparaciones temporales sin datos históricos.

### CA-09. Responsive y accesibilidad

En anchos de 375 px, 768 px y 1440 px, los bloques mantienen su orden y son legibles, sin solapamientos ni desplazamiento horizontal de la página. Las tablas siguen siendo consultables. Todos los filtros se pueden operar con teclado y su foco es visible. Las métricas siguen siendo comprensibles sin distinguir colores.

### CA-10. Transparencia del reporte

La interfaz identifica los datos como ficticios, muestra el periodo y la moneda, diferencia facturación de comisiones e indica que el alcance acumulado no representa personas únicas. Es posible consultar la base de cálculo de conversión, engagement, CTR, retorno y ROI.

## 6. Exclusiones de esta versión

- Integraciones reales, importación de archivos y actualización automática de datos.
- Autenticación, usuarios, permisos y persistencia de cambios.
- Edición de campañas, precios o porcentaje de comisión desde la interfaz.
- Atribución multicanal avanzada y deduplicación real de audiencias.
- MRR, churn, NPS, CSAT y otras métricas sin datos o relación directa con este modelo de negocio.
- Comparaciones históricas, predicciones y detección estadística de anomalías.
- Exportación de reportes y notificaciones externas.

Este documento define exclusivamente requisitos y criterios de aceptación; no contiene un plan de implementación ni una lista de tareas.
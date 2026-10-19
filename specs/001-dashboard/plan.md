# Plan: dashboard por bloques

Una única pantalla con la jerarquía **resultados → explicación → detalle**, siguiendo [spec.md](spec.md).

## 1. Contexto y filtros

Encabezado con título, periodo y etiqueta «Datos ficticios».

Controles de fechas, plataforma y producto, más la acción de restablecer. La selección afectará a todos los bloques. Los errores de fechas y las selecciones sin resultados tendrán estados explícitos.

## 2. Resumen ejecutivo

Cuatro indicadores principales, en este orden:

| Comisiones generadas | Ventas atribuidas | Conversión | ROI |
| --- | --- | --- | --- |

Debajo, información secundaria: alcance acumulado, interacciones y costes.

En escritorio habrá cuatro columnas; en tamaños intermedios, dos; en móvil, una. No se mostrarán tendencias sin datos históricos.

## 3. Comparativas y conversión

Tres secciones para explicar los resultados:

- **Plataformas:** comisiones y retorno sobre costes, identificando las mejores.
- **Productos:** facturación atribuida y comisiones, distinguiendo ambos conceptos.
- **Embudo:** alcance → clics → ventas, con recuentos y conversión total.

Las comparativas tendrán valores visibles, unidades y equivalentes textuales. Los empates se indicarán y los valores no disponibles quedarán fuera de las clasificaciones.

## 4. Engagement

Dos comparativas con el mismo patrón visual: una por plataforma y otra por producto.

Cada fila mostrará **interacciones, alcance y tasa de engagement**. Así podremos distinguir entre generar muchas interacciones y conseguir una mayor proporción de participación.

## 5. Alertas

Una lista compacta, antes del detalle operativo:

- Campañas con ROI negativo.
- Campañas con clics pero sin ventas.

Cada alerta identificará la campaña y el valor que la origina. Si no existen alertas, se mostrará ese estado, sin inventar recomendaciones.

## 6. Detalle operativo

Tres tablas apiladas, con las columnas exigidas en la especificación:

1. **Productos:** resultados económicos, conversión y engagement.
2. **Plataformas:** alcance, interacción, conversión y rentabilidad.
3. **Campañas:** fechas, producto, plataforma y resultados individuales.

En móvil, las tablas tendrán desplazamiento horizontal interno. Al final estarán las definiciones de métricas y la aclaración de que el alcance acumulado no representa personas únicas.

## Orden de construcción

1. Definir los datos ficticios y sus reglas de atribución.
2. Centralizar filtros, fórmulas y formatos numéricos.
3. Definir los patrones reutilizables de presentación; puede avanzar en paralelo con el punto 2.
4. Integrar los seis bloques con los mismos datos filtrados.
5. Validar los criterios de aceptación.

Se reutilizarán tarjetas KPI, filas comparativas, encabezados, tablas, alertas y estados vacíos. Todo el estilo será mediante utilities de Tailwind, sin CSS personalizado ni frameworks adicionales.

## Verificación

- Comprobar los ejemplos numéricos de CA-02 a CA-05.
- Verificar filtros combinados, reinicio y ausencia de resultados antiguos.
- Confirmar que tablas, comparativas y KPI coinciden.
- Revisar a 375, 768 y 1440 px, incluyendo teclado, foco y contraste.
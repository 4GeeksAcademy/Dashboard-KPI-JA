"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const dashboard = require("./dashboard.js");
const { readFileSync } = require("node:fs");

function record(values = {}) {
  return { ...dashboard.campaigns[0], sales: 0, reach: 0, clicks: 0, likes: 0, comments: 0, shares: 0, saves: 0, cost: 0, ...values };
}

test("cálculos centralizados: catálogo y métricas completas", () => {
  assert.deepEqual(dashboard.products.map(product => product.price), [50, 120, 80]);
  const totals = dashboard.summarize([
    record({ product: "A", sales: 10, reach: 4000, clicks: 200, likes: 300, cost: 30 }),
    record({ product: "B", sales: 5, reach: 3000, clicks: 150, likes: 250, cost: 30 }),
    record({ product: "C", sales: 8, reach: 3000, clicks: 150, likes: 200, comments: 20, shares: 15, saves: 15, cost: 40 }),
  ]);
  assert.deepEqual(totals, {
    sales: 23, revenue: 1740, commission: 261, reach: 10000, clicks: 500, interactions: 800, cost: 100,
    conversion: 0.22999999999999998, ctr: 5, engagement: 8, returnOnCost: 2.61, roi: 161, costPerSale: 100 / 23,
  });
});

test("CA-02 suma facturación y comisiones del ejemplo de productos", () => {
  const report = dashboard.buildReport([
    record({ product: "A", sales: 10 }),
    record({ product: "B", sales: 5 }),
    record({ product: "C", sales: 8 }),
  ]);
  assert.equal(report.totals.sales, 23);
  assert.equal(report.totals.revenue, 1740);
  assert.equal(report.totals.commission, 261);
  assert.deepEqual(report.byProduct.map(product => product.commission), [75, 90, 96]);
});

test("CA-03 calcula conversión CTR engagement y rentabilidad", () => {
  const totals = dashboard.summarize([
    record({ product: "A", sales: 10, reach: 4000, clicks: 200, likes: 200, comments: 40, shares: 30, saves: 30, cost: 30 }),
    record({ product: "B", sales: 5, reach: 3000, clicks: 150, likes: 200, comments: 30, shares: 10, saves: 10, cost: 30 }),
    record({ product: "C", sales: 8, reach: 3000, clicks: 150, likes: 200, comments: 30, shares: 10, saves: 10, cost: 40 }),
  ]);
  assert.equal(totals.sales, 23);
  assert.equal(totals.commission, 261);
  assert.equal(totals.interactions, 800);
  assert.equal(dashboard.format(totals.conversion, "percent"), "0,23 %");
  assert.equal(dashboard.format(totals.ctr, "percent"), "5,00 %");
  assert.equal(dashboard.format(totals.engagement, "percent"), "8,00 %");
  assert.equal(dashboard.format(totals.returnOnCost, "multiple"), "2,61 veces");
  assert.equal(dashboard.format(totals.roi, "percent"), "161,00 %");
});

test("agregación ponderada conserva precisión", () => {
  const totals = dashboard.summarize([
    record({ sales: 10, reach: 100, clicks: 20, likes: 30, cost: 10 }),
    record({ sales: 9, reach: 900, clicks: 40, likes: 50, cost: 90 }),
  ]);
  assert.equal(totals.conversion, 1.9);
  assert.equal(totals.ctr, 6);
  assert.equal(totals.engagement, 8);
  assert.equal(totals.returnOnCost, 142.5 / 100);
  assert.equal(totals.roi, 42.5);
  assert.equal(totals.costPerSale, 100 / 19);
});

test("denominadores cero y tasas válidas sin ventas", () => {
  const empty = dashboard.summarize([]);
  for (const metric of ["conversion", "ctr", "engagement", "returnOnCost", "roi", "costPerSale"]) assert.equal(empty[metric], null);
  const noSales = dashboard.summarize([record({ reach: 100, clicks: 20, cost: 50 })]);
  assert.equal(noSales.conversion, 0);
  assert.equal(noSales.roi, -100);
  assert.equal(noSales.returnOnCost, 0);
  assert.equal(noSales.costPerSale, null);
  for (const value of Object.values(noSales)) assert.ok(value === null || Number.isFinite(value));
});

test("formatos españoles compartidos", () => {
  assert.match(dashboard.format(1740, "money"), /1740,00\s€/);
  assert.equal(dashboard.format(0.23, "percent"), "0,23 %");
  assert.equal(dashboard.format(2.61, "multiple"), "2,61 veces");
  assert.equal(dashboard.format(12000), "12.000");
  assert.equal(dashboard.format(null, "percent"), "No disponible");
  assert.match(dashboard.format("2026-10-01", "date"), /2026/);
});

test("filtros combinados de periodo plataforma y producto", () => {
  assert.equal(dashboard.selectRecords(dashboard.campaigns, dashboard.initialFilters).length, 9);
  const result = dashboard.selectRecords(dashboard.campaigns, { start: "2026-10-01", end: "2026-10-10", platform: "Instagram", product: "A" });
  assert.deepEqual(result.map(item => item.id), ["A-IG"]);
});

test("periodo inclusivo excluye campañas parcialmente incluidas", () => {
  const filters = { ...dashboard.initialFilters, start: "2026-10-01", end: "2026-10-07" };
  assert.deepEqual(dashboard.selectRecords(dashboard.campaigns, filters).map(item => item.id), ["A-IG"]);
  assert.equal(dashboard.selectRecords([dashboard.campaigns[0]], { ...filters, start: "2026-10-02" }).length, 0);
  assert.equal(dashboard.selectRecords([dashboard.campaigns[0]], { ...filters, end: "2026-10-06" }).length, 0);
});

test("fechas inválidas conservan la selección válida", () => {
  const selection = dashboard.createSelection();
  const previous = selection.apply({ ...dashboard.initialFilters, platform: "TikTok" });
  for (const dates of [{ start: "2026-10-20", end: "2026-10-01" }, { start: "2026-02-30", end: "2026-10-18" }, { start: "", end: "2026-10-18" }]) {
    const invalid = selection.apply({ ...dashboard.initialFilters, ...dates });
    assert.ok(invalid.error);
    assert.deepEqual(invalid.filters, previous.filters);
    assert.equal(invalid.records, previous.records);
  }
});

test("restablecer recupera la selección inicial", () => {
  const selection = dashboard.createSelection();
  selection.apply({ ...dashboard.initialFilters, product: "B" });
  const reset = selection.reset();
  assert.deepEqual(reset.filters, dashboard.initialFilters);
  assert.equal(reset.records.length, 9);
  assert.equal(reset.error, "");
});

test("informe único con agrupaciones coherentes", () => {
  const selection = dashboard.createSelection();
  const report = selection.apply({ ...dashboard.initialFilters, platform: "Instagram" });
  assert.equal(report.records.length, 3);
  assert.equal(report.byPlatform.length, 1);
  assert.equal(report.byProduct.length, 3);
  for (const key of ["sales", "revenue", "commission", "cost", "reach", "interactions"]) {
    assert.equal(report.byProduct.reduce((sum, row) => sum + row[key], 0), report.totals[key]);
    assert.equal(report.byPlatform[0][key], report.totals[key]);
    assert.equal(report.campaigns.reduce((sum, row) => sum + row[key], 0), report.totals[key]);
  }
});

test("selección vacía no conserva resultados anteriores", () => {
  const selection = dashboard.createSelection();
  const empty = selection.apply({ ...dashboard.initialFilters, start: "2027-01-01", end: "2027-01-31" });
  assert.equal(empty.empty, true);
  for (const group of ["records", "byProduct", "byPlatform", "campaigns"]) assert.deepEqual(empty[group], []);
  for (const key of ["sales", "commission", "revenue", "cost", "reach", "interactions"]) assert.equal(empty.totals[key], 0);
  assert.equal(empty.totals.conversion, null);
  assert.equal(selection.reset().empty, false);
});

test("clasificaciones respetan empates y excluyen no disponibles", () => {
  assert.deepEqual(dashboard.leaders([{ name: "A", roi: 10 }, { name: "B", roi: 10 }, { name: "C", roi: null }], "roi"), ["A", "B"]);
  assert.deepEqual(dashboard.leaders([{ name: "A", roi: null }], "roi"), []);
  assert.deepEqual(dashboard.leaders([{ name: "A", roi: -20 }, { name: "B", roi: -10 }], "roi"), ["B"]);
});

test("estructura semántica conserva el orden de seis bloques", () => {
  const html = readFileSync("index.html", "utf8");
  const ids = ["context", "summary-heading", "comparison-heading", "engagement-heading", "alerts-heading", "detail-heading"];
  const positions = ids.map(id => html.indexOf(`id="${id}"`));
  assert.ok(positions.every(position => position >= 0));
  assert.deepEqual(positions, [...positions].sort((first, second) => first - second));
  assert.match(html, /<html lang="es">/);
  assert.match(html, /<main id="main" class=/);
});

test("estilos exclusivamente Tailwind sin CSS propio", () => {
  const html = readFileSync("index.html", "utf8");
  assert.equal((html.match(/@tailwindcss\/browser@4/g) || []).length, 1);
  for (const source of [html, readFileSync("dashboard.js", "utf8")]) {
    assert.doesNotMatch(source, /<style\b|\bstyle\s*=|@apply|bootstrap|react-dom|vue\.js/i);
  }
});

test("patrones reutilizables presentan datos y escapan contenido", () => {
  assert.match(dashboard.kpi("Comisiones", 261, "money", true), /261,00/);
  const table = dashboard.table("Prueba", [{ key: "name", label: "Nombre", kind: "text" }, { key: "roi", label: "ROI", kind: "percent" }], [{ name: "<script>", roi: null }]);
  assert.match(table, /&lt;script&gt;/);
  assert.match(table, /scope="col"/);
  assert.match(table, /scope="row"/);
  assert.match(table, /No disponible/);
  assert.match(dashboard.table("Vacía", [], []), /No hay resultados/);
  assert.match(dashboard.platformBadge("Instagram"), /width="20" height="20"/);
});

test("funciones nativas comparten presentación de comparativas y alertas", () => {
  const rows = [{ name: "A", commission: 10 }, { name: "B", commission: 10 }];
  assert.match(dashboard.comparison("Comisiones", rows, [{ key: "name", label: "Producto", kind: "text" }], "commission", "Más comisiones"), /empate/);
  assert.match(dashboard.notice(dashboard.campaigns[0], "ROI negativo"), /ROI negativo/);
  assert.match(dashboard.notice(dashboard.campaigns[0], "ROI negativo"), /A-IG/);
});

test("controles etiquetados y paleta con contraste AA", () => {
  assert.match(dashboard.field("Desde", "start", "date"), /for="start"/);
  assert.match(dashboard.field("Desde", "start", "date"), /focus-visible:outline/);
  function luminance(hex) {
    return hex.match(/\w\w/g).map(channel => parseInt(channel, 16) / 255).map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  }
  for (const [foreground, background] of [["52525b", "ffffff"], ["18181b", "fafafa"], ["ecfdf5", "065f46"], ["9f1239", "ffe4e6"]]) {
    const values = [luminance(foreground), luminance(background)].sort((first, second) => second - first);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5);
  }
});

test("encabezado identifica dashboard periodo y datos ficticios", () => {
  const heading = dashboard.renderHeading(dashboard.initialFilters);
  assert.match(heading, /Rendimiento de campañas/);
  assert.match(heading, /Datos ficticios/);
  assert.match(heading, /01 oct 2026/);
  assert.match(heading, /18 oct 2026/);
});

test("filtros muestran fechas plataforma producto y restablecer", () => {
  const filters = dashboard.renderFilters(dashboard.initialFilters);
  for (const label of ["Desde", "Hasta", "Plataforma", "Producto", "Restablecer", "Todas las plataformas", "Todos los productos", "Instagram", "TikTok", "YouTube"]) assert.ok(filters.includes(label));
  assert.match(filters, /period-help/);
  assert.match(filters, /2026-10-01/);
});

test("contenedor anuncia errores y estados de selección accesiblemente", () => {
  const html = readFileSync("index.html", "utf8");
  assert.match(html, /id="filter-error" role="alert"/);
  assert.match(html, /id="selection-status" role="status" aria-live="polite"/);
  assert.match(dashboard.renderFilters(dashboard.initialFilters), /period-help/);
  assert.equal(typeof dashboard.mountFilters, "function");
});

test("KPI principales aparecen en orden y usan totales", () => {
  const report = dashboard.buildReport([{ ...dashboard.campaigns[0], sales: 10, reach: 1000, cost: 20 }]);
  const html = dashboard.renderMainKpis(report);
  const labels = ["Comisiones generadas", "Ventas atribuidas", "Conversión", "ROI"].map(label => html.indexOf(label));
  assert.ok(labels.every(position => position >= 0));
  assert.deepEqual(labels, [...labels].sort((a, b) => a - b));
  assert.match(html, /75,00/);
  assert.match(html, /10/);
  assert.match(html, /1,00 %/);
  assert.match(html, /275,00 %/);
});

test("métricas secundarias muestran alcance interacciones y costes", () => {
  const report = dashboard.buildReport([{ ...dashboard.campaigns[0], reach: 1234, likes: 100, comments: 20, shares: 30, saves: 50, cost: 72 }]);
  const html = dashboard.renderSecondaryMetrics(report);
  for (const value of ["Alcance acumulado", "1.234", "Interacciones", "200", "Costes", "72,00"]) assert.ok(html.includes(value));
});

test("rejilla KPI responde a móvil tablet y escritorio sin tendencias inventadas", () => {
  const html = dashboard.renderMainKpis(dashboard.buildReport([]));
  assert.match(html, /grid-cols-1/);
  assert.match(html, /sm:grid-cols-2/);
  assert.match(html, /lg:grid-cols-4/);
  assert.doesNotMatch(html, /tendencia|vs\.|respecto al periodo anterior/i);
});

test("comparativa de plataformas identifica comisiones y retorno", () => {
  const html = dashboard.renderPlatformComparison(dashboard.buildReport(dashboard.campaigns));
  for (const label of ["Rendimiento por plataforma", "Comisiones", "Retorno", "ROI", "Instagram", "TikTok", "YouTube", "Más comisiones", "Mejor retorno"]) assert.ok(html.includes(label));
  assert.match(html, /scope="col"/);
});

test("comparativa de productos distingue facturación y comisiones", () => {
  const html = dashboard.renderProductComparison(dashboard.buildReport(dashboard.campaigns));
  for (const label of ["Rendimiento por producto", "Facturación atribuida", "Comisiones", "Producto A", "Producto B", "Producto C", "Más facturación", "Más comisiones"]) assert.ok(html.includes(label));
});

test("embudo muestra alcance clics ventas y conversión total", () => {
  const report = dashboard.buildReport([{ ...dashboard.campaigns[0], reach: 10000, clicks: 500, sales: 23 }]);
  const html = dashboard.renderFunnel(report);
  for (const label of ["Alcance", "10.000", "Clics", "500", "Ventas", "23", "Conversión sobre alcance", "0,23 %"]) assert.ok(html.includes(label));
});

test("comparativas presentan cifras y unidades sin gráficos externos", () => {
  const report = dashboard.buildReport(dashboard.campaigns);
  const html = dashboard.renderPlatformComparison(report) + dashboard.renderProductComparison(report) + dashboard.renderFunnel(report);
  assert.match(html, /€|&nbsp;€/);
  assert.match(html, /veces/);
  assert.match(html, /%/);
  assert.match(html, /Facturación atribuida/);
  assert.match(html, /scope="col"/);
  assert.doesNotMatch(html, /<canvas|<svg|chart\.js|recharts/i);
});

test("engagement por plataforma y producto comparte columnas y base", () => {
  const html = dashboard.renderEngagement(dashboard.buildReport(dashboard.campaigns));
  for (const label of ["Engagement por plataforma", "Engagement por producto", "Interacciones", "Alcance", "Engagement sobre alcance", "Instagram", "Producto A"]) assert.ok(html.includes(label));
  assert.match(html, /sm:|lg:grid-cols-2/);
});

test("engagement muestra interacción alcance y tasa agregada", () => {
  const record = { ...dashboard.campaigns[0], reach: 10000, clicks: 0, sales: 0, likes: 500, comments: 100, shares: 100, saves: 100 };
  const html = dashboard.renderEngagement(dashboard.buildReport([record]));
  assert.equal(dashboard.summarize([record]).engagement, 8);
  assert.ok((html.match(/800/g) || []).length >= 2);
  assert.ok((html.match(/10\.000/g) || []).length >= 2);
  assert.ok((html.match(/8,00 %/g) || []).length >= 2);
});

test("alerta de ROI negativo incluye porcentaje y cifras causantes", () => {
  const record = { ...dashboard.campaigns[0], sales: 4, cost: 50 };
  const html = dashboard.renderAlerts(dashboard.buildReport([record]));
  assert.match(html, /Rentabilidad negativa/);
  assert.match(html, /ROI -40,00 %/);
  assert.match(html, /Comisiones 30,00/);
  assert.match(html, /Costes 50,00/);
  assert.match(html, /A-IG/);
});

test("alerta de clics sin ventas muestra el recuento", () => {
  const record = { ...dashboard.campaigns[0], clicks: 360, sales: 0 };
  const html = dashboard.renderAlerts(dashboard.buildReport([record]));
  assert.match(html, /Clics sin ventas/);
  assert.match(html, /360 clics · 0 ventas/);
  assert.match(html, /A-IG/);
});

test("sin alertas muestra estado neutral y no inventa comparaciones", () => {
  const record = { ...dashboard.campaigns[0], sales: 42, cost: 10, clicks: 200 };
  const html = dashboard.renderAlerts(dashboard.buildReport([record]));
  assert.match(html, /Sin alertas para esta selección/);
  assert.doesNotMatch(html, /anomalía|pico|caída|recomendación|periodo anterior/i);
});

test("tabla de productos incluye todas las métricas operativas", () => {
  const html = dashboard.renderProductTable(dashboard.buildReport(dashboard.campaigns));
  for (const header of ["Producto", "Precio", "Ventas", "Facturación atribuida", "Comisiones", "Conversión", "Engagement", "Costes", "ROI"]) assert.ok(html.includes(header));
  assert.match(html, /Producto A/);
  assert.match(html, /50,00/);
});

test("tabla de plataformas incluye alcance engagement ventas y rentabilidad", () => {
  const html = dashboard.renderPlatformTable(dashboard.buildReport(dashboard.campaigns));
  for (const header of ["Plataforma", "Alcance", "Interacciones", "Engagement", "Ventas", "Conversión", "Comisiones", "Costes", "Retorno sobre costes", "ROI"]) assert.ok(html.includes(header));
  assert.match(html, /Instagram/);
  assert.match(html, /veces/);
});

test("tabla de campañas incluye contexto y resultados atribuidos", () => {
  const html = dashboard.renderCampaignTable(dashboard.buildReport(dashboard.campaigns));
  for (const header of ["Campaña", "Fechas", "Plataforma", "Producto", "Alcance", "Clics", "Ventas", "Comisiones", "Costes", "ROI"]) assert.ok(html.includes(header));
  assert.match(html, /Esenciales de octubre/);
  assert.match(html, /A-IG/);
  assert.match(html, /oct 2026/);
});

test("detalle apila tablas con desplazamiento contenido", () => {
  const html = readFileSync("index.html", "utf8");
  const ids = ["product-table", "platform-table", "campaign-table"].map(id => html.indexOf(`id="${id}"`));
  assert.ok(ids.every(position => position >= 0));
  assert.deepEqual(ids, [...ids].sort((a, b) => a - b));
  const table = dashboard.renderCampaignTable(dashboard.buildReport(dashboard.campaigns));
  assert.match(table, /overflow-x-auto/);
  assert.match(table, /min-w-0/);
  assert.doesNotMatch(html, /overflow-x-auto/);
});

test("layout declara breakpoints y evita overflow global de tablas", () => {
  const html = readFileSync("index.html", "utf8");
  const kpis = dashboard.renderMainKpis(dashboard.buildReport([]));
  const engagement = dashboard.renderEngagement(dashboard.buildReport([]));
  assert.match(html, /max-w-7xl px-4/);
  assert.match(kpis, /grid-cols-1[^\"]*sm:grid-cols-2[^\"]*lg:grid-cols-4/);
  assert.match(engagement, /grid-cols-1[^\"]*lg:grid-cols-2/);
  assert.match(dashboard.renderCampaignTable(dashboard.buildReport(dashboard.campaigns)), /overflow-x-auto/);
});

test("CA-10 comunica periodo moneda y conceptos de negocio", () => {
  const heading = dashboard.renderHeading(dashboard.initialFilters);
  const definitions = dashboard.renderDefinitions();
  const report = dashboard.buildReport(dashboard.campaigns);
  const html = dashboard.renderMainKpis(report) + dashboard.renderProductComparison(report) + dashboard.renderDefinitions();
  assert.match(heading, /Datos ficticios/);
  assert.match(heading, /oct 2026/);
  assert.match(html, /€/);
  assert.match(html, /Facturación atribuida/);
  assert.match(definitions, /comisiones son el 15 %/);
  assert.match(definitions, /Retorno sobre costes/);
  assert.match(definitions, /expresado como multiplicador/);
  assert.match(definitions, /ROI/);
  assert.match(definitions, /CTR/);
  assert.match(definitions, /personas únicas/);
});

test("definiciones consultables distinguen las métricas y el alcance", () => {
  const html = dashboard.renderDefinitions();
  for (const text of ["facturación atribuida", "comisiones", "15 %", "personas únicas", "Conversión", "CTR", "impresiones", "Engagement", "Retorno sobre costes", "ROI", "Coste por venta"]) assert.ok(html.includes(text));
  assert.match(html, /<details/);
  assert.match(html, /<summary/);
});

test("renderizador actualiza todos los bloques con un mismo informe", () => {
  const nodes = new Map();
  const doc = { getElementById(id) { if (!nodes.has(id)) nodes.set(id, { innerHTML: "" }); return nodes.get(id); } };
  const report = dashboard.buildReport(dashboard.campaigns);
  const blocks = dashboard.renderDashboard(doc, report);
  assert.equal(nodes.size, 10);
  assert.equal(Object.keys(blocks).length, 10);
  for (const content of nodes.values()) assert.ok(content.innerHTML.length > 0);
  assert.ok(nodes.get("kpis").innerHTML.includes(dashboard.format(report.totals.commission, "money")));
  assert.match(nodes.get("campaign-table").innerHTML, /Clics/);
});
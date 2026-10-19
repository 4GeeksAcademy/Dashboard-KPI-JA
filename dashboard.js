"use strict";

globalThis.Dashboard = (() => {
  const commissionRate = 0.15;
  const products = [
    { id: "A", name: "Producto A", price: 50 },
    { id: "B", name: "Producto B", price: 120 },
    { id: "C", name: "Producto C", price: 80 },
  ];

  const platforms = ["Instagram", "TikTok", "YouTube"];
  const campaigns = [
    { id: "A-IG", campaignId: "OCT-A", name: "Esenciales de octubre", start: "2026-10-01", end: "2026-10-07", platform: "Instagram", product: "A", reach: 24000, clicks: 960, sales: 42, likes: 1200, comments: 84, shares: 130, saves: 186, cost: 120 },
    { id: "A-TT", campaignId: "OCT-A", name: "Esenciales de octubre", start: "2026-10-02", end: "2026-10-09", platform: "TikTok", product: "A", reach: 38000, clicks: 1520, sales: 65, likes: 2600, comments: 140, shares: 360, saves: 220, cost: 160 },
    { id: "A-YT", campaignId: "OCT-A", name: "Esenciales de octubre", start: "2026-10-04", end: "2026-10-12", platform: "YouTube", product: "A", reach: 16000, clicks: 640, sales: 21, likes: 610, comments: 72, shares: 60, saves: 58, cost: 90 },
    { id: "B-IG", campaignId: "OCT-B", name: "Selección de temporada", start: "2026-10-05", end: "2026-10-11", platform: "Instagram", product: "B", reach: 18000, clicks: 720, sales: 28, likes: 890, comments: 68, shares: 92, saves: 150, cost: 140 },
    { id: "B-TT", campaignId: "OCT-B", name: "Selección de temporada", start: "2026-10-08", end: "2026-10-15", platform: "TikTok", product: "B", reach: 29000, clicks: 870, sales: 14, likes: 1700, comments: 110, shares: 240, saves: 130, cost: 300 },
    { id: "B-YT", campaignId: "OCT-B", name: "Selección de temporada", start: "2026-10-10", end: "2026-10-18", platform: "YouTube", product: "B", reach: 21000, clicks: 1260, sales: 30, likes: 850, comments: 135, shares: 110, saves: 105, cost: 170 },
    { id: "C-IG", campaignId: "OCT-C", name: "Favoritos de la comunidad", start: "2026-10-03", end: "2026-10-10", platform: "Instagram", product: "C", reach: 20000, clicks: 800, sales: 18, likes: 1050, comments: 90, shares: 160, saves: 200, cost: 100 },
    { id: "C-TT", campaignId: "OCT-C", name: "Favoritos de la comunidad", start: "2026-10-07", end: "2026-10-14", platform: "TikTok", product: "C", reach: 34000, clicks: 1360, sales: 32, likes: 2300, comments: 160, shares: 420, saves: 180, cost: 150 },
    { id: "C-YT", campaignId: "OCT-C", name: "Favoritos de la comunidad", start: "2026-10-12", end: "2026-10-18", platform: "YouTube", product: "C", reach: 12000, clicks: 360, sales: 0, likes: 420, comments: 54, shares: 40, saves: 36, cost: 60 },
  ];

  function divide(numerator, denominator, factor = 1) {
    return denominator === 0 ? null : numerator / denominator * factor;
  }

  function summarize(records) {
    const totals = records.reduce((sum, record) => {
      const product = products.find(item => item.id === record.product);
      sum.sales += record.sales;
      sum.revenue += record.sales * product.price;
      sum.commission += record.sales * (product.price * 100 * commissionRate) / 100;
      sum.reach += record.reach;
      sum.clicks += record.clicks;
      sum.interactions += record.likes + record.comments + record.shares + record.saves;
      sum.cost += record.cost;
      return sum;
    }, { sales: 0, revenue: 0, commission: 0, reach: 0, clicks: 0, interactions: 0, cost: 0 });

    return {
      ...totals,
      conversion: divide(totals.sales, totals.reach, 100),
      ctr: divide(totals.clicks, totals.reach, 100),
      engagement: divide(totals.interactions, totals.reach, 100),
      returnOnCost: divide(totals.commission, totals.cost),
      roi: divide(totals.commission - totals.cost, totals.cost, 100),
      costPerSale: divide(totals.cost, totals.sales),
    };
  }

  const numberFormats = {
    money: new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }),
    count: new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0, useGrouping: "always" }),
    percent: new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    multiple: new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    date: new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }),
  };

  function format(value, kind = "count") {
    if (value === null || value === undefined || (typeof value === "number" && !Number.isFinite(value))) return "No disponible";
    const formatted = numberFormats[kind].format(kind === "date" ? new Date(`${value}T00:00:00Z`) : value);
    return `${formatted}${kind === "percent" ? " %" : kind === "multiple" ? " veces" : ""}`;
  }

  const initialFilters = {
    start: campaigns.map(record => record.start).sort()[0],
    end: campaigns.map(record => record.end).sort().at(-1),
    platform: "",
    product: "",
  };

  function selectRecords(records, filters) {
    return records.filter(record =>
      (!filters.platform || record.platform === filters.platform) &&
      (!filters.product || record.product === filters.product) &&
      record.start >= filters.start && record.end <= filters.end
    );
  }

  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function buildReport(records) {
    return {
      records,
      empty: records.length === 0,
      totals: summarize(records),
      byProduct: products.filter(product => records.some(record => record.product === product.id)).map(product => ({
        ...product, ...summarize(records.filter(record => record.product === product.id)),
      })),
      byPlatform: platforms.filter(platform => records.some(record => record.platform === platform)).map(platform => ({
        id: platform, name: platform, ...summarize(records.filter(record => record.platform === platform)),
      })),
      campaigns: records.map(record => ({ ...record, ...summarize([record]) })),
    };
  }

  function createSelection(records = campaigns) {
    function makeValue(filters) {
      return { filters: { ...filters }, ...buildReport(selectRecords(records, filters)), error: "" };
    }
    let value = makeValue(initialFilters);
    return {
      get value() { return value; },
      reset() {
        value = makeValue(initialFilters);
        return value;
      },
      apply(filters) {
        if (!validDate(filters.start) || !validDate(filters.end) || filters.start > filters.end) {
          value = { ...value, error: "Introduce un intervalo válido: la fecha de inicio no puede ser posterior a la de fin. Se mantienen los últimos resultados válidos." };
        } else {
          value = makeValue(filters);
        }
        return value;
      },
    };
  }

  function leaders(rows, metric) {
    const available = rows.filter(row => Number.isFinite(row[metric]));
    if (available.length === 0) return [];
    const maximum = Math.max(...available.map(row => row[metric]));
    return available.filter(row => row[metric] === maximum).map(row => row.name);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  const patterns = {
    control: "mt-2 min-h-11 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
    heading: "mb-4 text-base font-semibold text-zinc-900",
    muted: "text-sm leading-6 text-zinc-600",
    focus: "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
  };

  function emptyMessage(message = "No hay resultados para esta selección.") {
    return `<p class="border-l-2 border-zinc-300 py-3 pl-4 text-sm text-zinc-600">${escapeHtml(message)}</p>`;
  }

  function platformBadge(name) {
    const domains = { Instagram: "instagram.com", TikTok: "tiktok.com", YouTube: "youtube.com" };
    return `<span class="inline-flex items-center gap-2 font-medium"><img src="https://www.google.com/s2/favicons?domain=${domains[name]}&amp;sz=64" alt="" width="20" height="20" class="size-5 shrink-0" loading="lazy">${escapeHtml(name)}</span>`;
  }

  function kpi(label, value, kind, primary = false) {
    return `<article class="min-h-36 min-w-0 rounded-lg border p-5 ${primary ? "border-emerald-800 bg-emerald-800 text-white" : "border-zinc-200 bg-white text-zinc-900"}"><h3 class="text-sm font-medium ${primary ? "text-emerald-50" : "text-zinc-600"}">${escapeHtml(label)}</h3><p class="mt-4 break-words text-3xl font-semibold tabular-nums">${escapeHtml(format(value, kind))}</p></article>`;
  }

  function renderMainKpis(report) {
    const totals = report.totals;
    return `<div class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">${kpi("Comisiones generadas", totals.commission, "money", true)}${kpi("Ventas atribuidas", totals.sales, "count")}${kpi("Conversión", totals.conversion, "percent")}${kpi("ROI", totals.roi, "percent")}</div>`;
  }

  function renderSecondaryMetrics(report) {
    const metrics = [["Alcance acumulado", format(report.totals.reach)], ["Interacciones", format(report.totals.interactions)], ["Costes", format(report.totals.cost, "money")]];
    return `<dl class="mt-4 grid min-w-0 grid-cols-1 gap-3 border-t border-zinc-200 pt-4 sm:grid-cols-3">${metrics.map(([label, value]) => `<div class="flex min-w-0 items-baseline justify-between gap-3"><dt class="text-sm text-zinc-600">${escapeHtml(label)}</dt><dd class="shrink-0 text-sm font-semibold tabular-nums">${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
  }

  function cell(row, column) {
    if (column.kind === "platform") return platformBadge(row[column.key]);
    if (column.kind === "campaign") return `<span class="block font-medium">${escapeHtml(row.name)}</span><span class="text-xs text-zinc-600">${escapeHtml(row.id)}</span>`;
    if (column.kind === "dates") return `<span class="block whitespace-nowrap">${format(row.start, "date")}</span><span class="block whitespace-nowrap text-xs text-zinc-600">${format(row.end, "date")}</span>`;
    return escapeHtml(column.kind === "text" ? row[column.key] : format(row[column.key], column.kind));
  }

  function table(title, columns, rows) {
    const headings = columns.map((column, index) => `<th scope="col" class="px-4 py-3 text-xs font-semibold ${index === 0 ? "text-left" : "text-right"}">${escapeHtml(column.label)}</th>`).join("");
    const body = rows.map(row => `<tr class="border-t border-zinc-200">${columns.map((column, index) => `<${index === 0 ? "th scope=\"row\"" : "td"} class="px-4 py-4 align-middle ${index === 0 ? "text-left font-medium" : "text-right tabular-nums"}">${cell(row, column)}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`).join("");
    return `<div class="min-w-0"><h3 class="${patterns.heading}">${escapeHtml(title)}</h3>${rows.length === 0 ? emptyMessage() : `<div role="region" aria-label="${escapeHtml(title)}" tabindex="0" class="overflow-x-auto rounded-lg border border-zinc-200 bg-white ${patterns.focus}"><table class="w-full border-collapse text-sm"><caption class="sr-only">${escapeHtml(title)}</caption><thead class="bg-zinc-100 text-zinc-600"><tr>${headings}</tr></thead><tbody>${body}</tbody></table></div>`}</div>`;
  }

  function comparison(title, rows, columns, metric, label) {
    const best = leaders(rows, metric);
    const ranking = best.length ? `<p class="mt-3 text-xs font-medium text-zinc-600">${escapeHtml(label)}${best.length > 1 ? " (empate)" : ""}: <span class="text-zinc-900">${best.map(escapeHtml).join(" · ")}</span></p>` : "";
    return `${table(title, columns, rows)}${ranking}`;
  }

  function renderPlatformComparison(report) {
    const rows = report.byPlatform;
    const columns = [
      { key: "name", label: "Plataforma", kind: "platform" },
      { key: "commission", label: "Comisiones", kind: "money" },
      { key: "returnOnCost", label: "Retorno", kind: "multiple" },
      { key: "roi", label: "ROI", kind: "percent" },
    ];
    return `${table("Rendimiento por plataforma", columns, rows)}<div class="mt-3 flex flex-wrap gap-x-6 gap-y-2"><p class="text-xs text-zinc-600">Más comisiones: <span class="font-semibold text-zinc-900">${leaders(rows, "commission").map(escapeHtml).join(" · ") || "No disponible"}</span></p><p class="text-xs text-zinc-600">Mejor retorno: <span class="font-semibold text-zinc-900">${leaders(rows, "returnOnCost").map(escapeHtml).join(" · ") || "No disponible"}</span></p></div>`;
  }

  function renderProductComparison(report) {
    const rows = report.byProduct;
    const columns = [
      { key: "name", label: "Producto", kind: "text" },
      { key: "revenue", label: "Facturación atribuida", kind: "money" },
      { key: "commission", label: "Comisiones", kind: "money" },
    ];
    return `${table("Rendimiento por producto", columns, rows)}<div class="mt-3 flex flex-wrap gap-x-6 gap-y-2"><p class="text-xs text-zinc-600">Más facturación: <span class="font-semibold text-zinc-900">${leaders(rows, "revenue").map(escapeHtml).join(" · ") || "No disponible"}</span></p><p class="text-xs text-zinc-600">Más comisiones: <span class="font-semibold text-zinc-900">${leaders(rows, "commission").map(escapeHtml).join(" · ") || "No disponible"}</span></p></div>`;
  }

  function renderFunnel(report) {
    const totals = report.totals;
    const stages = [["Alcance", totals.reach], ["Clics", totals.clicks], ["Ventas", totals.sales]];
    return `<div class="mt-8"><h3 class="${patterns.heading}">Recorrido de conversión</h3><dl class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">${stages.map(([label, value], index) => `<div class="min-w-0 border-l-2 ${index === 2 ? "border-emerald-700" : "border-zinc-300"} py-2 pl-4"><dt class="text-sm text-zinc-600">${label}</dt><dd class="mt-1 break-words text-2xl font-semibold tabular-nums">${format(value)}</dd></div>`).join("")}</dl><p class="mt-4 text-sm text-zinc-600">Conversión sobre alcance: <span class="font-semibold text-zinc-900">${format(totals.conversion, "percent")}</span></p></div>`;
  }

  function renderEngagement(report) {
    const columns = [
      { key: "name", label: "Producto o plataforma", kind: "text" },
      { key: "interactions", label: "Interacciones", kind: "count" },
      { key: "reach", label: "Alcance", kind: "count" },
      { key: "engagement", label: "Engagement sobre alcance", kind: "percent" },
    ];
    return `<div class="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2">${table("Engagement por plataforma", columns.map((column, index) => index === 0 ? { ...column, label: "Plataforma" } : column), report.byPlatform)}${table("Engagement por producto", columns, report.byProduct)}</div>`;
  }

  function renderProductTable(report) {
    const columns = [
      { key: "name", label: "Producto", kind: "text" },
      { key: "price", label: "Precio", kind: "money" },
      { key: "sales", label: "Ventas", kind: "count" },
      { key: "revenue", label: "Facturación atribuida", kind: "money" },
      { key: "commission", label: "Comisiones", kind: "money" },
      { key: "conversion", label: "Conversión", kind: "percent" },
      { key: "engagement", label: "Engagement", kind: "percent" },
      { key: "cost", label: "Costes", kind: "money" },
      { key: "roi", label: "ROI", kind: "percent" },
    ];
    return table("Resultados por producto", columns, report.byProduct);
  }

  function renderPlatformTable(report) {
    const columns = [
      { key: "name", label: "Plataforma", kind: "platform" },
      { key: "reach", label: "Alcance", kind: "count" },
      { key: "interactions", label: "Interacciones", kind: "count" },
      { key: "engagement", label: "Engagement", kind: "percent" },
      { key: "sales", label: "Ventas", kind: "count" },
      { key: "conversion", label: "Conversión", kind: "percent" },
      { key: "commission", label: "Comisiones", kind: "money" },
      { key: "cost", label: "Costes", kind: "money" },
      { key: "returnOnCost", label: "Retorno sobre costes", kind: "multiple" },
      { key: "roi", label: "ROI", kind: "percent" },
    ];
    return table("Resultados por plataforma", columns, report.byPlatform);
  }

  function renderCampaignTable(report) {
    const columns = [
      { key: "name", label: "Campaña", kind: "campaign" },
      { key: "start", label: "Fechas", kind: "dates" },
      { key: "platform", label: "Plataforma", kind: "platform" },
      { key: "product", label: "Producto", kind: "text" },
      { key: "reach", label: "Alcance", kind: "count" },
      { key: "clicks", label: "Clics", kind: "count" },
      { key: "sales", label: "Ventas", kind: "count" },
      { key: "commission", label: "Comisiones", kind: "money" },
      { key: "cost", label: "Costes", kind: "money" },
      { key: "roi", label: "ROI", kind: "percent" },
    ];
    return table("Resultados por campaña", columns, report.campaigns);
  }

  function renderDefinitions() {
    return `<div class="mx-auto max-w-7xl"><p class="text-sm text-zinc-700">La facturación atribuida corresponde al importe de las ventas. Tus comisiones son el 15 % de esa facturación.</p><p class="mt-2 text-sm text-zinc-600">El alcance acumulado suma registros de campañas y plataformas; no representa personas únicas.</p><details class="mt-4"><summary class="w-fit cursor-pointer text-sm font-semibold text-emerald-900 underline decoration-emerald-700 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">Cómo se calculan las métricas</summary><dl class="mt-4 grid min-w-0 grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2"><div><dt class="font-semibold">Conversión</dt><dd class="text-zinc-600">Ventas atribuidas ÷ alcance × 100.</dd></div><div><dt class="font-semibold">CTR</dt><dd class="text-zinc-600">Clics ÷ alcance × 100; se usa alcance porque no se dispone de impresiones.</dd></div><div><dt class="font-semibold">Engagement</dt><dd class="text-zinc-600">Me gusta, comentarios, compartidos y guardados ÷ alcance × 100.</dd></div><div><dt class="font-semibold">Retorno sobre costes</dt><dd class="text-zinc-600">Comisiones ÷ costes, expresado como multiplicador.</dd></div><div><dt class="font-semibold">ROI</dt><dd class="text-zinc-600">(Comisiones − costes) ÷ costes × 100.</dd></div><div><dt class="font-semibold">Coste por venta</dt><dd class="text-zinc-600">Costes ÷ ventas atribuidas.</dd></div></dl></details></div>`;
  }

  function renderDashboard(doc, report) {
    const blocks = {
      kpis: renderMainKpis(report),
      "secondary-metrics": renderSecondaryMetrics(report),
      "platform-comparison": renderPlatformComparison(report),
      "product-comparison": renderProductComparison(report),
      funnel: renderFunnel(report),
      engagement: renderEngagement(report),
      alerts: renderAlerts(report),
      "product-table": renderProductTable(report),
      "platform-table": renderPlatformTable(report),
      "campaign-table": renderCampaignTable(report),
    };
    for (const [id, content] of Object.entries(blocks)) doc.getElementById(id).innerHTML = content;
    return blocks;
  }

  function notice(record, message, detail) {
    return `<li class="flex min-w-0 items-start gap-3 border-b border-zinc-200 py-4 last:border-0"><span aria-hidden="true" class="flex size-6 shrink-0 items-center justify-center rounded bg-rose-100 text-sm font-bold text-rose-800">!</span><div class="min-w-0"><p class="text-sm font-semibold">${escapeHtml(message)}</p><p class="mt-1 text-sm text-zinc-600">${escapeHtml(record.name)} · ${escapeHtml(record.id)} · ${escapeHtml(record.platform)} · Producto ${escapeHtml(record.product)}</p><p class="mt-1 text-sm text-zinc-700">${escapeHtml(detail)}</p></div></li>`;
  }

  function renderAlerts(report) {
    const alerts = [];
    for (const record of report.campaigns) {
      if (record.roi !== null && record.roi < 0) {
        alerts.push(notice(record, "Rentabilidad negativa", `ROI ${format(record.roi, "percent")} · Comisiones ${format(record.commission, "money")} · Costes ${format(record.cost, "money")}`));
      }
      if (record.clicks > 0 && record.sales === 0) {
        alerts.push(notice(record, "Clics sin ventas", `${format(record.clicks)} clics · ${format(record.sales)} ventas`));
      }
    }
    return alerts.length ? `<ul class="divide-y divide-zinc-200">${alerts.join("")}</ul>` : emptyMessage("Sin alertas para esta selección.");
  }

  function put(id, content) {
    document.getElementById(id).innerHTML = content;
  }

  function field(label, id, kind, options = [], value = "") {
    const attributes = `id="${id}" name="${id}" class="${patterns.control}"`;
    const control = kind === "select"
      ? `<select ${attributes}>${options.map(option => `<option value="${escapeHtml(option.value)}"${option.value === value ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select>`
      : `<input ${attributes} type="date" value="${escapeHtml(value)}" required aria-describedby="period-help filter-error">`;
    return `<div class="min-w-0"><label for="${id}" class="text-xs font-semibold text-zinc-600">${escapeHtml(label)}</label>${control}</div>`;
  }

  function renderHeading(filters) {
    return `<p class="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Estudio de creadora · Datos ficticios</p><h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Rendimiento de campañas</h1><p class="mt-2 text-sm text-zinc-600">${format(filters.start, "date")} – ${format(filters.end, "date")}</p>`;
  }

  function renderFilters(filters) {
    const platformOptions = [{ value: "", label: "Todas las plataformas" }, ...platforms.map(platform => ({ value: platform, label: platform }))];
    const productOptions = [{ value: "", label: "Todos los productos" }, ...products.map(product => ({ value: product.id, label: product.name }))];
    return `<div class="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"><div>${field("Desde", "filter-start", "date", [], filters.start)}</div><div>${field("Hasta", "filter-end", "date", [], filters.end)}</div><div>${field("Plataforma", "filter-platform", "select", platformOptions, filters.platform)}</div><div>${field("Producto", "filter-product", "select", productOptions, filters.product)}</div><div class="flex items-end"><button id="reset-filters" type="button" class="min-h-11 w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:w-auto">Restablecer</button></div></div><p id="period-help" class="mt-3 text-xs leading-5 text-zinc-600">Solo se incluyen campañas cuya fecha de inicio y fin quedan dentro del periodo elegido, ambos extremos incluidos.</p>`;
  }

  function mountFilters(doc, onChange = () => {}) {
    const selection = createSelection();
    const heading = doc.getElementById("dashboard-heading");
    const controls = doc.getElementById("filters");
    const error = doc.getElementById("filter-error");
    const status = doc.getElementById("selection-status");
    const updateFeedback = state => {
      error.textContent = state.error;
      error.className = state.error ? "mt-3 text-sm font-medium text-rose-800" : "";
      for (const id of ["filter-start", "filter-end"]) {
        const input = doc.getElementById(id);
        if (state.error) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
      status.textContent = state.empty ? "No hay resultados para esta selección." : `${format(state.records.length)} campañas incluidas.`;
      heading.innerHTML = renderHeading(state.filters);
      onChange(state);
    };
    const reset = () => {
      const state = selection.reset();
      controls.innerHTML = renderFilters(state.filters);
      attachEvents();
      updateFeedback(state);
    };
    const apply = () => {
      const state = selection.apply({
        start: doc.getElementById("filter-start").value,
        end: doc.getElementById("filter-end").value,
        platform: doc.getElementById("filter-platform").value,
        product: doc.getElementById("filter-product").value,
      });
      updateFeedback(state);
    };
    const attachEvents = () => {
      for (const id of ["filter-start", "filter-end", "filter-platform", "filter-product"]) doc.getElementById(id).addEventListener("change", apply);
      doc.getElementById("reset-filters").addEventListener("click", reset);
    };
    const initial = selection.value;
    heading.innerHTML = renderHeading(initial.filters);
    controls.innerHTML = renderFilters(initial.filters);
    attachEvents();
    updateFeedback(initial);
    return selection;
  }

  return { commissionRate, products, platforms, campaigns, summarize, format, initialFilters, selectRecords, buildReport, createSelection, leaders, escapeHtml, patterns, emptyMessage, platformBadge, kpi, renderMainKpis, renderSecondaryMetrics, table, comparison, renderPlatformComparison, renderProductComparison, renderFunnel, renderEngagement, renderProductTable, renderPlatformTable, renderCampaignTable, renderDefinitions, renderDashboard, notice, renderAlerts, put, field, renderHeading, renderFilters, mountFilters };
})();

if (typeof module !== "undefined") module.exports = globalThis.Dashboard;

if (typeof document !== "undefined") {
  const dashboard = globalThis.Dashboard;
  dashboard.put("definitions", dashboard.renderDefinitions());
  dashboard.mountFilters(document, report => dashboard.renderDashboard(document, report));
}
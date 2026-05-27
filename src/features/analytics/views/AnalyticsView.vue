<template>
  <div class="analytics-page">
    <div class="page-header">
      <h1 class="page-title">Análisis de Inventario</h1>
      <div class="period-selector">
        <button
          v-for="opt in periodOptions"
          :key="opt.value"
          class="period-btn"
          :class="{ 'period-btn--active': selectedPeriod === opt.value }"
          @click="changePeriod(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="globalError" class="alert alert-error" style="margin-bottom:20px;">
      <span>{{ globalError }}</span>
      <button class="alert-close" @click="globalError = ''">✕</button>
    </div>

    <section class="metrics-grid">
      <div v-for="card in metricCards" :key="card.key" class="metric-card">
        <div class="metric-card__icon" :style="{ background: card.iconBg }">
          <span v-html="card.icon"></span>
        </div>
        <div class="metric-card__body">
          <p class="metric-card__label">{{ card.label }}</p>
          <div v-if="metricsLoading" class="skeleton skeleton--value"></div>
          <p v-else class="metric-card__value" :style="{ color: card.valueColor }">
            {{ card.format(metrics) }}
          </p>
        </div>
      </div>
    </section>

    <section class="chart-section">
      <div class="section-header">
        <h2 class="section-title">Tendencia de movimientos</h2>
        <div class="window-selector">
          <button
            v-for="opt in windowOptions"
            :key="opt.value"
            class="window-btn"
            :class="{ 'window-btn--active': selectedWindow === opt.value }"
            @click="changeWindow(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="chart-wrapper">
        <div v-if="trendLoading" class="chart-skeleton">
          <div class="skeleton skeleton--chart"></div>
        </div>
        <div v-else-if="trendError" class="chart-empty chart-empty--error">
          {{ trendError }}
        </div>
        <div v-else-if="trendData.length === 0" class="chart-empty">
          No hay movimientos en este período.
        </div>
        <div v-else class="trend-chart" role="img" aria-label="Tendencia de entradas y salidas de inventario">
          <div class="chart-legend">
            <span class="chart-legend__item">
              <span class="chart-legend__swatch chart-legend__swatch--in"></span>
              Entradas
            </span>
            <span class="chart-legend__item">
              <span class="chart-legend__swatch chart-legend__swatch--out"></span>
              Salidas
            </span>
          </div>

          <div class="chart-plot">
            <div class="chart-y-axis" aria-hidden="true">
              <span v-for="tick in yTicks" :key="tick.label">{{ tick.label }}</span>
            </div>

            <svg
              class="chart-svg"
              :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                v-for="tick in yTicks"
                :key="tick.y"
                class="chart-grid-line"
                x1="0"
                :x2="CHART_WIDTH"
                :y1="tick.y"
                :y2="tick.y"
              />
              <path class="chart-area chart-area--in" :d="inboundAreaPath" />
              <path class="chart-area chart-area--out" :d="outboundAreaPath" />
              <polyline class="chart-line chart-line--in" :points="inboundPolyline" />
              <polyline class="chart-line chart-line--out" :points="outboundPolyline" />
              <circle
                v-for="point in inboundChartPoints"
                :key="`in-${point.label}`"
                class="chart-point chart-point--in"
                :cx="point.x"
                :cy="point.y"
                r="3"
              />
              <circle
                v-for="point in outboundChartPoints"
                :key="`out-${point.label}`"
                class="chart-point chart-point--out"
                :cx="point.x"
                :cy="point.y"
                r="3"
              />
            </svg>
          </div>

          <div class="chart-x-axis" aria-hidden="true">
            <span
              v-for="label in xAxisLabels"
              :key="`${label.text}-${label.left}`"
              class="chart-x-label"
              :style="{ left: `${label.left}%` }"
            >
              {{ label.text }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="products-section">
      <div class="section-header">
        <h2 class="section-title">Top productos por movimiento</h2>
        <div class="sort-selector">
          <select v-model="selectedSort" class="sort-select" @change="loadProductAnalytics">
            <option value="outbound">Mayor salida</option>
            <option value="inbound">Mayor entrada</option>
            <option value="stock_risk">Mayor riesgo</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <div v-if="productsLoading" class="table-loading">Cargando productos…</div>
        <div v-else-if="productsError" class="table-empty table-empty--error">{{ productsError }}</div>
        <table v-else class="products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th class="th-right">Entradas</th>
              <th class="th-right">Salidas</th>
              <th class="th-right">Stock actual</th>
              <th class="th-right">Riesgo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in topProducts" :key="p.product_id">
              <td class="td-name">{{ p.nombre }}</td>
              <td class="td-sku">{{ p.sku }}</td>
              <td class="td-right td-in">+{{ fmt(p.inbound_quantity) }}</td>
              <td class="td-right td-out">-{{ fmt(p.outbound_quantity) }}</td>
              <td class="td-right">{{ fmt(p.ending_stock) }}</td>
              <td class="td-right">
                <span class="risk-badge" :class="riskClass(p.stock_risk_score)">
                  {{ riskLabel(p.stock_risk_score) }}
                </span>
              </td>
            </tr>
            <tr v-if="topProducts.length === 0">
              <td colspan="6" class="table-empty">Sin datos para este período.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import {
  fetchMetrics,
  fetchTrend,
  fetchProductAnalytics,
  type AnalyticsPeriod,
  type InventoryMetrics,
  type TrendPoint,
  type ProductAnalyticsRow,
} from '@/features/analytics/api';
import { getApiErrorMessage } from '@/services/apiClient';

const selectedPeriod = ref<AnalyticsPeriod>('30d');
const selectedWindow = ref<'day' | 'week' | 'month'>('day');
const selectedSort = ref<'outbound' | 'inbound' | 'stock_risk'>('outbound');
const globalError = ref('');

const metrics = ref<InventoryMetrics | null>(null);
const metricsLoading = ref(false);

const trendData = ref<TrendPoint[]>([]);
const trendLoading = ref(false);
const trendError = ref('');

const topProducts = ref<ProductAnalyticsRow[]>([]);
const productsLoading = ref(false);
const productsError = ref('');

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;

const periodOptions = [
  { value: '7d' as AnalyticsPeriod, label: '7 días' },
  { value: '30d' as AnalyticsPeriod, label: '30 días' },
  { value: '90d' as AnalyticsPeriod, label: '90 días' },
  { value: '6m' as AnalyticsPeriod, label: '6 meses' },
];

const windowOptions = [
  { value: 'day' as const, label: 'Día' },
  { value: 'week' as const, label: 'Semana' },
  { value: 'month' as const, label: 'Mes' },
];

const metricCards = [
  {
    key: 'entradas',
    label: 'Entradas',
    iconBg: '#e8f5e9',
    valueColor: '#2e7d32',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><polyline points="5 12 12 5 19 12"/></svg>`,
    format: (m: InventoryMetrics | null) => m ? fmt(m.entradas) : '—',
  },
  {
    key: 'salidas',
    label: 'Salidas',
    iconBg: '#fff3e0',
    valueColor: '#e65100',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e65100" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><polyline points="19 12 12 19 5 12"/></svg>`,
    format: (m: InventoryMetrics | null) => m ? fmt(m.salidas) : '—',
  },
  {
    key: 'stock_bajo',
    label: 'Productos stock bajo',
    iconBg: '#fff8e1',
    valueColor: '#f57f17',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f57f17" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    format: (m: InventoryMetrics | null) => m != null ? String(m.stock_bajo) : '—',
  },
  {
    key: 'sin_stock',
    label: 'Sin stock',
    iconBg: '#ffebee',
    valueColor: '#c62828',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c62828" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
    format: (m: InventoryMetrics | null) => m != null ? String(m.sin_stock) : '—',
  },
];

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  value: number;
}

function fmt(value: number | null | undefined): string {
  if (value == null) return '—';
  return Number(value) % 1 === 0
    ? Number(value).toLocaleString('es-GT')
    : Number(value).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const chartMax = computed(() => {
  const values = trendData.value.flatMap(point => [
    Number(point.inbound_quantity),
    Number(point.outbound_quantity),
  ]);
  return Math.max(1, Math.ceil(Math.max(...values, 0)));
});

const yTicks = computed(() => {
  const steps = 4;

  return Array.from({ length: steps + 1 }, (_, index) => {
    const ratio = (steps - index) / steps;
    const value = chartMax.value * ratio;

    return {
      label: fmt(value),
      y: CHART_HEIGHT - ratio * CHART_HEIGHT,
    };
  });
});

function getChartX(index: number, total: number): number {
  return total <= 1 ? CHART_WIDTH / 2 : (index / (total - 1)) * CHART_WIDTH;
}

function getChartY(value: number): number {
  return CHART_HEIGHT - (Number(value) / chartMax.value) * CHART_HEIGHT;
}

function buildChartPoints(key: 'inbound_quantity' | 'outbound_quantity'): ChartPoint[] {
  return trendData.value.map((point, index) => ({
    x: getChartX(index, trendData.value.length),
    y: getChartY(Number(point[key])),
    label: point.period_label,
    value: Number(point[key]),
  }));
}

function toPolyline(points: ChartPoint[]): string {
  return points.map(point => `${point.x},${point.y}`).join(' ');
}

function toAreaPath(points: ChartPoint[]): string {
  if (points.length === 0) return '';

  const linePath = points.map(point => `L ${point.x} ${point.y}`).join(' ');
  const first = points[0];
  const last = points[points.length - 1];

  return `M ${first.x} ${CHART_HEIGHT} ${linePath} L ${last.x} ${CHART_HEIGHT} Z`;
}

const inboundChartPoints = computed(() => buildChartPoints('inbound_quantity'));
const outboundChartPoints = computed(() => buildChartPoints('outbound_quantity'));
const inboundPolyline = computed(() => toPolyline(inboundChartPoints.value));
const outboundPolyline = computed(() => toPolyline(outboundChartPoints.value));
const inboundAreaPath = computed(() => toAreaPath(inboundChartPoints.value));
const outboundAreaPath = computed(() => toAreaPath(outboundChartPoints.value));

const xAxisLabels = computed(() => {
  const total = trendData.value.length;
  const step = Math.max(1, Math.ceil(total / 6));

  return trendData.value
    .map((point, index) => ({
      text: point.period_label,
      left: total <= 1 ? 50 : (index / (total - 1)) * 100,
      index,
    }))
    .filter(label => label.index === 0 || label.index === total - 1 || label.index % step === 0);
});

function riskClass(score: number): string {
  const n = Number(score);
  if (n >= 60) return 'risk-badge--high';
  if (n >= 30) return 'risk-badge--mid';
  return 'risk-badge--low';
}

function riskLabel(score: number): string {
  const n = Number(score);
  if (n >= 60) return 'Alto';
  if (n >= 30) return 'Medio';
  return 'Bajo';
}

async function loadMetrics() {
  metricsLoading.value = true;
  try {
    metrics.value = await fetchMetrics(selectedPeriod.value);
  } catch (err) {
    globalError.value = getApiErrorMessage(err);
    metrics.value = null;
  } finally {
    metricsLoading.value = false;
  }
}

async function loadTrend() {
  trendLoading.value = true;
  trendError.value = '';
  try {
    const res = await fetchTrend(selectedPeriod.value, selectedWindow.value);
    trendData.value = res.points;
  } catch (err) {
    trendError.value = getApiErrorMessage(err);
    trendData.value = [];
  } finally {
    trendLoading.value = false;
  }
}

async function loadProductAnalytics() {
  productsLoading.value = true;
  productsError.value = '';
  try {
    const res = await fetchProductAnalytics(selectedPeriod.value, selectedSort.value, 8);
    topProducts.value = res.products;
  } catch (err) {
    productsError.value = getApiErrorMessage(err);
    topProducts.value = [];
  } finally {
    productsLoading.value = false;
  }
}

async function loadAll() {
  await Promise.all([loadMetrics(), loadTrend(), loadProductAnalytics()]);
}

async function changePeriod(period: AnalyticsPeriod) {
  selectedPeriod.value = period;
  if (period === '7d') selectedWindow.value = 'day';
  else if (period === '30d') selectedWindow.value = 'day';
  else if (period === '90d') selectedWindow.value = 'week';
  else selectedWindow.value = 'month';
  await loadAll();
}

async function changeWindow(window: 'day' | 'week' | 'month') {
  selectedWindow.value = window;
  await loadTrend();
}

onMounted(loadAll);
</script>

<style scoped>
.analytics-page {
  padding: 32px 36px;
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}
.period-selector {
  display: flex;
  gap: 4px;
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 10px;
  padding: 4px;
}
.period-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 7px;
  background: transparent;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.13s;
  font-family: var(--font-sans);
}
.period-btn--active {
  background: var(--color-structure-base);
  color: #fff;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1100px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .metrics-grid { grid-template-columns: 1fr; } }

.metric-card {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-card);
}
.metric-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.metric-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 4px;
}
.metric-card__value {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.skeleton {
  background: linear-gradient(90deg, #f0f4f9 25%, #e0e8f0 50%, #f0f4f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}
.skeleton--value { height: 28px; width: 80px; }
.skeleton--chart { height: 100%; border-radius: 10px; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}
.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.chart-section {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 14px;
  padding: 20px 24px;
  box-shadow: var(--shadow-card);
}
.window-selector {
  display: flex;
  gap: 4px;
}
.window-btn {
  padding: 5px 12px;
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 7px;
  background: transparent;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.13s;
  font-family: var(--font-sans);
}
.window-btn--active {
  background: var(--color-structure-base);
  border-color: var(--color-structure-base);
  color: #fff;
}
.chart-wrapper {
  height: 280px;
  position: relative;
}
.chart-skeleton {
  height: 100%;
}
.trend-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.chart-legend {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  min-height: 18px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 600;
}
.chart-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.chart-legend__swatch {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}
.chart-legend__swatch--in { background: #2e7d32; }
.chart-legend__swatch--out { background: #e65100; }
.chart-plot {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 10px;
}
.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  line-height: 1;
}
.chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.chart-grid-line {
  stroke: rgba(0, 0, 0, 0.06);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.chart-area {
  opacity: 0.88;
}
.chart-area--in { fill: rgba(46, 125, 50, 0.08); }
.chart-area--out { fill: rgba(230, 81, 0, 0.06); }
.chart-line {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
.chart-line--in { stroke: #2e7d32; }
.chart-line--out { stroke: #e65100; }
.chart-point {
  stroke: #fff;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}
.chart-point--in { fill: #2e7d32; }
.chart-point--out { fill: #e65100; }
.chart-x-axis {
  position: relative;
  height: 18px;
  margin-left: 62px;
  color: var(--color-text-muted);
  font-size: 0.72rem;
}
.chart-x-label {
  position: absolute;
  top: 0;
  max-width: 78px;
  overflow: hidden;
  text-overflow: ellipsis;
  transform: translateX(-50%);
  white-space: nowrap;
}
.chart-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}
.chart-empty--error { color: #c03a3a; }

.products-section {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 14px;
  padding: 20px 24px;
  box-shadow: var(--shadow-card);
}
.sort-select {
  padding: 6px 10px;
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 8px;
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  background: #fff;
  outline: none;
  font-family: var(--font-sans);
  cursor: pointer;
}
.table-container { overflow-x: auto; border-radius: 8px; }
.table-loading, .table-empty {
  text-align: center;
  padding: 32px;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}
.table-empty--error { color: #c03a3a; }
.products-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.products-table thead tr { background: var(--color-structure-base); }
.products-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
  color: #f0f4f9;
  font-size: 0.8rem;
  white-space: nowrap;
}
.th-right { text-align: right; }
.products-table tbody tr {
  border-bottom: 1px solid #f0f4f9;
  transition: background 0.12s;
}
.products-table tbody tr:last-child { border-bottom: none; }
.products-table tbody tr:hover { background: #f8fafc; }
.products-table td {
  padding: 12px 16px;
  vertical-align: middle;
  color: var(--color-text-secondary);
}
.td-name { font-weight: 600; color: var(--color-structure-base); }
.td-sku { font-size: 0.78rem; color: var(--color-text-muted); font-family: monospace; }
.td-right { text-align: right; font-weight: 600; }
.td-in { color: #2e7d32; }
.td-out { color: #e65100; }

.risk-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
}
.risk-badge--low  { background: #e8f5e9; color: #2e7d32; }
.risk-badge--mid  { background: #fff3e0; color: #e65100; }
.risk-badge--high { background: #ffebee; color: #c62828; }
</style>

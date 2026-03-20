<template>
  <section class="rounded-xl border border-[#e8eef5] bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-lg font-bold text-[#1a202c]">
          Analisis Pendapatan & Laba
        </h3>
        <p class="mt-1 text-sm text-[#718096]">
          Perbandingan performa {{ periodLabel }}
        </p>
      </div>
      <q-btn flat round dense icon="more_horiz" class="text-[#718096]" />
    </div>

    <div class="chart-wrapper">
      <!-- Y-axis labels (jt / M / T) -->
      <div class="y-axis">
        <span
          v-for="label in yAxisLabels"
          :key="label"
          class="y-tick"
        >{{ label }}</span>
      </div>

      <!-- Chart area -->
      <div ref="chartRef" class="chart-area">
        <svg class="chart-svg" viewBox="0 0 1000 260" preserveAspectRatio="none">
          <!-- Horizontal grid lines (align with Y ticks by value) -->
          <g opacity="0.35" stroke="#e2e8f0" stroke-width="1">
            <line
              v-for="(yPos, i) in gridLineYPositions"
              :key="`grid-${i}`"
              :x1="chartPadLeft"
              :y1="yPos"
              :x2="1000 - chartPadRight"
              :y2="yPos"
            />
          </g>
          <!-- Revenue line -->
          <polyline
            :points="revenuePoints"
            fill="none"
            stroke="#2563eb"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Net Profit line -->
          <polyline
            :points="netProfitPoints"
            fill="none"
            stroke="#0d9488"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Revenue markers -->
          <circle
            v-for="(pt, i) in revenuePointCoords"
            :key="`rev-${i}`"
            :cx="pt.x"
            :cy="pt.y"
            r="5"
            fill="white"
            stroke="#2563eb"
            stroke-width="2"
          />
          <!-- Net Profit markers -->
          <circle
            v-for="(pt, i) in netProfitPointCoords"
            :key="`np-${i}`"
            :cx="pt.x"
            :cy="pt.y"
            r="5"
            fill="white"
            stroke="#0d9488"
            stroke-width="2"
          />
        </svg>

        <!-- Hit zones -->
        <div class="hit-zones">
          <div
            v-for="(m, idx) in months"
            :key="`hit-${m}-${idx}`"
            class="hit-zone"
            @mouseenter="onEnter(idx, $event)"
            @mousemove="onMove($event)"
            @mouseleave="onLeave"
          />
        </div>

        <!-- Tooltip: bulan + Pendapatan: Rp X jt, Laba Bersih: Rp X jt -->
        <div
          v-if="hover"
          class="tooltip"
          :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
        >
          <div class="tooltip-title">{{ months[hover.index] }}</div>
          <div class="tooltip-row">
            <span class="tooltip-icon tooltip-icon--blue"></span>
            <span>Pendapatan: Rp {{ formatCompactValue(valueAt(revenue, hover.index)) }}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-icon tooltip-icon--teal"></span>
            <span>Laba Bersih: Rp {{ formatCompactValue(valueAt(netProfit, hover.index)) }}</span>
          </div>
        </div>
      </div>

      <!-- X-axis labels (bulan) -->
      <div class="x-axis">
        <span
          v-for="(m, idx) in months"
          :key="`x-${idx}`"
          class="x-tick"
        >{{ m }}</span>
      </div>
    </div>

    <div class="legend">
      <span class="legend-item">
        <i class="legend-line legend-line--blue"></i> Pendapatan
      </span>
      <span class="legend-item">
        <i class="legend-line legend-line--teal"></i> Laba Bersih
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    months: string[];
    revenue: number[];
    netProfit: number[];
    periodLabel?: string;
  }>(),
  { periodLabel: '6 bulan terakhir' }
);

const chartRef = ref<HTMLElement | null>(null);
const hover = ref<{ index: number } | null>(null);
const tooltip = ref({ x: 0, y: 0 });

// Chart area in viewBox units (SVG 1000x260)
const chartPadLeft = 0;
const chartPadRight = 0;
const chartPadTop = 20;
const chartHeight = 212;

const maxValue = computed(() => {
  return Math.max(
    ...props.revenue.map((n) => Math.abs(n)),
    ...props.netProfit.map((n) => Math.abs(n)),
    1
  );
});

/** Nilai dalam "ribu Rupiah" → juta = value/1000. Bulatkan ke angka "nice" (1,2,5,10,...). */
function niceCeil(x: number): number {
  if (x <= 0 || !Number.isFinite(x)) return 1;
  const exp = Math.floor(Math.log10(x));
  const pow = 10 ** exp;
  const norm = x / pow;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * pow;
}

const MAX_Y_TICKS = 7;

/** Y-axis: maksimal 6–7 tick, step "nice", agar miliaran/triliunan tidak membludak. */
const yAxisTicks = computed(() => {
  const maxVal = maxValue.value;
  const maxJt = maxVal / 1000;
  if (maxJt <= 0) return [0, 1];
  const niceMax = niceCeil(maxJt);
  const rawStep = niceMax / (MAX_Y_TICKS - 1);
  const step = Math.max(1, niceCeil(rawStep));
  const ticks: number[] = [];
  for (let v = 0; v <= niceMax && ticks.length < MAX_Y_TICKS; v += step) {
    ticks.push(v);
  }
  if (ticks.length > 0 && ticks[ticks.length - 1] !== niceMax) {
    ticks.push(niceMax);
  }
  return ticks.length >= 2 ? ticks : [0, niceMax];
});

/** Label sumbu Y: "0", "5 jt", "10 M", "1 T" dst. */
const yAxisLabels = computed(() => {
  return yAxisTicks.value.map((tickJt) => formatAxisLabel(tickJt));
});

/** Posisi Y (dalam viewBox) tiap grid line sesuai nilai tick (jt → data = jt*1000). */
const gridLineYPositions = computed(() => {
  const max = maxValue.value;
  return yAxisTicks.value.map((tickJt) => {
    const val = tickJt * 1000;
    const y = chartPadTop + chartHeight - (max > 0 ? (val / max) * chartHeight : 0);
    return y;
  });
});

/** Format nilai dalam juta untuk tooltip: "72 jt" / "29,3 M" / "1,5 T". */
function formatCompactValue(valueInThousands: number): string {
  const jt = valueInThousands / 1000;
  return formatAxisLabel(jt);
}

/** Satu nilai dalam juta → string "X jt" / "X M" / "X T". */
function formatAxisLabel(jt: number): string {
  const abs = Math.abs(jt);
  if (abs >= 1_000_000) {
    const t = abs / 1_000_000;
    const s = t >= 10 ? Math.round(t).toLocaleString('id-ID') : t.toFixed(1).replace('.', ',');
    return `${s} T`;
  }
  if (abs >= 1_000) {
    const m = abs / 1_000;
    const s = m >= 10 ? Math.round(m).toLocaleString('id-ID') : m.toFixed(1).replace('.', ',');
    return `${s} M`;
  }
  const s = (Math.round(abs * 10) / 10).toLocaleString('id-ID').replace(/,/g, '.');
  return abs === 0 ? '0' : `${s} jt`;
}

function valueAt(arr: number[], idx: number): number {
  return arr[idx] ?? 0;
}

function toPoint(idx: number, val: number, total: number): { x: number; y: number } {
  const width = 1000 - chartPadLeft - chartPadRight;
  const x = chartPadLeft + (total <= 1 ? 0 : (idx / (total - 1)) * width);
  const max = maxValue.value;
  const y = chartPadTop + chartHeight - (max > 0 ? (val / max) * chartHeight : 0);
  return { x, y };
}

const revenuePoints = computed(() => {
  const total = props.months.length;
  return props.revenue
    .map((v, i) => {
      const { x, y } = toPoint(i, v, total);
      return `${x},${y}`;
    })
    .join(' ');
});

const netProfitPoints = computed(() => {
  const total = props.months.length;
  return props.netProfit
    .map((v, i) => {
      const { x, y } = toPoint(i, v, total);
      return `${x},${y}`;
    })
    .join(' ');
});

const revenuePointCoords = computed(() => {
  const total = props.months.length;
  return props.revenue.map((v, i) => toPoint(i, v, total));
});

const netProfitPointCoords = computed(() => {
  const total = props.months.length;
  return props.netProfit.map((v, i) => toPoint(i, v, total));
});

function onEnter(index: number, ev: MouseEvent) {
  hover.value = { index };
  onMove(ev);
}
function onMove(ev: MouseEvent) {
  if (!chartRef.value) return;
  const rect = chartRef.value.getBoundingClientRect();
  tooltip.value = { x: ev.clientX - rect.left + 12, y: ev.clientY - rect.top - 12 };
}
function onLeave() {
  hover.value = null;
}

</script>

<style scoped>
.chart-wrapper {
  display: grid;
  grid-template-columns: 52px 1fr;
  grid-template-rows: 1fr 28px;
  margin-top: 1rem;
  height: 280px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 8px 28px 0;
  text-align: right;
  font-size: 0.75rem;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.y-tick {
  line-height: 1;
}

.chart-area {
  position: relative;
  min-height: 0;
}

.chart-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hit-zones {
  position: absolute;
  inset: 0;
  display: flex;
  pointer-events: none;
}

.hit-zone {
  flex: 1;
  pointer-events: auto;
  cursor: pointer;
}

.tooltip {
  pointer-events: none;
  position: absolute;
  z-index: 20;
  min-width: 200px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  font-size: 0.8125rem;
}

.tooltip-title {
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
}

.tooltip-icon {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border: 2px solid;
  border-radius: 2px;
}

.tooltip-icon--blue {
  border-color: #2563eb;
}

.tooltip-icon--teal {
  border-color: #0d9488;
}

.x-axis {
  grid-column: 2;
  display: flex;
  justify-content: space-between;
  padding: 4px 0 0;
  font-size: 0.75rem;
  color: #64748b;
}

.x-tick {
  flex: 1;
  text-align: center;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-line {
  display: inline-block;
  width: 24px;
  height: 3px;
  border-radius: 2px;
}

.legend-line--blue {
  background: #2563eb;
}

.legend-line--teal {
  background: #0d9488;
}
</style>



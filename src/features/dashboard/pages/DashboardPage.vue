<template>
  <div class="min-h-screen bg-[#f7f9fc] px-4 py-4 md:px-6 md:py-6">
    <div class="mx-auto max-w-[1400px] space-y-6">
      <header
        class="rounded-xl border border-[#e8eef5] bg-white px-4 py-4 shadow-sm md:px-6 md:py-5"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-[#1a202c]">Financial Overview</h1>
            <p class="mt-1 text-sm text-[#718096]">
              {{ selectedCompanies.length ? selectedCompanies.join(', ') + ' - ' : '' }}Periode Januari - Desember 2024 - Data real-time
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <q-select
              v-model="selectedCompanies"
              :options="companyOptions"
              multiple
              use-chips
              option-label="label"
              option-value="value"
              emit-value
              map-options
              dense
              outlined
              label="Perusahaan"
              class="min-w-[220px]"
              :loading="companiesLoading"
              :disable="companiesLoading || financialOverview.isLoading.value"
              @update:model-value="onCompanyChange"
            />
            <q-btn
            flat
            round
            dense
            icon="refresh"
            class="border border-[#e8eef5] bg-white text-[#718096]"
            :class="{ 'animate-spin': isRefreshing || financialOverview.isLoading.value }"
            :disable="financialOverview.isLoading.value"
            @click="handleRefresh"
          />
          </div>
        </div>

        <!-- Financial Overview Cards (Quasar default / light) -->
        <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <!-- 1. Total Piutang -->
          <article
            class="rounded-xl border border-[#e8eef5] bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div class="mb-3 flex items-start justify-between">
              <p class="text-sm font-medium text-[#718096]">Total Piutang</p>
              <q-icon name="shield" size="24px" class="text-indigo-600" />
            </div>
            <h2 class="text-2xl font-bold text-[#1a202c] md:text-3xl" :class="financialOverview.isLoading.value ? 'animate-pulse' : ''">
              {{ financialOverview.formatted.value.totalPiutang }}
            </h2>
            <div class="mt-4">
              <div class="flex justify-between text-xs text-[#718096]">
                <span>Outstanding</span>
                <span>{{ financialOverview.formatted.value.totalPiutang }}</span>
              </div>
              <div class="mt-1 h-2 overflow-hidden rounded-full bg-[#e8eef5]">
                <div
                  class="h-full rounded-full bg-indigo-500"
                  :style="{ width: `${outstandingProgress}%` }"
                />
              </div>
            </div>
          </article>

          <!-- 2. Total Utang -->
          <article
            class="rounded-xl border border-[#e8eef5] bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div class="mb-3 flex items-start justify-between">
              <p class="text-sm font-medium text-[#718096]">Total Utang</p>
              <q-icon name="account_balance" size="24px" class="text-amber-700" />
            </div>
            <h2 class="text-2xl font-bold text-[#1a202c] md:text-3xl" :class="financialOverview.isLoading.value ? 'animate-pulse' : ''">
              {{ financialOverview.formatted.value.totalHutang }}
            </h2>
            <p class="mt-4 text-sm text-[#718096]">
              3 supplier menunggu pembayaran
            </p>
          </article>

          <!-- 3. Total Pendapatan -->
          <article
            class="rounded-xl border border-[#e8eef5] bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div class="mb-3 flex items-start justify-between">
              <p class="text-sm font-medium text-[#718096]">Total Pendapatan</p>
              <q-icon name="attach_money" size="24px" class="text-green-700" />
            </div>
            <h2 class="text-2xl font-bold text-[#1a202c] md:text-3xl" :class="financialOverview.isLoading.value ? 'animate-pulse' : ''">
              {{ financialOverview.formatted.value.totalPendapatan }}
            </h2>
            <div class="mt-4">
              <div class="flex justify-between text-xs text-[#718096]">
                <span>Target Annual</span>
                <span>94%</span>
              </div>
              <div class="mt-1 h-2 overflow-hidden rounded-full bg-[#e8eef5]">
                <div
                  class="h-full w-[94%] rounded-full bg-green-500"
                />
              </div>
            </div>
          </article>

          <!-- 4. Laba Bersih -->
          <article
            class="rounded-xl border border-[#e8eef5] bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div class="mb-3 flex items-start justify-between">
              <p class="text-sm font-medium text-[#718096]">Laba Bersih</p>
              <q-icon name="show_chart" size="24px" class="text-green-700" />
            </div>
            <h2 class="text-2xl font-bold text-[#1a202c] md:text-3xl" :class="financialOverview.isLoading.value ? 'animate-pulse' : ''">
              {{ financialOverview.formatted.value.labaBersih }}
            </h2>
            <div class="mt-4 flex items-center justify-between text-sm text-[#718096]">
              <span>Net Margin</span>
              <span class="font-medium text-[#1a202c]">{{ netMarginPercent }}%</span>
            </div>
          </article>
        </div>

        <p v-if="financialOverview.error.value" class="mt-3 text-sm text-red-600">
          {{ financialOverview.error.value.message }}
        </p>
      </header>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section class="rounded-xl border border-[#e8eef5] bg-white p-5 shadow-sm xl:col-span-2">
          <h3 class="text-2xl font-bold text-[#1a202c]">Revenue & Expense Analysis</h3>
          <p class="mt-1 text-sm text-[#718096]">Monthly performance comparison</p>

          <div class="mt-6 rounded-lg border border-dashed border-[#e8eef5] p-4">
            <div ref="revenueChartRef" class="relative h-[280px]">
              <svg
                class="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 1000 280"
                preserveAspectRatio="none"
              >
                <polyline
                  :points="profitLinePoints"
                  fill="none"
                  stroke="#00aa44"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <div class="flex h-full items-end justify-between gap-2 pt-4">
                <div
                  v-for="row in revenueData"
                  :key="row.month"
                  class="flex min-w-[48px] flex-1 cursor-pointer flex-col items-center gap-2"
                  @mouseenter="onRevenueEnter(row, $event)"
                  @mousemove="onRevenueMove($event)"
                  @mouseleave="onRevenueLeave"
                >
                  <div class="flex h-[220px] items-end gap-1.5">
                    <div
                      class="w-3 rounded-t-md bg-[#0066ff] md:w-4"
                      :style="{ height: `${barHeight(row.revenue)}px` }"
                    ></div>
                    <div
                      class="w-3 rounded-t-md bg-[#ff9900] md:w-4"
                      :style="{ height: `${barHeight(row.expense)}px` }"
                    ></div>
                  </div>
                  <span class="text-xs text-[#718096]">{{ row.month }}</span>
                </div>
              </div>

              <div
                v-if="hoveredRevenue"
                class="pointer-events-none absolute z-20 min-w-[210px] rounded-xl border border-[#d7e0ec] bg-white px-4 py-3 text-base shadow-lg"
                :style="{
                  left: `${revenueTooltip.x}px`,
                  top: `${revenueTooltip.y}px`,
                }"
              >
                <p class="mb-2 text-black">{{ hoveredRevenue.month }}</p>
                <p class="text-[#0066ff]">revenue : {{ hoveredRevenue.revenue }}</p>
                <p class="text-[#ff9900]">expense : {{ hoveredRevenue.expense }}</p>
                <p class="text-[#00aa44]">profit : {{ hoveredRevenue.profit }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-center gap-4 text-sm font-medium">
              <span class="flex items-center gap-1.5 text-[#0066ff]"
                ><i class="h-2.5 w-2.5 bg-[#0066ff]"></i>revenue</span
              >
              <span class="flex items-center gap-1.5 text-[#ff9900]"
                ><i class="h-2.5 w-2.5 bg-[#ff9900]"></i>expense</span
              >
              <span class="flex items-center gap-1.5 text-[#00aa44]"
                ><i class="h-0.5 w-4 bg-[#00aa44]"></i>profit</span
              >
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-[#e8eef5] bg-white p-5 shadow-sm">
          <h3 class="text-2xl font-bold text-[#1a202c]">Payment Distribution</h3>
          <p class="mt-1 text-sm text-[#718096]">By payment age</p>

          <div ref="donutChartRef" class="relative mt-8 flex justify-center">
            <div class="relative h-[220px] w-[220px]">
              <svg viewBox="0 0 220 220" class="h-full w-full">
                <g transform="rotate(-90 110 110)">
                  <circle
                    v-for="segment in donutSegments"
                    :key="segment.name"
                    cx="110"
                    cy="110"
                    r="72"
                    fill="transparent"
                    :stroke="segment.color"
                    stroke-width="34"
                    stroke-linecap="butt"
                    :stroke-dasharray="`${segment.length} ${donutCircumference - segment.length}`"
                    :stroke-dashoffset="-segment.offset"
                    class="cursor-pointer"
                    @mouseenter="onDonutEnter(segment.name, segment.value, $event)"
                    @mousemove="onDonutMove($event)"
                    @mouseleave="onDonutLeave"
                  />
                </g>
              </svg>
              <div class="absolute inset-[58px] rounded-full bg-white"></div>
            </div>

            <div
              v-if="hoveredDonut"
              class="pointer-events-none absolute z-20 rounded-xl border border-[#d7e0ec] bg-white px-4 py-3 text-[36px] shadow-lg"
              :style="{
                left: `${donutTooltip.x}px`,
                top: `${donutTooltip.y}px`,
              }"
            >
              {{ hoveredDonut.name }} : {{ hoveredDonut.value }}
            </div>
          </div>

          <div class="mt-8 space-y-3">
            <div
              v-for="item in distributionData"
              :key="item.name"
              class="flex items-center justify-between text-sm"
            >
              <div class="flex items-center gap-2 text-[#718096]">
                <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
                <span>{{ item.name }}</span>
              </div>
              <span class="font-semibold text-[#1a202c]">{{ item.value }}%</span>
            </div>
          </div>
        </section>
      </div>

      <section class="rounded-xl border border-[#e8eef5] bg-white p-5 shadow-sm">
        <h3 class="text-2xl font-bold text-[#1a202c]">Revenue Projection</h3>
        <p class="mt-1 text-sm text-[#718096]">Actual vs. forecasted performance</p>

        <div class="mt-6 rounded-lg border border-dashed border-[#e8eef5] p-4">
          <div ref="projectionChartRef" class="relative h-[220px] w-full">
            <svg
              class="pointer-events-none h-[220px] w-full"
              viewBox="0 0 1000 220"
              preserveAspectRatio="none"
            >
              <polyline
                :points="projectionActualPoints"
                fill="none"
                stroke="#0066ff"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                :points="projectionForecastPoints"
                fill="none"
                stroke="#9966ff"
                stroke-width="3"
                stroke-dasharray="10 8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <div class="absolute inset-0 flex">
              <div
                v-for="row in projectionData"
                :key="`projection-${row.month}`"
                class="h-full flex-1 cursor-pointer"
                @mouseenter="onProjectionEnter(row, $event)"
                @mousemove="onProjectionMove($event)"
                @mouseleave="onProjectionLeave"
              ></div>
            </div>

            <div
              v-if="hoveredProjection"
              class="pointer-events-none absolute z-20 min-w-[220px] rounded-xl border border-[#d7e0ec] bg-white px-4 py-3 text-base shadow-lg"
              :style="{
                left: `${projectionTooltip.x}px`,
                top: `${projectionTooltip.y}px`,
              }"
            >
              <p class="mb-2 text-black">{{ hoveredProjection.month }}</p>
              <p class="text-[#0066ff]">
                actual : {{ hoveredProjection.value === null ? '-' : hoveredProjection.value }}
              </p>
              <p class="text-[#9966ff]">forecast : {{ hoveredProjection.projection }}</p>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-center gap-4 text-sm font-medium">
            <span class="flex items-center gap-1.5 text-[#0066ff]"
              ><i class="h-0.5 w-4 bg-[#0066ff]"></i>Actual</span
            >
            <span class="flex items-center gap-1.5 text-[#9966ff]"
              ><i class="h-0.5 w-4 bg-[#9966ff]"></i>Forecast</span
            >
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-[#e8eef5] bg-white p-5 shadow-sm">
        <h3 class="text-2xl font-bold text-[#1a202c]">Top Customers</h3>
        <p class="mt-1 text-sm text-[#718096]">By revenue contribution</p>

        <div class="mt-6 space-y-3">
          <article
            v-for="customer in customers"
            :key="customer.name"
            class="rounded-lg bg-[#f5f7fa] p-4 transition hover:bg-[#ecf1f8]"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h4 class="font-semibold text-[#1a202c]">{{ customer.name }}</h4>
              <p class="text-xl font-bold text-[#1a202c]">{{ formatCompact(customer.amount) }}</p>
            </div>

            <div class="mt-3 flex items-center gap-3">
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-white">
                <div
                  class="h-full rounded-full bg-[#0066ff]"
                  :style="{ width: `${customer.percentage}%` }"
                ></div>
              </div>
              <span class="text-xs font-medium text-[#718096]">{{ customer.percentage }}%</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useFinancialOverview } from '../composables/useFinancialOverview';
import { getCompanies } from 'src/shared/services/backendApiContract';

interface RevenueRow {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

interface ProjectionRow {
  month: string;
  value: number | null;
  projection: number;
}

interface DistributionRow {
  name: string;
  value: number;
  color: string;
}

const financialOverview = useFinancialOverview();
const isRefreshing = ref(false);

const companies = ref<string[]>([]);
const companiesLoading = ref(false);
const selectedCompanies = ref<string[]>([]);

const companyOptions = computed(() =>
  companies.value.map((name) => ({ label: name, value: name }))
);

async function loadCompanies() {
  companiesLoading.value = true;
  try {
    companies.value = await getCompanies();
    if (companies.value.length > 0 && selectedCompanies.value.length === 0) {
      const first = companies.value[0];
      if (first !== undefined) selectedCompanies.value = [first];
    }
  } finally {
    companiesLoading.value = false;
  }
}

function onCompanyChange(value: string[] | null) {
  const list = value ?? [];
  selectedCompanies.value = list;
  if (list.length > 0) {
    void financialOverview.refresh(list);
  }
}

/** Progress 0–100 for piutang outstanding (placeholder: based on total) */
const outstandingProgress = computed(() => {
  const total = financialOverview.totalPiutang.value;
  if (total <= 0) return 0;
  const max = Math.max(total, 5_000_000);
  return Math.min(100, Math.round((total / max) * 100));
});

/** Net margin %: laba bersih / pendapatan * 100 */
const netMarginPercent = computed(() => {
  const laba = financialOverview.labaBersih.value;
  const pendapatan = financialOverview.totalPendapatan.value;
  if (pendapatan <= 0) return '0';
  return (laba / pendapatan * 100).toFixed(1);
});

const revenueData: RevenueRow[] = [
  { month: 'Jan', revenue: 45000, expense: 28000, profit: 17000 },
  { month: 'Feb', revenue: 52000, expense: 31000, profit: 21000 },
  { month: 'Mar', revenue: 48000, expense: 29000, profit: 19000 },
  { month: 'Apr', revenue: 61000, expense: 35000, profit: 26000 },
  { month: 'May', revenue: 55000, expense: 32000, profit: 23000 },
  { month: 'Jun', revenue: 67000, expense: 38000, profit: 29000 },
  { month: 'Jul', revenue: 72000, expense: 40000, profit: 32000 },
  { month: 'Aug', revenue: 78000, expense: 43000, profit: 35000 },
  { month: 'Sep', revenue: 85000, expense: 46000, profit: 39000 },
  { month: 'Oct', revenue: 92000, expense: 50000, profit: 42000 },
  { month: 'Nov', revenue: 98000, expense: 52000, profit: 46000 },
  { month: 'Dec', revenue: 105000, expense: 55000, profit: 50000 },
];

const projectionData: ProjectionRow[] = [
  { month: 'Aug', value: 78000, projection: 78000 },
  { month: 'Sep', value: 85000, projection: 85000 },
  { month: 'Oct', value: 92000, projection: 92000 },
  { month: 'Nov', value: 98000, projection: 101000 },
  { month: 'Dec', value: 105000, projection: 112000 },
  { month: 'Jan', value: null, projection: 118000 },
  { month: 'Feb', value: null, projection: 125000 },
];

const distributionData: DistributionRow[] = [
  { name: '0-30 days', value: 45, color: '#0066ff' },
  { name: '31-60 days', value: 28, color: '#00aa44' },
  { name: '61-90 days', value: 18, color: '#ff9900' },
  { name: '90+ days', value: 9, color: '#ff4444' },
];

const revenueChartRef = ref<HTMLElement | null>(null);
const donutChartRef = ref<HTMLElement | null>(null);
const projectionChartRef = ref<HTMLElement | null>(null);

const hoveredRevenue = ref<RevenueRow | null>(null);
const revenueTooltip = ref({ x: 0, y: 0 });

const hoveredDonut = ref<{ name: string; value: number } | null>(null);
const donutTooltip = ref({ x: 0, y: 0 });

const hoveredProjection = ref<ProjectionRow | null>(null);
const projectionTooltip = ref({ x: 0, y: 0 });

const customers = [
  { name: 'PT Maju Konsultasi', amount: 625000, percentage: 22 },
  { name: 'CV Berhadiah Timur', amount: 585000, percentage: 18 },
  { name: 'PT Sinar Maju', amount: 540000, percentage: 15 },
  { name: 'Koperasi Merdeka', amount: 480000, percentage: 14 },
  { name: 'PT Graha Raya', amount: 420000, percentage: 12 },
];

const maxRevenue = Math.max(...revenueData.map((item) => item.revenue));
const maxProfit = Math.max(...revenueData.map((item) => item.profit));
const maxProjection = Math.max(...projectionData.map((item) => item.projection));

const barHeight = (value: number) => {
  return Math.max(10, (value / maxRevenue) * 210);
};

const profitLinePoints = computed(() => {
  return revenueData
    .map((row, index) => {
      const x = 40 + (index * 920) / (revenueData.length - 1);
      const y = 220 - (row.profit / maxProfit) * 180;
      return `${x},${y}`;
    })
    .join(' ');
});

const projectionActualPoints = computed(() => {
  const actualRows = projectionData.filter((item) => item.value !== null);
  return actualRows
    .map((row, index) => {
      const value = row.value ?? 0;
      const x = 40 + (index * 920) / (projectionData.length - 1);
      const y = 190 - (value / maxProjection) * 150;
      return `${x},${y}`;
    })
    .join(' ');
});

const projectionForecastPoints = computed(() => {
  return projectionData
    .map((row, index) => {
      const x = 40 + (index * 920) / (projectionData.length - 1);
      const y = 190 - (row.projection / maxProjection) * 150;
      return `${x},${y}`;
    })
    .join(' ');
});

const formatCompact = (value: number) => {
  return `Rp ${(value / 1000).toFixed(0)}K`;
};

const donutCircumference = 2 * Math.PI * 72;
const donutSegments = computed(() => {
  let offset = 0;
  return distributionData.map((item) => {
    const length = (item.value / 100) * donutCircumference;
    const segment = {
      ...item,
      offset,
      length,
    };
    offset += length;
    return segment;
  });
});

function onRevenueEnter(row: RevenueRow, event: MouseEvent) {
  hoveredRevenue.value = row;
  onRevenueMove(event);
}

function onRevenueMove(event: MouseEvent) {
  if (!revenueChartRef.value) return;
  const rect = revenueChartRef.value.getBoundingClientRect();
  revenueTooltip.value = {
    x: event.clientX - rect.left + 12,
    y: event.clientY - rect.top - 12,
  };
}

function onRevenueLeave() {
  hoveredRevenue.value = null;
}

function onDonutEnter(name: string, value: number, event: MouseEvent) {
  hoveredDonut.value = { name, value };
  onDonutMove(event);
}

function onDonutMove(event: MouseEvent) {
  if (!donutChartRef.value) return;
  const rect = donutChartRef.value.getBoundingClientRect();
  donutTooltip.value = {
    x: event.clientX - rect.left + 10,
    y: event.clientY - rect.top + 10,
  };
}

function onDonutLeave() {
  hoveredDonut.value = null;
}

function onProjectionEnter(row: ProjectionRow, event: MouseEvent) {
  hoveredProjection.value = row;
  onProjectionMove(event);
}

function onProjectionMove(event: MouseEvent) {
  if (!projectionChartRef.value) return;
  const rect = projectionChartRef.value.getBoundingClientRect();
  projectionTooltip.value = {
    x: event.clientX - rect.left + 12,
    y: event.clientY - rect.top - 12,
  };
}

function onProjectionLeave() {
  hoveredProjection.value = null;
}

const handleRefresh = async () => {
  isRefreshing.value = true;
  const list = selectedCompanies.value;
  await financialOverview.refresh(list.length > 0 ? list : undefined);
  isRefreshing.value = false;
};

onMounted(async () => {
  await loadCompanies();
  if (selectedCompanies.value.length > 0) {
    void financialOverview.refresh(selectedCompanies.value);
  }
});
</script>

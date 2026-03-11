<template>
  <div class="min-h-screen bg-[#f7f9fc] px-4 py-4 md:px-6 md:py-6">
    <div class="mx-auto max-w-[1400px] space-y-6">
      <header
        class="rounded-xl border border-[#e8eef5] bg-white px-4 py-4 shadow-sm md:px-6 md:py-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-[#1a202c]">Executive Dashboard</h1>
            <p class="mt-1 text-sm text-[#718096]">Financial Overview • Last 12 months</p>
          </div>

          <div class="flex items-center gap-2">
            <q-btn
              flat
              round
              dense
              icon="refresh"
              class="border border-[#e8eef5] bg-white text-[#718096]"
              :class="{ 'animate-spin': isRefreshing }"
              @click="handleRefresh"
            />
            <q-btn
              flat
              round
              dense
              icon="download"
              class="border border-[#e8eef5] bg-white text-[#718096]"
            />
            <q-btn
              flat
              round
              dense
              icon="settings"
              class="border border-[#e8eef5] bg-white text-[#718096]"
            />
          </div>
        </div>

        <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="item in kpiCards"
            :key="item.label"
            class="rounded-xl border border-[#e8eef5] bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div class="mb-4 flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-[#718096]">{{ item.label }}</p>
                <h2 class="mt-1 text-4xl font-bold text-[#1a202c]">{{ item.value }}</h2>
              </div>
              <div class="rounded-lg p-2.5 text-white" :class="item.badgeClass">
                <q-icon :name="item.icon" size="20px" />
              </div>
            </div>

            <div class="flex items-center gap-2 text-sm">
              <q-icon
                :name="item.trend >= 0 ? 'trending_up' : 'trending_down'"
                :class="item.trend >= 0 ? 'text-[#00aa44]' : 'text-[#ff4444]'"
              />
              <span
                class="font-semibold"
                :class="item.trend >= 0 ? 'text-[#00aa44]' : 'text-[#ff4444]'"
              >
                {{ Math.abs(item.trend) }}%
              </span>
              <span class="text-[#718096]">vs last month</span>
            </div>
          </article>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section class="rounded-xl border border-[#e8eef5] bg-white p-5 shadow-sm xl:col-span-2">
          <h3 class="text-2xl font-bold text-[#1a202c]">Revenue & Expense Analysis</h3>
          <p class="mt-1 text-sm text-[#718096]">Monthly performance comparison</p>

          <div class="mt-6 rounded-lg border border-dashed border-[#e8eef5] p-4">
            <div class="relative h-[280px]">
              <svg
                class="absolute inset-0 h-full w-full"
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
                  class="flex min-w-[48px] flex-1 flex-col items-center gap-2"
                >
                  <div class="flex h-[220px] items-end gap-1.5">
                    <div
                      class="w-3 rounded-t-md bg-[#0066ff] md:w-4"
                      :style="{ height: `${barHeight(row.revenue)}px` }"
                    />
                    <div
                      class="w-3 rounded-t-md bg-[#ff9900] md:w-4"
                      :style="{ height: `${barHeight(row.expense)}px` }"
                    />
                  </div>
                  <span class="text-xs text-[#718096]">{{ row.month }}</span>
                </div>
              </div>
            </div>

    <!-- Error Alert -->
    <q-banner v-if="error" class="bg-red-1 text-red-9 q-mb-lg">
      <template #avatar>
        <q-icon name="error" />
      </template>
      {{ error.message }}
    </q-banner>

    <!-- Loading State -->
    <div v-if="isLoading && !stats" class="loading-container">
      <q-spinner color="primary" size="40px" />
      <p>Loading dashboard data...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Stats Section -->
      <section class="dashboard-section">
        <h2 class="section-title">Financial Overview</h2>
        <DashboardStats :stats="stats" :is-loading="isLoading" />
      </section>

      <!-- Metrics Section -->
      <section class="dashboard-section">
        <h2 class="section-title">Key Metrics</h2>
        <DashboardMetrics :metrics="metrics" :is-loading="isLoading" @refresh="handleRefresh" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

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

const isRefreshing = ref(false);

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

const distributionData = [
  { name: '0-30 days', value: 45, color: '#0066ff' },
  { name: '31-60 days', value: 28, color: '#00aa44' },
  { name: '61-90 days', value: 18, color: '#ff9900' },
  { name: '90+ days', value: 9, color: '#ff4444' },
];

const customers = [
  { name: 'PT Maju Konsultasi', amount: 625000, percentage: 22 },
  { name: 'CV Berhadiah Timur', amount: 585000, percentage: 18 },
  { name: 'PT Sinar Maju', amount: 540000, percentage: 15 },
  { name: 'Koperasi Merdeka', amount: 480000, percentage: 14 },
  { name: 'PT Graha Raya', amount: 420000, percentage: 12 },
];

const kpiCards = [
  {
    label: 'Total Revenue',
    value: 'Rp 4.2M',
    trend: 8.5,
    icon: 'north_east',
    badgeClass: 'bg-[#0066ff]',
  },
  {
    label: 'Total Expense',
    value: 'Rp 1.8M',
    trend: -1.5,
    icon: 'south_west',
    badgeClass: 'bg-[#ff9900]',
  },
  {
    label: 'Net Profit',
    value: 'Rp 8.9M',
    trend: 12.7,
    icon: 'trending_up',
    badgeClass: 'bg-[#00aa44]',
  },
  {
    label: 'Growth Rate',
    value: 'Rp 2.3M',
    trend: 15.2,
    icon: 'bar_chart',
    badgeClass: 'bg-[#9966ff]',
  },
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

const handleRefresh = () => {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
  }, 900);
};
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: bold;
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.header-content {
  flex: 1;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.dashboard-section {
  animation: slideIn 0.3s ease-out;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    margin-top: 16px;
    color: #666;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;

    h1 {
      font-size: 24px;
    }
  }
}
</style>

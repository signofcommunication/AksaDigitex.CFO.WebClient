<template>
  <div class="dashboard-stats">
    <div v-if="stats" class="row q-col-gutter-lg">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-lg text-center">
            <div class="text-caption text-grey-8 text-uppercase text-weight-medium q-mb-sm">
              Total Revenue
            </div>
            <div class="text-h4 text-weight-bold text-dark q-mb-md">
              {{ formatCurrency(stats.totalRevenue) }}
            </div>
            <div
              :class="[
                'row items-center justify-center text-weight-medium',
                stats.percentageChange >= 0 ? 'text-positive' : 'text-negative',
              ]"
            >
              <q-icon
                :name="stats.percentageChange >= 0 ? 'trending_up' : 'trending_down'"
                size="sm"
                class="q-mr-xs"
              />
              {{ Math.abs(stats.percentageChange) }}%
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-lg text-center">
            <div class="text-caption text-grey-8 text-uppercase text-weight-medium q-mb-sm">
              Total Expenses
            </div>
            <div class="text-h4 text-weight-bold text-dark q-mb-md">
              {{ formatCurrency(stats.totalExpenses) }}
            </div>
            <div class="row items-center justify-center text-weight-medium text-grey-7">
              <q-icon name="account_balance_wallet" size="sm" class="q-mr-xs" />
              IDR
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-lg text-center">
            <div class="text-caption text-grey-8 text-uppercase text-weight-medium q-mb-sm">
              Net Profit
            </div>
            <div class="text-h4 text-weight-bold text-dark q-mb-md">
              {{ formatCurrency(stats.netProfit) }}
            </div>
            <div class="row items-center justify-center text-weight-medium text-positive">
              <q-icon name="trending_up" size="sm" class="q-mr-xs" />
              {{ profitPercentage }}% Margin
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else class="row q-col-gutter-lg">
      <div class="col-12 col-md-4">
        <q-skeleton type="rect" height="150px" />
      </div>
      <div class="col-12 col-md-4">
        <q-skeleton type="rect" height="150px" />
      </div>
      <div class="col-12 col-md-4">
        <q-skeleton type="rect" height="150px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStats } from '../types';
import { formatCurrency } from '@/shared/utils';

interface Props {
  stats?: DashboardStats | undefined;
  isLoading?: boolean | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const profitPercentage = computed(() => {
  // Calculate profit margin percentage based on stats if available
  if (props.stats?.totalRevenue && props.stats?.netProfit) {
    return ((props.stats.netProfit / props.stats.totalRevenue) * 100).toFixed(1);
  }
  return 32.5;
});
</script>

<style scoped lang="scss">
.dashboard-stats {
  width: 100%;
}

.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}
</style>

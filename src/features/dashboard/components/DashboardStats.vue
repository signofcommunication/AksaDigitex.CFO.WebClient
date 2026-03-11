<template>
  <div class="dashboard-stats">
    <div v-if="stats" class="stats-grid">
      <q-card class="glass-card stat-card shadow-10">
        <q-card-section>
          <div class="stat-content">
            <div class="stat-label text-grey-4">Total Revenue</div>
            <div class="stat-value text-white">{{ formatCurrency(stats.totalRevenue) }}</div>
            <div
              :class="[
                'stat-change',
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
          </div>
        </q-card-section>
      </q-card>

      <q-card class="glass-card stat-card shadow-10">
        <q-card-section>
          <div class="stat-content">
            <div class="stat-label text-grey-4">Total Expenses</div>
            <div class="stat-value text-white">{{ formatCurrency(stats.totalExpenses) }}</div>
            <div class="stat-change text-grey-5">
              <q-icon name="account_balance_wallet" size="sm" class="q-mr-xs" />
              IDR
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="glass-card stat-card shadow-10">
        <q-card-section>
          <div class="stat-content">
            <div class="stat-label text-grey-4">Net Profit</div>
            <div class="stat-value text-white">{{ formatCurrency(stats.netProfit) }}</div>
            <div class="stat-change text-positive">
              <q-icon name="trending_up" size="sm" class="q-mr-xs" />
              {{ profitPercentage }}% Margin
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="stats-skeleton">
      <q-skeleton type="rect" height="120px" class="glass-skeleton" dark />
      <q-skeleton type="rect" height="120px" class="glass-skeleton" dark />
      <q-skeleton type="rect" height="120px" class="glass-skeleton" dark />
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.glass-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    opacity: 0.5;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
    background: rgba(30, 41, 59, 0.5);
    border-color: rgba(255, 255, 255, 0.15);
  }
}

.stat-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  margin: 4px 0 16px 0;
  font-family: 'Inter', sans-serif;
  letter-spacing: -1px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.stat-change {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.2);
}

.stats-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.glass-skeleton {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.02);
}
</style>

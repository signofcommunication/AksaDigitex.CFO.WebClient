<template>
  <div class="dashboard-stats">
    <div v-if="stats" class="stats-grid">
      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-content">
            <div class="stat-label">Total Revenue</div>
            <div class="stat-value">{{ formatCurrency(stats.totalRevenue) }}</div>
            <div :class="['stat-change', stats.percentageChange >= 0 ? 'positive' : 'negative']">
              {{ stats.percentageChange >= 0 ? '+' : '' }}{{ stats.percentageChange }}%
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-content">
            <div class="stat-label">Total Expenses</div>
            <div class="stat-value">{{ formatCurrency(stats.totalExpenses) }}</div>
            <div class="stat-change neutral">IDR</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-content">
            <div class="stat-label">Net Profit</div>
            <div class="stat-value">{{ formatCurrency(stats.netProfit) }}</div>
            <div class="stat-change positive">+{{ profitPercentage }}%</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="stats-skeleton">
      <q-skeleton type="rect" height="100px" class="stat-skeleton" />
      <q-skeleton type="rect" height="100px" class="stat-skeleton" />
      <q-skeleton type="rect" height="100px" class="stat-skeleton" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DashboardStats } from '../types';
import { formatCurrency } from '@/shared/utils';

interface Props {
  stats?: DashboardStats;
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const profitPercentage = computed(() => {
  // Calculate profit margin percentage
  // This is a simple example
  return 32.5;
});
</script>

<style scoped lang="scss">
.dashboard-stats {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.stat-content {
  text-align: center;
  padding: 10px 0;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 10px 0;
  font-family: 'Courier New', monospace;
}

.stat-change {
  font-size: 13px;
  font-weight: 600;

  &.positive {
    color: #10b981;
  }

  &.negative {
    color: #ef4444;
  }

  &.neutral {
    color: #6b7280;
  }
}

.stats-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-skeleton {
  border-radius: 8px;
}
</style>

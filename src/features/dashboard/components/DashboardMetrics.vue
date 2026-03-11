<template>
  <div class="dashboard-metrics">
    <q-card class="glass-card shadow-10">
      <q-card-section class="metrics-header q-pb-none">
        <div class="header-title text-white">Detailed Metrics</div>
        <q-btn
          flat
          dense
          icon="refresh"
          color="grey-4"
          class="glass-btn-icon"
          @click="$emit('refresh')"
        />
      </q-card-section>

      <q-separator dark class="q-my-md opacity-20" />

      <q-card-section v-if="metrics && metrics.length > 0" class="metrics-list q-pt-none">
        <div v-for="metric in metrics" :key="metric.id" class="metric-row">
          <div class="metric-left">
            <div class="metric-label text-grey-4">{{ metric.label }}</div>
            <div class="metric-value text-white">
              {{ formatNumber(metric.value) }}
              <span class="text-grey-5 text-caption q-ml-xs">{{ metric.unit }}</span>
            </div>
          </div>
          <div v-if="metric.percentageChange" class="metric-right">
            <q-badge
              :color="getTrendColor(metric.trend)"
              text-color="white"
              class="glass-badge shadow-2"
              rounded
              :label="`${metric.percentageChange >= 0 ? '+' : ''}${metric.percentageChange}%`"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section v-else class="empty-state">
        <q-icon name="insights" size="48px" color="grey-6" class="q-mb-sm opacity-50" />
        <p class="text-grey-5">No metrics available</p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import type { DashboardMetric } from '../types';
import { formatNumber } from '@/shared/utils';

interface Props {
  metrics?: DashboardMetric[] | undefined;
  isLoading?: boolean | undefined;
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
});

defineEmits<{
  refresh: [];
}>();

const getTrendColor = (trend?: string) => {
  switch (trend) {
    case 'up':
      return 'positive'; // Emerald Green
    case 'down':
      return 'negative'; // Ruby Red
    default:
      return 'primary';
  }
};
</script>

<style scoped lang="scss">
.dashboard-metrics {
  width: 100%;
}

.glass-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: rgba(30, 41, 59, 0.5);
    border-color: rgba(255, 255, 255, 0.15);
  }
}

.metrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.glass-btn-icon {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: rotate(90deg);
  }
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }
}

.metric-left {
  flex: 1;
}

.metric-label {
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 20px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.5px;
}

.metric-right {
  display: flex;
  align-items: center;
}

.glass-badge {
  font-size: 13px !important;
  font-weight: 600;
  padding: 6px 12px !important;
  backdrop-filter: blur(4px);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.opacity-20 {
  opacity: 0.2;
}
.opacity-50 {
  opacity: 0.5;
}
</style>

<template>
  <div class="dashboard-metrics">
    <q-card>
      <q-card-section class="metrics-header">
        <div class="header-title">Key Metrics</div>
        <q-btn flat dense icon="refresh" @click="$emit('refresh')" />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="metrics && metrics.length > 0" class="metrics-list">
        <div v-for="metric in metrics" :key="metric.id" class="metric-row">
          <div class="metric-left">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-value">{{ metric.value }} {{ metric.unit }}</div>
          </div>
          <div v-if="metric.percentageChange" class="metric-right">
            <q-badge
              :color="getTrendColor(metric.trend)"
              :label="`${metric.percentageChange >= 0 ? '+' : ''}${metric.percentageChange}%`"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section v-else class="empty-state">
        <p>No metrics available</p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import type { DashboardMetric } from '../types';

interface Props {
  metrics?: DashboardMetric[];
  isLoading?: boolean;
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
      return 'positive';
    case 'down':
      return 'negative';
    default:
      return 'primary';
  }
};
</script>

<style scoped lang="scss">
.dashboard-metrics {
  width: 100%;
}

.metrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.metric-left {
  flex: 1;
}

.metric-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.metric-right {
  display: flex;
  align-items: center;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 20px;
}
</style>

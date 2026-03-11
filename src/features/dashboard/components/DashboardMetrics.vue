<template>
  <div class="dashboard-metrics">
    <q-card flat bordered class="q-pa-sm">
      <q-card-section class="metrics-header q-pb-none row justify-between items-center">
        <div class="text-h6 text-weight-bold">Detailed Metrics</div>
        <q-btn flat dense icon="refresh" color="primary" @click="$emit('refresh')" />
      </q-card-section>

      <q-separator class="q-my-md" />

      <q-card-section v-if="metrics && metrics.length > 0" class="metrics-list q-pt-none">
        <div
          v-for="metric in metrics"
          :key="metric.id"
          class="metric-row row justify-between items-center q-py-sm"
        >
          <div class="metric-left">
            <div class="text-caption text-grey-8 text-uppercase">{{ metric.label }}</div>
            <div class="text-h6 text-weight-medium">
              {{ formatNumber(metric.value) }}
              <span class="text-caption text-grey-6 q-ml-xs">{{ metric.unit }}</span>
            </div>
          </div>
          <div v-if="metric.percentageChange" class="metric-right">
            <q-badge
              :color="getTrendColor(metric.trend)"
              text-color="white"
              rounded
              :label="`${metric.percentageChange >= 0 ? '+' : ''}${metric.percentageChange}%`"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section v-else class="empty-state column items-center justify-center q-pa-xl">
        <q-icon name="insights" size="48px" color="grey-4" class="q-mb-sm" />
        <p class="text-grey-6">No metrics available</p>
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

.metric-row {
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}
</style>

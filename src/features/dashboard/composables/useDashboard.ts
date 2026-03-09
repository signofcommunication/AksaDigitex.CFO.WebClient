/**
 * useDashboard Composable
 * Reusable logic for dashboard feature
 */

import { ref, computed, onMounted } from 'vue';
import type { DashboardData } from '../types';
import { dashboardService } from '../services/dashboardService';

export function useDashboard() {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const dashboardData = ref<DashboardData | null>(null);

  const stats = computed(() => dashboardData.value?.stats);
  const metrics = computed(() => dashboardData.value?.metrics ?? []);

  const fetchDashboardData = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      dashboardData.value = await dashboardService.getDashboardData();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
    } finally {
      isLoading.value = false;
    }
  };

  const refreshData = async () => {
    await fetchDashboardData();
  };

  onMounted(() => {
    fetchDashboardData();
  });

  return {
    // State
    isLoading,
    error,
    dashboardData,

    // Computed
    stats,
    metrics,

    // Methods
    fetchDashboardData,
    refreshData,
  };
}

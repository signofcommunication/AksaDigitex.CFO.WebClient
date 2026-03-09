/**
 * Dashboard Store (Pinia)
 * Centralized state management for dashboard feature
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DashboardData } from '../types';
import { dashboardService } from '../services/dashboardService';

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const data = ref<DashboardData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastFetchedAt = ref<Date | null>(null);

  // Getters (Computed)
  const stats = computed(() => data.value?.stats);
  const metrics = computed(() => data.value?.metrics ?? []);
  const isStale = computed(() => {
    if (!lastFetchedAt.value) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastFetchedAt.value < fiveMinutesAgo;
  });

  // Actions
  const fetchDashboardData = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      data.value = await dashboardService.getDashboardData();
      lastFetchedAt.value = new Date();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const resetData = () => {
    data.value = null;
    error.value = null;
    lastFetchedAt.value = null;
  };

  return {
    // State
    data,
    isLoading,
    error,
    lastFetchedAt,

    // Getters
    stats,
    metrics,
    isStale,

    // Actions
    fetchDashboardData,
    resetData,
  };
});

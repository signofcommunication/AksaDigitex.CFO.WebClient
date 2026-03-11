<template>
  <div class="dashboard-page q-pa-md">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none text-dark">Dashboard</h1>
        <p class="text-subtitle1 text-grey-7 q-mt-xs q-mb-none">Welcome back to AksaDigitex CFO</p>
      </div>
      <q-btn
        color="primary"
        icon="refresh"
        label="Refresh Data"
        :loading="isLoading"
        @click="handleRefresh"
      >
        <template v-slot:loading>
          <q-spinner-dots class="on-left" />
          Refreshing...
        </template>
      </q-btn>
    </div>

    <!-- Error Alert -->
    <q-banner v-if="error" class="bg-red-1 text-red-9 q-mb-lg rounded-borders">
      <template #avatar>
        <q-icon name="error" color="red" />
      </template>
      {{ error.message }}
    </q-banner>

    <!-- Loading State -->
    <div v-if="isLoading && !stats" class="column items-center justify-center q-pa-xl">
      <q-spinner color="primary" size="3em" :thickness="3" />
      <div class="text-grey-7 q-mt-md">Loading dashboard data...</div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Stats Section -->
      <section class="q-mb-xl">
        <h2 class="text-h6 text-weight-bold text-dark q-mb-md">Financial Overview</h2>
        <DashboardStats :stats="stats" :is-loading="isLoading" />
      </section>

      <!-- Metrics Section -->
      <section>
        <h2 class="text-h6 text-weight-bold text-dark q-mb-md">Key Metrics</h2>
        <DashboardMetrics :metrics="metrics" :is-loading="isLoading" @refresh="handleRefresh" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboard } from '../composables/useDashboard';
import DashboardStats from '../components/DashboardStats.vue';
import DashboardMetrics from '../components/DashboardMetrics.vue';

const { stats, metrics, error, isLoading, refreshData } = useDashboard();

const handleRefresh = async () => {
  await refreshData();
};
</script>

<style scoped lang="scss">
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>

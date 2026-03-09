<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Dashboard</h1>
        <p>Welcome back to AksaDigitex CFO</p>
      </div>
      <q-btn
        outline
        color="primary"
        icon="refresh"
        label="Refresh"
        :loading="isLoading"
        @click="handleRefresh"
      />
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

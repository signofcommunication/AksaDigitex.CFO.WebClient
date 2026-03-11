<template>
  <div class="dashboard-page relative-position">
    <!-- Header -->
    <div class="page-header text-white">
      <div class="header-content">
        <h1 class="text-weight-bold">Dashboard</h1>
        <p class="text-grey-4">Welcome back to AksaDigitex CFO</p>
      </div>
      <q-btn
        unelevated
        class="glass-btn"
        text-color="white"
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
    <q-banner v-if="error" class="glass-alert-error text-white q-mb-lg rounded-borders">
      <template #avatar>
        <q-icon name="error" color="red-3" />
      </template>
      {{ error.message }}
    </q-banner>

    <!-- Loading State -->
    <div v-if="isLoading && !stats" class="loading-container text-white">
      <q-spinner-grid color="primary" size="60px" />
      <p class="text-grey-4 text-subtitle1 q-mt-md">Syncing financial data...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Stats Section -->
      <section class="dashboard-section">
        <h2 class="section-title text-white">Financial Overview</h2>
        <DashboardStats :stats="stats" :is-loading="isLoading" />
      </section>

      <!-- Metrics Section -->
      <section class="dashboard-section">
        <h2 class="section-title text-white">Key Metrics</h2>
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
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 50px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;

  h1 {
    margin: 0 0 8px 0;
    font-size: 36px;
    letter-spacing: -0.5px;
  }

  p {
    margin: 0;
    font-size: 16px;
  }
}

.header-content {
  flex: 1;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  height: 48px;
  padding: 0 24px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
}

.glass-alert-error {
  background: rgba(220, 38, 38, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 16px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.dashboard-section {
  animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  letter-spacing: -0.2px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    gap: 20px;

    h1 {
      font-size: 28px;
    }
  }

  .glass-btn {
    width: 100%;
  }
}
</style>

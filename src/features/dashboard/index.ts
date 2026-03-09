/**
 * Dashboard Feature
 * Barrel export for cleaner imports
 */

// Pages
export { default as DashboardPage } from './pages/DashboardPage.vue';

// Components
export { default as DashboardStats } from './components/DashboardStats.vue';
export { default as DashboardMetrics } from './components/DashboardMetrics.vue';

// Composables
export { useDashboard } from './composables/useDashboard';

// Services
export { dashboardService } from './services/dashboardService';

// Stores
export { useDashboardStore } from './stores/dashboardStore';

// Types
export * from './types';

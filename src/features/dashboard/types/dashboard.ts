/**
 * Dashboard Types
 * Type definitions for the dashboard feature
 */

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  percentageChange: number;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  percentageChange?: number;
}

export interface DashboardData {
  stats: DashboardStats;
  metrics: DashboardMetric[];
  lastUpdated: Date;
}

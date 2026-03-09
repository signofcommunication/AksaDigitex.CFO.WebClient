/**
 * Dashboard Service
 * Handles all dashboard-related API calls and business logic
 */

import type { DashboardData } from '../types';

class DashboardService {
  /**
   * Fetch dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/dashboard');
      // return response.data;

      // Mock data untuk development
      return {
        stats: {
          totalRevenue: 125000,
          totalExpenses: 85000,
          netProfit: 40000,
          percentageChange: 15.5,
        },
        metrics: [
          {
            id: 'revenue',
            label: 'Total Revenue',
            value: 125000,
            unit: 'IDR',
            trend: 'up',
            percentageChange: 15.5,
          },
          {
            id: 'expenses',
            label: 'Total Expenses',
            value: 85000,
            unit: 'IDR',
            trend: 'down',
            percentageChange: -5.2,
          },
          {
            id: 'profit',
            label: 'Net Profit',
            value: 40000,
            unit: 'IDR',
            trend: 'up',
            percentageChange: 22.1,
          },
        ],
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboardData(): Promise<DashboardData> {
    return this.getDashboardData();
  }
}

export const dashboardService = new DashboardService();

import type { RouteRecordRaw } from 'vue-router';

// Import layouts
const MainLayout = () => import('@/layouts/MainLayout.vue');
const ErrorNotFound = () => import('@/pages/ErrorNotFound.vue');

// Import features
const DashboardPage = () => import('@/features/dashboard/pages/DashboardPage.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    meta: {
      requiresAuth: false,
    },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage,
        meta: {
          title: 'Dashboard',
          breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Dashboard' }],
        },
      },
      // ============================================
      // Add routes from other features here
      // Example:
      // {
      //   path: 'reports',
      //   name: 'reports',
      //   component: () => import('@/features/reports/pages/ReportsPage.vue'),
      //   meta: {
      //     title: 'Reports',
      //     breadcrumb: [
      //       { label: 'Home', to: '/' },
      //       { label: 'Reports' },
      //     ],
      //   },
      // },
      // ============================================
    ],
  },

  // Error routes - Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: ErrorNotFound,
  },
];

export default routes;

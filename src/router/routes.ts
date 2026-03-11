import type { RouteRecordRaw } from 'vue-router';

// Import layouts
const MainLayout = () => import('@/layouts/MainLayout.vue');
const ErrorNotFound = () => import('@/pages/ErrorNotFound.vue');

// Import features
const DashboardPage = () => import('@/features/dashboard/pages/DashboardPage.vue');

const routes: RouteRecordRaw[] = [
  // Route Login dipisah (Fullscreen, tanpa Sidebar/Header)
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: {
      title: 'Login',
    },
  },

  // Route Utama yang pakai MainLayout
  {
    path: '/',
    component: MainLayout,
    meta: {
      requiresAuth: true, // Biasanya dashboard butuh auth
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
      // Tambah route features lain di sini
    ],
  },

  // Error routes - Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: ErrorNotFound,
  },
];

export default routes;

import type { RouteRecordRaw } from 'vue-router';

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: string;
  to?: string;
  expanded?: boolean;
  forceActive?: boolean;
  children?: SidebarMenuItem[];
}

// Import layouts
const MainLayout = () => import('@/layouts/MainLayout.vue');
const ErrorNotFound = () => import('@/pages/ErrorNotFound.vue');

// Import features
const DashboardPage = () => import('@/features/dashboard/pages/DashboardPage.vue');
const BlankLayout = () => import('@/layouts/BlankLayout.vue');

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: {
          title: 'Login',
        },
      },
    ],
  },
  {
    path: '/',
    component: MainLayout,
    meta: {
      requiresAuth: false,
      menu: [
        {
          key: 'home',
          label: 'Home',
          icon: 'home',
          to: '/',
        },
        {
          key: 'master-pages',
          label: 'Master Pages',
          icon: 'folder',
          expanded: true,
          forceActive: true,
          children: [
            { key: 'laporan-keuangan', label: 'Laporan Keuangan', icon: 'assessment' },
            { key: 'piutan-utang', label: 'Piutang & Utang', icon: 'receipt_long' },
            { key: 'sales-order', label: 'Sales Order', icon: 'shopping_cart' },
          ],
        },
        {
          key: 'logout',
          label: 'Logout',
          icon: 'logout',
          to: '/login',
        },
        // {
        //   key: 'log',
        //   label: 'Log',
        //   icon: 'menu',
        //   expanded: true,
        //   children: [{ key: 'interface-log', label: 'Interface Log', icon: 'history' }],
        // },
        {
          key: 'settings',
          label: 'Settings',
          icon: 'person',
          expanded: true,
          children: [{ key: 'users', label: 'Users', icon: 'manage_accounts' }],
        },
      ] as SidebarMenuItem[],
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

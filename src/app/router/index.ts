import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import AuthLayout from '@/app/layouts/AuthLayout.vue';
import LoginView from '@/features/auth/views/LoginView.vue';
import RegisterCompanyView from '@/features/auth/views/RegisterCompanyView.vue';
import InventoryView from '@/features/inventory/views/InventoryView.vue';
import { appStore } from '@/stores/app.store';

declare module 'vue-router' {
  interface RouteMeta {
    guestOnly?: boolean;
    requiresAuth?: boolean;
    title?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'login' },
  },
  {
    path: '/',
    component: AuthLayout,
    meta: {
      guestOnly: true,
    },
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginView,
        meta: {
          title: 'Iniciar Sesion',
        },
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterCompanyView,
        meta: {
          title: 'Registrar Empresa',
        },
      },
    ],
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryView,
    meta: {
      requiresAuth: true,
      title: 'Inventario',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'login' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isAuthenticated = appStore.isAuthenticated.value;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      name: 'login',
      query: typeof to.fullPath === 'string' && to.fullPath !== '/login'
        ? { redirect: to.fullPath }
        : {},
    };
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'inventory' };
  }

  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | FlowDesk` : 'FlowDesk';
});

export default router;

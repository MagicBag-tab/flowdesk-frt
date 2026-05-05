import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import AuthLayout from '@/app/layouts/AuthLayout.vue';
import MainLayout from '@/app/layouts/MainLayout.vue';
import LoginView from '@/features/auth/views/LoginView.vue';
import RegisterCompanyView from '@/features/auth/views/RegisterCompanyView.vue';
import InventoryView from '@/features/inventory/views/InventoryView.vue';
import SuperAdminView from '@/features/roles/views/SuperAdminView.vue';
import { appStore } from '@/stores/app.store';
import { resolveHomeByRole } from '@/utils/roles';
import InventoryMovementView from '@/features/inventorymovement/views/InventoryMovementView.vue';


declare module 'vue-router' {
  interface RouteMeta {
    guestOnly?: boolean;
    requiresAuth?: boolean;
    requiresRole?: string[];
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
    path: '/',
    name: 'MainLayout',
    component: MainLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "inventory",
        name: "inventory",
        component: InventoryView,
        meta: {
          title: "Inventario",
        },
      },
      {
        path: "inventorymovement",
        name: "inventorymovement",
        component: InventoryMovementView,
        meta: {
          title: "Movimiento de Inventario",
        }
      }
      //Se agregan nuevas features al menú principal aquí, como movimiento, análisis, clientes, etc.
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'login' },
  },
  {
    path: '/superAdmin',
    name: 'superAdmin',
    component: SuperAdminView,
    meta: {
      //requiresAuth: true, roles: ['superAdmin'],
      title: 'SuperAdmin',
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

//comprobación que se tenga el rol correcto 
function hasRequiredRole(userRole: string | null, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}


router.beforeEach((to) => {
  const isAuthenticated = appStore.isAuthenticated.value;
  const role = appStore.roleName.value;

  // if (to.meta.requiresAuth && !isAuthenticated) {
  //   return {
  //     name: 'login',
  //     query: typeof to.fullPath === 'string' && to.fullPath !== '/login'
  //       ? { redirect: to.fullPath }
  //       : {},
  //   };
  // }

  if (to.meta.guestOnly && isAuthenticated) {
    return resolveHomeByRole(role);
  }

  if (to.meta.requiresRole && !hasRequiredRole(role, to.meta.requiresRole)){
    return resolveHomeByRole(role);
  }

  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | FlowDesk` : 'FlowDesk';
});

export default router;

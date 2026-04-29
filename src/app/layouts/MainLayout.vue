<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="sidebar__brand">
        <img src="../../logo/logo.png" alt="FlowDesk" class="sidebar__logo" />
      </div>

      <nav class="sidebar__nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="sidebar__link"
          active-class="sidebar__link--active"
        >
          <span class="sidebar__icon" v-html="item.icon" />
          <span class="sidebar__label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button class="sidebar__logout" type="button" @click="cerrarSesion">
        <span class="sidebar__icon" v-html="iconLogout" />
        <span class="sidebar__label">Cerrar sesión</span>
      </button>
    </aside>

    <main class="main-layout__content">
      <RouterView />
    </main>

  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { appStore } from '@/stores/app.store';

const router = useRouter();

const navItems = [
  {
    name: 'inventory',
    label: 'Inventario',
    to: { name: 'inventory' },
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>`,
  },
];

const iconLogout = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
  <polyline points="16 17 21 12 16 7"/>
  <line x1="21" y1="12" x2="9" y2="12"/>
</svg>`;

async function cerrarSesion(): Promise<void> {
  appStore.clearSession();
  await router.push({ name: 'login' });
}
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg-app);
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-structure-base);
  display: flex;
  flex-direction: column;
  padding: 0 0 24px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar__brand {
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 12px;
}

.sidebar__logo {
  width: 140px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
  flex: 1;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.sidebar__link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.sidebar__link--active {
  background: rgba(255, 255, 255, 0.13);
  color: #fff;
  font-weight: 600;
}

.sidebar__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.sidebar__logout {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 22px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.15s;
  margin-top: auto;
}

.sidebar__logout:hover {
  color: rgba(255, 255, 255, 0.8);
}

.main-layout__content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}
</style>
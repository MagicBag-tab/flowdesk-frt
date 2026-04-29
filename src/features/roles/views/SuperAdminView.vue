<template>
  <div class="superAdmin-page">
    <div class="page-header-bar">
      <h1 class="page-title">Manejo de cuentas</h1>
      <button class="btn-logout" type="button" @click="cerrarSesion">Cerrar sesión</button>
    </div>

    <div class="filter">
      <button :class="['btn', active === 'negocios' ? 'activo' : '']" @click="active = 'negocios'">Negocios</button>
      <button :class="['btn', active === 'usuarios' ? 'activo' : '']" @click="active = 'usuarios'">Usuarios</button>
    </div>

    <div class="display">
      <div v-if="active === 'negocios'" class="list">
        <p class="section-label">{{ negocios.length }} negocios registrados</p>
        <div
          v-for="negocio in negocios"
          :key="negocio.id"
          class="item"
        >
          <div>
            <div class="item-name">{{ negocio.nombre }}</div>
          </div>
          <span class="arrow">&gt</span>
        </div>
      </div>

      <div v-if="active === 'usuarios'" class="list">
        <p class="section-label">{{ usuarios.length }} usuarios registrados</p>
        <div
          v-for="usuario in usuarios"
          :key="usuario.id"
          class="item"
        >
          <div>
            <div class="item-name">{{ usuario.nombre }}</div>
            <div class="item-sub">
              <span class="dot"></span>{{ usuario.email }}
            </div>
          </div>
          <span :class="['badge', usuario.rol === 'admin' ? 'badge-admin' : 'badge-emp']">
            {{ usuario.rol === 'admin' ? 'Admin' : 'Empleado' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { appStore } from '@/stores/app.store';


const router = useRouter();

const active = ref<'negocios' | 'usuarios'> ('negocios');
const negocios = ref([
    {id: 1, nombre: 'Negocio 1'}, 
    {id: 2, nombre: 'Negocio 2'},
]);

const usuarios = ref([
  { id: 1, nombre: 'Usuario 1', email: 'usuario1@empresa.com', rol: 'admin' },
  { id: 2, nombre: 'Usuario 2', email: 'usuario2@empresa.com', rol: 'empleado' },
  { id: 3, nombre: 'Usuario 3', email: 'usuario3@empresa.com', rol: 'empleado' },
  { id: 4, nombre: 'Usuario 4', email: 'usuario4@empresa.com', rol: 'admin' },
]);

async function cerrarSesion(): Promise<void> {
  appStore.clearSession();
  await router.push({ name: 'login' });
}
</script>

<style scoped>
.superAdmin-page {
  font-family: var(--font-sans);
  background: var(--color-bg-app);
  min-height: 100vh;
  padding: 24px 28px;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
}

.page-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-structure-base);
  margin: 0;
}

.btn-logout {
  padding: 8px 14px;
  border: 1.5px solid var(--color-accent);
  border-radius: 8px;
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.filter {
  display: inline-flex;
  gap: 5px;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 24px;
  border-radius: 8px;
  border: 1.5px solid var(--color-bg-border);
  background: var(--color-bg-surface);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font-sans);
}

.btn.activo {
  border-color: var(--color-warning);
  background: var(--color-warning-bg);
  color: #E65100;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.item:hover {
  border-color: var(--color-structure-hover);
  box-shadow: var(--shadow-card);
}

.item-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-structure-base);
}

.item-sub {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  margin-top: 2px;
  display: flex;
  align-items: center;
}

.arrow {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  font-weight: 700;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success);
  margin-right: 5px;
  display: inline-block;
  flex-shrink: 0;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}

.badge-admin {
  background: var(--color-structure-subtle);
  color: var(--color-structure-hover);
  border: 1px solid var(--color-info-border);
}

.badge-emp {
  background: var(--color-pop-honey);
  color: #B37400;
  border: 1px solid var(--color-warning-border);
}
</style>
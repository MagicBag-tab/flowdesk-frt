<template>
  <div class="employees-page">
    <div class="page-header-bar">
      <h1 class="page-title">Empleados</h1>
      <button class="btn-add" type="button" @click="showAddModal = true">
        + Agregar empleado
      </button>
    </div>

    <div v-if="successMsg" class="alert alert-success" style="margin-bottom:16px;">
      <span>{{ successMsg }}</span>
      <button class="alert-close" @click="successMsg = ''">✕</button>
    </div>

    <div class="table-container">
      <div v-if="isLoading" class="table-empty">Cargando empleados…</div>
      <div v-else-if="loadError" class="table-empty table-empty--error">{{ loadError }}</div>
      <table v-else class="emp-table">
        <thead>
          <tr>
            <th>Nombre de usuario</th>
            <th>Correo electrónico</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Miembro desde</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in empleados" :key="u.id">
            <td class="td-name">{{ u.username }}</td>
            <td class="td-email">{{ u.email }}</td>
            <td>
              <span :class="['role-badge', roleBadgeClass(u.role_name)]">
                {{ u.role_name }}
              </span>
            </td>
            <td>
              <span :class="['status-wrap', u.is_active ? 'status-wrap--active' : 'status-wrap--inactive']">
                <span class="status-dot"></span>
                {{ u.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="td-date">{{ formatDate(u.created_at) }}</td>
          </tr>
          <tr v-if="empleados.length === 0 && !isLoading">
            <td colspan="5" class="table-empty">No hay empleados registrados aún.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading && empleados.length > 0" class="summary-bar">
      <span class="summary-item">
        <strong>{{ empleados.length }}</strong> empleados en total
      </span>
      <span class="summary-item summary-item--active">
        <strong>{{ activeCount }}</strong> activos
      </span>
      <span class="summary-item summary-item--inactive">
        <strong>{{ inactiveCount }}</strong> inactivos
      </span>
    </div>

    <AddEmployeeModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @created="onEmployeeCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchUsers, type UserResponse } from '@/features/roles/api';
import AddEmployeeModal from '@/features/roles/components/AddEmployeeModal.vue';

const empleados = ref<UserResponse[]>([]);
const isLoading = ref(false);
const loadError = ref('');
const showAddModal = ref(false);
const successMsg = ref('');

const activeCount = computed(() => empleados.value.filter(e => e.is_active).length);
const inactiveCount = computed(() => empleados.value.filter(e => !e.is_active).length);

async function loadEmpleados() {
  isLoading.value = true;
  loadError.value = '';
  try {
    empleados.value = await fetchUsers();
  } catch {
    loadError.value = 'No se pudieron cargar los empleados. Intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadEmpleados);

async function onEmployeeCreated() {
  showAddModal.value = false;
  successMsg.value = 'Empleado agregado. Se envió una invitación por correo.';
  await loadEmpleados();
  setTimeout(() => { successMsg.value = ''; }, 5000);
}

function roleBadgeClass(role: string): string {
  if (role === 'admin') return 'role-badge--admin';
  if (role === 'manager') return 'role-badge--manager';
  return 'role-badge--emp';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.employees-page {
  font-family: var(--font-sans);
  padding: 32px 36px;
  min-height: 100vh;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.page-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}
.btn-add {
  padding: 9px 18px;
  background: var(--color-structure-base);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: filter 0.14s;
}
.btn-add:hover { filter: brightness(1.2); }

.table-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}
.emp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.emp-table thead tr { background: var(--color-structure-base); }
.emp-table th {
  padding: 13px 20px;
  text-align: left;
  font-weight: 700;
  color: #f0f4f9;
  font-size: 0.82rem;
}
.emp-table tbody tr {
  border-bottom: 1px solid #f0f4f9;
  transition: background 0.12s;
}
.emp-table tbody tr:last-child { border-bottom: none; }
.emp-table tbody tr:hover { background: #f8fafc; }
.emp-table td {
  padding: 13px 20px;
  vertical-align: middle;
  color: var(--color-text-secondary);
}
.td-name { font-weight: 600; color: var(--color-structure-base); }
.td-email { font-size: 0.83rem; color: var(--color-text-muted); }
.td-date { font-size: 0.8rem; color: var(--color-text-muted); white-space: nowrap; }
.table-empty {
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}
.table-empty--error { color: #c03a3a; }

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}
.role-badge--admin   { background: var(--color-structure-subtle); color: var(--color-structure-hover); border: 1px solid var(--color-info-border); }
.role-badge--manager { background: var(--color-info-bg); color: #1565c0; border: 1px solid var(--color-info-border); }
.role-badge--emp     { background: var(--color-pop-honey); color: #B37400; border: 1px solid var(--color-warning-border); }

.status-wrap {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-wrap--active  { color: #2e7d32; }
.status-wrap--inactive { color: #b0bbd4; }
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-wrap--active  .status-dot { background: #4caf50; }
.status-wrap--inactive .status-dot { background: #b0bbd4; }

.summary-bar {
  display: flex;
  gap: 20px;
  padding: 12px 20px;
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.summary-item strong { font-weight: 700; color: var(--color-text); }
.summary-item--active strong { color: #2e7d32; }
.summary-item--inactive strong { color: #b0bbd4; }
</style>
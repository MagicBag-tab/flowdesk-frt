<template>
  <div class="superAdmin-page">
    <div class="page-header-bar">
      <h1 class="page-title">Manejo de cuentas</h1>
      <button v-if="active === 'usuarios'" class="btn-add" type="button" @click="showAddModal = true">
        + Agregar cuenta
      </button>
    </div>

    <div v-if="successMsg" class="alert alert-success" style="margin-bottom:16px;">
      <span>{{ successMsg }}</span>
      <button class="alert-close" type="button" @click="successMsg = ''">✕</button>
    </div>

    <div class="filter">
      <button :class="['btn', active === 'negocios' ? 'activo' : '']" @click="active = 'negocios'">Negocios</button>
      <button :class="['btn', active === 'usuarios' ? 'activo' : '']" @click="active = 'usuarios'">Usuarios</button>
    </div>

    <div class="display">
      <div v-if="active === 'negocios'" class="list">
        <p class="section-label">{{ negocios.length }} negocios registrados</p>
        <div v-for="negocio in negocios" :key="negocio.id" class="item">
          <div class="item-name">{{ negocio.nombre }}</div>
          <span class="arrow">&gt;</span>
        </div>
      </div>

      <div v-if="active === 'usuarios'">
        <p class="section-label">{{ usuarios.length }} usuarios registrados</p>
        <div class="table-container">
          <div v-if="isLoading" class="table-empty">Cargando empleados…</div>
          <div v-else-if="loadError" class="table-empty table-empty--error">{{ loadError }}</div>
          <table v-else class="emp-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuarios" :key="u.id">
                <td class="td-name">{{ u.username }}</td>
                <td class="td-email">{{ u.email }}</td>
                <td>
                  <span :class="['role-badge', roleBadgeClass(u.role_name)]">{{ u.role_name }}</span>
                </td>
                <td>
                  <span :class="['status-dot-wrap', u.is_active ? 'status-dot-wrap--active' : 'status-dot-wrap--inactive']">
                    <span class="status-dot"></span>
                    {{ u.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </tr>
              <tr v-if="usuarios.length === 0">
                <td colspan="4" class="table-empty">No hay empleados registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <AddEmployeeModal v-if="showAddModal" @close="showAddModal = false" @created="onEmployeeCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchUsers, type UserResponse } from '@/features/roles/api';
import AddEmployeeModal from '@/features/roles/components/AddEmployeeModal.vue';

const active = ref<'negocios' | 'usuarios'>('negocios');
const showAddModal = ref(false);
const successMsg = ref('');
const negocios = ref([{ id: 1, nombre: 'Negocio 1' }, { id: 2, nombre: 'Negocio 2' }]);
const usuarios = ref<UserResponse[]>([]);
const isLoading = ref(false);
const loadError = ref('');

async function loadUsers() {
  isLoading.value = true; loadError.value = '';
  try { usuarios.value = await fetchUsers(); }
  catch { loadError.value = 'No se pudieron cargar los empleados.'; }
  finally { isLoading.value = false; }
}

onMounted(loadUsers);

async function onEmployeeCreated() {
  successMsg.value = 'Empleado creado. Se envió un correo de invitación.';
  await loadUsers();
  setTimeout(() => { successMsg.value = ''; }, 5000);
}

function roleBadgeClass(role: string) {
  if (role === 'admin') return 'role-badge--admin';
  if (role === 'manager') return 'role-badge--manager';
  return 'role-badge--emp';
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
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-structure-base);
  margin: 0;
}

.btn-add {
  padding: 9px 18px;
  background: var(--color-structure-base);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: .875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: filter .14s;
}

.btn-add:hover {
  filter: brightness(1.2);
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
  font-size: .9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  font-family: var(--font-sans);
}

.btn.activo {
  border-color: var(--color-warning);
  background: var(--color-warning-bg);
  color: #E65100;
}

.section-label {
  font-size: .72rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: .07em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  transition: all .15s;
}

.item:hover {
  border-color: var(--color-structure-hover);
  box-shadow: var(--shadow-card);
}

.item-name {
  font-size: .92rem;
  font-weight: 600;
  color: var(--color-structure-base);
}

.arrow {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  font-weight: 700;
}

.table-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.emp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .875rem;
}

.emp-table thead tr {
  background: var(--color-structure-base);
}

.emp-table th {
  padding: 13px 20px;
  text-align: left;
  font-weight: 700;
  color: #f0f4f9;
  font-size: .82rem;
}

.emp-table tbody tr {
  border-bottom: 1px solid #f0f4f9;
  transition: background .12s;
}

.emp-table tbody tr:last-child {
  border-bottom: none;
}

.emp-table tbody tr:hover {
  background: #f8fafc;
}

.emp-table td {
  padding: 13px 20px;
  vertical-align: middle;
  color: var(--color-text-secondary);
}

.td-name {
  font-weight: 600;
  color: var(--color-structure-base);
}

.td-email {
  font-size: .83rem;
  color: var(--color-text-muted);
}

.table-empty {
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted);
  font-size: .88rem;
}

.table-empty--error {
  color: #c03a3a;
}

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: .75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.role-badge--admin {
  background: var(--color-structure-subtle);
  color: var(--color-structure-hover);
  border: 1px solid var(--color-info-border);
}

.role-badge--manager {
  background: var(--color-info-bg);
  color: #1565c0;
  border: 1px solid var(--color-info-border);
}

.role-badge--emp {
  background: var(--color-pop-honey);
  color: #B37400;
  border: 1px solid var(--color-warning-border);
}

.status-dot-wrap {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: .8rem;
  font-weight: 600;
}

.status-dot-wrap--active {
  color: #2e7d32;
}

.status-dot-wrap--inactive {
  color: #b0bbd4;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-wrap--active .status-dot {
  background: #4caf50;
}

.status-dot-wrap--inactive .status-dot {
  background: #b0bbd4;
}
</style>
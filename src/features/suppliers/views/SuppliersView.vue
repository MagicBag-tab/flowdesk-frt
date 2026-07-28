<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">Proveedores</h1>
        <p class="page-subtitle">Gestiona el directorio de tus proveedores y contactos</p>
      </div>
      <button class="btn-add" @click="openCreateModal">
        <span class="btn-icon">+</span> Nuevo Proveedor
      </button>
    </header>

    <!-- Barra de Herramientas -->
    <div class="toolbar">
      <div class="search-box">
        <Search class="search-icon" :size="18" />
        <input 
          v-model="searchQuery" 
          type="text" 
          class="search-input" 
          placeholder="Buscar proveedor por nombre..." 
          @input="onSearch"
        />
      </div>
      <div class="filter-box">
        <select v-model="statusFilter" class="filter-select" @change="fetchData">
          <option value="all">Todos los estados</option>
          <option value="active">Solo Activos</option>
          <option value="inactive">Solo Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Contenido de Tabla -->
    <div class="card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando proveedores...</p>
      </div>
      
      <div v-else-if="error" class="error-alert">
        {{ error }}
      </div>

      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th class="actions-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sup in suppliers" :key="sup.id">
              <td class="font-medium">{{ sup.nombre }}</td>
              <td>
                <div class="contact-info">
                  <span v-if="sup.telefono" class="contact-line"><Phone :size="14" class="inline-icon" /> {{ sup.telefono }}</span>
                  <span v-if="sup.correo" class="contact-line"><Mail :size="14" class="inline-icon" /> {{ sup.correo }}</span>
                  <span v-if="!sup.telefono && !sup.correo" class="text-muted">Sin contacto</span>
                </div>
              </td>
              <td>
                <span class="truncate-text" :title="sup.direccion || ''">
                  {{ sup.direccion || '—' }}
                </span>
              </td>
              <td>
                <button 
                  class="status-badge" 
                  :class="sup.is_active ? 'status-active' : 'status-inactive'"
                  @click="toggleStatus(sup)"
                  :disabled="isToggling === sup.id"
                  title="Clic para cambiar estado"
                >
                  {{ isToggling === sup.id ? '...' : (sup.is_active ? 'Activo' : 'Inactivo') }}
                </button>
              </td>
              <td class="actions-col">
                <button class="btn-icon-action" @click="openEditModal(sup)" title="Editar">
                  <Pencil :size="16" />
                </button>
              </td>
            </tr>
            <tr v-if="suppliers.length === 0">
              <td colspan="5" class="empty-state">
                <p>No se encontraron proveedores que coincidan con tu búsqueda.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Placeholder (Paso 3) -->
    <!-- <SupplierModal v-if="showModal" ... /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Phone, Mail, Pencil } from 'lucide-vue-next';
import { fetchSuppliers, toggleSupplierStatus, type Supplier } from '@/features/suppliers/api';
import { getApiErrorMessage } from '@/services/apiClient';

// Estado
const suppliers = ref<Supplier[]>([]);
const isLoading = ref(true);
const error = ref('');
const searchQuery = ref('');
const statusFilter = ref('active'); // Por defecto ver activos (o 'all')
const isToggling = ref<string | null>(null);

// Variables para el buscador con debounce
let searchTimeout: ReturnType<typeof setTimeout>;

async function fetchData() {
  isLoading.value = true;
  error.value = '';
  try {
    const isActiveParam = statusFilter.value === 'all' ? undefined : (statusFilter.value === 'active');
    suppliers.value = await fetchSuppliers(searchQuery.value, isActiveParam);
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    isLoading.value = false;
  }
}

function onSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchData();
  }, 400); // 400ms debounce
}

async function toggleStatus(sup: Supplier) {
  if (isToggling.value) return;
  isToggling.value = sup.id;
  try {
    const updated = await toggleSupplierStatus(sup.id, !sup.is_active);
    sup.is_active = updated.is_active;
  } catch (err) {
    alert('Error al cambiar el estado: ' + getApiErrorMessage(err));
  } finally {
    isToggling.value = null;
  }
}

function openCreateModal() {
  alert('El modal de creación será implementado en el Paso 3.');
}

function openEditModal(sup: Supplier) {
  alert('El modal de edición será implementado en el Paso 3.');
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page-container {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--color-structure-base, #3b82f6);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-structure-base, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-structure-base, #3b82f6);
}

.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: #f8fafc;
  padding: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.95rem;
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.font-medium {
  font-weight: 600;
  color: #0f172a;
}

.text-muted {
  color: #94a3b8;
  font-style: italic;
  font-size: 0.85rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
}

.contact-line {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
}

.inline-icon {
  color: #94a3b8;
}

.truncate-text {
  display: inline-block;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.status-badge:hover:not(:disabled) {
  opacity: 0.8;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #f1f5f9;
  color: #475569;
}

.status-badge:disabled {
  opacity: 0.5;
  cursor: wait;
}

.actions-col {
  text-align: right;
  width: 100px;
}

.btn-icon-action {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon-action:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.loading-state, .empty-state {
  padding: 48px 20px;
  text-align: center;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--color-structure-base, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-alert {
  margin: 20px;
  padding: 16px;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}
</style>

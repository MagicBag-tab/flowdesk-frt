<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">Clientes</h1>
        <p class="page-subtitle">Gestiona el directorio de tus clientes</p>
      </div>
      <button class="btn-add" @click="openCreateModal">
        <span class="btn-icon">+</span> Nuevo Cliente
      </button>
    </header>

    <div v-if="globalError" class="error-alert">
      {{ globalError }}
    </div>

    <div class="split-layout">
      <!-- PANEL IZQUIERDO: MASTER LIST -->
      <aside class="master-panel card">
        <div class="toolbar">
          <div class="search-box">
            <Search class="search-icon" :size="16" />
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Buscar cliente..."
              @input="onSearch"
            />
          </div>
          <div class="filter-box">
            <select v-model="statusFilter" class="filter-select" @change="fetchData">
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
        </div>

        <ul v-else-if="clients.length > 0" class="client-list">
          <li
            v-for="cli in clients"
            :key="cli.id"
            class="client-item"
            :class="{ active: selectedClient?.id === cli.id }"
            @click="selectClient(cli)"
          >
            <div class="client-item-content">
              <div class="client-name">{{ cli.nombre }}</div>
              <div class="client-desc">
                {{ cli.correo || cli.telefono || 'Sin datos de contacto' }}
              </div>
            </div>
          </li>
        </ul>

        <div v-else class="empty-state">
          No hay clientes encontrados.
        </div>
      </aside>

      <main class="detail-panel card">
        <div v-if="!selectedClient" class="empty-detail">
          <Users :size="48" class="empty-icon" />
          <h3>Ningún cliente seleccionado</h3>
          <p>Selecciona un cliente de la lista para ver sus detalles.</p>
        </div>

        <div v-else class="detail-content">
          <div class="detail-header">
            <div>
              <h2 class="detail-name">{{ selectedClient.nombre }}</h2>
              <p class="detail-desc">{{ selectedClient.is_active ? 'Cliente activo' : 'Cliente inactivo' }}</p>
            </div>
            <div class="detail-actions">
              <button class="btn-icon-action" @click="openEditModal(selectedClient)" title="Editar información">
                <Pencil :size="18" /> Editar
              </button>
            </div>
          </div>

            <section class="detail-section">
              <h3 class="section-title">Información de Contacto</h3>
              <div class="contact-card">
                <div class="contact-row">
                  <Phone :size="16" class="contact-icon" />
                  <span>{{ selectedClient.telefono || 'No registrado' }}</span>
                </div>
                <div class="contact-row">
                  <Mail :size="16" class="contact-icon" />
                  <span>{{ selectedClient.correo || 'No registrado' }}</span>
                </div>
                <div class="contact-row">
                  <MapPin :size="16" class="contact-icon" />
                  <span>{{ selectedClient.direccion || 'No registrada' }}</span>
                </div>
              </div>
            </section>

        </div>
      </main>
    </div>

    <!-- Modal -->
    <ClientModal
      v-if="showModal"
      :client="clientToEdit"
      @close="showModal = false"
      @saved="onModalSaved"
      @status-changed="onStatusChanged"
      @deleted="onClientDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Phone, Mail, Pencil, MapPin, Users } from 'lucide-vue-next';
import { fetchClients, type Client } from '@/features/clients/api';
import { getApiErrorMessage } from '@/services/apiClient';
import ClientModal from '@/features/clients/components/ClientModal.vue';

// Estado General
const clients = ref<Client[]>([]);
const isLoading = ref(true);
const globalError = ref('');
const searchQuery = ref('');
const statusFilter = ref('active'); // Por defecto ver activos (o 'all')

// Master-Detail State
const selectedClient = ref<Client | null>(null);

// Variables Modal
const showModal = ref(false);
const clientToEdit = ref<Client | null>(null);

// Buscador
let searchTimeout: ReturnType<typeof setTimeout>;

async function fetchData() {
  isLoading.value = true;
  globalError.value = '';
  try {
    // El backend solo soporta active_only: true (solo activos) o false (todos).
    // Para el filtro "Inactivos" pedimos todos y filtramos en el cliente.
    const activeOnlyParam = statusFilter.value === 'active';
    let results = await fetchClients(searchQuery.value, activeOnlyParam);

    if (statusFilter.value === 'inactive') {
      results = results.filter((c) => !c.is_active);
    }

    clients.value = results;

    // Auto-seleccionar el primero si no hay selección o la selección ya no existe
    if (!selectedClient.value && clients.value.length > 0) {
      selectedClient.value = clients.value[0];
    } else if (selectedClient.value) {
      const stillExists = clients.value.find(c => c.id === selectedClient.value?.id);
      selectedClient.value = stillExists || (clients.value.length > 0 ? clients.value[0] : null);
    }
  } catch (err) {
    globalError.value = getApiErrorMessage(err);
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

function selectClient(cli: Client) {
  selectedClient.value = cli;
}

function openCreateModal() {
  clientToEdit.value = null;
  showModal.value = true;
}

function openEditModal(cli: Client) {
  clientToEdit.value = cli;
  showModal.value = true;
}

function onModalSaved() {
  showModal.value = false;
  fetchData();
}

function onStatusChanged(updated: Client) {
  // Mantiene el modal abierto; solo refresca la lista para respetar el filtro activo.
  clientToEdit.value = updated;
  fetchData();
}

function onClientDeleted() {
  showModal.value = false;
  fetchData();
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page-container {
  padding: 32px;
  max-width: 1300px;
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

.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* Master-Detail Layout */
.split-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: stretch;
}

/* Left Panel */
.master-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 800px;
}

.toolbar {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-structure-base);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.filter-select {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  background: #f8fafc;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
}

.client-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.client-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.client-item:hover {
  background: #f8fafc;
}

.client-item.active {
  background: #eff6ff;
  border-left: 4px solid var(--color-structure-base, #3b82f6);
  padding-left: 12px; /* Compensate border */
}

.client-item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.client-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.95rem;
}

.client-desc {
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.dot-active {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}
.dot-inactive {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
}


/* Right Panel */
.detail-panel {
  padding: 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.detail-desc {
  font-size: 0.95rem;
  color: #64748b;
  margin: 4px 0 0 0;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.btn-icon-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-action:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.detail-section {
  margin-top: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.contact-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid #f1f5f9;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #334155;
  font-size: 0.95rem;
}

.contact-icon {
  color: #94a3b8;
}

.font-medium { font-weight: 600; color: #0f172a; }
.text-success { color: #16a34a; font-weight: 600; }
.text-danger { color: #dc2626; font-weight: 600; }
.flex-align { display: flex; align-items: center; gap: 6px; }
.inline-icon { color: #94a3b8; }
.mt-4 { margin-top: 32px; }

/* Status Badge */
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.status-badge:hover:not(:disabled) { opacity: 0.8; }
.status-active { background: #dcfce7; color: #166534; }
.status-inactive { background: #f1f5f9; color: #475569; }
.status-badge:disabled { opacity: 0.5; cursor: wait; }

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

@keyframes spin { to { transform: rotate(360deg); } }

.error-alert {
  margin-bottom: 20px;
  padding: 16px;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}
</style>

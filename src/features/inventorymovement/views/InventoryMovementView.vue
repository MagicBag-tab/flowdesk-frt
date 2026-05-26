<template>
  <div class="movimiento-page">
    <div class="content-container">
      <div class="table-section">
        <div class="section-header">
          <h1 class="page-title">Movimiento de Inventario</h1>
          <button class="btn-add" type="button" @click="showNewMovement = true">+ Nuevo movimiento</button>
        </div>

        <div v-if="successMsg" class="alert alert-success" style="margin-bottom:14px;">
          <span>{{ successMsg }}</span>
          <button class="alert-close" type="button" @click="successMsg = ''">✕</button>
        </div>

        <div class="table-container">
          <div v-if="isLoading" class="empty-state">Cargando movimientos…</div>
          <div v-else-if="loadError" class="empty-state" style="color:#c03a3a;">{{ loadError }}</div>
          <table v-else class="movimiento-table">
            <thead>
              <tr>
                <th v-if="columnasVisibles.id">ID</th>
                <th v-if="columnasVisibles.fecha">Fecha</th>
                <th v-if="columnasVisibles.producto">Producto</th>
                <th v-if="columnasVisibles.tipo">Tipo</th>
                <th v-if="columnasVisibles.cantidad">Cantidad</th>
                <th v-if="columnasVisibles.motivo">Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mov in movimientosFiltrados" :key="mov.id">
                <td v-if="columnasVisibles.id" class="td-id">{{ mov.id.slice(0,8).toUpperCase() }}</td>
                <td v-if="columnasVisibles.fecha" class="td-fecha">{{ formatFecha(mov.fecha) }}</td>
                <td v-if="columnasVisibles.producto">{{ getProductName(mov.producto_id) }}</td>
                <td v-if="columnasVisibles.tipo">
                  <span class="tipo-badge" :class="isInbound(mov.tipo_movimiento) ? 'tipo-badge--entrada' : 'tipo-badge--salida'">
                    {{ isInbound(mov.tipo_movimiento) ? 'Entrada' : 'Salida' }}
                  </span>
                </td>
                <td v-if="columnasVisibles.cantidad">
                  <span class="cantidad-num" :class="isInbound(mov.tipo_movimiento) ? 'cantidad-num--entrada' : 'cantidad-num--salida'">
                    {{ isInbound(mov.tipo_movimiento) ? '+' : '-' }}{{ mov.cantidad }}
                  </span>
                </td>
                <td v-if="columnasVisibles.motivo" class="td-motivo">{{ mov.motivo ?? '—' }}</td>
              </tr>
              <tr v-if="movimientosFiltrados.length === 0 && !isLoading">
                <td :colspan="columnaCount" class="empty-state">No hay movimientos para los filtros seleccionados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="filtros-panel">
        <p class="filtros-titulo">Filtros</p>
        <p class="filtros-sub">columnas visibles</p>
        <ul class="filtros-list">
          <li v-for="col in todasColumnas" :key="col.key" @click="toggleColumna(col.key)">
            <span class="checkbox" :class="{ checked: columnasVisibles[col.key] }">
              <span v-if="columnasVisibles[col.key]" class="checkbox__check">✓</span>
            </span>
            {{ col.label }}
          </li>
        </ul>
        <div class="filtros-divider" />
        <p class="filtros-sub">Tipo</p>
        <div class="filtros-chips">
          <button v-for="op in opcionesTipo" :key="op.value" class="chip"
            :class="{ 'chip--active': filtroTipo === op.value }" @click="filtroTipo = op.value">
            {{ op.label }}
          </button>
        </div>
        <div class="filtros-divider" />
        <p class="filtros-sub">Rango de fechas</p>
        <div class="fecha-inputs">
          <input type="date" class="filtro-input-fecha" v-model="filtroFechaDesde" />
          <input type="date" class="filtro-input-fecha" v-model="filtroFechaHasta" />
        </div>
        <button class="btn-limpiar" @click="limpiarFiltros">Limpiar filtros</button>
      </aside>
    </div>

    <NewMovementModal
      v-if="showNewMovement"
      :products="products"
      @close="showNewMovement = false"
      @created="onMovementCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchMovements, isInbound, type InventoryMovement } from '@/features/inventorymovement/api';
import { fetchInventoryProducts } from '@/features/inventory/api';
import type { InventoryProduct } from '@/features/inventory/types';
import NewMovementModal from '@/features/inventorymovement/components/NewMovementModal.vue';

const movimientos = ref<InventoryMovement[]>([]);
const products = ref<InventoryProduct[]>([]);
const isLoading = ref(false);
const loadError = ref('');
const showNewMovement = ref(false);
const successMsg = ref('');

async function load() {
  isLoading.value = true; loadError.value = '';
  try {
    const [movs, prods] = await Promise.all([fetchMovements(), fetchInventoryProducts()]);
    movimientos.value = movs;
    products.value = prods;
  } catch {
    loadError.value = 'No se pudieron cargar los movimientos.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);

async function onMovementCreated() {
  successMsg.value = 'Movimiento registrado correctamente.';
  await load();
  setTimeout(() => { successMsg.value = ''; }, 5000);
}

function getProductName(id: string) {
  return products.value.find(p => p.id === id)?.nombre ?? id.slice(0, 8) + '…';
}

function formatFecha(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

const todasColumnas = [
  { key: 'id', label: 'ID' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'producto', label: 'Producto' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'motivo', label: 'Motivo' },
] as const;

type ColumnaKey = (typeof todasColumnas)[number]['key'];
const columnasVisibles = ref<Record<ColumnaKey, boolean>>({
  id: true, fecha: true, producto: true, tipo: true, cantidad: true, motivo: true,
});
function toggleColumna(key: ColumnaKey) { columnasVisibles.value[key] = !columnasVisibles.value[key]; }
const columnaCount = computed(() => Object.values(columnasVisibles.value).filter(Boolean).length);

const filtroTipo = ref<'todos' | 'entrada' | 'salida'>('todos');
const filtroFechaDesde = ref('');
const filtroFechaHasta = ref('');
const opcionesTipo = [
  { value: 'todos' as const, label: 'Todos' },
  { value: 'entrada' as const, label: 'Entrada' },
  { value: 'salida' as const, label: 'Salida' },
];

const movimientosFiltrados = computed(() => movimientos.value.filter(m => {
  if (filtroTipo.value === 'entrada' && !isInbound(m.tipo_movimiento)) return false;
  if (filtroTipo.value === 'salida' && isInbound(m.tipo_movimiento)) return false;
  const f = m.fecha.slice(0, 10);
  if (filtroFechaDesde.value && f < filtroFechaDesde.value) return false;
  if (filtroFechaHasta.value && f > filtroFechaHasta.value) return false;
  return true;
}));

function limpiarFiltros() {
  filtroTipo.value = 'todos';
  filtroFechaDesde.value = '';
  filtroFechaHasta.value = '';
}
</script>

<style scoped>
.movimiento-page {
  padding: 32px 36px;
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--color-text);
}

.content-container {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.table-section {
  flex: 1;
  min-width: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
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

.table-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.movimiento-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .875rem;
}

.movimiento-table thead tr {
  border-bottom: 2px solid #e8eef6;
  background: var(--color-structure-base);
}

.movimiento-table th {
  padding: 14px 20px;
  text-align: left;
  font-weight: 700;
  color: #f0f4f9;
  font-size: .85rem;
}

.movimiento-table tbody tr {
  border-bottom: 1px solid #f0f4f9;
  transition: background .12s;
}

.movimiento-table tbody tr:last-child {
  border-bottom: none;
}

.movimiento-table tbody tr:hover {
  background: #f8fafc;
}

.movimiento-table td {
  padding: 14px 20px;
  vertical-align: middle;
  color: var(--color-text-secondary);
}

.td-id {
  font-size: .78rem;
  color: var(--color-text-muted);
  font-weight: 600;
  font-family: monospace;
}

.td-fecha {
  white-space: nowrap;
  font-size: .82rem;
  color: var(--color-text-muted);
}

.td-motivo {
  font-size: .82rem;
  color: var(--color-text-muted);
  max-width: 220px;
}

.tipo-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: .78rem;
  font-weight: 700;
}

.tipo-badge--entrada {
  background: #e8f5e9;
  color: #2e7d32;
}

.tipo-badge--salida {
  background: #fff3e0;
  color: #e65100;
}

.cantidad-num {
  font-weight: 700;
  font-size: .9rem;
}

.cantidad-num--entrada {
  color: #2e7d32;
}

.cantidad-num--salida {
  color: #e65100;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: var(--color-text-muted);
  font-size: .88rem;
}

.filtros-panel {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding-top: 4px;
}

.filtros-titulo {
  font-weight: 700;
  font-size: .95rem;
  color: var(--color-text);
  margin: 0 0 12px;
}

.filtros-sub {
  font-size: .72rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.filtros-divider {
  border-top: 1px solid #dde3ec;
  margin: 14px 0;
}

.filtros-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.filtros-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 2px;
  border-radius: 6px;
  cursor: pointer;
  font-size: .83rem;
  color: var(--color-text-secondary);
  transition: background .12s;
  user-select: none;
}

.filtros-list li:hover {
  background: rgba(0, 0, 0, .04);
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #b0bbd4;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #fff;
  transition: all .14s;
}

.checkbox.checked {
  background: #4a90d9;
  border-color: #4a90d9;
}

.checkbox__check {
  font-size: .6rem;
  color: #fff;
  line-height: 1;
}

.filtros-chips {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chip {
  padding: 5px 10px;
  border-radius: 99px;
  border: 1.5px solid #dde3ec;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: .8rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all .13s;
  font-family: var(--font-sans);
}

.chip:hover {
  border-color: #b0bbd4;
  background: rgba(0, 0, 0, .04);
}

.chip--active {
  background: var(--color-structure-base);
  border-color: var(--color-structure-base);
  color: #fff;
  font-weight: 600;
}

.fecha-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filtro-input-fecha {
  width: 100%;
  padding: 7px 10px;
  border: 1.5px solid #dde3ec;
  border-radius: 8px;
  font-size: .82rem;
  color: var(--color-text-secondary);
  background: #fff;
  outline: none;
  font-family: var(--font-sans);
  transition: border .13s;
}

.filtro-input-fecha:focus {
  border-color: var(--color-structure-base);
}

.btn-limpiar {
  margin-top: 20px;
  width: 100%;
  padding: 8px 0;
  background: none;
  border: 1.5px solid #dde3ec;
  border-radius: 8px;
  color: var(--color-text-muted);
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all .14s;
}

.btn-limpiar:hover {
  border-color: var(--color-structure-base);
  color: var(--color-structure-base);
  background: var(--color-structure-subtle);
}

@media (max-width: 900px) {
  .content-container {
    flex-direction: column;
  }

  .filtros-panel {
    width: 100%;
  }
}
</style>
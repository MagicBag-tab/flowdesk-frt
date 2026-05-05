<template>
  <div class="inventario-page">

    <div class="content-container">

      <div class="table-section">
        <h1 class="page-title">Inventario</h1>

        <div class="table-container">
          <table class="inventory-table">
            <thead>
              <tr>
                <th v-if="columnasVisibles.id">ID</th>
                <th v-if="columnasVisibles.nombre">Nombre</th>
                <th v-if="columnasVisibles.precio">Precio c/u</th>
                <th v-if="columnasVisibles.cantidad">Cantidad actual</th>
                <th v-if="columnasVisibles.descripcion">Descripción</th>
                <th v-if="columnasVisibles.proveedor">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="producto in productosFiltrados"
                :key="producto.id"
                :class="{
                  'row--inactive': !producto.is_active,
                  'row--low-stock': producto.is_active && producto.cantidad <= producto.stockMinimo,
                }"
              >
                <td v-if="columnasVisibles.id">{{ producto.id }}</td>
                <td v-if="columnasVisibles.nombre">
                  {{ producto.nombre }}
                  <span v-if="!producto.is_active" class="badge badge--inactive">Inactivo</span>
                </td>
                <td v-if="columnasVisibles.precio">Q{{ producto.precio.toFixed(2) }}</td>
                <td v-if="columnasVisibles.cantidad">
                  <span
                    class="cantidad-badge"
                    :class="{ 'cantidad-badge--low': producto.is_active && producto.cantidad <= producto.stockMinimo }"
                  >
                    {{ producto.cantidad }}
                  </span>
                </td>
                <td v-if="columnasVisibles.descripcion">{{ producto.descripcion }}</td>
                <td v-if="columnasVisibles.proveedor">{{ producto.proveedor ?? '—' }}</td>
              </tr>

              <tr v-if="productosFiltrados.length === 0">
                <td :colspan="columnaCount" class="empty-state">
                  No hay productos que coincidan con los filtros.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="filtros-panel">

        <p class="filtros-titulo">Filtros</p>

        <p class="filtros-sub">columnas visibles</p>
        <ul class="filtros-list">
          <li
            v-for="col in todasColumnas"
            :key="col.key"
            @click="toggleColumna(col.key)"
          >
            <span class="checkbox" :class="{ checked: columnasVisibles[col.key] }">
              <span v-if="columnasVisibles[col.key]" class="checkbox__check">✓</span>
            </span>
            {{ col.label }}
          </li>
        </ul>

        <div class="filtros-divider" />

        <p class="filtros-sub">Estado</p>
        <div class="filtros-chips">
          <button
            v-for="op in opcionesEstado"
            :key="op.value"
            class="chip"
            :class="{ 'chip--active': filtroEstado === op.value }"
            @click="filtroEstado = op.value"
          >
            {{ op.label }}
          </button>
        </div>

        <div class="filtros-divider" />

        <p class="filtros-sub">Stock</p>
        <div class="filtros-chips">
          <button
            v-for="op in opcionesStock"
            :key="op.value"
            class="chip"
            :class="{ 'chip--active': filtroStock === op.value }"
            @click="filtroStock = op.value"
          >
            {{ op.label }}
          </button>
        </div>

        <div v-if="productosStockBajo > 0" class="stock-alerta">
          <p class="stock-alerta__titulo">Stock bajo</p>
          <p class="stock-alerta__texto">
            {{ productosStockBajo }}
            {{ productosStockBajo === 1 ? 'producto necesita' : 'productos necesitan' }}
            reabastecimiento pronto.
          </p>
        </div>

        <div class="filtros-footer">
          <button class="btn-import" type="button" @click="onImportarExcel">
            ↑ Importar Excel
          </button>
        </div>

      </aside>
    </div>

  </div>
</template>

<script setup lang="ts">
import { fetchInventoryProducts } from '@/features/inventory/api';
import { ref, computed, onMounted } from 'vue';
import type { InventoryProduct } from '@/features/inventory/types';

const productos = ref<InventoryProduct[]>([]);

onMounted(() => {
  fetchInventoryProducts()
    .then((data) => { productos.value = data; })
    .catch((error) => { console.error('Error al cargar productos:', error); });
});

const todasColumnas = [
  { key: 'id',          label: 'ID' },
  { key: 'nombre',      label: 'Nombre' },
  { key: 'precio',      label: 'Precio c/u' },
  { key: 'cantidad',    label: 'Cantidad' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'proveedor',   label: 'Proveedor' },
] as const;

type ColumnaKey = (typeof todasColumnas)[number]['key'];

const columnasVisibles = ref<Record<ColumnaKey, boolean>>({
  id:          true,
  nombre:      true,
  precio:      true,
  cantidad:    true,
  descripcion: false,
  proveedor:   false,
});

function toggleColumna(key: ColumnaKey): void {
  columnasVisibles.value[key] = !columnasVisibles.value[key];
}

const columnaCount = computed(() =>
  Object.values(columnasVisibles.value).filter(Boolean).length,
);

const filtroEstado = ref<'todos' | 'activos' | 'inactivos'>('todos');
const filtroStock  = ref<'todos' | 'bajo'>('todos');

const opcionesEstado = [
  { value: 'todos'     as const, label: 'Todos' },
  { value: 'activos'   as const, label: 'Activos' },
  { value: 'inactivos' as const, label: 'Inactivos' },
];

const opcionesStock = [
  { value: 'todos' as const, label: 'Todos' },
  { value: 'bajo'  as const, label: 'Stock bajo' },
];

const productosFiltrados = computed(() => {
  return productos.value
    .filter(producto => {
      if (filtroEstado.value === 'activos')   return producto.is_active;
      if (filtroEstado.value === 'inactivos') return !producto.is_active;
      return true;
    })
    .filter(producto => {
      if (filtroStock.value === 'bajo') return producto.cantidad <= producto.stockMinimo;
      return true;
    });
});

const productosStockBajo = computed(() =>
  productos.value.filter(p => p.is_active && p.cantidad <= p.stockMinimo).length,
);

function onImportarExcel(): void {
  alert('Funcionalidad de importación próximamente.');
}
</script>

<style scoped>
.inventario-page {
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

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: var(--color-text);
}
.table-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.inventory-table thead tr {
  border-bottom: 2px solid #e8eef6;
  background: var(--color-structure-base);
}

.inventory-table th {
  padding: 14px 20px;
  text-align: left;
  font-weight: 700;
  color:#f0f4f9;
  font-size: 0.85rem;
}

.inventory-table tbody tr {
  border-bottom: 1px solid #f0f4f9;
  transition: background 0.12s;
}

.inventory-table tbody tr:last-child {
  border-bottom: none;
}

.inventory-table td {
  padding: 14px 20px;
  vertical-align: middle;
  color: var(--color-text-secondary);
}

.row--inactive {
  opacity: 0.38;
}

.badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
  vertical-align: middle;
}

.badge--inactive {
  background: #f0f0f0;
  color: #888;
}

.cantidad-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.82rem;
}

.cantidad-badge--low {
  background: #fde8e8;
  color: #c03a3a;
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.filtros-panel {
  width: 180px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding-top: 4px;
}

.filtros-titulo {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text);
  margin: 0 0 12px;
}

.filtros-sub {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin: 0 0 8px;
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
  font-size: 0.83rem;
  color: var(--color-text-secondary);
  transition: background 0.12s;
  user-select: none;
}

.filtros-list li:hover {
  background: rgba(0, 0, 0, 0.04);
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
  transition: all 0.14s;
}

.checkbox.checked {
  background: #4a90d9;
  border-color: #4a90d9;
}

.checkbox__check {
  font-size: 0.6rem;
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
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.13s;
  font-family: var(--font-sans);
}

.chip:hover {
  border-color: #b0bbd4;
  background: rgba(0, 0, 0, 0.04);
}

.chip--active {
  background: var(--color-structure-base);
  border-color: var(--color-structure-base);
  color: #fff;
  font-weight: 600;
}

.stock-alerta {
  margin-top: 16px;
  padding: 10px 12px;
  background: #fff5f5;
  border: 1px solid #fde8e8;
  border-radius: 8px;
}

.stock-alerta__titulo {
  font-size: 0.82rem;
  font-weight: 700;
  color: #c03a3a;
  margin: 0 0 4px;
}

.stock-alerta__texto {
  font-size: 0.78rem;
  color: #c03a3a;
  margin: 0;
  line-height: 1.4;
}

.filtros-footer {
  margin-top: auto;
  padding-top: 20px;
}

.btn-import {
  width: 100%;
  padding: 9px 12px;
  background: #fff;
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s, background 0.15s;
  font-family: var(--font-sans);
}

.btn-import:hover {
  border-color: var(--color-structure-base);
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
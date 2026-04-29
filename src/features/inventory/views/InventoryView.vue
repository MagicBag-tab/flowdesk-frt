<template>
  <div class="inventario-page">

    <div class="page-header-bar">
      <h1 class="page-title">Inventario</h1>

      <button class="btn-import" type="button" @click="onImportarExcel">
        <span class="btn-import__icon">↑</span>
        Importar Excel
      </button>
    </div>

    <div class="table-container">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio c/u</th>
            <th>Cantidad actual</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="producto in productos"
            :key="producto.id"
            :class="{
              'row--inactive': !producto.is_active,
              'row--low-stock': producto.is_active && producto.cantidad <= producto.stockMinimo,
            }"
          >
            <td>{{ producto.id }}</td>
            <td>
              {{ producto.nombre }}
              <span v-if="!producto.is_active" class="badge badge--inactive">Inactivo</span>
            </td>
            <td>Q{{ producto.precio.toFixed(2) }}</td>
            <td>
              <span
                class="cantidad-badge"
                :class="{ 'cantidad-badge--low': producto.is_active && producto.cantidad <= producto.stockMinimo }"
              >
                {{ producto.cantidad }}
              </span>
            </td>
          </tr>

          <tr v-if="productos.length === 0">
            <td colspan="4" class="empty-state">No hay productos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { fetchInventoryProducts } from '@/features/inventory/api';
import { ref, onMounted } from 'vue';
import type { InventoryProduct } from '@/features/inventory/types';

onMounted(() => {
    fetchInventoryProducts()
        .then((data) => {
            productos.value = data;
        })
        .catch((error) => {
            console.error('Error al cargar productos:', error);
        });
});

const productos = ref<InventoryProduct[]>([]);

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

.page-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.btn-import {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: #fff;
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.btn-import:hover {
  border-color: var(--color-structure-base);
  background: var(--color-structure-subtle);
}

.btn-import__icon {
  font-size: 1rem;
  font-weight: 700;
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
}

.inventory-table th {
  padding: 14px 20px;
  text-align: left;
  font-weight: 700;
  color: var(--color-structure-base);
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
</style>
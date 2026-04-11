<template>
  <div class="inventario-page">
    <div class="page-header-bar">
      <h1 class="page-title">Inventario</h1>
      <button class="btn-logout" type="button" @click="cerrarSesion">Cerrar sesión</button>
    </div>

    <div class="content-container">
      <div class="table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th v-if="columnasVisibles.id">ID</th>
              <th v-if="columnasVisibles.nombre">Nombre</th>
              <th v-if="columnasVisibles.cantidad">Cantidad</th>
              <th v-if="columnasVisibles.descripcion">Descripción</th>
              <th v-if="columnasVisibles.precio">Precio c/u</th>
              <th v-if="columnasVisibles.proveedor">Proveedor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productosFiltrados" :key="producto.id">
              <td v-if="columnasVisibles.id">{{ producto.id }}</td>
              <td v-if="columnasVisibles.nombre">{{ producto.nombre }}</td>
              <td v-if="columnasVisibles.cantidad">{{ producto.cantidad }}</td>
              <td v-if="columnasVisibles.descripcion">{{ producto.descripcion }}</td>
              <td v-if="columnasVisibles.precio">Q{{ producto.precio.toFixed(2) }}</td>
              <td v-if="columnasVisibles.proveedor">{{ producto.proveedor ?? '—' }}</td>
              <td class="td-acciones">
                <button class="btn-action" type="button" title="Editar" @click="abrirModal(producto)">✏️</button>
                <button class="btn-action" type="button" title="Eliminar" @click="confirmarEliminar(producto)">🗑️</button>
              </td>
            </tr>
            <tr v-if="productosFiltrados.length === 0">
              <td :colspan="columnaCount + 1" class="empty-state">
                No hay productos para mostrar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="filtros-panel">
        <p class="filtros-titulo">Filtros</p>
        <p class="filtros-sub">mostrar</p>
        <ul class="filtros-list">
          <li v-for="col in todasColumnas" :key="col.key" @click="toggleColumna(col.key)">
            <span class="checkbox" :class="{ checked: columnasVisibles[col.key] }">
              <span v-if="columnasVisibles[col.key]">✓</span>
            </span>
            {{ col.label }}
          </li>
        </ul>
      </div>
    </div>

    <button class="btn-fab" type="button" title="Agregar producto" @click="abrirModal()">+</button>

    <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ editando ? 'Editar producto' : 'Nuevo producto' }}</h2>
          <button class="modal-close" type="button" @click="cerrarModal">✕</button>
        </div>
        <form class="modal-form" @submit.prevent="guardarProducto">
          <div class="form-group">
            <label>Nombre <span class="required">*</span></label>
            <input v-model="form.nombre" type="text" placeholder="Ej. Arroz Diana 500g" required />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <input v-model="form.descripcion" type="text" placeholder="Descripción breve" />
          </div>
          <div class="form-row form-row-3">
            <div class="form-group form-group-sm">
              <label>Precio (Q) <span class="required">*</span></label>
              <input v-model.number="form.precio" type="number" min="0" step="0.01" placeholder="0.00" required />
            </div>
            <div class="form-group form-group-sm">
              <label>Cantidad <span class="required">*</span></label>
              <input v-model.number="form.cantidad" type="number" min="0" placeholder="0" required />
            </div>
            <div class="form-group form-group-sm">
              <label>Stock mínimo</label>
              <input v-model.number="form.stockMinimo" type="number" min="0" placeholder="5" />
            </div>
          </div>
          <div v-if="errorForm" class="form-error">{{ errorForm }}</div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-save">{{ editando ? 'Guardar cambios' : 'Crear producto' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Eliminar producto</h2>
          <button class="modal-close" type="button" @click="modalEliminar = false">✕</button>
        </div>
        <p class="modal-body-text">
          ¿Estás seguro que deseas eliminar
          <strong>{{ productoAEliminar?.nombre }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="modal-actions">
          <button class="btn-cancel" type="button" @click="modalEliminar = false">Cancelar</button>
          <button class="btn-delete-confirm" type="button" @click="eliminarProducto">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { InventoryProduct, InventoryProductForm } from '@/features/inventory/types';
import { appStore } from '@/stores/app.store';

const router = useRouter();

const todasColumnas = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'precio', label: 'Precio c/u' },
  { key: 'proveedor', label: 'Proveedor' },
] as const;

const productos = ref<InventoryProduct[]>([
  { id: 'P001', nombre: 'Terra Lab', cantidad: 112, descripcion: 'Desinfectante', precio: 45, stockMinimo: 10 },
  { id: 'P002', nombre: 'Topo Gigio', cantidad: 47, descripcion: 'Uso doméstico', precio: 28.5, stockMinimo: 15 },
  { id: 'P003', nombre: 'Versa 24', cantidad: 12, descripcion: 'Transit 14', precio: 62, stockMinimo: 20 },
  { id: 'P004', nombre: 'Purple Lexus', cantidad: 600, descripcion: 'Escalas AOS', precio: 120, stockMinimo: 50 },
  { id: 'P005', nombre: 'Tallo 278', cantidad: 30, descripcion: 'Logi', precio: 89, stockMinimo: 10 },
  { id: 'P006', nombre: 'Nuevo Blanco', cantidad: 25, descripcion: 'Residuos #12', precio: 15, stockMinimo: 30 },
]);

const columnasVisibles = ref<Record<(typeof todasColumnas)[number]['key'], boolean>>({
  id: true,
  nombre: true,
  cantidad: true,
  descripcion: true,
  precio: false,
  proveedor: false,
});

const modalVisible = ref(false);
const editando = ref(false);
const errorForm = ref('');
const modalEliminar = ref(false);
const productoAEliminar = ref<InventoryProduct | null>(null);

function formVacio(): InventoryProductForm {
  return {
    id: '',
    nombre: '',
    descripcion: '',
    precio: null,
    cantidad: null,
    stockMinimo: 5,
    proveedor: null,
  };
}

const form = reactive<InventoryProductForm>(formVacio());

const productosFiltrados = computed(() => productos.value);

const columnaCount = computed(() =>
  Object.values(columnasVisibles.value).filter(Boolean).length,
);

function toggleColumna(key: (typeof todasColumnas)[number]['key']): void {
  columnasVisibles.value[key] = !columnasVisibles.value[key];
}

function abrirModal(producto: InventoryProduct | null = null): void {
  errorForm.value = '';
  if (producto) {
    editando.value = true;
    Object.assign(form, producto);
  } else {
    editando.value = false;
    Object.assign(form, formVacio());
  }
  modalVisible.value = true;
}

function cerrarModal(): void {
  modalVisible.value = false;
}

function guardarProducto(): void {
  errorForm.value = '';

  if (form.precio === null || form.cantidad === null) {
    errorForm.value = 'Completa los campos obligatorios.';
    return;
  }

  const payload: InventoryProduct = {
    id: form.id,
    nombre: form.nombre,
    descripcion: form.descripcion,
    precio: form.precio,
    cantidad: form.cantidad,
    stockMinimo: form.stockMinimo ?? 5,
    proveedor: form.proveedor ?? null,
  };

  if (editando.value) {
    const idx = productos.value.findIndex((producto) => producto.id === payload.id);
    if (idx !== -1) {
      productos.value[idx] = { ...payload };
    }
  } else {
    const nuevoId = `P${String(productos.value.length + 1).padStart(3, '0')}`;
    productos.value.push({ ...payload, id: nuevoId });
  }

  cerrarModal();
}

function confirmarEliminar(producto: InventoryProduct): void {
  productoAEliminar.value = producto;
  modalEliminar.value = true;
}

function eliminarProducto(): void {
  if (!productoAEliminar.value) {
    return;
  }

  productos.value = productos.value.filter((producto) => producto.id !== productoAEliminar.value?.id);
  modalEliminar.value = false;
  productoAEliminar.value = null;
}

async function cerrarSesion(): Promise<void> {
  appStore.clearSession();
  await router.push({ name: 'login' });
}
</script>

<style scoped>
.inventario-page {
  font-family: var(--font-sans);
  background: var(--color-bg);
  min-height: 100vh;
  padding: 24px 28px;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  position: relative;
}

.page-header-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.btn-logout {
  padding: 8px 12px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: #fff;
  color: var(--color-subtle);
  font-size: 0.88rem;
  cursor: pointer;
}

.content-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex: 1;
}

.table-container {
  flex: 1;
  background: #ffffff;
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
  background: #ffffff;
  border-bottom: 2px solid #e8eef6;
}

.inventory-table th {
  padding: 14px 20px;
  font-weight: 700;
  text-align: left;
  color: var(--color-brand);
  font-size: 0.85rem;
  letter-spacing: 0.01em;
}

.inventory-table tbody tr {
  border-bottom: 1px solid var(--color-bg);
  transition: background 0.12s;
}

.inventory-table tbody tr:last-child {
  border-bottom: none;
}

.inventory-table tbody tr:hover {
  background: #f8fafc;
}

.inventory-table td {
  padding: 14px 20px;
  vertical-align: middle;
  color: #2c3a55;
}

.td-acciones {
  white-space: nowrap;
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.14s;
  margin-right: 2px;
}

.btn-action:hover {
  background: #eef1f7;
}

.empty-state {
  text-align: center;
  color: var(--color-muted);
  padding: 48px 0;
  font-size: 0.88rem;
}

.filtros-panel {
  width: 180px;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  padding: 18px 16px;
}

.filtros-titulo {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text);
  margin: 0 0 4px;
}

.filtros-sub {
  font-size: 0.78rem;
  color: var(--color-muted);
  margin: 0 0 12px;
}

.filtros-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.filtros-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-subtle);
  transition: background 0.12s;
  user-select: none;
}

.filtros-list li:hover {
  background: var(--color-bg);
}

.checkbox {
  width: 17px;
  height: 17px;
  border: 2px solid #b0bbd4;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  color: #fff;
  flex-shrink: 0;
  transition: all 0.14s;
}

.checkbox.checked {
  background: var(--color-brand);
  border-color: var(--color-brand);
}

.btn-fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-brand);
  color: #fff;
  border: none;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(61, 90, 128, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.16s, transform 0.14s;
}

.btn-fab:hover {
  background: var(--color-brand-dark);
  transform: scale(1.07);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 30, 55, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.modal {
  background: #ffffff;
  border-radius: 14px;
  width: 520px;
  max-width: 95vw;
  box-shadow: 0 8px 40px rgba(20, 30, 55, 0.2);
  overflow: hidden;
}

.modal-sm {
  width: 380px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eef1f7;
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--color-muted);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.14s;
}

.modal-close:hover {
  background: var(--color-bg);
}

.modal-form {
  padding: 20px 24px 24px;
}

.form-row {
  display: flex;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  margin-bottom: 14px;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-subtle);
}

.required {
  color: var(--color-error);
}

.form-group input,
.form-group select {
  padding: 9px 12px;
  border: 1.5px solid var(--color-line);
  border-radius: 8px;
  font-size: 0.88rem;
  color: var(--color-text);
  background: #f8fafc;
  outline: none;
  transition: border 0.14s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-brand);
  background: #fff;
}

.form-group input::placeholder {
  color: #b0bbd4;
}

.form-error {
  color: var(--color-error);
  font-size: 0.82rem;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--color-error-bg);
  border-radius: 7px;
  border: 1px solid var(--color-error-border);
}

.modal-body-text {
  padding: 16px 24px 4px;
  font-size: 0.9rem;
  color: var(--color-subtle);
  line-height: 1.55;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 4px 24px 20px;
}

.btn-cancel,
.btn-save,
.btn-delete-confirm {
  padding: 9px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: var(--color-bg);
  color: var(--color-subtle);
}

.btn-save {
  background: var(--color-brand);
  color: #fff;
}

.btn-delete-confirm {
  background: var(--color-error);
  color: #fff;
}

.form-row-3 {
  gap: 10px;
  flex-wrap: nowrap;
  align-items: flex-start;
}

.form-group-sm {
  flex: 0 0 150px;
  min-width: 0;
}

.form-group-sm label {
  font-size: 0.76rem;
}

.form-group-sm input,
.form-group-sm select {
  font-size: 0.82rem;
  padding: 8px 9px;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .content-container {
    flex-direction: column;
  }

  .filtros-panel {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .inventario-page {
    padding: 20px 16px 88px;
  }

  .page-header-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .table-container {
    overflow-x: auto;
  }

  .form-row-3 {
    flex-wrap: wrap;
  }

  .form-group-sm {
    flex: 1 1 100%;
  }

  .btn-fab {
    right: 20px;
    bottom: 20px;
  }
}
</style>

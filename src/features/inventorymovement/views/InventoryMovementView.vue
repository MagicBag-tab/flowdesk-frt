<template>
  <div class="movimiento-page">
    <div class="content-container">

      <div class="table-section">
        <h1 class="page-title">Movimiento de Inventario</h1>

        <div class="table-container">
          <table class="movimiento-table">
            <thead>
              <tr>
                <th v-if="columnasVisibles.id">ID</th>
                <th v-if="columnasVisibles.fecha">Fecha</th>
                <th v-if="columnasVisibles.producto">Producto</th>
                <th v-if="columnasVisibles.tipo">Tipo</th>
                <th v-if="columnasVisibles.cantidad">Cantidad</th>
                <th v-if="columnasVisibles.usuario">Usuario</th>
                <th v-if="columnasVisibles.motivo">Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mov in movimientosFiltrados" :key="mov.id">
                <td v-if="columnasVisibles.id" class="td-id">{{ mov.id }}</td>
                <td v-if="columnasVisibles.fecha" class="td-fecha">{{ formatFecha(mov.fecha) }}</td>
                <td v-if="columnasVisibles.producto">{{ mov.producto }}</td>
                <td v-if="columnasVisibles.tipo">
                  <span class="tipo-badge" :class="mov.tipo === 'Entrada' ? 'tipo-badge--entrada' : 'tipo-badge--salida'">{{ mov.tipo }}</span>
                </td>
                <td v-if="columnasVisibles.cantidad">
                  <span class="cantidad-num" :class="mov.tipo === 'Entrada' ? 'cantidad-num--entrada' : 'cantidad-num--salida'">
                    {{ mov.tipo === 'Entrada' ? '+' : '-' }}{{ mov.cantidad }}
                  </span>
                </td>
                <td v-if="columnasVisibles.usuario">{{ mov.usuario }}</td>
                <td v-if="columnasVisibles.motivo" class="td-motivo">{{ mov.motivo }}</td>
              </tr>
              <tr v-if="movimientosFiltrados.length === 0">
                <td :colspan="columnaCount" class="empty-state">
                  No hay movimientos para los filtros seleccionados.
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
          <li v-for="col in todasColumnas" :key="col.key" @click="toggleColumna(col.key)">
            <span class="checkbox" :class="{ checked: columnasVisibles[col.key] }">
              <span v-if="columnasVisibles[col.key]" class="checkbox__check">✓</span>
            </span>
            {{ col.label }}
          </li>
        </ul>

        <div class="filtros-divider" />

        <p class="filtros-sub">Tipo de movimiento</p>
        <div class="filtros-chips">
          <button
            v-for="op in opcionesTipo"
            :key="op.value"
            class="chip"
            :class="{ 'chip--active': filtroTipo === op.value }"
            @click="filtroTipo = op.value"
          >
            {{ op.label }}
          </button>
        </div>

        <div class="filtros-divider" />

        <p class="filtros-sub">Producto</p>
        <select class="filtro-select" v-model="filtroProducto">
          <option value="">Todos</option>
          <option v-for="p in productosUnicos" :key="p" :value="p">{{ p }}</option>
        </select>

        <div class="filtros-divider" />

        <p class="filtros-sub">Rango de fechas</p>
        <div class="fecha-inputs">
          <input type="date" class="filtro-input-fecha" v-model="filtroFechaDesde" />
          <input type="date" class="filtro-input-fecha" v-model="filtroFechaHasta" />
        </div>

        <button class="btn-limpiar" @click="limpiarFiltros">Limpiar filtros</button>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Movimiento {
  id: string;
  fecha: string;
  producto: string;
  tipo: 'Entrada' | 'Salida';
  cantidad: number;
  usuario: string;
  motivo: string;
}

const movimientos = ref<Movimiento[]>([
  { id: 'M001', fecha: '2025-05-01', producto: 'Terra Lab',     tipo: 'Entrada', cantidad: 50,  usuario: 'admin@empresa.com', motivo: 'Compra a proveedor' },
  { id: 'M002', fecha: '2025-05-02', producto: 'Topo Gigio',    tipo: 'Salida',  cantidad: 10,  usuario: 'emp1@empresa.com',  motivo: 'Venta al cliente #204' },
  { id: 'M003', fecha: '2025-05-03', producto: 'Versa 24',      tipo: 'Salida',  cantidad: 5,   usuario: 'emp2@empresa.com',  motivo: 'Producto dañado dado de baja' },
  { id: 'M004', fecha: '2025-05-04', producto: 'Purple Lexus',  tipo: 'Entrada', cantidad: 200, usuario: 'admin@empresa.com', motivo: 'Reabastecimiento mensual' },
  { id: 'M005', fecha: '2025-05-05', producto: 'Tallo 278',     tipo: 'Salida',  cantidad: 8,   usuario: 'emp1@empresa.com',  motivo: 'Venta al cliente #310' },
  { id: 'M006', fecha: '2025-05-06', producto: 'Nuevo Blanco',  tipo: 'Entrada', cantidad: 30,  usuario: 'admin@empresa.com', motivo: 'Compra urgente' },
  { id: 'M007', fecha: '2025-05-07', producto: 'Terra Lab',     tipo: 'Salida',  cantidad: 12,  usuario: 'emp2@empresa.com',  motivo: 'Ajuste de inventario' },
  { id: 'M008', fecha: '2025-05-08', producto: 'Topo Gigio',    tipo: 'Entrada', cantidad: 40,  usuario: 'admin@empresa.com', motivo: 'Compra a proveedor' },
  { id: 'M009', fecha: '2025-05-09', producto: 'Versa 24',      tipo: 'Entrada', cantidad: 15,  usuario: 'admin@empresa.com', motivo: 'Reabastecimiento' },
  { id: 'M010', fecha: '2025-05-10', producto: 'Purple Lexus',  tipo: 'Salida',  cantidad: 25,  usuario: 'emp1@empresa.com',  motivo: 'Venta al cliente #412' },
]);

const todasColumnas = [
  { key: 'id',       label: 'ID' },
  { key: 'fecha',    label: 'Fecha' },
  { key: 'producto', label: 'Producto' },
  { key: 'tipo',     label: 'Tipo' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'usuario',  label: 'Usuario' },
  { key: 'motivo',   label: 'Motivo' },
] as const;

type ColumnaKey = (typeof todasColumnas)[number]['key'];

const columnasVisibles = ref<Record<ColumnaKey, boolean>>({
  id:       true,
  fecha:    true,
  producto: true,
  tipo:     true,
  cantidad: true,
  usuario:  true,
  motivo:   true,
});

function toggleColumna(key: ColumnaKey): void {
  columnasVisibles.value[key] = !columnasVisibles.value[key];
}

const columnaCount = computed(() =>
  Object.values(columnasVisibles.value).filter(Boolean).length,
);

const filtroTipo     = ref<'todos' | 'Entrada' | 'Salida'>('todos');
const filtroProducto = ref('');
const filtroFechaDesde = ref('');
const filtroFechaHasta = ref('');

const opcionesTipo = [
  { value: 'todos'   as const, label: 'Todos' },
  { value: 'Entrada' as const, label: 'Entrada' },
  { value: 'Salida'  as const, label: 'Salida' },
];

const productosUnicos = computed(() =>
  [...new Set(movimientos.value.map(m => m.producto))].sort(),
);

const movimientosFiltrados = computed(() => {
  return movimientos.value.filter(m => {
    if (filtroTipo.value !== 'todos' && m.tipo !== filtroTipo.value) return false;
    if (filtroProducto.value && m.producto !== filtroProducto.value) return false;
    if (filtroFechaDesde.value && m.fecha < filtroFechaDesde.value) return false;
    if (filtroFechaHasta.value && m.fecha > filtroFechaHasta.value) return false;
    return true;
  });
});

function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

function limpiarFiltros(): void {
  filtroTipo.value = 'todos';
  filtroProducto.value = '';
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

.movimiento-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
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
  font-size: 0.85rem;
}

.movimiento-table tbody tr {
  border-bottom: 1px solid #f0f4f9;
  transition: background 0.12s;
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
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.td-fecha {
  white-space: nowrap;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.td-motivo {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  max-width: 220px;
}

.tipo-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
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
  font-size: 0.9rem;
}

.cantidad-num--entrada { color: #2e7d32; }
.cantidad-num--salida  { color: #e65100; }

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.filtros-panel {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding-top: 4px;
  gap: 0;
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
  text-transform: uppercase;
  letter-spacing: 0.04em;
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

.filtro-select {
  width: 100%;
  padding: 7px 10px;
  border: 1.5px solid #dde3ec;
  border-radius: 8px;
  font-size: 0.83rem;
  color: var(--color-text-secondary);
  background: #fff;
  outline: none;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: border 0.13s;
}

.filtro-select:focus {
  border-color: var(--color-structure-base);
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
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  background: #fff;
  outline: none;
  font-family: var(--font-sans);
  transition: border 0.13s;
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
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.14s;
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
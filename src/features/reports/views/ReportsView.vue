<template>
  <div class="reports-page">
    <div class="page-header">
      <h1 class="page-title">Generador de Reportes</h1>
      <p class="page-subtitle">Configura, filtra y exporta la información clave de tu negocio.</p>
    </div>

    <div class="reports-layout">
      <!-- CONFIGURATION PANEL -->
      <aside class="config-panel">
        <div class="panel-header">
          <h2 class="panel-title">Parámetros del Reporte</h2>
        </div>
        
        <form class="config-form" @submit.prevent="generatePreview">
          <!-- Modulo -->
          <div class="form-group">
            <label>Módulo</label>
            <div class="select-wrapper">
              <select v-model="form.module">
                <option value="inventory">Inventario</option>
                <option value="commercial">Comercial / Ventas</option>
              </select>
            </div>
          </div>

          <!-- Tipo de Reporte -->
          <div class="form-group">
            <label>Tipo de Reporte</label>
            <div class="select-wrapper">
              <select v-model="form.type">
                <template v-if="form.module === 'inventory'">
                  <option value="current_stock">Stock Actual Valorado</option>
                  <option value="movements">Historial de Movimientos</option>
                  <option value="dead_stock">Reporte de Stock Muerto</option>
                </template>
                <template v-else>
                  <option value="sales_summary">Resumen de Ventas</option>
                  <option value="clients_list">Directorio de Clientes</option>
                </template>
              </select>
            </div>
          </div>

          <!-- Rango de Fechas -->
          <div class="form-row">
            <div class="form-group">
              <label>Desde</label>
              <input type="date" v-model="form.startDate" class="date-input" />
            </div>
            <div class="form-group">
              <label>Hasta</label>
              <input type="date" v-model="form.endDate" class="date-input" />
            </div>
          </div>

          <button type="submit" class="btn-generate" :disabled="isLoading">
            <span v-if="isLoading">Generando...</span>
            <span v-else>Generar Vista Previa</span>
          </button>
        </form>

        <!-- Acciones de Exportación (solo visibles si hay vista previa) -->
        <div class="export-actions" v-if="hasPreview">
          <div class="divider"></div>
          <p class="export-label">Exportar documento completo:</p>
          <div class="export-buttons">
            <button class="btn-export csv" @click="exportCSV">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              CSV / Excel
            </button>
            <button class="btn-export pdf" @click="exportPDF">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>
              Documento PDF
            </button>
          </div>
        </div>
      </aside>

      <!-- PREVIEW PANEL -->
      <main class="preview-panel">
        <div v-if="!hasPreview && !isLoading" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/><path d="M9 3v18"/></svg>
          </div>
          <h3>Área de Vista Previa</h3>
          <p>Ajusta los parámetros en el panel izquierdo y presiona "Generar Vista Previa" para previsualizar los datos antes de exportarlos.</p>
        </div>

        <div v-else-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Procesando datos...</p>
        </div>

        <div v-else class="preview-content">
          <div class="preview-header">
            <h3>{{ getReportTitle() }}</h3>
            <span class="badge">Mostrando primeras 50 filas</span>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th v-for="col in previewData.columns" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in previewData.rows" :key="idx">
                  <td v-for="col in previewData.columns" :key="col">{{ row[col] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

const form = reactive({
  module: 'inventory',
  type: 'current_stock',
  startDate: '',
  endDate: ''
});

// Auto-adjust default type when module changes
watch(() => form.module, (newVal) => {
  if (newVal === 'inventory') form.type = 'current_stock';
  else form.type = 'sales_summary';
});

const isLoading = ref(false);
const hasPreview = ref(false);

const previewData = reactive({
  columns: [] as string[],
  rows: [] as any[]
});

function getReportTitle() {
  const titles: Record<string, string> = {
    current_stock: 'Stock Actual Valorado',
    movements: 'Historial de Movimientos',
    dead_stock: 'Reporte de Stock Muerto',
    sales_summary: 'Resumen de Ventas',
    clients_list: 'Directorio de Clientes'
  };
  return titles[form.type] || 'Reporte Personalizado';
}

async function generatePreview() {
  isLoading.value = true;
  hasPreview.value = false;
  
  // MOCK: Simular llamada al backend
  setTimeout(() => {
    isLoading.value = false;
    hasPreview.value = true;
    
    if (form.module === 'inventory') {
      previewData.columns = ['SKU', 'Producto', 'Categoría', 'Stock', 'Valor Unitario', 'Valor Total'];
      previewData.rows = [
        { 'SKU': 'PRD-001', 'Producto': 'Demo Frijol', 'Categoría': 'Granos', 'Stock': 120, 'Valor Unitario': '$15.00', 'Valor Total': '$1,800.00' },
        { 'SKU': 'PRD-002', 'Producto': 'Demo Arroz', 'Categoría': 'Granos', 'Stock': 350, 'Valor Unitario': '$10.00', 'Valor Total': '$3,500.00' },
        { 'SKU': 'PRD-003', 'Producto': 'Aceite de Girasol', 'Categoría': 'Abarrotes', 'Stock': 45, 'Valor Unitario': '$22.50', 'Valor Total': '$1,012.50' },
        { 'SKU': 'PRD-004', 'Producto': 'Galletas Surtidas', 'Categoría': 'Snacks', 'Stock': 80, 'Valor Unitario': '$12.00', 'Valor Total': '$960.00' },
      ];
    } else {
      previewData.columns = ['Cliente', 'RUT', 'Última Compra', 'Total Facturado', 'Estado'];
      previewData.rows = [
        { 'Cliente': 'Supermercados del Norte', 'RUT': '76.123.456-7', 'Última Compra': '15/08/2026', 'Total Facturado': '$15,400.00', 'Estado': 'Activo' },
        { 'Cliente': 'Minimarket La Esquina', 'RUT': '77.890.123-K', 'Última Compra': '10/08/2026', 'Total Facturado': '$3,200.00', 'Estado': 'Activo' },
      ];
    }
  }, 600);
}

function exportCSV() {
  alert('Iniciando descarga CSV (Pronto conectado al backend)');
}

function exportPDF() {
  alert('Iniciando descarga PDF (Pronto conectado al backend)');
}
</script>

<style scoped>
.reports-page {
  box-sizing: border-box;
  width: 100%;
  padding: 32px 36px;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  font-family: var(--font-sans);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  margin-bottom: 8px;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}
.page-subtitle {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 0.95rem;
}

/* LAYOUT */
.reports-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1024px) {
  .reports-layout {
    grid-template-columns: 1fr;
  }
}

/* CONFIG PANEL */
.config-panel {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 14px;
  padding: 24px;
  box-shadow: var(--shadow-card);
}
.panel-header {
  margin-bottom: 20px;
}
.panel-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.select-wrapper select, .date-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 8px;
  background: #fff;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--color-text);
  transition: border-color 0.2s;
}
.select-wrapper select:focus, .date-input:focus {
  outline: none;
  border-color: var(--color-structure-base);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-generate {
  margin-top: 8px;
  padding: 12px;
  background: var(--color-structure-base);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-generate:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* EXPORT ACTIONS */
.export-actions {
  margin-top: 24px;
}
.divider {
  height: 1px;
  background: var(--color-structure-subtle);
  margin-bottom: 16px;
}
.export-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}
.export-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-export {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}
.btn-export.csv {
  border-color: #10B981;
  color: #059669;
}
.btn-export.csv:hover {
  background: #ECFDF5;
}
.btn-export.pdf {
  border-color: #EF4444;
  color: #DC2626;
}
.btn-export.pdf:hover {
  background: #FEF2F2;
}

/* PREVIEW PANEL */
.preview-panel {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 14px;
  min-height: 400px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state, .loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: var(--color-text-muted);
}
.empty-icon {
  margin-bottom: 16px;
  color: #cbd5e1;
}
.empty-state h3, .loading-state p {
  margin: 0 0 8px 0;
  color: var(--color-text-secondary);
}
.empty-state p {
  max-width: 320px;
  font-size: 0.9rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-structure-subtle);
  border-top-color: var(--color-structure-base);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.preview-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1.5px solid var(--color-structure-subtle);
}
.preview-header h3 {
  margin: 0;
  font-size: 1.1rem;
}
.badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
  flex: 1;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 14px 24px;
  text-align: left;
  border-bottom: 1px solid var(--color-structure-subtle);
  font-size: 0.9rem;
}
.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.data-table tr:last-child td {
  border-bottom: none;
}
.data-table tr:hover td {
  background: #f8fafc;
}
</style>

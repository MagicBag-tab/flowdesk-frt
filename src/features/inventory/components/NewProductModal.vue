<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <header class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">Crear Producto Nuevo</h2>
        </div>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <p class="modal-desc">
          Registra un nuevo producto y su cantidad inicial de stock.
        </p>
        
        <form @submit.prevent="submit" class="form-grid">
          <div class="form-group full-width">
            <label class="form-label">Nombre del producto *</label>
            <input v-model="form.nombre" type="text" class="form-input" required placeholder="Ej. Lápiz HB" />
          </div>

          <div class="form-group full-width">
            <label class="form-label">Descripción</label>
            <textarea v-model="form.descripcion" class="form-input" rows="2" placeholder="Detalles del producto..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Precio Unitario (Q) *</label>
            <input v-model.number="form.precio" type="number" step="0.01" min="0" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Stock Inicial *</label>
            <input v-model.number="form.stockInicial" type="number" min="0" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Stock Mínimo (Alerta) *</label>
            <input v-model.number="form.stockMinimo" type="number" min="0" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Proveedor</label>
            <input v-model="form.proveedor" type="text" class="form-input" placeholder="Nombre de la empresa" />
          </div>

          <div v-if="error" class="error-alert">{{ error }}</div>

          <div class="form-actions full-width">
            <button type="button" class="btn-cancel" @click="$emit('close')" :disabled="isSubmitting">Cancelar</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Crear Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { createInventoryProduct } from '@/features/inventory/api';
import { createMovement } from '@/features/inventorymovement/api';
import { getApiErrorMessage } from '@/services/apiClient';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created'): void;
}>();

const form = reactive({
  nombre: '',
  descripcion: '',
  precio: 0,
  stockMinimo: 0,
  stockInicial: 0,
  proveedor: '',
});

const isSubmitting = ref(false);
const error = ref('');

async function submit() {
  if (!form.nombre || form.precio < 0 || form.stockInicial < 0 || form.stockMinimo < 0) {
    error.value = 'Por favor revisa los campos requeridos y que no haya valores negativos.';
    return;
  }

  isSubmitting.value = true;
  error.value = '';

  try {
    const producto = await createInventoryProduct({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: form.precio,
      stockMinimo: form.stockMinimo,
      proveedor: form.proveedor || null,
    });

    if (form.stockInicial > 0) {
      await createMovement({
        producto_id: producto.id,
        tipo_movimiento: 'entrada_manual',
        cantidad: form.stockInicial,
        motivo: 'Inventario inicial al crear el producto',
      });
    }

    emit('created');
    emit('close');
  } catch (err) {
    error.value = getApiErrorMessage(err);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-structure-base, #3b82f6);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
}

.modal-desc {
  margin: 0 0 20px 0;
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1e293b;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-structure-base, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-alert {
  grid-column: 1 / -1;
  padding: 12px;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-submit {
  padding: 10px 24px;
  background: var(--color-structure-base, #3b82f6);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.btn-submit:disabled, .btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

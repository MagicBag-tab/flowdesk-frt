<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">Nuevo movimiento</h2>
          <button class="modal__close" type="button" @click="$emit('close')">✕</button>
        </div>

        <div v-if="submitError" class="alert alert-error" style="margin:0 0 16px;">
          <span>{{ submitError }}</span>
          <button class="alert-close" type="button" @click="submitError = ''">✕</button>
        </div>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label class="form-label">Producto</label>
            <select v-model="form.producto_id" class="form-input" :class="{ 'input-error': errors.producto_id }" @change="errors.producto_id = ''">
              <option value="" disabled>Seleccionar producto…</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.nombre }} (stock: {{ p.cantidad }})
              </option>
            </select>
            <span v-if="errors.producto_id" class="error-msg">{{ errors.producto_id }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Tipo de movimiento</label>
            <select v-model="form.tipo_movimiento" class="form-input" :class="{ 'input-error': errors.tipo_movimiento }" @change="errors.tipo_movimiento = ''">
              <option value="" disabled>Seleccionar tipo…</option>
              <optgroup label="Entradas">
                <option value="entrada_compra">Entrada — Compra</option>
                <option value="entrada_manual">Entrada — Manual</option>
                <option value="ajuste_positivo">Ajuste positivo</option>
                <option value="devolucion_cliente">Devolución cliente</option>
              </optgroup>
              <optgroup label="Salidas">
                <option value="salida_venta">Salida — Venta</option>
                <option value="salida_manual">Salida — Manual</option>
                <option value="ajuste_negativo">Ajuste negativo</option>
                <option value="devolucion_proveedor">Devolución proveedor</option>
              </optgroup>
            </select>
            <span v-if="errors.tipo_movimiento" class="error-msg">{{ errors.tipo_movimiento }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Cantidad</label>
            <input v-model.number="form.cantidad" type="number" min="0.01" step="0.01"
              class="form-input" :class="{ 'input-error': errors.cantidad }"
              placeholder="0" @input="errors.cantidad = ''" />
            <span v-if="errors.cantidad" class="error-msg">{{ errors.cantidad }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">
              Motivo
              <span style="color:var(--color-text-muted);font-weight:400;font-size:.78rem;">(opcional)</span>
            </label>
            <input v-model="form.motivo" type="text" class="form-input"
              placeholder="Ej. Venta #204, ajuste de inventario…" maxlength="200" />
          </div>

          <div class="modal__footer">
            <button type="button" class="btn-secondary" @click="$emit('close')">Cancelar</button>
            <button type="submit" class="btn-primary" style="width:auto;padding:10px 28px;" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
              <span>{{ isSubmitting ? 'Guardando…' : 'Registrar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { createMovement, type MovementType } from '@/features/inventorymovement/api';
import { getApiErrorMessage } from '@/services/apiClient';
import type { InventoryProduct } from '@/features/inventory/types';

defineProps<{ products: InventoryProduct[] }>();
const emit = defineEmits<{ close: []; created: [] }>();

interface FormData {
  producto_id: string;
  tipo_movimiento: MovementType | '';
  cantidad: number | '';
  motivo: string;
}

const form = reactive<FormData>({ producto_id: '', tipo_movimiento: '', cantidad: '', motivo: '' });
const errors = reactive<Record<'producto_id' | 'tipo_movimiento' | 'cantidad', string>>({
  producto_id: '', tipo_movimiento: '', cantidad: '',
});
const isSubmitting = ref(false);
const submitError = ref('');

function validate(): boolean {
  let ok = true;
  if (!form.producto_id) { errors.producto_id = 'Selecciona un producto.'; ok = false; }
  if (!form.tipo_movimiento) { errors.tipo_movimiento = 'Selecciona el tipo de movimiento.'; ok = false; }
  if (!form.cantidad || Number(form.cantidad) <= 0) { errors.cantidad = 'La cantidad debe ser mayor a 0.'; ok = false; }
  return ok;
}

async function submit() {
  submitError.value = '';
  if (!validate()) return;
  isSubmitting.value = true;
  try {
    await createMovement({
      producto_id: form.producto_id,
      tipo_movimiento: form.tipo_movimiento as MovementType,
      cantidad: Number(form.cantidad),
      motivo: form.motivo.trim() || undefined,
    });
    emit('created');
    emit('close');
  } catch (err) {
    submitError.value = getApiErrorMessage(err);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, .18);
  padding: 28px 32px 24px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-structure-base);
  margin: 0;
}

.modal__close {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
}

.modal__close:hover {
  background: #f0f4f9;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1.5px solid var(--color-structure-subtle);
  border-radius: 8px;
  background: #fff;
  color: var(--color-text-muted);
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all .13s;
}

.btn-secondary:hover {
  border-color: var(--color-structure-base);
  color: var(--color-structure-base);
}
</style>
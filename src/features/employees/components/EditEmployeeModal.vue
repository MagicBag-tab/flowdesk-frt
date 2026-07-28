<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">Editar Empleado</h2>
          <button class="modal__close" type="button" @click="$emit('close')">✕</button>
        </div>

        <div v-if="submitError" class="alert alert-error" style="margin: 0 0 16px;">
          <span>{{ submitError }}</span>
          <button class="alert-close" type="button" @click="submitError = ''">✕</button>
        </div>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label class="form-label">Nombre de usuario</label>
            <input v-model="form.username" type="text" class="form-input"
              :class="{ 'input-error': errors.username }" placeholder="john_doe"
              @input="errors.username = ''" />
            <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Correo electrónico</label>
            <input :value="employee.email" type="email" class="form-input form-input--disabled" disabled />
            <span class="hint-msg">El correo electrónico no se puede modificar.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Rol</label>
            <select v-model="form.role_id" class="form-input"
              :class="{ 'input-error': errors.role_id }" @change="errors.role_id = ''">
              <option value="" disabled>Seleccionar rol…</option>
              <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
            <span v-if="errors.role_id" class="error-msg">{{ errors.role_id }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Estado</label>
            <label class="status-toggle">
              <input type="checkbox" v-model="form.is_active" />
              <span>{{ form.is_active ? 'Activo' : 'Inactivo' }}</span>
            </label>
          </div>

          <div class="modal__footer">
            <button type="button" class="btn-secondary" @click="$emit('close')">Cancelar</button>
            <button type="submit" class="btn-primary" style="width:auto;padding:10px 28px;"
              :disabled="isSubmitting || !hasChanges">
              <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
              <span>{{ isSubmitting ? 'Guardando…' : 'Guardar cambios' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { updateEmployee, updateEmployeeStatus, fetchRoles, type UserResponse } from '@/features/employees/api';
import { getApiErrorMessage } from '@/services/apiClient';


const props = defineProps<{ employee: UserResponse }>();
const emit = defineEmits<{ close: []; updated: [] }>();

interface FormData { username: string; role_id: number | ''; is_active: boolean }

const EXCLUDED_ROLES = ['superadmin'];
const form = reactive<FormData>({
  username: props.employee.username,
  role_id: props.employee.role_id,
  is_active: props.employee.is_active,
});
const errors = reactive<Record<keyof FormData, string>>({ username: '', role_id: '', is_active: '' });
const isSubmitting = ref(false);
const submitError = ref('');
const availableRoles = ref<{ id: number; name: string; description: string | null }[]>([]);

const hasChanges = computed(() =>
  form.username.trim() !== props.employee.username ||
  form.role_id !== props.employee.role_id ||
  form.is_active !== props.employee.is_active
);

onMounted(async () => {
  try {
    const roles = await fetchRoles();
    availableRoles.value = roles.filter(r => !EXCLUDED_ROLES.includes(r.name));
  } catch { /* no crítico */ }
});

function validate(): boolean {
  let ok = true;
  if (!form.username.trim()) { errors.username = 'El nombre de usuario es obligatorio.'; ok = false; }
  if (!form.role_id) { errors.role_id = 'Selecciona un rol.'; ok = false; }
  return ok;
}

async function submit() {
  submitError.value = '';
  if (!validate()) return;
  if (!hasChanges.value) { emit('close'); return; }

  isSubmitting.value = true;
  try {
    const payload: { username?: string; role_id?: number } = {};
    if (form.username.trim() !== props.employee.username) {
      payload.username = form.username.trim();
    }
    if (form.role_id !== props.employee.role_id) {
      payload.role_id = form.role_id as number;
    }
    if (Object.keys(payload).length > 0) {
      await updateEmployee(props.employee.id, payload);
    }
    if (form.is_active !== props.employee.is_active) {
      await updateEmployeeStatus(props.employee.id, { is_active: form.is_active });
    }
    emit('updated');
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
  max-width: 460px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, .18);
  padding: 28px 32px 24px;
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

.form-input--disabled {
  background: #f5f7fa;
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.hint-msg {
  display: block;
  margin-top: 5px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
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

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>

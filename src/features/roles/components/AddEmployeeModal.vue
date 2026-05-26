<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">Agregar Empleado</h2>
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
            <input v-model="form.email" type="email" class="form-input"
              :class="{ 'input-error': errors.email }" placeholder="correo@empresa.com"
              @input="errors.email = ''" />
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
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

          <div class="modal__footer">
            <button type="button" class="btn-secondary" @click="$emit('close')">Cancelar</button>
            <button type="submit" class="btn-primary" style="width:auto;padding:10px 28px;"
              :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
              <span>{{ isSubmitting ? 'Guardando…' : 'Agregar empleado' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { createEmployee, fetchRoles } from '@/features/roles/employees';
import { getApiErrorMessage } from '@/services/apiClient';

const emit = defineEmits<{ close: []; created: [] }>();

interface FormData { username: string; email: string; role_id: number | '' }

const EXCLUDED_ROLES = ['superadmin'];
const form = reactive<FormData>({ username: '', email: '', role_id: '' });
const errors = reactive<Record<keyof FormData, string>>({ username: '', email: '', role_id: '' });
const isSubmitting = ref(false);
const submitError = ref('');
const availableRoles = ref<{ id: number; name: string; description: string | null }[]>([]);

onMounted(async () => {
  try {
    const roles = await fetchRoles();
    availableRoles.value = roles.filter(r => !EXCLUDED_ROLES.includes(r.name));
  } catch { /* no crítico */ }
});

function validate(): boolean {
  let ok = true;
  if (!form.username.trim()) { errors.username = 'El nombre de usuario es obligatorio.'; ok = false; }
  if (!form.email.trim()) { errors.email = 'El correo es obligatorio.'; ok = false; }
  else if (!/.+@.+\..+/.test(form.email)) { errors.email = 'Ingresa un correo válido.'; ok = false; }
  if (!form.role_id) { errors.role_id = 'Selecciona un rol.'; ok = false; }
  return ok;
}

async function submit() {
  submitError.value = '';
  if (!validate()) return;
  isSubmitting.value = true;
  try {
    await createEmployee({
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      role_id: form.role_id as number,
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
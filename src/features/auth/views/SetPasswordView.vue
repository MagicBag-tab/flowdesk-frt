<template>
  <section class="auth-card auth-card--wide">
    <div class="auth-brand">
      <img src="../../../logo/logo-blanco.png" alt="FlowDesk Logo" class="auth-brand__logo" />
    </div>

    <h3 class="auth-title">Establecer Contraseña</h3>

    <div v-if="tokenState === 'invalid'" class="alert alert-error">
      <span>El enlace es inválido o ha expirado. Solicita uno nuevo.</span>
    </div> 

    <div v-if="submitError" class="alert alert-error">
      <span>{{ submitError }}</span>
      <button class="alert-close" type="button" @click="submitError = ''">✕</button>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      <span>{{ successMessage }}</span>
    </div>

    <form v-if= "tokenState === 'valid' && !requestSent" @submit.prevent="submitRequest">
      <div class="form-group">
        <label class="form-label" for="new-password">Ingresar contraseña</label>
        <input
          id="new-password"
          v-model="form.newPassword"
          type="password"
          class="form-input"
          :class="{ 'input-error': errors.newPassword }"
          placeholder="Mínimo 6 caracteres"
          maxlength="20"
          @input="clearFieldError('newPassword')"
        />
        <span v-if="errors.newPassword" class="error-msg">{{ errors.newPassword }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="confirm-password">Confirmar contraseña</label>
        <input
          id="confirm-password"
          v-model="form.confirmPassword"
          type="password"
          class="form-input"
          :class="{ 'input-error': errors.confirmPassword }"
          placeholder="Repite tu contraseña"
          maxlength="20"
          @input="clearFieldError('confirmPassword')"
        />
        <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
        <span>{{ isSubmitting ? 'Guardando...' : 'Cambiar contraseña' }}</span>
      </button>
    </form>

    <RouterLink class="auth-link" to="/login">Volver al login</RouterLink>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { getApiErrorMessage } from '@/services/apiClient';
import { setPassword } from '../api';

interface SetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

type TokenState = 'checking' | 'valid' | 'invalid';

const route  = useRoute();
const router = useRouter();

const token = ref<string | null>(null);
const tokenState = ref<TokenState>('checking');

const form = reactive<SetPasswordForm>({
  newPassword: '',
  confirmPassword: '',
});

const errors = reactive<Record<keyof SetPasswordForm, string>>({
  newPassword: '',
  confirmPassword: '',
});

const isSubmitting  = ref(false);
const submitError   = ref('');
const requestSent   = ref(false);
const successMessage = ref('');

onMounted(() => {
  const raw = route.query.token;
  token.value = typeof raw === 'string' && raw.trim() ? raw.trim() : null;

  tokenState.value = token.value ? 'valid' : 'invalid'

  // TODO: reemplazar por validación real contra el backend
  // Ejemplo: await validateResetToken(token.value)
  tokenState.value = 'valid';
});

function clearFieldError(field: keyof SetPasswordForm): void {
  errors[field] = '';
  submitError.value = '';
}

function validate(): boolean {
  let isValid = true;

  if (!form.newPassword) {
    errors.newPassword = 'La contraseña es obligatoria.';
    isValid = false;
  } else if (form.newPassword.length < 6) {
    errors.newPassword = 'La contraseña debe tener al menos 6 caracteres.';
    isValid = false;
  } else if (form.newPassword.length > 20) {
    errors.newPassword = 'La contraseña no puede exceder 20 caracteres.';
    isValid = false;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Debes confirmar la contraseña.';
    isValid = false;
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
    isValid = false;
  }

  return isValid;
}

async function submitRequest(): Promise<void> {
  submitError.value = '';

  if (!validate()) return;

  if(!token.value){
    tokenState.value = 'invalid';
    return;
  }

  isSubmitting.value = true;

  try {
    await setPassword(token.value!, form.newPassword);
    requestSent.value = true;
    successMessage.value = 'Contraseña establecida. Redirigiendo...';

    setTimeout(() => router.push({name : 'welcome'}), 2000);
  } catch (error) {
    const message = getApiErrorMessage(error);
    if (message.toLowerCase().includes('token') || message.toLowerCase().includes('expirado')) {
      tokenState.value = 'invalid';
    } else {
      submitError.value = message;
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>
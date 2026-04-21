<template>
  <section class="auth-card">
    <div class="auth-brand">
      <img src="../../../logo/logo-blanco.png" alt="FlowDesk Logo" class="auth-brand__logo" />
    </div>

    <div v-if="submitError" class="alert alert-error">
      <span>{{ submitError }}</span>
      <button class="alert-close" type="button" @click="submitError = ''">✕</button>
    </div>

    <form @submit.prevent="submitLogin">
      <div class="form-group">
        <label class="form-label" for="email">Correo Electrónico</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'input-error': errors.email }"
          placeholder="correo@ejemplo.com"
          @input="clearFieldError('email')"
        />
        <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Contraseña</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-input"
          :class="{ 'input-error': errors.password }"
          placeholder="Mínimo 6 caracteres"
          maxlength="20"
          @input="clearFieldError('password')"
        />
        <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
        <span>{{ isSubmitting ? 'Ingresando...' : 'Iniciar Sesión' }}</span>
      </button>
    </form>

    <RouterLink class="auth-link" to="/register">Registrar empresa</RouterLink>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { loginWithPassword } from '@/features/auth/api';
import type { LoginRequest } from '@/features/auth/types';
import { getApiErrorMessage } from '@/services/apiClient';
import { appStore } from '@/stores/app.store';

interface LoginErrors {
  email: string;
  password: string;
}

const router = useRouter();
const route = useRoute();

const form = reactive<LoginRequest>({
  email: '',
  password: '',
});

const errors = reactive<LoginErrors>({
  email: '',
  password: '',
});

const isSubmitting = ref(false);
const submitError = ref('');

function clearFieldError(field: keyof LoginErrors): void {
  errors[field] = '';
  submitError.value = '';
}

function validate(): boolean {
  let isValid = true;

  if (!form.email.trim()) {
    errors.email = 'El correo es obligatorio.';
    isValid = false;
  } else if (!/.+@.+\..+/.test(form.email)) {
    errors.email = 'Ingresa un correo valido.';
    isValid = false;
  }

  if (!form.password) {
    errors.password = 'La contrasena es obligatoria.';
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = 'La contrasena debe tener al menos 6 caracteres.';
    isValid = false;
  } else if (form.password.length > 20) {
    errors.password = 'La contrasena no puede exceder 20 caracteres.';
    isValid = false;
  }

  return isValid;
}

async function submitLogin(): Promise<void> {
  submitError.value = '';

  if (!validate()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const tokenResponse = await loginWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    appStore.setSession(tokenResponse);

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/inventory';
    await router.push(redirect);
  } catch (error) {
    submitError.value = getApiErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="auth-card auth-card--wide">
    <div class="auth-brand">
      <img src="../../../logo/logo-blanco.png" alt="FlowDesk Logo" class="auth-brand__logo" />
    </div>

    <h3 class="auth-title">Contáctanos para registrar tu empresa</h3>

    <div v-if="submitError" class="alert alert-error">
      <span>{{ submitError }}</span>
      <button class="alert-close" type="button" @click="submitError = ''">✕</button>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      <span>{{ successMessage }}</span>
    </div>

    <form v-if="!requestSent" @submit.prevent="submitRequest">
      <div class="form-group">
        <label class="form-label" for="company-name">Nombre de la Empresa</label>
        <input
          id="company-name"
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.name }"
          placeholder="Empresa"
          @input="clearFieldError('name')"
        />
        <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="admin-username">Nombre encargado</label>
        <input
          id="admin-username"
          v-model="form.admin_username"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.admin_username }"
          placeholder="Nombre completo"
          @input="clearFieldError('admin_username')"
        />
        <span v-if="errors.admin_username" class="error-msg">{{ errors.admin_username }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="admin-email">Correo electrónico</label>
        <input
          id="admin-email"
          v-model="form.admin_email"
          type="email"
          class="form-input"
          :class="{ 'input-error': errors.admin_email }"
          placeholder="correo@ejemplo.com"
          @input="clearFieldError('admin_email')"
        />
        <span v-if="errors.admin_email" class="error-msg">{{ errors.admin_email }}</span>
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
        <span>{{ isSubmitting ? 'Enviando solicitud...' : 'Enviar Solicitud' }}</span>
      </button>
    </form>

    <RouterLink class="auth-link" to="/login">Volver al login</RouterLink>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { getApiErrorMessage } from '@/services/apiClient';

interface RequestForm extends CompanyRegisterRequest {
}

type RegistrationField = keyof RequestForm;

const form = reactive<RequestForm>({
  name: '',
  admin_email: '',
  admin_username: '',
});

const errors = reactive<Record<RegistrationField, string>>({
  name: '',
  admin_email: '',
  admin_username: '',
});

const isSubmitting = ref(false);
const submitError = ref('');
const requestSent = ref(false);
const successMessage = ref('');

function clearFieldError(field: RegistrationField): void {
  errors[field] = '';
  submitError.value = '';
  successMessage.value = '';
}

function deriveSchemaName(value: string): string {
  const schemaName = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

  return schemaName || 'empresa';
}

function validate(): boolean {
  let isValid = true;

  if (!form.name.trim()) {
    errors.name = 'El nombre de la empresa es obligatorio.';
    isValid = false;
  }

  if (!form.admin_username.trim()) {
    errors.admin_username = 'Debes indicar el usuario administrador.';
    isValid = false;
  }

  if (!form.admin_email.trim()) {
    errors.admin_email = 'El correo administrador es obligatorio.';
    isValid = false;
  } else if (!/.+@.+\..+/.test(form.admin_email)) {
    errors.admin_email = 'Ingresa un correo valido.';
    isValid = false;
  }

  return isValid;
}

async function submitRequest(): Promise<void> {
  submitError.value = '';

  if (!validate()) {
    return;
  }

  isSubmitting.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    requestSent.value = true;
    successMessage.value = '¡Solicitud enviada! Nos pondremos en contacto contigo pronto.';
  } catch (error) {
    submitError.value = getApiErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

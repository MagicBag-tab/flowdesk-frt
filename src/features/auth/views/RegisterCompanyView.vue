<template>
  <section class="auth-card auth-card--wide">
    <div class="auth-brand">
      <span class="auth-brand__icon">📋</span>
      <h2 class="auth-brand__name">FlowDesk</h2>
    </div>

    <h1 class="auth-title">Registrar Empresa</h1>

    <div v-if="submitError" class="alert alert-error">
      <span>{{ submitError }}</span>
      <button class="alert-close" type="button" @click="submitError = ''">✕</button>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      <span>{{ successMessage }}</span>
    </div>

    <form v-if="!registeredCompany" @submit.prevent="submitRegistration">
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
        <label class="form-label" for="admin-username">Usuario Admin</label>
        <input
          id="admin-username"
          v-model="form.admin_username"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.admin_username }"
          placeholder="usuario"
          @input="clearFieldError('admin_username')"
        />
        <span v-if="errors.admin_username" class="error-msg">{{ errors.admin_username }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="admin-email">Correo Admin</label>
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

      <div class="form-group">
        <label class="form-label" for="admin-password">Contraseña Admin</label>
        <input
          id="admin-password"
          v-model="form.admin_password"
          type="password"
          class="form-input"
          :class="{ 'input-error': errors.admin_password }"
          placeholder="Mínimo 6 caracteres"
          maxlength="20"
          @input="clearFieldError('admin_password')"
        />
        <span v-if="errors.admin_password" class="error-msg">{{ errors.admin_password }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="admin-confirm-password">Confirmar Contraseña</label>
        <input
          id="admin-confirm-password"
          v-model="form.admin_confirm_password"
          type="password"
          class="form-input"
          :class="{ 'input-error': errors.admin_confirm_password }"
          placeholder="Repite la contraseña"
          maxlength="20"
          @input="clearFieldError('admin_confirm_password')"
        />
        <span v-if="errors.admin_confirm_password" class="error-msg">
          {{ errors.admin_confirm_password }}
        </span>
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
        <span>{{ isSubmitting ? 'Registrando...' : 'Registrar Empresa' }}</span>
      </button>
    </form>

    <RouterLink class="auth-link" to="/login">Volver al login</RouterLink>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { registerCompany } from '@/features/auth/api';
import type { CompanyRegisterRequest, CompanyResponse } from '@/features/auth/types';
import { getApiErrorMessage } from '@/services/apiClient';

interface RegisterForm extends CompanyRegisterRequest {
  admin_password: string;
  admin_confirm_password: string;
}

type RegistrationField = keyof RegisterForm;

const form = reactive<RegisterForm>({
  name: '',
  admin_email: '',
  admin_username: '',
  admin_password: '',
  admin_confirm_password: '',
  schema_name: '',
});

const errors = reactive<Record<RegistrationField, string>>({
  name: '',
  admin_email: '',
  admin_username: '',
  admin_password: '',
  admin_confirm_password: '',
  schema_name: '',
});

const isSubmitting = ref(false);
const submitError = ref('');
const registeredCompany = ref<CompanyResponse | null>(null);
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

  if (!form.admin_password) {
    errors.admin_password = 'La contraseña es obligatoria.';
    isValid = false;
  } else if (form.admin_password.length < 6) {
    errors.admin_password = 'Mínimo 6 caracteres.';
    isValid = false;
  } else if (form.admin_password.length > 20) {
    errors.admin_password = 'Máximo 20 caracteres.';
    isValid = false;
  }

  if (!form.admin_confirm_password) {
    errors.admin_confirm_password = 'Confirma la contraseña.';
    isValid = false;
  } else if (form.admin_confirm_password !== form.admin_password) {
    errors.admin_confirm_password = 'Las contraseñas no coinciden.';
    isValid = false;
  }

  return isValid;
}

async function submitRegistration(): Promise<void> {
  submitError.value = '';

  if (!validate()) {
    return;
  }

  isSubmitting.value = true;

  try {
    form.schema_name = deriveSchemaName(form.name.trim());
    registeredCompany.value = await registerCompany({
      name: form.name.trim(),
      schema_name: form.schema_name.trim(),
      admin_email: form.admin_email.trim().toLowerCase(),
      admin_username: form.admin_username.trim(),
    });
    successMessage.value = 'Empresa registrada. La contraseña queda pendiente en backend.';
  } catch (error) {
    submitError.value = getApiErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

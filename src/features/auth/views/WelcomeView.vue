<template>
  <section class="auth-card auth-card--wide">
    <div class="auth-brand">
      <img src="../../../logo/logo-blanco.png" alt="FlowDesk Logo" class="auth-brand__logo" />
    </div>

    <h3 class="auth-title">¡Bienvenido a Flowdesk!</h3>
    <p class="auth-description">Ya puedes iniciar sesión con tu cuenta.</p>

    <button class="btn-primary" @click="irAlLogin">Iniciar sesión</button>
  </section>
</template>

<script setup lang="ts">
import {useRouter } from 'vue-router';

const router = useRouter();
const irAlLogin = () => {
  router.push('/login');
};
</script>
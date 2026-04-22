<template>
    <div class="superAdmin-page">
        <div class="page-header-bar">
        <h1 class="page-title">Manejo de cuentas</h1>
        <button class="btn-logout" type="button" @click="cerrarSesion">Cerrar sesión</button>
        </div>

        <div class="filter">
            <button :class="['btn', active === 'negocios' ? 'activo' : '']" @click="active = 'negocios'">Negocios</button>
            <button :class="['btn', active === 'usuarios' ? 'activo' : '']" @click="active = 'usuarios'">Usuarios</button>
        </div>

        <div class="display">
            <div v-if="active === 'negocios'">
                <div v-for="negocio in negocios" :key="negocio.id" class="item" @click="">{{ negocio.nombre }}</div>
            </div>

            <div v-if="active === 'usuarios'">
                <div v-for="usuario in usuarios" :key="usuario.id" class="item" @click="">
                    <strong> {{ usuario.nombre }} </strong>
                    <span class="rol"> {{ usuario.rol }} </span>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const active = ref<'negocios' | 'usuarios'> ('negocios');
const negocios = ref([
    {id: 1, nombre: 'Negocio 1'}, 
    {id: 2, nombre: 'Negocio 2'},
]);
const usuarios = ref([
    {id: 1, nombre: 'Usuario 1', rol: 'empleado'}, 
    {id: 2, nombre: 'Usuario 2', rol: 'admin'},
]);

async function cerrarSesion(): Promise<void> {
  appStore.clearSession();
  await router.push({ name: 'login' });
}
</script>

<style scoped>
.superAdmin-page {
  font-family: var(--font-sans);
  background: var(--color-bg-app);
  min-height: 100vh;
  padding: 24px 28px;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  position: relative;
}

.page-header-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.btn-logout {
  padding: 8px 12px;
  border: 1px solid var(--color-structure-hover);
  border-radius: 8px;
  background: #fff;
  color: var(--color-structure-hover);
  font-size: 0.88rem;
  cursor: pointer;
}

.filter {
    display: inline-flex;
    padding: 4px;
    margin-bottom: 20px;
}

.btn {
    border-color: var(--color-warning);
    padding: 8px;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
}

.btn.activo {
    background: var(--color-warning);
    color: #fff;
}

.display {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.item {
    padding: 12px;
    border: 1px solid var(--color-structure-hover);
    border-radius: 8px;
    background: var(--color-honey);
    cursor: pointer;
}

.item:hover {
    filter: brightness(0.8)
}

.rol {
    margin-left: 10px;
    color: var(--color-text-secondary);
}

</style>
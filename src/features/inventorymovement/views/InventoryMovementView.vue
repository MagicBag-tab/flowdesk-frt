<template>
  <div class="movimiento-inventario-page">
    <div class="content-container">

        <div class="table-section">
            <h1 class="page-title">Movimiento de Inventario</h1>

        </div>

    </div>
  </div>
</template>

<script setup lang="ts">    

</script>

<style scoped>  
.movimiento-inventario-page {
  padding: 32px 36px;
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--color-text);
}

.content-container {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.table-section {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: var(--color-text);
}

</style>
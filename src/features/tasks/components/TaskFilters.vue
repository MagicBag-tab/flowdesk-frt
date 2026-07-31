<template>
  <div class="filters-container">

    <div class="search-container">
      <Search class="search-icon" :size="18" />

      <input
        v-model="search"
        type="text"
        placeholder="Buscar tarea..."
        @input="emitFilters"
      />
    </div>

    <select
      v-model="status"
      @change="emitFilters"
    >
      <option value="">Todos los estados</option>
      <option value="Pendiente">Pendiente</option>
      <option value="En progreso">En progreso</option>
      <option value="Completada">Completada</option>
    </select>

    <select
      v-model="priority"
      @change="emitFilters"
    >
      <option value="">Todas las prioridades</option>
      <option value="Alta">Alta</option>
      <option value="Media">Media</option>
      <option value="Baja">Baja</option>
    </select>

    <button
      class="btn-clear"
      @click="clearFilters"
    >
      Limpiar
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search } from 'lucide-vue-next';

const emit = defineEmits<{
  (
    e: 'change',
    filters: {
      search: string;
      status: string;
      priority: string;
    }
  ): void;
}>();

const search = ref('');
const status = ref('');
const priority = ref('');

function emitFilters() {
  emit('change', {
    search: search.value,
    status: status.value,
    priority: priority.value,
  });
}

function clearFilters() {
  search.value = '';
  status.value = '';
  priority.value = '';

  emitFilters();
}
</script>

<style scoped>
.filters-container {
  display: flex;
  align-items: center;
  gap: 16px;

  background: white;
  padding: 18px 22px;
  margin-bottom: 24px;

  border-radius: 12px;
  box-shadow: var(--shadow-card);
}

.search-container {
  flex: 2;

  display: flex;
  align-items: center;

  border: 1px solid #dbe3ef;
  border-radius: 8px;

  padding: 0 12px;
}

.search-icon {
  color: #9aa7bd;
  flex-shrink: 0;
}

.search-container input {
  width: 100%;
  border: none;
  outline: none;
  padding: 12px;
  font-size: .9rem;
  font-family: var(--font-sans);
  background: transparent;
}

select {
  flex: 1;

  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dbe3ef;

  font-size: .9rem;
  font-family: var(--font-sans);

  background: white;
}

.btn-clear {
  padding: 12px 18px;

  border: none;
  border-radius: 8px;

  background: var(--color-structure-base);
  color: white;

  font-weight: 600;
  cursor: pointer;

  transition: opacity .2s;
}

.btn-clear:hover {
  opacity: .9;
}

@media (max-width: 900px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container,
  select,
  .btn-clear {
    width: 100%;
  }
}
</style>
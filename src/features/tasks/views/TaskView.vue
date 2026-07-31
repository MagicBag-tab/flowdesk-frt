<template>
  <div class="tasks-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Gestión de tareas</h1>
        <p class="page-subtitle">
          Organiza y da seguimiento a las actividades del negocio.
        </p>
      </div>

      <button class="btn-create">
        + Nueva tarea
      </button>
    </div>

    <TaskSummaryCards :tasks="tasks" />

        <TaskFilters
        @change="updateFilters"
        />

        <TaskTable
        :tasks="tasks"
        />
    </div>
</template>

<script setup lang="ts">
import TaskSummaryCards from '../components/TaskSummaryCards.vue';
import { mockTasks } from '../data/mockTasks';
import TaskTable from '../components/TaskTable.vue';
import TaskFilters from '../components/TaskFilters.vue';

import { ref, computed } from 'vue';

const search = ref('');
const status = ref('');
const priority = ref('');

const tasks = computed(() => {
  return mockTasks.filter(task => {

    const matchesSearch =
      task.title.toLowerCase().includes(search.value.toLowerCase()) ||
      task.description.toLowerCase().includes(search.value.toLowerCase());

    const matchesStatus =
      !status.value || task.status === status.value;

    const matchesPriority =
      !priority.value || task.priority === priority.value;

    return matchesSearch && matchesStatus && matchesPriority;
  });
});

function updateFilters(filters: {
  search: string;
  status: string;
  priority: string;
}) {
  search.value = filters.search;
  status.value = filters.status;
  priority.value = filters.priority;
}
</script>

<style scoped>
.tasks-page {
  padding: 32px 36px;
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--color-text);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.page-subtitle {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.btn-create {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: var(--color-structure-base);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .2s;
}

.btn-create:hover {
  opacity: .9;
}

.coming-soon-card {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  padding: 32px;
}

.coming-soon-card h2 {
  margin-top: 0;
}

.coming-soon-card p {
  color: var(--color-text-secondary);
}
</style>
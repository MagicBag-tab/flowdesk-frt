<template>
  <div class="table-container">
    <table class="task-table">
      <thead>
        <tr>
          <th>Tarea</th>
          <th>Responsable</th>
          <th>Prioridad</th>
          <th>Estado</th>
          <th>Fecha límite</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="task in tasks"
          :key="task.id"
        >
          <td>
            <div class="task-info">
              <strong>{{ task.title }}</strong>
              <small>{{ task.description }}</small>
            </div>
          </td>

          <td>{{ task.assignee }}</td>

          <td>
            <span
              class="badge"
              :class="priorityClass(task.priority)"
            >
              {{ task.priority }}
            </span>
          </td>

          <td>
            <div class="status-wrapper">

              <select
                class="status-select"
                :class="statusClass(task.status)"
                :value="task.status"
                @change="
                  emit(
                    'status-change',
                    task.id,
                    ($event.target as HTMLSelectElement).value as TaskStatus
                  )
                "
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Completada">Completada</option>
              </select>

              <ChevronDown
                :size="14"
                class="status-arrow"
              />

            </div>
          </td>

          <td>{{ formatDate(task.dueDate) }}</td>

          <td class="actions-cell">

            <button
              class="btn-edit"
              @click="$emit('edit', task)"
            >
              ✏️
            </button>
          </td>
        </tr>

        <tr v-if="tasks.length === 0">
          <td colspan="6" class="empty-state">
            No hay tareas registradas.
          </td>
        </tr>

      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import type { Task, TaskPriority, TaskStatus } from '../types';

defineProps<{
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: 'edit', task: Task): void;
  (e: 'status-change', id: number, status: TaskStatus): void;
}>();

function priorityClass(priority: TaskPriority) {
  return {
    'badge--high': priority === 'Alta',
    'badge--medium': priority === 'Media',
    'badge--low': priority === 'Baja',
  };
}

function statusClass(status: TaskStatus) {
  return {
    'badge--pending': status === 'Pendiente',
    'badge--progress': status === 'En progreso',
    'badge--completed': status === 'Completada',
  };
}

function formatDate(date: string): string {
  const months = [ 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep',  'Oct', 'Nov', 'Dic',
  ];

  const taskDate = new Date(date);

  const day = String(taskDate.getDate()).padStart(2, '0');
  const month = months[taskDate.getMonth()];
  const year = taskDate.getFullYear();

  return `${day} - ${month} - ${year}`;
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.task-table {
  width: 100%;
  border-collapse: collapse;
}

.task-table thead {
  background: var(--color-structure-base);
}

.task-table th {
  padding: 16px 20px;
  text-align: left;
  color: white;
  font-size: .85rem;
}

.task-table td {
  padding: 18px 20px;
  border-bottom: 1px solid #edf1f7;
}

.task-info {
  display: flex;
  flex-direction: column;
}

.task-info small {
  margin-top: 4px;
  color: var(--color-text-secondary);
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 600;
}

.badge--high {
  background: #ffe3e3;
  color: #c92a2a;
}

.badge--medium {
  background: #fff3bf;
  color: #e67700;
}

.badge--low {
  background: #d3f9d8;
  color: #2b8a3e;
}

.badge--pending {
  background: #edf2ff;
  color: #364fc7;
}

.badge--progress {
  background: #d0ebff;
  color: #1971c2;
}

.badge--completed {
  background: #d3f9d8;
  color: #2b8a3e;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
}

.actions-cell{
  width:90px;
  text-align:center;
}

.btn-edit{
  border:none;
  background:transparent;
  cursor:pointer;
  font-size:1.1rem;
  transition:.2s;
}

.btn-edit:hover{
  transform:scale(1.15);

}

.status-wrapper{
  position:relative;
  display:inline-block;

}

.status-select{
  appearance:none;
  border:none;
  cursor:pointer;
  border-radius:999px;
  padding:6px 34px 6px 14px;
  font-size:.75rem;
  font-weight:600;
  outline:none;
  min-width:145px;
  text-align:center;
}

.status-arrow{
  position:absolute;
  right:12px;
  top:50%;
  transform:translateY(-50%);
  pointer-events:none;
  color:inherit;
}

</style>
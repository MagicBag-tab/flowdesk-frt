<template>
  <div class="modal-overlay">
    <div class="modal">

      <!-- Header -->
      <div class="modal-header">
        <h2>Editar tarea</h2>

        <button
          class="close-btn"
          @click="emit('close')"
        >
          <X :size="22" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">

        <div class="form-layout">

          <!-- Columna izquierda -->
          <div class="form-section">

            <h3>Información general</h3>

            <div class="form-group">
              <label>Título</label>

              <input
                v-model="title"
                type="text"
                placeholder="Ej. Actualizar inventario"
              />
            </div>

            <div class="form-group">
              <label>Descripción</label>

              <textarea
                v-model="description"
                rows="4"
                placeholder="Describe la tarea..."
              ></textarea>
            </div>

          </div>

          <!-- Columna derecha -->
          <div class="form-section">

            <h3>Detalles</h3>

            <div class="form-group">
              <label>Responsable</label>

              <select v-model="assignee">
                <option>Sin asignar</option>
                <option>María</option>
                <option>Juan</option>
                <option>Andrea</option>
              </select>
            </div>

            <div class="form-group">
              <label>Prioridad</label>

              <select v-model="priority">
                <option>Sin prioridad</option>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fecha límite</label>

              <input
                v-model="dueDate"
                type="date"
              />
            </div>

          </div>

        </div>

      </div>

      <!-- Footer -->
      <div class="modal-footer">

        <button
          class="btn-cancel"
          @click="emit('close')"
        >
          Cancelar
        </button>

        <button
          class="btn-create"
          @click="saveTask"
        >
          Guardar cambios
        </button>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { Task } from '../types';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', task: Task): void;
}>();

const title = ref('');
const description = ref('');
const assignee = ref('');
const priority = ref<Task['priority']>('Sin prioridad');
const dueDate = ref('');

watch(
  () => props.task,
  (task) => {
    if (!task) return;

    title.value = task.title;
    description.value = task.description;
    assignee.value = task.assignee;
    priority.value = task.priority;
    dueDate.value = task.dueDate;
  },
  { immediate: true }
);

function saveTask() {

  if (!title.value.trim()) {
    alert('Debes ingresar un título.');
    return;
  }

  const updatedTask: Task = {

    id: props.task.id,

    title: title.value,

    description: description.value,

    assignee: assignee.value,

    priority: priority.value,

    status: props.task.status,

    dueDate: dueDate.value,

  };

  emit('save', updatedTask);

  emit('close');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, .45);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 999;
}

.modal {
  width: 700px;
  max-width: 90vw;

  background: white;

  border-radius: 16px;

  box-shadow: 0 20px 60px rgba(0, 0, 0, .18);

  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 22px 28px;

  border-bottom: 1px solid #edf1f7;
}

.modal-header h2 {
  margin: 0;

  font-size: 1.6rem;

  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;

  cursor: pointer;

  color: #8fa3c1;

  display: flex;
  align-items: center;
}

.modal-body {
  padding: 20px 26px;
}

.form-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
}

.form-section h3 {
  margin: 0 0 14px;

  font-size: 1rem;
  font-weight: 700;

  color: var(--color-text);
}

.form-group {
  display: flex;
  flex-direction: column;

  margin-bottom: 14px;
}

.form-group label {
  margin-bottom: 6px;

  font-weight: 600;

  color: var(--color-text);

  font-size: .9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;

  padding: 11px 14px;

  border: 1px solid #dbe3ef;

  border-radius: 8px;

  font-size: .9rem;

  font-family: var(--font-sans);

  background: white;

  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-structure-base);
}

.form-group textarea {
  resize: none;
  height: 145px;
}

.form-group select {
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  padding: 16px 26px;

  border-top: 1px solid #edf1f7;
}

.btn-cancel {
  padding: 10px 18px;

  border: 1px solid #dbe3ef;
  border-radius: 8px;

  background: white;

  cursor: pointer;

  font-weight: 600;

  transition: .2s;
}

.btn-cancel:hover {
  background: #f8fafc;
}

.btn-create {
  padding: 10px 20px;

  border: none;
  border-radius: 8px;

  background: var(--color-structure-base);

  color: white;

  cursor: pointer;

  font-weight: 600;

  transition: .2s;
}

.btn-create:hover {
  opacity: .92;
}

@media (max-width: 850px) {

  .modal {
    width: 95%;
  }

  .form-layout {
    grid-template-columns: 1fr;
  }

  .form-group textarea {
    height: 110px;
  }

}
</style>
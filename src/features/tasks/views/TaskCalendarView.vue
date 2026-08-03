<template>
  <div class="calendar-page">
    <div class="page-header">
      <div>
        <h1>Calendario de tareas</h1>
        <p>Visualiza las tareas organizadas por fecha límite.</p>
      </div>
    </div>

    <div class="calendar-card">

      <div class="calendar-toolbar">

        <button
          class="month-btn"
          @click="previousMonth"
        >
          <ChevronLeft :size="20" />
        </button>

        <h2 class="calendar-title">
          {{ currentMonth }}
        </h2>

        <div class="calendar-actions">

          <button
            class="today-btn"
            @click="goToToday"
          >
            Hoy
          </button>

          <button
            class="month-btn"
            @click="nextMonth"
          >
            <ChevronRight :size="20" />
          </button>

        </div>

      </div>

      <div class="calendar-grid">

        <div
          v-for="day in weekDays"
          :key="day"
          class="weekday"
        >
          {{ day }}
        </div>

        <div
          v-for="(day,index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            today:day.isToday,
            outside:!day.currentMonth,
          }"
        >
          <span class="day-number">
            {{ day.day }}
          </span>
        <div
          v-for="task in day.currentMonth ? getTasksForDay(day.day) : []"
          :key="task.id"
          class="task-chip"
          @click="editTask(task)"
        >
          <span
            class="task-dot"
            :class="priorityClass(task.priority)"
          ></span>

          <span
            class="task-title"
            :title="task.title"
          >
            {{ shortTitle(task.title) }}
          </span>

        </div>
        </div>

      </div>

    </div>

  </div>

  <TaskEditModal
    v-if="showEditModal && selectedTask"
    :task="selectedTask"
    @close="showEditModal=false"
    @save="updateTask"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { mockTasks } from '../data/mockTasks';
import TaskEditModal from '../components/TaskEditModal.vue';
import type { Task } from '../types';

const weekDays=[
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb',
  'Dom',
];

const today=new Date();
const tasks=mockTasks;
const showEditModal=ref(false);
const selectedTask=ref<Task|null>(null);

const currentDate=ref(
  new Date(today.getFullYear(),today.getMonth(),1),
);

const currentMonth=computed(()=>{

  const month=currentDate.value.toLocaleDateString('es-ES',{
    month:'long',
  });

  const year=currentDate.value.getFullYear();

  return `${month.charAt(0).toUpperCase()+month.slice(1)} de ${year}`;
});

const calendarDays=computed(()=>{

  const year=currentDate.value.getFullYear();
  const month=currentDate.value.getMonth();

  const firstDay=new Date(year,month,1);
  const lastDay=new Date(year,month+1,0);

  const daysInMonth=lastDay.getDate();

  let startDay=firstDay.getDay();
  startDay=startDay===0?6:startDay-1;

  const previousMonthDays=new Date(year,month,0).getDate();

  const days:{
    day:number;
    currentMonth:boolean;
    isToday:boolean;
  }[]=[];

  for(let i=startDay;i>0;i--){

    days.push({
      day:previousMonthDays-i+1,
      currentMonth:false,
      isToday:false,
    });
  }

  for(let i=1;i<=daysInMonth;i++){

    days.push({
      day:i,
      currentMonth:true,
      isToday:
        i===today.getDate() &&
        month===today.getMonth() &&
        year===today.getFullYear(),
    });
  }

  let nextDay=1;

  while(days.length<42){

    days.push({
      day:nextDay,
      currentMonth:false,
      isToday:false,
    });
    nextDay++;
  }
  return days;
});

function previousMonth(){

  currentDate.value=new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth()-1,
    1,
  );
}

function nextMonth(){

  currentDate.value=new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth()+1,
    1,
  );
}

function goToToday(){

  currentDate.value=new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );
}

function editTask(task:Task){
  selectedTask.value=task;
  showEditModal.value=true;
}

function updateTask(updatedTask:Task){

  const index=tasks.findIndex(
    task=>task.id===updatedTask.id,
  );

  if(index===-1) return;
  tasks.splice(index,1,updatedTask);
  showEditModal.value=false;
}

function getTasksForDay(day:number){

  return tasks.filter(task=>{
    const date=new Date(task.dueDate);

    return(
      date.getDate()===day &&
      date.getMonth()===currentDate.value.getMonth() &&
      date.getFullYear()===currentDate.value.getFullYear()
    );
  });
}

function priorityClass(priority:string){

  return{
    high:priority==='Alta',
    medium:priority==='Media',
    low:priority==='Baja',
  };
}

function shortTitle(title:string){

  if(title.length<=18){
    return title;
  }
  return `${title.substring(0,18)}...`;
}

</script>

<style scoped>
.calendar-page{
  padding:32px 36px;
  min-height:100vh;
}

.page-header{
  margin-bottom:28px;
}

.page-header h1{
  margin:0;
  font-size:2rem;
  font-weight:700;
  color:var(--color-text);
}

.page-header p{
  margin-top:8px;
  color:var(--color-text-secondary);
  font-size:.95rem;
}

.calendar-card{
  background:white;
  border-radius:16px;
  box-shadow:var(--shadow-card);
  padding:28px;
}

.calendar-toolbar{
  display:grid;
  grid-template-columns:56px 1fr auto;
  align-items:center;
  margin-bottom:28px;
}

.calendar-title{
  margin:0;
  text-align:center;
  font-size:1.6rem;
  font-weight:700;
  color:var(--color-text);
}

.calendar-title h2{
  margin:0;
  font-size:1.6rem;
  font-weight:700;
  color:var(--color-text);
}

.calendar-actions{
  display:flex;
  align-items:center;
  gap:14px;
  justify-self:end;
}

.today-btn{
  width:68px;
  height:42px;
  border:none;
  border-radius:10px;
  background:var(--color-structure-base);
  color:white;
  cursor:pointer;
  font-size:.95rem;
  font-weight:600;
  transition:.2s;
}

.today-btn:hover{
  opacity:.9;
}

.month-btn{
  width:48px;
  height:48px;
  display:flex; 
  justify-content:center;
  align-items:center;
  border:none;
  border-radius:10px;
  background:var(--color-structure-base);
  color:white;
  cursor:pointer;
  transition:.2s;
} 

Observ

.month-btn:hover{
  opacity:.9;
}

.calendar-grid{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:14px;
}

.weekday{
  text-align:center;
  font-weight:700;
  color:var(--color-text-secondary);
}

.day-cell{
  height:120px;
  border:1px solid #e0e4e9;
  border-radius:12px;
  padding:10px;
  background:white;
  overflow:hidden;
  box-sizing:border-box;
}

.day-cell.today{
  background:#eef2f6;
  border:1px solid #d7e0ea;
  box-shadow:0 2px 8px rgba(0,0,0,.04);
}

.day-cell.outside{
  background:#fafbfd;
}

.day-cell.outside .day-number{
  color:#b8c1cc;
}

.day-number{
  font-weight:700;
  color:var(--color-text);
}

.day-cell.empty{
  background:transparent;
  border:none;
  box-shadow:none;
}

.day-cell:hover{
  background:#f7f9fc;
}

.task-chip{
  display:flex;
  align-items:center;
  gap:8px;
  width:100%;
  max-width:100%;
  margin-top:6px;
  overflow:hidden;
  box-sizing:border-box;
  cursor:pointer;
}

.task-chip:hover{
  background:#f6f8fb;
  border-radius:6px;
}

.task-dot{
  width:9px;
  height:9px;
  border-radius:50%;
  flex-shrink:0;
}

.task-dot.high{
  background:#ef4444;
}

.task-dot.medium{
  background:#f59e0b;
}

.task-dot.low{
  background:#22c55e;
}

.task-title{
  flex:1;
  min-width:0;
  max-width:100%;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}
</style>
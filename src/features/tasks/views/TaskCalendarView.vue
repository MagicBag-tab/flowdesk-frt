<template>
  <div class="calendar-page">

    <div class="page-header">
      <div>
        <h1>Calendario de tareas</h1>
        <p>Visualiza las tareas organizadas por fecha límite.</p>
      </div>
    </div>

    <div class="calendar-card">

      <!-- Toolbar -->
      <div class="calendar-toolbar">

        <div class="calendar-nav">

          <button
            class="month-btn"
            @click="previousMonth"
          >
            <ChevronLeft :size="20" />
          </button>

          <h2 class="calendar-title">
            {{ currentMonth }}
          </h2>

          <button
            class="month-btn"
            @click="nextMonth"
          >
            <ChevronRight :size="20" />
          </button>

        </div>

        <div class="view-switch">

          <button
            class="calendar-btn"
            @click="goToToday"
          >
            Hoy
          </button>

          <button
            class="calendar-btn"
            :class="{ 'calendar-btn--active': calendarView==='day' }"
            @click="calendarView='day'"
          >
            Día
          </button>

          <button
            class="calendar-btn"
            :class="{ 'calendar-btn--active': calendarView==='week' }"
            @click="calendarView='week'"
          >
            Semana
          </button>

          <button
            class="calendar-btn"
            :class="{ 'calendar-btn--active': calendarView==='month' }"
            @click="calendarView='month'"
          >
            Mes
          </button>

        </div>

      </div>

      <!-- ================= MES ================= -->

      <div
        v-if="calendarView==='month'"
        class="calendar-grid"
      >

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

      <!-- ================= SEMANA ================= -->

      <div
        v-else-if="calendarView==='week'"
        class="week-view"
      >

        <div class="week-grid">

          <div
            v-for="day in weekDaysData"
            :key="day.name"
            class="week-column"
          >

            <div class="week-header">

              <h3>{{ day.name }}</h3>

              <span>{{ day.day }}</span>

            </div>

            <div class="week-body">

              <div
                v-for="task in getTasksForDay(day.day)"
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

      <!-- ================= DÍA ================= -->

      <div
        v-else
        class="day-view"
      >

        <div class="day-header">

          <h2 class="day-title">
            {{ formattedCurrentDate }}
          </h2>

          <div class="day-divider"></div>

          <div class="day-counter">

            📋

            <span>
              {{ getTasksForCurrentDay().length }}
              {{ getTasksForCurrentDay().length===1 ? 'tarea programada' : 'tareas programadas' }}
            </span>

          </div>

        </div>

        <div class="day-list">

          <div
            v-for="task in getTasksForCurrentDay()"
            :key="task.id"
            class="day-card"
            @click="editTask(task)"
          >

            <div class="day-card-top">

              <div class="day-card-title">

                <span
                  class="task-dot"
                  :class="priorityClass(task.priority)"
                ></span>

                <strong>{{ task.title }}</strong>

              </div>

            </div>

            <p class="day-description">
              {{ task.description }}
            </p>

            <div class="day-footer">

            <div class="assignee">
                👤
                {{ task.assignee }}
            </div>

              <span
                class="priority-badge"
                :class="priorityClass(task.priority)"
              >
                {{ task.priority }}
              </span>

            </div>

          </div>

          <div
            v-if="getTasksForCurrentDay().length===0"
            class="empty-day"
          >

            <h3>No hay tareas</h3>

            <p>
              No existen tareas programadas para este día.
            </p>

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
import { computed, ref, watch } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { mockTasks } from '../data/mockTasks';
import TaskEditModal from '../components/TaskEditModal.vue';
import type { Task } from '../types';

const weekDays=[
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
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

const formattedCurrentDate = computed(() => {

  const text = currentDate.value.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
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

const weekDaysData=computed(()=>{

  const current=new Date(currentDate.value);

  const day=current.getDay();

  const diff=day===0?-6:1-day;

  current.setDate(current.getDate()+diff);

  return Array.from({ length:7 },(_,index)=>{

    const date = new Date(current);

    date.setDate(current.getDate()+index);

    return{
      name:weekDays[index],
      day:date.getDate(),
      date,
    };
  });
});

const calendarView=ref<'day'|'week'|'month'>('month');
watch(calendarView, (view) => {

  if (view === 'week' || view === 'day') {

    currentDate.value = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
  }
});
function previousMonth(){

  if(calendarView.value==='day'){

    currentDate.value=new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth(),
      currentDate.value.getDate()-1,
    );
    return;
  }

  currentDate.value=new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth()-1,
    1,
  );
}

function nextMonth(){

  if(calendarView.value==='day'){

    currentDate.value=new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth(),
      currentDate.value.getDate()+1,
    );

    return;
  }

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
    today.getDate(),
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
    const [year, month, taskDay] = task.dueDate
      .split('-')
      .map(Number);
    return(
      taskDay===day &&
      month-1===currentDate.value.getMonth() &&
      year===currentDate.value.getFullYear()
    );
  });
}

function getTasksForCurrentDay(){

  return tasks.filter(task=>{
    const [year, month, day] = task.dueDate
      .split('-')
      .map(Number);
    return(
      day===currentDate.value.getDate() &&
      month-1===currentDate.value.getMonth() &&
      year===currentDate.value.getFullYear()
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

@media (max-width:640px){
  .calendar-page{
    padding:20px 16px;
  }
  .calendar-card{
    overflow-x:auto;
  }
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
  overflow-x:auto;
}

.calendar-toolbar{
    display:flex;
    flex-direction:column;
    gap:20px;
    margin-bottom:14px;
    padding-bottom:20px;
    border-bottom:1px solid #eef0f3;
}

.calendar-nav{
    display:grid;
    grid-template-columns:48px 1fr 48px;
    align-items:center;
    gap:20px;
}

.calendar-title{
    text-align:center;
    margin:0;
    font-size:2rem;
    font-weight:700;
}

.view-switch{
    display:flex;
    justify-content:center;
    gap:10px;
    flex-wrap:wrap;
}

.calendar-btn{
  border:none;
  background:transparent;
  padding:8px 16px;
  font-size:.9rem;
  font-weight:600;
  color:var(--color-text-secondary);
  border-radius:999px;
  cursor:pointer;
  white-space:nowrap;
  transition:background .15s ease,color .15s ease,box-shadow .15s ease;
}

.calendar-btn:hover:not(.calendar-btn--active){
  color:var(--color-text);
}

.calendar-btn--active{
  background:var(--color-structure-base);
  color:white;
  box-shadow:0 1px 3px rgba(16,24,40,.15);
}

.month-btn{
  width:40px;
  height:40px;
  display:flex;
  justify-content:center;
  align-items:center;
  border:none;
  border-radius:50%;
  background:var(--color-structure-base);
  color:white;
  cursor:pointer;
  flex-shrink:0;
  transition:transform .15s ease,opacity .15s ease;
}

.month-btn:hover{
  opacity:.9;
  transform:scale(1.05);
}

@media (max-width:640px){
  .calendar-title{
    font-size:1.25rem;
  }
  .month-btn{
    width:34px;
    height:34px;
  }
  .calendar-btn{
    padding:6px 10px;
    font-size:.82rem;
  }
}

.calendar-grid{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  grid-template-rows:auto repeat(6,1fr);
  gap:10px;
  height:650px;
}

.calendar-grid,
.week-grid{
    min-width:1000px;
}

.weekday{
  text-align:center;
  font-weight:700;
  color:var(--color-text-secondary);
  padding-bottom:4px;
}

.day-cell{
  height:100%;
  min-height:0;
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
  overflow:hidden;
  box-sizing:border-box;
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
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}

.week-view,
.day-view{
  min-height:650px;
  display:flex;
  flex-direction:column;
}

.week-view{
  justify-content:flex-start;
  align-items:stretch;
  padding-top:8px;
}

.week-view h2,
.day-view h2{
  margin-bottom:12px;
  color:var(--color-text);
}

.week-view p,
.day-view p{
  color:var(--color-text-secondary);
}

.week-grid{
  display:grid;
  grid-template-columns:repeat(7, minmax(0,1fr));
  gap:16px;
  width:100%;
}

.week-body{
  flex:1;
  padding:14px;
  overflow-y:auto;
}

.week-header{
  padding:16px;
  text-align:center;
  border-bottom:1px solid #edf1f7;
  background:#f8fafc;
}

.week-header h3{
  margin:0;
  font-size:1rem;
  color:var(--color-text);
}

.week-header span{
  display:block;
  margin-top:6px;
  font-size:1.5rem;
  font-weight:700;
  color:var(--color-text);
}

.week-body{
  flex:1;
  padding:12px;
  overflow-y:auto;
  background:white;
}

.week-body .task-chip{
  margin-bottom:10px;
}

.week-column{
  width:100%;
  height:520px;
  border:1px solid #e4e8ef;
  border-radius:12px;
  background:white;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  box-sizing:border-box;
}

.week-body{
    flex:1;
    padding:12px;
    overflow-y:auto;
}

@media (max-width:1100px){

    .calendar-page{
        padding:20px;
    }

    .calendar-grid,
    .week-grid{
        min-width:1100px;
    }

    .calendar-card{
        overflow-x:auto;
    }

}

.day-view{
    align-items:stretch;
    justify-content:flex-start;
    text-align:left;
    min-height:650px;
}

.day-header{
    margin-bottom:32px;
}

.day-title{
    margin:0;
    font-size:2.2rem;
    font-weight:700;
    color:var(--color-text);
}

.day-counter{
    display:flex;
    align-items:center;
    gap:12px;
    margin-top:18px;
    font-size:1.1rem;
    font-weight:600;
    color:var(--color-text);
}

.day-list{
    display:flex;
    flex-direction:column;
    gap:18px;
}

.day-card{
    background:#fff;
    border:1px solid #e5e9f0;
    border-radius:18px;
    padding:24px;
    cursor:pointer;
    transition:.25s;
}

.day-card:hover{
    transform:translateY(-3px);
    box-shadow:0 12px 24px rgba(0,0,0,.08);
}

.day-card-top{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:12px;
}

.day-card-title{
    display:flex;
    align-items:center;
    gap:12px;
    font-size:1.45rem;
    font-weight:700;
}

.day-description{
    margin:18px 0;
    font-size:1.05rem;
    line-height:1.6;
    color:var(--color-text-secondary);
}

.day-footer{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:24px;
    font-size:.95rem;
    color:var(--color-text-secondary);
}

.day-divider{
    width:100%;
    height:1px;
    background:#e7ebf1;
    margin:18px 0;
}

.empty-day{
    margin-top:60px;
    text-align:center;
    color:var(--color-text-secondary);
}

.empty-day h3{
    margin-bottom:10px;
}

.priority-badge{
    padding:8px 18px;
    border-radius:999px;
    font-size:.9rem;
    font-weight:700;
}

.priority-badge.high{
    background:#FDECEC;
    color:#D14343;
}

.priority-badge.medium{
    background:#FEF4D7;
    color:#B7791F;
}

.priority-badge.low{
    background:#DCFCE7;
    color:#15803D;
}

.assignee{
    display:flex;
    align-items:center;
    gap:8px;
}

</style>
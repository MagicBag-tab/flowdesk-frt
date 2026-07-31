export type TaskStatus = 'Pendiente' | 'En progreso' | 'Completada';

export type TaskPriority = 'Alta' | 'Media' | 'Baja';

export interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}
export type TasksFeatureStatus = 'placeholder';

export interface TasksFeaturePlaceholder {
  status: TasksFeatureStatus;
  summary: string;
}

export const tasksFeaturePlaceholder: TasksFeaturePlaceholder = {
  status: 'placeholder',
  summary: 'El modulo de tareas no se implementa en esta fase porque el enfoque actual esta en autenticacion y onboarding.',
};

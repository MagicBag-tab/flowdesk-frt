import type { Task } from '../types';

export const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Actualizar inventario',
    description: 'Revisar el stock de productos.',
    assignee: 'María',
    priority: 'Alta',
    status: 'Pendiente',
    dueDate: '2026-08-01',
  },
  {
    id: 2,
    title: 'Contactar proveedor',
    description: 'Solicitar cotización de productos.',
    assignee: 'Juan',
    priority: 'Media',
    status: 'En progreso',
    dueDate: '2026-08-03',
  },
  {
    id: 3,
    title: 'Preparar reporte mensual',
    description: 'Generar reporte de ventas.',
    assignee: 'Andrea',
    priority: 'Baja',
    status: 'Completada',
    dueDate: '2026-07-30',
  },
  {
    id: 4,
    title: 'Validar precios de productos',
    description: 'Verificar que los productos tengan los precios correctos.',
    assignee: 'Josué',
    priority: 'Media',
    status: 'En progreso',
    dueDate: '2026-08-22',
  },
  
];
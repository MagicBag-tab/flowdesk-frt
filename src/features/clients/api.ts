import { apiClient } from '@/services/apiClient';

export interface Client {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientCreatePayload {
  nombre: string;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
}

export interface ClientUpdatePayload {
  nombre?: string;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
}

// ==========================================
// API Functions
// ==========================================

/**
 * Obtener lista de clientes (Opcional: buscar por nombre y filtrar por estado)
 */
export function fetchClients(search?: string, active_only?: boolean): Promise<Client[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (active_only !== undefined) params.append('active_only', String(active_only));

  const queryString = params.toString();
  const url = `/api/v1/commercial/clients${queryString ? `?${queryString}` : ''}`;

  return apiClient.request<Client[]>(url, {
    method: 'GET',
    auth: true,
  });
}

/**
 * Obtener un cliente por ID
 */
export function getClient(id: string): Promise<Client> {
  return apiClient.request<Client>(`/api/v1/commercial/clients/${id}`, {
    method: 'GET',
    auth: true,
  });
}

/**
 * Crear un nuevo cliente
 */
export function createClient(payload: ClientCreatePayload): Promise<Client> {
  return apiClient.request<Client>('/api/v1/commercial/clients', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

/**
 * Actualizar los datos de un cliente existente
 */
export function updateClient(id: string, payload: ClientUpdatePayload): Promise<Client> {
  return apiClient.request<Client>(`/api/v1/commercial/clients/${id}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  });
}

/**
 * Activar o desactivar un cliente
 */
export function toggleClientStatus(id: string, is_active: boolean): Promise<Client> {
  return apiClient.request<Client>(`/api/v1/commercial/clients/${id}/status`, {
    method: 'PATCH',
    auth: true,
    body: { is_active },
  });
}

/**
 * Eliminar (Soft delete) un cliente
 */
export function deleteClient(id: string): Promise<void> {
  return apiClient.request<void>(`/api/v1/commercial/clients/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

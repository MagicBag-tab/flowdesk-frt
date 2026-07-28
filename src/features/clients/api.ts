import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
  UpdateClientStatusPayload,
} from './types';
import { apiClient } from '@/services/apiClient';

export interface FetchClientsParams {
  search?: string;
  activeOnly?: boolean;
}

export function fetchClients(params: FetchClientsParams = {}): Promise<Client[]> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.activeOnly !== undefined) query.set('active_only', String(params.activeOnly));

  const queryString = query.toString();
  const path = `/api/v1/commercial/clients${queryString ? `?${queryString}` : ''}`;

  return apiClient.request<Client[]>(path, {
    method: 'GET',
    auth: true,
  });
}

export function fetchClient(clientId: string): Promise<Client> {
  return apiClient.request<Client>(`/api/v1/commercial/clients/${clientId}`, {
    method: 'GET',
    auth: true,
  });
}

export function createClient(payload: CreateClientPayload): Promise<Client> {
  return apiClient.request<Client>('/api/v1/commercial/clients', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export function updateClient(clientId: string, payload: UpdateClientPayload): Promise<Client> {
  return apiClient.request<Client>(`/api/v1/commercial/clients/${clientId}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  });
}

export function updateClientStatus(
  clientId: string,
  payload: UpdateClientStatusPayload,
): Promise<Client> {
  return apiClient.request<Client>(`/api/v1/commercial/clients/${clientId}/status`, {
    method: 'PATCH',
    auth: true,
    body: payload,
  });
}

export function deleteClient(clientId: string): Promise<void> {
  return apiClient.request<void>(`/api/v1/commercial/clients/${clientId}`, {
    method: 'DELETE',
    auth: true,
  });
}

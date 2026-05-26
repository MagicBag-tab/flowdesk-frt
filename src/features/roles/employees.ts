import { apiClient } from '@/services/apiClient';
import type { UserResponse } from './api';

export interface CreateEmployeePayload {
  username: string;
  email: string;
  role_id: number;
}

export function createEmployee(payload: CreateEmployeePayload): Promise<UserResponse> {
  return apiClient.request<UserResponse>('/api/v1/auth/employees', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export function fetchRoles(): Promise<{ id: number; name: string; description: string | null }[]> {
  return apiClient.request('/api/v1/roles', {
    method: 'GET',
    auth: true,
  });
}
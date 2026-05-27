import { apiClient } from '@/services/apiClient';

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role_id: number;
  role_name: string;
  company_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateEmployeePayload {
  username: string;
  email: string;
  role_id: number;
}

export function fetchEmployees(): Promise<UserResponse[]> {
  return apiClient.request<UserResponse[]>('/api/v1/users', {
    method: 'GET',
    auth: true,
  });
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

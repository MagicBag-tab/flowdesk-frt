import type {
  CompanyRegisterRequest,
  CompanyResponse,
  LoginRequest,
  TokenResponse,
} from '@/features/auth/types';
import { apiClient } from '@/services/apiClient';

export function loginWithPassword(payload: LoginRequest): Promise<TokenResponse> {
  return apiClient.request<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function registerCompany(payload: CompanyRegisterRequest): Promise<CompanyResponse> {
  return apiClient.request<CompanyResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function setPassword(token: string, password: string): Promise<{ message: string}> {
  return apiClient.request<{message: string}>('/api/v1/auth/password/set', {
    method: 'POST',
    body: { token, new_password: password },
  });
}

export function resetPassword(token: string, password: string): Promise<{ message: string}> {
  return apiClient.request<{message: string}>('/api/v1/auth/password/reset', {
    method: 'POST',
    body: { token, new_password: password },
  });
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiClient.request('/api/v1/auth/password/forgot', {
    method: 'POST',
    body: { email }
  });
}
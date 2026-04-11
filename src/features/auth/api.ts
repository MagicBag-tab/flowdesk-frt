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

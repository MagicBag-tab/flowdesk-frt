import { apiClient } from '@/services/apiClient';

export interface CompanyResponse {
  id: string;
  name: string;
  schema_name: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateCompanyPayload {
  name: string;
  admin_email: string;
  admin_username: string;
}

export function fetchCompanies(): Promise<CompanyResponse[]> {
  return apiClient.request<CompanyResponse[]>('/api/v1/companies', {
    method: 'GET',
    auth: true,
  });
}

export function createCompany(payload: CreateCompanyPayload): Promise<CompanyResponse> {
  return apiClient.request<CompanyResponse>('/api/v1/auth/register', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

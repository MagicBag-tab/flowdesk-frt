export interface ProfileResponse {
  id: string;
  username: string;
  email: string;
  role_id: number;
  role_name: string;
  company_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProfileUpdatePayload {
  username: string;
}

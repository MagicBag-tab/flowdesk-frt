export interface RoleResponse {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface EmployeeDraft {
  username: string;
  email: string;
  role: number;
}

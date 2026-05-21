import {apiClient} from '../../services/apiClient';

export interface UserResponse{
    id: string;
    username: string;
    email: string;
    role_id: number;
    role_name: string;
    company_id: string | null;
    is_active: boolean;
    created_at: string;
}

export function fetchUsers(): Promise<UserResponse[]> {
    return apiClient.request<UserResponse[]>('/api/v1/users', {
        method: 'GET',
        auth: true,
    });
}
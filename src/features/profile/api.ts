import { apiClient, ApiError } from '@/services/apiClient';
import { appStore } from '@/stores/app.store';
import type { ProfileResponse, ProfileUpdatePayload } from '@/features/profile/types';


export async function fetchProfile(): Promise<ProfileResponse> {
  const users = await apiClient.request<ProfileResponse[]>('/api/v1/users', {
    method: 'GET',
    auth: true,
  });

  const ownId = appStore.state.session?.claims?.sub;
  const own = users.find((user) => user.id === ownId);

  if (!own) {
    throw new ApiError(404, 'No se encontró tu usuario en la respuesta del servidor.');
  }

  return own;
}

export function updateProfile(userId: string, payload: ProfileUpdatePayload): Promise<ProfileResponse> {
  return apiClient.request<ProfileResponse>(`/api/v1/users/${userId}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  });
}

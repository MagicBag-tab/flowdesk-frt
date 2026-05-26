import { appStore } from '@/stores/app.store';
import { ApiError } from '@/services/apiClient';
import { appEnv } from '@/services/env';
import type { InventoryProduct } from './types';

export interface ImportResult {
  inserted: number;
  products: InventoryProduct[];
}

export async function importProductsExcel(file: File): Promise<ImportResult> {
  const token = appStore.accessToken;
  if (!token) throw new ApiError(401, 'No hay sesión activa.');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${appEnv.apiBaseUrl}/api/v1/inventory/products/import`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const text = await response.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!response.ok) {
    const detail =
      (data as { detail?: string; message?: string })?.detail ||
      (data as { message?: string })?.message ||
      `Error ${response.status}`;
    throw new ApiError(response.status, detail);
  }

  return data as ImportResult;
}
import { appStore } from '@/stores/app.store';
import { ApiError } from '@/services/apiClient';
import { appEnv } from '@/services/env';
import type { InventoryProduct } from './types';

export interface ImportResult {
  inserted: number;
  products: InventoryProduct[];
}

interface ImportRowError {
  row?: number;
  column?: string;
  message?: string;
}

function getImportErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;

  const errorPayload = payload as {
    detail?: string;
    message?: string;
    errors?: ImportRowError[];
  };

  if (Array.isArray(errorPayload.errors) && errorPayload.errors.length > 0) {
    const rowMessages = errorPayload.errors
      .slice(0, 5)
      .map(error => {
        const row = error.row ? `Fila ${error.row}` : 'Fila';
        const column = error.column ? `, ${error.column}` : '';
        return `${row}${column}: ${error.message ?? 'Dato invalido'}`;
      });

    const extraCount = errorPayload.errors.length - rowMessages.length;
    const suffix = extraCount > 0 ? ` (+${extraCount} errores mas)` : '';

    return `${errorPayload.message ?? 'El archivo tiene filas invalidas'}: ${rowMessages.join('; ')}${suffix}`;
  }

  return errorPayload.detail || errorPayload.message || fallback;
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
    throw new ApiError(response.status, getImportErrorMessage(data, `Error ${response.status}`));
  }

  return data as ImportResult;
}

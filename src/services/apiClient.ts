import type { BackendErrorResponse } from '@/features/auth/types';

import { appEnv } from '@/services/env';
import { appStore } from '@/stores/app.store';

export class ApiError extends Error {
  status: number;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
}

function normalizeErrorMessage(payload: unknown): string | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  const backendError = payload as BackendErrorResponse;

  if (typeof backendError.detail === 'string') {
    return backendError.detail;
  }

  if (typeof backendError.message === 'string') {
    return backendError.message;
  }

  if (backendError.errors && typeof backendError.errors === 'object') {
    const entries = Object.values(backendError.errors).flatMap((value) =>
      Array.isArray(value) ? value : [value],
    );

    const firstError = entries.find((value) => typeof value === 'string');
    return typeof firstError === 'string' ? firstError : null;
  }

  return null;
}

async function parseResponse(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
}

function buildUrl(path: string): string {
  if (!appEnv.hasApiBaseUrl) {
    throw new ApiError(
      500,
      appEnv.apiBaseUrlError ?? 'No se encontro configuracion para la URL base del backend.',
    );
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${appEnv.apiBaseUrl}${normalizedPath}`;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Ocurrio un error inesperado. Intenta de nuevo.';
}

export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers ?? {});
    headers.set('Accept', 'application/json');

    const isFormData = options.body instanceof FormData;
    if (!isFormData && options.body !== undefined && options.body !== null) {
      headers.set('Content-Type', 'application/json');
    }

    if (options.auth) {
      const accessToken = appStore.accessToken;

      if (!accessToken) {
        throw new ApiError(401, 'No hay una sesion activa para completar esta solicitud.');
      }

      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    try {
      const requestBody: BodyInit | undefined =
        isFormData && options.body instanceof FormData
          ? options.body
          : options.body !== undefined && options.body !== null
            ? JSON.stringify(options.body)
            : undefined;

      const response = await fetch(buildUrl(path), {
        ...options,
        headers,
        body: requestBody,
      });

      const responsePayload = await parseResponse(response);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          normalizeErrorMessage(responsePayload) ??
            `La solicitud fallo con estado ${response.status}.`,
        );
      }

      return responsePayload as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        0,
        'No se pudo conectar con el backend. Verifica VITE_API_BASE_URL y confirma que el API este disponible.',
      );
    }
  },
};

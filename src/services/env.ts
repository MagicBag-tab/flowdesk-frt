export interface AppEnv {
  apiBaseUrl: string;
  apiBaseUrlError: string | null;
  hasApiBaseUrl: boolean;
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

export function resolveApiBaseUrl(rawApiBaseUrl?: string): string {
  const configured = rawApiBaseUrl?.trim() ?? '';

  if (import.meta.env.PROD) {
    return '';
  }

  return (configured || '').replace(/\/+$/, '');
}

export const appEnv: AppEnv = {
  apiBaseUrl: resolveApiBaseUrl(configuredApiBaseUrl),
  apiBaseUrlError: null,
  hasApiBaseUrl: true,
};

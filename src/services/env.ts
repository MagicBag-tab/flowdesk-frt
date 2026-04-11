export interface AppEnv {
  apiBaseUrl: string;
  apiBaseUrlError: string | null;
  hasApiBaseUrl: boolean;
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

export const appEnv: AppEnv = {
  apiBaseUrl: configuredApiBaseUrl.replace(/\/+$/, ''),
  apiBaseUrlError: configuredApiBaseUrl
    ? null
    : 'VITE_API_BASE_URL no esta configurado. Define la URL base del backend antes de enviar formularios.',
  hasApiBaseUrl: Boolean(configuredApiBaseUrl),
};

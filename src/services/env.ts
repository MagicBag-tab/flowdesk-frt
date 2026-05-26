export interface AppEnv {
  apiBaseUrl: string;
  apiBaseUrlError: string | null;
  hasApiBaseUrl: boolean;
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

export const appEnv: AppEnv = {
  apiBaseUrl: configuredApiBaseUrl.replace(/\/+$/, ''),
  apiBaseUrlError: null,
  hasApiBaseUrl: true,
};

import { computed, reactive, readonly } from 'vue';

import type { AuthSession, TokenResponse } from '@/features/auth/types';
import {
  clearStoredSession,
  createSession,
  loadStoredSession,
  saveStoredSession,
} from '@/services/authStorage';

interface AppState {
  hydrated: boolean;
  session: AuthSession | null;
}

const state = reactive<AppState>({
  hydrated: false,
  session: null,
});

function hydrate(): void {
  if (state.hydrated) {
    return;
  }

  state.session = loadStoredSession();
  state.hydrated = true;
}

function setSession(tokenResponse: TokenResponse): void {
  state.session = createSession(tokenResponse);
  state.hydrated = true;
  saveStoredSession(state.session);
}

function clearSession(): void {
  state.session = null;
  state.hydrated = true;
  clearStoredSession();
}

const isAuthenticated = computed(() => Boolean(state.session?.accessToken));
const roleName = computed(() => {
  const roleClaim = state.session?.claims?.role;
  return typeof roleClaim === 'string' || typeof roleClaim === 'number'
    ? String(roleClaim)
    : null;
});
const schemaName = computed(() => state.session?.claims?.schema_name ?? null);
const companyId = computed(() => state.session?.claims?.company_id ?? null);

export const appStore = {
  state: readonly(state),
  isAuthenticated,
  roleName,
  schemaName,
  companyId,
  hydrate,
  setSession,
  clearSession,
  get accessToken(): string | null {
    return state.session?.accessToken ?? null;
  },
};

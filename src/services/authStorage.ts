import type { AuthSession, AuthTokenClaims, TokenResponse } from '@/features/auth/types';

const AUTH_STORAGE_KEY = 'flowdesk.auth.session';

function decodeJwtPayload(token: string): AuthTokenClaims | null {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');

    const decodedPayload = atob(normalizedPayload);
    return JSON.parse(decodedPayload) as AuthTokenClaims;
  } catch {
    return null;
  }
}

export function createSession(tokenResponse: TokenResponse): AuthSession {
  return {
    accessToken: tokenResponse.access_token,
    tokenType: tokenResponse.token_type,
    claims: decodeJwtPayload(tokenResponse.access_token),
  };
}

export function saveStoredSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function loadStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as Partial<AuthSession & TokenResponse>;

    if (typeof parsedSession.accessToken === 'string') {
      return {
        accessToken: parsedSession.accessToken,
        tokenType: parsedSession.tokenType ?? 'bearer',
        claims: parsedSession.claims ?? decodeJwtPayload(parsedSession.accessToken),
      };
    }

    if (typeof parsedSession.access_token === 'string') {
      return createSession(parsedSession as TokenResponse);
    }
  } catch {
    clearStoredSession();
  }

  return null;
}

export function clearStoredSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

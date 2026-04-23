import { router } from 'expo-router';

import { clearStoredTokens, getStoredAccessToken } from '@/lib/auth-storage';
import { env } from '@/lib/env';
import { isRecordLike } from '@/lib/errors';

type ApiPayload = {
  data?: unknown;
  detail?: string;
  message?: string;
  error?: string;
};

function joinUrl(base: string, path: string) {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function isApiPayload(value: unknown): value is ApiPayload {
  return isRecordLike(value);
}

export function resolveApiUrl(path: string) {
  return joinUrl(env.apiBaseURL, path);
}

export function resolveWsUrl(path: string) {
  return joinUrl(env.apiBaseURL.replace(/^http/, 'ws'), path);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init.headers ?? {});

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (authenticated) {
    const accessToken = await getStoredAccessToken();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(resolveApiUrl(path), {
    ...init,
    headers,
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    await clearStoredTokens();
    router.replace('/login');
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const message = isApiPayload(payload)
      ? (payload.detail ?? payload.message ?? payload.error)
      : undefined;

    throw new Error(message ?? 'Não foi possível concluir a solicitação.');
  }

  if (isApiPayload(payload) && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

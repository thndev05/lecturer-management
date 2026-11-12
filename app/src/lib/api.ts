import i18n from './i18n';

export class ApiError extends Error {
  constructor(
    public status: number,
    key: string,
  ) {
    super(key);
  }
}
export async function request<T>(
  path: string,
  token?: string | null,
  init: RequestInit = {},
): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!base) throw new Error('config');
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 30000);
  try {
    const response = await fetch(`${base}${path}`, { ...init, headers, signal: abort.signal });
    if (!response.ok) {
      const keys: Record<number, string> = {
        400: 'invalid',
        401: path === '/auth/login' ? 'credentials' : 'unauthorized',
        404: 'notFound',
        409: 'duplicate',
        413: 'photoInvalid',
        429: 'tooMany',
      };
      throw new ApiError(response.status, keys[response.status] ?? 'server');
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('network');
  } finally {
    clearTimeout(timer);
  }
}
export function errorText(error: unknown) {
  return String(
    i18n.t(error instanceof Error && i18n.exists(error.message) ? error.message : 'server'),
  );
}

// Lightweight HTTP client using fetch with optional bearer token
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5226/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody> {
  path: string;
  method?: HttpMethod;
  body?: TBody;
  token?: string | null;
}

async function request<TResponse, TBody = unknown>({ path, method = 'GET', body, token }: RequestOptions<TBody>): Promise<TResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  if (res.status === 204) {
    // No content
    return undefined as unknown as TResponse;
  }

  return (await res.json()) as TResponse;
}

export const httpClient = {
  get: <T>(path: string, token?: string | null) => request<T>({ path, method: 'GET', token }),
  post: <T, B = unknown>(path: string, body: B, token?: string | null) => request<T, B>({ path, method: 'POST', body, token }),
  put: <T, B = unknown>(path: string, body: B, token?: string | null) => request<T, B>({ path, method: 'PUT', body, token }),
  patch: <T, B = unknown>(path: string, body: B, token?: string | null) => request<T, B>({ path, method: 'PATCH', body, token }),
  delete: <T>(path: string, token?: string | null) => request<T>({ path, method: 'DELETE', token }),
};

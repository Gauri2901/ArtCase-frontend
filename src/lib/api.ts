const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

export const API_BASE_URL = envApiBaseUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');

type RequestOptions = {
  method?: string;
  token?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body, headers = {} } = options;

  if (!API_BASE_URL) {
    throw new Error('API is not configured. Set VITE_API_BASE_URL in the frontend deployment settings.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data as T;
}

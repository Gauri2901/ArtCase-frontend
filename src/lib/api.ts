const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

export const API_BASE_URL = envApiBaseUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

type RequestOptions = {
  method?: string;
  token?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
};

const REQUEST_TIMEOUT = 15000; // 15 second timeout

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body, headers = {} } = options;
  const normalizedMethod = method.toUpperCase();

  if (!API_BASE_URL) {
    throw new Error('API is not configured. Set VITE_API_BASE_URL in environment variables.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: normalizedMethod,
      headers: {
        ...((body instanceof FormData || body == null || normalizedMethod === 'GET' || normalizedMethod === 'HEAD')
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body,
      signal: controller.signal,
      credentials: 'include', // Include cookies for CORS
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout. The server took too long to respond. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let body: any = undefined;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  if (!response.ok) {
    const message = body?.error || response.statusText || 'Request failed';
    throw new ApiError(message, response.status, body?.details);
  }

  return body as T;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export function post<T>(path: string, data?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined });
}

export function put<T>(path: string, data?: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined });
}

export function patch<T>(path: string, data?: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: data !== undefined ? JSON.stringify(data) : undefined });
}

export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

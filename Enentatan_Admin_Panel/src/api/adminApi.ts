import { BASE_API_URL } from '@/lib/constants';

type JsonBody = Record<string, unknown> | unknown[];

function authHeaders(token?: string | null): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: token } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_API_URL}${path}`, options);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.message || errorBody?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function jsonOptions(method: string, body?: JsonBody, token?: string | null): RequestInit {
  return {
    method,
    headers: authHeaders(token),
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

export const adminApi = {
  login: (payload: { email: string; password: string }) =>
    request<any>('auth/login', jsonOptions('POST', payload)),

  dashboard: (token?: string | null) =>
    request<any>('dashboard', jsonOptions('POST', undefined, token)),

  vendors: {
    list: () => request<any[]>('vendors'),
    create: (payload: JsonBody) => request<any>('vendors', jsonOptions('POST', payload)),
    update: (id: string, payload: JsonBody) => request<any>(`vendors/${id}`, jsonOptions('PUT', payload)),
    updateStatus: (id: string, status: string) =>
      request<any>(`vendors/${id}/status`, jsonOptions('PATCH', { status })),
    delete: (id: string) => request<void>(`vendors/${id}`, { method: 'DELETE' }),
  },

  categories: {
    list: () => request<any[]>('master-data/categories'),
    create: (payload: JsonBody) => request<any>('master-data/categories', jsonOptions('POST', payload)),
    update: (id: string, payload: JsonBody) =>
      request<any>(`master-data/categories/${id}`, jsonOptions('PUT', payload)),
    delete: (id: string) => request<void>(`master-data/categories/${id}`, { method: 'DELETE' }),
  },

  countries: {
    list: () => request<any[]>('master-data/countries'),
  },

  coupons: {
    list: () => request<any[]>('coupons'),
    create: (payload: JsonBody) => request<any>('coupons', jsonOptions('POST', payload)),
    validate: (code: string, amount: number) =>
      request<any>(`coupons/${code}/validate?amount=${amount}`),
    updateStatus: (id: string, active: boolean) =>
      request<any>(`coupons/${id}`, jsonOptions('PATCH', { active })),
    delete: (id: string) => request<void>(`coupons/${id}`, { method: 'DELETE' }),
  },

  packages: {
    list: () => request<any[]>('packages'),
  },
};

import { BASE_API_URL } from '@/lib/constants';
import { clearSession, getToken } from '@/lib/auth';

type JsonBody = Record<string, unknown> | unknown[];

function authHeaders(token?: string | null): HeadersInit {
  const accessToken = token ?? getToken();
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, '')}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      clearSession();
      if (!window.location.pathname.endsWith('/admin/login')) {
        window.location.replace('/admin/login');
      }
    }
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
  uploads: {
    image: async (file: File, folder = 'admin') => {
      const body = new FormData();
      body.append('file', file);

      const response = await fetch(`${BASE_API_URL}uploads/images?folder=${encodeURIComponent(folder)}`, {
        method: 'POST',
        body,
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
      });

      if (!response.ok) throw new Error(`Image upload failed: ${response.status}`);
      return response.json() as Promise<{ bucket: string; key: string; url: string; contentType: string; size: number }>;
    },
  },

  login: (payload: { email: string; password: string }) =>
    request<any>('auth/login', jsonOptions('POST', payload)),

  dashboard: (token?: string | null) =>
    request<any>('dashboard', jsonOptions('GET', undefined, token)),

  profile: () => request<any>('auth/me', { headers: authHeaders() }),
  logout: () => request<any>('auth/logout', jsonOptions('POST')),

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
    create: (payload: JsonBody) => request<any>('master-data/countries', jsonOptions('POST', payload)),
    update: (id: number, payload: JsonBody) =>
      request<any>(`master-data/countries/${id}`, jsonOptions('PUT', payload)),
    delete: (id: number) => request<void>(`master-data/countries/${id}`, { method: 'DELETE' }),
  },

  coupons: {
    list: () => request<any[]>('coupons'),
    create: (payload: JsonBody) => request<any>('coupons', jsonOptions('POST', payload)),
    update: (id: string, payload: JsonBody) => request<any>(`coupons/${id}`, jsonOptions('PUT', payload)),
    validate: (code: string, amount: number) =>
      request<any>(`coupons/${code}/validate?amount=${amount}`),
    updateStatus: (id: string, active: boolean) =>
      request<any>(`coupons/${id}`, jsonOptions('PATCH', { active })),
    delete: (id: string) => request<void>(`coupons/${id}`, { method: 'DELETE' }),
  },

  packages: {
    list: () => request<any[]>('packages'),
    get: (id: string) => request<any>(`packages/${id}`),
    update: (id: string, payload: JsonBody) => request<any>(`packages/${id}`, jsonOptions('PATCH', payload)),
    delete: (id: string) => request<void>(`packages/${id}`, jsonOptions('DELETE')),
  },

  services: {
    list: () => request<any[]>('services?includeAll=true'),
    create: (payload: JsonBody) => request<any>('services', jsonOptions('POST', payload)),
    update: (id: string, payload: JsonBody) => request<any>(`services/${id}`, jsonOptions('PUT', payload)),
    delete: (id: string) => request<void>(`services/${id}`, { method: 'DELETE' }),
  },

  eventSlots: {
    list: () => request<any[]>('master-data/event-slots'),
    create: (payload: JsonBody) => request<any>('master-data/event-slots', jsonOptions('POST', payload)),
    update: (id: number, payload: JsonBody) =>
      request<any>(`master-data/event-slots/${id}`, jsonOptions('PUT', payload)),
    delete: (id: number) => request<void>(`master-data/event-slots/${id}`, { method: 'DELETE' }),
  },

  emailTemplates: {
    list: () => request<any[]>('master-data/email-templates'),
    get: (id: number) => request<any>(`master-data/email-templates/${id}`),
    create: (payload: JsonBody) => request<any>('master-data/email-templates', jsonOptions('POST', payload)),
    update: (id: number, payload: JsonBody) =>
      request<any>(`master-data/email-templates/${id}`, jsonOptions('PUT', payload)),
    delete: (id: number) => request<void>(`master-data/email-templates/${id}`, { method: 'DELETE' }),
  },

  users: {
    list: (query = '') => request<any[]>(`users${query ? `?${query}` : ''}`),
    get: (id: string) => request<any>(`users/${id}`),
    create: (payload: JsonBody) => request<any>('users', jsonOptions('POST', payload)),
    update: (id: string, payload: JsonBody) => request<any>(`users/${id}`, jsonOptions('PATCH', payload)),
    delete: (id: string) => request<any>(`users/${id}`, jsonOptions('DELETE')),
  },

  bookings: {
    list: (status?: string) => request<any[]>(`bookings${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    get: (id: string) => request<any>(`bookings/${id}`),
    cancel: (id: string, reason: string) =>
      request<any>(`bookings/${id}/cancel`, jsonOptions('PATCH', { reason })),
    complete: (id: string) => request<any>(`bookings/${id}/complete`, jsonOptions('PATCH')),
  },

  reviews: {
    list: () => request<any[]>('reviews/admin/all'),
    approve: (id: string) => request<any>(`reviews/${id}/approve`, jsonOptions('PATCH')),
    reject: (id: string) => request<any>(`reviews/${id}/reject`, jsonOptions('PATCH')),
  },

  notifications: {
    list: (status?: string) => request<any[]>(`notifications${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    create: (payload: JsonBody) => request<any>('notifications', jsonOptions('POST', payload)),
    markSent: (id: string) => request<any>(`notifications/${id}/sent`, jsonOptions('PATCH')),
    delete: (id: string) => request<void>(`notifications/${id}`, jsonOptions('DELETE')),
  },

  support: {
    list: <T = unknown[]>() => request<T>('support/tickets'),
    get: <T = unknown>(id: string) => request<T>(`support/tickets/${id}`),
    reply: <T = unknown>(id: string, payload: JsonBody) => request<T>(`support/tickets/${id}/replies`, jsonOptions('POST', payload)),
    updateStatus: <T = unknown>(id: string, status: string) =>
      request<T>(`support/tickets/${id}/status`, jsonOptions('PATCH', { status })),
  },

  rolePermissions: {
    definitions: <T = unknown[]>() => request<T>('role-permission/definitions'),
    list: <T = unknown[]>() => request<T>('role-permission'),
    get: <T = unknown>(role: string) => request<T>(`role-permission/${role}`),
    update: <T = unknown>(role: string, payload: JsonBody) => request<T>(`role-permission/${role}`, jsonOptions('PUT', payload)),
  },
};

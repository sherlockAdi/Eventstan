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
  uploads: {
    image: async (file: File, folder = 'admin') => {
      const body = new FormData();
      body.append('file', file);

      const response = await fetch(`${BASE_API_URL}uploads/images?folder=${encodeURIComponent(folder)}`, {
        method: 'POST',
        body,
      });

      if (!response.ok) throw new Error(`Image upload failed: ${response.status}`);
      return response.json() as Promise<{ bucket: string; key: string; url: string; contentType: string; size: number }>;
    },
  },

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
  },

  services: {
    list: () => request<any[]>('services?includeAll=true'),
    create: (payload: JsonBody) => request<any>('services', jsonOptions('POST', payload)),
    update: (id: string, payload: JsonBody) => request<any>(`services/${id}`, jsonOptions('PUT', payload)),
    delete: (id: string) => request<void>(`services/${id}`, { method: 'DELETE' }),
  },

  subServices: {
    list: () => request<any[]>('services/sub-services'),
    create: (serviceId: string, payload: JsonBody) =>
      request<any>(`services/${serviceId}/sub-services`, jsonOptions('POST', payload)),
    update: (id: string, payload: JsonBody) =>
      request<any>(`services/sub-services/${id}`, jsonOptions('PUT', payload)),
    delete: (id: string) => request<void>(`services/sub-services/${id}`, { method: 'DELETE' }),
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
};

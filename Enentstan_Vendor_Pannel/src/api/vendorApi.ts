import { BASE_URL } from '@/lib/constants';

type JsonBody = Record<string, unknown> | unknown[];
const API_BASE_URL = `${BASE_URL}/api/v1`;

function getVendorToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vendor_token');
}

function headers(token = getVendorToken(), accept = 'application/json'): HeadersInit {
  return {
    Accept: accept,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${path}`, options);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.message || errorBody?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function jsonOptions(method: string, body?: JsonBody): RequestInit {
  return {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
}

export const vendorApi = {
  uploads: {
    image: async (file: File, folder = 'vendors') => {
      const body = new FormData();
      body.append('file', file);

      const response = await fetch(`${API_BASE_URL}/uploads/images?folder=${encodeURIComponent(folder)}`, {
        method: 'POST',
        body,
      });

      if (!response.ok) throw new Error(`Image upload failed: ${response.status}`);
      return response.json() as Promise<{ bucket: string; key: string; url: string; contentType: string; size: number }>;
    },
  },

  auth: {
    login: (email: string, password: string) =>
      request<unknown>('auth/login', jsonOptions('POST', { email, password })),
    logout: () => request<void>('auth/logout', jsonOptions('POST')),
  },

  services: {
    list: <T = unknown[]>() =>
      request<T>('services', {
        cache: 'no-store',
        headers: headers(getVendorToken()),
      }),
    get: <T = unknown>(id: string) => request<T>(`services/${id}`, { headers: headers() }),
    create: <T = unknown>(payload: JsonBody) => request<T>('services', jsonOptions('POST', payload)),
    updateStatus: (id: string, status: string) =>
      request<unknown>(`services/${id}`, jsonOptions('PATCH', { status })),
    delete: (id: string) => request<void>(`services/${id}`, jsonOptions('DELETE')),
    createSubService: (serviceId: string, payload: JsonBody) =>
      request<unknown>(`services/${serviceId}/sub-services`, jsonOptions('POST', payload)),
  },

  packages: {
    list: <T = unknown[]>() => request<T>('packages', { headers: headers(getVendorToken(), '*/*') }),
    create: <T = unknown>(payload: JsonBody) => request<T>('packages', jsonOptions('POST', payload)),
    updateStatus: (id: string, status: string) =>
      request<unknown>(`packages/${id}`, jsonOptions('PATCH', { status })),
    delete: (id: string) => request<void>(`packages/${id}`, jsonOptions('DELETE')),
  },

  masterData: {
    countries: <T = unknown[]>() => request<T>('master-data/countries'),
  },
};

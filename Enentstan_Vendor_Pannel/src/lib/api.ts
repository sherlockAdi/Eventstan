/**
 * api.ts — All vendor API calls in one place.
 * Every function returns { data, error } so callers don't need try/catch.
 */

import { API, jsonHeaders, multipartHeaders } from './config';
import { getToken } from './auth';

// ─── helpers ──────────────────────────────────────────────────
async function call<T>(
  url: string,
  options: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    if (!res.ok) {
      const msg =
        json?.message || json?.error || `Request failed (${res.status})`;
      return { data: null, error: msg };
    }
    return { data: json as T, error: null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Network error';
    return { data: null, error: msg };
  }
}

function tok() {
  return getToken();
}

// ─── Services ─────────────────────────────────────────────────
export interface ServicePayload {
  name: string;
  category: string;
  description: string;
  price_min: number;
  price_max: number;
  price_unit: string;
}

export const servicesApi = {
  list: () =>
    call<{ data: ApiService[] }>(API.services, {
      headers: jsonHeaders(tok()),
    }),

  get: (id: string) =>
    call<{ data: ApiService }>(API.service(id), {
      headers: jsonHeaders(tok()),
    }),

  create: (payload: ServicePayload) =>
    call<{ data: ApiService; message: string }>(API.services, {
      method: 'POST',
      headers: jsonHeaders(tok()),
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<ServicePayload>) =>
    call<{ data: ApiService; message: string }>(API.service(id), {
      method: 'PUT',
      headers: jsonHeaders(tok()),
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    call<{ message: string }>(API.service(id), {
      method: 'DELETE',
      headers: jsonHeaders(tok()),
    }),

  toggle: (id: string) =>
    call<{ message: string }>(API.serviceToggle(id), {
      method: 'POST',
      headers: jsonHeaders(tok()),
    }),

  /** Upload multiple images — returns updated service */
  uploadImages: (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('images[]', f));
    return call<{ data: ApiService; message: string }>(API.serviceImages(id), {
      method: 'POST',
      headers: multipartHeaders(tok()),
      body: form,
    });
  },

  deleteImage: (serviceId: string, imageId: string) =>
    call<{ message: string }>(API.deleteImage(serviceId, imageId), {
      method: 'DELETE',
      headers: jsonHeaders(tok()),
    }),
};

// ─── Packages ─────────────────────────────────────────────────
export const packagesApi = {
  list: () =>
    call<{ data: ApiPackage[] }>(API.packages, {
      headers: jsonHeaders(tok()),
    }),

  get: (id: string) =>
    call<{ data: ApiPackage }>(API.package(id), {
      headers: jsonHeaders(tok()),
    }),

  create: (payload: object) =>
    call<{ data: ApiPackage; message: string }>(API.packages, {
      method: 'POST',
      headers: jsonHeaders(tok()),
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: object) =>
    call<{ data: ApiPackage; message: string }>(API.package(id), {
      method: 'PUT',
      headers: jsonHeaders(tok()),
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    call<{ message: string }>(API.package(id), {
      method: 'DELETE',
      headers: jsonHeaders(tok()),
    }),
};

// ─── Bookings ─────────────────────────────────────────────────
export const bookingsApi = {
  list: (status?: string) =>
    call<{ data: ApiBooking[] }>(
      status ? `${API.bookings}?status=${status}` : API.bookings,
      { headers: jsonHeaders(tok()) },
    ),

  action: (id: string, action: 'accept' | 'reject', reason?: string) =>
    call<{ message: string }>(API.bookingAction(id), {
      method: 'POST',
      headers: jsonHeaders(tok()),
      body: JSON.stringify({ action, reason }),
    }),
};

// ─── Dashboard ────────────────────────────────────────────────
export const dashboardApi = {
  stats: () =>
    call<{ data: ApiDashboard }>(API.dashboard, {
      headers: jsonHeaders(tok()),
    }),
};

// ─── Profile ─────────────────────────────────────────────────
export const profileApi = {
  get: () =>
    call<{ data: ApiProfile }>(API.profile, {
      headers: jsonHeaders(tok()),
    }),

  update: (payload: object) =>
    call<{ data: ApiProfile; message: string }>(API.profile, {
      method: 'PUT',
      headers: jsonHeaders(tok()),
      body: JSON.stringify(payload),
    }),
};

// ─── API shape types (from Laravel responses) ─────────────────
export interface ApiImage {
  id: string;
  url: string;
  is_primary?: boolean;
}

export interface ApiService {
  id: string;
  name: string;
  category: string;
  description: string;
  price_min: number;
  price_max: number;
  price_unit: string;
  is_active: boolean;
  rating: number;
  total_bookings: number;
  images: ApiImage[];
}

export interface ApiPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  services: string[];
  discount?: number;
  is_active: boolean;
  created_at: string;
}

export interface ApiBooking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_name: string;
  event_type: string;
  event_date: string;
  event_venue?: string;
  guests: number;
  amount: number;
  paid_amount: number;
  status: string;
  created_at: string;
  message?: string;
}

export interface ApiDashboard {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  total_revenue: number;
  pending_revenue: number;
  average_rating: number;
  total_services: number;
}

export interface ApiProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  image: string | null;
}

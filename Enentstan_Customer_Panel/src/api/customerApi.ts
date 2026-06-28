import { Package, Review, Service } from "@/types";

const API_ROOT =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
  "https://api.eventstan.com";
const API_BASE_URL = `${API_ROOT}/api/v1`;

export { API_BASE_URL };

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  permissions?: RolePermission[];
}

export interface RolePermission {
  key: string;
  label: string;
  panel: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
  routes: string[];
  description: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: ApiUser;
  welcomeEmailSent?: boolean;
}

function token() {
  return typeof window === "undefined" ? null : localStorage.getItem("es_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const authToken = token();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || body?.error || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const customerApi = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (name: string, email: string, phone: string, password: string) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, phone, password }) }),
    me: () => request<ApiUser>("/auth/me"),
    logout: () => request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }),
  },
  cart: {
    get: <T>() => request<T>("/cart"),
    add: <T>(payload: { type: "PACKAGE"; itemId: string; eventDate: string; quantity: number }) =>
      request<T>("/cart/items", { method: "POST", body: JSON.stringify(payload) }),
    clear: () => request<{ cleared: boolean }>("/cart", { method: "DELETE" }),
  },
  bookings: {
    list: <T>() => request<T>("/bookings"),
    checkout: <T>(payload: { eventAddress: string; notes?: string }) =>
      request<T>("/bookings/checkout", { method: "POST", body: JSON.stringify(payload) }),
    cancel: <T>(id: string, reason: string) =>
      request<T>(`/bookings/${id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  },
};

export async function uploadImage(file: File, folder = "customers") {
  const body = new FormData();
  body.append("file", file);
  return request<{ bucket: string; key: string; url: string; contentType: string; size: number }>(
    `/uploads/images?folder=${encodeURIComponent(folder)}`,
    { method: "POST", body },
  );
}

export const getServices = () => request<Service[]>("/services");
export const getService = (id: string) => request<Service>(`/services/${encodeURIComponent(id)}`);
export const getPackages = () => request<Package[]>("/packages");
export const getReviews = () => request<Review[]>("/reviews");

export async function getMarketplaceData() {
  const [services, packages, reviews] = await Promise.all([getServices(), getPackages(), getReviews()]);
  return { services, packages, reviews };
}

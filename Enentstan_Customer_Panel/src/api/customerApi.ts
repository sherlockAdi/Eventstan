import { Package, Review, Service } from "@/types";

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer
  ? `${process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")}/api/v1`
  : "/api/proxy";

export { API_BASE_URL };

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: ApiUser;
  welcomeEmailSent?: boolean;
}

// Shared envelope every /customer/* endpoint responds with: { success, message, data }.
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CustomerCartItemResponse {
  cartItemId: string;
  userId: string;
  packageId: string;
  vendorId: string;
  title: string;
  category: string;
  quantity: number;
  unitPrice: number;
  priceUnit: string;
  totalPrice: number;
}

export interface CustomerCartResponse {
  items: CustomerCartItemResponse[];
  itemCount: number;
  estimatedTotal: number;
}

export interface CustomerBookingResponse {
  bookingId: string;
  userId: string;
  packageId: string;
  vendorId: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  unitPrice: number;
  priceUnit: string;
  totalPrice: number;
  bookingStatus: string;
  paymentStatus: string;
}

export interface CustomerCheckoutItemResponse {
  bookingId: string;
  packageId: string;
  vendorId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  priceUnit: string;
  totalPrice: number;
}

export interface CustomerCheckoutResponse {
  checkoutId: string;
  orderId: string;
  userId: string;
  bookingCount: number;
  eventDate: string;
  eventType: string;
  guestCount: number;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  subtotal: number;
  totalAmount: number;
  items: CustomerCheckoutItemResponse[];
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

export interface BudgetRangeInput {
  min: number;
  max: number;
  currency: string;
}

export interface UserLeadInput {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  preferredEventDate?: string;
  expectedGuestCount?: number;
  budgetRange?: BudgetRangeInput;
  servicesNeeded?: string[];
  additionalDetails?: string;
}

export interface VendorLeadInput {
  businessName: string;
  yourName: string;
  email: string;
  phone?: string;
  websiteSocialMedia?: string[];
  serviceCategoryId: string;
  cityId: string;
  yearsOfExperience?: number;
  message?: string;
}

export interface Country {
  id: number;
  code: string;
  name: string;
  defaultCurrency: string;
  flag: string;
  currencySymbol: string;
  phoneCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  countryId?: number;
  status?: string;
}

// Service categories — e.g. Venue, Decor, Catering, Entertainment, Rentals.
// Confirmed live on the API (GET /master-data/categories). Used to drive
// category filter pills across the app (Promotions page, Services page,
// Vendor Partners "List Your Service" form, etc.) so they always reflect
// what's actually configured on the backend instead of a hardcoded list.
export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image: string;
  showInHomePage: boolean;
  isActive: boolean;
  createdAt: string;
}

// Fallback used if /master-data/countries fails, so phone country-code
// selection still works (matches the API's current sample data).
const FALLBACK_COUNTRIES: Country[] = [
  {
    id: 1,
    code: "AE",
    name: "United Arab Emirates (UAE)",
    defaultCurrency: "UAE DIRHAM",
    flag: "🇦🇪",
    currencySymbol: "AED",
    phoneCode: "+971",
    status: "Active",
    createdAt: "",
    updatedAt: "",
  },
];

// Fallback used if /master-data/cities fails (or doesn't exist yet), so
// the City/Area dropdown still works with UAE's main cities.
const FALLBACK_CITIES: City[] = [
  { id: "dubai", name: "Dubai" },
  { id: "abu-dhabi", name: "Abu Dhabi" },
  { id: "sharjah", name: "Sharjah" },
  { id: "ajman", name: "Ajman" },
  { id: "ras-al-khaimah", name: "Ras Al Khaimah" },
  { id: "fujairah", name: "Fujairah" },
  { id: "umm-al-quwain", name: "Umm Al Quwain" },
  { id: "al-ain", name: "Al Ain" },
];

// Fallback used if /master-data/categories fails, so category filter pills
// still render with the known current set instead of disappearing entirely.
const FALLBACK_CATEGORIES: ApiCategory[] = [
  {
    id: "venue",
    name: "Venue",
    slug: "venue",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
  {
    id: "decor",
    name: "Decor",
    slug: "decor",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
  {
    id: "catering",
    name: "Catering",
    slug: "catering",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    slug: "entertainment",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
  {
    id: "rentals",
    name: "Rentals",
    slug: "rentals",
    parentId: null,
    image: "",
    showInHomePage: true,
    isActive: true,
    createdAt: "",
  },
];

export const customerApi = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (name: string, email: string, phone: string, password: string) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, phone, password }) }),
    me: () => request<ApiUser>("/auth/me"),
    logout: () => request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }),
    // Forgot Password — Login page's "Forgot password?" link
    forgotPassword: (email: string) =>
      request<{ message?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    // Reset Password — link from email, carries ?token=...
    resetPassword: (token: string, password: string) =>
      request<{ message?: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      }),
  },
  // Live customer cart/checkout endpoints — see /api/v1/customer/* in the
  // API docs (POST cart, GET cart/:userId, PUT cart/:cartItemId,
  // DELETE cart/:cartItemId, POST book-now, POST checkout).
  cart: {
    add: <T = CustomerCartItemResponse>(payload: { userId: string; packageId: string; quantity: number }) =>
      request<ApiEnvelope<T>>("/customer/cart", { method: "POST", body: JSON.stringify(payload) }),
    get: <T = CustomerCartResponse>(userId: string) =>
      request<ApiEnvelope<T>>(`/customer/cart/${encodeURIComponent(userId)}`),
    update: <T = CustomerCartItemResponse>(cartItemId: string, payload: { userId: string; quantity: number }) =>
      request<ApiEnvelope<T>>(`/customer/cart/${encodeURIComponent(cartItemId)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (cartItemId: string, userId: string) =>
      request<ApiEnvelope<{ success: boolean }>>(`/customer/cart/${encodeURIComponent(cartItemId)}`, {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      }),
  },
  bookNow: <T = CustomerBookingResponse>(payload: {
    userId: string;
    packageId: string;
    eventDate: string;
    eventType: string;
    guestCount: number;
    message?: string;
  }) => request<ApiEnvelope<T>>("/customer/book-now", { method: "POST", body: JSON.stringify(payload) }),
  checkout: <T = CustomerCheckoutResponse>(payload: {
    userId: string;
    cartItemIds: string[];
    eventDate: string;
    eventType: string;
    guestCount: number;
    message?: string;
    paymentMethod: string;
  }) => request<ApiEnvelope<T>>("/customer/checkout", { method: "POST", body: JSON.stringify(payload) }),
  bookings: {
    // Unlike the /customer/* endpoints, /bookings does NOT consistently use
    // the { success, message, data } envelope — it's been observed returning
    // a bare array directly. Handle both shapes defensively so the page
    // never ends up with `bookings` as undefined or a non-array.
    list: async <T>() => {
      const response = await request<T | ApiEnvelope<T>>("/bookings");
      const unwrapped =
        response && typeof response === "object" && "data" in response
          ? (response as ApiEnvelope<T>).data
          : (response as T);
      return (unwrapped ?? ([] as unknown as T));
    },
    cancel: <T>(id: string, reason: string) =>
      request<T>(`/bookings/${id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  },
  leads: {
    // Contact page — "Request a Callback" form
    submitUserLead: <T = unknown>(payload: UserLeadInput) =>
      request<T>("/user-leads", { method: "POST", body: JSON.stringify(payload) }),
    // Vendor Partners page — "List Your Service" form
    submitVendorLead: <T = unknown>(payload: VendorLeadInput) =>
      request<T>("/vendor-leads", { method: "POST", body: JSON.stringify(payload) }),
  },
  masterData: {
    getCountries: async (): Promise<Country[]> => {
      try {
        const countries = await request<Country[]>("/master-data/countries");
        return countries.filter((c) => c.status === "Active");
      } catch (err) {
        console.error("Error fetching countries:", err);
        return FALLBACK_COUNTRIES;
      }
    },
    // NOTE: /master-data/cities returns 404 — confirmed not live yet on the
    // API (unlike /master-data/countries and /master-data/categories, which
    // both work). Using the static UAE city list directly for now instead of
    // hitting a known-dead endpoint. Once a real cities endpoint exists,
    // swap the body of this function back to a `request()` call like
    // getCountries above.
    getCities: async (): Promise<City[]> => {
      return FALLBACK_CITIES;
    },
    // Service categories (Venue, Decor, Catering, Entertainment, Rentals,
    // ...). Confirmed live on the API — used to drive category filter pills
    // instead of a hardcoded list so newly added categories show up
    // automatically without a code change.
    getCategories: async (): Promise<ApiCategory[]> => {
      try {
        const categories = await request<ApiCategory[]>("/master-data/categories");
        return categories.filter((c) => c.isActive);
      } catch (err) {
        console.error("Error fetching categories:", err);
        return FALLBACK_CATEGORIES;
      }
    },
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
export const getCategories = () => customerApi.masterData.getCategories();

export interface ApiBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: string;
  isFeatured: boolean;
  authorName: string;
  authorAvatar?: string;
  authorBio?: string;
  publishedAt: string;
  readTime: number;
  createdAt?: string;
  updatedAt?: string;
  relatedServiceIds?: string[];
  relatedPackageIds?: string[];
}

// The public endpoint only returns PUBLISHED posts, which is what the
// customer-facing blog should show.
export const getBlogs = () => request<ApiBlogPost[]>("/blogs");

export const getBlogBySlug = async (slug: string) => {
  const posts = await getBlogs();
  return posts.find((p) => p.slug === slug) ?? null;
};

export async function getMarketplaceData() {
  const [services, packages, reviews, categories] = await Promise.all([
    getServices(),
    getPackages(),
    getReviews(),
    getCategories(),
  ]);
  return { services, packages, reviews, categories };
}
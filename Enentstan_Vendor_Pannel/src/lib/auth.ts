// ─────────────────────────────────────────────────────────────
//  auth.ts — Static local authentication (no API required).
//  Credentials are hardcoded below. All other vendor panel
//  logic, routes, and UI remain exactly the same.
// ─────────────────────────────────────────────────────────────

export interface VendorUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  image: string | null;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  token?: string;
  data?: VendorUser;
  errors?: Record<string, string[]>;
}

// ─── Hardcoded credentials ────────────────────────────────────
const STATIC_CREDENTIALS = {
  email:    'vendor@eventstan.com',
  password: 'vendor123',
};

// Static vendor profile returned after a successful login
const STATIC_VENDOR: VendorUser = {
  id:          1,
  firstName:   'Vendor',
  lastName:    'Admin',
  email:       STATIC_CREDENTIALS.email,
  phoneNumber: '+1 000-000-0000',
  image:       null,
};

// Fake bearer token — just needs to be truthy for isLoggedIn()
const STATIC_TOKEN = 'static-vendor-session-token';

// ─── Login (local check — no network call) ────────────────────
export async function loginVendor(
  email: string,
  password: string
): Promise<LoginResponse> {
  // Simulate a brief async delay so the loading spinner appears
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (
    email.trim().toLowerCase() === STATIC_CREDENTIALS.email &&
    password === STATIC_CREDENTIALS.password
  ) {
    return {
      status:  true,
      message: 'Login successful.',
      token:   STATIC_TOKEN,
      data:    STATIC_VENDOR,
    };
  }

  return {
    status:  false,
    message: 'Invalid email or password.',
  };
}

// ─── Logout (local only — no network call) ────────────────────
export async function logoutVendor(): Promise<{ status: boolean; message: string }> {
  // Nothing to call on the server; clearSession() handles the rest.
  return { status: true, message: 'Logged out.' };
}

// ─── Token helpers (localStorage) ────────────────────────────
const TOKEN_KEY = 'vendor_token';
const USER_KEY  = 'vendor_user';

export function saveSession(token: string, user: VendorUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export function getUser(): VendorUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as VendorUser) : null;
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:4000';

export const BASE_API_URL = `${BASE_URL}/api/v1/`;
const API_URL = BASE_API_URL.replace(/\/$/, '');

export const API_ENDPOINTS = {
  DASHBOARD: `${API_URL}/dashboard`,
  USERS: `${API_URL}/users`,
  VENDORS: `${API_URL}/vendors`,
  SERVICES: `${API_URL}/services`,
  SUBSERVICES: `${API_URL}/subservices`,
  EVENT_SLOTS: `${API_URL}/event-slots`,
  COUPONS: `${API_URL}/coupons`,
  COUNTRIES: `${API_URL}/countries`,
  EMAIL_TEMPLATES: `${API_URL}/email-templates`,
  ROLE_PERMISSION: `${API_URL}/role-permission`,
  VENDOR_SERVICES: `${API_URL}/vendor-services`,
  MARKETING_PACKAGES: `${API_URL}/marketing-packages`,
  BOOKINGS: `${API_URL}/bookings`,
  FEEDBACK: `${API_URL}/feedback`,
  NOTIFICATIONS: `${API_URL}/notifications`,
  AFFILIATE_LINKS: `${API_URL}/affiliate-links`,
} as const;

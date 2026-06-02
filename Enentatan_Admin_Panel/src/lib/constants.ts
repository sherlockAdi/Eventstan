// Local system
// export const BASE_API_URL: string = 'http://localhost:4000/admin/';
// export const VENDOR_API_BASE_URL: string = 'http://localhost:4007/api/v1/';
// export const BASE_URL: string = 'http://localhost:3001/';

// Live system
export const BASE_URL = 'https://api.eventstan.com';

export const API_ENDPOINTS = {
  DASHBOARD: `${BASE_URL}/dashboard`,
  USERS: `${BASE_URL}/users`,
  VENDORS: `${BASE_URL}/vendors`,
  SERVICES: `${BASE_URL}/services`,
  SUBSERVICES: `${BASE_URL}/subservices`,
  EVENT_SLOTS: `${BASE_URL}/event-slots`,
  COUPONS: `${BASE_URL}/coupons`,
  COUNTRIES: `${BASE_URL}/countries`,
  EMAIL_TEMPLATES: `${BASE_URL}/email-templates`,
  ROLE_PERMISSION: `${BASE_URL}/role-permission`,
  VENDOR_SERVICES: `${BASE_URL}/vendor-services`,
  MARKETING_PACKAGES: `${BASE_URL}/marketing-packages`,
  BOOKINGS: `${BASE_URL}/bookings`,
  FEEDBACK: `${BASE_URL}/feedback`,
  NOTIFICATIONS: `${BASE_URL}/notifications`,
  AFFILIATE_LINKS: `${BASE_URL}/affiliate-links`,
} as const;

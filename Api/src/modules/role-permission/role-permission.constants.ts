import { UserRole } from '@prisma/client';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
export type PermissionPanel = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export interface PermissionModuleDefinition {
  key: string;
  label: string;
  panel: PermissionPanel;
  routes: string[];
  description: string;
  actions: PermissionAction[];
}

export interface PermissionModuleState extends PermissionModuleDefinition {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissionSeed {
  role: UserRole;
  name: string;
  description: string;
  isActive: boolean;
  permissions: PermissionModuleState[];
}

export const PERMISSION_DEFINITIONS: PermissionModuleDefinition[] = [
  { key: 'dashboard', label: 'Dashboard', panel: 'ADMIN', routes: ['/admin/dashboard'], description: 'Overview and analytics', actions: ['view'] },
  { key: 'role-permission', label: 'Role Permission', panel: 'ADMIN', routes: ['/admin/role-permission'], description: 'Manage roles and permissions', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'masters', label: 'Masters', panel: 'ADMIN', routes: ['/admin/masters'], description: 'Core catalog and master data', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'users', label: 'User Management', panel: 'ADMIN', routes: ['/admin/users', '/admin/users-lead'], description: 'Customers and user leads', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'vendors', label: 'Vendors', panel: 'ADMIN', routes: ['/admin/vendors', '/admin/lead-vendor'], description: 'Vendor accounts and leads', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'vendor-services', label: 'Vendor Services', panel: 'ADMIN', routes: ['/admin/vendor-services'], description: 'Vendor service catalog', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'packages', label: 'Packages', panel: 'ADMIN', routes: ['/admin/packages'], description: 'Package management', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'bookings', label: 'Bookings', panel: 'ADMIN', routes: ['/admin/booking-management'], description: 'Booking management', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'support', label: 'Help & Support', panel: 'ADMIN', routes: ['/admin/support'], description: 'Support conversations and tickets', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'feedback', label: 'Feedback & Testimonial', panel: 'ADMIN', routes: ['/admin/feedback-testimonial'], description: 'Customer feedback moderation', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'notifications', label: 'System Notifications', panel: 'ADMIN', routes: ['/admin/system-notifications'], description: 'Notification campaigns', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'affiliate-links', label: 'Affiliate Links', panel: 'ADMIN', routes: ['/admin/affiliate-links'], description: 'Affiliate tracking links', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'blog', label: 'Blogs', panel: 'ADMIN', routes: ['/admin/blog'], description: 'Blog content management', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'dashboard-vendor', label: 'Dashboard', panel: 'VENDOR', routes: ['/vendor/dashboard'], description: 'Vendor metrics and activity', actions: ['view'] },
  { key: 'services-vendor', label: 'Services', panel: 'VENDOR', routes: ['/vendor/services'], description: 'Vendor service listings', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'packages-vendor', label: 'Packages', panel: 'VENDOR', routes: ['/vendor/packages', '/vendor/promotional-packages'], description: 'Vendor packages and promotional packages', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'bookings-vendor', label: 'Bookings', panel: 'VENDOR', routes: ['/vendor/bookings'], description: 'Vendor booking requests', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'calendar-vendor', label: 'Calendar', panel: 'VENDOR', routes: ['/vendor/calendar'], description: 'Vendor calendar view', actions: ['view'] },
  { key: 'profile-vendor', label: 'Update Profile', panel: 'VENDOR', routes: ['/vendor/profile'], description: 'Vendor profile management', actions: ['view', 'edit'] },
  { key: 'support-vendor', label: 'Help & Support', panel: 'VENDOR', routes: ['/vendor/support'], description: 'Vendor support tickets', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'home-customer', label: 'Home', panel: 'CUSTOMER', routes: ['/'], description: 'Customer home page', actions: ['view'] },
  { key: 'services-customer', label: 'Services', panel: 'CUSTOMER', routes: ['/services'], description: 'Browse services', actions: ['view'] },
  { key: 'packages-customer', label: 'Packages', panel: 'CUSTOMER', routes: ['/packages'], description: 'Browse packages', actions: ['view'] },
  { key: 'promotions-customer', label: 'Promotions', panel: 'CUSTOMER', routes: ['/promotions'], description: 'Browse promotions', actions: ['view'] },
  { key: 'bookings-customer', label: 'Bookings', panel: 'CUSTOMER', routes: ['/bookings'], description: 'Customer bookings', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'profile-customer', label: 'My Profile', panel: 'CUSTOMER', routes: ['/my-profile'], description: 'Customer profile', actions: ['view', 'edit'] },
];

const ADMIN_KEYS = new Set(PERMISSION_DEFINITIONS.filter((item) => item.panel === 'ADMIN').map((item) => item.key));
const VENDOR_KEYS = new Set(PERMISSION_DEFINITIONS.filter((item) => item.panel === 'VENDOR').map((item) => item.key));
const CUSTOMER_KEYS = new Set(PERMISSION_DEFINITIONS.filter((item) => item.panel === 'CUSTOMER').map((item) => item.key));

export const DEFAULT_ROLE_PERMISSION_SEEDS: RolePermissionSeed[] = [
  {
    role: UserRole.SUPER_ADMIN,
    name: 'Super Admin',
    description: 'Full platform access with every admin module enabled.',
    isActive: true,
    permissions: PERMISSION_DEFINITIONS.filter((item) => item.panel === 'ADMIN').map((item) => ({
      ...item,
      view: true,
      create: true,
      edit: true,
      delete: true,
    })),
  },
  {
    role: UserRole.ADMIN,
    name: 'Admin',
    description: 'Operational admin access for platform management.',
    isActive: true,
    permissions: PERMISSION_DEFINITIONS.filter((item) => item.panel === 'ADMIN').map((item) => ({
      ...item,
      view: true,
      create: item.key !== 'role-permission',
      edit: item.key !== 'role-permission',
      delete: item.key !== 'role-permission' && item.key !== 'support' && item.key !== 'notifications',
    })),
  },
  {
    role: UserRole.VENDOR,
    name: 'Vendor',
    description: 'Vendor panel access for operating the vendor account.',
    isActive: true,
    permissions: PERMISSION_DEFINITIONS.filter((item) => item.panel === 'VENDOR').map((item) => ({
      ...item,
      view: true,
      create: item.key === 'services-vendor' || item.key === 'packages-vendor' || item.key === 'support-vendor',
      edit: item.key === 'services-vendor' || item.key === 'packages-vendor' || item.key === 'profile-vendor' || item.key === 'support-vendor',
      delete: item.key === 'services-vendor' || item.key === 'packages-vendor' || item.key === 'support-vendor',
    })),
  },
  {
    role: UserRole.CUSTOMER,
    name: 'Customer',
    description: 'Customer-facing account access and booking journey.',
    isActive: true,
    permissions: PERMISSION_DEFINITIONS.filter((item) => item.panel === 'CUSTOMER').map((item) => ({
      ...item,
      view: true,
      create: item.key === 'bookings-customer',
      edit: item.key === 'bookings-customer' || item.key === 'profile-customer',
      delete: item.key === 'bookings-customer',
    })),
  },
  {
    role: UserRole.AFFILIATE,
    name: 'Affiliate',
    description: 'Affiliate access placeholder.',
    isActive: false,
    permissions: [],
  },
];

export function defaultPermissionsForRole(role: UserRole) {
  const seed = DEFAULT_ROLE_PERMISSION_SEEDS.find((item) => item.role === role);
  if (!seed) return [];
  return seed.permissions;
}

export function permissionPanelForRole(role: UserRole): PermissionPanel {
  if (role === UserRole.VENDOR) return 'VENDOR';
  if (role === UserRole.CUSTOMER) return 'CUSTOMER';
  return 'ADMIN';
}

export function routeMatches(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function clonePermissions(role: UserRole, permissions?: PermissionModuleState[]) {
  const base = PERMISSION_DEFINITIONS.filter((item) => item.panel === permissionPanelForRole(role));
  const byKey = new Map((permissions ?? []).map((item) => [item.key, item]));
  return base.map((definition) => {
    const current = byKey.get(definition.key);
    if (current) return current;
    return {
      ...definition,
      view: false,
      create: false,
      edit: false,
      delete: false,
    };
  });
}

export function normalizePermissions(role: UserRole, permissions: unknown) {
  const panel = permissionPanelForRole(role);
  const definitions = PERMISSION_DEFINITIONS.filter((item) => item.panel === panel);
  const source = Array.isArray(permissions) ? permissions : [];
  const byKey = new Map<string, Partial<PermissionModuleState>>();
  for (const item of source as Partial<PermissionModuleState>[]) {
    if (item?.key) byKey.set(item.key, item);
  }
  return definitions.map((definition) => {
    const current = byKey.get(definition.key) ?? {};
    return {
      ...definition,
      view: Boolean(current.view),
      create: Boolean(current.create),
      edit: Boolean(current.edit),
      delete: Boolean(current.delete),
    } satisfies PermissionModuleState;
  });
}

export function isPanelKeyAllowed(key: string, panel: PermissionPanel) {
  if (panel === 'ADMIN') return ADMIN_KEYS.has(key);
  if (panel === 'VENDOR') return VENDOR_KEYS.has(key);
  return CUSTOMER_KEYS.has(key);
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Truck, Package, BookOpen, Star,
  Bell, Link2, Shield, Tag,Newspaper,  Grid3X3, LogOut, Menu, Loader2, X, ChevronDown, User,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getUser, clearSession } from '@/lib/auth';
import { AdminUser } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: { href: string; label: string }[];
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '#masters',
    label: 'Masters',
    icon: Grid3X3,
    children: [
      { href: '/admin/masters/services', label: 'Services' },
      { href: '/admin/masters/pending-service-approvals', label: 'Pending Services' },
      { href: '/admin/masters/event-slots', label: 'Event Slots' },
      { href: '/admin/masters/coupons', label: 'Coupons' },
      { href: '/admin/masters/countries', label: 'Countries' },
      { href: '/admin/masters/states', label: 'States' },
      { href: '/admin/masters/categories', label: 'Categories' },
      { href: '/admin/masters/email-templates', label: 'Email Templates' },
    ],
  },
  { href: '/admin/role-permission', label: 'Role & Permission', icon: Shield },
  {
    href: '#userManagement',
    label: 'User Management',
    icon: Users,
    children: [
      { href: '/admin/users', label: 'User List' },
      { href: '/admin/users-lead', label: 'User Leads' },
    ],
  },
  {
    href: '#vendors',
    label: 'Vendors',
    icon: Truck,
    children: [
      { href: '/admin/vendors', label: 'Vendor List' },
      { href: '/admin/lead-vendor', label: 'Lead Vendor' },
    ],
  },
  { href: '/admin/vendor-services', label: 'Vendor Services', icon: Package },
  {
    href: '#packages',
    label: 'Packages',
    icon: Tag,
    children: [
      { href: '/admin/packages/all-packages', label: 'All Packages' },
      { href: '/admin/packages/promotion-packages', label: 'Promotion Packages' },
    ],
  },
  { href: '/admin/booking-management', label: 'Booking Management', icon: BookOpen },
  { href: '/admin/feedback-testimonial', label: 'Feedback & Testimonial', icon: Star },
  { href: '/admin/system-notifications', label: 'System Notifications', icon: Bell },
  { href: '/admin/affiliate-links', label: 'Affiliate Links', icon: Link2 },
  // { href: '/admin/blog', label: 'Blogs', icon: Newspaper },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAdmin(getUser());
    if (pathname.startsWith('/admin/masters')) setMastersOpen(true);
    if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/users-lead')) setUserManagementOpen(true);
    if (pathname.startsWith('/admin/vendors') || pathname.startsWith('/admin/lead-vendor')) setVendorsOpen(true);
    if (pathname.startsWith('/admin/packages')) setPackagesOpen(true);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = admin
    ? `${admin.name?.split(' ')[0]?.charAt(0) ?? ''}${admin.name?.split(' ')[1]?.charAt(0) ?? ''}`.toUpperCase()
    : 'A';

  async function confirmLogout() {
    setLoggingOut(true);
    clearSession();
    router.replace('/admin/login');
  }

  if (pathname === '/admin/login') return <>{children}</>;

  const activeLabel =
    navItems.find(n => n.href === pathname)?.label ??
    navItems.flatMap(n => n.children ?? []).find(c => c.href === pathname)?.label ??
    'Admin Panel';

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="h-14 flex items-center px-5 border-b border-gray-100 shrink-0">
          <Link href="https://event-stan.vercel.app" target="_blank" className="flex items-center gap-1">
            <span className="text-lg font-bold text-gray-900">Event</span>
            <span className="text-lg font-bold text-orange-500">Stan</span>
          </Link>
          <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">Admin</span>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{admin?.name ?? 'Admin User'}</p>
              <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">{admin?.email ?? 'admin@eventstan.com'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2.5 overflow-y-auto custom-scrollbar">
          <div className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, badge, children }) => {
              const active = pathname === href;
              const isMastersActive = pathname.startsWith('/admin/masters');
              const isUserManagementActive = pathname.startsWith('/admin/users') || pathname.startsWith('/admin/users-lead');
              const isVendorsActive = pathname.startsWith('/admin/vendors') || pathname.startsWith('/admin/lead-vendor');
              const isPackagesActive = pathname.startsWith('/admin/packages');

              if (children && label === 'Masters') {
                return (
                  <div key={href}>
                    <button
                      onClick={() => setMastersOpen(o => !o)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isMastersActive 
                          ? 'text-orange-600 font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 ${isMastersActive ? 'text-orange-500' : 'text-gray-400'}`}
                      />
                      <span className="flex-1 text-left truncate">{label}</span>
                      <ChevronDown
                        size={13}
                        className={`shrink-0 transition-transform duration-200 ${mastersOpen ? 'rotate-180' : ''} ${isMastersActive ? 'text-orange-400' : 'text-drak'}`}
                      />
                    </button>

                    {mastersOpen && (
                      <div className="ml-7 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2.5">
                        {children.map(child => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-2.5 py-1.5 text-xs rounded-md transition-all font-medium
                                ${isChildActive
                                  ? 'text-orange-600 bg-transparent font-semibold'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (children && label === 'User Management') {
                return (
                  <div key={href}>
                    <button
                      onClick={() => setUserManagementOpen(o => !o)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isUserManagementActive 
                          ? 'text-orange-600 font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 ${isUserManagementActive ? 'text-orange-500' : 'text-gray-400'}`}
                      />
                      <span className="flex-1 text-left truncate">{label}</span>
                      <ChevronDown
                        size={13}
                        className={`shrink-0 transition-transform duration-200 ${userManagementOpen ? 'rotate-180' : ''} ${isUserManagementActive ? 'text-orange-400' : 'text-drak'}`}
                      />
                    </button>

                    {userManagementOpen && (
                      <div className="ml-7 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2.5">
                        {children.map(child => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-2.5 py-1.5 text-xs rounded-md transition-all font-medium
                                ${isChildActive
                                  ? 'text-orange-600 bg-transparent font-semibold'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (children && label === 'Vendors') {
                return (
                  <div key={href}>
                    <button
                      onClick={() => setVendorsOpen(o => !o)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isVendorsActive 
                          ? 'text-orange-600 font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 ${isVendorsActive ? 'text-orange-500' : 'text-gray-400'}`}
                      />
                      <span className="flex-1 text-left truncate">{label}</span>
                      <ChevronDown
                        size={13}
                        className={`shrink-0 transition-transform duration-200 ${vendorsOpen ? 'rotate-180' : ''} ${isVendorsActive ? 'text-orange-400' : 'text-drak'}`}
                      />
                    </button>

                    {vendorsOpen && (
                      <div className="ml-7 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2.5">
                        {children.map(child => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-2.5 py-1.5 text-xs rounded-md transition-all font-medium
                                ${isChildActive
                                  ? 'text-orange-600 bg-transparent font-semibold'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (children && label === 'Packages') {
                return (
                  <div key={href}>
                    <button
                      onClick={() => setPackagesOpen(o => !o)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isPackagesActive 
                          ? 'text-orange-600 font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 ${isPackagesActive ? 'text-orange-500' : 'text-gray-400'}`}
                      />
                      <span className="flex-1 text-left truncate">{label}</span>
                      <ChevronDown
                        size={13}
                        className={`shrink-0 transition-transform duration-200 ${packagesOpen ? 'rotate-180' : ''} ${isPackagesActive ? 'text-orange-400' : 'text-drak'}`}
                      />
                    </button>

                    {packagesOpen && (
                      <div className="ml-7 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2.5">
                        {children.map(child => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-2.5 py-1.5 text-xs rounded-md transition-all font-medium
                                ${isChildActive
                                  ? 'text-orange-600 bg-transparent font-semibold'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${active
                      ? 'text-orange-600 font-semibold bg-transparent'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 ${active ? 'text-orange-500' : 'text-gray-400'}`}
                  />
                  <span className="truncate">{label}</span>
                  {badge && (
                    <span className="ml-auto bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-30">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-800">{activeLabel}</h1>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                {initials}
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{admin?.name ?? 'Admin User'}</p>
                      <p className="text-xs text-gray-500 truncate">{admin?.email ?? 'admin@eventstan.com'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogout(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>

      {showLogout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogout(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
            <button onClick={() => setShowLogout(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut size={24} className="text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">Sign out?</h2>
              <p className="text-sm text-gray-500 mt-1">You will be logged out of the admin panel.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
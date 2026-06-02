'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { serviceStore, ServiceWithSlug } from '@/lib/store';
import type { Package } from '@/lib/types';
import { vendorApi } from '@/api/vendorApi';
import {
  Plus, Edit3, Trash2, Eye, ToggleLeft, ToggleRight,
  Layers, Search, Star, X, ChevronUp, ChevronDown,
  CheckCircle2, ChevronsUpDown, Package as PkgIcon, Loader2, AlertTriangle,
} from 'lucide-react';

type SortKey = 'title' | 'price' | 'status';
type SortDir = 'asc' | 'desc';

// Update Package interface to match API response
interface ApiPackage {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  itemIds: string[];
  price: {
    amount: number;
    currency: string;
  };
  status: string;
}

interface ApiService {
  id: string;
  title: string;
  categoryId: string;
  price: {
    amount: number;
    currency: string;
  };
  status: string;
  description: string;
}

// Extend for internal use
interface ExtendedPackage extends ApiPackage {
  isActive: boolean;
  name: string;
  services: string[];
}

// ── Confirmation Modal ──────────────────────────────────────────
function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', confirmClass = 'bg-red-500 hover:bg-red-600', icon, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel?: string;
  confirmClass?: string; icon?: React.ReactNode; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
        {icon && <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">{icon}</div>}
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Package Detail Modal ────────────────────────────────────────
function PackageDetailModal({ pkg, services, open, onClose }: {
  pkg: ExtendedPackage | null; services: ServiceWithSlug[]; open: boolean; onClose: () => void;
}) {
  if (!open || !pkg) return null;
  const pkgServices = pkg.itemIds.map(id => services.find(s => s.id === id)).filter(Boolean) as ServiceWithSlug[];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{pkg.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{pkg.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Status & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full
                ${pkg.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {pkg.status === 'ACTIVE' ? <ToggleRight size={14} className="text-green-500" /> : <ToggleLeft size={14} />}
                {pkg.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Price</p>
              <p className="text-xl font-bold text-gray-900">{pkg.price.amount.toLocaleString()} {pkg.price.currency}</p>
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{pkg.description}</p>
            </div>
          )}

          {/* Included Services */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Included Services ({pkgServices.length})
            </p>
            <div className="space-y-2">
              {pkgServices.map(svc => (
                <div key={svc.id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {svc.images && svc.images[0]
                      ? <img src={svc.images[0]} alt={svc.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-orange-300 text-xs font-bold">{svc.name.charAt(0)}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
                    <p className="text-xs text-gray-400">{svc.category}</p>
                  </div>
                  {svc.rating > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-500">{svc.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-orange-500 ml-1 inline" />
    : <ChevronDown size={13} className="text-orange-500 ml-1 inline" />;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<ExtendedPackage[]>([]);
  const [services, setServices] = useState<ServiceWithSlug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [success, setSuccess] = useState('');

  // Modals
  const [deleteTarget, setDeleteTarget] = useState<ExtendedPackage | null>(null);
  const [toggleTarget, setToggleTarget] = useState<ExtendedPackage | null>(null);
  const [viewTarget, setViewTarget] = useState<ExtendedPackage | null>(null);

  // Fetch packages from API
  useEffect(() => {
    fetchPackages();
    fetchServices();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data: ApiPackage[] = await vendorApi.packages.list();
      console.log('Fetched packages:', data);
      
      // Transform API data to internal format
      const transformedPackages: ExtendedPackage[] = data.map(pkg => ({
        ...pkg,
        name: pkg.title, // Map title to name for compatibility
        isActive: pkg.status === 'ACTIVE',
        services: pkg.itemIds, // Map itemIds to services for compatibility
      }));
      
      setPackages(transformedPackages);
      setError(null);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      {
        const data = await vendorApi.services.list<ApiService[]>();
        // Transform services data to match ServiceWithSlug format
        const transformedServices = data.map((svc) => ({
          id: svc.id,
          name: svc.title,
          slug: svc.id,
          category: svc.categoryId,
          priceMin: svc.price.amount,
          priceMax: svc.price.amount,
          priceUnit: svc.price.currency,
          isActive: svc.status === 'ACTIVE',
          rating: 0,
          totalBookings: 0,
          images: [],
          description: svc.description,
        }));
        setServices(transformedServices);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await vendorApi.packages.delete(deleteTarget.id);

      await fetchPackages(); // Refresh the list
      setDeleteTarget(null);
      setSuccess(`"${deleteTarget.title}" deleted.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting package:', err);
      setError('Failed to delete package');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    
    try {
      const newStatus = toggleTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await vendorApi.packages.updateStatus(toggleTarget.id, newStatus);

      await fetchPackages(); // Refresh the list
      setToggleTarget(null);
      setSuccess(`"${toggleTarget.title}" ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error toggling package:', err);
      setError('Failed to update package status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const getServiceById = (id: string) => services.find(s => s.id === id);

  const filtered = useMemo(() => {
    let list = packages.filter(p => {
      const q = search.toLowerCase();
      return !q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
      if (sortKey === 'price') cmp = a.price.amount - b.price.amount;
      if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [packages, search, sortKey, sortDir]);

  const th = (key: SortKey, label: string) => (
    <th onClick={() => toggleSort(key)}
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-orange-600 whitespace-nowrap">
      {label}<SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{packages.length} service bundles</p>
        </div>
        <Link href="/vendor/packages/add"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
          <Plus size={16} /> Create Package
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 size={15} /> {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: packages.length, color: 'text-gray-900' },
          { label: 'Active', value: packages.filter(p => p.status === 'ACTIVE').length, color: 'text-green-600' },
          { label: 'Inactive', value: packages.filter(p => p.status !== 'ACTIVE').length, color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search packages by name or ID…"
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
        />
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Layers size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No packages found</p>
            <p className="text-sm mt-1">{search ? 'Try clearing search.' : 'Create your first package.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {th('title', 'Package')}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Services</th>
                  {th('price', 'Price')}
                  {th('status', 'Status')}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(pkg => {
                  const pkgSvcs = pkg.itemIds.map(id => getServiceById(id)).filter(Boolean) as ServiceWithSlug[];
                  return (
                    <tr key={pkg.id} className="hover:bg-orange-50/30 transition-colors">
                      {/* Name + ID */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shrink-0">
                            <PkgIcon size={15} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{pkg.title}</p>
                            <p className="text-xs text-gray-400">{pkg.id}</p>
                            {pkg.description && (
                              <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{pkg.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* Services chips */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {pkgSvcs.slice(0, 2).map(sv => (
                            <span key={sv.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {sv.name}
                            </span>
                          ))}
                          {pkgSvcs.length > 2 && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                              +{pkgSvcs.length - 2} more
                            </span>
                          )}
                          {pkgSvcs.length === 0 && (
                            <span className="text-xs text-gray-400">No services</span>
                          )}
                        </div>
                      </td>
                      
                      {/* Price */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {pkg.price.amount.toLocaleString()} {pkg.price.currency}
                        </div>
                       </td>
                      
                      {/* Status */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setToggleTarget(pkg)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all
                            ${pkg.status === 'ACTIVE' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {pkg.status === 'ACTIVE' ? <ToggleRight size={14} className="text-green-500" /> : <ToggleLeft size={14} />}
                          {pkg.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </button>
                       </td>
                      
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setViewTarget(pkg)} title="View Details"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Eye size={15} />
                          </button>
                          <Link href={`/vendor/packages/edit/${pkg.id}`} title="Edit"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                            <Edit3 size={15} />
                          </Link>
                          <button onClick={() => setDeleteTarget(pkg)} title="Delete"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50 text-xs text-gray-400 text-right">
            Showing {filtered.length} of {packages.length} packages
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      <PackageDetailModal
        pkg={viewTarget}
        services={services}
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Package?"
        message={`"${deleteTarget?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        confirmClass="bg-red-500 hover:bg-red-600"
        icon={<Trash2 size={24} className="text-red-500" />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toggle Confirm */}
      <ConfirmModal
        open={!!toggleTarget}
        title={toggleTarget?.status === 'ACTIVE' ? 'Deactivate Package?' : 'Activate Package?'}
        message={
          toggleTarget?.status === 'ACTIVE'
            ? `"${toggleTarget?.title}" will be hidden from customers.`
            : `"${toggleTarget?.title}" will become visible to customers.`
        }
        confirmLabel={toggleTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        confirmClass={toggleTarget?.status === 'ACTIVE' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-500 hover:bg-green-600'}
        icon={toggleTarget?.status === 'ACTIVE'
          ? <ToggleLeft size={24} className="text-gray-500" />
          : <ToggleRight size={24} className="text-green-500" />}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}

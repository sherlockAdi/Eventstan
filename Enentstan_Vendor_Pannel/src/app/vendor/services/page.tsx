"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Edit2,
  Eye,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";
import { vendorApi } from "@/api/vendorApi";

type SortKey = "title" | "category" | "amount" | "status" | "city";
type SortDir = "asc" | "desc";

interface ApiSubService {
  id: string;
  serviceId: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  imageUrl?: string | null;
  status: string;
  price?: { amount: number; currency: string };
}

interface ApiService {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  category?: string;
  description?: string;
  city?: string;
  location?: string;
  price?: { amount: number; currency: string };
  price_min?: number;
  price_unit?: string;
  image_url?: string;
  status: string;
  subServices?: ApiSubService[];
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmClass?: string;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const statusLabel = (status: string) => (status === "ACTIVE" ? "Active" : "Inactive");

function formatMoney(service: ApiService) {
  const amount = service.price?.amount ?? service.price_min ?? 0;
  const currency = service.price?.currency ?? "AED";
  return `${amount.toLocaleString()} ${currency}`;
}

function categoryLabel(service: ApiService) {
  return service.category || service.categoryId || "Uncategorized";
}

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmClass = "bg-red-500 hover:bg-red-600",
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} aria-label="Close" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close modal">
          <X size={18} />
        </button>
        {icon && <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">{icon}</div>}
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-gray-300 ml-1 inline" />;
  return sortDir === "asc" ? <ChevronUp size={13} className="text-orange-500 ml-1 inline" /> : <ChevronDown size={13} className="text-orange-500 ml-1 inline" />;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deleteTarget, setDeleteTarget] = useState<ApiService | null>(null);
  const [toggleTarget, setToggleTarget] = useState<ApiService | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vendorApi.services.list<ApiService[]>();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchServices();
    router.prefetch("/vendor/services/add");
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const categories = useMemo(() => Array.from(new Set(services.map(categoryLabel))).sort(), [services]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...services]
      .filter((service) => {
        const category = categoryLabel(service);
        return (
          (!q ||
            service.title.toLowerCase().includes(q) ||
            category.toLowerCase().includes(q) ||
            service.id.toLowerCase().includes(q) ||
            (service.city || "").toLowerCase().includes(q)) &&
          (!categoryFilter || category === categoryFilter)
        );
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "title") cmp = a.title.localeCompare(b.title);
        if (sortKey === "category") cmp = categoryLabel(a).localeCompare(categoryLabel(b));
        if (sortKey === "amount") cmp = (a.price?.amount ?? a.price_min ?? 0) - (b.price?.amount ?? b.price_min ?? 0);
        if (sortKey === "status") cmp = a.status.localeCompare(b.status);
        if (sortKey === "city") cmp = (a.city || "").localeCompare(b.city || "");
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [services, search, categoryFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const th = (key: SortKey, label: string) => (
    <th onClick={() => toggleSort(key)} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-orange-600 whitespace-nowrap">
      {label}
      <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await vendorApi.services.delete(deleteTarget.id);
      setServices((current) => current.filter((service) => service.id !== deleteTarget.id));
      setSuccess(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      window.setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete service");
      window.setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    const newStatus = toggleTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await vendorApi.services.updateStatus(toggleTarget.id, newStatus);
      setServices((current) => current.map((service) => (service.id === toggleTarget.id ? { ...service, status: newStatus } : service)));
      setSuccess(`"${toggleTarget.title}" ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
      setToggleTarget(null);
      window.setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update service status");
      window.setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">{services.length} vendor services</p>
        </div>
        <Link href="/vendor/services/add" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
          <Plus size={16} /> Add Service
        </Link>
      </div>

      {success && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm"><CheckCircle2 size={15} /> {success}</div>}
      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"><AlertTriangle size={15} /> {error}</div>}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3"><p className="text-2xl font-bold text-gray-900">{services.length}</p><p className="text-xs text-gray-500 mt-0.5">Total</p></div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3"><p className="text-2xl font-bold text-green-600">{services.filter((service) => service.status === "ACTIVE").length}</p><p className="text-xs text-gray-500 mt-0.5">Active</p></div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3"><p className="text-2xl font-bold text-gray-500">{services.filter((service) => service.status !== "ACTIVE").length}</p><p className="text-xs text-gray-500 mt-0.5">Inactive</p></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search services, category, city, ID..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white" />
        </div>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-gray-600 min-w-[170px]">
          <option value="">All Categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No services found</p>
            <p className="text-sm mt-1">{search || categoryFilter ? "Try clearing filters." : "Add your first service to get started."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Service</th>
                  {th("category", "Category")}
                  {th("amount", "Price")}
                  {th("city", "City")}
                  {th("status", "Status")}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Sub-Services</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((service) => (
                  <tr key={service.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {service.image_url ? (
                          <img src={service.image_url} alt={service.title} className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-400 shrink-0"><ImageIcon size={18} /></div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-tight truncate max-w-[260px]">{service.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">ID: {service.id.slice(0, 12)}...</p>
                          {service.description && <p className="text-xs text-gray-500 mt-1 max-w-[320px] truncate">{service.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-700">{categoryLabel(service)}</span></td>
                    <td className="px-4 py-3"><div className="text-sm font-semibold text-gray-900">{formatMoney(service)}</div><div className="text-xs text-gray-400">{service.price_unit || "per event"}</div></td>
                    <td className="px-4 py-3 text-sm text-gray-700"><span className="inline-flex items-center gap-1"><MapPin size={13} className="text-gray-400" />{service.city || service.location || "-"}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setToggleTarget(service)} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all ${service.status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        {service.status === "ACTIVE" ? <ToggleRight size={14} className="text-green-500" /> : <ToggleLeft size={14} />}
                        {statusLabel(service.status)}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {service.subServices?.length ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{service.subServices.length} added</span> : <span className="text-xs text-gray-400">None</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/vendor/services/view/${service.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50" title="View"><Eye size={15} /></Link>
                        <Link href={`/vendor/services/edit/${service.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50" title="Edit"><Edit2 size={15} /></Link>
                        <button onClick={() => setDeleteTarget(service)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50 text-xs text-gray-400 text-right">Showing {filtered.length} of {services.length} services</div>}
      </div>

      <ConfirmModal open={!!deleteTarget} title="Delete Service?" message={`"${deleteTarget?.title}" will be permanently deleted.`} confirmLabel="Delete" confirmClass="bg-red-500 hover:bg-red-600" icon={<Trash2 size={24} className="text-red-500" />} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ConfirmModal open={!!toggleTarget} title={toggleTarget?.status === "ACTIVE" ? "Deactivate Service?" : "Activate Service?"} message={toggleTarget?.status === "ACTIVE" ? `"${toggleTarget?.title}" will be hidden from customers.` : `"${toggleTarget?.title}" will become visible to customers.`} confirmLabel={toggleTarget?.status === "ACTIVE" ? "Deactivate" : "Activate"} confirmClass={toggleTarget?.status === "ACTIVE" ? "bg-gray-600 hover:bg-gray-700" : "bg-green-500 hover:bg-green-600"} icon={toggleTarget?.status === "ACTIVE" ? <ToggleLeft size={24} className="text-gray-500" /> : <ToggleRight size={24} className="text-green-500" />} onConfirm={handleToggle} onCancel={() => setToggleTarget(null)} />
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Star,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  ChevronsUpDown,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";

type SortKey = "title" | "categoryId" | "priceMin" | "status" | "city";
type SortDir = "asc" | "desc";

interface SubService {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  status: string;
}

interface Service {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  description: string;
  city: string;
  price: {
    amount: number;
    currency: string;
  };
  status: string;
  subServices: SubService[];
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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        {icon && (
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (col !== sortKey)
    return <ChevronsUpDown size={13} className="text-gray-300 ml-1 inline" />;
  return sortDir === "asc" ? (
    <ChevronUp size={13} className="text-orange-500 ml-1 inline" />
  ) : (
    <ChevronDown size={13} className="text-orange-500 ml-1 inline" />
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  cat_wedding: "bg-pink-50 text-pink-700",
  cat_corporate: "bg-blue-50 text-blue-700",
  cat_birthday: "bg-purple-50 text-purple-700",
  cat_concert: "bg-red-50 text-red-700",
  default: "bg-gray-100 text-gray-600",
};

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [success, setSuccess] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Service | null>(null);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    fetchServices();
    router.prefetch("/vendor/services/add");
  }, [initialized, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("vendor_token");
      const controller = new AbortController();
      const response = await fetch(`${BASE_URL}/api/v1/services`, {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      const data = await response.json();
      setServices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem("vendor_token");
      const response = await fetch(
        `${BASE_URL}/api/v1/services/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to delete service");
      setServices((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccess(`"${deleteTarget.title}" deleted.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete service");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      const newStatus =
        toggleTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const token = localStorage.getItem("vendor_token");
      const response = await fetch(
        `${BASE_URL}/api/v1/services/${toggleTarget.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!response.ok) throw new Error("Failed to update service status");
      await fetchServices();
      setServices((prev) =>
        prev.map((item) =>
          item.id === toggleTarget.id
            ? {
                ...item,
                status: item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              }
            : item,
        ),
      );
      setToggleTarget(null);
      setSuccess(
        `"${toggleTarget.title}" ${newStatus === "ACTIVE" ? "activated" : "deactivated"}.`,
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update service status");
      setTimeout(() => setError(null), 3000);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const categories = useMemo(
    () => [...new Set(services.map((s) => s.categoryId))],
    [services],
  );

  const filtered = useMemo(() => {
    let list = services.filter((s) => {
      const q = search.toLowerCase();
      return (
        (!q ||
          s.title.toLowerCase().includes(q) ||
          s.categoryId.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)) &&
        (!catFilter || s.categoryId === catFilter)
      );
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "categoryId")
        cmp = a.categoryId.localeCompare(b.categoryId);
      else if (sortKey === "priceMin") cmp = a.price.amount - b.price.amount;
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "city") cmp = a.city.localeCompare(b.city);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [services, search, catFilter, sortKey, sortDir]);

  const th = (key: SortKey, label: string) => (
    <th
      onClick={() => toggleSort(key)}
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-orange-600 whitespace-nowrap"
    >
      {label}
      <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin text-orange-500 mx-auto mb-4"
          />
          <p className="text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {services.length} services listed
          </p>
        </div>
        <Link
          href="/vendor/services/add"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Service
        </Link>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 size={15} /> {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, category, ID…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white text-gray-600 min-w-[140px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace("cat_", "").replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: services.length, color: "text-gray-900" },
          {
            label: "Active",
            value: services.filter((s) => s.status === "ACTIVE").length,
            color: "text-green-600",
          },
          {
            label: "Inactive",
            value: services.filter((s) => s.status !== "ACTIVE").length,
            color: "text-gray-400",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center"
          >
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No services found</p>
            <p className="text-sm mt-1">
              {search || catFilter
                ? "Try clearing filters."
                : "Add your first service to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Service
                  </th>
                  {th("categoryId", "Category")}
                  {th("priceMin", "Price")}
                  {th("city", "City")}
                  {th("status", "Status")}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Sub-Services
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((svc) => (
                  <tr
                    key={svc.id}
                    className="hover:bg-orange-50/30 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-500 text-xs font-bold shrink-0">
                          {svc.title.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">
                            {svc.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ID: {svc.id.substring(0, 12)}...
                          </p>
                          {svc.description && (
                            <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                              {svc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[svc.categoryId] ?? CATEGORY_COLORS.default}`}
                      >
                        {svc.categoryId
                          .replace("cat_", "")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {svc.price.amount.toLocaleString()} {svc.price.currency}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {svc.city}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => setToggleTarget(svc)}
                        title={
                          svc.status === "ACTIVE"
                            ? "Click to deactivate"
                            : "Click to activate"
                        }
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all
                          ${svc.status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {svc.status === "ACTIVE" ? (
                          <ToggleRight size={14} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={14} />
                        )}
                        {svc.status === "ACTIVE" ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      {svc.subServices?.length ? (
                        <div className="flex flex-col gap-1">
                          {svc.subServices.map((sub) => (
                            <span
                              key={sub.id}
                              title={sub.title}
                              className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 truncate max-w-[160px]"
                            >
                              {sub.title}
                            </span>
                          ))}
                        </div>
                      ) : ( 
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/vendor/services/view/${svc.id}`}
                          title="View Details"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/vendor/services/edit/${svc.id}`}
                          title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(svc)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50 text-xs text-gray-400 text-right">
            Showing {filtered.length} of {services.length} services
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Service?"
        message={`"${deleteTarget?.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        confirmClass="bg-red-500 hover:bg-red-600"
        icon={<Trash2 size={24} className="text-red-500" />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={!!toggleTarget}
        title={
          toggleTarget?.status === "ACTIVE"
            ? "Deactivate Service?"
            : "Activate Service?"
        }
        message={
          toggleTarget?.status === "ACTIVE"
            ? `"${toggleTarget?.title}" will be hidden from customers.`
            : `"${toggleTarget?.title}" will become visible to customers.`
        }
        confirmLabel={
          toggleTarget?.status === "ACTIVE" ? "Deactivate" : "Activate"
        }
        confirmClass={
          toggleTarget?.status === "ACTIVE"
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-green-500 hover:bg-green-600"
        }
        icon={
          toggleTarget?.status === "ACTIVE" ? (
            <ToggleLeft size={24} className="text-gray-500" />
          ) : (
            <ToggleRight size={24} className="text-green-500" />
          )
        }
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}

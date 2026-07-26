"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  X,
  Phone,
  Mail,
  Globe,
  Calendar,
  Briefcase,
  MapPin,
  FileText,
  Sparkles,
  Clock,
  UserCheck,
  Search,
} from "lucide-react";
import Table from "@/components/admin/Table";
import Button from "@/components/admin/Button";
import Pagination from "@/components/admin/Pagination";
import StatsCard from "@/components/admin/StatsCard";
import { Column } from "@/lib/types";
import { adminApi } from "@/api/adminApi";
import toast from "react-hot-toast";

interface VendorLead {
  id: string;
  businessName: string;
  yourName: string;
  email: string;
  phone: string;
  websiteSocialMedia: string[];
  serviceCategoryId: string;
  cityId: string;
  yearsOfExperience: number;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  QUALIFIED: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};

const getStatusColor = (status: string) =>
  statusColors[status?.toUpperCase()] || "bg-gray-100 text-gray-700";

const formatDate = (v?: string) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export default function VendorLeadsPage() {
  const [leads, setLeads] = useState<VendorLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<VendorLead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.vendorLeads.list();
      const list: VendorLead[] = Array.isArray(res) ? res : res?.data ?? [];
      setLeads(list);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load vendor leads");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLead = (lead: VendorLead) => {
    setSelectedLead(lead);
    setIsViewOpen(true);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus =
      !filterStatus || lead.status?.toUpperCase() === filterStatus.toUpperCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      lead.businessName?.toLowerCase().includes(term) ||
      lead.yourName?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.phone?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statusOptions = Array.from(
    new Set(leads.map((l) => l.status).filter(Boolean)),
  );

  const countByStatus = (s: string) =>
    leads.filter((l) => l.status?.toUpperCase() === s).length;

  const leadsWithSrNo = filteredLeads.map((lead, index) => ({
    ...lead,
    sr_no: index + 1,
  }));

  const totalPages = Math.ceil(leadsWithSrNo.length / ITEMS_PER_PAGE);
  const paginatedData = leadsWithSrNo.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const columns: Column[] = [
    {
      key: "businessName",
      label: "Vendor",
      render: (v: string, row: VendorLead) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
            {v?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{v}</div>
            <div className="text-xs text-gray-500 truncate">{row.yourName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (v: string) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Phone size={14} className="text-gray-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400" />
          <span className="text-sm text-gray-700">{v}</span>
        </div>
      ),
    },
    {
      key: "cityId",
      label: "City",
      render: (v: string) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MapPin size={14} className="text-gray-400" />
          <span className="capitalize">{v}</span>
        </div>
      ),
    },
    {
      key: "yearsOfExperience",
      label: "Experience",
      render: (v: number) => <span className="text-sm text-gray-700">{v} yrs</span>,
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (v: string) => <span className="text-sm text-gray-500">{formatDate(v)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (v: string) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(v)}`}>
          {v}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_: any, row: VendorLead) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleViewLead(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
            title="View Details"
          >
            <Eye size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vendor Leads</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Enquiries submitted by vendors looking to list their services
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Leads" value={leads.length} icon={<FileText size={18} />} color="orange" />
        <StatsCard title="New" value={countByStatus("NEW")} icon={<Sparkles size={18} />} color="blue" />
        <StatsCard title="Contacted" value={countByStatus("CONTACTED")} icon={<Clock size={18} />} color="yellow" />
        <StatsCard title="Qualified" value={countByStatus("QUALIFIED")} icon={<UserCheck size={18} />} color="green" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by business, name, email or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">All Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-500">Loading leads...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table columns={columns} data={paginatedData} />
          </div>
          {leadsWithSrNo.length > 0 ? (
            <div className="border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={leadsWithSrNo.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No vendor leads found</p>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                  {selectedLead.businessName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{selectedLead.businessName}</h2>
                  <p className="text-xs text-gray-500">{selectedLead.yourName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-5">
                <Clock size={12} /> Submitted on {formatDate(selectedLead.createdAt)}
                {selectedLead.updatedAt && selectedLead.updatedAt !== selectedLead.createdAt && (
                  <span> · Last updated on {formatDate(selectedLead.updatedAt)}</span>
                )}
              </p>

              {/* Contact */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <Mail size={15} className="text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-400">Email</p>
                      <p className="text-sm text-gray-900 truncate">{selectedLead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <Phone size={15} className="text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-400">Phone</p>
                      <p className="text-sm text-gray-900 truncate">{selectedLead.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor details */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vendor Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                    <MapPin size={15} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-[11px] text-gray-400">City</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{selectedLead.cityId || "-"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                    <Briefcase size={15} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-[11px] text-gray-400">Experience</p>
                    <p className="text-sm font-medium text-gray-900">{selectedLead.yearsOfExperience ?? "-"} yrs</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100 col-span-2 sm:col-span-1">
                    <Calendar size={15} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-[11px] text-gray-400">Submitted</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedLead.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Website / Social */}
              {selectedLead.websiteSocialMedia?.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Globe size={12} /> Website / Social Media
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.websiteSocialMedia.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 break-all"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedLead.message && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Briefcase size={12} /> Message
                  </h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed">
                    {selectedLead.message}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end shrink-0 bg-white">
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
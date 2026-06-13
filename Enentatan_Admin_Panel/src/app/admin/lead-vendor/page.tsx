"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import Table from "@/components/admin/Table";
import Modal from "@/components/admin/Modal";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Pagination from "@/components/admin/Pagination";
import Button from "@/components/admin/Button";
import Input from "@/components/admin/Input";
import { Column } from "@/lib/types";

interface VendorLead {
  id: string;
  vendorName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  vendorCategory: string;
  location: string;
  serviceArea: string;
  leadSource: string;
  eventType: string;
  requirementDetails: string;
  assignedSalesRep: string;
  createdAt: string;
  status: "new" | "contacted" | "qualified" | "lost";
}

const vendorCategories = [
  "Catering",
  "Decor",
  "Photography",
  "Videography",
  "Venue",
  "Music & Entertainment",
  "Florist",
  "Makeup & Hair",
  "Bridal Wear",
  "Groom Wear",
  "Invitations",
  "Transportation",
  "Accommodation",
  "Others",
];

const leadSources = [
  "Website",
  "App",
  "Referral",
  "Social Media - Instagram",
  "Social Media - Facebook",
  "Social Media - LinkedIn",
  "Google Search",
  "Email Marketing",
  "Event Directory",
  "Walk-in",
  "Phone Inquiry",
  "Others",
];

const eventTypes = [
  "Wedding",
  "Corporate Event",
  "Birthday Party",
  "Anniversary",
  "Engagement",
  "Baby Shower",
  "Bachelor/Bachelorette",
  "Conference",
  "Seminar",
  "Product Launch",
  "Team Building",
  "Festival Celebration",
  "Charity Event",
  "Others",
];

const salesReps = [
  "Rahul Sharma",
  "Priya Patel",
  "Amit Kumar",
  "Neha Singh",
  "Vikram Mehta",
  "Unassigned",
];

const leadStatuses = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  {
    value: "contacted",
    label: "Contacted",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "qualified",
    label: "Qualified",
    color: "bg-green-100 text-green-800",
  },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
];

export default function VendorLeadsPage() {
  const [leads, setLeads] = useState<VendorLead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<VendorLead | null>(null);
  const [leadForm, setLeadForm] = useState<Partial<VendorLead>>({
    vendorName: "",
    contactPerson: "",
    mobileNumber: "",
    email: "",
    vendorCategory: "",
    location: "",
    serviceArea: "",
    leadSource: "",
    eventType: "",
    requirementDetails: "",
    assignedSalesRep: "Unassigned",
    status: "new",
  });
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const savedLeads = localStorage.getItem("vendorLeads");
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      const sampleLeads: VendorLead[] = [
        {
          id: "1",
          vendorName: "Grand Palace Banquets",
          contactPerson: "Rajesh Khanna",
          mobileNumber: "9876543210",
          email: "contact@grandpalace.com",
          vendorCategory: "Venue",
          location: "Mumbai",
          serviceArea: "Mumbai & Suburbs",
          leadSource: "Website",
          eventType: "Wedding",
          requirementDetails:
            "Looking for banquet hall for 500 guests with catering and decoration",
          assignedSalesRep: "Rahul Sharma",
          createdAt: new Date().toISOString(),
          status: "new",
        },
        {
          id: "2",
          vendorName: "Magic Moments Photography",
          contactPerson: "Priyanka Mehta",
          mobileNumber: "9988776655",
          email: "priyanka@magicmoments.com",
          vendorCategory: "Photography",
          location: "Delhi NCR",
          serviceArea: "Delhi, Gurgaon, Noida",
          leadSource: "Instagram",
          eventType: "Wedding",
          requirementDetails:
            "Need pre-wedding and wedding day photography with album",
          assignedSalesRep: "Priya Patel",
          createdAt: new Date().toISOString(),
          status: "contacted",
        },
        {
          id: "3",
          vendorName: "Spice Village Caterers",
          contactPerson: "Suresh Jain",
          mobileNumber: "9876501234",
          email: "suresh@spicevillage.com",
          vendorCategory: "Catering",
          location: "Bangalore",
          serviceArea: "Bangalore, Mysore",
          leadSource: "Referral",
          eventType: "Corporate Event",
          requirementDetails:
            "Corporate lunch for 200 people, need vegetarian and non-veg options",
          assignedSalesRep: "Amit Kumar",
          createdAt: new Date().toISOString(),
          status: "qualified",
        },
        {
          id: "4",
          vendorName: "Royal Decorators",
          contactPerson: "Meera Sharma",
          mobileNumber: "9988223344",
          email: "meera@royaldecor.com",
          vendorCategory: "Decor",
          location: "Jaipur",
          serviceArea: "Jaipur, Udaipur, Jodhpur",
          leadSource: "Facebook",
          eventType: "Wedding",
          requirementDetails:
            "Traditional wedding decor with floral arrangements and lighting",
          assignedSalesRep: "Neha Singh",
          createdAt: new Date().toISOString(),
          status: "new",
        },
        {
          id: "5",
          vendorName: "Melody Makers Entertainment",
          contactPerson: "Vikram Singh",
          mobileNumber: "9876549870",
          email: "vikram@melodymakers.com",
          vendorCategory: "Music & Entertainment",
          location: "Pune",
          serviceArea: "Pune, Mumbai",
          leadSource: "Google Search",
          eventType: "Birthday Party",
          requirementDetails: "DJ and live band for 50th birthday celebration",
          assignedSalesRep: "Vikram Mehta",
          createdAt: new Date().toISOString(),
          status: "contacted",
        },
        {
          id: "6",
          vendorName: "Elegant Bridal Studio",
          contactPerson: "Kavita Reddy",
          mobileNumber: "9988001122",
          email: "kavita@elegantbridal.com",
          vendorCategory: "Bridal Wear",
          location: "Hyderabad",
          serviceArea: "Hyderabad, Vijayawada",
          leadSource: "Instagram",
          eventType: "Wedding",
          requirementDetails: "Bridal lehenga and wedding trousseau",
          assignedSalesRep: "Priya Patel",
          createdAt: new Date().toISOString(),
          status: "qualified",
        },
        {
          id: "7",
          vendorName: "Perfect Plan Events",
          contactPerson: "Anjali Desai",
          mobileNumber: "9876512345",
          email: "anjali@perfectplan.com",
          vendorCategory: "Others",
          location: "Ahmedabad",
          serviceArea: "Ahmedabad, Surat, Vadodara",
          leadSource: "Website",
          eventType: "Conference",
          requirementDetails:
            "Event management for tech conference with 300 attendees",
          assignedSalesRep: "Rahul Sharma",
          createdAt: new Date().toISOString(),
          status: "new",
        },
        {
          id: "8",
          vendorName: "Shutterbug Studios",
          contactPerson: "Arjun Nair",
          mobileNumber: "9876598765",
          email: "arjun@shutterbug.com",
          vendorCategory: "Videography",
          location: "Chennai",
          serviceArea: "Chennai, Coimbatore",
          leadSource: "Referral",
          eventType: "Wedding",
          requirementDetails: "Cinematic wedding video and highlight reel",
          assignedSalesRep: "Amit Kumar",
          createdAt: new Date().toISOString(),
          status: "contacted",
        },
      ];
      setLeads(sampleLeads);
      localStorage.setItem("vendorLeads", JSON.stringify(sampleLeads));
    }
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem("vendorLeads", JSON.stringify(leads));
    }
  }, [leads]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleAddLead = () => {
    setSelectedLead(null);
    setLeadForm({
      vendorName: "",
      contactPerson: "",
      mobileNumber: "",
      email: "",
      vendorCategory: "",
      location: "",
      serviceArea: "",
      leadSource: "",
      eventType: "",
      requirementDetails: "",
      assignedSalesRep: "Unassigned",
      status: "new",
    });
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: VendorLead) => {
    setSelectedLead(lead);
    setLeadForm(lead);
    setIsModalOpen(true);
  };

  const handleViewLead = (lead: VendorLead) => {
    setSelectedLead(lead);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (lead: VendorLead) => {
    setSelectedLead(lead);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !leadForm.vendorName ||
      !leadForm.contactPerson ||
      !leadForm.mobileNumber ||
      !leadForm.email
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    if (selectedLead) {
      const updatedLeads = leads.map((lead) =>
        lead.id === selectedLead.id
          ? { ...lead, ...leadForm, updatedAt: new Date().toISOString() }
          : lead,
      );
      setLeads(updatedLeads);
    } else {
      const newLead: VendorLead = {
        id: generateId(),
        vendorName: leadForm.vendorName || "",
        contactPerson: leadForm.contactPerson || "",
        mobileNumber: leadForm.mobileNumber || "",
        email: leadForm.email || "",
        vendorCategory: leadForm.vendorCategory || "",
        location: leadForm.location || "",
        serviceArea: leadForm.serviceArea || "",
        leadSource: leadForm.leadSource || "",
        eventType: leadForm.eventType || "",
        requirementDetails: leadForm.requirementDetails || "",
        assignedSalesRep: leadForm.assignedSalesRep || "Unassigned",
        status: leadForm.status || "new",
        createdAt: new Date().toISOString(),
      };
      setLeads([newLead, ...leads]);
    }

    setIsModalOpen(false);
    setLoading(false);
  };

  const handleDelete = () => {
    if (selectedLead) {
      const updatedLeads = leads.filter((lead) => lead.id !== selectedLead.id);
      setLeads(updatedLeads);
      setIsDeleteOpen(false);
      setSelectedLead(null);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus =
      filterStatus === "all" || lead.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || lead.vendorCategory === filterCategory;
    return matchesStatus && matchesCategory;
  });

  const leadsWithSrNo = filteredLeads.map((lead, index) => ({
    ...lead,
    sr_no: index + 1,
  }));

  const totalPages = Math.ceil(leadsWithSrNo.length / ITEMS_PER_PAGE);
  const paginatedData = leadsWithSrNo.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getStatusBadge = (status: VendorLead["status"]) => {
    const statusInfo = leadStatuses.find((s) => s.value === status);
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}
      >
        {statusInfo?.label}
      </span>
    );
  };

  const columns: Column[] = [
    {
      key: "sr_no",
      label: "Sr. No.",
      render: (v: number) => (
        <span className="text-gray-600 font-medium">{v}</span>
      ),
    },
    {
      key: "vendorName",
      label: "Vendor Name",
      render: (v: string, row: VendorLead) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.vendorCategory}</div>
        </div>
      ),
    },
    {
      key: "contactPerson",
      label: "Contact Person",
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: "mobileNumber",
      label: "Mobile",
      render: (v: string) => (
        <div className="flex items-center gap-2">
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
          <span className="text-sm">{v}</span>
        </div>
      ),
    },
    {
      key: "eventType",
      label: "Event Type",
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v: VendorLead["status"]) => getStatusBadge(v),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: VendorLead) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewLead(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => handleEditLead(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Vendor Leads Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {leads.length} total leads •
              <span className="text-green-600 ml-1">
                {leads.filter((l) => l.status === "qualified").length} qualified
              </span>
            </p>
          </div>
          <Button onClick={handleAddLead} className="flex items-center gap-2">
            <Plus size={18} />
            Add Lead
          </Button>
        </div>

        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white text-gray-900"
          >
            <option value="all">All Status</option>
            {leadStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white text-gray-900"
          >
            <option value="all">All Categories</option>
            {vendorCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {loading && leads.length === 0 ? (
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
            <div className="border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={leadsWithSrNo.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLead ? "Edit Vendor Lead" : "Add New Vendor Lead"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div
            className="flex-1 overflow-y-auto pr-2"
            style={{ maxHeight: "calc(70vh - 80px)" }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 6px;
              }
              div::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
              }
              div::-webkit-scrollbar-thumb {
                background: #f97316;
                border-radius: 10px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: #ea580c;
              }
            `}</style>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendor Name / Company Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={leadForm.vendorName || ""}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, vendorName: e.target.value })
                  }
                  placeholder="Enter vendor name"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={leadForm.contactPerson || ""}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, contactPerson: e.target.value })
                  }
                  placeholder="Enter contact person name"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={leadForm.mobileNumber || ""}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, mobileNumber: e.target.value })
                  }
                  placeholder="Enter mobile number"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={leadForm.email || ""}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendor Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={leadForm.vendorCategory || ""}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, vendorCategory: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                  required
                >
                  <option value="">Select Category</option>
                  {vendorCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  value={leadForm.location || ""}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, location: e.target.value })
                  }
                  placeholder="Enter city/area"
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Area
                </label>
                <Input
                  value={leadForm.serviceArea || ""}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, serviceArea: e.target.value })
                  }
                  placeholder="Areas they serve"
                  disabled={loading}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lead Source
                </label>
                <select
                  value={leadForm.leadSource || ""}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, leadSource: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">Select Source</option>
                  {leadSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={leadForm.eventType || ""}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, eventType: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">Select Event Type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assigned Sales Representative
                </label>
                <select
                  value={leadForm.assignedSalesRep || "Unassigned"}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      assignedSalesRep: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                >
                  {salesReps.map((rep) => (
                    <option key={rep} value={rep}>
                      {rep}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lead Status
                </label>
                <select
                  value={leadForm.status || "new"}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      status: e.target.value as VendorLead["status"],
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900"
                >
                  {leadStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requirement Details / Notes
                </label>
                <textarea
                  value={leadForm.requirementDetails || ""}
                  onChange={(e) =>
                    setLeadForm({
                      ...leadForm,
                      requirementDetails: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Detailed requirements, budget, timeline, special notes, etc."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Lead"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Lead Details"
        size="lg"
      >
        {selectedLead && (
          <div className="flex flex-col h-full">
            <div
              className="flex-1 overflow-y-auto pr-2"
              style={{ maxHeight: "calc(70vh - 80px)" }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 6px;
                }
                div::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb {
                  background: #f97316;
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: #ea580c;
                }
              `}</style>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendor Name
                  </label>
                  <p className="text-gray-900 font-medium mt-1 text-base">
                    {selectedLead.vendorName}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedLead.status)}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedLead.contactPerson}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedLead.mobileNumber}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </label>
                  <p className="text-gray-900 mt-1 break-all">
                    {selectedLead.email}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendor Category
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedLead.vendorCategory}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedLead.location || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Service Area
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedLead.serviceArea || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Lead Source
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedLead.leadSource || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Event Type
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedLead.eventType || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Assigned Sales Rep
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedLead.assignedSalesRep}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created On
                  </label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedLead.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Requirement Details
                  </label>
                  <p className="text-gray-900 mt-2 whitespace-pre-wrap leading-relaxed">
                    {selectedLead.requirementDetails || "-"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
              <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete lead from "${selectedLead?.vendorName}"? This action cannot be undone.`}
      />
    </div>
  );
}

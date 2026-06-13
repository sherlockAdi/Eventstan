"use client";

import { useEffect, useState } from "react";
import { Edit, MapPin, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import Button from "@/components/admin/Button";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Input from "@/components/admin/Input";
import Modal from "@/components/admin/Modal";
import Pagination from "@/components/admin/Pagination";
import Table from "@/components/admin/Table";
import { Column } from "@/lib/types";
import toast from "react-hot-toast";

interface State {
  id: number;
  name: string;
  code: string;
  countryId: number;
  countryName: string;
  status: string;
}

interface Country {
  id: number;
  name: string;
  code: string;
}

const initialStates: State[] = [
  { id: 1, name: "Maharashtra", code: "MH", countryId: 1, countryName: "India", status: "Active" },
  { id: 2, name: "Delhi", code: "DL", countryId: 1, countryName: "India", status: "Active" },
  { id: 3, name: "Karnataka", code: "KA", countryId: 1, countryName: "India", status: "Active" },
  { id: 4, name: "Gujarat", code: "GJ", countryId: 1, countryName: "India", status: "Active" },
  { id: 5, name: "Tamil Nadu", code: "TN", countryId: 1, countryName: "India", status: "Active" },
  { id: 6, name: "California", code: "CA", countryId: 2, countryName: "USA", status: "Active" },
  { id: 7, name: "Texas", code: "TX", countryId: 2, countryName: "USA", status: "Active" },
  { id: 8, name: "Florida", code: "FL", countryId: 2, countryName: "USA", status: "Active" },
  { id: 9, name: "New York", code: "NY", countryId: 2, countryName: "USA", status: "Active" },
  { id: 10, name: "London", code: "LON", countryId: 3, countryName: "UK", status: "Active" },
  { id: 11, name: "Manchester", code: "MAN", countryId: 3, countryName: "UK", status: "Inactive" },
  { id: 12, name: "Birmingham", code: "BIR", countryId: 3, countryName: "UK", status: "Active" },
  { id: 13, name: "Dubai", code: "DUB", countryId: 4, countryName: "UAE", status: "Active" },
  { id: 14, name: "Abu Dhabi", code: "ABU", countryId: 4, countryName: "UAE", status: "Active" },
  { id: 15, name: "Sharjah", code: "SHA", countryId: 4, countryName: "UAE", status: "Inactive" },
];

const countries: Country[] = [
  { id: 1, name: "India", code: "IN" },
  { id: 2, name: "USA", code: "US" },
  { id: 3, name: "UK", code: "GB" },
  { id: 4, name: "UAE", code: "AE" },
];

const emptyState: Partial<State> = {
  name: "",
  code: "",
  countryId: 0,
  countryName: "",
  status: "Active",
};

export default function StatesPage() {
  const [states, setStates] = useState<State[]>(initialStates);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selected, setSelected] = useState<State | null>(null);
  const [pendingStatus, setPendingStatus] = useState("");
  const [form, setForm] = useState<Partial<State>>(emptyState);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, []);

  const openAdd = () => {
    setSelected(null);
    setForm(emptyState);
    setModalOpen(true);
  };

  const openEdit = (state: State) => {
    setSelected(state);
    setForm(state);
    setModalOpen(true);
  };

  const openStatusModal = (state: State) => {
    setSelected(state);
    setPendingStatus(state.status === "Active" ? "Inactive" : "Active");
    setStatusOpen(true);
  };

  const updateCode = (code: string) => {
    const upperCode = code.toUpperCase();
    setForm({ ...form, code: upperCode });
  };

  const handleCountryChange = (countryId: number) => {
    const selectedCountry = countries.find(c => c.id === countryId);
    setForm({ 
      ...form, 
      countryId, 
      countryName: selectedCountry?.name || "" 
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.code || !form.countryId) {
      toast.error("Please fill all required fields");
      return;
    }

    const newState: State = {
      id: selected ? selected.id : Math.max(...states.map(s => s.id), 0) + 1,
      name: form.name,
      code: form.code.toUpperCase(),
      countryId: form.countryId,
      countryName: form.countryName || "",
      status: form.status || "Active",
    };

    if (selected) {
      setStates(states.map(state => state.id === selected.id ? newState : state));
      toast.success("State updated");
    } else {
      setStates([...states, newState]);
      toast.success("State created");
    }

    setModalOpen(false);
  };

  const confirmStatus = async () => {
    if (!selected) return;
    setStates(states.map(state => 
      state.id === selected.id 
        ? { ...state, status: pendingStatus }
        : state
    ));
    toast.success("State status updated");
    setStatusOpen(false);
    setSelected(null);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    setStates(states.filter(state => state.id !== selected.id));
    toast.success("State deleted");
    setDeleteOpen(false);
    setSelected(null);
  };

  const columns: Column[] = [
    { key: "id", label: "ID" },
    { 
      key: "name", 
      label: "State Name", 
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      ) 
    },
    { 
      key: "code", 
      label: "Code", 
      render: (value: string) => (
        <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{value}</span>
      ) 
    },
    { key: "countryName", label: "Country" },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: State) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${value === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {value}
          </span>
          <button 
            onClick={() => openStatusModal(row)} 
            className="text-gray-500 hover:text-orange-600 transition-colors" 
            title={value === "Active" ? "Deactivate" : "Activate"}
          >
            {value === "Active" ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: State) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => openEdit(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50" 
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={() => { setSelected(row); setDeleteOpen(true); }} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50" 
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(states.length / ITEMS_PER_PAGE);
  const paginatedData = states.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="flex h-64 items-center justify-center text-sm text-gray-500">Loading states...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">States Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {states.length} states - {states.filter(state => state.status === "Active").length} active
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={15} />
          Add State
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <Table columns={columns} data={paginatedData} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={states.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? "Edit State" : "Add State"} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-x-4">
            <Input 
              label="State Name" 
              value={form.name || ""} 
              onChange={event => setForm({ ...form, name: event.target.value })} 
              required 
            />
            <Input 
              label="State Code" 
              value={form.code || ""} 
              onChange={event => updateCode(event.target.value)} 
              maxLength={3} 
              required 
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Country <span className="text-red-500">*</span>
              </label>
              <select 
                value={form.countryId || ""} 
                onChange={event => handleCountryChange(parseInt(event.target.value))} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select 
                value={form.status || "Active"} 
                onChange={event => setForm({ ...form, status: event.target.value })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={statusOpen} 
        onClose={() => setStatusOpen(false)} 
        onConfirm={confirmStatus} 
        title={`${pendingStatus} State`} 
        message={`Are you sure you want to set "${selected?.name}" as ${pendingStatus}?`} 
      />
      
      <ConfirmModal 
        isOpen={deleteOpen} 
        onClose={() => setDeleteOpen(false)} 
        onConfirm={confirmDelete} 
        title="Delete State" 
        message={`Delete "${selected?.name}"? This action cannot be undone.`} 
      />
    </div>
  );
}
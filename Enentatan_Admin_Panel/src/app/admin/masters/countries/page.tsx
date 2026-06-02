"use client";

import { useState, useEffect } from "react";
import { Plus, Globe, ToggleLeft, ToggleRight, Edit, Trash2 } from "lucide-react";
import Table from "@/components/admin/Table";
import Modal from "@/components/admin/Modal";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Button from "@/components/admin/Button";
import Input from "@/components/admin/Input";
import { Column } from "@/lib/types";
import { BASE_API_URL } from "@/lib/constants";
import toast from "react-hot-toast";

interface Country {
  id: number;
  code: string;
  name: string;
  defaultCurrency: string;
  flag: string;
  currencySymbol: string;
  phoneCode: string;
  status: string;
}

// Common country flags mapping
const countryFlags: { [key: string]: string } = {
  AE: "🇦🇪",
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  JP: "🇯🇵",
  CN: "🇨🇳",
  BR: "🇧🇷",
  RU: "🇷🇺",
  ZA: "🇿🇦",
  SG: "🇸🇬",
  MY: "🇲🇾",
  TH: "🇹🇭",
  KR: "🇰🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  MX: "🇲🇽",
};

// Currency symbols mapping
const currencySymbols: { [key: string]: string } = {
  AED: "د.إ",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
};

// Phone codes mapping
const phoneCodes: { [key: string]: string } = {
  AE: "+971",
  IN: "+91",
  US: "+1",
  GB: "+44",
  CA: "+1",
  AU: "+61",
  DE: "+49",
  FR: "+33",
  JP: "+81",
  CN: "+86",
  BR: "+55",
  RU: "+7",
  ZA: "+27",
  SG: "+65",
  MY: "+60",
  TH: "+66",
  KR: "+82",
  IT: "+39",
  ES: "+34",
  MX: "+52",
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selected, setSelected] = useState<Country | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [form, setForm] = useState<Partial<Country>>({
    name: "",
    code: "",
    flag: "",
    defaultCurrency: "",
    currencySymbol: "",
    phoneCode: "",
    status: "Active",
  });

  // Fetch countries from API
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_API_URL}master-data/countries`);
      const data = await response.json();
      
      // Transform API data to our Country interface with auto-generated IDs
      const transformedData: Country[] = data.map((item: any, index: number) => ({
        id: index + 1,
        code: item.code,
        name: item.name,
        defaultCurrency: item.defaultCurrency,
        flag: countryFlags[item.code] || "🏳️",
        currencySymbol: currencySymbols[item.defaultCurrency] || item.defaultCurrency,
        phoneCode: phoneCodes[item.code] || "",
        status: "Active",
      }));
      
      setCountries(transformedData);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to fetch countries");
      setCountries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openStatusModal = (country: Country) => {
    setSelected(country);
    const newStatus = country.status === "Active" ? "Inactive" : "Active";
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selected && pendingStatus) {
      setCountries(
        countries.map((c) =>
          c.id === selected.id ? { ...c, status: pendingStatus } : c
        )
      );
      toast.success(`Country ${pendingStatus === "Active" ? "activated" : "deactivated"} successfully!`);
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus("");
    }
  };

  const openEdit = (country: Country) => {
    setSelected(country);
    setForm(country);
    setIsModalOpen(true);
  };

  const openDelete = (country: Country) => {
    setSelected(country);
    setIsDeleteOpen(true);
  };

  const columns: Column[] = [
    { 
      key: "id", 
      label: "S.No.",
      render: (v: number) => <span className="text-gray-600">{v}</span>
    },
    {
      key: "flag",
      label: "Flag",
      render: (v: string) => <span className="text-2xl">{v || "🏳️"}</span>,
    },
    {
      key: "name",
      label: "Country Name",
      render: (v: string, row: Country) => (
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-gray-400" />
          <span className="font-medium">{v}</span>
        </div>
      ),
    },
    {
      key: "code",
      label: "Country Code",
      render: (v: string) => (
        <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
          {v}
        </span>
      ),
    },
    { key: "defaultCurrency", label: "Currency" },
    { key: "currencySymbol", label: "Symbol" },
    { key: "phoneCode", label: "Phone Code" },
    {
      key: "status",
      label: "Status",
      render: (v: string, row: Country) => (
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              v === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {v}
          </span>
          <button
            onClick={() => openStatusModal(row)}
            className="text-gray-500 hover:text-orange-600 transition-colors"
            title={v === "Active" ? "Deactivate" : "Activate"}
          >
            {v === "Active" ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Country) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => openEdit(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all" 
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={() => openDelete(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" 
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  const openAdd = () => {
    setSelected(null);
    setForm({
      name: "",
      code: "",
      flag: "",
      defaultCurrency: "",
      currencySymbol: "",
      phoneCode: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleCountryCodeChange = (code: string) => {
    const upperCode = code.toUpperCase();
    const flag = countryFlags[upperCode] || "🏳️";
    const phoneCode = phoneCodes[upperCode] || "";
    setForm({ ...form, code: upperCode, flag, phoneCode });
  };

  const handleCurrencyChange = (currency: string) => {
    const symbol = currencySymbols[currency] || currency;
    setForm({ ...form, defaultCurrency: currency, currencySymbol: symbol });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.code ||
      !form.defaultCurrency
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (selected) {
      // Update existing country
      setCountries(
        countries.map((c) =>
          c.id === selected.id ? ({ ...c, ...form } as Country) : c
        )
      );
      toast.success("Country updated successfully!");
    } else {
      // Add new country
      const newCountry: Country = {
        id: countries.length + 1,
        name: form.name ?? "",
        code: (form.code ?? "").toUpperCase(),
        flag: form.flag || countryFlags[form.code?.toUpperCase() || ""] || "🏳️",
        defaultCurrency: form.defaultCurrency ?? "",
        currencySymbol: form.currencySymbol ?? "",
        phoneCode: form.phoneCode ?? "",
        status: form.status ?? "Active",
      };
      setCountries([...countries, newCountry]);
      toast.success("Country added successfully!");
    }
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading countries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Countries Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {countries.length} countries ·{" "}
            {countries.filter((c) => c.status === "Active").length} active
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={15} />
          Add Country
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <Table
          columns={columns}
          data={countries}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selected ? "Edit Country" : "Add Country"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-4">
            <Input
              label="Country Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. India"
              required
            />

            <div>
              <Input
                label="Country Code (e.g. IN)"
                value={form.code}
                onChange={(e) => handleCountryCodeChange(e.target.value)}
                maxLength={3}
                placeholder="IN"
                required
              />
              {form.code && (
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                  <span>Flag preview:</span>
                  <span className="text-xl">
                    {form.flag ||
                      countryFlags[form.code?.toUpperCase() || ""] ||
                      "🏳️"}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Flag
              </label>
              <div className="px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50">
                <span className="text-3xl">
                  {form.flag ||
                    countryFlags[form.code?.toUpperCase() || ""] ||
                    "🏳️"}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  (Auto-generated from code)
                </span>
              </div>
            </div>

            <Input
              label="Currency (e.g. INR)"
              value={form.defaultCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              placeholder="INR"
              required
            />

            <Input
              label="Currency Symbol (e.g. ₹)"
              value={form.currencySymbol}
              onChange={(e) =>
                setForm({ ...form, currencySymbol: e.target.value })
              }
              placeholder="₹"
              required
            />

            <Input
              label="Phone Code (e.g. +91)"
              value={form.phoneCode}
              onChange={(e) => setForm({ ...form, phoneCode: e.target.value })}
              placeholder="+91"
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <ConfirmModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelected(null);
          setPendingStatus("");
        }}
        onConfirm={confirmStatusChange}
        title={pendingStatus === "Active" ? "Activate Country" : "Deactivate Country"}
        message={`Are you sure you want to ${pendingStatus === "Active" ? "activate" : "deactivate"} country "${selected?.name}"?`}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (selected) {
            setCountries(countries.filter((c) => c.id !== selected.id));
            toast.success("Country deleted successfully!");
          }
          setIsDeleteOpen(false);
        }}
        title="Delete Country"
        message={`Are you sure you want to delete country "${selected?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

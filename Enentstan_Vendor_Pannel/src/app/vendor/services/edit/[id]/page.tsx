"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { vendorApi } from "@/api/vendorApi";

const PRICE_UNITS = ["per event", "per person", "per hour", "per day"] as const;
const CURRENCIES = ["AED", "USD", "EUR", "SAR"] as const;

interface ApiService {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  category?: string;
  description?: string;
  city?: string;
  price?: { amount: number; currency: string };
  price_max?: number;
  price_unit?: string;
  image_url?: string;
  status: string;
}

const emptyForm = {
  vendorId: "",
  categoryId: "",
  title: "",
  description: "",
  city: "",
  amount: "",
  currency: "AED",
  priceMax: "",
  priceUnit: "per event",
  imageUrl: "",
  status: "ACTIVE",
};

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [service, setService] = useState<ApiService | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError("");
        const data = await vendorApi.services.get<ApiService>(id);
        setService(data);
        setForm({
          vendorId: data.vendorId || "",
          categoryId: data.categoryId || "",
          title: data.title || "",
          description: data.description || "",
          city: data.city || "",
          amount: String(data.price?.amount ?? ""),
          currency: data.price?.currency || "AED",
          priceMax: String(data.price_max ?? data.price?.amount ?? ""),
          priceUnit: data.price_unit || "per event",
          imageUrl: data.image_url || "",
          status: data.status || "ACTIVE",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    try {
      setUploading(true);
      const result = await vendorApi.uploads.image(file, "services");
      set("imageUrl", result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    if (!form.vendorId) return "Vendor ID is missing.";
    if (!form.categoryId) return "Category ID is missing.";
    if (!form.title.trim()) return "Service title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.amount || Number(form.amount) <= 0) return "Valid price is required.";
    if (form.priceMax && Number(form.priceMax) < Number(form.amount)) return "Max price cannot be less than base price.";
    return "";
  };

  const save = async () => {
    if (!id) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      await vendorApi.services.update(id, {
        vendorId: form.vendorId,
        categoryId: form.categoryId,
        title: form.title.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        price: {
          amount: Number(form.amount),
          currency: form.currency,
        },
        priceMax: form.priceMax ? Number(form.priceMax) : Number(form.amount),
        priceUnit: form.priceUnit,
        imageUrl: form.imageUrl,
        status: form.status,
      });
      router.push("/vendor/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Loader2 size={24} className="animate-spin text-orange-400 mx-auto" />
        <p className="text-gray-400 text-sm mt-3">Loading service...</p>
      </div>
    );
  }

  if (!service && error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
          <p className="text-gray-800 font-semibold">Service not found</p>
          <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
          <button onClick={() => router.push("/vendor/services")} className="mt-4 text-orange-500 text-sm underline">
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {id} {service?.category ? `- ${service.category}` : ""}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Vendor ID</label>
              <input value={form.vendorId} onChange={(event) => set("vendorId", event.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Category ID</label>
              <input value={form.categoryId} onChange={(event) => set("categoryId", event.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 font-mono" />
              {service?.category && <p className="text-xs text-gray-400 mt-1">Current category: {service.category}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Service Title *</label>
            <input value={form.title} onChange={(event) => set("title", event.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">City *</label>
            <input value={form.city} onChange={(event) => set("city", event.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Description *</label>
            <textarea value={form.description} onChange={(event) => set("description", event.target.value)} rows={4} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Base Price *</label>
              <input type="number" min="0" value={form.amount} onChange={(event) => set("amount", event.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Max Price</label>
              <input type="number" min="0" value={form.priceMax} onChange={(event) => set("priceMax", event.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Currency</label>
              <select value={form.currency} onChange={(event) => set("currency", event.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400">
                {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Unit</label>
              <select value={form.priceUnit} onChange={(event) => set("priceUnit", event.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400">
                {PRICE_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Image & Status</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-40">
              {form.imageUrl ? (
                <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-100">
                  <img src={form.imageUrl} alt={form.title} className="w-full h-full object-cover" />
                  <button onClick={() => set("imageUrl", "")} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-white">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} className="w-40 h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-300 hover:text-orange-400">
                  <ImagePlus size={24} />
                  <span className="text-xs">Upload image</span>
                </button>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Image URL</label>
                <input value={form.imageUrl} onChange={(event) => set("imageUrl", event.target.value)} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-semibold hover:bg-orange-50 disabled:opacity-60">
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                {uploading ? "Uploading..." : "Upload New Image"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0])} />
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Status</label>
                <select value={form.status} onChange={(event) => set("status", event.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pb-6">
        <button type="button" onClick={() => router.back()} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={save} disabled={saving || uploading} className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold transition-colors flex items-center justify-center gap-2">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

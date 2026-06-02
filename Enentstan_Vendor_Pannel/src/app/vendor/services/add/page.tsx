'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, AlertTriangle, CheckCircle2,
  Loader2, Plus, Trash2,
} from 'lucide-react';
import { BASE_URL } from '@/lib/constants';

const CATEGORIES = [
  { id: 'cat_wedding', label: 'Wedding' },
  { id: 'cat_corporate', label: 'Corporate' },
  { id: 'cat_birthday', label: 'Birthday' },
  { id: 'cat_concert', label: 'Concert' },
] as const;

const CURRENCIES = ['AED', 'USD', 'EUR', 'SAR'] as const;

const CITIES = [
  { id: 'dubai', name: 'Dubai' },
  { id: 'abu_dhabi', name: 'Abu Dhabi' },
  { id: 'sharjah', name: 'Sharjah' },
  { id: 'ajman', name: 'Ajman' },
  { id: 'ras_al_khaimah', name: 'Ras Al Khaimah' },
  { id: 'fujairah', name: 'Fujairah' },
  { id: 'umm_al_quwain', name: 'Umm Al Quwain' },
] as const;

const DEFAULT_FORM = {
  vendorId: 'ven_luxe_events',
  categoryId: 'cat_wedding' as typeof CATEGORIES[number]['id'],
  title: '',
  description: '',
  cityId: 'dubai' as typeof CITIES[number]['id'],
  priceAmount: '',
  priceCurrency: 'AED' as typeof CURRENCIES[number],
};

interface SubServiceForm {
  id: string;
  title: string;
  description: string;
  priceAmount: string;
  priceCurrency: typeof CURRENCIES[number];
}

export default function AddServicePage() {
  const router = useRouter();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [subServices, setSubServices] = useState<SubServiceForm[]>([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState<{code: string, name: string, defaultCurrency: string}[]>([]);

  // Fetch countries to get default currency (optional)
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/master-data/countries`);
        if (response.ok) {
          const data = await response.json();
          setCountries(data);
          // Set default currency from UAE if available
          const uae = data.find((c: any) => c.code === 'AE');
          if (uae && uae.defaultCurrency) {
            setForm(f => ({ ...f, priceCurrency: uae.defaultCurrency }));
          }
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };

    fetchCountries();
  }, []);

  const setFormField = (key: keyof typeof DEFAULT_FORM, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setFormError('');
  };

  const addSubService = () => {
    setSubServices(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'AED',
      },
    ]);
  };

  const removeSubService = (id: string) => {
    setSubServices(prev => prev.filter(s => s.id !== id));
  };

  const setSubField = (id: string, key: keyof Omit<SubServiceForm, 'id'>, val: string) => {
    setSubServices(prev =>
      prev.map(s => s.id === id ? { ...s, [key]: val } : s)
    );
    setFormError('');
  };

  const validate = () => {
    if (!form.title.trim()) return 'Service title is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.cityId) return 'City is required.';
    if (!form.priceAmount || Number(form.priceAmount) <= 0) return 'Valid price is required.';
    for (const sub of subServices) {
      if (!sub.title.trim()) return 'Sub-service title is required.';
      if (!sub.description.trim()) return 'Sub-service description is required.';
      if (!sub.priceAmount || Number(sub.priceAmount) <= 0) return 'Valid sub-service price is required.';
    }
    return '';
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true);

    try {
      const token = localStorage.getItem('vendor_token');
      const selectedCity = CITIES.find(c => c.id === form.cityId);
      const cityName = selectedCity ? selectedCity.name : form.cityId;

      const response = await fetch(`${BASE_URL}/api/v1/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          vendorId: form.vendorId,
          categoryId: form.categoryId,
          title: form.title.trim(),
          description: form.description.trim(),
          city: cityName,
          price: {
            amount: Number(form.priceAmount),
            currency: form.priceCurrency,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message || `Failed to create service (${response.status})`);
      }

      const createdService = await response.json();
      const serviceId = createdService.id;

      if (subServices.length > 0) {
        await Promise.all(
          subServices.map(sub =>
            fetch(`${BASE_URL}/api/v1/services/${serviceId}/sub-services`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              body: JSON.stringify({
                title: sub.title.trim(),
                description: sub.description.trim(),
                price: {
                  amount: Number(sub.priceAmount),
                  currency: sub.priceCurrency,
                },
              }),
            }).then(r => {
              if (!r.ok) throw new Error(`Failed to create sub-service: ${sub.title}`);
            })
          )
        );
      }

      router.push('/vendor/services');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create service. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details to list a new service</p>
        </div>
      </div>

      {formError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertTriangle size={15} /> {formError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">

        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Basic Information</h2>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Service Title *</label>
            <input
              value={form.title}
              onChange={e => setFormField('title', e.target.value)}
              placeholder="e.g. Luxury Wedding Decoration"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Category *</label>
            <select
              value={form.categoryId}
              onChange={e => setFormField('categoryId', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">City *</label>
            <select
              value={form.cityId}
              onChange={e => setFormField('cityId', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setFormField('description', e.target.value)}
              rows={4}
              placeholder="Describe your service in detail. What's included? What makes it special?"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Vendor ID</label>
            <input
              value={form.vendorId}
              onChange={e => setFormField('vendorId', e.target.value)}
              placeholder="ven_luxe_events"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 font-mono text-gray-600"
            />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Pricing</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Amount *</label>
              <input
                type="number"
                min="0"
                value={form.priceAmount}
                onChange={e => setFormField('priceAmount', e.target.value)}
                placeholder="25000"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Currency</label>
              <select
                value={form.priceCurrency}
                onChange={e => setFormField('priceCurrency', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {form.priceAmount && Number(form.priceAmount) > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-orange-700">
              Price: <strong>{Number(form.priceAmount).toLocaleString()} {form.priceCurrency}</strong>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
              Sub-Services
              {subServices.length > 0 && (
                <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 normal-case tracking-normal">
                  {subServices.length}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={addSubService}
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
            >
              <Plus size={13} /> Add Sub-Service
            </button>
          </div>

          {subServices.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              No sub-services added. Click "Add Sub-Service" to include packages or variants.
            </p>
          ) : (
            <div className="space-y-4">
              {subServices.map((sub, idx) => (
                <div key={sub.id} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Sub-Service #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSubService(sub.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Title *</label>
                    <input
                      value={sub.title}
                      onChange={e => setSubField(sub.id, 'title', e.target.value)}
                      placeholder="e.g. Premium Floral Entry"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Description *</label>
                    <textarea
                      value={sub.description}
                      onChange={e => setSubField(sub.id, 'description', e.target.value)}
                      rows={2}
                      placeholder="Describe this sub-service..."
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Amount *</label>
                      <input
                        type="number"
                        min="0"
                        value={sub.priceAmount}
                        onChange={e => setSubField(sub.id, 'priceAmount', e.target.value)}
                        placeholder="7500"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Currency</label>
                      <select
                        value={sub.priceCurrency}
                        onChange={e => setSubField(sub.id, 'priceCurrency', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
                      >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {sub.priceAmount && Number(sub.priceAmount) > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
                      Price: <strong>{Number(sub.priceAmount).toLocaleString()} {sub.priceCurrency}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="flex gap-3 pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {saving
            ? <><Loader2 size={16} className="animate-spin" /> Creating…</>
            : <><CheckCircle2 size={16} /> Create Service</>
          }
        </button>
      </div>
    </div>
  );
}
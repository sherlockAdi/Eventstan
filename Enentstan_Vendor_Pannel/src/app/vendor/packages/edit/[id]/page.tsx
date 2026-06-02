'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { packageStore, serviceStore, ServiceWithSlug } from '@/lib/store';
import type { Package } from '@/lib/types';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Search,
  CheckSquare, Square, Star, Layers, Percent, Info, X, ImageOff, ChevronDown, Link2,
} from 'lucide-react';

// ── Searchable Service Dropdown (same as add page) ──────────────
function SearchableServiceSelector({
  services, selected, onChange,
}: {
  services: ServiceWithSlug[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const dropRef           = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return services.filter(s => !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  }, [services, query]);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const selectedServices = services.filter(s => selected.includes(s.id));

  return (
    <div className="space-y-2" ref={dropRef}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border rounded-xl transition-all
          ${open ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'} bg-white`}>
        <span className={selected.length ? 'text-gray-700 font-medium' : 'text-gray-400'}>
          {selected.length > 0 ? `${selected.length} service${selected.length > 1 ? 's' : ''} selected` : 'Select services…'}
        </span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">{selected.length}</span>
          )}
          <ChevronDown size={15} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden z-50 relative">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search services…"
                className="w-full pl-8 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">No services found</p>
            ) : (
              filtered.map(s => {
                const isSelected = selected.includes(s.id);
                const thumb = s.images?.[0];
                return (
                  <button key={s.id} type="button" onClick={() => toggle(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all border-b border-gray-50 last:border-0
                      ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                    <div className="shrink-0">
                      {isSelected ? <CheckSquare size={15} className="text-orange-500" /> : <Square size={15} className="text-gray-300" />}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {thumb ? <img src={thumb} alt={s.name} className="w-full h-full object-cover" />
                              : <ImageOff size={13} className="text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm leading-tight truncate ${isSelected ? 'text-orange-800' : 'text-gray-800'}`}>{s.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.category} · AED {s.priceMin.toLocaleString()}–{s.priceMax.toLocaleString()}</p>
                    </div>
                    {s.rating > 0 && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs text-gray-500">{s.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">{filtered.length} services shown</span>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-orange-500 font-semibold hover:text-orange-600">Done ✓</button>
          </div>
        </div>
      )}

      {selectedServices.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Selected:</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedServices.map(sv => (
              <span key={sv.id} className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
                {sv.name}
                <button type="button" onClick={() => toggle(sv.id)} className="hover:text-orange-900 ml-0.5"><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditPackagePage() {
  const router  = useRouter();
  const { id }  = useParams<{ id: string }>();

  const [services,  setServices]  = useState<ServiceWithSlug[]>([]);
  const [original,  setOriginal]  = useState<Package | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '', description: '', price: '', discount: '', services: [] as string[],
  });

  useEffect(() => {
    const pkg = packageStore.getById(id);
    if (!pkg) { setNotFound(true); setLoading(false); return; }
    setOriginal(pkg);
    setForm({
      name:        pkg.name,
      description: pkg.description ?? '',
      price:       String(pkg.price),
      discount:    pkg.discount ? String(pkg.discount) : '',
      services:    pkg.services ?? [],
    });
    // All services for selector (not just active — might have inactive ones already in pkg)
    setServices(serviceStore.getAll());
    setLoading(false);
  }, [id]);

  const set = (key: string, val: string) => { setForm(f => ({ ...f, [key]: val })); setFormError(''); };

  const selectedTotal = useMemo(() =>
    form.services.reduce((sum, sid) => {
      const s = services.find(sv => sv.id === sid);
      return sum + (s ? (s.priceMin + s.priceMax) / 2 : 0);
    }, 0), [form.services, services]);

  const savings = selectedTotal > 0 && form.price
    ? Math.max(0, selectedTotal - Number(form.price)) : 0;

  const handleSave = () => {
    if (!form.name.trim())                      { setFormError('Package name is required.'); return; }
    if (!form.price || Number(form.price) <= 0) { setFormError('Valid package price is required.'); return; }
    if (form.services.length === 0)             { setFormError('Please select at least one service.'); return; }

    setSaving(true);
    const updated: Package = {
      ...original!,
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       Number(form.price),
      discount:    form.discount ? Number(form.discount) : undefined,
      services:    form.services,
    };
    packageStore.save(updated);
    sessionStorage.setItem('pkg_success', `"${updated.name}" updated successfully!`);
    router.push('/vendor/packages');
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto text-center py-20 text-gray-400">Loading package…</div>
  );
  if (notFound) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="text-gray-500">Package not found. ID: <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">{id}</code></p>
      <button onClick={() => router.push('/vendor/packages')} className="mt-4 text-orange-500 text-sm underline">Back to Packages</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Package</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {original?.id} &middot; Editing: <span className="font-medium">{original?.name}</span>
          </p>
        </div>
      </div>

      {/* URL breadcrumb */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
        <Link2 size={13} className="text-orange-400" />
        <span className="text-orange-600 font-medium">Edit URL:</span>
        <code className="text-orange-700 font-mono text-xs">/vendor/packages/edit/{id}</code>
      </div>

      {formError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertTriangle size={15} /> {formError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">

        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Package Details</h2>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Package Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Pricing</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Package Price (AED) *</label>
              <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block flex items-center gap-1">
                <Percent size={11} /> Discount (%)
              </label>
              <input type="number" min="0" max="100" value={form.discount} onChange={e => set('discount', e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" />
            </div>
          </div>
          {form.services.length > 0 && form.price && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-start gap-2 text-sm">
              <Info size={14} className="text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-orange-700 font-medium">Services avg total: AED {Math.round(selectedTotal).toLocaleString()}</p>
                {savings > 0 && <p className="text-green-600 text-xs mt-0.5">Customer saves: AED {Math.round(savings).toLocaleString()}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-3">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
            <Layers size={13} /> Select Services *
            {form.services.length > 0 && (
              <span className="ml-1 bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {form.services.length} selected
              </span>
            )}
          </h2>
          <SearchableServiceSelector
            services={services}
            selected={form.services}
            onChange={ids => { setForm(f => ({ ...f, services: ids })); setFormError(''); }}
          />
        </div>
      </div>

      <div className="flex gap-3 pb-6">
        <button onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold transition-colors flex items-center justify-center gap-2">
          {saving ? 'Saving…' : <><CheckCircle2 size={16} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

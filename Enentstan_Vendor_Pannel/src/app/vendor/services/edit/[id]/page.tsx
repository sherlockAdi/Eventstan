'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { serviceStore, generateSlug, ServiceWithSlug } from '@/lib/store';
import {
  ArrowLeft, AlertTriangle, CheckCircle2,
  ImagePlus, X, Loader2, Star, Link2,
} from 'lucide-react';

const CATEGORIES = ['Venue', 'Catering', 'Decoration', 'Entertainment', 'Photography', 'Other'] as const;
const PRICE_UNITS = ['per event', 'per person', 'per hour', 'per day'] as const;

interface PreviewFile {
  preview: string;
  primary: boolean;
  isNew: boolean;
}

export default function EditServicePage() {
  const router  = useRouter();
  const { id }  = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  const [original, setOriginal] = useState<ServiceWithSlug | null>(null);
  const [form, setForm]         = useState({
    name: '', category: 'Venue' as typeof CATEGORIES[number],
    description: '', priceMin: 0, priceMax: 0, priceUnit: 'per event' as typeof PRICE_UNITS[number],
  });
  const [slug, setSlug]             = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [images, setImages]         = useState<PreviewFile[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [notFound, setNotFound]     = useState(false);

  useEffect(() => {
    const svc = serviceStore.getById(id);
    if (!svc) { setNotFound(true); setLoading(false); return; }
    setOriginal(svc);
    setForm({
      name:        svc.name,
      category:    svc.category,
      description: svc.description,
      priceMin:    svc.priceMin,
      priceMax:    svc.priceMax,
      priceUnit:   svc.priceUnit,
    });
    setSlug(svc.slug);
    setImages(svc.images.map((url, i) => ({ preview: url, primary: i === 0, isNew: false })));
    setLoading(false);
  }, [id]);

  // Auto-sync slug only if not manually edited
  useEffect(() => {
    if (!slugManual && original) setSlug(generateSlug(form.name));
  }, [form.name, slugManual, original]);

  const set = (key: keyof typeof form, val: string | number) => {
    setForm(f => ({ ...f, [key]: val }));
    setFormError('');
  };

  const onFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    const next: PreviewFile[] = picked.map((file, i) => ({
      preview: URL.createObjectURL(file),
      primary: images.length === 0 && i === 0,
      isNew: true,
    }));
    setImages(prev => [...prev, ...next]);
    e.target.value = '';
  }, [images.length]);

  const removeImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (prev[idx].primary && next.length > 0) next[0].primary = true;
      return [...next];
    });
  };

  const setPrimary = (idx: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, primary: i === idx })));
  };

  const validate = () => {
    if (!form.name.trim())        return 'Service name is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.priceMin || !form.priceMax) return 'Price range is required.';
    if (Number(form.priceMin) > Number(form.priceMax)) return 'Min price cannot exceed max price.';
    return '';
  };

  const handleSave = () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true);

    const finalSlug = generateSlug(slug) || generateSlug(form.name);
    const updated: ServiceWithSlug = {
      ...original!,
      name:        form.name.trim(),
      category:    form.category,
      description: form.description.trim(),
      priceMin:    Number(form.priceMin),
      priceMax:    Number(form.priceMax),
      priceUnit:   form.priceUnit,
      slug:        finalSlug,
      images:      images.map(i => i.preview),
    };

    serviceStore.save(updated);
    sessionStorage.setItem('svc_success', `"${updated.name}" updated successfully!`);
    router.push('/vendor/services');
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <Loader2 size={24} className="animate-spin text-orange-400 mx-auto" />
      <p className="text-gray-400 text-sm mt-3">Loading service…</p>
    </div>
  );

  if (notFound) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="text-gray-500">Service not found. ID: <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">{id}</code></p>
      <button onClick={() => router.push('/vendor/services')} className="mt-4 text-orange-500 text-sm underline">Back to Services</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {original?.id} &middot; Editing: <span className="font-medium">{original?.name}</span>
          </p>
        </div>
      </div>

      {/* URL breadcrumb */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
        <Link2 size={13} className="text-orange-400" />
        <span className="text-orange-600 font-medium">Edit URL:</span>
        <code className="text-orange-700 font-mono text-xs">/vendor/services/edit/{id}</code>
      </div>

      {formError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertTriangle size={15} /> {formError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">

        {/* Basic Info */}
        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Basic Information</h2>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Service Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>

          {/* Slug field */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Link2 size={11} /> URL Slug
              <span className="text-gray-400 font-normal ml-1">(auto-generated from name)</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-400">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-xs border-r border-gray-200 shrink-0">/services/</span>
              <input
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none font-mono text-gray-700"
              />
              {slugManual && (
                <button onClick={() => { setSlugManual(false); setSlug(generateSlug(form.name)); }}
                  className="px-3 py-2.5 text-xs text-orange-500 hover:text-orange-600 border-l border-gray-200 shrink-0">
                  Reset
                </button>
              )}
            </div>
            {slug && <p className="text-xs text-gray-400 mt-1">View page: <span className="font-mono text-orange-600">/vendor/services/view/{slug}</span></p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Pricing</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Min Price (AED) *</label>
              <input type="number" min="0" value={form.priceMin || ''}
                onChange={e => set('priceMin', e.target.value)} placeholder="1000"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Max Price (AED) *</label>
              <input type="number" min="0" value={form.priceMax || ''}
                onChange={e => set('priceMax', e.target.value)} placeholder="5000"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Unit</label>
              <select value={form.priceUnit} onChange={e => set('priceUnit', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400">
                {PRICE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          {form.priceMin && form.priceMax && Number(form.priceMin) <= Number(form.priceMax) && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-orange-700">
              Price range: <strong>AED {Number(form.priceMin).toLocaleString()} – {Number(form.priceMax).toLocaleString()}</strong> {form.priceUnit}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
              Images {images.length > 0 && <span className="text-orange-500 ml-1">({images.length})</span>}
            </h2>
            {images.length > 0 && <p className="text-xs text-gray-400">★ = primary image</p>}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className={`relative group rounded-xl overflow-hidden aspect-square ${img.isNew ? 'border-2 border-dashed border-orange-300' : 'border border-gray-100'}`}>
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  {img.primary && (
                    <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">Primary</span>
                  )}
                  {img.isNew && (
                    <span className="absolute bottom-1.5 right-1.5 bg-orange-400/80 text-white text-[10px] px-1.5 py-0.5 rounded-md">New</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.primary && (
                      <button onClick={() => setPrimary(idx)} className="p-1.5 bg-white/90 rounded-lg text-orange-500 hover:bg-white transition-colors">
                        <Star size={14} />
                      </button>
                    )}
                    <button onClick={() => removeImage(idx)} className="p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-white transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors">
                <ImagePlus size={20} />
                <span className="text-xs">Add more</span>
              </button>
            </div>
          )}

          {images.length === 0 && (
            <button onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl h-36 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors">
              <ImagePlus size={28} />
              <p className="text-sm font-medium">Click to upload images</p>
            </button>
          )}

          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <button onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold transition-colors flex items-center justify-center gap-2">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={16} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

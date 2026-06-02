'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { serviceStore, ServiceWithSlug } from '@/lib/store';
import {
  ArrowLeft, Edit2, Star, Tag, DollarSign,
  CalendarDays, ToggleLeft, ToggleRight, ImageOff, ChevronLeft, ChevronRight,
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Venue: 'bg-blue-50 text-blue-700 border-blue-200',
  Catering: 'bg-green-50 text-green-700 border-green-200',
  Decoration: 'bg-pink-50 text-pink-700 border-pink-200',
  Entertainment: 'bg-purple-50 text-purple-700 border-purple-200',
  Photography: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Other: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function ServiceDetailPage() {
  const { slug }  = useParams<{ slug: string }>();
  const router    = useRouter();
  const [service, setService]   = useState<ServiceWithSlug | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [imgIdx,   setImgIdx]   = useState(0);

  useEffect(() => {
    const svc = serviceStore.getBySlug(slug);
    if (!svc) setNotFound(true);
    else setService(svc);
  }, [slug]);

  if (notFound) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <p className="text-gray-500 text-lg font-medium">Service not found</p>
      <p className="text-sm text-gray-400 mt-1">Slug: <code className="bg-gray-100 px-2 py-0.5 rounded">{slug}</code></p>
      <button onClick={() => router.push('/vendor/services')} className="mt-4 text-orange-500 text-sm underline">Back to Services</button>
    </div>
  );

  if (!service) return (
    <div className="max-w-2xl mx-auto text-center py-20 text-gray-400">Loading…</div>
  );

  const images = service.images ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {service.id} &middot; <span className="font-mono">/services/{service.slug}</span>
            </p>
          </div>
        </div>
        <Link href={`/vendor/services/edit/${service.id}`}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Edit2 size={15} /> Edit Service
        </Link>
      </div>

      {/* Image gallery */}
      {images.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="relative h-64 bg-gray-100">
            <img src={images[imgIdx]} alt={service.name} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-colors">
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
                <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {imgIdx + 1}/{images.length}
                </span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-orange-400' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 h-48 flex items-center justify-center text-gray-300">
          <ImageOff size={40} />
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full
            ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {service.isActive ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Category</p>
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${CATEGORY_COLORS[service.category] ?? 'bg-gray-100 text-gray-600'}`}>
            <Tag size={13} /> {service.category}
          </span>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Price Range</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">
              AED {service.priceMin.toLocaleString()}
            </span>
            <span className="text-gray-400">–</span>
            <span className="text-xl font-bold text-gray-900">
              {service.priceMax.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{service.priceUnit}</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Rating</p>
            <div className="flex items-center gap-1.5">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="text-xl font-bold text-gray-900">{service.rating?.toFixed(1) ?? '—'}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bookings</p>
            <p className="text-xl font-bold text-gray-900">{service.totalBookings}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Description</p>
        <p className="text-sm text-gray-700 leading-relaxed">{service.description}</p>
      </div>

      {/* URL info */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Service URL Slug</p>
        <code className="text-sm text-orange-800 font-mono">/services/{service.slug}</code>
        <p className="text-xs text-orange-500 mt-1">Auto-generated from service name</p>
      </div>

      {/* Back link */}
      <div className="pb-4">
        <Link href="/vendor/services" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
          <ArrowLeft size={14} /> Back to All Services
        </Link>
      </div>
    </div>
  );
}

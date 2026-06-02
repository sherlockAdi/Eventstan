'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit2,
  Tag,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Package,
  Loader2,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { BASE_URL } from '@/lib/constants';

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

const CATEGORY_COLORS: Record<string, string> = {
  cat_wedding: 'bg-pink-50 text-pink-700 border-pink-200',
  cat_corporate: 'bg-blue-50 text-blue-700 border-blue-200',
  cat_birthday: 'bg-purple-50 text-purple-700 border-purple-200',
  cat_concert: 'bg-red-50 text-red-700 border-red-200',
  default: 'bg-gray-100 text-gray-600 border-gray-200',
};

const formatCategory = (categoryId: string) => {
  const label = categoryId.replace('cat_', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('vendor_token');

        const response = await fetch(`${BASE_URL}/api/v1/services/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error('Service not found');
          if (response.status === 401) throw new Error('Unauthorized. Please login again.');
          throw new Error(`Failed to fetch service: ${response.status}`);
        }

        const data = await response.json();
        setService(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500">Loading service details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
          <p className="text-gray-800 font-medium mb-2">Error Loading Service</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/vendor/services')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <p className="text-gray-800 font-medium">Service not found</p>
          <button
            onClick={() => router.push('/vendor/services')}
            className="mt-4 text-orange-500 text-sm font-medium hover:text-orange-600 underline"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              ID: {service.id} • Vendor: {service.vendorId}
            </p>
          </div>
        </div>
        <Link
          href={`/vendor/services/edit/${service.id}`}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Edit2 size={15} />
          Edit Service
        </Link>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${
              service.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {service.status === 'ACTIVE'
              ? <ToggleRight size={16} className="text-green-500" />
              : <ToggleLeft size={16} />
            }
            {service.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Category</p>
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
              CATEGORY_COLORS[service.categoryId] ?? CATEGORY_COLORS.default
            }`}
          >
            <Tag size={13} />
            {formatCategory(service.categoryId)}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Price</p>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-orange-400" />
            <span className="text-xl font-bold text-gray-900">
              {service.price?.amount?.toLocaleString() || 0} {service.price?.currency || 'AED'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Base price for service</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Location</p>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{service.city}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Description</p>
        <p className="text-sm text-gray-700 leading-relaxed">{service.description}</p>
      </div>

      {/* Sub Services */}
      {service.subServices && service.subServices.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-orange-500" />
            <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Sub-Services</p>
            <span className="text-xs text-gray-400">({service.subServices.length})</span>
          </div>
          <div className="space-y-3">
            {service.subServices.map((sub) => (
              <div key={sub.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{sub.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{sub.description}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">ID: {sub.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600 text-sm">
                      {sub.price?.amount?.toLocaleString() || 0} {sub.price?.currency || 'AED'}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                        sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {sub.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <Package size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No sub-services available</p>
        </div>
      )}

      {/* Back Link */}
      <div className="pb-4">
        <Link
          href="/vendor/services"
          className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Back to All Services
        </Link>
      </div>
    </div>
  );
}

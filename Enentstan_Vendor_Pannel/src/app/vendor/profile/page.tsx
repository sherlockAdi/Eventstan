'use client';

import { useEffect, useState } from 'react';
import { Save, MapPin, Phone, Mail, Shield, Loader2, Building2 } from 'lucide-react';
import { vendorApi } from '@/api/vendorApi';

interface VendorProfile {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  about?: string | null;
  businessLocation?: string | null;
  address?: string | null;
  specialization?: string | null;
  primaryMobile?: string | null;
  cities: string[];
  capacityPerDay: number;
  status: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    vendorApi.profile.get<VendorProfile>()
      .then(setProfile)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof VendorProfile>(key: K, value: VendorProfile[K]) => {
    setProfile((current) => current ? { ...current, [key]: value } : current);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await vendorApi.profile.update<VendorProfile>({
        companyName: profile.companyName,
        contactPerson: profile.contactPerson,
        email: profile.email,
        phone: profile.phone,
        about: profile.about ?? '',
        businessLocation: profile.businessLocation ?? '',
        address: profile.address ?? '',
        specialization: profile.specialization ?? '',
        primaryMobile: profile.primaryMobile ?? '',
        cities: profile.cities,
        capacityPerDay: profile.capacityPerDay,
      });
      setProfile(updated);
      setMessage('Profile saved successfully.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;
  }

  if (!profile) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error || 'Vendor profile not found.'}</div>;
  }

  const fields: Array<{
    label: string;
    key: keyof VendorProfile;
    icon?: typeof Mail;
    type?: string;
  }> = [
    { label: 'Business Name', key: 'companyName', icon: Building2 },
    { label: 'Contact Person', key: 'contactPerson' },
    { label: 'Email Address', key: 'email', icon: Mail, type: 'email' },
    { label: 'Phone Number', key: 'phone', icon: Phone },
    { label: 'Primary Mobile', key: 'primaryMobile', icon: Phone },
    { label: 'Specialization', key: 'specialization' },
    { label: 'Business Location', key: 'businessLocation', icon: MapPin },
    { label: 'Address', key: 'address', icon: MapPin },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the business information customers and EventStan use.</p>
      </div>

      {message && <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm flex items-center gap-2"><Shield size={16} /> {message}</div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
            {profile.companyName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile.companyName}</p>
            <p className="text-sm text-gray-500">{profile.status.replaceAll('_', ' ')}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map(({ label, key, icon: Icon, type }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
              <div className="relative">
                {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                <input
                  type={type ?? 'text'}
                  value={String(profile[key] ?? '')}
                  onChange={(event) => update(key, event.target.value as never)}
                  className={`w-full py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${Icon ? 'pl-9 pr-4' : 'px-4'}`}
                />
              </div>
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Service Cities</label>
            <input
              value={profile.cities.join(', ')}
              onChange={(event) => update('cities', event.target.value.split(',').map(city => city.trim()).filter(Boolean))}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Daily Booking Capacity</label>
            <input
              type="number"
              min={1}
              value={profile.capacityPerDay}
              onChange={(event) => update('capacityPerDay', Math.max(1, Number(event.target.value)))}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Business Description</label>
          <textarea
            value={profile.about ?? ''}
            onChange={(event) => update('about', event.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{profile.about?.length ?? 0}/500 characters</p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3.5 rounded-2xl font-semibold transition-colors"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
    </div>
  );
}

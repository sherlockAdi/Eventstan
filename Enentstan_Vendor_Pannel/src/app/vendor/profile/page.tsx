'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, Save, Shield, Upload } from 'lucide-react';
import { vendorApi } from '@/api/vendorApi';
import { getUser } from '@/lib/auth';

interface VendorProfile {
  id: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  about?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userName?: string | null;
  primaryEmail?: string | null;
  telephone?: string | null;
  primaryMobile?: string | null;
  specialization?: string | null;
  businessLocation?: string | null;
  visaType?: string | null;
  address?: string | null;
  tradeLicenseNumber?: string;
  vatNumber?: string | null;
  cities?: string[];
  capacityPerDay?: number;
  commissionPercent?: number;
  planDetails?: string | null;
  planExpiry?: string | null;
  agreementFileUrl?: string | null;
  agreementFileKey?: string | null;
  bankName?: string | null;
  accountFullName?: string | null;
  ibanNo?: string | null;
  accountNumber?: string | null;
  swift?: string | null;
  branchAddress?: string | null;
}

type ProfileForm = Omit<VendorProfile, 'id' | 'cities'> & { cities: string };

const emptyForm: ProfileForm = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  about: '',
  firstName: '',
  lastName: '',
  userName: '',
  primaryEmail: '',
  telephone: '',
  primaryMobile: '',
  specialization: '',
  businessLocation: '',
  visaType: 'UAE Work Visa',
  address: '',
  tradeLicenseNumber: '',
  vatNumber: '',
  cities: '',
  capacityPerDay: 1,
  commissionPercent: 0,
  planDetails: '',
  planExpiry: '',
  agreementFileUrl: '',
  agreementFileKey: '',
  bankName: '',
  accountFullName: '',
  ibanNo: '',
  accountNumber: '',
  swift: '',
  branchAddress: '',
};

const textFields: Array<{ key: keyof ProfileForm; label: string; type?: string; required?: boolean; placeholder?: string }> = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'userName', label: 'User Name', required: true },
  { key: 'primaryEmail', label: 'Primary Email', type: 'email', required: true },
  { key: 'telephone', label: 'Telephone' },
  { key: 'primaryMobile', label: 'Primary Mobile', required: true, placeholder: "Don't add 0 or +971" },
  { key: 'specialization', label: 'Specialization', required: true },
  { key: 'businessLocation', label: 'Where is your Business', required: true },
  { key: 'visaType', label: 'Visa Type' },
  { key: 'address', label: 'Address', required: true },
];

const bankFields: Array<{ key: keyof ProfileForm; label: string }> = [
  { key: 'bankName', label: 'Bank Name' },
  { key: 'accountFullName', label: 'Account Full Name' },
  { key: 'ibanNo', label: 'IBAN No.' },
  { key: 'accountNumber', label: 'Account Number' },
  { key: 'swift', label: 'Swift' },
  { key: 'branchAddress', label: 'Branch Address' },
];

export default function ProfilePage() {
  const [vendorId, setVendorId] = useState('');
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError('');
      const vendors = await vendorApi.vendors.list<VendorProfile[]>();
      const user = getUser();
      const selected =
        vendors.find((vendor) => vendor.email?.toLowerCase() === user?.email?.toLowerCase()) ??
        vendors.find((vendor) => vendor.primaryEmail?.toLowerCase() === user?.email?.toLowerCase()) ??
        vendors[0];

      if (!selected) {
        setError('No vendor profile found from API.');
        return;
      }

      setVendorId(selected.id);
      setForm({
        ...emptyForm,
        ...selected,
        primaryEmail: selected.primaryEmail || selected.email || '',
        primaryMobile: selected.primaryMobile || selected.phone || '',
        cities: selected.cities?.join(', ') || '',
        planExpiry: selected.planExpiry ? selected.planExpiry.slice(0, 10) : '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendor profile');
    } finally {
      setLoading(false);
    }
  }

  function updateField(key: keyof ProfileForm, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadAgreement(file: File | null) {
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      const uploaded = await vendorApi.uploads.file(file, 'agreements');
      setForm((current) => ({
        ...current,
        agreementFileUrl: uploaded.url,
        agreementFileKey: uploaded.key,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Agreement upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorId) return;

    try {
      setSaving(true);
      setMessage('');
      setError('');
      const payload = {
        ...form,
        email: form.email || form.primaryEmail,
        phone: form.phone || form.primaryMobile,
        contactPerson: form.contactPerson || `${form.firstName || ''} ${form.lastName || ''}`.trim(),
        companyName: form.companyName || form.userName || `${form.firstName || ''} ${form.lastName || ''}`.trim(),
        cities: form.cities.split(',').map((city) => city.trim()).filter(Boolean),
        capacityPerDay: Number(form.capacityPerDay || 1),
        commissionPercent: Number(form.commissionPercent || 0),
        planExpiry: form.planExpiry || undefined,
      };

      await vendorApi.vendors.update(vendorId, payload);
      setMessage('Profile saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading vendor profile...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Professional Registration</h1>
        <p className="mt-1 text-sm text-gray-500">Manage the vendor registration, plan, and bank details from API data.</p>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <Shield size={16} /> {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Tell Us about yourself</h2>
        <textarea
          value={form.about || ''}
          onChange={(event) => updateField('about', event.target.value)}
          rows={4}
          className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {textFields.map((field) => (
            <label key={field.key} className={field.key === 'address' ? 'md:col-span-3' : ''}>
              <span className="mb-1 block text-xs font-medium text-gray-600">
                {field.label}{field.required ? '*' : ''}
              </span>
              <input
                type={field.type || 'text'}
                value={(form[field.key] as string | number | null) || ''}
                onChange={(event) => updateField(field.key, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Professional Plan</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label>
            <span className="mb-1 block text-xs font-medium text-gray-600">Details of Plan</span>
            <input value={form.planDetails || ''} onChange={(event) => updateField('planDetails', event.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-gray-600">Plan Expiry</span>
            <input type="date" value={form.planExpiry || ''} onChange={(event) => updateField('planExpiry', event.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-gray-600">Agreement File Upload</span>
            <div className="flex items-center gap-2">
              <input type="file" onChange={(event) => uploadAgreement(event.target.files?.[0] ?? null)} className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200" />
              {uploading ? <Loader2 className="h-4 w-4 animate-spin text-orange-500" /> : <Upload className="h-4 w-4 text-gray-400" />}
            </div>
            {form.agreementFileUrl && (
              <a href={form.agreementFileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                <FileText size={13} /> View agreement
              </a>
            )}
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Payment Bank Details</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {bankFields.map((field) => (
            <label key={field.key}>
              <span className="mb-1 block text-xs font-medium text-gray-600">{field.label}</span>
              <input
                value={(form[field.key] as string | number | null) || ''}
                onChange={(event) => updateField(field.key, event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Existing Platform Fields</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['companyName', 'Company Name'],
            ['contactPerson', 'Contact Person'],
            ['email', 'Login Email'],
            ['phone', 'Phone'],
            ['tradeLicenseNumber', 'Trade License Number'],
            ['vatNumber', 'VAT Number'],
            ['cities', 'Cities'],
            ['capacityPerDay', 'Capacity Per Day'],
            ['commissionPercent', 'Commission Percent'],
          ].map(([key, label]) => (
            <label key={key}>
              <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
              <input
                type={key === 'capacityPerDay' || key === 'commissionPercent' ? 'number' : 'text'}
                value={(form[key as keyof ProfileForm] as string | number | null) || ''}
                onChange={(event) => updateField(key as keyof ProfileForm, key === 'capacityPerDay' || key === 'commissionPercent' ? Number(event.target.value) : event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={saving || uploading || !vendorId}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
        Save
      </button>
    </form>
  );
}

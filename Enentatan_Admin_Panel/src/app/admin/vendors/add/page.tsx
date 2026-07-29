'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, ChevronUp, ChevronDown, Check, MapPin, Image as ImageIcon, X } from 'lucide-react';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/adminApi';

interface CountryOption {
  name: string;
  cca2: string;
  flag: string;
  dialCode: string; // e.g. "+971"
}

/* -------------------------------------------------------------------------- */
/*  Reusable Searchable Select (matches the "Business Location" style)        */
/*  - Click to open, search box on top, checkmark on selected item,           */
/*    scroll arrows at top/bottom when list overflows.                       */
/* -------------------------------------------------------------------------- */

interface SearchableSelectProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  loading?: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
}

function SearchableSelect({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  loading = false,
  loadingLabel = 'Loading...',
  icon,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track scroll position to show/hide up/down arrows
  const updateScrollState = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  };

  useEffect(() => {
    if (open) {
      // Defer to allow layout to settle
      const t = setTimeout(updateScrollState, 0);
      return () => clearTimeout(t);
    }
  }, [open, filtered.length]);

  const scrollBy = (amount: number) => {
    listRef.current?.scrollBy({ top: amount, behavior: 'smooth' });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>

      <button
        type="button"
        onClick={() => !loading && setOpen((o) => !o)}
        disabled={loading}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg bg-white transition-colors focus:outline-none focus:ring-1 disabled:bg-gray-100 disabled:text-gray-400 ${
          open ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-300 hover:border-orange-400 focus:ring-orange-500'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {loading ? loadingLabel : value || placeholder}
          </span>
        </span>
        {open ? (
          <ChevronUp size={16} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        )}
      </button>

      {open && !loading && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 text-sm border border-orange-300 rounded-md focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="relative">
            {/* Scroll up arrow */}
            {canScrollUp && (
              <button
                type="button"
                onClick={() => scrollBy(-80)}
                className="absolute top-0 right-0 z-10 w-full flex justify-center py-1 bg-gradient-to-b from-white to-transparent"
              >
                <ChevronUp size={16} className="text-gray-400" />
              </button>
            )}

            <div
              ref={listRef}
              onScroll={updateScrollState}
              className="max-h-56 overflow-y-auto py-1"
            >
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-400">No matches found</div>
              )}
              {filtered.map((opt) => {
                const selected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                      selected ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {selected && <Check size={16} className="text-orange-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Scroll down arrow */}
            {canScrollDown && (
              <button
                type="button"
                onClick={() => scrollBy(80)}
                className="absolute bottom-0 right-0 z-10 w-full flex justify-center py-1 bg-gradient-to-t from-white to-transparent"
              >
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden input keeps native form required-validation working */}
      {required && <input type="text" value={value} required readOnly tabIndex={-1} className="sr-only" />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Country code select (flag + dial code) — search style unchanged           */
/* -------------------------------------------------------------------------- */

function CountryCodeSelect({
  countries,
  loading,
  value,
  onChange,
}: {
  countries: CountryOption[];
  loading: boolean;
  value: string;
  onChange: (dialCode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = countries.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dialCode.includes(search)
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-orange-400 transition-colors min-w-[110px] focus:outline-none focus:ring-1 focus:ring-orange-500"
        disabled={loading}
      >
        {loading ? (
          <span className="text-sm text-gray-400">Loading...</span>
        ) : (
          <>
            <span className="text-lg leading-none">
              {countries.find((c) => c.dialCode === value)?.flag || '🏳️'}
            </span>
            <span className="text-sm text-gray-700">{value || '+971'}</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code..."
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.cca2}
                type="button"
                onClick={() => {
                  onChange(c.dialCode);
                  setOpen(false);
                  setSearch('');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-orange-50 transition-colors"
              >
                <span className="text-lg leading-none">{c.flag}</span>
                <span className="flex-1 text-gray-700 truncate">{c.name}</span>
                <span className="text-gray-500">{c.dialCode}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Business location options (fallback list; replace with API data if any)  */
/* -------------------------------------------------------------------------- */

const BUSINESS_LOCATIONS = [
  'Downtown Dubai',
  'Dubai Marina',
  'Jumeirah',
  'Deira',
  'Bur Dubai',
  'Business Bay',
  'Al Barsha',
  'Palm Jumeirah',
  'JLT (Jumeirah Lake Towers)',
  'Dubai Silicon Oasis',
];

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function AddVendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [visaTypes, setVisaTypes] = useState<{ id: string; name: string }[]>([]);
  const [visaTypesLoading, setVisaTypesLoading] = useState(true);

  // Profile image preview + upload state (image uploads immediately, like the blog cover image)
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    primaryEmail: '',
    telephone: '',
    primaryMobile: '',
    countryCode: '',
    telephoneCountryCode: '',
    vendorType: 'freelancer', // freelancer or permanent
    password: '',
    about: '',
    specialization: '',
    whereIsYourBusiness: '',
    visaType: '',
    address: '',
    vatNumber: '',
    inviteCode: '',
    // Trade license / documents (Permanent specific for license, common for docs)
    tradeLicenseNumber: '',
    tradeLicenseExpiry: '',
    tradeLicenseFile: null as File | null,
    passportExpiry: '',
    passportFile: null as File | null,
    emiratesIdExpiry: '',
    vendorProfileImage: '' as string, // now stores the uploaded image URL, not a File
    // Freelancer specific fields
    hourlyRate: '',
    availableHoursPerWeek: '',
    contractType: '', // hourly, monthly, project
    // Permanent specific fields
    salaryType: '', // monthly, yearly
    basicSalary: '',
    housingAllowance: '',
    transportationAllowance: '',
    otherAllowances: '',
    annualLeaves: '',
    workingHours: '',
    joiningDate: '',
    // Common professional fields
    capacityPerDay: '',
    commissionPercent: '',
    planDetail: '',
    planExpiry: '',
    agreementFile: null as File | null,
    // Bank details
    bankName: '',
    accountFullName: '',
    ibanNo: '',
    accountNumber: '',
    swift: '',
    branchAddress: '',
  });

  // Fetch countries + their dial codes from our own backend (master-data/countries).
  useEffect(() => {
    (async () => {
      try {
        setCountriesLoading(true);
        const data = await adminApi.countries.list();
        const parsed: CountryOption[] = (data || [])
          .map((c: any) => {
            const rawDial = c.dialCode ?? c.phoneCode ?? c.callingCode ?? c.code2 ?? c.isdCode ?? '';
            const dialCode = rawDial ? (String(rawDial).startsWith('+') ? String(rawDial) : `+${rawDial}`) : '';
            return {
              name: c.name ?? c.countryName ?? '',
              cca2: c.iso2 ?? c.code ?? c.countryCode ?? String(c.id ?? ''),
              flag: c.flag ?? c.emoji ?? '',
              dialCode,
            };
          })
          .filter((c: CountryOption) => c.dialCode)
          .sort((a: CountryOption, b: CountryOption) => a.name.localeCompare(b.name));
        setCountries(parsed);

        // Default to UAE if not already set
        setForm((prev) => {
          if (prev.countryCode) return prev;
          const uae = parsed.find((c) => c.cca2 === 'AE' || c.name.toLowerCase().includes('united arab emirates'));
          return uae ? { ...prev, countryCode: uae.dialCode, telephoneCountryCode: uae.dialCode } : prev;
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load countries:', error);
        toast.error(error instanceof Error ? error.message : 'Could not load country codes.');
      } finally {
        setCountriesLoading(false);
      }
    })();
  }, []);

  // Fetch categories for the Specialization dropdown.
  useEffect(() => {
    (async () => {
      try {
        setCategoriesLoading(true);
        const data = await adminApi.categories.list();
        const parsed = (data || []).map((c: any) => ({
          id: String(c.id ?? c._id ?? c.categoryId ?? c.name),
          name: c.name ?? c.categoryName ?? c.title ?? '',
        }));
        setCategories(parsed);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load categories.');
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);

  // Fetch visa types for the Visa Type dropdown.
  useEffect(() => {
    (async () => {
      try {
        setVisaTypesLoading(true);
        const data = await adminApi.visaTypes.list();
        const parsed = (data || []).map((v: any) => ({
          id: String(v.id ?? v._id ?? v.name),
          name: v.name ?? v.visaTypeName ?? v.title ?? '',
        }));
        setVisaTypes(parsed);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load visa types.');
      } finally {
        setVisaTypesLoading(false);
      }
    })();
  }, []);

  // Auto-generate User Name from First Name + Last Name (hyphen-separated). Always kept in sync (read-only field).
  useEffect(() => {
    const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const first = clean(form.firstName);
    const last = clean(form.lastName);
    const generated = [first, last].filter(Boolean).join('-');
    setForm((prev) => ({ ...prev, userName: generated }));
  }, [form.firstName, form.lastName]);

  // Upload the vendor profile image immediately on selection (same pattern as the blog cover image upload).
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview while the real upload happens.
    const localPreview = URL.createObjectURL(file);
    setProfileImagePreview(localPreview);

    setUploadingProfileImage(true);
    try {
      const result = await adminApi.uploads.image(file, 'vendors');
      setForm((prev) => ({ ...prev, vendorProfileImage: result.url }));
      setProfileImagePreview(result.url);
    } catch (error: any) {
      toast.error(error?.message || 'Profile image upload failed');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const removeProfileImage = () => {
    setProfileImagePreview('');
    setForm((prev) => ({ ...prev, vendorProfileImage: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadingProfileImage) {
      toast.error('Please wait for the profile image to finish uploading');
      return;
    }

    setLoading(true);
    try {
      const contactPerson = `${form.firstName} ${form.lastName}`.trim();
      const vendorType = form.vendorType === 'permanent' ? 'PERMANENT' : 'FREELANCER';

      // Combine dial code with the local number so both fields are sent
      // as full E.164-style numbers, e.g. "+971566405353".
      const fullMobile = form.primaryMobile ? `${form.countryCode}${form.primaryMobile}` : '';
      const fullTelephone = form.telephone ? `${form.telephoneCountryCode}${form.telephone}` : '';

      const payload: Record<string, unknown> = {
        companyName: form.userName || `${contactPerson} Events`,
        contactPerson,
        email: form.primaryEmail,
        primaryEmail: form.primaryEmail,
        phone: fullMobile || fullTelephone,
        primaryMobile: fullMobile,
        telephone: fullTelephone,
        countryCode: form.countryCode || undefined,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        userName: form.userName,
        about: form.about || undefined,
        vendorType,
        specialization: form.specialization,
        businessLocation: form.whereIsYourBusiness,
        address: form.address,
        visaType: form.visaType,
        vatNumber: form.vatNumber || undefined,
        inviteCode: form.inviteCode || undefined,
        cities: [form.whereIsYourBusiness],
        capacityPerDay: form.capacityPerDay ? Number(form.capacityPerDay) : 1,
        commissionPercent: form.commissionPercent ? Number(form.commissionPercent) : 10,
        planDetails: form.planDetail,
        planExpiry: form.planExpiry || undefined,
        tradeLicenseExpiry: form.tradeLicenseExpiry || undefined,
        passportExpiry: form.passportExpiry || undefined,
        emiratesIdExpiry: form.emiratesIdExpiry || undefined,
        bankName: form.bankName,
        accountFullName: form.accountFullName,
        ibanNo: form.ibanNo,
        accountNumber: form.accountNumber,
        swift: form.swift,
        branchAddress: form.branchAddress,
      };

      // Trade license number only applies to PERMANENT vendors.
      // FREELANCER vendors must not send a tradeLicenseNumber.
      if (vendorType === 'PERMANENT') {
        payload.tradeLicenseNumber = form.tradeLicenseNumber;
      }

      // vendorProfileImage is already an uploaded URL (uploaded on selection), just send it along.
      if (form.vendorProfileImage) payload.vendorProfileImage = form.vendorProfileImage;

      // Remaining files are still uploaded as multipart at submit time - adminApi.vendors.create
      // is assumed to handle File values internally (converting to FormData) alongside the JSON fields above.
      if (form.tradeLicenseFile) payload.tradeLicenseFile = form.tradeLicenseFile;
      if (form.passportFile) payload.passportFile = form.passportFile;
      if (form.agreementFile) payload.agreementFile = form.agreementFile;

      const response = await adminApi.vendors.create(payload);
      toast.success(response.welcomeEmailSent ? 'Vendor created and welcome email sent!' : 'Vendor created, but welcome email could not be sent.');
      router.push('/admin/vendors');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = () => {
    setIsActive(!isActive);
    toast.success(`Vendor will be ${!isActive ? 'Active' : 'Inactive'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add Vendor</h1>
          </div>

          {/* Status Toggle - Active/Inactive */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <button
              type="button"
              onClick={handleStatusToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isActive ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Tell Us about yourself */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Tell Us about yourself
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Image - uploads immediately, shows preview, same pattern as blog cover image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor Profile Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 transition-colors bg-gray-50 overflow-hidden">
                      {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon size={24} className="text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">Upload</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
                    </label>
                    {uploadingProfileImage && (
                      <span className="text-xs text-gray-400">Uploading...</span>
                    )}
                    {profileImagePreview && !uploadingProfileImage && (
                      <button
                        type="button"
                        onClick={removeProfileImage}
                        className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Upload a profile image (JPG, PNG, WEBP)</p>
                </div>

                <Input label="First Name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                <Input label="Last Name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                <Input label="User Name * (auto-generated)" value={form.userName} readOnly disabled required />
                <Input label="Primary Email *" type="email" value={form.primaryEmail} onChange={(e) => setForm({ ...form, primaryEmail: e.target.value })} required />

                {/* Telephone */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
                  <div className="flex gap-2">
                    <CountryCodeSelect
                      countries={countries}
                      loading={countriesLoading}
                      value={form.telephoneCountryCode}
                      onChange={(dialCode) => setForm({ ...form, telephoneCountryCode: dialCode })}
                    />
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => setForm({ ...form, telephone: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="e.g., 43001234"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Primary Mobile */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Mobile (Don't add 0) *
                  </label>
                  <div className="flex gap-2">
                    <CountryCodeSelect
                      countries={countries}
                      loading={countriesLoading}
                      value={form.countryCode}
                      onChange={(dialCode) => setForm({ ...form, countryCode: dialCode })}
                    />
                    <input
                      type="tel"
                      value={form.primaryMobile}
                      onChange={(e) => setForm({ ...form, primaryMobile: e.target.value.replace(/[^0-9]/g, '') })}
                      required
                      placeholder="e.g., 501234567"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Vendor Type - with Orange Radio Buttons */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Type *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="vendorType"
                          value="freelancer"
                          checked={form.vendorType === 'freelancer'}
                          onChange={(e) => setForm({ ...form, vendorType: e.target.value })}
                          className="peer sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-all ${
                            form.vendorType === 'freelancer'
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-400 bg-white group-hover:border-orange-300'
                          }`}
                        >
                          {form.vendorType === 'freelancer' && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-700">Freelancer</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="vendorType"
                          value="permanent"
                          checked={form.vendorType === 'permanent'}
                          onChange={(e) => setForm({ ...form, vendorType: e.target.value })}
                          className="peer sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-all ${
                            form.vendorType === 'permanent'
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-400 bg-white group-hover:border-orange-300'
                          }`}
                        >
                          {form.vendorType === 'permanent' && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-700">Permanent</span>
                    </label>
                  </div>
                </div>

                {/* Password with hide/show */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-10 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 9 characters, at least one uppercase letter, one lowercase letter, one number and one special character.
                  </p>
                </div>

                <Input label="Invite Code" value={form.inviteCode} onChange={(e) => setForm({ ...form, inviteCode: e.target.value })} />

                {/* Specialization — searchable dropdown */}
                <SearchableSelect
                  label="Specialization"
                  required
                  value={form.specialization}
                  onChange={(val) => setForm({ ...form, specialization: val })}
                  options={categories.map((c) => c.name)}
                  loading={categoriesLoading}
                  loadingLabel="Loading categories..."
                  placeholder="Select a category"
                />

                {/* Where is your Business — searchable dropdown, styled like Image 2 */}
                <SearchableSelect
                  label="Where is your Business"
                  required
                  value={form.whereIsYourBusiness}
                  onChange={(val) => setForm({ ...form, whereIsYourBusiness: val })}
                  options={BUSINESS_LOCATIONS}
                  placeholder="Select business location"
                  icon={<MapPin size={16} />}
                />

                {/* Visa Type — searchable dropdown */}
                <SearchableSelect
                  label="Visa Type"
                  value={form.visaType}
                  onChange={(val) => setForm({ ...form, visaType: val })}
                  options={visaTypes.map((v) => v.name)}
                  loading={visaTypesLoading}
                  loadingLabel="Loading visa types..."
                  placeholder="Select a visa type"
                />

                <Input label="VAT Number" value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} />

                {/* Address Textarea */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    required
                  />
                </div>

                {/* About Textarea */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                  <textarea
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="Short bio / description"
                  />
                </div>
              </div>
            </div>

            {/* Identity & Documents - Common for both */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Identity &amp; Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Emirates ID Expiry" type="date" value={form.emiratesIdExpiry} onChange={(e) => setForm({ ...form, emiratesIdExpiry: e.target.value })} />
                <div />

                <Input label="Passport Expiry" type="date" value={form.passportExpiry} onChange={(e) => setForm({ ...form, passportExpiry: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passport File Upload</label>
                  <input
                    type="file"
                    onChange={(e) => setForm({ ...form, passportFile: e.target.files?.[0] || null })}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-colors"
                  />
                </div>

                <Input label="Trade License Expiry" type="date" value={form.tradeLicenseExpiry} onChange={(e) => setForm({ ...form, tradeLicenseExpiry: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trade License File Upload</label>
                  <input
                    type="file"
                    onChange={(e) => setForm({ ...form, tradeLicenseFile: e.target.files?.[0] || null })}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Conditional Fields Based on Vendor Type */}
            {form.vendorType === 'freelancer' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Freelancer Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type *</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contractType"
                          value="hourly"
                          checked={form.contractType === 'hourly'}
                          onChange={(e) => setForm({ ...form, contractType: e.target.value })}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">Hourly</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contractType"
                          value="monthly"
                          checked={form.contractType === 'monthly'}
                          onChange={(e) => setForm({ ...form, contractType: e.target.value })}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">Monthly</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contractType"
                          value="project"
                          checked={form.contractType === 'project'}
                          onChange={(e) => setForm({ ...form, contractType: e.target.value })}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">Per Project</span>
                      </label>
                    </div>
                  </div>

                  <Input
                    label={`Hourly Rate (AED) ${form.contractType === 'hourly' ? '*' : ''}`}
                    type="number"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                    required={form.contractType === 'hourly'}
                  />

                  <Input
                    label="Available Hours per Week *"
                    type="number"
                    value={form.availableHoursPerWeek}
                    onChange={(e) => setForm({ ...form, availableHoursPerWeek: e.target.value })}
                    required
                    placeholder="e.g., 40"
                  />

                  {form.contractType === 'monthly' && (
                    <Input
                      label="Monthly Rate (AED) *"
                      type="number"
                      value={form.hourlyRate}
                      onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                      required
                    />
                  )}

                  {form.contractType === 'project' && (
                    <Input
                      label="Project Rate (AED) *"
                      type="number"
                      value={form.hourlyRate}
                      onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                      required
                    />
                  )}
                </div>
              </div>
            )}

            {form.vendorType === 'permanent' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Permanent Employee Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary Type *</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="salaryType"
                          value="monthly"
                          checked={form.salaryType === 'monthly'}
                          onChange={(e) => setForm({ ...form, salaryType: e.target.value })}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">Monthly</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="salaryType"
                          value="yearly"
                          checked={form.salaryType === 'yearly'}
                          onChange={(e) => setForm({ ...form, salaryType: e.target.value })}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">Yearly</span>
                      </label>
                    </div>
                  </div>

                  <Input label="Basic Salary (AED) *" type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} required />
                  <Input label="Housing Allowance (AED)" type="number" value={form.housingAllowance} onChange={(e) => setForm({ ...form, housingAllowance: e.target.value })} />
                  <Input label="Transportation Allowance (AED)" type="number" value={form.transportationAllowance} onChange={(e) => setForm({ ...form, transportationAllowance: e.target.value })} />
                  <Input label="Other Allowances (AED)" type="number" value={form.otherAllowances} onChange={(e) => setForm({ ...form, otherAllowances: e.target.value })} />
                  <Input label="Annual Leaves (days) *" type="number" value={form.annualLeaves} onChange={(e) => setForm({ ...form, annualLeaves: e.target.value })} required placeholder="e.g., 30" />
                  <Input label="Working Hours per Week *" type="number" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} required placeholder="e.g., 48" />
                  <Input label="Joining Date *" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} required />
                  <Input label="Trade License Number *" value={form.tradeLicenseNumber} onChange={(e) => setForm({ ...form, tradeLicenseNumber: e.target.value })} required placeholder="e.g., LIC123456789" />
                </div>
              </div>
            )}

            {/* Professional Plan - Common for both */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Professional Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Capacity Per Day (events)" type="number" value={form.capacityPerDay} onChange={(e) => setForm({ ...form, capacityPerDay: e.target.value })} placeholder="e.g., 3" />
                <Input label="Commission Percent (%)" type="number" value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} placeholder="e.g., 10" />
                <Input label="Detail of Plan" value={form.planDetail} onChange={(e) => setForm({ ...form, planDetail: e.target.value })} />
                <Input label="Plan Expiry" type="date" value={form.planExpiry} onChange={(e) => setForm({ ...form, planExpiry: e.target.value })} />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agreement File Upload</label>
                  <input
                    type="file"
                    onChange={(e) => setForm({ ...form, agreementFile: e.target.files?.[0] || null })}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Bank Details - Common for both */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Payment Bank Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Bank Name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
                <Input label="Account Full Name" value={form.accountFullName} onChange={(e) => setForm({ ...form, accountFullName: e.target.value })} />
                <Input label="IBAN No." value={form.ibanNo} onChange={(e) => setForm({ ...form, ibanNo: e.target.value })} />
                <Input label="Account Number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
                <Input label="Swift" value={form.swift} onChange={(e) => setForm({ ...form, swift: e.target.value })} />

                {/* Branch Address Textarea */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Address</label>
                  <textarea
                    value={form.branchAddress}
                    onChange={(e) => setForm({ ...form, branchAddress: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploadingProfileImage}>
                {loading ? 'Creating...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
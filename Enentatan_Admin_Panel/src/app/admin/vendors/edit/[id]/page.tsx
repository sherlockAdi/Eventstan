'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, ChevronUp, ChevronDown, Check, MapPin, Image as ImageIcon, X } from 'lucide-react';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/adminApi';

interface CountryOption {
  name: string;
  cca2: string;
  flag: string;
  dialCode: string;
}

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
  error?: string;
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
  error,
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

  const updateScrollState = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  };

  useEffect(() => {
    if (open) {
      const t = setTimeout(updateScrollState, 0);
      return () => clearTimeout(t);
    }
  }, [open, filtered.length]);

  const scrollBy = (amount: number) => {
    listRef.current?.scrollBy({ top: amount, behavior: 'smooth' });
  };

  const showError = (required && !value) || !!error;

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
          open
            ? 'border-orange-500 ring-1 ring-orange-500'
            : showError
              ? 'border-red-300'
              : 'border-gray-300 hover:border-orange-400 focus:ring-orange-500'
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

      {error ? <p className="text-xs text-red-500 mt-1">{error}</p> : null}

      {required && <input type="text" value={value} required readOnly tabIndex={-1} className="sr-only" />}
    </div>
  );
}

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

const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditVendorPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [userNameEdited, setUserNameEdited] = useState(false);
  const [namesLoaded, setNamesLoaded] = useState(false);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [visaTypes, setVisaTypes] = useState<{ id: string; name: string }[]>([]);
  const [visaTypesLoading, setVisaTypesLoading] = useState(true);

  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  // Tracks required-field errors; password is optional here (blank = keep existing).
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    primaryEmail: '',
    telephone: '',
    primaryMobile: '',
    countryCode: '',
    telephoneCountryCode: '',
    vendorType: 'freelancer',
    password: '',
    about: '',
    specialization: '',
    whereIsYourBusiness: '',
    visaType: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    poBox: '',
    vatNumber: '',
    vendorProfileImage: '' as string,
    hourlyRate: '',
    availableHoursPerWeek: '',
    contractType: '',
    salaryType: 'monthly',
    basicSalary: '',
    housingAllowance: '',
    transportationAllowance: '',
    otherAllowances: '',
    annualLeaves: '',
    workingHours: '',
    joiningDate: '',
    tradeLicenseNumber: '',
    capacityPerDay: '',
    commissionPercent: '',
    planDetail: '',
    planExpiry: '',
    agreementFile: null as File | null,
    bankName: '',
    accountFullName: '',
    ibanNo: '',
    accountNumber: '',
    swift: '',
    branchAddress: '',
  });

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
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load country codes.');
      } finally {
        setCountriesLoading(false);
      }
    })();
  }, []);

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

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    (async () => {
      try {
        setFetching(true);
        const vendor = await adminApi.vendors.getById(id);

        const [fallbackFirst, ...fallbackLastParts] = (vendor.contactPerson || '').split(' ');
        const fallbackLast = fallbackLastParts.join(' ');

        setForm((prev) => ({
          ...prev,
          firstName: vendor.firstName ?? fallbackFirst ?? '',
          lastName: vendor.lastName ?? fallbackLast ?? '',
          userName: vendor.userName ?? '',
          primaryEmail: vendor.primaryEmail ?? vendor.email ?? '',
          telephone: vendor.telephone ?? '',
          primaryMobile: vendor.primaryMobile ?? vendor.phone ?? '',
          countryCode: vendor.primaryMobileCountryCode ?? vendor.countryCode ?? '',
          telephoneCountryCode: vendor.phoneCountryCode ?? vendor.countryCode ?? '',
          vendorType: (vendor.vendorType ?? 'FREELANCER').toString().toLowerCase() === 'permanent' ? 'permanent' : 'freelancer',
          about: vendor.about ?? '',
          specialization: vendor.specialization ?? '',
          whereIsYourBusiness: vendor.businessLocation ?? (vendor.cities?.[0] ?? ''),
          visaType: vendor.visaType ?? '',
          addressLine1: vendor.addressLine1 ?? vendor.address ?? '',
          addressLine2: vendor.addressLine2 ?? '',
          landmark: vendor.landmark ?? '',
          poBox: vendor.poBox ?? '',
          vatNumber: vendor.vatNumber ?? '',
          vendorProfileImage: vendor.vendorProfileImage ?? '',
          hourlyRate: vendor.hourlyRate?.toString() ?? '',
          availableHoursPerWeek: vendor.availableHoursPerWeek?.toString() ?? '',
          contractType: vendor.contractType ?? '',
          salaryType: vendor.salaryType ?? 'monthly',
          basicSalary: vendor.basicSalary?.toString() ?? '',
          housingAllowance: vendor.housingAllowance?.toString() ?? '',
          transportationAllowance: vendor.transportationAllowance?.toString() ?? '',
          otherAllowances: vendor.otherAllowances?.toString() ?? '',
          annualLeaves: vendor.annualLeaves?.toString() ?? '',
          workingHours: vendor.workingHours?.toString() ?? '',
          joiningDate: vendor.joiningDate ? vendor.joiningDate.slice(0, 10) : '',
          tradeLicenseNumber: vendor.tradeLicenseNumber ?? '',
          capacityPerDay: vendor.capacityPerDay?.toString() ?? '',
          commissionPercent: vendor.commissionPercent?.toString() ?? '',
          planDetail: vendor.planDetails ?? vendor.planDetail ?? '',
          planExpiry: vendor.planExpiry ? vendor.planExpiry.slice(0, 10) : '',
          bankName: vendor.bankName ?? '',
          accountFullName: vendor.accountFullName ?? '',
          ibanNo: vendor.ibanNo ?? '',
          accountNumber: vendor.accountNumber ?? '',
          swift: vendor.swift ?? '',
          branchAddress: vendor.branchAddress ?? '',
        }));

        if (vendor.vendorProfileImage) {
          setProfileImagePreview(vendor.vendorProfileImage);
        }

        setIsActive(vendor.status ? vendor.status !== 'REJECTED' : true);
        setUserNameEdited(true);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load vendor');
      } finally {
        setFetching(false);
      }
    })();
  }, [params.id]);

  useEffect(() => {
    if (!namesLoaded) {
      setNamesLoaded(true);
      return;
    }
    if (userNameEdited) return;
    const generated = `${form.firstName}${form.lastName}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    setForm((prev) => ({ ...prev, userName: generated }));
  }, [form.firstName, form.lastName]);

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.firstName.trim()) errors.firstName = 'First Name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last Name is required';
    if (!form.userName.trim()) errors.userName = 'User Name is required';

    if (!form.primaryEmail.trim()) {
      errors.primaryEmail = 'Email is required';
    } else if (!EMAIL_REGEX.test(form.primaryEmail)) {
      errors.primaryEmail = 'Enter a valid email address';
    }

    if (!form.primaryMobile.trim()) {
      errors.primaryMobile = 'Phone Number is required';
    } else if (
      form.primaryMobile.length < PHONE_MIN_DIGITS ||
      form.primaryMobile.length > PHONE_MAX_DIGITS
    ) {
      errors.primaryMobile = `Number must be ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits`;
    }

    if (
      form.telephone &&
      (form.telephone.length < PHONE_MIN_DIGITS || form.telephone.length > PHONE_MAX_DIGITS)
    ) {
      errors.telephone = `Number must be ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits`;
    }

    // Password is optional on edit — only validate strength if the admin typed a new one.
    if (form.password) {
      if (
        form.password.length < 9 ||
        !/[A-Z]/.test(form.password) ||
        !/[a-z]/.test(form.password) ||
        !/[0-9]/.test(form.password) ||
        !/[^A-Za-z0-9]/.test(form.password)
      ) {
        errors.password =
          'Min 9 characters with an uppercase, lowercase, number, and special character';
      }
    }

    if (!form.specialization) errors.specialization = 'Specialization is required';
    if (!form.whereIsYourBusiness) errors.whereIsYourBusiness = 'Business location is required';
    if (!form.addressLine1.trim()) errors.addressLine1 = 'Address Line 1 is required';

    if (form.vendorType === 'freelancer') {
      if (!form.contractType) errors.contractType = 'Contract Type is required';
      if (form.contractType === 'hourly' && !form.hourlyRate) {
        errors.hourlyRate = 'Hourly Rate is required';
      }
      if (form.contractType === 'monthly' && !form.hourlyRate) {
        errors.hourlyRate = 'Monthly Rate is required';
      }
      if (form.contractType === 'project' && !form.hourlyRate) {
        errors.hourlyRate = 'Project Rate is required';
      }
      if (!form.availableHoursPerWeek) {
        errors.availableHoursPerWeek = 'Available Hours per Week is required';
      }
    }

    if (form.vendorType === 'permanent') {
      if (!form.salaryType) errors.salaryType = 'Salary Type is required';
      if (!form.basicSalary) errors.basicSalary = 'Basic Salary is required';
      if (!form.annualLeaves) errors.annualLeaves = 'Annual Leaves is required';
      if (!form.workingHours) errors.workingHours = 'Working Hours is required';
      if (!form.joiningDate) errors.joiningDate = 'Joining Date is required';
      if (!form.tradeLicenseNumber.trim()) {
        errors.tradeLicenseNumber = 'Trade License Number is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadingProfileImage) {
      toast.error('Please wait for the profile image to finish uploading');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      const vendorType = form.vendorType === 'permanent' ? 'PERMANENT' : 'FREELANCER';
      const id = params.id as string;

      const agreementUpload = form.agreementFile
        ? await adminApi.uploads.file(form.agreementFile, 'vendor-docs/agreements')
        : null;

      const fullTelephone = form.telephone ? `${form.telephoneCountryCode}${form.telephone}` : '';
      const combinedAddress = [form.addressLine1, form.addressLine2].filter(Boolean).join(', ');

      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        userName: form.userName,
        email: form.primaryEmail,
        primaryEmail: form.primaryEmail,
        telephone: fullTelephone || form.telephone,
        primaryMobile: form.primaryMobile,
        primaryMobileCountryCode: form.countryCode || undefined,
        // phone stays as just the local number — the code already travels
        // separately via phoneCountryCode, so no double-prefixing here.
        phone: form.primaryMobile || '',
        phoneCountryCode: form.countryCode || '',
        about: form.about || undefined,
        vendorType,
        contractType: form.contractType || undefined,
        hourlyRate: form.hourlyRate !== '' ? Number(form.hourlyRate) : undefined,
        availableHoursPerWeek: form.availableHoursPerWeek !== '' ? Number(form.availableHoursPerWeek) : undefined,
        projectRate: form.contractType === 'project' && form.hourlyRate !== '' ? Number(form.hourlyRate) : undefined,
        salaryType: form.salaryType || undefined,
        basicSalary: form.basicSalary !== '' ? Number(form.basicSalary) : undefined,
        housingAllowance: form.housingAllowance !== '' ? Number(form.housingAllowance) : undefined,
        transportationAllowance: form.transportationAllowance !== '' ? Number(form.transportationAllowance) : undefined,
        otherAllowances: form.otherAllowances !== '' ? Number(form.otherAllowances) : undefined,
        annualLeaves: form.annualLeaves !== '' ? Number(form.annualLeaves) : undefined,
        workingHours: form.workingHours !== '' ? Number(form.workingHours) : undefined,
        joiningDate: form.joiningDate || undefined,
        specialization: form.specialization,
        businessLocation: form.whereIsYourBusiness,
        cities: [form.whereIsYourBusiness],
        address: combinedAddress,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        landmark: form.landmark || undefined,
        poBox: form.poBox || undefined,
        visaType: form.visaType,
        vatNumber: form.vatNumber || undefined,
        capacityPerDay: form.capacityPerDay !== '' ? Number(form.capacityPerDay) : undefined,
        commissionPercent: form.commissionPercent !== '' ? Number(form.commissionPercent) : undefined,
        planDetails: form.planDetail,
        planExpiry: form.planExpiry || undefined,
        bankName: form.bankName,
        accountFullName: form.accountFullName,
        ibanNo: form.ibanNo,
        accountNumber: form.accountNumber,
        swift: form.swift,
        branchAddress: form.branchAddress,
      };

      if (form.vendorProfileImage) {
        payload.vendorProfileImage = form.vendorProfileImage;
      }

      if (vendorType === 'PERMANENT') {
        payload.tradeLicenseNumber = form.tradeLicenseNumber;
      }

      if (form.password) {
        payload.password = form.password;
      }

      if (agreementUpload) {
        payload.agreementFileUrl = agreementUpload.url;
        payload.agreementFileKey = agreementUpload.key;
      }

      delete (payload as Record<string, unknown>).countryCode;
      delete (payload as Record<string, unknown>).telephoneCountryCode;
      console.log('Vendor update payload:', payload);

      await adminApi.vendors.update(id, payload);
      toast.success('Vendor updated successfully!');
      router.push('/admin/vendors');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = () => {
    setIsActive(!isActive);
    toast.success(`Vendor ${!isActive ? 'Activated' : 'Deactivated'}`);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading vendor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
            </div>
          </div>

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

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <div className={`bg-white rounded-xl shadow-sm transition-colors ${
              isActive ? 'border-2' : 'border border-gray-200'
            }`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 px-6 pt-6">
                Tell Us about yourself
              </h2>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <p className="text-xs text-gray-400 mt-2">Upload a new image to replace the existing one (JPG, PNG, WEBP)</p>
                  </div>

                  <div>
                    <Input
                      label="First Name *"
                      value={form.firstName}
                      onChange={(e) => {
                        setForm({ ...form, firstName: e.target.value });
                        if (validationErrors.firstName) setValidationErrors((p) => ({ ...p, firstName: '' }));
                      }}
                      required
                    />
                    {validationErrors.firstName ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.firstName}</p>
                    ) : null}
                  </div>

                  <div>
                    <Input
                      label="Last Name *"
                      value={form.lastName}
                      onChange={(e) => {
                        setForm({ ...form, lastName: e.target.value });
                        if (validationErrors.lastName) setValidationErrors((p) => ({ ...p, lastName: '' }));
                      }}
                      required
                    />
                    {validationErrors.lastName ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>
                    ) : null}
                  </div>

                  <div>
                    <Input
                      label="User Name * (auto-generated, editable)"
                      value={form.userName}
                      onChange={(e) => {
                        setUserNameEdited(true);
                        setForm({ ...form, userName: e.target.value });
                        if (validationErrors.userName) setValidationErrors((p) => ({ ...p, userName: '' }));
                      }}
                      required
                    />
                    {validationErrors.userName ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.userName}</p>
                    ) : null}
                  </div>

                  <div>
                    <Input
                      label="Email *"
                      type="email"
                      value={form.primaryEmail}
                      onChange={(e) => {
                        setForm({ ...form, primaryEmail: e.target.value });
                        if (validationErrors.primaryEmail) setValidationErrors((p) => ({ ...p, primaryEmail: '' }));
                      }}
                      required
                    />
                    {validationErrors.primaryEmail ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.primaryEmail}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
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
                        onChange={(e) => {
                          setForm({ ...form, telephone: e.target.value.replace(/[^0-9]/g, '') });
                          if (validationErrors.telephone) setValidationErrors((p) => ({ ...p, telephone: '' }));
                        }}
                        placeholder="e.g., 43001234"
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                          validationErrors.telephone
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                            : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                        }`}
                      />
                    </div>
                    {validationErrors.telephone ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.telephone}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number * (Don't add 0)</label>
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
                        onChange={(e) => {
                          setForm({ ...form, primaryMobile: e.target.value.replace(/[^0-9]/g, '') });
                          if (validationErrors.primaryMobile) setValidationErrors((p) => ({ ...p, primaryMobile: '' }));
                        }}
                        required
                        placeholder="e.g., 501234567"
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                          validationErrors.primaryMobile
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                            : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                        }`}
                      />
                    </div>
                    {validationErrors.primaryMobile ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.primaryMobile}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Type <span className="text-red-500">*</span>
                    </label>
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
                          <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                            form.vendorType === 'freelancer'
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-400 bg-white group-hover:border-orange-300'
                          }`}>
                            {form.vendorType === 'freelancer' && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-700">Professional</span>
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
                          <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                            form.vendorType === 'permanent'
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-400 bg-white group-hover:border-orange-300'
                          }`}>
                            {form.vendorType === 'permanent' && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-700">Service Provider</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep existing)</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => {
                          setForm({ ...form, password: e.target.value });
                          if (validationErrors.password) setValidationErrors((p) => ({ ...p, password: '' }));
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 pr-10 transition-colors ${
                          validationErrors.password
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                            : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {validationErrors.password ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Minimum 9 characters, at least one uppercase letter, one lowercase letter, one number and one special character.</p>
                    )}
                  </div>

                  <SearchableSelect
                    label="Specialization"
                    required
                    value={form.specialization}
                    onChange={(val) => {
                      setForm({ ...form, specialization: val });
                      if (validationErrors.specialization) setValidationErrors((p) => ({ ...p, specialization: '' }));
                    }}
                    options={categories.map((c) => c.name)}
                    loading={categoriesLoading}
                    loadingLabel="Loading categories..."
                    placeholder="Select a category"
                    error={validationErrors.specialization}
                  />

                  <SearchableSelect
                    label="Where is your Business"
                    required
                    value={form.whereIsYourBusiness}
                    onChange={(val) => {
                      setForm({ ...form, whereIsYourBusiness: val });
                      if (validationErrors.whereIsYourBusiness) setValidationErrors((p) => ({ ...p, whereIsYourBusiness: '' }));
                    }}
                    options={BUSINESS_LOCATIONS}
                    placeholder="Select business location"
                    icon={<MapPin size={16} />}
                    error={validationErrors.whereIsYourBusiness}
                  />

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

                  <div>
                    <Input
                      label="Address Line 1 *"
                      value={form.addressLine1}
                      onChange={(e) => {
                        setForm({ ...form, addressLine1: e.target.value });
                        if (validationErrors.addressLine1) setValidationErrors((p) => ({ ...p, addressLine1: '' }));
                      }}
                      required
                    />
                    {validationErrors.addressLine1 ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.addressLine1}</p>
                    ) : null}
                  </div>
                  <Input label="Address Line 2" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
                  <Input label="Landmark" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
                  <Input label="PO Box" value={form.poBox} onChange={(e) => setForm({ ...form, poBox: e.target.value })} />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                    <textarea
                      value={form.about}
                      onChange={(e) => setForm({ ...form, about: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {form.vendorType === 'freelancer' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Professional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contractType"
                          value="hourly"
                          checked={form.contractType === 'hourly'}
                          onChange={(e) => {
                            setForm({ ...form, contractType: e.target.value });
                            if (validationErrors.contractType) setValidationErrors((p) => ({ ...p, contractType: '' }));
                          }}
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
                          onChange={(e) => {
                            setForm({ ...form, contractType: e.target.value });
                            if (validationErrors.contractType) setValidationErrors((p) => ({ ...p, contractType: '' }));
                          }}
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
                          onChange={(e) => {
                            setForm({ ...form, contractType: e.target.value });
                            if (validationErrors.contractType) setValidationErrors((p) => ({ ...p, contractType: '' }));
                          }}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">Per Project</span>
                      </label>
                    </div>
                    {validationErrors.contractType ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.contractType}</p>
                    ) : null}
                  </div>

                  {form.contractType !== 'monthly' && form.contractType !== 'project' && (
                    <div>
                      <Input
                        label={`Hourly Rate (AED) ${form.contractType === 'hourly' ? '*' : ''}`}
                        type="number"
                        value={form.hourlyRate}
                        onChange={(e) => {
                          setForm({ ...form, hourlyRate: e.target.value });
                          if (validationErrors.hourlyRate) setValidationErrors((p) => ({ ...p, hourlyRate: '' }));
                        }}
                        required={form.contractType === 'hourly'}
                      />
                      {validationErrors.hourlyRate ? (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.hourlyRate}</p>
                      ) : null}
                    </div>
                  )}

                  <div>
                    <Input
                      label="Available Hours per Week *"
                      type="number"
                      value={form.availableHoursPerWeek}
                      onChange={(e) => {
                        setForm({ ...form, availableHoursPerWeek: e.target.value });
                        if (validationErrors.availableHoursPerWeek) setValidationErrors((p) => ({ ...p, availableHoursPerWeek: '' }));
                      }}
                      required
                      placeholder="e.g., 40"
                    />
                    {validationErrors.availableHoursPerWeek ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.availableHoursPerWeek}</p>
                    ) : null}
                  </div>

                  {form.contractType === 'monthly' && (
                    <div>
                      <Input
                        label="Monthly Rate (AED) *"
                        type="number"
                        value={form.hourlyRate}
                        onChange={(e) => {
                          setForm({ ...form, hourlyRate: e.target.value });
                          if (validationErrors.hourlyRate) setValidationErrors((p) => ({ ...p, hourlyRate: '' }));
                        }}
                        required
                      />
                      {validationErrors.hourlyRate ? (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.hourlyRate}</p>
                      ) : null}
                    </div>
                  )}

                  {form.contractType === 'project' && (
                    <div>
                      <Input
                        label="Project Rate (AED) *"
                        type="number"
                        value={form.hourlyRate}
                        onChange={(e) => {
                          setForm({ ...form, hourlyRate: e.target.value });
                          if (validationErrors.hourlyRate) setValidationErrors((p) => ({ ...p, hourlyRate: '' }));
                        }}
                        required
                      />
                      {validationErrors.hourlyRate ? (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.hourlyRate}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            )}

            {form.vendorType === 'permanent' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Service Provider Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="salaryType"
                          value="monthly"
                          checked={form.salaryType === 'monthly'}
                          onChange={(e) => {
                            setForm({ ...form, salaryType: e.target.value });
                            if (validationErrors.salaryType) setValidationErrors((p) => ({ ...p, salaryType: '' }));
                          }}
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
                          onChange={(e) => {
                            setForm({ ...form, salaryType: e.target.value });
                            if (validationErrors.salaryType) setValidationErrors((p) => ({ ...p, salaryType: '' }));
                          }}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">Yearly</span>
                      </label>
                    </div>
                    {validationErrors.salaryType ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.salaryType}</p>
                    ) : null}
                  </div>

                  <div>
                    <Input
                      label={`Basic Salary (AED) *`}
                      type="number"
                      value={form.basicSalary}
                      onChange={(e) => {
                        setForm({ ...form, basicSalary: e.target.value });
                        if (validationErrors.basicSalary) setValidationErrors((p) => ({ ...p, basicSalary: '' }));
                      }}
                      required
                    />
                    {validationErrors.basicSalary ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.basicSalary}</p>
                    ) : null}
                  </div>

                  <Input
                    label="Housing Allowance (AED)"
                    type="number"
                    value={form.housingAllowance}
                    onChange={(e) => setForm({ ...form, housingAllowance: e.target.value })}
                  />

                  <Input
                    label="Transportation Allowance (AED)"
                    type="number"
                    value={form.transportationAllowance}
                    onChange={(e) => setForm({ ...form, transportationAllowance: e.target.value })}
                  />

                  <Input
                    label="Other Allowances (AED)"
                    type="number"
                    value={form.otherAllowances}
                    onChange={(e) => setForm({ ...form, otherAllowances: e.target.value })}
                  />

                  <div>
                    <Input
                      label="Annual Leaves (days) *"
                      type="number"
                      value={form.annualLeaves}
                      onChange={(e) => {
                        setForm({ ...form, annualLeaves: e.target.value });
                        if (validationErrors.annualLeaves) setValidationErrors((p) => ({ ...p, annualLeaves: '' }));
                      }}
                      required
                      placeholder="e.g., 30"
                    />
                    {validationErrors.annualLeaves ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.annualLeaves}</p>
                    ) : null}
                  </div>

                  <div>
                    <Input
                      label="Working Hours per Week *"
                      type="number"
                      value={form.workingHours}
                      onChange={(e) => {
                        setForm({ ...form, workingHours: e.target.value });
                        if (validationErrors.workingHours) setValidationErrors((p) => ({ ...p, workingHours: '' }));
                      }}
                      required
                      placeholder="e.g., 48"
                    />
                    {validationErrors.workingHours ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.workingHours}</p>
                    ) : null}
                  </div>

                  <div>
                    <Input
                      label="Joining Date *"
                      type="date"
                      value={form.joiningDate}
                      onChange={(e) => {
                        setForm({ ...form, joiningDate: e.target.value });
                        if (validationErrors.joiningDate) setValidationErrors((p) => ({ ...p, joiningDate: '' }));
                      }}
                      required
                    />
                    {validationErrors.joiningDate ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.joiningDate}</p>
                    ) : null}
                  </div>

                  <div>
                    <Input
                      label="Trade License Number *"
                      value={form.tradeLicenseNumber}
                      onChange={(e) => {
                        setForm({ ...form, tradeLicenseNumber: e.target.value });
                        if (validationErrors.tradeLicenseNumber) setValidationErrors((p) => ({ ...p, tradeLicenseNumber: '' }));
                      }}
                      required
                      placeholder="e.g., LIC123456789"
                    />
                    {validationErrors.tradeLicenseNumber ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.tradeLicenseNumber}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            <div className={`bg-white rounded-xl shadow-sm transition-colors ${
              isActive ? 'border-2 ' : 'border border-gray-200'
            }`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 px-6 pt-6">
                Professional Plan
              </h2>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Capacity Per Day (events)" type="number" value={form.capacityPerDay} onChange={(e) => setForm({ ...form, capacityPerDay: e.target.value })} placeholder="e.g., 3" />
                  <Input label="Commission Percent (%)" type="number" value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} placeholder="e.g., 10" />
                  <Input
                    label="Detail of Plan"
                    value={form.planDetail}
                    onChange={(e) => setForm({ ...form, planDetail: e.target.value })}
                  />
                  <Input
                    label="Plan Expiry"
                    type="date"
                    value={form.planExpiry}
                    onChange={(e) => setForm({ ...form, planExpiry: e.target.value })}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agreement File Upload</label>
                    <input
                      type="file"
                      onChange={(e) => setForm({ ...form, agreementFile: e.target.files?.[0] || null })}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave empty to keep the existing agreement file</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-white rounded-xl shadow-sm transition-colors ${
              isActive ? 'border-2' : 'border border-gray-200'
            }`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 px-6 pt-6">
                Payment Bank Details
              </h2>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Bank Name"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  />
                  <Input
                    label="Account Full Name"
                    value={form.accountFullName}
                    onChange={(e) => setForm({ ...form, accountFullName: e.target.value })}
                  />
                  <Input
                    label="IBAN No."
                    value={form.ibanNo}
                    onChange={(e) => setForm({ ...form, ibanNo: e.target.value })}
                  />
                  <Input
                    label="Account Number"
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  />
                  <Input
                    label="Swift"
                    value={form.swift}
                    onChange={(e) => setForm({ ...form, swift: e.target.value })}
                  />

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
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading || uploadingProfileImage}>{loading ? 'Updating...' : 'Update Vendor'}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
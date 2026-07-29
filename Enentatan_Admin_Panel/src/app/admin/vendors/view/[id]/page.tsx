'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Building, Calendar,
  CreditCard, CheckCircle, XCircle, AlertCircle, FileText, Image as ImageIcon,
  ShieldCheck, User, Info
} from 'lucide-react';
import Button from '@/components/admin/Button';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { adminApi } from '@/api/adminApi';

interface Vendor {
  id: string;
  userId?: string;
  oldVendorId?: string | null;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  primaryEmail?: string;
  phone?: string;
  primaryMobile?: string;
  about?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  telephone?: string;
  status?: string;
  vendorType?: string; // FREELANCER or PERMANENT
  vendorProfileImage?: string;
  tradeLicenseNumber?: string;
  tradeLicenseExpiry?: string;
  tradeLicenseFileUrl?: string;
  tradeLicenseFileKey?: string;
  passportExpiry?: string;
  passportFileUrl?: string;
  passportFileKey?: string;
  emiratesIdExpiry?: string;
  vatNumber?: string;
  updatedProfile?: boolean;
  specialization?: string;
  businessLocation?: string;
  location?: string;
  address?: string;
  visaType?: string;
  cities?: string[];
  capacityPerDay?: number;
  commissionPercent?: number | string;
  planDetails?: string;
  planExpiry?: string;
  agreementFileUrl?: string;
  agreementFileKey?: string;
  bankName?: string;
  accountFullName?: string;
  ibanNo?: string;
  accountNumber?: string;
  swift?: string;
  branchAddress?: string;
  appleId?: string | null;
  countryCode?: string | null;
  deviceToken?: string | null;
  estCardExpiry?: string | null;
  facebookId?: string | null;
  googleId?: string | null;
  imageUrl?: string | null;
  inviteCode?: string | null;
  isBlocked?: boolean | null;
  isDeleted?: boolean | null;
  isPremium?: boolean | null;
  isVerified?: boolean | null;
  noOfPartners?: number | null;
  tradeExpiry?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function ViewVendorPage() {
  const router = useRouter();
  const params = useParams();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [fetching, setFetching] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    (async () => {
      try {
        setFetching(true);
        const data = await adminApi.vendors.getById(id);
        setVendor(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load vendor');
      } finally {
        setFetching(false);
      }
    })();
  }, [params.id]);

  const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  };

  const openStatusModal = () => {
    if (!vendor) return;
    const newStatus = vendor.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!vendor || !pendingStatus) return;
    try {
      await adminApi.vendors.updateStatus(vendor.id, pendingStatus);
      setVendor({ ...vendor, status: pendingStatus });
      toast.success(`Vendor ${pendingStatus === 'APPROVED' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update vendor status');
    } finally {
      setIsStatusModalOpen(false);
      setPendingStatus('');
    }
  };

  const confirmDelete = async () => {
    if (!vendor) return;
    try {
      await adminApi.vendors.delete(vendor.id);
      toast.success('Vendor deleted successfully!');
      router.push('/admin/vendors');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete vendor');
    } finally {
      setIsDeleteOpen(false);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return 'Not provided';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return 'Not provided';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const BoolBadge = ({ value }: { value?: boolean | null }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      {value ? 'Yes' : 'No'}
    </span>
  );

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading vendor...</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Vendor not found.</div>
      </div>
    );
  }

  const status = vendor.status || 'PENDING';
  const StatusColor = statusColors[status] || statusColors.PENDING;
  const StatusIcon = StatusColor.icon;
  const email = vendor.primaryEmail || vendor.email || '';
  const phone = vendor.primaryMobile || vendor.phone || '';
  const businessLocation = vendor.businessLocation || vendor.location || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vendor Details</h1>
            <p className="text-sm text-gray-500 mt-0.5">View complete vendor information</p>
          </div>
        </div>
        <div className="flex gap-3">
          {status !== 'PENDING' && (
            <Button variant="secondary" onClick={openStatusModal}>
              {status === 'APPROVED' ? (
                <> <XCircle size={15} /> Reject Vendor</>
              ) : (
                <> <CheckCircle size={15} /> Approve Vendor</>
              )}
            </Button>
          )}
          <Button variant="secondary" onClick={() => router.push(`/admin/vendors/edit/${vendor.id}`)}>
            <Edit size={15} />
            Edit
          </Button>
          <Button variant="secondary" onClick={() => setIsDeleteOpen(true)} className="text-red-600 hover:bg-red-50">
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      </div>

      {/* Vendor Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-orange-50 to-transparent border-b border-gray-100">
          <div className="flex items-center gap-6">
            {vendor.vendorProfileImage ? (
              <img
                src={vendor.vendorProfileImage}
                alt={vendor.companyName || 'Vendor'}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                {vendor.companyName?.charAt(0).toUpperCase() || 'V'}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">{vendor.companyName || 'Unnamed Vendor'}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${StatusColor.bg} ${StatusColor.text}`}>
                  <StatusIcon size={12} />
                  {status}
                </span>
                {vendor.vendorType && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {vendor.vendorType}
                  </span>
                )}
                {vendor.isVerified && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified
                  </span>
                )}
                {vendor.isBlocked && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Blocked
                  </span>
                )}
                {vendor.isPremium && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-gray-600">Contact Person: {vendor.contactPerson || 'Not provided'}</p>
              {vendor.userName && (
                <p className="text-sm text-gray-500">Username: @{vendor.userName}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {email || 'Not provided'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {phone || 'Not provided'}
                </span>
                {vendor.telephone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {vendor.telephone} (Tel)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-orange-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">First Name</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.firstName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Last Name</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.lastName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Visa Type</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.visaType || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Emirates ID Expiry</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(vendor.emiratesIdExpiry)}</p>
              </div>
              {vendor.about && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">About</label>
                  <p className="text-sm text-gray-900 mt-1">{vendor.about}</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building size={18} className="text-orange-500" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Trade License Number</label>
                <p className="text-sm text-gray-900 mt-1">
                  {vendor.vendorType === 'FREELANCER' && !vendor.tradeLicenseNumber
                    ? 'N/A (Freelancer)'
                    : (vendor.tradeLicenseNumber || 'Not provided')}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Trade License Expiry</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(vendor.tradeLicenseExpiry)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">VAT Number</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.vatNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Specialization</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.specialization || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Business Location</label>
                <p className="text-sm text-gray-900 mt-1">{businessLocation || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Passport Expiry</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(vendor.passportExpiry)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Address</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          {(vendor.tradeLicenseFileUrl || vendor.passportFileUrl || vendor.agreementFileUrl) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-orange-500" />
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                {vendor.tradeLicenseFileUrl && (
                  <a
                    href={vendor.tradeLicenseFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-sm text-gray-700"
                  >
                    <ImageIcon size={16} className="text-orange-500" />
                    Trade License File
                  </a>
                )}
                {vendor.passportFileUrl && (
                  <a
                    href={vendor.passportFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-sm text-gray-700"
                  >
                    <ImageIcon size={16} className="text-orange-500" />
                    Passport File
                  </a>
                )}
                {vendor.agreementFileUrl && (
                  <a
                    href={vendor.agreementFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-sm text-gray-700"
                  >
                    <ImageIcon size={16} className="text-orange-500" />
                    Agreement File
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Operating Cities */}
          {vendor.cities && vendor.cities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-orange-500" />
                Operating Cities
              </h3>
              <div className="flex flex-wrap gap-2 pl-6">
                {vendor.cities.map((city: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Professional Plan */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-orange-500" />
              Professional Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Capacity Per Day</label>
                <p className="text-sm text-gray-900 mt-1 font-semibold">{vendor.capacityPerDay || 0} events</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Commission</label>
                <p className="text-sm text-green-600 font-semibold mt-1">{vendor.commissionPercent || 0}%</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Plan Details</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.planDetails || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Plan Expiry</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(vendor.planExpiry)}</p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {(vendor.bankName || vendor.accountFullName || vendor.ibanNo || vendor.accountNumber || vendor.swift) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-orange-500" />
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                {vendor.bankName && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Bank Name</label>
                    <p className="text-sm text-gray-900 mt-1">{vendor.bankName}</p>
                  </div>
                )}
                {vendor.accountFullName && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Account Full Name</label>
                    <p className="text-sm text-gray-900 mt-1">{vendor.accountFullName}</p>
                  </div>
                )}
                {vendor.ibanNo && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">IBAN No.</label>
                    <p className="text-sm text-gray-900 mt-1">{vendor.ibanNo}</p>
                  </div>
                )}
                {vendor.accountNumber && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Account Number</label>
                    <p className="text-sm text-gray-900 mt-1">{vendor.accountNumber}</p>
                  </div>
                )}
                {vendor.swift && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Swift Code</label>
                    <p className="text-sm text-gray-900 mt-1">{vendor.swift}</p>
                  </div>
                )}
                {vendor.branchAddress && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Branch Address</label>
                    <p className="text-sm text-gray-900 mt-1">{vendor.branchAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account & System Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info size={18} className="text-orange-500" />
              Account &amp; System Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Country Code</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.countryCode || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Invite Code</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.inviteCode || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">No. of Partners</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.noOfPartners ?? 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Google Linked</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.googleId ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Facebook Linked</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.facebookId ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Apple Linked</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.appleId ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Profile Updated</label>
                <div className="mt-1"><BoolBadge value={vendor.updatedProfile} /></div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Verified</label>
                <div className="mt-1"><BoolBadge value={vendor.isVerified} /></div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Premium</label>
                <div className="mt-1"><BoolBadge value={vendor.isPremium} /></div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Blocked</label>
                <div className="mt-1"><BoolBadge value={vendor.isBlocked} /></div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Deleted</label>
                <div className="mt-1"><BoolBadge value={vendor.isDeleted} /></div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Created At</label>
                <p className="text-sm text-gray-900 mt-1">{formatDateTime(vendor.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Updated At</label>
                <p className="text-sm text-gray-900 mt-1">{formatDateTime(vendor.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setPendingStatus('');
        }}
        onConfirm={confirmStatusChange}
        title={pendingStatus === 'APPROVED' ? 'Approve Vendor' : 'Reject Vendor'}
        message={`Are you sure you want to ${pendingStatus === 'APPROVED' ? 'approve' : 'reject'} vendor "${vendor.companyName}"?`}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete vendor "${vendor.companyName}"? This action cannot be undone.`}
      />
    </div>
  );
}
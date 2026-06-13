'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Building, Calendar, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/admin/Button';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function ViewVendorPage() {
  const router = useRouter();
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');

  // Static vendor data
  const vendor = {
    id: '1',
    companyName: 'Test Company LLC',
    contactPerson: 'John Doe',
    email: 'john@testcompany.com',
    phone: '501234567',
    status: 'APPROVED',
    tradeLicenseNumber: 'LIC123456789',
    vatNumber: 'VAT1234567',
    specialization: 'Event Management',
    location: 'Dubai, UAE',
    address: 'Business Bay, Dubai, UAE',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    capacityPerDay: 100,
    commissionPercent: 15,
    bankName: 'Emirates NBD',
    accountFullName: 'Test Company LLC',
    ibanNo: 'AE123456789012345678901',
    accountNumber: '123456789',
    swift: 'EBILAEAD',
    branchAddress: 'Downtown Dubai Branch'
  };

  const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  };

  const StatusIcon = statusColors[vendor.status]?.icon || AlertCircle;

  const openStatusModal = () => {
    const newStatus = vendor.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    // API call commented for now
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success(`Vendor ${pendingStatus === 'APPROVED' ? 'approved' : 'rejected'} successfully!`);
    setIsStatusModalOpen(false);
    setPendingStatus('');
  };

  const confirmDelete = async () => {
    // API call commented for now
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Vendor deleted successfully!');
    router.push('/admin/vendors');
    setIsDeleteOpen(false);
  };

  const StatusColor = statusColors[vendor.status] || statusColors.PENDING;

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
          {vendor.status !== 'PENDING' && (
            <Button variant="secondary" onClick={openStatusModal}>
              {vendor.status === 'APPROVED' ? (
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
              {vendor.companyName?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{vendor.companyName}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${StatusColor.bg} ${StatusColor.text}`}>
                  <StatusIcon size={12} />
                  {vendor.status}
                </span>
              </div>
              <p className="text-gray-600">Contact Person: {vendor.contactPerson}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {vendor.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {vendor.phone}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Business Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building size={18} className="text-orange-500" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Trade License Number</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.tradeLicenseNumber || 'Not provided'}</p>
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
                <p className="text-sm text-gray-900 mt-1">{vendor.location || 'Not specified'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Address</label>
                <p className="text-sm text-gray-900 mt-1">{vendor.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

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
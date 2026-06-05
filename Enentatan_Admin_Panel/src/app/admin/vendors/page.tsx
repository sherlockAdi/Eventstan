'use client';

import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, ToggleLeft, ToggleRight, X, Mail, Briefcase, Upload, Loader2, FileText } from 'lucide-react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import { adminApi } from '@/api/adminApi';
import toast from 'react-hot-toast';

interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  about?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  primaryEmail?: string;
  telephone?: string;
  primaryMobile?: string;
  specialization?: string;
  businessLocation?: string;
  visaType?: string;
  address?: string;
  status: string;
  tradeLicenseNumber: string;
  vatNumber: string;
  cities: string[];
  capacityPerDay: number;
  commissionPercent: number;
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
  srNo?: number;
}

const emptyVendorForm: Partial<Vendor> = {
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
  cities: [],
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
  branchAddress: ''
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [form, setForm] = useState<Partial<Vendor>>(emptyVendorForm);
  const [uploadingAgreement, setUploadingAgreement] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await adminApi.vendors.list();
      const vendorsWithSrNo = data.map((vendor: Vendor, index: number) => ({
        ...vendor,
        srNo: index + 1
      }));
      setVendors(vendorsWithSrNo);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  const openStatusModal = (vendor: Vendor) => {
    setSelected(vendor);
    const newStatus = vendor.status === 'APPROVED' ? 'REJECTED' : 'APPROVED';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (selected && pendingStatus) {
      try {
        await adminApi.vendors.updateStatus(selected.id, pendingStatus);
        setVendors(vendors.map(v => 
          v.id === selected.id ? { ...v, status: pendingStatus } : v
        ));
        toast.success(`Vendor ${pendingStatus === 'APPROVED' ? 'approved' : 'rejected'} successfully!`);
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error('Failed to update vendor status');
      }
      
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus('');
    }
  };

  const openView = (vendor: Vendor) => {
    setSelected(vendor);
    setIsViewModalOpen(true);
  };

  const openEdit = (vendor: Vendor) => {
    setSelected(vendor);
    setForm({
      ...vendor,
      planExpiry: vendor.planExpiry ? vendor.planExpiry.slice(0, 10) : ''
    });
    setIsModalOpen(true);
  };

  const openDelete = (vendor: Vendor) => {
    setSelected(vendor);
    setIsDeleteOpen(true);
  };

  const columns = [
    { key: 'srNo', label: 'SR No' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v: string, row: Vendor) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[v] ?? 'bg-gray-100 text-gray-600'}`}>
            {v}
          </span>
          {v !== 'PENDING' && (
            <button
              onClick={() => openStatusModal(row)}
              className="text-gray-500 hover:text-orange-600 transition-colors"
              title={v === 'APPROVED' ? 'Reject' : 'Approve'}
            >
              {v === 'APPROVED' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Vendor) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => openView(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all" 
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={() => openEdit(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all" 
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={() => openDelete(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" 
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  const openAdd = () => { 
    setSelected(null); 
    setForm({ ...emptyVendorForm }); 
    setIsModalOpen(true); 
  };

  const uploadAgreement = async (file: File | null) => {
    if (!file) return;
    try {
      setUploadingAgreement(true);
      const uploaded = await adminApi.uploads.file(file, 'agreements');
      setForm(current => ({
        ...current,
        agreementFileUrl: uploaded.url,
        agreementFileKey: uploaded.key
      }));
      toast.success('Agreement uploaded successfully!');
    } catch (error) {
      console.error('Agreement upload failed:', error);
      toast.error('Agreement upload failed');
    } finally {
      setUploadingAgreement(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...form,
      cities: form.cities ?? [],
      capacityPerDay: Number(form.capacityPerDay || 1),
      commissionPercent: Number(form.commissionPercent || 0),
      planExpiry: form.planExpiry || undefined
    };

    try {
      if (selected) {
        const updatedVendor = await adminApi.vendors.update(selected.id, submitData);
        setVendors(vendors.map(v => v.id === selected.id ? { ...updatedVendor, srNo: v.srNo } : v));
        toast.success('Vendor updated successfully!');
      } else {
        const newVendor = await adminApi.vendors.create(submitData);
        setVendors([...vendors, { ...newVendor, srNo: vendors.length + 1 }]);
        toast.success('Vendor created successfully!');
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error('Failed to save vendor');
    }
    
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (selected) {
      try {
        await adminApi.vendors.delete(selected.id);
        setVendors(vendors.filter(v => v.id !== selected.id));
        toast.success('Vendor deleted successfully!');
      } catch (error) {
        console.error('Error deleting vendor:', error);
        toast.error('Failed to delete vendor');
      }
    }
    setIsDeleteOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading vendors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vendors Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {vendors.length} total vendors · {vendors.filter(v => v.status === 'APPROVED').length} approved · {vendors.filter(v => v.status === 'PENDING').length} pending
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={15} />
          Add Vendor
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Table columns={columns} data={vendors} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Vendor' : 'Create Vendor'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Company Name" 
              value={form.companyName || ''} 
              onChange={e => setForm({ ...form, companyName: e.target.value })} 
              required 
            />
            <Input 
              label="Contact Person" 
              value={form.contactPerson || ''} 
              onChange={e => setForm({ ...form, contactPerson: e.target.value })} 
              required 
            />
            <Input 
              label="Email" 
              type="email" 
              value={form.email || ''} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required 
            />
            <Input 
              label="Phone" 
              value={form.phone || ''} 
              onChange={e => setForm({ ...form, phone: e.target.value })} 
              required 
            />
            <Input 
              label="Trade License Number" 
              value={form.tradeLicenseNumber || ''} 
              onChange={e => setForm({ ...form, tradeLicenseNumber: e.target.value })} 
            />
            <Input 
              label="VAT Number" 
              value={form.vatNumber || ''} 
              onChange={e => setForm({ ...form, vatNumber: e.target.value })} 
            />
            <Input 
              label="Cities (comma separated)" 
              value={form.cities?.join(', ') || ''} 
              onChange={e => setForm({ ...form, cities: e.target.value.split(',').map(c => c.trim()) })} 
              placeholder="Dubai, Abu Dhabi"
            />
            <Input 
              label="Capacity Per Day" 
              type="number" 
              value={form.capacityPerDay || 0} 
              onChange={e => setForm({ ...form, capacityPerDay: parseInt(e.target.value) || 0 })} 
            />
            <Input 
              label="Commission Percent" 
              type="number" 
              value={form.commissionPercent || 0} 
              onChange={e => setForm({ ...form, commissionPercent: parseInt(e.target.value) || 0 })} 
            />
          </div>
          <div className="mt-2 border-t border-gray-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Professional Registration</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="About" value={form.about || ''} onChange={e => setForm({ ...form, about: e.target.value })} />
              <Input label="User Name" value={form.userName || ''} onChange={e => setForm({ ...form, userName: e.target.value })} />
              <Input label="First Name" value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              <Input label="Last Name" value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              <Input label="Primary Email" type="email" value={form.primaryEmail || ''} onChange={e => setForm({ ...form, primaryEmail: e.target.value })} />
              <Input label="Primary Mobile" value={form.primaryMobile || ''} onChange={e => setForm({ ...form, primaryMobile: e.target.value })} />
              <Input label="Telephone" value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} />
              <Input label="Specialization" value={form.specialization || ''} onChange={e => setForm({ ...form, specialization: e.target.value })} />
              <Input label="Business Location" value={form.businessLocation || ''} onChange={e => setForm({ ...form, businessLocation: e.target.value })} />
              <Input label="Visa Type" value={form.visaType || ''} onChange={e => setForm({ ...form, visaType: e.target.value })} />
              <Input label="Address" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div className="mt-2 border-t border-gray-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Professional Plan</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Details of Plan" value={form.planDetails || ''} onChange={e => setForm({ ...form, planDetails: e.target.value })} />
              <Input label="Plan Expiry" type="date" value={form.planExpiry || ''} onChange={e => setForm({ ...form, planExpiry: e.target.value })} />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Agreement File Upload</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={e => uploadAgreement(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                  />
                  {uploadingAgreement ? <Loader2 className="h-4 w-4 animate-spin text-orange-500" /> : <Upload className="h-4 w-4 text-gray-400" />}
                </div>
                {form.agreementFileUrl && (
                  <a href={form.agreementFileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                    <FileText size={13} /> View agreement
                  </a>
                )}
              </div>
              <Input label="Agreement File Key" value={form.agreementFileKey || ''} onChange={e => setForm({ ...form, agreementFileKey: e.target.value })} />
            </div>
          </div>
          <div className="mt-2 border-t border-gray-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Payment Bank Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Bank Name" value={form.bankName || ''} onChange={e => setForm({ ...form, bankName: e.target.value })} />
              <Input label="Account Full Name" value={form.accountFullName || ''} onChange={e => setForm({ ...form, accountFullName: e.target.value })} />
              <Input label="IBAN No." value={form.ibanNo || ''} onChange={e => setForm({ ...form, ibanNo: e.target.value })} />
              <Input label="Account Number" value={form.accountNumber || ''} onChange={e => setForm({ ...form, accountNumber: e.target.value })} />
              <Input label="Swift" value={form.swift || ''} onChange={e => setForm({ ...form, swift: e.target.value })} />
              <Input label="Branch Address" value={form.branchAddress || ''} onChange={e => setForm({ ...form, branchAddress: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{selected ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {isViewModalOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Vendor Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                    {selected.companyName?.charAt(0).toUpperCase() || 'V'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{selected.companyName}</h3>
                    <p className="text-sm text-gray-600">Contact: {selected.contactPerson}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selected.status]}`}>
                        {selected.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Mail size={14} className="text-orange-500" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Email Address</label>
                      <p className="text-sm text-gray-900">{selected.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Phone Number</label>
                      <p className="text-sm text-gray-900">{selected.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Briefcase size={14} className="text-orange-500" />
                    Business Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Trade License Number</label>
                      <p className="text-sm text-gray-900">{selected.tradeLicenseNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">VAT Number</label>
                      <p className="text-sm text-gray-900">{selected.vatNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Operating Cities</label>
                      <p className="text-sm text-gray-900">{selected.cities?.join(', ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Capacity Per Day</label>
                      <p className="text-sm text-gray-900">{selected.capacityPerDay || 0} events</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Commission</label>
                      <p className="text-sm text-gray-900 font-semibold text-green-600">{selected.commissionPercent}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText size={14} className="text-orange-500" />
                    Professional Registration
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    {[
                      ['About', selected.about],
                      ['User Name', selected.userName],
                      ['First Name', selected.firstName],
                      ['Last Name', selected.lastName],
                      ['Primary Email', selected.primaryEmail],
                      ['Primary Mobile', selected.primaryMobile],
                      ['Telephone', selected.telephone],
                      ['Specialization', selected.specialization],
                      ['Business Location', selected.businessLocation],
                      ['Visa Type', selected.visaType],
                      ['Address', selected.address],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <label className="text-xs text-gray-500">{label}</label>
                        <p className="text-sm text-gray-900">{value || 'Not provided'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText size={14} className="text-orange-500" />
                    Plan & Bank Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    {[
                      ['Plan Details', selected.planDetails],
                      ['Plan Expiry', selected.planExpiry ? selected.planExpiry.slice(0, 10) : ''],
                      ['Bank Name', selected.bankName],
                      ['Account Full Name', selected.accountFullName],
                      ['IBAN No.', selected.ibanNo],
                      ['Account Number', selected.accountNumber],
                      ['Swift', selected.swift],
                      ['Branch Address', selected.branchAddress],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <label className="text-xs text-gray-500">{label}</label>
                        <p className="text-sm text-gray-900">{value || 'Not provided'}</p>
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-gray-500">Agreement File</label>
                      {selected.agreementFileUrl ? (
                        <a href={selected.agreementFileUrl} target="_blank" rel="noreferrer" className="block text-sm font-medium text-orange-600">
                          View agreement
                        </a>
                      ) : (
                        <p className="text-sm text-gray-900">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                openEdit(selected);
              }}>
                Edit Vendor
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isStatusModalOpen} 
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelected(null);
          setPendingStatus('');
        }} 
        onConfirm={confirmStatusChange} 
        title={pendingStatus === 'APPROVED' ? 'Approve Vendor' : 'Reject Vendor'} 
        message={`Are you sure you want to ${pendingStatus === 'APPROVED' ? 'approve' : 'reject'} vendor "${selected?.companyName}"?`} 
      />

      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
        title="Delete Vendor" 
        message={`Are you sure you want to delete vendor "${selected?.companyName}"? This action cannot be undone.`} 
      />
    </div>
  );
}

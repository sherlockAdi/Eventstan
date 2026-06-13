'use client';

import { useState } from 'react';
import { Check, Eye, Image as ImageIcon, X } from 'lucide-react';
import Button from '@/components/admin/Button';
import Modal from '@/components/admin/Modal';
import Pagination from '@/components/admin/Pagination';
import Table from '@/components/admin/Table';
import Input from '@/components/admin/Input';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface Vendor { 
  id: string; 
  companyName: string; 
  contactPerson: string; 
  city?: string;
}

interface Category { 
  id: string; 
  name: string; 
  slug: string; 
}

interface VendorService {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  category?: string;
  description: string;
  city: string;
  image_url?: string;
  price: { amount: number; currency: string };
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  vendor_name?: string;
  rejectionReason?: string;
}

// Static Vendors Data
const staticVendors: Vendor[] = [
  { id: '1', companyName: 'ABC Electronics', contactPerson: 'John Doe', city: 'Dubai' },
  { id: '2', companyName: 'XYZ Services', contactPerson: 'Jane Smith', city: 'Abu Dhabi' },
  { id: '3', companyName: 'Tech Solutions', contactPerson: 'Mike Johnson', city: 'Sharjah' },
  { id: '4', companyName: 'Home Services LLC', contactPerson: 'Sarah Wilson', city: 'Dubai' },
  { id: '5', companyName: 'Clean Masters', contactPerson: 'Ahmed Ali', city: 'Ajman' },
];

// Static Categories Data
const staticCategories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
  { id: '2', name: 'Home Services', slug: 'home-services' },
  { id: '3', name: 'Cleaning', slug: 'cleaning' },
  { id: '4', name: 'IT Support', slug: 'it-support' },
  { id: '5', name: 'Maintenance', slug: 'maintenance' },
];

// Static Pending Services Data
const staticPendingServices: VendorService[] = [
  {
    id: '1',
    vendorId: '1',
    categoryId: '1',
    title: 'Laptop Repair Service',
    description: 'Professional laptop repair and diagnostic services. We fix all brands and models.',
    city: 'Dubai',
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100',
    price: { amount: 299, currency: 'AED' },
    status: 'PENDING',
    verificationStatus: 'PENDING',
  },
  {
    id: '2',
    vendorId: '2',
    categoryId: '2',
    title: 'Home Cleaning Service',
    description: 'Complete home cleaning service including all rooms, kitchen, and bathrooms.',
    city: 'Abu Dhabi',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100',
    price: { amount: 450, currency: 'AED' },
    status: 'PENDING',
    verificationStatus: 'PENDING',
  },
  {
    id: '3',
    vendorId: '3',
    categoryId: '4',
    title: 'Network Installation',
    description: 'Professional network setup and installation for offices and homes.',
    city: 'Sharjah',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100',
    price: { amount: 1200, currency: 'AED' },
    status: 'PENDING',
    verificationStatus: 'PENDING',
  },
  {
    id: '5',
    vendorId: '5',
    categoryId: '5',
    title: 'Plumbing Services',
    description: '24/7 plumbing services for all types of repairs and installations.',
    city: 'Ajman',
    image_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=100',
    price: { amount: 250, currency: 'AED' },
    status: 'PENDING',
    verificationStatus: 'PENDING',
  },
  {
    id: '6',
    vendorId: '2',
    categoryId: '2',
    title: 'Deep Cleaning Service',
    description: 'Deep cleaning service for villas and apartments. Includes carpet and sofa cleaning.',
    city: 'Abu Dhabi',
    image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=100',
    price: { amount: 800, currency: 'AED' },
    status: 'PENDING',
    verificationStatus: 'PENDING',
  },
  {
    id: '7',
    vendorId: '1',
    categoryId: '1',
    title: 'Mobile Screen Replacement',
    description: 'Fast and reliable mobile screen replacement for all brands.',
    city: 'Dubai',
    image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100',
    price: { amount: 180, currency: 'AED' },
    status: 'PENDING',
    verificationStatus: 'PENDING',
  },
  {
    id: '8',
    vendorId: '3',
    categoryId: '4',
    title: 'Data Recovery Service',
    description: 'Professional data recovery from hard drives, SSDs, and USB drives.',
    city: 'Sharjah',
    image_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=100',
    price: { amount: 550, currency: 'AED' },
    status: 'PENDING',
    verificationStatus: 'PENDING',
  },
];

export default function PendingServiceApprovalsPage() {
  const [services, setServices] = useState<VendorService[]>(staticPendingServices);
  const [vendors] = useState<Vendor[]>(staticVendors);
  const [categories] = useState<Category[]>(staticCategories);
  const [selected, setSelected] = useState<VendorService | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const vendorName = (id: string) => vendors.find(v => v.id === id)?.companyName ?? '-';
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? '-';

  // Only show pending verification services
  const pendingServices = services.filter(service => service.verificationStatus === 'PENDING');

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Approved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>;
      case 'PENDING':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
    }
  };

  const columns: Column[] = [
    { 
      key: 'image_url', 
      label: 'Image', 
      render: (v: string) => v ? 
        <img src={v} alt="" className="w-10 h-10 rounded-lg object-cover" /> : 
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <ImageIcon size={16} className="text-gray-400" />
        </div> 
    },
    { key: 'title', label: 'Service' },
    { key: 'vendorId', label: 'Vendor', render: (v: string) => vendorName(v) },
    { key: 'categoryId', label: 'Category', render: (v: string) => categoryName(v) },
    { key: 'city', label: 'City' },
    { 
      key: 'price', 
      label: 'Price', 
      render: (_: unknown, row: VendorService) => `${row.price?.amount ?? 0} ${row.price?.currency ?? 'AED'}` 
    },
    { 
      key: 'verificationStatus', 
      label: 'Verification Status', 
      render: (v: string) => getVerificationStatusBadge(v)
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (_: unknown, row: VendorService) => (
        <div className="flex gap-1">
          <button 
            onClick={() => openViewModal(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button 
            onClick={() => openApproveModal(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50"
            title="Approve"
          >
            <Check size={14} />
          </button>
          <button 
            onClick={() => openRejectModal(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
            title="Reject"
          >
            <X size={14} />
          </button>
        </div>
      ) 
    },
  ];

  const openViewModal = (service: VendorService) => {
    setSelected(service);
    setViewModalOpen(true);
  };

  const openApproveModal = (service: VendorService) => {
    setSelected(service);
    setApproveModalOpen(true);
  };

  const confirmApprove = () => {
    if (selected) {
      approveService(selected);
      setApproveModalOpen(false);
    }
  };

  const approveService = async (service: VendorService) => {
    // Update local state
    const updatedServices = services.map(s => 
      s.id === service.id 
        ? { ...s, verificationStatus: 'APPROVED' as const, status: 'ACTIVE' as const }
        : s
    );
    setServices(updatedServices);
    toast.success('Service approved successfully');
  };

  const openRejectModal = (service: VendorService) => {
    setSelected(service);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    if (selected) {
      rejectService(selected, rejectionReason);
      setRejectModalOpen(false);
      setRejectionReason('');
    }
  };

  const rejectService = async (service: VendorService, reason: string) => {
    // Update local state
    const updatedServices = services.map(s => 
      s.id === service.id 
        ? { ...s, verificationStatus: 'REJECTED' as const, status: 'INACTIVE' as const, rejectionReason: reason }
        : s
    );
    setServices(updatedServices);
    toast.error('Service rejected');
  };

  const totalPages = Math.ceil(pendingServices.length / ITEMS_PER_PAGE);
  const paginatedData = pendingServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pending Service Approvals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendingServices.length} pending {pendingServices.length === 1 ? 'service' : 'services'} awaiting approval
          </p>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {paginatedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Check size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No pending services found</p>
            <p className="text-sm text-gray-400 mt-1">All services have been approved</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={paginatedData} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={pendingServices.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>

      {/* View Service Details Modal */}
      <Modal 
        isOpen={viewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
        title="Service Details" 
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selected.image_url ? (
                <img 
                  src={selected.image_url} 
                  alt={selected.title} 
                  className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{selected.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getVerificationStatusBadge(selected.verificationStatus)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="text-xs font-medium text-gray-500">Vendor</label>
                <p className="text-sm text-gray-900 mt-1">{vendorName(selected.vendorId)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Category</label>
                <p className="text-sm text-gray-900 mt-1">{categoryName(selected.categoryId)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">City</label>
                <p className="text-sm text-gray-900 mt-1">{selected.city}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Price</label>
                <p className="text-sm text-gray-900 mt-1">{selected.price?.amount} {selected.price?.currency}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-900 mt-1">{selected.description}</p>
              </div>
              {selected.rejectionReason && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-red-500">Rejection Reason</label>
                  <p className="text-sm text-red-600 mt-1">{selected.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </Button>
              {selected.verificationStatus === 'PENDING' && (
                <>
                  <Button 
                    type="button"
                    onClick={() => {
                      setViewModalOpen(false);
                      openApproveModal(selected);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Service
                  </Button>
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setViewModalOpen(false);
                      openRejectModal(selected);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reject Service
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal 
        isOpen={approveModalOpen} 
        onClose={() => setApproveModalOpen(false)} 
        title="Approve Service" 
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <Check size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Approval</h3>
            <p className="text-gray-600">
              Are you sure you want to approve "{selected?.title}"?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This service will be published and available to customers.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={confirmApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal 
        isOpen={rejectModalOpen} 
        onClose={() => {
          setRejectModalOpen(false);
          setRejectionReason('');
        }} 
        title="Reject Service" 
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <X size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Rejection</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject "{selected?.title}"?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this service..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-24"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be shared with the vendor
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setRejectModalOpen(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
              className={`bg-red-600 hover:bg-red-700 ${
                !rejectionReason.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
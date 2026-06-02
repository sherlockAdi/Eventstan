'use client';

import { useState, useRef } from 'react';
import { Plus, Star, Eye, Edit, Trash2, ToggleLeft, ToggleRight, X, Upload, Image as ImageIcon, Briefcase, Search } from 'lucide-react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface VendorService {
  id: number; 
  vendor: string; 
  service: string; 
  subservice: string;
  price: number; 
  experience: string; 
  rating: number; 
  totalBookings: number; 
  status: string;
  image?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  description?: string;
  location?: string;
}

const initialData: VendorService[] = [
  { id: 1, vendor: 'Wedding Pros', service: 'Wedding Photography', subservice: 'Indoor Photography', price: 50000, experience: '5 years', rating: 4.8, totalBookings: 124, status: 'Active', image: '', vendorEmail: 'weddingpros@example.com', vendorPhone: '+91 98765 43210', description: 'Professional wedding photography services with modern equipment.', location: 'Mumbai' },
  { id: 2, vendor: 'Event Planners', service: 'Catering Services', subservice: 'Veg Catering', price: 30000, experience: '8 years', rating: 4.5, totalBookings: 89, status: 'Active', image: '', vendorEmail: 'eventplanners@example.com', vendorPhone: '+91 99887 66554', description: 'Delicious vegetarian catering for all events.', location: 'Delhi' },
  { id: 3, vendor: 'Birthday Specialists', service: 'DJ & Music', subservice: 'Live DJ', price: 25000, experience: '3 years', rating: 4.2, totalBookings: 45, status: 'Pending', image: '', vendorEmail: 'birthdayspec@example.com', vendorPhone: '+91 98765 12345', description: 'Professional DJ services with latest music.', location: 'Bangalore' },
  { id: 4, vendor: 'Capture Moments', service: 'Wedding Photography', subservice: 'Outdoor Photography', price: 65000, experience: '7 years', rating: 4.9, totalBookings: 210, status: 'Active', image: '', vendorEmail: 'capture@example.com', vendorPhone: '+91 87654 32109', description: 'Candid and traditional photography experts.', location: 'Pune' },
  { id: 5, vendor: 'Flavors Kitchen', service: 'Catering Services', subservice: 'Non-Veg Catering', price: 45000, experience: '10 years', rating: 4.7, totalBookings: 178, status: 'Inactive', image: '', vendorEmail: 'flavors@example.com', vendorPhone: '+91 76543 21098', description: 'Authentic non-veg delicacies for events.', location: 'Chennai' },
];

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-red-100 text-red-700',
};

export default function VendorServicesPage() {
  const [services, setServices] = useState<VendorService[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selected, setSelected] = useState<VendorService | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState<Partial<VendorService>>({ 
    vendor: '', 
    service: '', 
    subservice: '', 
    price: 0, 
    experience: '', 
    status: 'Pending',
    image: '',
    vendorEmail: '',
    vendorPhone: '',
    description: '',
    location: ''
  });

  // Get unique vendors for dropdown
  const uniqueVendors = ['All', ...Array.from(new Set(services.map(s => s.vendor)))];

  // Filter by selected vendor
  const filtered = selectedVendor === 'All' 
    ? services 
    : services.filter(s => s.vendor === selectedVendor);

  const openStatusModal = (item: VendorService) => {
    setSelected(item);
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selected && pendingStatus) {
      setServices(services.map(s => 
        s.id === selected.id ? { ...s, status: pendingStatus } : s
      ));
      toast.success(`Service ${pendingStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus('');
    }
  };

  const openView = (item: VendorService) => {
    setSelected(item);
    setIsViewModalOpen(true);
  };

  const openEdit = (item: VendorService) => {
    setSelected(item);
    setForm(item);
    setImagePreview(item.image || '');
    setIsModalOpen(true);
  };

  const openDelete = (item: VendorService) => {
    setSelected(item);
    setIsDeleteOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setForm({ ...form, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setForm({ ...form, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { 
      key: 'image', 
      label: 'Image', 
      render: (v: string) => v ? (
        <img src={v} alt="service" className="w-10 h-10 rounded-lg object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <ImageIcon size={16} className="text-gray-400" />
        </div>
      )
    },
    { key: 'vendor', label: 'Vendor', render: (v: string) => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'service', label: 'Service' },
    { key: 'subservice', label: 'Subservice', render: (v: string) => <span className="text-xs text-gray-500">{v}</span> },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v: string, row: VendorService) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[v] ?? 'bg-gray-100 text-gray-600'}`}>
            {v}
          </span>
          {v !== 'Pending' && (
            <button
              onClick={() => openStatusModal(row)}
              className="text-gray-500 hover:text-orange-600 transition-colors"
              title={v === 'Active' ? 'Deactivate' : 'Activate'}
            >
              {v === 'Active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: VendorService) => (
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
    setForm({ 
      vendor: '', 
      service: '', 
      subservice: '', 
      price: 0, 
      experience: '', 
      status: 'Pending',
      image: '',
      vendorEmail: '',
      vendorPhone: '',
      description: '',
      location: ''
    }); 
    setImagePreview('');
    setIsModalOpen(true); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      setServices(services.map(s => s.id === selected.id ? { ...s, ...form, rating: s.rating, totalBookings: s.totalBookings } as VendorService : s));
      toast.success('Vendor service updated successfully!');
    } else {
      setServices([...services, { 
        id: services.length + 1, 
        vendor: form.vendor ?? '', 
        service: form.service ?? '', 
        subservice: form.subservice ?? '', 
        price: form.price ?? 0, 
        experience: form.experience ?? '', 
        rating: 0, 
        totalBookings: 0, 
        status: form.status ?? 'Pending',
        image: form.image || '',
        vendorEmail: form.vendorEmail || '',
        vendorPhone: form.vendorPhone || '',
        description: form.description || '',
        location: form.location || ''
      }]);
      toast.success('Vendor service added successfully!');
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selected) { 
      setServices(services.filter(s => s.id !== selected.id)); 
      toast.success('Vendor service deleted successfully!'); 
    }
    setIsDeleteOpen(false);
  };

  // Get stats
  const totalVendors = uniqueVendors.length - 1; // subtract 'All'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vendor Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {services.length} services listed · {totalVendors} vendors · {services.filter(s => s.status === 'Active').length} active
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={15} />
          Add Service
        </Button>
      </div>

      {/* Vendor Filter Dropdown */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <select
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          className="w-full md:w-96 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white appearance-none cursor-pointer"
        >
          {uniqueVendors.map(vendor => (
            <option key={vendor} value={vendor}>
              {vendor === 'All' ? 'All Vendors' : vendor}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <Table columns={columns} data={filtered} />
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Vendor Service' : 'Add Vendor Service'} size="lg">
        <form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Image</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                  <ImageIcon size={24} className="text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer"
                >
                  <Upload size={14} />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </label>
                <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, GIF up to 2MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <Input label="Vendor Name" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} required />
            <Input label="Service" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} required />
            <Input label="Subservice" value={form.subservice} onChange={e => setForm({ ...form, subservice: e.target.value })} required />
            <Input label="Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
            <Input label="Experience" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 5 years" required />
            <Input label="Vendor Email" type="email" value={form.vendorEmail} onChange={e => setForm({ ...form, vendorEmail: e.target.value })} />
            <Input label="Vendor Phone" value={form.vendorPhone} onChange={e => setForm({ ...form, vendorPhone: e.target.value })} />
            <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option>Pending</option><option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              rows={3} 
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400" 
              placeholder="Service description..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      {isViewModalOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Service Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Header with Image */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  {selected.image ? (
                    <img src={selected.image} alt={selected.service} className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                      {selected.vendor.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{selected.service}</h3>
                    <p className="text-sm text-gray-500">{selected.subservice}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-orange-600">₹{selected.price.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selected.status]}`}>
                        {selected.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vendor Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Briefcase size={14} className="text-orange-500" />
                    Vendor Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Vendor Name</label>
                      <p className="text-sm text-gray-900 font-medium">{selected.vendor}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Experience</label>
                      <p className="text-sm text-gray-900">{selected.experience}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selected.vendorEmail || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900">{selected.vendorPhone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Location</label>
                      <p className="text-sm text-gray-900">{selected.location || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Star size={14} className="text-orange-500" />
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Rating</label>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{selected.rating}</span>
                        <span className="text-xs text-gray-400">/5</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Total Bookings</label>
                      <p className="text-sm text-gray-900 font-semibold">{selected.totalBookings}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selected.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">About the Service</h4>
                    <p className="text-sm text-gray-600 pl-6">{selected.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                openEdit(selected);
              }}>
                Edit Service
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      <ConfirmModal 
        isOpen={isStatusModalOpen} 
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelected(null);
          setPendingStatus('');
        }} 
        onConfirm={confirmStatusChange} 
        title={pendingStatus === 'Active' ? 'Activate Service' : 'Deactivate Service'} 
        message={`Are you sure you want to ${pendingStatus === 'Active' ? 'activate' : 'deactivate'} service "${selected?.subservice}"?`} 
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
        title="Delete Vendor Service" 
        message={`Are you sure you want to delete service "${selected?.subservice}" by ${selected?.vendor}? This action cannot be undone.`} 
      />
    </div>
  );
}

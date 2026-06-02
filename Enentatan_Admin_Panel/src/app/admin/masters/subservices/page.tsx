'use client';

import { useState, useRef } from 'react';
import { Plus, Upload, X, Image as ImageIcon, ToggleLeft, ToggleRight, Edit, Trash2 } from 'lucide-react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface Subservice { 
  id: number; 
  service: string; 
  name: string; 
  image: string;
  status: string; 
}

const initialData: Subservice[] = [
  { id: 1, service: 'Wedding Photography', name: 'Indoor Photography', image: '', status: 'Active' },
  { id: 2, service: 'Wedding Photography', name: 'Outdoor Photography', image: '', status: 'Active' },
  { id: 3, service: 'Catering Services', name: 'Veg Catering', image: '', status: 'Active' },
  { id: 4, service: 'Catering Services', name: 'Non-Veg Catering', image: '', status: 'Inactive' },
];

const services = ['Wedding Photography', 'Catering Services', 'DJ & Music', 'Decoration', 'Venue', 'Makeup & Beauty'];

export default function SubservicesPage() {
  const [items, setItems] = useState<Subservice[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selected, setSelected] = useState<Subservice | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [form, setForm] = useState<Partial<Subservice>>({ 
    service: services[0], 
    name: '', 
    image: '', 
    status: 'Active' 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openStatusModal = (item: Subservice) => {
    setSelected(item);
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selected && pendingStatus) {
      setItems(items.map(i => 
        i.id === selected.id ? { ...i, status: pendingStatus } : i
      ));
      toast.success(`Subservice ${pendingStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus('');
    }
  };

  const openEdit = (item: Subservice) => {
    setSelected(item);
    setForm(item);
    setImagePreview(item.image || '');
    setIsModalOpen(true);
  };

  const openDelete = (item: Subservice) => {
    setSelected(item);
    setIsDeleteOpen(true);
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'service', label: 'Service' },
    { key: 'name', label: 'Sub-service' },
    { 
      key: 'image', 
      label: 'Image', 
      render: (v: string) => v ? (
        <img src={v} alt="subservice" className="w-10 h-10 rounded-lg object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <ImageIcon size={16} className="text-gray-400" />
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v: string, row: Subservice) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            v === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {v}
          </span>
          <button
            onClick={() => openStatusModal(row)}
            className="text-gray-500 hover:text-orange-600 transition-colors"
            title={v === 'Active' ? 'Deactivate' : 'Activate'}
          >
            {v === 'Active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Subservice) => (
        <div className="flex items-center gap-1">
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
    setForm({ service: services[0], name: '', image: '', status: 'Active' }); 
    setImagePreview('');
    setIsModalOpen(true); 
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.service || !form.name) {
      toast.error('Please fill all required fields');
      return;
    }

    if (selected) {
      setItems(items.map(i => i.id === selected.id ? { ...i, ...form } as Subservice : i));
      toast.success('Subservice updated successfully!');
    } else {
      const newItem: Subservice = { 
        id: items.length + 1, 
        service: form.service ?? '', 
        name: form.name ?? '', 
        image: form.image || '',
        status: form.status ?? 'Active'
      };
      setItems([...items, newItem]);
      toast.success('Subservice added successfully!');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Subservices Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} subservices</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={15} />
          Add Subservice
        </Button>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Table 
          columns={columns} 
          data={items}
        />
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Subservice' : 'Add Subservice'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Service Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Service</label>
            <select 
              value={form.service} 
              onChange={e => setForm({ ...form, service: e.target.value })} 
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {services.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          
          {/* Subservice Name */}
          <Input 
            label="Subservice Name" 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            required 
          />
          
          {/* Image Upload Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subservice Image</label>
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
          
          {/* Status Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select 
              value={form.status} 
              onChange={e => setForm({ ...form, status: e.target.value })} 
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Status Change Confirmation Modal */}
      <ConfirmModal 
        isOpen={isStatusModalOpen} 
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelected(null);
          setPendingStatus('');
        }} 
        onConfirm={confirmStatusChange} 
        title={pendingStatus === 'Active' ? 'Activate Subservice' : 'Deactivate Subservice'} 
        message={`Are you sure you want to ${pendingStatus === 'Active' ? 'activate' : 'deactivate'} subservice "${selected?.name}"?`} 
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={() => { 
          if (selected) { 
            setItems(items.filter(i => i.id !== selected.id)); 
            toast.success('Subservice deleted successfully!'); 
          } 
          setIsDeleteOpen(false); 
        }} 
        title="Delete Subservice" 
        message={`Are you sure you want to delete subservice "${selected?.name}"? This action cannot be undone.`} 
      />
    </div>
  );
}
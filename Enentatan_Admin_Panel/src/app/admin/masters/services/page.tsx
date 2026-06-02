'use client';

import { useEffect, useState } from 'react';
import { Edit, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import Button from '@/components/admin/Button';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Input from '@/components/admin/Input';
import Modal from '@/components/admin/Modal';
import Table from '@/components/admin/Table';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface Vendor { id: string; companyName: string; contactPerson: string; }
interface Category { id: string; name: string; slug: string; }
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
  status: 'ACTIVE' | 'INACTIVE' | string;
  vendor_name?: string;
}

const emptyForm = {
  vendorId: '',
  categoryId: '',
  title: '',
  description: '',
  city: '',
  amount: '',
  currency: 'AED',
  imageUrl: '',
  status: 'ACTIVE',
};

export default function ServicesPage() {
  const [services, setServices] = useState<VendorService[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<VendorService | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = async () => {
    const [svc, ven, cat] = await Promise.allSettled([
      adminApi.services.list(),
      adminApi.vendors.list(),
      adminApi.categories.list(),
    ]);

    if (svc.status === 'fulfilled') setServices(svc.value);
    else toast.error('Failed to load services');

    if (ven.status === 'fulfilled') setVendors(ven.value);
    else toast.error('Failed to load vendors');

    if (cat.status === 'fulfilled') setCategories(cat.value);
    else toast.error('Failed to load categories');
  };

  useEffect(() => { void load(); }, []);

  const vendorName = (id: string) => vendors.find(v => v.id === id)?.companyName ?? '-';
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? '-';

  const columns: Column[] = [
    { key: 'image_url', label: 'Image', render: (v: string) => v ? <img src={v} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon size={16} className="text-gray-400" /></div> },
    { key: 'title', label: 'Service' },
    { key: 'vendorId', label: 'Vendor', render: (v: string) => vendorName(v) },
    { key: 'categoryId', label: 'Category', render: (v: string) => categoryName(v) },
    { key: 'city', label: 'City' },
    { key: 'price', label: 'Price', render: (_: unknown, row: VendorService) => `${row.price?.amount ?? 0} ${row.price?.currency ?? 'AED'}` },
    { key: 'status', label: 'Status', render: (v: string, row: VendorService) => <button onClick={async () => { await adminApi.services.update(row.id, { status: v === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }); await load(); }} className={`px-2.5 py-1 rounded-full text-xs font-medium ${v === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{v}</button> },
    { key: 'actions', label: 'Actions', render: (_: unknown, row: VendorService) => <div className="flex gap-1"><button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50"><Edit size={14} /></button><button onClick={() => { setSelected(row); setDeleteOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button></div> },
  ];

  const openAdd = () => {
    setSelected(null);
    setForm({ ...emptyForm, vendorId: vendors[0]?.id ?? '', categoryId: categories[0]?.id ?? '' });
    setModalOpen(true);
  };

  const openEdit = (service: VendorService) => {
    setSelected(service);
    setForm({
      vendorId: service.vendorId,
      categoryId: service.categoryId,
      title: service.title,
      description: service.description,
      city: service.city,
      amount: String(service.price?.amount ?? ''),
      currency: service.price?.currency ?? 'AED',
      imageUrl: service.image_url ?? '',
      status: service.status,
    });
    setModalOpen(true);
  };

  const upload = async (file?: File) => {
    if (!file) return;
    const result = await adminApi.uploads.image(file, 'services');
    setForm(prev => ({ ...prev, imageUrl: result.url }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendorId || !form.categoryId || !form.title || !form.city || !form.amount) return toast.error('Please fill all required fields');
    const payload = {
      vendorId: form.vendorId,
      categoryId: form.categoryId,
      title: form.title,
      description: form.description || form.title,
      city: form.city,
      price: { amount: Number(form.amount), currency: form.currency },
      imageUrl: form.imageUrl,
      status: form.status,
    };
    if (selected) await adminApi.services.update(selected.id, payload);
    else await adminApi.services.create(payload);
    toast.success(selected ? 'Service updated' : 'Service created');
    setModalOpen(false);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-bold text-gray-900">Vendor Services</h1><p className="text-sm text-gray-500 mt-0.5">{services.length} vendor services</p></div><Button onClick={openAdd}><Plus size={15} />Add Service</Button></div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm"><Table columns={columns} data={services} /></div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Edit Vendor Service' : 'Add Vendor Service'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <select value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50" required>
            <option value="">Select vendor</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName} ({v.contactPerson})</option>)}
          </select>
          <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50" required>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
          <Input label="Price" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 min-h-24" />
          <input type="file" accept="image/*" onChange={e => upload(e.target.files?.[0])} className="text-sm" />
          {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover" />}
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50"><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select>
          <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
      </Modal>
      <ConfirmModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={async () => { if (selected) await adminApi.services.delete(selected.id); setDeleteOpen(false); await load(); toast.success('Service deleted'); }} title="Delete Service" message={`Delete "${selected?.title}"?`} />
    </div>
  );
}

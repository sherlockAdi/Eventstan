'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, Loader2, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/adminApi';
import Button from '@/components/admin/Button';
import Modal from '@/components/admin/Modal';
import Pagination from '@/components/admin/Pagination';
import Table from '@/components/admin/Table';
import { Column } from '@/lib/types';

interface Review {
  id: string; reviewer_name: string; rating: number; comment: string; event_type: string;
  location: string; created_at: string; status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
}

export default function FeedbackPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Review | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const load = async () => {
    setLoading(true);
    try { setItems(await adminApi.reviews.list()); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to load reviews'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => filter ? items.filter((item) => item.status === filter) : items, [items, filter]);
  const moderate = async (review: Review, approve: boolean) => {
    try {
      await (approve ? adminApi.reviews.approve(review.id) : adminApi.reviews.reject(review.id));
      toast.success(approve ? 'Review published' : 'Review rejected');
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Moderation failed'); }
  };
  const columns: Column[] = [
    { key: 'reviewer_name', label: 'Customer' },
    { key: 'rating', label: 'Rating', render: (value: number) => <span className="flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400" />{value}</span> },
    { key: 'event_type', label: 'Service' },
    { key: 'comment', label: 'Comment', render: (value: string) => value.length > 55 ? `${value.slice(0, 55)}...` : value },
    { key: 'status', label: 'Status', render: (value: string) => <span className={`rounded-full px-2.5 py-1 text-xs ${value === 'PUBLISHED' ? 'bg-green-100 text-green-700' : value === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{value}</span> },
    { key: 'created_at', label: 'Date', render: (value: string) => new Date(value).toLocaleDateString() },
    { key: 'actions', label: 'Actions', render: (_: unknown, row: Review) => <div className="flex gap-2">
      <button onClick={() => setSelected(row)} className="text-blue-500"><Eye size={15} /></button>
      {row.status === 'PENDING' && <><button onClick={() => void moderate(row, true)} className="text-green-600"><Check size={16} /></button><button onClick={() => void moderate(row, false)} className="text-red-500"><X size={16} /></button></>}
    </div> },
  ];
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h1 className="text-xl font-bold">Feedback & Testimonials</h1><p className="text-sm text-gray-500">{items.length} customer reviews</p></div>
      <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="rounded-xl border px-3 py-2 text-sm"><option value="">All statuses</option><option>PENDING</option><option>PUBLISHED</option><option>REJECTED</option></select>
    </div>
    <div className="rounded-2xl border bg-white shadow-sm">{loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div> : <Table columns={columns} data={paged} />}
      <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(filtered.length / perPage))} totalItems={filtered.length} itemsPerPage={perPage} onPageChange={setPage} /></div>
    <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Review Details">{selected && <div className="space-y-3 text-sm"><p className="font-semibold">{selected.reviewer_name}</p><p>{selected.event_type} · {selected.location}</p><p className="rounded-xl bg-gray-50 p-4">{selected.comment}</p><div className="flex justify-end gap-2">{selected.status === 'PENDING' && <><Button onClick={() => void moderate(selected, true)}>Approve</Button><Button variant="secondary" onClick={() => void moderate(selected, false)}>Reject</Button></>}</div></div>}</Modal>
  </div>;
}

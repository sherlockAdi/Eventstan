'use client';

import { useState } from 'react';
import { Star, Eye, Edit, Trash2, Plus, X, User, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Mail, Building } from 'lucide-react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import Pagination from '@/components/admin/Pagination';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface Feedback { 
  id: number; 
  user: string; 
  rating: number; 
  comment: string; 
  status: string; 
  date: string;
  userEmail?: string;
  serviceName?: string;
  vendorName?: string;
}

const initialFeedbackData: Feedback[] = [
  { 
    id: 1, 
    user: 'Rahul Sharma', 
    rating: 5, 
    comment: 'Amazing experience! The wedding planning was flawless. Highly recommend their services.', 
    status: 'Approved', 
    date: '2024-03-10',
    userEmail: 'rahul.sharma@example.com',
    serviceName: 'Wedding Planning',
    vendorName: 'Dream Wedding Planners'
  },
  { 
    id: 2, 
    user: 'Priya Patel', 
    rating: 4, 
    comment: 'Great catering service. Food was delicious and presentation was excellent.', 
    status: 'Approved', 
    date: '2024-03-05',
    userEmail: 'priya.patel@example.com',
    serviceName: 'Catering Services',
    vendorName: 'Royal Caterers'
  },
  { 
    id: 3, 
    user: 'Amit Kumar', 
    rating: 5, 
    comment: 'Professional photography team. Captured all our special moments perfectly.', 
    status: 'Pending', 
    date: '2024-02-28',
    userEmail: 'amit.kumar@example.com',
    serviceName: 'Photography',
    vendorName: 'Magic Moments Photography'
  },
  { 
    id: 4, 
    user: 'Neha Gupta', 
    rating: 3, 
    comment: 'Decoration was good but could have been better. Some flowers were not fresh.', 
    status: 'Pending', 
    date: '2024-02-20',
    userEmail: 'neha.gupta@example.com',
    serviceName: 'Decoration',
    vendorName: 'Grand Decorators'
  },
  { 
    id: 5, 
    user: 'Vikram Singh', 
    rating: 4, 
    comment: 'DJ was amazing! Kept the crowd entertained all night.', 
    status: 'Approved', 
    date: '2024-02-15',
    userEmail: 'vikram.singh@example.com',
    serviceName: 'Music & Entertainment',
    vendorName: 'Rhythm Beats DJ'
  },
];

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbackData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState<Partial<Feedback>>({
    user: '',
    rating: 5,
    comment: '',
    status: 'Pending',
    userEmail: '',
    serviceName: '',
    vendorName: ''
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={13} className={i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );

  const openView = (feedback: Feedback) => {
    setSelected(feedback);
    setIsViewModalOpen(true);
  };

  const openEdit = (feedback: Feedback) => {
    setSelected(feedback);
    setForm(feedback);
    setIsEditModalOpen(true);
  };

  const openDelete = (feedback: Feedback) => {
    setSelected(feedback);
    setIsDeleteOpen(true);
  };

  const approveFeedback = (feedback: Feedback) => {
    setFeedbacks(feedbacks.map(f => f.id === feedback.id ? { ...f, status: 'Approved' } : f));
    toast.success('Feedback approved and published successfully!');
  };

  const rejectFeedback = (feedback: Feedback) => {
    setFeedbacks(feedbacks.filter(f => f.id !== feedback.id));
    toast.success('Feedback rejected and removed!');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user || !form.comment) {
      toast.error('Please fill all required fields');
      return;
    }
    const newFeedback: Feedback = {
      id: feedbacks.length + 1,
      user: form.user ?? '',
      rating: form.rating ?? 5,
      comment: form.comment ?? '',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      userEmail: form.userEmail || '',
      serviceName: form.serviceName || '',
      vendorName: form.vendorName || ''
    };
    setFeedbacks([...feedbacks, newFeedback]);
    toast.success('Feedback added successfully!');
    setIsAddModalOpen(false);
    setForm({ user: '', rating: 5, comment: '', status: 'Pending', userEmail: '', serviceName: '', vendorName: '' });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected && form) {
      setFeedbacks(feedbacks.map(f => f.id === selected.id ? { ...f, ...form } as Feedback : f));
      toast.success('Feedback updated successfully!');
      setIsEditModalOpen(false);
    }
  };

  const confirmDelete = () => {
    if (selected) {
      setFeedbacks(feedbacks.filter(f => f.id !== selected.id));
      toast.success('Feedback deleted successfully!');
    }
    setIsDeleteOpen(false);
  };

  const filtered = statusFilter === 'All' 
    ? feedbacks 
    : feedbacks.filter(f => f.status === statusFilter);

  const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'user', label: 'User' },
    { key: 'rating', label: 'Rating', render: (v: number) => <StarRating rating={v} /> },
    { key: 'comment', label: 'Comment', render: (v: string) => v.length > 50 ? `${v.substring(0, 50)}...` : v },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${v === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {v}
        </span>
      )
    },
    { key: 'date', label: 'Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Feedback) => (
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

  const approvedCount = feedbacks.filter(f => f.status === 'Approved').length;
  const pendingCount = feedbacks.filter(f => f.status === 'Pending').length;
  
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Feedback & Testimonial Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {feedbacks.length} total feedback · {approvedCount} approved · {pendingCount} pending
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option>All</option>
            <option>Approved</option>
            <option>Pending</option>
          </select>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={15} />
            Add Feedback
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Table columns={columns} data={paginatedData} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Feedback" size="lg">
        <form onSubmit={handleAdd}>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="User Name" 
              value={form.user} 
              onChange={e => setForm({ ...form, user: e.target.value })} 
              required 
            />
            <Input 
              label="User Email" 
              type="email" 
              value={form.userEmail} 
              onChange={e => setForm({ ...form, userEmail: e.target.value })} 
            />
            <Input 
              label="Service Name" 
              value={form.serviceName} 
              onChange={e => setForm({ ...form, serviceName: e.target.value })} 
            />
            <Input 
              label="Vendor Name" 
              value={form.vendorName} 
              onChange={e => setForm({ ...form, vendorName: e.target.value })} 
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, rating: r })}
                    className="focus:outline-none"
                  >
                    <Star size={24} className={r <= (form.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm({ ...form, status: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Pending</option>
                <option>Approved</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
            <textarea 
              value={form.comment} 
              onChange={e => setForm({ ...form, comment: e.target.value })} 
              rows={4} 
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400" 
              placeholder="Write feedback comment..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Feedback</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Feedback" size="lg">
        <form onSubmit={handleEdit}>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="User Name" 
              value={form.user} 
              onChange={e => setForm({ ...form, user: e.target.value })} 
              required 
            />
            <Input 
              label="User Email" 
              type="email" 
              value={form.userEmail} 
              onChange={e => setForm({ ...form, userEmail: e.target.value })} 
            />
            <Input 
              label="Service Name" 
              value={form.serviceName} 
              onChange={e => setForm({ ...form, serviceName: e.target.value })} 
            />
            <Input 
              label="Vendor Name" 
              value={form.vendorName} 
              onChange={e => setForm({ ...form, vendorName: e.target.value })} 
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, rating: r })}
                    className="focus:outline-none"
                  >
                    <Star size={24} className={r <= (form.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm({ ...form, status: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Pending</option>
                <option>Approved</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
            <textarea 
              value={form.comment} 
              onChange={e => setForm({ ...form, comment: e.target.value })} 
              rows={4} 
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400" 
              placeholder="Write feedback comment..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {isViewModalOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Feedback Details</h2>
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selected.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{selected.user}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={selected.rating} />
                      <span className="text-sm text-gray-500">({selected.rating}/5)</span>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selected.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {selected.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User size={14} className="text-orange-500" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Name</label>
                      <p className="text-sm text-gray-900 font-medium">{selected.user}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selected.userEmail || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Feedback Date</label>
                      <p className="text-sm text-gray-900">{selected.date}</p>
                    </div>
                  </div>
                </div>

                {(selected.serviceName || selected.vendorName) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Building size={14} className="text-orange-500" />
                      Service Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      {selected.serviceName && (
                        <div>
                          <label className="text-xs text-gray-500">Service</label>
                          <p className="text-sm text-gray-900">{selected.serviceName}</p>
                        </div>
                      )}
                      {selected.vendorName && (
                        <div>
                          <label className="text-xs text-gray-500">Vendor</label>
                          <p className="text-sm text-gray-900">{selected.vendorName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MessageSquare size={14} className="text-orange-500" />
                    Feedback Comment
                  </h4>
                  <div className="pl-6">
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {selected.comment}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {selected.status === 'Pending' && (
                <>
                  <Button variant="danger" onClick={() => {
                    rejectFeedback(selected);
                    setIsViewModalOpen(false);
                  }}>
                    <ThumbsDown size={14} />
                    Reject
                  </Button>
                  <Button onClick={() => {
                    approveFeedback(selected);
                    setIsViewModalOpen(false);
                  }}>
                    <ThumbsUp size={14} />
                    Approve & Publish
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
        title="Delete Feedback" 
        message={`Are you sure you want to delete feedback from "${selected?.user}"? This action cannot be undone.`} 
      />
    </div>
  );
}
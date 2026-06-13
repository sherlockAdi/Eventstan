'use client';

import { useState } from 'react';
import { Plus, CheckCircle, Info, AlertTriangle, Bell, Eye, Edit, Trash2, ToggleLeft, ToggleRight, X, Mail, Calendar, Tag } from 'lucide-react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import Pagination from '@/components/admin/Pagination';
import { notificationsData } from '@/lib/dummyData';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface Notification { 
  id: number; 
  title: string; 
  message: string; 
  type: string; 
  read: boolean; 
  date: string;
  status?: string;
  recipient?: string;
  priority?: string;
}

const extendedNotificationsData: Notification[] = [
  { id: 1, title: 'Welcome to EventStan', message: 'Thank you for joining EventStan! Start exploring amazing services.', type: 'success', read: false, date: '2024-03-15', status: 'Active', recipient: 'All Users', priority: 'High' },
  { id: 2, title: 'New Vendor Registration', message: 'A new vendor has registered and needs approval.', type: 'info', read: false, date: '2024-03-14', status: 'Active', recipient: 'Admins', priority: 'Medium' },
  { id: 3, title: 'Payment Received', message: 'Payment of ₹50,000 received for booking #BK-1001.', type: 'success', read: true, date: '2024-03-13', status: 'Active', recipient: 'Vendor', priority: 'High' },
  { id: 4, title: 'Booking Cancelled', message: 'Booking #BK-1005 has been cancelled by the customer.', type: 'warning', read: false, date: '2024-03-12', status: 'Inactive', recipient: 'Vendor', priority: 'High' },
  { id: 5, title: 'System Maintenance', message: 'System will be under maintenance on March 20th, 2 AM to 4 AM.', type: 'info', read: true, date: '2024-03-11', status: 'Active', recipient: 'All Users', priority: 'Low' },
];

const TypeIcon = ({ type }: { type: string }) => {
  if (type === 'success') return <CheckCircle size={16} className="text-green-500" />;
  if (type === 'warning') return <AlertTriangle size={16} className="text-yellow-500" />;
  if (type === 'info') return <Info size={16} className="text-blue-500" />;
  return <Bell size={16} className="text-gray-400" />;
};

export default function SystemNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(extendedNotificationsData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [form, setForm] = useState({ 
    title: '', 
    message: '', 
    type: 'info',
    status: 'Active',
    recipient: 'All Users',
    priority: 'Medium'
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const openStatusModal = (notification: Notification) => {
    setSelected(notification);
    const newStatus = notification.status === 'Active' ? 'Inactive' : 'Active';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selected && pendingStatus) {
      setNotifications(notifications.map(n => 
        n.id === selected.id ? { ...n, status: pendingStatus } : n
      ));
      toast.success(`Notification ${pendingStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus('');
    }
  };

  const openView = (notification: Notification) => {
    setSelected(notification);
    setIsViewModalOpen(true);
  };

  const openEdit = (notification: Notification) => {
    setSelected(notification);
    setForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      status: notification.status || 'Active',
      recipient: notification.recipient || 'All Users',
      priority: notification.priority || 'Medium'
    });
    setIsEditModalOpen(true);
  };

  const openDelete = (notification: Notification) => {
    setSelected(notification);
    setIsDeleteOpen(true);
  };

  const markAsRead = (notification: Notification) => {
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    toast.success('Marked as read');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }
    const newNotification: Notification = {
      id: notifications.length + 1,
      title: form.title,
      message: form.message,
      type: form.type,
      read: false,
      date: new Date().toISOString().split('T')[0],
      status: form.status,
      recipient: form.recipient,
      priority: form.priority
    };
    setNotifications([newNotification, ...notifications]);
    toast.success('Notification sent successfully!');
    setIsAddModalOpen(false);
    setForm({ title: '', message: '', type: 'info', status: 'Active', recipient: 'All Users', priority: 'Medium' });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      setNotifications(notifications.map(n => 
        n.id === selected.id ? { 
          ...n, 
          title: form.title,
          message: form.message,
          type: form.type,
          status: form.status,
          recipient: form.recipient,
          priority: form.priority
        } : n
      ));
      toast.success('Notification updated successfully!');
      setIsEditModalOpen(false);
    }
  };

  const confirmDelete = () => {
    if (selected) {
      setNotifications(notifications.filter(n => n.id !== selected.id));
      toast.success('Notification deleted successfully!');
    }
    setIsDeleteOpen(false);
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'type', label: '', render: (v: string) => <TypeIcon type={v} /> },
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message', render: (v: string) => v.length > 40 ? `${v.substring(0, 40)}...` : v },
    { 
      key: 'read', 
      label: 'Status', 
      render: (v: boolean, row: Notification) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${!v ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            {!v ? 'Unread' : 'Read'}
          </span>
          {!v && (
            <button
              onClick={() => markAsRead(row)}
              className="text-xs text-orange-500 hover:text-orange-600"
            >
              Mark read
            </button>
          )}
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Active Status', 
      render: (v: string, row: Notification) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${v === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {v || 'Active'}
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
    { key: 'date', label: 'Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Notification) => (
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

  const activeCount = notifications.filter(n => n.status === 'Active').length;
  const inactiveCount = notifications.filter(n => n.status === 'Inactive').length;
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const paginatedData = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">System Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {notifications.length} total · {unreadCount} unread · {activeCount} active · {inactiveCount} inactive
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={15} />
          Send Notification
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Table columns={columns} data={paginatedData} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={notifications.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Send New Notification" size="lg">
        <form onSubmit={handleAdd}>
          <Input 
            label="Title" 
            value={form.title} 
            onChange={e => setForm({ ...form, title: e.target.value })} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
              </select>
            </div>
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient</label>
              <select 
                value={form.recipient} 
                onChange={e => setForm({ ...form, recipient: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>All Users</option>
                <option>Customers</option>
                <option>Vendors</option>
                <option>Admins</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select 
                value={form.priority} 
                onChange={e => setForm({ ...form, priority: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea 
              value={form.message} 
              onChange={e => setForm({ ...form, message: e.target.value })} 
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400" 
              rows={4} 
              required 
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Send Notification</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Notification" size="lg">
        <form onSubmit={handleEdit}>
          <Input 
            label="Title" 
            value={form.title} 
            onChange={e => setForm({ ...form, title: e.target.value })} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
              </select>
            </div>
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient</label>
              <select 
                value={form.recipient} 
                onChange={e => setForm({ ...form, recipient: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>All Users</option>
                <option>Customers</option>
                <option>Vendors</option>
                <option>Admins</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select 
                value={form.priority} 
                onChange={e => setForm({ ...form, priority: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea 
              value={form.message} 
              onChange={e => setForm({ ...form, message: e.target.value })} 
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400" 
              rows={4} 
              required 
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {isViewModalOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Notification Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <TypeIcon type={selected.type} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{selected.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selected.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {selected.status || 'Active'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${!selected.read ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {!selected.read ? 'Unread' : 'Read'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-orange-500" />
                    Notification Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Type</label>
                      <p className="text-sm text-gray-900 capitalize">{selected.type}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Priority</label>
                      <p className="text-sm text-gray-900">{selected.priority || 'Medium'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Recipient</label>
                      <p className="text-sm text-gray-900">{selected.recipient || 'All Users'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Date</label>
                      <p className="text-sm text-gray-900">{selected.date}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Mail size={14} className="text-orange-500" />
                    Message Content
                  </h4>
                  <div className="pl-6">
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {selected.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {!selected.read && (
                <Button onClick={() => {
                  markAsRead(selected);
                  setIsViewModalOpen(false);
                }}>
                  Mark as Read
                </Button>
              )}
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
        title={pendingStatus === 'Active' ? 'Activate Notification' : 'Deactivate Notification'} 
        message={`Are you sure you want to ${pendingStatus === 'Active' ? 'activate' : 'deactivate'} notification "${selected?.title}"?`} 
      />

      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
        title="Delete Notification" 
        message={`Are you sure you want to delete notification "${selected?.title}"? This action cannot be undone.`} 
      />
    </div>
  );
}
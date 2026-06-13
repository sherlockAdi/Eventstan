'use client';

import { useState } from 'react';
import { Plus, Eye, ToggleLeft, ToggleRight, X, Mail, Shield, Calendar, Hash } from 'lucide-react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import Pagination from '@/components/admin/Pagination';
import { usersData } from '@/lib/dummyData';
import { User, Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface ExtendedUser extends User {
  loginMethod: string;
}

const updatedUsersData: ExtendedUser[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joined: '2024-01-15', loginMethod: 'Google' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', joined: '2024-02-20', loginMethod: 'Email' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Vendor', status: 'Inactive', joined: '2024-03-10', loginMethod: 'Facebook' },
  { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'User', status: 'Active', joined: '2024-04-05', loginMethod: 'Apple' },
  { id: 5, name: 'David Brown', email: 'david@example.com', role: 'Admin', status: 'Active', joined: '2024-05-12', loginMethod: 'Google' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>(updatedUsersData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selected, setSelected] = useState<ExtendedUser | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [form, setForm] = useState<Partial<ExtendedUser>>({ 
    name: '', 
    email: '', 
    role: 'User', 
    status: 'Active',
    loginMethod: 'Email'
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const openStatusModal = (user: ExtendedUser) => {
    setSelected(user);
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selected && pendingStatus) {
      setUsers(users.map(u => 
        u.id === selected.id ? { ...u, status: pendingStatus } : u
      ));
      toast.success(`User ${pendingStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus('');
    }
  };

  const openView = (user: ExtendedUser) => {
    setSelected(user);
    setIsViewModalOpen(true);
  };

  const getLoginMethodColor = (method: string) => {
    switch(method) {
      case 'Google': return 'bg-red-100 text-red-700';
      case 'Facebook': return 'bg-blue-100 text-blue-700';
      case 'Apple': return 'bg-gray-100 text-gray-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'loginMethod', 
      label: 'Login Method',
      render: (v: string) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getLoginMethodColor(v)}`}>
          <span className="w-4 h-4 flex items-center justify-center">
            {v === 'Google' && 'G'}
            {v === 'Facebook' && 'F'}
            {v === 'Apple' && 'A'}
            {v === 'Email' && '📧'}
          </span>
          {v}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v: string, row: ExtendedUser) => (
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
    { key: 'joined', label: 'Joined' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: ExtendedUser) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => openView(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all" 
            title="View Details"
          >
            <Eye size={14} />
          </button>
        </div>
      )
    }
  ];

  const openAdd = () => { 
    setSelected(null); 
    setForm({ 
      name: '', 
      email: '', 
      role: 'User', 
      status: 'Active',
      loginMethod: 'Email'
    }); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (u: ExtendedUser) => { 
    setSelected(u); 
    setForm(u); 
    setIsModalOpen(true); 
  };
  
  const openDelete = (u: ExtendedUser) => { 
    setSelected(u); 
    setIsDeleteOpen(true); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      setUsers(users.map(u => u.id === selected.id ? { ...u, ...form } as ExtendedUser : u));
      toast.success('User updated successfully!');
    } else {
      setUsers([...users, { 
        id: users.length + 1, 
        name: form.name ?? '', 
        email: form.email ?? '', 
        role: form.role ?? 'User', 
        status: form.status ?? 'Active', 
        joined: new Date().toISOString().split('T')[0],
        loginMethod: form.loginMethod ?? 'Email'
      }]);
      toast.success('User added successfully!');
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selected) { 
      setUsers(users.filter(u => u.id !== selected.id)); 
      toast.success('User deleted successfully!'); 
    }
    setIsDeleteOpen(false);
  };

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedData = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} total users · {users.filter(u => u.status === 'Active').length} active
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={15} />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Table columns={columns} data={paginatedData} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={users.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-0">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Login Method</label>
            <select 
              value={form.loginMethod} 
              onChange={e => setForm({ ...form, loginMethod: e.target.value })} 
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="Email">Email</option>
              <option value="Google">Google</option>
              <option value="Facebook">Facebook</option>
              <option value="Apple">Apple</option>
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
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {isViewModalOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      selected.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selected.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Mail size={12} /> Email Address
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{selected.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Shield size={12} /> Login Method
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getLoginMethodColor(selected.loginMethod)}`}>
                        {selected.loginMethod}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={12} /> Joined Date
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{selected.joined}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Hash size={12} /> User ID
                    </label>
                    <p className="text-sm font-mono text-gray-900 mt-1">#{selected.id}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                openEdit(selected);
              }}>
                Edit User
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
        title={pendingStatus === 'Active' ? 'Activate User' : 'Deactivate User'} 
        message={`Are you sure you want to ${pendingStatus === 'Active' ? 'activate' : 'deactivate'} user "${selected?.name}"?`} 
      />

      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
        title="Delete User" 
        message={`Are you sure you want to delete user "${selected?.name}"? This action cannot be undone.`} 
      />
    </div>
  );
}
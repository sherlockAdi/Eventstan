'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Shield, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import Table from '@/components/admin/Table';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import Pagination from '@/components/admin/Pagination';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface Permission { module: string; view: boolean; create: boolean; edit: boolean; delete: boolean; }
interface Role { id: number; name: string; description: string; usersCount: number; status: string; permissions: Permission[]; }

const modules = ['Dashboard', 'Users', 'Vendors', 'Vendor Services', 'Bookings', 'Masters', 'Coupons', 'Marketing Packages', 'Feedback', 'Notifications', 'Affiliate Links', 'Reports'];

const defaultPerms = (): Permission[] => modules.map(m => ({ module: m, view: false, create: false, edit: false, delete: false }));

const initialRoles: Role[] = [
  {
    id: 1, name: 'Super Admin', description: 'Full system access', usersCount: 2, status: 'Active',
    permissions: modules.map(m => ({ module: m, view: true, create: true, edit: true, delete: true })),
  },
  {
    id: 2, name: 'Manager', description: 'Manage vendors, bookings, users', usersCount: 5, status: 'Active',
    permissions: modules.map(m => ({ module: m, view: true, create: m !== 'Reports', edit: m !== 'Reports', delete: false })),
  },
  {
    id: 3, name: 'Support', description: 'View only access', usersCount: 8, status: 'Active',
    permissions: modules.map(m => ({ module: m, view: true, create: false, edit: false, delete: false })),
  },
  {
    id: 4, name: 'Vendor', description: 'Vendor panel access', usersCount: 12, status: 'Inactive',
    permissions: modules.map(m => ({ module: m, view: m === 'Dashboard' || m === 'Bookings', create: m === 'Bookings', edit: false, delete: false })),
  },
];

export default function RolePermissionPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>('');

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const openStatusModal = (role: Role) => {
    setSelected(role);
    const newStatus = role.status === 'Active' ? 'Inactive' : 'Active';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selected && pendingStatus) {
      setRoles(roles.map(r => 
        r.id === selected.id ? { ...r, status: pendingStatus } : r
      ));
      toast.success(`Role ${pendingStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus('');
    }
  };

  const openDelete = (role: Role) => {
    if (role.name === 'Super Admin') {
      toast.error('Cannot delete Super Admin role!');
      return;
    }
    setSelected(role);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (selected) {
      setRoles(roles.filter(r => r.id !== selected.id));
      toast.success('Role deleted successfully!');
    }
    setIsDeleteOpen(false);
  };

  const getPermissionSummary = (permissions: Permission[]) => {
    const count = permissions.filter(p => p.view).length;
    const modulesList = permissions.filter(p => p.view).slice(0, 3).map(p => p.module);
    return { count, modulesList };
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { 
      key: 'name', 
      label: 'Role Name', 
      render: (v: string, row: Role) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Shield size={14} className="text-orange-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{v}</div>
            <div className="text-xs text-gray-400">{row.usersCount} users</div>
          </div>
        </div>
      )
    },
    { key: 'description', label: 'Description', render: (v: string) => <span className="text-gray-600 text-sm">{v}</span> },
    { 
      key: 'permissions', 
      label: 'Permissions', 
      render: (_: any, row: Role) => {
        const { count, modulesList } = getPermissionSummary(row.permissions);
        return (
          <div className="flex flex-wrap gap-1">
            {modulesList.map(module => (
              <span key={module} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {module}
              </span>
            ))}
            {count > 3 && (
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded">
                +{count - 3} more
              </span>
            )}
          </div>
        );
      }
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v: string, row: Role) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            v === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {v}
          </span>
          {row.name !== 'Super Admin' && (
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
      render: (_: any, row: Role) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/role-permission/edit/${row.id}`}>
            <button 
              className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all" 
              title="Edit"
            >
              <Edit size={14} />
            </button>
          </Link>
          {row.name !== 'Super Admin' && (
            <button 
              onClick={() => openDelete(row)} 
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" 
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  const activeRoles = roles.filter(r => r.status === 'Active').length;
  const totalUsers = roles.reduce((sum, r) => sum + r.usersCount, 0);
  
  const totalPages = Math.ceil(roles.length / ITEMS_PER_PAGE);
  const paginatedData = roles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Role & Permission Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {roles.length} roles · {activeRoles} active · {totalUsers} total users
          </p>
        </div>
        <Link href="/admin/role-permission/add">
          <Button>
            <Plus size={15} />
            Add Role
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Shield size={20} className="text-purple-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Roles</p>
              <p className="text-2xl font-bold text-green-600">{activeRoles}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Shield size={20} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive Roles</p>
              <p className="text-2xl font-bold text-red-600">{roles.length - activeRoles}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Shield size={20} className="text-red-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-orange-600">{totalUsers}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Shield size={20} className="text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <Table columns={columns} data={paginatedData} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={roles.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <ConfirmModal 
        isOpen={isStatusModalOpen} 
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelected(null);
          setPendingStatus('');
        }} 
        onConfirm={confirmStatusChange} 
        title={pendingStatus === 'Active' ? 'Activate Role' : 'Deactivate Role'} 
        message={`Are you sure you want to ${pendingStatus === 'Active' ? 'activate' : 'deactivate'} role "${selected?.name}"?`} 
      />

      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDelete} 
        title="Delete Role" 
        message={`Are you sure you want to delete role "${selected?.name}"? This action cannot be undone.`} 
      />
    </div>
  );
}
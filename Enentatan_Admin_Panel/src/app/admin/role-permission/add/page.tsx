'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import toast from 'react-hot-toast';

interface Permission { module: string; view: boolean; create: boolean; edit: boolean; delete: boolean; }

const modules = ['Dashboard', 'Users', 'Vendors', 'Vendor Services', 'Bookings', 'Masters', 'Coupons', 'Marketing Packages', 'Feedback', 'Notifications', 'Affiliate Links', 'Reports'];

const defaultPerms = (): Permission[] => modules.map(m => ({ module: m, view: false, create: false, edit: false, delete: false }));

export default function AddRolePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'Active'
  });
  const [perms, setPerms] = useState<Permission[]>(defaultPerms());

  const togglePerm = (module: string, key: keyof Permission) => {
    setPerms(perms.map(p => p.module === module ? { ...p, [key]: !p[key] } : p));
  };

  const toggleAll = (key: keyof Permission, value: boolean) => {
    setPerms(perms.map(p => ({ ...p, [key]: value })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Please enter role name');
      return;
    }
    
    // Save logic here - API call
    toast.success('Role created successfully!');
    router.push('/admin/role-permission');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/role-permission">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add New Role</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a new role and assign permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Side - Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Role Name" 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. Editor, Moderator"
              required 
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                rows={4} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400" 
                placeholder="Describe what this role can do..."
              />
            </div>
            
            <div>
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
            
            <div className="flex justify-end gap-3 pt-4">
              <Link href="/admin/role-permission">
                <Button type="button" variant="secondary">Cancel</Button>
              </Link>
              <Button type="submit">
                <Save size={15} />
                Create Role
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side - Permissions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">Module Permissions</label>
            <div className="flex gap-2">
              {(['view', 'create', 'edit', 'delete'] as const).map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleAll(k, true)}
                  className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded hover:bg-orange-100 transition capitalize"
                >
                  All {k}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPerms(defaultPerms())}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold text-xs uppercase">Module</th>
                  {(['view', 'create', 'edit', 'delete'] as const).map(k => (
                    <th key={k} className="px-3 py-3 text-gray-600 font-semibold text-xs uppercase capitalize">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {perms.map(p => (
                  <tr key={p.module} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{p.module}</td>
                    {(['view', 'create', 'edit', 'delete'] as const).map(k => (
                      <td key={k} className="px-3 py-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={p[k] as boolean} 
                          onChange={() => togglePerm(p.module, k)} 
                          className="accent-orange-500 w-4 h-4 cursor-pointer" 
                        />
                       </td>
                    ))}
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-gray-400 text-center">
            ✅ Select permissions for each module
          </div>
        </div>
      </div>
    </div>
  );
}
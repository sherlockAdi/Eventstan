'use client';

import { useState } from 'react';
import { Eye, Edit, X, Mail, Shield, Calendar, Hash, Smartphone, MapPin, Globe } from 'lucide-react';
import Table from '@/components/admin/Table';
import Button from '@/components/admin/Button';
import Pagination from '@/components/admin/Pagination';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface UserLead {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  source: string;
  interestedService: string;
  submittedAt: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Lost';
  notes?: string;
}

const userLeadsData: UserLead[] = [
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '+1 (555) 123-4567',
    country: 'United States',
    state: 'California',
    city: 'Los Angeles',
    source: 'Website Form',
    interestedService: 'Event Planning',
    submittedAt: '2024-01-15',
    status: 'New',
    notes: 'Interested in corporate event planning'
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '+1 (555) 234-5678',
    country: 'Canada',
    state: 'Ontario',
    city: 'Toronto',
    source: 'Landing Page',
    interestedService: 'Wedding Decoration',
    submittedAt: '2024-02-20',
    status: 'Contacted',
    notes: 'Follow up next week'
  },
  { 
    id: 3, 
    name: 'Mike Johnson', 
    email: 'mike@example.com', 
    phone: '+1 (555) 345-6789',
    country: 'United Kingdom',
    state: 'England',
    city: 'London',
    source: 'Referral',
    interestedService: 'Catering Services',
    submittedAt: '2024-03-10',
    status: 'Converted',
    notes: 'Already booked'
  },
  { 
    id: 4, 
    name: 'Sarah Williams', 
    email: 'sarah@example.com', 
    phone: '+1 (555) 456-7890',
    country: 'Australia',
    state: 'New South Wales',
    city: 'Sydney',
    source: 'Social Media',
    interestedService: 'Photography',
    submittedAt: '2024-04-05',
    status: 'Lost',
    notes: 'Went with competitor'
  },
  { 
    id: 5, 
    name: 'David Brown', 
    email: 'david@example.com', 
    phone: '+1 (555) 567-8901',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    source: 'Google Ads',
    interestedService: 'Venue Booking',
    submittedAt: '2024-05-12',
    status: 'New',
    notes: 'Looking for beach venue'
  },
  { 
    id: 6, 
    name: 'Emily Davis', 
    email: 'emily@example.com', 
    phone: '+1 (555) 678-9012',
    country: 'Germany',
    state: 'Berlin',
    city: 'Berlin',
    source: 'Email Campaign',
    interestedService: 'Event Staff',
    submittedAt: '2024-05-18',
    status: 'Contacted',
    notes: 'Requested quote'
  },
  { 
    id: 7, 
    name: 'Robert Wilson', 
    email: 'robert@example.com', 
    phone: '+1 (555) 789-0123',
    country: 'France',
    state: 'Île-de-France',
    city: 'Paris',
    source: 'Partnership',
    interestedService: 'Sound System',
    submittedAt: '2024-05-25',
    status: 'New',
    notes: 'Large event planned'
  },
];

const getStatusColor = (status: UserLead['status']) => {
  switch(status) {
    case 'New': return 'bg-blue-100 text-blue-700';
    case 'Contacted': return 'bg-yellow-100 text-yellow-700';
    case 'Converted': return 'bg-green-100 text-green-700';
    case 'Lost': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function UserLeadsPage() {
  const [leads, setLeads] = useState<UserLead[]>(userLeadsData);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<UserLead | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editFormData, setEditFormData] = useState<Partial<UserLead>>({});

  const ITEMS_PER_PAGE = 10;

  const openView = (lead: UserLead) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
  };

  const openEdit = (lead: UserLead) => {
    setSelectedLead(lead);
    setEditFormData(lead);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (selectedLead && editFormData) {
      const updatedLeads = leads.map(lead => 
        lead.id === selectedLead.id ? { ...lead, ...editFormData } : lead
      );
      setLeads(updatedLeads);
      setIsEditModalOpen(false);
      toast.success('Lead updated successfully');
    }
  };

  const handleEditChange = (field: keyof UserLead, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.phone.includes(searchTerm);
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column[] = [
    { key: 'id', label: 'ID', render: (v: number) => `#${v}` },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'interestedService', label: 'Interested Service' },
    { 
      key: 'submittedAt', 
      label: 'Submitted',
      render: (v: string) => new Date(v).toLocaleDateString()
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (v: UserLead['status']) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(v)}`}>
          {v}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: UserLead) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => openView(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all" 
            title="View Details"
          >
            <Eye size={15} />
          </button>
          <button 
            onClick={() => openEdit(row)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all" 
            title="Edit Lead"
          >
            <Edit size={15} />
          </button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedData = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">User Leads</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {filteredLeads.length} total leads · {leads.filter(l => l.status === 'New').length} new
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Table columns={columns} data={paginatedData} />
        {filteredLeads.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLeads.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No leads found</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedLead.name}</h2>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Mail size={12} /> Email Address
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{selectedLead.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Smartphone size={12} /> Phone Number
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{selectedLead.phone}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Globe size={12} /> Source
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{selectedLead.source}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={12} /> Submitted Date
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedLead.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <MapPin size={12} /> Location
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedLead.city}, {selectedLead.state}, {selectedLead.country}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Interested Service</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedLead.interestedService}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Hash size={12} /> Lead ID
                    </label>
                    <p className="text-sm font-mono text-gray-900 mt-1">#LEAD-{selectedLead.id.toString().padStart(4, '0')}</p>
                  </div>
                  
                  {selectedLead.notes && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</label>
                      <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded-lg">{selectedLead.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  <Edit size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit Lead</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Update lead information</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => handleEditChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editFormData.status || ''}
                    onChange={(e) => handleEditChange('status', e.target.value as UserLead['status'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editFormData.country || ''}
                    onChange={(e) => handleEditChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editFormData.state || ''}
                    onChange={(e) => handleEditChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => handleEditChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interested Service</label>
                  <input
                    type="text"
                    value={editFormData.interestedService || ''}
                    onChange={(e) => handleEditChange('interestedService', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={editFormData.notes || ''}
                    onChange={(e) => handleEditChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
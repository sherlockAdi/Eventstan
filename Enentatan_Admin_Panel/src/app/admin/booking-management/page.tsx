'use client';

import { useState } from 'react';
import { Eye, Edit, ToggleLeft, ToggleRight, X, Mail, Phone, Calendar, DollarSign, Clock, User, Building } from 'lucide-react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import { bookingsData } from '@/lib/dummyData';
import { Booking, Column } from '@/lib/types';
import toast from 'react-hot-toast';

// Extended Booking interface with more details
interface ExtendedBooking extends Booking {
  customerEmail?: string;
  customerPhone?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  serviceName?: string;
  subserviceName?: string;
  bookingTime?: string;
  eventDate?: string;
  eventLocation?: string;
  specialRequests?: string;
}

// Updated dummy data with more details
const extendedBookingsData: ExtendedBooking[] = [
  { 
    id: 'BK-1001', 
    customer: 'Rahul Sharma', 
    vendor: 'Dream Wedding Planners', 
    amount: 150000, 
    payment: '50%', 
    status: 'Confirmed', 
    date: '2024-03-15',
    customerEmail: 'rahul.sharma@example.com',
    customerPhone: '+91 98765 43210',
    vendorEmail: 'contact@dreamwedding.com',
    vendorPhone: '+91 99887 66554',
    serviceName: 'Wedding Planning',
    subserviceName: 'Full Wedding Package',
    bookingTime: '14:30',
    eventDate: '2024-05-20',
    eventLocation: 'Mumbai, Maharashtra',
    specialRequests: 'Need vegan food options and floral decoration in pink theme'
  },
  { 
    id: 'BK-1002', 
    customer: 'Priya Patel', 
    vendor: 'Royal Caterers', 
    amount: 85000, 
    payment: '100%', 
    status: 'Completed', 
    date: '2024-03-10',
    customerEmail: 'priya.patel@example.com',
    customerPhone: '+91 87654 32109',
    vendorEmail: 'info@royalcaterers.com',
    vendorPhone: '+91 76543 21098',
    serviceName: 'Catering Services',
    subserviceName: 'Veg Catering',
    bookingTime: '11:00',
    eventDate: '2024-03-25',
    eventLocation: 'Ahmedabad, Gujarat',
    specialRequests: 'Jain food preferred'
  },
  { 
    id: 'BK-1003', 
    customer: 'Amit Kumar', 
    vendor: 'Magic Moments Photography', 
    amount: 45000, 
    payment: '50%', 
    status: 'Pending', 
    date: '2024-03-12',
    customerEmail: 'amit.kumar@example.com',
    customerPhone: '+91 76543 21098',
    vendorEmail: 'hello@magicmoments.com',
    vendorPhone: '+91 65432 10987',
    serviceName: 'Photography',
    subserviceName: 'Wedding Photography',
    bookingTime: '10:00',
    eventDate: '2024-04-15',
    eventLocation: 'Delhi, NCR',
    specialRequests: 'Need candid photography'
  },
  { 
    id: 'BK-1004', 
    customer: 'Neha Gupta', 
    vendor: 'Grand Decorators', 
    amount: 120000, 
    payment: '100%', 
    status: 'Confirmed', 
    date: '2024-03-08',
    customerEmail: 'neha.gupta@example.com',
    customerPhone: '+91 65432 10987',
    vendorEmail: 'sales@granddecor.com',
    vendorPhone: '+91 54321 09876',
    serviceName: 'Decoration',
    subserviceName: 'Wedding Decoration',
    bookingTime: '15:45',
    eventDate: '2024-05-10',
    eventLocation: 'Jaipur, Rajasthan',
    specialRequests: 'Traditional Rajasthani theme'
  },
  { 
    id: 'BK-1005', 
    customer: 'Vikram Singh', 
    vendor: 'Rhythm Beats DJ', 
    amount: 35000, 
    payment: '50%', 
    status: 'Cancelled', 
    date: '2024-03-05',
    customerEmail: 'vikram.singh@example.com',
    customerPhone: '+91 54321 09876',
    vendorEmail: 'book@rhythmbeats.com',
    vendorPhone: '+91 43210 98765',
    serviceName: 'Music & Entertainment',
    subserviceName: 'DJ Services',
    bookingTime: '20:00',
    eventDate: '2024-04-05',
    eventLocation: 'Chandigarh',
    specialRequests: 'Bollywood music playlist'
  },
];

const statusColors: Record<string, string> = {
  Confirmed: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<ExtendedBooking[]>(extendedBookingsData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selected, setSelected] = useState<ExtendedBooking | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [filterPayment, setFilterPayment] = useState('All Bookings');

  const openStatusModal = (booking: ExtendedBooking, newStatus: string) => {
    setSelected(booking);
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selected && pendingStatus) {
      setBookings(bookings.map(b => 
        b.id === selected.id ? { ...b, status: pendingStatus } : b
      ));
      toast.success(`Booking status updated to ${pendingStatus}!`);
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus('');
    }
  };

  const openView = (booking: ExtendedBooking) => {
    setSelected(booking);
    setIsViewModalOpen(true);
  };

  const openEdit = (booking: ExtendedBooking) => {
    setSelected(booking);
    setIsEditModalOpen(true);
  };

  const updatePayment = (booking: ExtendedBooking, payment: '50%' | '100%') => {
    setBookings(bookings.map(b => b.id === booking.id ? { ...b, payment } : b));
    setSelected(prev => prev ? { ...prev, payment } : prev);
    toast.success(`Payment updated to ${payment}`);
  };

  const updateStatus = (booking: ExtendedBooking, status: string) => {
    setBookings(bookings.map(b => b.id === booking.id ? { ...b, status } : b));
    setSelected(prev => prev ? { ...prev, status } : prev);
    toast.success(`Status updated to ${status}`);
  };

  // Filter by payment
  const filtered = filterPayment === 'All Bookings' 
    ? bookings 
    : bookings.filter(b => b.payment === filterPayment);

  const columns: Column[] = [
    { key: 'id', label: 'Booking ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'amount', label: 'Amount', render: (v: number) => `₹${v.toLocaleString()}` },
    { 
      key: 'payment', 
      label: 'Payment', 
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${v === '100%' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {v}
          </span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v: string, row: ExtendedBooking) => (
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[v] ?? 'bg-gray-100 text-gray-600'}`}>
            {v}
          </span>
          {v !== 'Completed' && v !== 'Cancelled' && (
            <button
              onClick={() => openStatusModal(row, v === 'Confirmed' ? 'Pending' : 'Confirmed')}
              className="text-gray-500 hover:text-orange-600 transition-colors"
              title={v === 'Confirmed' ? 'Mark as Pending' : 'Confirm Booking'}
            >
              {v === 'Confirmed' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            </button>
          )}
        </div>
      )
    },
    { key: 'date', label: 'Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: ExtendedBooking) => (
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
            title="Edit Booking"
          >
            <Edit size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {bookings.length} total bookings · {bookings.filter(b => b.status === 'Confirmed').length} confirmed · {bookings.filter(b => b.status === 'Pending').length} pending
          </p>
        </div>
        <select 
          value={filterPayment}
          onChange={e => setFilterPayment(e.target.value)}
          className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option>All Bookings</option>
          <option>50%</option>
          <option>100%</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Table columns={columns} data={filtered} />
      </div>

      {/* View Booking Details Modal */}
      {isViewModalOpen && selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
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
                {/* Booking Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Booking ID</p>
                    <p className="text-lg font-bold text-gray-900">{selected.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="text-sm font-medium text-gray-900">{selected.date}</p>
                    <p className="text-xs text-gray-400">{selected.bookingTime}</p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User size={14} className="text-orange-500" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Name</label>
                      <p className="text-sm text-gray-900 font-medium">{selected.customer}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selected.customerEmail || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900">{selected.customerPhone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Vendor Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Building size={14} className="text-orange-500" />
                    Vendor Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Vendor Name</label>
                      <p className="text-sm text-gray-900 font-medium">{selected.vendor}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Service</label>
                      <p className="text-sm text-gray-900">{selected.serviceName || selected.vendor}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Subservice</label>
                      <p className="text-sm text-gray-900">{selected.subserviceName || 'Standard'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selected.vendorEmail || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900">{selected.vendorPhone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar size={14} className="text-orange-500" />
                    Event Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Event Date</label>
                      <p className="text-sm text-gray-900">{selected.eventDate || 'Not scheduled'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Event Time</label>
                      <p className="text-sm text-gray-900">{selected.bookingTime || 'Not specified'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500">Location</label>
                      <p className="text-sm text-gray-900">{selected.eventLocation || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Payment & Status */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <DollarSign size={14} className="text-orange-500" />
                    Payment & Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="text-xs text-gray-500">Amount</label>
                      <p className="text-sm font-bold text-orange-600">₹{selected.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Payment Status</label>
                      <p className="text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selected.payment === '100%' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {selected.payment}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Booking Status</label>
                      <p className="text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selected.status]}`}>
                          {selected.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selected.specialRequests && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Clock size={14} className="text-orange-500" />
                      Special Requests
                    </h4>
                    <p className="text-sm text-gray-600 pl-6 bg-gray-50 p-3 rounded-lg">
                      {selected.specialRequests}
                    </p>
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
                Edit Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Booking Details" size="lg">
        {selected && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                ['Booking ID', selected.id], 
                ['Customer', selected.customer], 
                ['Vendor', selected.vendor], 
                ['Amount', `₹${selected.amount.toLocaleString()}`], 
                ['Date', selected.date]
              ].map(([label, val]) => (
                <div key={label as string}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="font-semibold text-gray-900">{val}</p>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Payment Status</p>
              <div className="flex gap-2">
                {(['50%', '100%'] as const).map(p => (
                  <Button 
                    key={p} 
                    variant={selected.payment === p ? 'primary' : 'secondary'} 
                    size="sm" 
                    onClick={() => updatePayment(selected, p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2">Booking Status</p>
              <div className="flex flex-wrap gap-2">
                {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                  <Button 
                    key={s} 
                    variant={selected.status === s ? 'primary' : 'secondary'} 
                    size="sm" 
                    onClick={() => updateStatus(selected, s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsEditModalOpen(false)}>Save Changes</Button>
            </div>
          </div>
        )}
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
        title={pendingStatus === 'Confirmed' ? 'Confirm Booking' : 'Mark as Pending'} 
        message={`Are you sure you want to ${pendingStatus === 'Confirmed' ? 'confirm' : 'mark as pending'} booking #${selected?.id}?`} 
      />
    </div>
  );
}
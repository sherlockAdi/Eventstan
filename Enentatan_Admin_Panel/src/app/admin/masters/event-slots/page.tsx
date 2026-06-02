'use client';

import { useState } from 'react';
import { Plus, Clock, ToggleLeft, ToggleRight, Edit, Trash2 } from 'lucide-react';
import Table from '@/components/admin/Table';
import Modal from '@/components/admin/Modal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import { Column } from '@/lib/types';
import toast from 'react-hot-toast';

interface EventSlot { id: number; name: string; startTime: string; endTime: string; duration: string; status: string; }

const initialData: EventSlot[] = [
  { id: 1, name: 'Morning Slot', startTime: '06:00', endTime: '12:00', duration: '6 hours', status: 'Active' },
  { id: 2, name: 'Afternoon Slot', startTime: '12:00', endTime: '18:00', duration: '6 hours', status: 'Active' },
  { id: 3, name: 'Evening Slot', startTime: '18:00', endTime: '23:00', duration: '5 hours', status: 'Active' },
  { id: 4, name: 'Full Day', startTime: '06:00', endTime: '23:00', duration: '17 hours', status: 'Active' },
  { id: 5, name: 'Night Slot', startTime: '20:00', endTime: '00:00', duration: '4 hours', status: 'Inactive' },
];

export default function EventSlotsPage() {
  const [slots, setSlots] = useState<EventSlot[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selected, setSelected] = useState<EventSlot | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [form, setForm] = useState<Partial<EventSlot>>({ name: '', startTime: '', endTime: '', duration: '', status: 'Active' });

  const openStatusModal = (slot: EventSlot) => {
    setSelected(slot);
    const newStatus = slot.status === 'Active' ? 'Inactive' : 'Active';
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (selected && pendingStatus) {
      setSlots(slots.map(s => 
        s.id === selected.id ? { ...s, status: pendingStatus } : s
      ));
      toast.success(`Event slot ${pendingStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      setIsStatusModalOpen(false);
      setSelected(null);
      setPendingStatus('');
    }
  };

  const openEdit = (slot: EventSlot) => {
    setSelected(slot);
    setForm(slot);
    setIsModalOpen(true);
  };

  const openDelete = (slot: EventSlot) => {
    setSelected(slot);
    setIsDeleteOpen(true);
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Slot Name', render: (v: string) => <div className="flex items-center gap-2"><Clock size={14} className="text-orange-400" /><span className="font-medium">{v}</span></div> },
    { key: 'startTime', label: 'Start Time', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
    { key: 'endTime', label: 'End Time', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
    { key: 'duration', label: 'Duration' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v: string, row: EventSlot) => (
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
      render: (_: any, row: EventSlot) => (
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
    setForm({ name: '', startTime: '', endTime: '', duration: '', status: 'Active' }); 
    setIsModalOpen(true); 
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    let duration = endHour - startHour;
    if (duration < 0) duration += 24;
    return `${duration} ${duration === 1 ? 'hour' : 'hours'}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.startTime || !form.endTime) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const start = form.startTime ?? '';
    const end = form.endTime ?? '';
    const duration = calculateDuration(start, end);
    
    if (selected) {
      setSlots(slots.map(s => s.id === selected.id ? { ...s, ...form, duration } as EventSlot : s));
      toast.success('Event slot updated successfully!');
    } else {
      setSlots([...slots, { 
        id: slots.length + 1, 
        name: form.name ?? '', 
        startTime: start, 
        endTime: end, 
        duration, 
        status: form.status ?? 'Active' 
      }]);
      toast.success('Event slot added successfully!');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Event Slots Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{slots.length} slots · {slots.filter(s => s.status === 'Active').length} active</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={15} />
          Add Slot
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Table 
          columns={columns} 
          data={slots}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Edit Event Slot' : 'Add Event Slot'}>
        <form onSubmit={handleSubmit}>
          <Input 
            label="Slot Name" 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })} 
            placeholder="e.g. Morning Slot" 
            required 
          />
          
          <div className="grid grid-cols-2 gap-x-4">
            <Input 
              label="Start Time" 
              type="time" 
              value={form.startTime} 
              onChange={e => setForm({ ...form, startTime: e.target.value })} 
              required 
            />
            <Input 
              label="End Time" 
              type="time" 
              value={form.endTime} 
              onChange={e => setForm({ ...form, endTime: e.target.value })} 
              required 
            />
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
        title={pendingStatus === 'Active' ? 'Activate Event Slot' : 'Deactivate Event Slot'} 
        message={`Are you sure you want to ${pendingStatus === 'Active' ? 'activate' : 'deactivate'} event slot "${selected?.name}"?`} 
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={() => { 
          if (selected) { 
            setSlots(slots.filter(s => s.id !== selected.id)); 
            toast.success('Event slot deleted successfully!'); 
          } 
          setIsDeleteOpen(false); 
        }} 
        title="Delete Event Slot" 
        message={`Are you sure you want to delete event slot "${selected?.name}"? This action cannot be undone.`} 
      />
    </div>
  );
}
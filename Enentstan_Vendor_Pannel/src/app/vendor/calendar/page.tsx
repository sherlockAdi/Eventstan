'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { vendorApi } from '@/api/vendorApi';

type AvailabilityStatus = 'AVAILABLE' | 'BLOCKED' | 'OFFLINE_BOOKING';

interface Availability {
  id: string;
  date: string;
  status: AvailabilityStatus;
  capacity: number;
  bookedCount: number;
  note?: string | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const styles: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
  BLOCKED: 'bg-red-100 text-red-700 border-red-200',
  OFFLINE_BOOKING: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function CalendarPage() {
  const today = new Date();
  const todayKey = dateKey(today);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [entries, setEntries] = useState<Record<string, Availability>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [status, setStatus] = useState<AvailabilityStatus>('AVAILABLE');
  const [capacity, setCapacity] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    vendorApi.availability.list<Availability[]>()
      .then((items) => setEntries(Object.fromEntries(items.map(item => [item.date.slice(0, 10), item]))))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load availability'))
      .finally(() => setLoading(false));
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)] as Array<number | null>;

  const summary = (() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthEntries = Object.entries(entries).filter(([key]) => key.startsWith(monthPrefix));
    return {
      available: monthEntries.filter(([, item]) => item.status === 'AVAILABLE').length,
      blocked: monthEntries.filter(([, item]) => item.status === 'BLOCKED').length,
      offline: monthEntries.filter(([, item]) => item.status === 'OFFLINE_BOOKING').length,
      booked: monthEntries.reduce((total, [, item]) => total + item.bookedCount, 0),
    };
  })();

  const openDate = (day: number) => {
    const key = dateKey(new Date(year, month, day));
    if (key < todayKey) return;
    const existing = entries[key];
    setSelectedDate(key);
    setStatus(existing?.status ?? 'AVAILABLE');
    setCapacity(existing?.capacity ?? 1);
    setNote(existing?.note ?? '');
    setError('');
  };

  const save = async () => {
    if (!selectedDate) return;
    setSaving(true);
    setError('');
    try {
      const updated = await vendorApi.availability.upsert<Availability>({
        date: selectedDate,
        status,
        capacity: status === 'BLOCKED' ? 0 : capacity,
        note,
      });
      setEntries(current => ({ ...current, [selectedDate]: updated }));
      setMessage(`Availability saved for ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB')}.`);
      setSelectedDate(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Availability Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">Control online capacity, blocked dates, and bookings received outside EventStan.</p>
      </div>

      {message && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
      {error && !selectedDate && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid sm:grid-cols-4 gap-3">
        {[
          ['Available Dates', summary.available, 'text-green-600'],
          ['Blocked Dates', summary.blocked, 'text-red-500'],
          ['Offline Booking Dates', summary.offline, 'text-blue-600'],
          ['Reserved Capacity', summary.booked, 'text-orange-600'],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 rounded-xl hover:bg-gray-100"><ChevronLeft /></button>
          <div className="text-center">
            <h2 className="font-bold text-gray-900 text-lg">{MONTHS[month]} {year}</h2>
            <p className="text-xs text-gray-400">Select a future date to manage availability</p>
          </div>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 rounded-xl hover:bg-gray-100"><ChevronRight /></button>
        </div>

        {loading ? (
          <div className="h-80 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : (
          <>
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(day => <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {cells.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} />;
                const key = dateKey(new Date(year, month, day));
                const entry = entries[key];
                const past = key < todayKey;
                return (
                  <button
                    key={key}
                    disabled={past}
                    onClick={() => openDate(day)}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${
                      past ? 'opacity-30 cursor-not-allowed bg-gray-50' :
                      entry ? styles[entry.status] : 'bg-gray-50 border-gray-100 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <span className="font-semibold">{day}</span>
                    {entry && <span className="text-[10px] mt-1">{entry.bookedCount}/{entry.capacity}</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-600">
          {[
            ['bg-green-100', 'Available'],
            ['bg-red-100', 'Blocked'],
            ['bg-blue-100', 'Offline booking'],
            ['bg-gray-100', 'Not configured'],
          ].map(([color, label]) => <span key={label} className="flex items-center gap-2"><i className={`w-4 h-4 rounded ${color}`} />{label}</span>)}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={event => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><CalendarDays size={18} className="text-orange-500" /> Manage Date</h3>
                <p className="text-sm text-gray-500 mt-1">{new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
              </div>
              <button onClick={() => setSelectedDate(null)} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <label className="text-xs font-medium text-gray-600">Status</label>
            <select value={status} onChange={event => setStatus(event.target.value as AvailabilityStatus)} className="w-full mt-1 mb-4 px-3 py-2.5 border border-gray-200 rounded-xl">
              <option value="AVAILABLE">Available for online booking</option>
              <option value="BLOCKED">Blocked / unavailable</option>
              <option value="OFFLINE_BOOKING">Reserved by offline booking</option>
            </select>

            <label className="text-xs font-medium text-gray-600">Daily Capacity</label>
            <input type="number" min={status === 'BLOCKED' ? 0 : 1} disabled={status === 'BLOCKED'} value={status === 'BLOCKED' ? 0 : capacity} onChange={event => setCapacity(Math.max(1, Number(event.target.value)))} className="w-full mt-1 mb-4 px-3 py-2.5 border border-gray-200 rounded-xl disabled:bg-gray-100" />

            <label className="text-xs font-medium text-gray-600">Note</label>
            <textarea value={note} onChange={event => setNote(event.target.value)} rows={3} placeholder="Optional internal note" className="w-full mt-1 mb-5 px-3 py-2.5 border border-gray-200 rounded-xl resize-none" />

            <button onClick={save} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

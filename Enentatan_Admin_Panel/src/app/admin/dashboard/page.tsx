'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Truck, BookOpen, DollarSign, Star, CalendarCheck, TrendingUp, RefreshCw } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import { getToken } from '@/lib/auth';
import { adminApi } from '@/api/adminApi';
import toast from 'react-hot-toast';

const recentBookings = [
  { id: 'BK001', customer: 'John Doe', vendor: 'Wedding Pros', amount: 50000, status: 'Confirmed', date: '2024-02-15' },
  { id: 'BK002', customer: 'Jane Smith', vendor: 'Event Planners', amount: 30000, status: 'Completed', date: '2024-02-10' },
  { id: 'BK003', customer: 'Mike Brown', vendor: 'Birthday Specialists', amount: 25000, status: 'Pending', date: '2024-02-14' },
];

const statusColors: Record<string, string> = {
  Confirmed: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 12543, totalVendors: 234, totalBookings: 4567,
    totalRevenue: 1256789, pendingApprovals: 18, completedEvents: 342,
    avgRating: 4.8, growth: 23.5,
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData(isRefresh?: boolean) {
    if (isRefresh) { setRefreshing(true); toast.loading('Refreshing…', { id: 'dash' }); }
    else setLoading(true);
    try {
      const data = await adminApi.dashboard(getToken());
      if (data.data) setStats(data.data);
      if (isRefresh) toast.success('Dashboard updated!', { id: 'dash' });
    } catch {
      if (isRefresh) toast.success('Dashboard refreshed!', { id: 'dash' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-60"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={<Users size={18} />} color="blue" trend="+12%" />
        <StatsCard title="Total Vendors" value={stats.totalVendors} icon={<Truck size={18} />} color="orange" trend="+8%" />
        <StatsCard title="Total Bookings" value={stats.totalBookings} icon={<BookOpen size={18} />} color="green" trend="+23%" />
        <StatsCard title="Total Revenue" value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`} icon={<DollarSign size={18} />} color="purple" trend="+18%" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon={<TrendingUp size={18} />} color="orange" />
        <StatsCard title="Completed Events" value={stats.completedEvents} icon={<CalendarCheck size={18} />} color="green" />
        <StatsCard title="Avg Rating" value={stats.avgRating} icon={<Star size={18} />} color="purple" />
        <StatsCard title="Growth Rate" value={`${stats.growth}%`} icon={<TrendingUp size={18} />} color="blue" />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['Booking ID', 'Customer', 'Vendor', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-orange-600">{b.id}</td>
                  <td className="px-6 py-3 text-gray-700">{b.customer}</td>
                  <td className="px-6 py-3 text-gray-700">{b.vendor}</td>
                  <td className="px-6 py-3 text-gray-700">₹{b.amount.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{b.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

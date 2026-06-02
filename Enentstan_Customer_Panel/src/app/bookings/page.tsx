"use client";
import Link from "next/link";

const SAMPLE_BOOKINGS = [
  { id: "ES-AB12CD34", service: "The Grand Palace Ballroom", package: "Grand Wedding Essentials", date: "2024-06-15", status: "confirmed", total: 5500, event_type: "Wedding" },
  { id: "ES-EF56GH78", service: "Bloom & Petal Decorations", package: "Romance in Bloom", date: "2024-05-20", status: "pending", total: 1800, event_type: "Anniversary" },
];

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function BookingsPage() {
  if (SAMPLE_BOOKINGS.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h2>
        <p className="text-gray-500 mb-6">Browse services and make your first booking!</p>
        <Link href="/services" className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600">
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
      <div className="space-y-4">
        {SAMPLE_BOOKINGS.map((booking) => (
          <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{booking.service}</h3>
                <p className="text-gray-500 text-sm">{booking.package}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[booking.status]}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm border-t border-gray-100 pt-4">
              <div>
                <span className="text-gray-400 block mb-1">Booking ID</span>
                <span className="font-mono font-medium text-gray-900">{booking.id}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Event Date</span>
                <span className="font-medium text-gray-900">{booking.date}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Total</span>
                <span className="font-bold text-orange-500">${booking.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

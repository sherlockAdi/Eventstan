"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { customerApi } from "@/api/customerApi";
import { useAuth } from "@/lib/AuthContext";

interface ApiBooking {
  id: string;
  status: string;
  eventAddress: string;
  totalAmount: number;
  remainingDueAmount: number;
  currency: string;
  createdAt: string;
  items: Array<{ title: string; eventDate: string; quantity: number }>;
  payments: Array<{ amount: number; status: string }>;
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CUSTOMER_CONFIRMATION: "bg-blue-100 text-blue-700",
  VENDOR_REVIEW: "bg-orange-100 text-orange-700",
  PAYMENT_RECEIVED: "bg-orange-100 text-orange-700",
  PENDING_PAYMENT: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default function BookingsPage() {
  const { user, loading: authLoading, canAccessRoute } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth/login?redirect=/bookings");
      return;
    }
    if (!canAccessRoute("/bookings")) {
      router.replace("/");
      return;
    }
    customerApi.bookings.list<ApiBooking[]>()
      .then(setBookings)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Unable to load bookings"))
      .finally(() => setLoading(false));
  }, [authLoading, canAccessRoute, router, user]);

  if (authLoading || loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Loading your bookings...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto px-4 py-20"><div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div></div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h2>
        <p className="text-gray-500 mb-6">Browse services and make your first booking.</p>
        <Link href="/services" className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600">Browse Services</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
      <div className="space-y-4">
        {bookings.map((booking) => {
          const paid = booking.payments.filter(payment => payment.status === "SUCCEEDED").reduce((sum, payment) => sum + payment.amount, 0);
          return (
            <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{booking.items.map(item => item.title).join(", ")}</h3>
                  <p className="text-gray-500 text-sm">{booking.eventAddress}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[booking.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {booking.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className="grid sm:grid-cols-4 gap-4 text-sm border-t border-gray-100 pt-4">
                <div><span className="text-gray-400 block mb-1">Booking ID</span><span className="font-mono font-medium text-gray-900">{booking.id}</span></div>
                <div><span className="text-gray-400 block mb-1">Event Date</span><span className="font-medium text-gray-900">{booking.items[0] ? new Date(booking.items[0].eventDate).toLocaleDateString("en-GB") : "-"}</span></div>
                <div><span className="text-gray-400 block mb-1">Total</span><span className="font-bold text-orange-500">{booking.currency} {booking.totalAmount.toLocaleString()}</span></div>
                <div><span className="text-gray-400 block mb-1">Paid</span><span className="font-bold text-green-600">{booking.currency} {paid.toLocaleString()}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

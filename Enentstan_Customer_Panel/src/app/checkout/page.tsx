"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { customerApi } from "@/api/customerApi";
import { CartItem } from "@/types";

interface EventDetails {
  name: string;
  email: string;
  phone: string;
  event_date: string;
  event_type: string;
  guest_count: string;
  message: string;
  event_address: string;
}

type PaymentMethod = "card" | "pay_later";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, count, clearCart } = useCart();

  const [details, setDetails] = useState<EventDetails>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    event_date: "",
    event_type: "",
    guest_count: "",
    message: "",
    event_address: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDetails((d) => ({ ...d, [e.target.name]: e.target.value }));
  };

  const isValid =
    details.name.trim() &&
    details.email.trim() &&
    details.phone.trim() &&
    details.event_date.trim();

  const handlePay = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }
    if (!isValid) return;

    setSubmitting(true);
    setError("");
    try {
      const booking = await customerApi.bookings.checkout<{ id: string }>({
        eventAddress: details.event_address,
        notes: [
          details.event_type,
          details.guest_count ? `${details.guest_count} guests` : "",
          details.message,
        ]
          .filter(Boolean)
          .join(" - "),
      });
      clearCart();
      router.push(`/booking-confirmed/${booking.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to process booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium mb-1">Your cart is empty</p>
        <p className="text-gray-400 text-sm mb-5">Add a service or package to check out.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Browse Services
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Services
      </button>

      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-5">Event Details</h2>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name *</label>
                <input
                  name="name" value={details.name} onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email *</label>
                <input
                  name="email" value={details.email} onChange={handleChange}
                  type="email" placeholder="you@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone *</label>
                <input
                  name="phone" value={details.phone} onChange={handleChange}
                  placeholder="+1 555..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Date *</label>
                <input
                  name="event_date" value={details.event_date} onChange={handleChange}
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Type</label>
                <input
                  name="event_type" value={details.event_type} onChange={handleChange}
                  placeholder="e.g. Wedding, Birthday"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Number of Guests</label>
                <input
                  name="guest_count" value={details.guest_count} onChange={handleChange}
                  type="number" placeholder="50"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Address</label>
                <input
                  name="event_address" value={details.event_address} onChange={handleChange}
                  placeholder="Venue or event address"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Message</label>
                <textarea
                  name="message" value={details.message} onChange={handleChange}
                  rows={3} placeholder="Any special requirements..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-5">Payment Method</h2>

            <div className="space-y-3">
              <PaymentOption
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z" />
                  </svg>
                }
                title="Credit / Debit Card"
                subtitle="Pay securely online via Stripe"
                selected={payment === "card"}
                onSelect={() => setPayment("card")}
              />
              <PaymentOption
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                title="Pay on Confirmation"
                subtitle="Pay the vendor directly after your booking is confirmed"
                selected={payment === "pay_later"}
                onSelect={() => setPayment("pay_later")}
              />
            </div>

            {payment === "card" && (
              <div className="bg-gray-50 rounded-xl p-4 mt-4 space-y-4">
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Your payment will be processed securely via Stripe
                </p>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Card Number</label>
                  <input
                    value={card.number}
                    onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Expiry</label>
                    <input
                      value={card.expiry}
                      onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))}
                      placeholder="MM/YY"
                      className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">CVC</label>
                    <input
                      value={card.cvc}
                      onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))}
                      placeholder="123"
                      className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                </div>
                <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                  Online payment setup is in progress. You can still submit your booking — payment will be collected after confirmation.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handlePay}
            disabled={submitting || !isValid}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-orange-600 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : `Pay $${total.toLocaleString()} & Book`}
          </button>
        </div>

        {/* Right column — Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <SummaryRow key={item.id} item={item} />
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span className="text-gray-900">Total</span>
                <span className="text-orange-500">${total.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              {count} item{count > 1 ? "s" : ""} · final price confirmed by vendor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({
  icon, title, subtitle, selected, onSelect,
}: {
  icon: React.ReactNode; title: string; subtitle: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
        selected ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        selected ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <span className={`w-4.5 h-4.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
        selected ? "border-orange-500" : "border-gray-300"
      }`}>
        {selected && <span className="w-2 h-2 rounded-full bg-orange-500" />}
      </span>
    </button>
  );
}

function SummaryRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        {typeof item.image_url === "string" && item.image_url.trim() ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" aria-hidden />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
        <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
      </div>
      <span className="text-sm font-bold text-gray-900 flex-shrink-0">${item.price.toLocaleString()}</span>
    </div>
  );
}
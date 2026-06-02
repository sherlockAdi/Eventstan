"use client";
import { useState } from "react";
import { Package, Service } from "@/types";

interface Props {
  pkg?: Package;
  service?: Service;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  numGuests: string;
  numDays: number;
  message: string;
}

export default function BookingModal({ pkg, service, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    eventDate: "",
    eventType: "",
    numGuests: "",
    numDays: 1,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pkg as any;
  const basePrice = p?.price ?? service?.price_min ?? 0;
  const priceUnit = p?.price_unit ?? service?.price_unit ?? "day";
  const title = p?.name ?? service?.title ?? "";
  const vendorName = service?.vendor_name ?? "";
  const category = service?.category ?? "";
  const totalPrice = basePrice * form.numDays;

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(onClose, 2200);
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 transition-colors bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">

        {/* Dark header */}
        <div className="bg-gray-900 px-6 pt-6 pb-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-wider">
                {category}
              </span>
              <h2 className="text-white font-bold text-xl mt-0.5 leading-tight">{title}</h2>
              {vendorName && (
                <p className="text-gray-400 text-sm mt-0.5">by {vendorName}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-orange-400 font-bold text-2xl">
                ${totalPrice.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {form.numDays} days × ${basePrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-orange-500 text-white" : "bg-white/20 text-white"}`}>
                1
              </div>
              <span className={`text-sm font-medium ${step === 1 ? "text-white" : "text-gray-400"}`}>
                Your Details
              </span>
            </div>
            <div className="flex-1 h-px bg-white/20 mx-1" />
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-orange-500 text-white" : "bg-white/20 text-white"}`}>
                2
              </div>
              <span className={`text-sm font-medium ${step === 2 ? "text-white" : "text-gray-400"}`}>
                Review Order
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">

          {submitted ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Booking Requested!</h3>
              <p className="text-gray-500 text-sm">We'll confirm your booking shortly.</p>
            </div>
          ) : step === 1 ? (
            /* ── Step 1: Your Details ── */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Full Name <span className="text-orange-400">*</span>
                  </label>
                  <input
                    value={form.fullName}
                    onChange={set("fullName")}
                    placeholder="mrsrivastava"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Email <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="mrsrivastava@neuralinfo.org"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Phone</label>
                  <input
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+1 (555) 000-0000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Event Date <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={set("eventDate")}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Event Type</label>
                  <input
                    value={form.eventType}
                    onChange={set("eventType")}
                    placeholder="e.g. Wedding, Birthday"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Number of Guests</label>
                  <input
                    value={form.numGuests}
                    onChange={set("numGuests")}
                    placeholder={p?.max_guests ? `Max ${p.max_guests}` : "Guests"}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Number of Days */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-700 mb-3 block">
                  Number of Days <span className="text-gray-400 font-normal">(min 1)</span>{" "}
                  <span className="text-orange-400">*</span>
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => setForm((p) => ({ ...p, numDays: Math.max(1, p.numDays - 1) }))}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-900">{form.numDays}</span>
                  <button
                    onClick={() => setForm((p) => ({ ...p, numDays: p.numDays + 1 }))}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-400">days</span>
                </div>
                <p className="text-orange-500 font-semibold text-sm">
                  Estimated Total: ${totalPrice.toLocaleString()}
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Message / Special Requests
                </label>
                <textarea
                  value={form.message}
                  onChange={set("message")}
                  rows={3}
                  placeholder="Any special requests or notes for the vendor..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          ) : (
            /* ── Step 2: Review Order ── */
            <div className="space-y-4">
              {/* Booking details card */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-2.5 text-sm">
                <h3 className="font-bold text-gray-900 text-base mb-3">Booking Summary</h3>
                <Row label="Service" value={title} />
                <Row label="Vendor" value={vendorName ?? ""} />
                <Row label="Event Date" value={form.eventDate || "—"} />
                <Row label="Event Type" value={form.eventType || "—"} />
                <Row label="Guests" value={form.numGuests || "—"} />
                <Row label="Duration" value={`${form.numDays} day${form.numDays > 1 ? "s" : ""}`} />
                <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-500 text-base">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Contact details card */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-2.5 text-sm">
                <h3 className="font-bold text-gray-900 text-base mb-3">Your Details</h3>
                <Row label="Name" value={form.fullName || "—"} />
                <Row label="Email" value={form.email || "—"} />
                <Row label="Phone" value={form.phone || "—"} />
                {form.message && <Row label="Note" value={form.message} />}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="px-6 pb-6 pt-2">
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!form.fullName || !form.email || !form.eventDate}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue to Review
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { CartItem } from "@/types";
import { customerApi } from "@/api/customerApi";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

type CheckoutStep = "cart" | "details" | "confirm";

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  event_date: string;
  event_type: string;
  guest_count: string;
  message: string;
  event_address: string;
}

const STEP_INDEX: Record<CheckoutStep, number> = { cart: 1, details: 2, confirm: 3 };
const STEP_LABELS: CheckoutStep[] = ["cart", "details", "confirm"];
const STEP_DISPLAY = ["Your Cart", "Your Details", "Confirm"];

export default function CartDrawer() {
  const { user } = useAuth();
  const router = useRouter();
  const { items, isOpen, closeCart, removeItem, clearCart, total, count } = useCart();
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [mounted, setMounted] = useState(false);
  const [details, setDetails] = useState<CustomerDetails>({
    name: "", email: "", phone: "", event_date: "", event_type: "", guest_count: "", message: "", event_address: "",
  });
  const [confirmId, setConfirmId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  // Reset to cart step when drawer closes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setStep("cart"), 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!mounted) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDetails((d) => ({ ...d, [e.target.name]: e.target.value }));
  };

  const handleConfirm = async () => {
    if (!user) {
      closeCart();
      router.push("/auth/login?redirect=/");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await customerApi.cart.clear().catch(() => undefined);
      for (const item of items) {
        await customerApi.cart.add({
          type: item.type === "service" ? "SERVICE" : "PACKAGE",
          itemId: item.type === "service" ? item.service!.id : item.pkg!.id,
          eventDate: details.event_date,
          quantity: 1,
        });
      }
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
      setConfirmId(booking.id);
      setStep("confirm");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    clearCart();
    closeCart();
    setStep("cart");
    setDetails({ name: "", email: "", phone: "", event_date: "", event_type: "", guest_count: "", message: "", event_address: "" });
  };

  const currentStepNum = STEP_INDEX[step];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gray-900 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-white font-bold text-base">Your Event Cart</h2>
            {count > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step Indicators */}
        <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-0 flex-shrink-0">
          {STEP_LABELS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  currentStepNum > i + 1
                    ? "bg-green-500 text-white"
                    : currentStepNum === i + 1
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}>
                  {currentStepNum > i + 1 ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-xs font-medium transition-colors ${currentStepNum === i + 1 ? "text-gray-900" : "text-gray-400"}`}>
                  {STEP_DISPLAY[i]}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-8 h-px mx-2 transition-colors duration-300 ${currentStepNum > i + 1 ? "bg-orange-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── STEP 1: CART ── */}
          {step === "cart" && (
            <div className="h-full flex flex-col">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium mb-1">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Browse packages and add them here</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 p-5 space-y-3">
                    {items.map((item) => (
                      <CartItemRow key={item.id} item={item} onRemove={() => removeItem(item.id)} />
                    ))}
                  </div>

                  <div className="border-t border-gray-100 p-5 bg-white space-y-3 flex-shrink-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{count} item{count > 1 ? "s" : ""}</span>
                      <span className="text-xs text-gray-400">Final price at checkout</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-lg">
                      <span className="text-gray-900">Estimated Total</span>
                      <span className="text-orange-500">${total.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => setStep("details")}
                      className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all"
                    >
                      Proceed to Checkout →
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full text-gray-400 text-sm hover:text-red-400 transition-colors"
                    >
                      Clear cart
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 2: DETAILS ── */}
          {step === "details" && (
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-500 mb-2">Fill in your details to proceed with the booking.</p>
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Event Address *</label>
                  <input
                    name="event_address" value={details.event_address} onChange={handleChange}
                    placeholder="Venue or event address"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
                  <input
                    name="name" value={details.name} onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
                  <input
                    name="email" value={details.email} onChange={handleChange}
                    placeholder="you@email.com" type="email"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone *</label>
                  <input
                    name="phone" value={details.phone} onChange={handleChange}
                    placeholder="+1 555..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Event Date *</label>
                  <input
                    name="event_date" value={details.event_date} onChange={handleChange}
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Guest Count</label>
                  <input
                    name="guest_count" value={details.guest_count} onChange={handleChange}
                    type="number" placeholder="50"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Event Type</label>
                  <select
                    name="event_type" value={details.event_type} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white"
                  >
                    <option value="">Select event type</option>
                    {["Wedding", "Birthday", "Corporate", "Anniversary", "Baby Shower", "Graduation", "Proposal", "Other"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Special Requests</label>
                  <textarea
                    name="message" value={details.message} onChange={handleChange}
                    rows={3} placeholder="Any special requirements or notes..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Order summary mini */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-bold text-gray-700 mb-2">Order Summary</p>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-600">
                    <span className="truncate mr-2">{item.title}</span>
                    <span className="font-semibold flex-shrink-0">${item.price.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-orange-200 pt-2 flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span className="text-orange-500">${total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep("cart")}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting || !details.name || !details.email || !details.phone || !details.event_date || !details.event_address}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "Creating Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: CONFIRM ── */}
          {step === "confirm" && (
            <div className="p-5 flex flex-col items-center text-center">
              {/* Animated checkmark */}
              <div className="relative w-20 h-20 mb-5 mt-4">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-1">Booking Confirmed!</h3>
              <p className="text-gray-500 text-sm mb-1">
                Thank you, <strong>{details.name}</strong>!
              </p>
              <p className="text-gray-400 text-xs mb-5">
                A confirmation has been sent to <strong>{details.email}</strong>
              </p>

              {/* Booking ID card */}
              <div className="w-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white mb-5">
                <p className="text-orange-200 text-xs mb-1">Booking Reference</p>
                <p className="text-2xl font-mono font-bold tracking-wider mb-3">{confirmId}</p>
                <div className="border-t border-orange-400/40 pt-3 grid grid-cols-2 gap-2 text-left text-xs">
                  <div>
                    <p className="text-orange-200">Event Date</p>
                    <p className="font-semibold">{details.event_date || "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-orange-200">Event Type</p>
                    <p className="font-semibold">{details.event_type || "—"}</p>
                  </div>
                  <div>
                    <p className="text-orange-200">Items</p>
                    <p className="font-semibold">{count} service{count > 1 ? "s" : ""}</p>
                  </div>
                  <div>
                    <p className="text-orange-200">Total Paid</p>
                    <p className="font-semibold">${total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Booked items */}
              <div className="w-full space-y-2 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 text-left">
                    {typeof item.image_url === "string" && item.image_url.trim() ? (
                      <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" aria-hidden />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
                    </div>
                    <span className="text-sm font-bold text-orange-500 flex-shrink-0">${item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-5">
                Our team will reach out within 24 hours to finalize the details.
              </p>

              <button
                onClick={handleDone}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Done — Close Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CartItemRow({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
  return (
    <div className="flex gap-3 bg-gray-50 rounded-2xl p-3 group hover:bg-orange-50 transition-colors">
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        {typeof item.image_url === "string" && item.image_url.trim() ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" aria-hidden />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{item.title}</p>
            <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              item.type === "package"
                ? "bg-orange-100 text-orange-600"
                : "bg-blue-100 text-blue-600"
            }`}>
              {item.type === "package" ? "Package" : "Service"}
            </span>
          </div>
          <button
            onClick={onRemove}
            className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <p className="text-orange-500 font-bold text-sm mt-1">${item.price.toLocaleString()}</p>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Package, Service } from "@/types";
import { useCart } from "@/lib/CartContext";

/* ── Inline: Configure & Add to Cart modal ── */
function ConfigureCartModal({
  pkg,
  service,
  onClose,
}: {
  pkg: Package;
  service: Service;
  onClose: () => void;
}) {
  const [days, setDays] = useState(1);
  const { addPackage } = useCart();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pkg as any;
  const total = (p.price ?? 0) * days;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Configure &amp; Add to Cart</h2>
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5">
            <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{service.vendor_name} · {service.category}</p>
          </div>
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Days</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-12 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold text-gray-900">
                {days}
              </span>
              <button
                onClick={() => setDays((d) => d + 1)}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl px-4 py-3 mb-5 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{days} × ${p.price?.toLocaleString()} {p.price_unit ? `per ${p.price_unit}` : ""}</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-900">Cart Price</span>
              <span className="text-orange-500 text-base">${total.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { (addPackage as any)(p, days); onClose(); }}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  pkg: Package;
  service: Service;
  onBook: (pkg: Package) => void;
}

export default function PackageCard({ pkg, service, onBook }: Props) {
  const { items } = useCart();
  const [showConfigure, setShowConfigure] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pkg as any;
  const inCart = items.some((i) => i.id === `pkg-${p.id}`);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Image */}
        <div className="relative h-48 flex-shrink-0">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30">
            {service.category}
          </span>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-base leading-tight">{p.name}</p>
            <p className="text-white/70 text-xs mt-0.5">{service.vendor_name}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-gray-500 text-sm mb-3 leading-relaxed line-clamp-2">
            {p.description}
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500">
            {p.max_guests && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Up to {p.max_guests} guests
              </span>
            )}
            {p.duration_hours && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {p.duration_hours}h
              </span>
            )}
            {p.price_unit && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {p.price_unit}
              </span>
            )}
          </div>

          {/* Features */}
          {p.features?.length > 0 && (
            <ul className="space-y-1 mb-4">
              {p.features.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          )}
           
          {/* Price + Actions */}
          <div className="mt-auto">
            <div className="mb-3">
              <span className="text-2xl font-bold text-gray-900">
                ${p.price?.toLocaleString()}
              </span>
              {p.price_unit && (
                <span className="text-sm text-gray-400 ml-1">/ {p.price_unit}</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfigure(true)}
                disabled={inCart}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  inCart
                    ? "bg-green-50 text-green-600 border-green-200 cursor-default"
                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {inCart ? "Added ✓" : "Add to Cart"}
              </button>
              <button
                onClick={() => onBook(pkg)}
                className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfigure && (
        <ConfigureCartModal
          pkg={pkg}
          service={service}
          onClose={() => setShowConfigure(false)}
        />
      )}
    </>
  );
}
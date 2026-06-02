"use client";
import { useState } from "react";
import { Package, Service } from "@/types";
import { useCart } from "@/lib/CartContext";

interface Props {
  pkg: Package;
  service: Service;
  onClose: () => void;
}

export default function ConfigureCartModal({ pkg, service, onClose }: Props) {
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

          {/* Package info chip */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5">
            <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{service.vendor_name} · {service.category}</p>
          </div>

          {/* Days counter */}
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

          {/* Price breakdown */}
          <div className="bg-orange-50 rounded-xl px-4 py-3 mb-5 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {days} × ${p.price?.toLocaleString()} {p.price_unit ? `per ${p.price_unit}` : ""}
              </span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-900">Cart Price</span>
              <span className="text-orange-500 text-base">${total.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
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
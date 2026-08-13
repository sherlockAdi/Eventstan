"use client";
import { useState } from "react";
import { Package, Service } from "@/types";
import { useCart } from "@/lib/CartContext";
import ConfigureCartModal from "@/components/ui/Configurecartmodal";

interface Props {
  pkg: Package;
  service: Service;
  onBook: (pkg: Package) => void;
}

export default function PackageCard({ pkg, service, onBook }: Props) {
  const { items, addPackage } = useCart();
  const [showConfigure, setShowConfigure] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pkg as any;
  const inCart = items.some((i) => i.id === `pkg-${p.id}` || i.pkg?.id === p.id);
  // "per event" packages are a flat, one-off price — no day/quantity
  // picker makes sense, so skip the configure modal and add directly.
  const isPerEvent = (p.price_unit || "").toLowerCase() === "per event";

  const handleAddToCart = () => {
    if (isPerEvent) {
      addPackage(pkg, service, 1);
    } else {
      setShowConfigure(true);
    }
  };

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
                {(() => {
                  const unit = String(p.price_unit).toLowerCase();
                  const [min, max] = unit.includes("hour")
                    ? [p.min_hours ?? p.minHours, p.max_hours ?? p.maxHours]
                    : unit.includes("person") || unit.includes("guest")
                    ? [p.min_persons ?? p.minPersons, p.max_persons ?? p.maxPersons]
                    : unit.includes("piece")
                    ? [p.min_pieces ?? p.minPieces, p.max_pieces ?? p.maxPieces]
                    : [p.min_days ?? p.minDays, p.max_days ?? p.maxDays];
                  return (
                    min != null &&
                    max != null && (
                      <span className="text-gray-400">
                        {" "}
                        (min {min}, max {max})
                      </span>
                    )
                  );
                })()}
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
                onClick={handleAddToCart}
                disabled={inCart}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  inCart
                    ? "bg-white text-gray-500 border-gray-200 cursor-default"
                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                {inCart ? (
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth={1.6} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12l2 2 4-4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                {inCart ? "In Cart" : "Add to Cart"}
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
"use client";
import { useState } from "react";
import { Package, Service } from "@/types";
import { useCart } from "@/lib/CartContext";

interface Props {
  pkg: Package;
  service: Service;
  onClose: () => void;
}

// A package can be priced per day, per hour, per person, or per piece.
// This maps the price_unit string to the right min/max fields (e.g.
// min_hours/max_hours for "per hour") and the counter's display label.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUnitConfig(p: any): {
  singular: string;
  plural: string;
  min?: number | null;
  max?: number | null;
} {
  const priceUnit = String(p.price_unit ?? p.priceUnit ?? "").toLowerCase();

  if (priceUnit.includes("hour")) {
    return {
      singular: "Hour",
      plural: "Hours",
      min: p.min_hours ?? p.minHours,
      max: p.max_hours ?? p.maxHours,
    };
  }
  if (priceUnit.includes("person") || priceUnit.includes("guest")) {
    return {
      singular: "Person",
      plural: "Persons",
      min: p.min_persons ?? p.minPersons,
      max: p.max_persons ?? p.maxPersons,
    };
  }
  if (priceUnit.includes("piece")) {
    return {
      singular: "Piece",
      plural: "Pieces",
      min: p.min_pieces ?? p.minPieces,
      max: p.max_pieces ?? p.maxPieces,
    };
  }
  // Default: per day (also covers packages with no price_unit set)
  return {
    singular: "Day",
    plural: "Days",
    min: p.min_days ?? p.minDays,
    max: p.max_days ?? p.maxDays,
  };
}

export default function ConfigureCartModal({ pkg, service, onClose }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = pkg as any;

  // Package pricing can be per day, per hour, per person, or per piece —
  // pick the matching min/max fields and counter label for whichever unit
  // this package is actually priced in, instead of always assuming "days".
  const unit = getUnitConfig(p);
  const minCount = Number(unit.min ?? 1) || 1;
  const maxCountRaw = unit.max;
  const maxCount = maxCountRaw != null ? Number(maxCountRaw) : undefined;

  const [days, setDays] = useState(minCount);
  const [quantity, setQuantity] = useState(1);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const { addPackage } = useCart();

  // Whether this package gets the full rental flow (Quantity + Delivery
  // Location + Distance) or the simple single-unit flow (just a counter
  // for whatever it's priced in — days/hours/persons/pieces).
  //
  // The package's `is_rental` flag from the API isn't reliable on its own
  // (some non-rental, e.g. Catering, packages have come through with it
  // set to true), so the category is treated as the source of truth: only
  // packages actually under the "Rentals" category get the rental modal.
  const categoryName = String(
    service?.category ?? p.category_name ?? p.category?.name ?? ""
  ).toLowerCase();
  const isRental = categoryName
    ? categoryName.includes("rental")
    : Boolean(p.is_rental ?? p.isRental);
  const deliveryAvailable = Boolean(p.delivery_available ?? p.deliveryAvailable);
  const deliveryFeeRate = p.delivery_fee ?? p.deliveryFee ?? 0;

  const itemsTotal = (p.price ?? 0) * quantity * days;
  const transportFee =
    isRental && deliveryAvailable && distanceKm ? (parseFloat(distanceKm) || 0) * deliveryFeeRate : 0;
  const total = itemsTotal + transportFee;

  const needsDeliveryLocation = isRental && deliveryAvailable && !deliveryLocation.trim();

  const handleAdd = () => {
    if (needsDeliveryLocation) return;
    addPackage(pkg, service, quantity, days, deliveryLocation || undefined, transportFee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 max-h-[90vh] overflow-y-auto">
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

          {/* Quantity counter — rentals only; other packages (venues, services etc.) book as a single unit for the chosen day(s) */}
          {isRental && (
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Unit counter — Days / Hours / Persons / Pieces, whichever this package is priced in */}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {isRental ? `Number of ${unit.plural}` : unit.plural}
              {(minCount > 1 || maxCount) && (
                <span className="text-gray-400 font-normal">
                  {" "}
                  (min {minCount}
                  {maxCount ? ` – max ${maxCount}` : ""})
                </span>
              )}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDays((d) => Math.max(minCount, d - 1))}
                disabled={days <= minCount}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-12 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold text-gray-900">
                {days}
              </span>
              <button
                onClick={() => setDays((d) => (maxCount ? Math.min(maxCount, d + 1) : d + 1))}
                disabled={maxCount != null && days >= maxCount}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {isRental && (
                <span className="text-sm text-gray-400">
                  {days > 1 ? unit.plural.toLowerCase() : unit.singular.toLowerCase()}
                </span>
              )}
            </div>
          </div>

          {/* Delivery details — rentals with delivery only */}
          {isRental && deliveryAvailable && (
            <>
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Delivery Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. 123 Main St, Brooklyn, NY"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-400"
                />
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5V6.75A2.25 2.25 0 015.25 4.5h6a2.25 2.25 0 012.25 2.25v9.75m-10.5 0h10.5m-10.5 0a1.5 1.5 0 103 0m7.5 0a1.5 1.5 0 103 0m-3 0h3m-3 0V9.75h2.03a1.5 1.5 0 011.28.72l1.94 3.18a1.5 1.5 0 01.25.83v2.02" />
                  </svg>
                  Approx. Distance from Vendor (km)
                </label>
                <input
                  type="number"
                  min="0"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-400"
                />
                {deliveryFeeRate > 0 && (
                  <p className="text-xs text-gray-400 mt-1">${deliveryFeeRate}/km</p>
                )}
              </div>
            </>
          )}

          {/* Price breakdown */}
          <div className="bg-orange-50 rounded-xl px-4 py-3 mb-5 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              {isRental ? (
                <span>
                  {quantity} {quantity === 1 ? "item" : "items"} × {days} {days === 1 ? unit.singular.toLowerCase() : unit.plural.toLowerCase()} × $
                  {p.price?.toLocaleString()}
                </span>
              ) : (
                <span>
                  {days} × ${p.price?.toLocaleString()} {p.price_unit || "per day"}
                </span>
              )}
              <span>${itemsTotal.toLocaleString()}</span>
            </div>
            {transportFee > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Transport fee</span>
                <span>${transportFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-orange-100">
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
              onClick={handleAdd}
              disabled={needsDeliveryLocation}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

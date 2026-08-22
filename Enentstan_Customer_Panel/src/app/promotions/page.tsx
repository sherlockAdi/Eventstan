"use client";
import { useEffect, useState, useMemo } from "react";
import { useMarketplace } from "@/lib/useMarketplace";
import {
  isPromotionalPackage,
  packageToPromotion,
  RawApiPackage,
} from "@/lib/promotionsMapper";
import { Promotion } from "@/types";
import { useCart } from "@/lib/CartContext";
import BookingModal from "@/components/ui/BookingModal";

/* ── Inlined to avoid separate file dependency ── */
function ConfigureCartModal({
  pkg,
  service,
  onClose,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pkg: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: any;
  onClose: () => void;
}) {
  const [days, setDays] = useState(1);
  const { addPackage } = useCart();
  const total = (pkg.price ?? 0) * days;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Configure &amp; Add to Cart
          </h2>
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5">
            <p className="font-semibold text-gray-900 text-sm">{pkg.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {service.vendor_name} · {service.category}
            </p>
          </div>
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Days</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="w-12 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-semibold text-gray-900">
                {days}
              </span>
              <button
                onClick={() => setDays((d) => d + 1)}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl px-4 py-3 mb-5 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {days} × ${pkg.price?.toLocaleString()}{" "}
                {pkg.price_unit ? `per ${pkg.price_unit}` : ""}
              </span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-900">Cart Price</span>
              <span className="text-orange-500 text-base">
                ${total.toLocaleString()}
              </span>
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
              onClick={() => {
                (addPackage as any)(pkg, service);
                onClose();
              }}
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

const CATEGORIES = [
  "All",
  "Venue",
  "Decor",
  "Catering",
  "Entertainment",
  "Rentals",
];

const BADGE_COLORS: Record<string, string> = {
  Entertainment: "bg-purple-500",
  Venue: "bg-blue-500",
  Decor: "bg-pink-500",
  Catering: "bg-green-600",
  Rentals: "bg-amber-600",
};

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()));
  }, [expiresAt]);

  if (now == null) {
    return null;
  }

  const end = new Date(expiresAt).getTime();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return (
    <div className="flex items-center gap-1 text-orange-500 text-xs font-semibold">
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0114 0z"
        />
      </svg>
      {days > 0 ? `${days}d left` : "Ends today"}
    </div>
  );
}

function DiscountBadge({
  original,
  current,
}: {
  original: number;
  current: number;
}) {
  const pct = Math.round(((original - current) / original) * 100);
  return (
    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
      {pct}% OFF
    </span>
  );
}

function PromoDetailModal({
  promo,
  onClose,
  onAddToCart,
  onBook,
  inCart,
}: {
  promo: Promotion;
  onClose: () => void;
  onAddToCart: () => void;
  onBook: () => void;
  inCart: boolean;
}) {
  const promoImage =
    typeof promo.image_url === "string" ? promo.image_url.trim() : "";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-sm transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Title */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 pr-8">
              {promo.title}
            </h2>
          </div>

          {/* Image */}
          <div className="relative h-52 flex-shrink-0">
            {promoImage ? (
              <img
                src={promoImage}
                alt={promo.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
            <span
              className={`absolute top-3 left-3 ${BADGE_COLORS[promo.category] || "bg-gray-600"} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}
            >
              {promo.badge || promo.category}
            </span>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed">
              {promo.short_desc}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-gray-500 border-b border-gray-100 pb-4">
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Up to {promo.max_guests.toLocaleString()} guests
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2h2z"
                  />
                </svg>
                {promo.price_unit}
              </span>
              {promo.min_days && promo.max_days && (
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">
                  min {promo.min_days} – max {promo.max_days}
                </span>
              )}
            </div>

            {/* What's Included */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                What&apos;s Included
              </p>
              <ul className="space-y-2">
                {promo.inclusions.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-sm text-gray-700"
                  >
                    <svg
                      className="w-4 h-4 text-orange-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vendor */}
            {(promo.vendor_name ||
              promo.vendor_email ||
              promo.vendor_phone) && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Vendor
                </p>
                {promo.vendor_name && (
                  <p className="font-bold text-gray-900 text-sm mb-2">
                    {promo.vendor_name}
                  </p>
                )}
                {promo.vendor_email && (
                  <a
                    href={`mailto:${promo.vendor_email}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-1.5 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {promo.vendor_email}
                  </a>
                )}
                {promo.vendor_phone && (
                  <a
                    href={`tel:${promo.vendor_phone}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {promo.vendor_phone}
                  </a>
                )}
              </div>
            )}

            {/* Price */}
            <div className="border-t border-gray-100 pt-4">
              <span className="text-3xl font-bold text-gray-900">
                ${promo.price.toLocaleString()}
              </span>
              <span className="text-gray-400 text-sm ml-1">
                / {promo.price_unit}
              </span>
              {promo.original_price && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  ${promo.original_price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sticky footer buttons */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => {
              onAddToCart();
              onClose();
            }}
            disabled={inCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              inCart
                ? "bg-green-50 text-green-600 border-green-200 cursor-default"
                : "bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-500"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {inCart ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              )}
            </svg>
            {inCart ? "In Cart" : "Add to Cart"}
          </button>
          <button
            onClick={() => {
              onBook();
              onClose();
            }}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function PromotionCard({
  promo,
  onBook,
}: {
  promo: Promotion;
  onBook: (p: Promotion) => void;
}) {
  const { items } = useCart();
  const [showConfigure, setShowConfigure] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const inCart = items.some((i) => i.id === `pkg-promo-${promo.id}`);
  const promoImage =
    typeof promo.image_url === "string" ? promo.image_url.trim() : "";
  const hasImage = promoImage.length > 0;

  // Adapt promo to the shape ConfigureCartModal expects via pkg/service props
  const promoAsPkg = {
    id: `promo-${promo.id}`,
    service_id: promo.service_id,
    name: promo.title,
    description: promo.short_desc,
    price: promo.price,
    price_unit: promo.price_unit,
    features: promo.inclusions,
    max_guests: promo.max_guests,
    duration_hours: promo.duration_hours,
  };

  const promoAsService = {
    id: promo.service_id,
    category: promo.category,
    vendor_name: promo.vendor_name,
    image_url: promo.image_url,
  };

  return (
    <>
      <div
        className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${promo.is_featured ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-100"}`}
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          {hasImage ? (
            <img
              src={promoImage}
              alt={promo.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <span
            className={`absolute top-3 left-3 ${BADGE_COLORS[promo.category] || "bg-gray-600"} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}
          >
            {promo.badge || promo.category}
          </span>

          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {promo.original_price && (
              <DiscountBadge
                original={promo.original_price}
                current={promo.price}
              />
            )}
            {promo.is_featured && (
              <span className="bg-black/60 backdrop-blur-sm text-orange-300 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-400/30">
                ⭐ Featured
              </span>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
            <h3 className="text-white font-bold text-base leading-snug line-clamp-1">
              {promo.title}
            </h3>
            <p className="text-white/70 text-xs">{promo.vendor_handle}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">
            {promo.short_desc}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Up to {promo.max_guests.toLocaleString()} guests
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0114 0z"
                />
              </svg>
              {promo.duration_hours}h
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2h2z"
                />
              </svg>
              {promo.price_unit}
            </span>
          </div>

          <ul className="space-y-1 mb-4 flex-1">
            {promo.inclusions.slice(0, 3).map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs text-gray-600"
              >
                <svg
                  className="w-3.5 h-3.5 text-orange-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {item}
              </li>
            ))}
            {promo.inclusions.length > 3 && (
              <li
                onClick={() => setShowDetail(true)}
                className="text-xs text-orange-500 font-semibold pl-5 cursor-pointer hover:underline"
              >
                +{promo.inclusions.length - 3} more — view all details
              </li>
            )}
          </ul>

          <div className="flex items-end gap-2 mb-4">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ${promo.price.toLocaleString()}
              </span>
              <span className="text-gray-400 text-sm ml-1">
                / {promo.price_unit}
              </span>
            </div>
            {promo.original_price && (
              <span className="text-sm text-gray-400 line-through mb-0.5">
                ${promo.original_price.toLocaleString()}
              </span>
            )}
          </div>

          {promo.expires_at && (
            <div className="mb-3">
              <CountdownTimer expiresAt={promo.expires_at} />
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => !inCart && setShowConfigure(true)}
              disabled={inCart}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${
                inCart
                  ? "bg-green-50 text-green-600 border-green-200 cursor-default"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {inCart ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                )}
              </svg>
              {inCart ? "In Cart" : "Add to Cart"}
            </button>

            <button
              onClick={() => onBook(promo)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Configure & Add to Cart modal */}
      {showConfigure && (
        <ConfigureCartModal
          pkg={promoAsPkg as any}
          service={promoAsService as any}
          onClose={() => setShowConfigure(false)}
        />
      )}

      {/* Detail modal — opened from "+X more" */}
      {showDetail && (
        <PromoDetailModal
          promo={promo}
          onClose={() => setShowDetail(false)}
          onAddToCart={() => setShowConfigure(true)}
          onBook={() => onBook(promo)}
          inCart={inCart}
        />
      )}
    </>
  );
}

export default function PromotionsPage() {
  const { packages, loading, error } = useMarketplace();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [booking, setBooking] = useState<Promotion | null>(null);

  // Only packages flagged as promotional (isPromotional/is_promotional) on the
  // /packages API response are shown here — this is the live "Promotions" feed.
  const PROMOTIONS: Promotion[] = useMemo(
    () =>
      (packages as RawApiPackage[])
        .filter(isPromotionalPackage)
        .map(packageToPromotion),
    [packages],
  );

  const filtered = useMemo(() => {
    let result = PROMOTIONS.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.vendor_name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === "price_asc")
      result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc")
      result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "discount")
      result = [...result].sort((a, b) => {
        const da = a.original_price
          ? (a.original_price - a.price) / a.original_price
          : 0;
        const db = b.original_price
          ? (b.original_price - b.price) / b.original_price
          : 0;
        return db - da;
      });
    if (sortBy === "featured")
      result = [...result].sort(
        (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0),
      );

    return result;
  }, [PROMOTIONS, search, category, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Promotions</h1>
        <p className="text-gray-500">
          Exclusive deals and special offers from top vendors — limited time,
          fixed price
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promotions or vendors..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-orange-400 text-gray-700 cursor-pointer"
        >
          <option value="featured">Featured First</option>
          <option value="discount">Biggest Discount</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              category === cat
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading promotions…
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          Failed to load promotions: {error}
        </div>
      ) : (
        <>
          {/* <p className="text-sm text-gray-400 mb-5">
            {filtered.length} promotion{filtered.length !== 1 ? "s" : ""}{" "}
            available
          </p> */}

          {/* {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(promo => (
            <PromotionCard key={promo.id} promo={promo} onBook={setBooking}/>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎟️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No promotions found</h3>
          <p className="text-gray-400 mb-5">Try adjusting your filters or search term.</p>
          <button
            onClick={() => { setSearch(""); setCategory("All"); }}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )} */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              Loading promotions…
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              Failed to load promotions: {error}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-5">
                0 promotions available
              </p>

              <div className="text-center py-20">
                <svg
                  className="w-14 h-14 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2h2z"
                  />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No promotions found
                </h3>
                <p className="text-gray-400 mb-5">
                  Check back soon or try different filters
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-50 transition-colors bg-white"
                >
                  Clear Filters
                </button>
              </div>
            </>
          )}
        </>
      )}

      {booking && (
        <BookingModal
          pkg={
            {
              id: `promo-${booking.id}`,
              service_id: booking.service_id,
              title: booking.title,
              description: booking.short_desc,
              price: booking.price,
              price_unit: booking.price_unit,
              inclusions: booking.inclusions,
              max_guests: booking.max_guests,
              duration_hours: booking.duration_hours,
            } as any
          }
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { CartItem } from "@/types";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeItem, clearCart, total, count } =
    useCart();
  const [mounted, setMounted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen || shareOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, shareOpen]);

  if (!mounted) return null;

  const handleProceedToCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
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
            <svg
              className="w-5 h-5 text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-white font-bold text-base">Your Event Cart</h2>
            {count > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-orange-400 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
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
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium mb-1">
                Your cart is empty
              </p>
              <p className="text-gray-400 text-sm">
                Browse packages and add them here
              </p>
            </div>
          ) : (
            <>
              <div className="p-5 space-y-3">
                <p className="text-sm text-gray-500">
                  {count} {count === 1 ? "package" : "packages"} in your cart
                </p>
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>

              <div className="border-t border-gray-100 p-5 bg-white space-y-3 flex-shrink-0">
                <div className="flex items-center justify-between bg-orange-50 rounded-2xl px-5 py-4">
                  <span className="text-gray-900 font-bold">
                    Estimated Total
                  </span>
                  <span className="text-orange-500 font-bold text-xl">
                    ${total.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full flex items-center justify-center gap-1.5 bg-orange-500 text-white py-3.5 rounded-full font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all"
                >
                  Continue to Details
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShareOpen(true)}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3.5 rounded-full font-semibold hover:bg-gray-50 transition-colors"
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
                      d="M8.684 13.342a3 3 0 100-2.684m0 2.684a3 3 0 100-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 8.658a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  Share Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Share Cart Modal */}
      <ShareCartModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        items={items}
        total={total}
      />
    </>
  );
}

function ShareCartModal({
  open,
  onClose,
  items,
  total,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
}) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Reset state each time the modal is opened fresh
  useEffect(() => {
    if (open) {
      setShareUrl("");
      setCopied(false);
      setError("");
      setName(user?.name ?? "");
      setEmail(user?.email ?? "");
      setNote("");
    }
  }, [open, user]);

  if (!open) return null;

  const handleGenerate = () => {
    setLoading(true);
    setError("");

    // Static/local link generation — no backend call.
    // Builds a shareable URL by encoding the cart snapshot in the query string.
    // The id is derived from the cart contents so the same cart always
    // produces the same link (instead of a new random one each time).
    setTimeout(() => {
      try {
        const payload = {
          name,
          email,
          note,
          items: items.map((i) => ({
            id: i.id,
            title: i.title,
            price: i.price,
            type: i.type,
          })),
          total,
        };
        const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
        const id = simpleHash(items.map((i) => i.id).join(",") + total);
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        setShareUrl(`${origin}/share/${id}?c=${encoded}`);
      } catch {
        setError("Unable to generate link");
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for non-secure contexts (e.g. http://localhost without HTTPS support)
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically — please copy the link manually.");
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
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

        <div className="flex items-center gap-2 mb-1.5">
          <svg
            className="w-5 h-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342a3 3 0 100-2.684m0 2.684a3 3 0 100-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 8.658a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
          <h2 className="font-serif text-xl font-bold text-gray-900">
            Share Your Cart
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Generate a link to share your event selections with someone else.
        </p>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {!shareUrl ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Your Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Your Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional"
                  type="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Note to Recipient
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. Check out these vendors I picked for the wedding..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-5">
              <span className="text-sm text-gray-600">
                {items.length} item{items.length > 1 ? "s" : ""} · $
                {total.toLocaleString()}
              </span>
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate Link"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 mb-4">
              <svg
                className="w-4 h-4 text-orange-500 flex-shrink-0"
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
              <span className="text-sm text-orange-700 font-medium">
                Your share link is ready!
              </span>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <input
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 bg-gray-50 truncate"
              />
              <button
                onClick={handleCopy}
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
              >
                {copied ? (
                  <svg
                    className="w-4.5 h-4.5"
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
                ) : (
                  <svg
                    className="w-4.5 h-4.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CartItemRow({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: () => void;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-gray-900 truncate">{item.title}</p>
            <svg
              className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{item.subtitle}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
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
              strokeWidth={1.8}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      <p className="mt-2">
        <span className="text-orange-500 font-bold text-lg">
          ${item.price.toLocaleString()}
        </span>
        <span className="text-gray-400 text-sm"> / per event</span>
      </p>
    </div>
  );
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // convert to 32-bit int
  }
  return Math.abs(hash).toString(36);
}

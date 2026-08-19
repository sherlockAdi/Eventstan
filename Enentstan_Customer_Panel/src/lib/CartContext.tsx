"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Package, Service } from "@/types";
import { customerApi, CustomerCartItemResponse, getPackages, getServices } from "@/api/customerApi";
import { useAuth } from "@/lib/AuthContext";

const GUEST_CART_KEY = "es_guest_cart";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  addPackage: (
    pkg: Package,
    service?: Service,
    quantity?: number,
    days?: number,
    deliveryLocation?: string,
    transportFee?: number,
  ) => Promise<void>;
  addService: (service: Service) => void;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

function toCartItem(
  row: CustomerCartItemResponse,
  fallback?: { service?: Service; pkg?: Package; image_url?: string }
): CartItem {
  return {
    id: row.cartItemId,
    cartItemId: row.cartItemId,
    type: "package",
    title: row.title,
    subtitle: fallback?.service
      ? [fallback.service.vendor_name, fallback.service.category].filter(Boolean).join(" · ")
      : row.category,
    price: row.totalPrice,
    quantity: row.quantity,
    image_url: fallback?.image_url ?? fallback?.service?.image_url ?? "",
    pkg: fallback?.pkg,
    service: fallback?.service,
  };
}

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore quota/serialization errors — cart just won't persist
  }
}

function clearGuestCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Logged-out visitors: load whatever's in localStorage on first mount.
  useEffect(() => {
    if (user) return;
    setItems(loadGuestCart());
  }, [user]);

  // Whenever the guest cart changes, persist it — so it survives a refresh.
  useEffect(() => {
    if (user) return;
    saveGuestCart(items);
  }, [items, user]);

  // On login: push any locally-saved packages into the real backend cart,
  // then load the merged server cart. Service-only entries (which the
  // backend has no concept of) are re-added on top so nothing is lost.
  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      setLoading(true);
      const guestItems = loadGuestCart();
      const guestPackages = guestItems.filter((i) => i.type === "package" && i.pkg);
      const guestServices = guestItems.filter((i) => i.type === "service" && i.service);

      // Sync each locally-added package to the backend cart.
      for (const item of guestPackages) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = item.pkg as any;
          await customerApi.cart.add({
            userId: user.id,
            packageId: p.id,
            quantity: item.quantity || 1,
          });
        } catch (error) {
          console.error("Failed to sync guest cart item:", error);
        }
      }

      clearGuestCart();

      try {
        const res = await customerApi.cart.get(user.id);
        if (!active) return;

        // The cart endpoint doesn't return images, so look them up via the
        // packages/services list (packageId -> service_id -> image_url).
        let imageByPackageId = new Map<string, string>();
        try {
          const [packages, services] = await Promise.all([getPackages(), getServices()]);
          const imageByServiceId = new Map(services.map((s) => [s.id, s.image_url]));
          imageByPackageId = new Map(
            packages.map((p) => [p.id, imageByServiceId.get(p.service_id) ?? ""])
          );
        } catch (error) {
          console.error("Failed to load images for cart items:", error);
        }

        const serverItems = res.data.items.map((row) =>
          toCartItem(row, { image_url: imageByPackageId.get(row.packageId) })
        );
        setItems([...serverItems, ...guestServices]);
      } catch {
        if (active) setItems(guestServices);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const addPackage = async (
    pkg: Package,
    service?: Service,
    quantity: number = 1,
    days: number = 1,
    deliveryLocation?: string,
    transportFee: number = 0,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = pkg as any;
    // The backend (and the rest of the cart) only understands a single
    // "quantity" multiplier, so a rental of e.g. 5 units for 3 days is
    // billed as quantity 15 (5 × 3). We still remember the raw unit
    // count and day count on the item so the UI can show "5 × 3 days".
    // Transport fee (rental delivery) is billed on top and isn't part of
    // the backend's per-unit price, so it's tracked separately and added
    // to the item's displayed price.
    const billableQuantity = quantity * days;

    if (!user) {
      // Guest cart: saved to localStorage only, synced to the backend
      // automatically the moment they log in.
      setItems((prev) => {
        const exists = prev.find((i) => i.id === `pkg-${pkg.id}`);
        if (exists) return prev;
        const newItem: CartItem = {
          id: `pkg-${pkg.id}`,
          type: "package",
          title: p.title || p.name || "Package",
          subtitle: service ? [service.vendor_name, service.category].filter(Boolean).join(" · ") : "Package",
          price: (p.price ?? 0) * billableQuantity + transportFee,
          quantity: billableQuantity,
          unitQuantity: quantity,
          days,
          deliveryLocation,
          transportFee: transportFee || undefined,
          image_url: service?.image_url ?? p.image_url ?? "",
          pkg,
          service,
        };
        return [...prev, newItem];
      });
      setIsOpen(true);
      return;
    }

    try {
      setLoading(true);
      const res = await customerApi.cart.add({ userId: user.id, packageId: p.id, quantity: billableQuantity });
      const row = res.data;
      setItems((prev) => {
        const withoutExisting = prev.filter((i) => i.cartItemId !== row.cartItemId);
        return [
          ...withoutExisting,
          {
            ...toCartItem(row, { service, pkg, image_url: service?.image_url ?? p.image_url }),
            price: row.totalPrice + transportFee,
            unitQuantity: quantity,
            days,
            deliveryLocation,
            transportFee: transportFee || undefined,
          },
        ];
      });
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to add package to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addService = (service: Service) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === `svc-${service.id}`);
      if (exists) return prev;
      const newItem: CartItem = {
        id: `svc-${service.id}`,
        type: "service",
        title: service.title,
        subtitle: `${service.category} • ${service.location}`,
        price: service.price_min,
        image_url: service.image_url,
        service,
      };
      return [...prev, newItem];
    });
    setIsOpen(true);
  };

  const removeItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));

    if (item?.cartItemId && user) {
      try {
        await customerApi.cart.remove(item.cartItemId, user.id);
      } catch (error) {
        console.error("Failed to remove cart item:", error);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const item = items.find((i) => i.id === id);
    if (quantity < 1) return;

    if (!user || !item?.cartItemId) {
      // Guest (or local-only) item — just update it in place.
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = i.pkg as any;
          const unitPrice = p?.price ?? (i.quantity ? i.price / i.quantity : i.price);
          return { ...i, quantity, price: unitPrice * quantity };
        })
      );
      return;
    }

    try {
      const res = await customerApi.cart.update(item.cartItemId, { userId: user.id, quantity });
      const row = res.data;
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, price: row.totalPrice, quantity: row.quantity } : i))
      );
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };

  // Backend already deletes cart items as part of checkout, so this just
  // resets local UI state.
  const clearCart = () => {
    setItems([]);
    if (!user) clearGuestCart();
  };
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((o) => !o);

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const count = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        loading,
        addPackage,
        addService,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, Package, Service } from "@/types";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addPackage: (pkg: Package, service?: Service) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addPackage = (pkg: Package, service?: Service) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === `pkg-${pkg.id}`);
      if (exists) return prev;
      const newItem: CartItem = {
        id: `pkg-${pkg.id}`,
        type: "package",
        title: pkg.title,
        subtitle: service ? service.title : "Package",
        price: pkg.price,
        image_url: service?.image_url ?? "",
        pkg,
        service,
      };
      return [...prev, newItem];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setItems([]);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((o) => !o);

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, isOpen, addPackage, removeItem, clearCart, openCart, closeCart, toggleCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: any;
  sellerName: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "vanik_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setItems(JSON.parse(val));
    });
  }, []);

  const persist = useCallback((updated: CartItem[]) => {
    setItems(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const updated = existing
        ? prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...item, quantity: 1 }];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

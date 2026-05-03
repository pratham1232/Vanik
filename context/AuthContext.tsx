import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "buyer" | "seller";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const USER_KEY = "vanik_user";

const DEMO_ACCOUNTS: Array<User & { password: string }> = [
  {
    id: "demo_buyer",
    name: "Riya Sharma",
    email: "buyer@vanik.in",
    password: "demo123",
    role: "buyer",
    avatar: "https://i.pravatar.cc/150?img=5",
    bio: "Fashion & lifestyle enthusiast. Love discovering local brands!",
    followers: 284,
    following: 512,
    joinedAt: "Jan 2024",
  },
  {
    id: "demo_seller",
    name: "Ananya Collections",
    email: "seller@vanik.in",
    password: "demo123",
    role: "seller",
    avatar: "https://i.pravatar.cc/150?img=47",
    bio: "Fashion & Lifestyle seller. Curating the best in ethnic wear. Ships pan-India.",
    followers: 12400,
    following: 348,
    joinedAt: "Nov 2023",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY).then((val) => {
      if (val) {
        try { setUser(JSON.parse(val)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (demo) {
      const { password: _, ...userData } = demo;
      setUser(userData);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return { success: true };
    }
    const stored = await AsyncStorage.getItem(USER_KEY + "_db_" + email.toLowerCase());
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.password === password) {
        const { password: _, ...userData } = parsed;
        setUser(userData);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        return { success: true };
      }
    }
    return { success: false, error: "Invalid email or password" };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    await new Promise((r) => setTimeout(r, 1000));
    const existing = await AsyncStorage.getItem(USER_KEY + "_db_" + email.toLowerCase());
    if (existing) return { success: false, error: "Email already in use" };
    const newUser: User & { password: string } = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name,
      email,
      password,
      role,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      bio: role === "seller" ? "New seller on Vanik" : "Shopping enthusiast on Vanik",
      followers: 0,
      following: 0,
      joinedAt: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    };
    await AsyncStorage.setItem(USER_KEY + "_db_" + email.toLowerCase(), JSON.stringify(newUser));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

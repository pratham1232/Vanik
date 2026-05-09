import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'PLACEHOLDER_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with real client ID
  offlineAccess: true,
});

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
<<<<<<< Updated upstream
=======
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phone: string, otp: string, name?: string, role?: UserRole) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  /** Send a mock OTP — always "succeeds" */
  const sendOTP = useCallback(async (phone: string) => {
    await new Promise((r) => setTimeout(r, 600));
    // Store the phone so verifyOTP knows what we're verifying
    await AsyncStorage.setItem(OTP_KEY, phone);
    return { success: true };
  }, []);

  /** Verify OTP — accepts "1234" as valid code. If user exists, logs in; else marks as new user */
  const verifyOTP = useCallback(async (phone: string, otp: string, name?: string, role?: UserRole) => {
    await new Promise((r) => setTimeout(r, 800));

    if (otp !== "1234") {
      return { success: false, error: "Invalid OTP. Try 1234" };
    }

    // Check if demo account matches
    const demo = DEMO_ACCOUNTS.find((a) => a.phone === phone);
    if (demo) {
      const { password: _, ...userData } = demo;
      setUser(userData);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return { success: true, isNewUser: false };
    }

    // Check if we have a stored user with this phone
    const storedKey = USER_KEY + "_phone_" + phone;
    const stored = await AsyncStorage.getItem(storedKey);
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return { success: true, isNewUser: false };
    }

    // New user — if name and role provided, create account
    if (name && role) {
      const newUser: User = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name,
        email: "",
        phone,
        role,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        bio: role === "seller" ? "New seller on Vanik" : "Shopping enthusiast on Vanik",
        followers: 0,
        following: 0,
        joinedAt: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      };
      await AsyncStorage.setItem(storedKey, JSON.stringify(newUser));
      setUser(newUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return { success: true, isNewUser: false };
    }

    // New user but no name/role yet — tell the caller
    return { success: true, isNewUser: true };
  }, []);
  
  const loginWithGoogle = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const userDetails = userInfo.data?.user || userInfo.user;

      if (!userDetails) {
        throw new Error("Could not get user details");
      }

      const googleUser: User = {
        id: "google_" + userDetails.id,
        name: userDetails.name || "Google User",
        email: userDetails.email,
        role: "buyer",
        avatar: userDetails.photo || "https://i.pravatar.cc/150?img=12",
        bio: "Authenticated via Google",
        followers: 0,
        following: 0,
        joinedAt: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      };
      
      setUser(googleUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(googleUser));
      return { success: true };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, error: 'User cancelled the login flow' };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { success: false, error: 'Sign in is in progress already' };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { success: false, error: 'Play services not available or outdated' };
      } else {
        return { success: false, error: error.message || 'An error occurred during Google login' };
      }
    }
  }, []);

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, register, logout, updateUser }}>
=======
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, register, sendOTP, verifyOTP, loginWithGoogle, logout, updateUser }}>
>>>>>>> Stashed changes
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

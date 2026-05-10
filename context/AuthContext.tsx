import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import axios from 'axios';
import { API_URL } from "../constants/api";

// Only import GoogleSignin on native platforms
let GoogleSignin: any = null;
if (Platform.OS !== 'web') {
  try {
    const googleModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleModule.GoogleSignin;
    GoogleSignin.configure({
      webClientId: '1016790162859-jl4q1vo0pia43o192e8i27rfotv46v30.apps.googleusercontent.com',
      offlineAccess: true,
    });
  } catch (e) {
    console.log('Google Sign-In not available on this platform');
  }
}

export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  followers?: number;
  following?: number;
  joinedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const USER_KEY = "vanik_user";
const TOKEN_KEY = "vanik_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorage();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token: jwtToken, user: userData } = res.data;
      
      setToken(jwtToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      
      await AsyncStorage.setItem(TOKEN_KEY, jwtToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || "Login failed" };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password, role });
      const { token: jwtToken, user: userData } = res.data;
      
      setToken(jwtToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      
      await AsyncStorage.setItem(TOKEN_KEY, jwtToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || "Registration failed" };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (Platform.OS === 'web') {
      // On web, we cannot use the native Google SDK.
      // Instead, we'll show a message. In production, you'd use Google Identity Services.
      return { success: false, error: 'Google Sign-In is available on the mobile app. Please use email/password login on web.' };
    }

    // Native Google Sign-In
    try {
      if (!GoogleSignin) {
        return { success: false, error: 'Google Sign-In is not configured' };
      }

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;

      if (!idToken) throw new Error("Could not get Google ID Token");

      const res = await axios.post(`${API_URL}/api/auth/google/mobile`, { idToken });
      const { token: jwtToken, user: userData } = res.data;
      
      setToken(jwtToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      
      await AsyncStorage.setItem(TOKEN_KEY, jwtToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      return { success: true };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.response?.data?.message || 'Google login failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
    if (Platform.OS !== 'web' && GoogleSignin) {
      await GoogleSignin.signOut().catch(() => {});
    }
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
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isLoggedIn: !!user, 
      token,
      login, 
      register, 
      loginWithGoogle, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

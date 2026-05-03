import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface AppContextType {
  wishlist: string[];
  following: string[];
  toggleWishlist: (id: string) => void;
  toggleFollow: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  isFollowing: (id: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.multiGet(["vanik_wishlist", "vanik_following"]).then(([[, w], [, f]]) => {
      if (w) setWishlist(JSON.parse(w));
      if (f) setFollowing(JSON.parse(f));
    });
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      AsyncStorage.setItem("vanik_wishlist", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFollow = useCallback((id: string) => {
    setFollowing((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      AsyncStorage.setItem("vanik_following", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);
  const isFollowing = useCallback((id: string) => following.includes(id), [following]);

  return (
    <AppContext.Provider value={{ wishlist, following, toggleWishlist, toggleFollow, isWishlisted, isFollowing }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
  phone?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (fields: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      updateUser: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),
    }),
    {
      name: "auth-storage", // Lưu vào localStorage
    }
  )
);

export function useAuthHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const checkHydration = () => {
      setHydrated(useAuthStore.persist.hasHydrated());
    };

    const unsubHydrate = useAuthStore.persist.onHydrate(() => setHydrated(false));
    const unsubFinish = useAuthStore.persist.onFinishHydration(() => setHydrated(true));

    checkHydration();

    return () => {
      unsubHydrate();
      unsubFinish();
    };
  }, []);

  return hydrated;
}

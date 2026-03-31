// src/store/authStore.ts
import { create } from "zustand";

export type UserRole = "client" | "advocate" | null;

interface AuthState {
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  isAuthenticated: false,
  login: (role) => set({ role, isAuthenticated: true }),
  logout: () => set({ role: null, isAuthenticated: false }),
}));

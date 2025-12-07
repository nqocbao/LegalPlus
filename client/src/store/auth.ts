import { create } from 'zustand';

interface AuthState {
  token: string | null;
  email: string | null;
  role: 'user' | 'admin' | null;
  setAuth: (token: string, email: string, role: 'user' | 'admin') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  role: null,
  setAuth: (token, email, role) => set({ token, email, role }),
  logout: () => set({ token: null, email: null, role: null }),
}));

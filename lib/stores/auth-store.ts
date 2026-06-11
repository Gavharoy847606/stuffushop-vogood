import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Mock bcrypt verification - in production this would be done server-side
const VALID_CREDENTIALS = {
  email: "admin@gmail.com",
  password: "admin",
  user: {
    id: "1",
    email: "admin@gmail.com",
    name: "Admin User",
    role: "admin" as UserRole,
    avatar:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=face",
  },
};

// Additional mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "admin@gmail.com": {
    password: "admin",
    user: VALID_CREDENTIALS.user,
  },
  "anvar.admin@erp.com": {
    password: "password123",
    user: {
      id: "2",
      email: "anvar.admin@erp.com",
      name: "Anvar Admin",
      role: "admin",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  },
  "manager@erp.com": {
    password: "password123",
    user: {
      id: "2",
      email: "manager@erp.com",
      name: "Maria Manager",
      role: "manager",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
  },
  "employee@erp.com": {
    password: "password123",
    user: {
      id: "3",
      email: "employee@erp.com",
      name: "John Employee",
      role: "employee",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
  },
};

// Mock JWT generation
const generateMockJWT = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }),
  );
  const signature = btoa("mock-signature");
  return `${header}.${payload}.${signature}`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({
              error: data.error || "Invalid email or password",
              isLoading: false,
              isAuthenticated: false,
            });
            return false;
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: any) {
          set({
            error: err.message || "Server connection error",
            isLoading: false,
            isAuthenticated: false,
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "stuffus-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

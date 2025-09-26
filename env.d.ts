/// <reference types="vite/client" />

// Global module declarations for JS Pinia store typing
declare module '@/stores/modules/auth.js' {
  export interface User {
    id: string
    username: string
    name: string
    email: string
    role: string
    nomor_anggota?: string
    nik?: string
    alamat?: string
    telepon?: string
    created_at?: string
    updated_at?: string
  }

  export interface RegisterData {
    username: string
    password: string
    email: string
    name: string
    nik: string
    alamat: string
    telepon: string
  }

  export interface LoginCredentials {
    username: string
    password: string
  }

  export interface RegisterResponse {
    success: boolean
    data: {
      nomor_anggota: string
      simpanan_pokok: number
      user?: User
    }
    message: string
    token?: string
  }

  export interface LoginResponse {
    success: boolean
    data: {
      user: User
      token: string
    }
    message: string
  }

  export function useAuthStore(): {
    isAuthenticated: boolean
    isLoading: boolean
    user: User | null
    error: string | null
    token: string | null
    userRole: string | null
    isAnggota: boolean
    isPengurus: boolean
    isPengawas: boolean
    verifyAuth: () => Promise<boolean>
    register: (userData: RegisterData) => Promise<RegisterResponse>
    login: (credentials: LoginCredentials) => Promise<LoginResponse>
    logout: () => void
    clearError: () => void
  }
}

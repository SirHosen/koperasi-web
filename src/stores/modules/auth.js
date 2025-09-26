// auth.js - Authentication Store Module
import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../../router'

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role || null,
    userFullName: (state) => state.user?.name || '',
    isAnggota: (state) => state.user?.role === 'anggota',
    isPengurus: (state) => state.user?.role === 'pengurus',
    isPengawas: (state) => state.user?.role === 'pengawas',
  },

  actions: {
    // Set up axios auth header
    setAuthHeader() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } else {
        delete axios.defaults.headers.common['Authorization']
      }
    },

    // Login action
    async login(credentials) {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials)

        // Menyesuaikan dengan format response dari backend
        this.token = response.data.data.accessToken
        this.user = response.data.data.user

        // Save to localStorage
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))

        // Set auth header for future requests
        this.setAuthHeader()

        // Redirect based on user role
        if (this.user.role === 'anggota') {
          router.push('/anggota/dashboard')
        } else if (this.user.role === 'pengurus') {
          router.push('/pengurus/antrean')
        } else if (this.user.role === 'pengawas') {
          router.push('/pengawas/dashboard')
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed. Please check your credentials.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Register action
    async register(userData) {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.post(`${API_URL}/auth/register`, userData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed. Please try again.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Logout action
    async logout() {
      this.isLoading = true

      try {
        // Log out on server (if needed)
        if (this.token) {
          await axios.post(`${API_URL}/auth/logout`)
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear local state and storage regardless of server response
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
        this.isLoading = false
        router.push('/login')
      }
    },

    // Verify token and refresh user data
    async verifyAuth() {
      if (!this.token) return false

      this.setAuthHeader()

      try {
        const response = await axios.get(`${API_URL}/auth/verify`)
        this.user = response.data.data.user
        localStorage.setItem('user', JSON.stringify(this.user))
        return true
      } catch (error) {
        console.error('Token verification failed:', error)
        // Token invalid, clear auth
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete axios.defaults.headers.common['Authorization']
        return false
      }
    },

    // Clear error
    clearError() {
      this.error = null
    },
  },
})

// anggota.js - Anggota Store Module
import { defineStore } from 'pinia';
import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAnggotaStore = defineStore('anggota', {
  state: () => ({
    profile: null,
    isLoading: false,
    error: null,
    simpananSummary: null,
    pinjamanActive: [],
    pinjamanHistory: []
  }),

  getters: {
    hasActiveLoan: (state) => state.pinjamanActive.length > 0,
    totalSimpanan: (state) => state.simpananSummary?.total || 0,
    activeAnggota: (state) => state.profile?.statusAktif || false
  },

  actions: {
    // Set up axios auth header
    setAuthHeader() {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
    },

    // Get anggota profile for the current logged in user
    async getProfile() {
      this.isLoading = true;
      this.error = null;

      try {
        this.setAuthHeader();
        const response = await axios.get(`${API_URL}/anggota/profile`);
        this.profile = response.data.data;
        return this.profile;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load profile.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Get savings summary
    async getSimpananSummary() {
      this.isLoading = true;
      this.error = null;

      try {
        this.setAuthHeader();
        const response = await axios.get(`${API_URL}/anggota/simpanan/summary`);
        this.simpananSummary = response.data.data;
        return this.simpananSummary;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load simpanan summary.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Get active loans
    async getActivePinjaman() {
      this.isLoading = true;
      this.error = null;

      try {
        this.setAuthHeader();
        const response = await axios.get(`${API_URL}/anggota/pinjaman/active`);
        this.pinjamanActive = response.data.data;
        return this.pinjamanActive;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load active loans.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Get loan history
    async getPinjamanHistory() {
      this.isLoading = true;
      this.error = null;

      try {
        this.setAuthHeader();
        const response = await axios.get(`${API_URL}/anggota/pinjaman/history`);
        this.pinjamanHistory = response.data.data;
        return this.pinjamanHistory;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load loan history.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Get queue status for the active loan application
    async getQueueStatus() {
      this.isLoading = true;
      this.error = null;

      try {
        this.setAuthHeader();
        const response = await axios.get(`${API_URL}/anggota/pinjaman/queue-status`);
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load queue status.';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Clear error
    clearError() {
      this.error = null;
    }
  }
});
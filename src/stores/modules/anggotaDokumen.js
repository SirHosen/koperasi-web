// anggotaDokumen.js - Store module for anggota's document tracking
import { defineStore } from 'pinia'
import { pinjamanApi } from '@/api/pinjaman'

export const useAnggotaDokumenStore = defineStore('anggotaDokumen', {
  state: () => ({
    loanDocuments: [],
    currentLoanDocuments: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Get document verification progress percentage
    documentProgress: (state) => {
      if (!state.loanDocuments || state.loanDocuments.length === 0) {
        return 0
      }

      const totalLoanProgress = state.loanDocuments.reduce((sum, loan) => {
        if (loan.total_documents === 0) return sum

        // Calculate progress percentage for this loan
        const progress = (loan.accepted_documents / loan.total_documents) * 100
        return sum + progress
      }, 0)

      return Math.round(totalLoanProgress / state.loanDocuments.length)
    },

    // Get loans with pending documents
    pendingDocumentLoans: (state) => {
      if (!state.loanDocuments) return []

      return state.loanDocuments.filter(
        (loan) =>
          loan.pending_documents > 0 && ['antrean', 'verifikasi'].includes(loan.status_pinjaman),
      )
    },

    // Get loans with rejected documents
    rejectedDocumentLoans: (state) => {
      if (!state.loanDocuments) return []

      return state.loanDocuments.filter(
        (loan) =>
          loan.rejected_documents > 0 && ['antrean', 'verifikasi'].includes(loan.status_pinjaman),
      )
    },
  },

  actions: {
    // Load all document status for the member
    async loadDocuments() {
      this.isLoading = true
      this.error = null

      try {
        const response = await pinjamanApi.getMemberDocumentsStatus()
        this.loanDocuments = response.data.loans
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load document status'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Set current loan for detailed document view
    setCurrentLoan(loanId) {
      if (!this.loanDocuments) return null

      this.currentLoanDocuments = this.loanDocuments.find((loan) => loan.id === loanId) || null
      return this.currentLoanDocuments
    },

    // Clear current loan
    clearCurrentLoan() {
      this.currentLoanDocuments = null
    },

    // Clear error
    clearError() {
      this.error = null
    },
  },
})

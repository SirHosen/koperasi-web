// pinjamanVerifikasi.js - Store module for loan verification
import { defineStore } from 'pinia'
import { pinjamanApi } from '@/api/pinjaman'

export const usePinjamanVerifikasiStore = defineStore('pinjamanVerifikasi', {
  state: () => ({
    verifikasiList: [],
    currentVerifikasi: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    // Get all loans that need verification
    async getVerifikasiList() {
      this.isLoading = true
      this.error = null

      try {
        const response = await pinjamanApi.getVerifikasiList()
        this.verifikasiList = response.data.loans
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load verification list.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Get specific loan details
    async getLoanDetails(id) {
      this.isLoading = true
      this.error = null

      try {
        const response = await pinjamanApi.getLoanApplication(id)
        this.currentVerifikasi = response.data.loan
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load loan details.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Verify a document
    async verifyDocument(loanId, docId, status, notes = '') {
      this.isLoading = true
      this.error = null

      try {
        const response = await pinjamanApi.verifyDocument(loanId, docId, status, notes)

        // Update the current verification item if it matches
        if (this.currentVerifikasi && this.currentVerifikasi.id === loanId) {
          if (this.currentVerifikasi.dokumenPendukung) {
            const docIndex = this.currentVerifikasi.dokumenPendukung.findIndex(
              (doc) => doc.id === docId,
            )
            if (docIndex >= 0) {
              this.currentVerifikasi.dokumenPendukung[docIndex].status = status
              this.currentVerifikasi.dokumenPendukung[docIndex].catatan = notes
            }
          }
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to verify document.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Complete verification process
    async completeLoanVerification(loanId, isApproved, notes = '') {
      this.isLoading = true
      this.error = null

      try {
        const response = await pinjamanApi.completeLoanVerification(loanId, isApproved, notes)

        // Remove from verifikasiList if approved or rejected
        this.verifikasiList = this.verifikasiList.filter((loan) => loan.id !== loanId)
        if (this.currentVerifikasi && this.currentVerifikasi.id === loanId) {
          this.currentVerifikasi = null
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to complete verification.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Clear error
    clearError() {
      this.error = null
    },
  },
})

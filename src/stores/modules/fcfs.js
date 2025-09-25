// fcfs.js - FCFS Queue Store Module
import { defineStore } from 'pinia'
import { fcfsApi, pinjamanApi } from '@/api/pinjaman'

export const useFcfsStore = defineStore('fcfs', {
  state: () => ({
    queue: [],
    queueStats: null,
    currentProcessing: null,
    isLoading: false,
    error: null,
    processedItems: [],
    refreshInterval: null,
  }),

  getters: {
    queueLength: (state) => state.queue.length,
    averageWaitingTime: (state) => state.queueStats?.avg_processing_time || 0,
    totalProcessed: (state) => state.queueStats?.processed_today || 0,
  },

  actions: {
    // Get the current queue status
    async getQueueStatus() {
      this.isLoading = true
      this.error = null

      try {
        const response = await fcfsApi.getQueueStatus()
        this.queue = response.data.queue
        this.queueStats = response.data.stats

        // Also fetch processed items
        await this.getProcessedItems()

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load queue status.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Get processed loan applications
    async getProcessedItems() {
      try {
        const response = await fcfsApi.getProcessedItems()
        this.processedItems = response.data.processedItems
        return response.data.processedItems
      } catch (error) {
        console.error('Failed to load processed items:', error)
        return []
      }
    },

    // Process the next loan in queue (pengurus only)
    async processNext() {
      this.isLoading = true
      this.error = null

      try {
        const response = await fcfsApi.processNext()
        // Update the queue after processing
        await this.getQueueStatus()

        // Get details of the processed loan
        if (response.data.loanId) {
          const loanDetails = await pinjamanApi.getLoanApplication(response.data.loanId)
          this.currentProcessing = loanDetails.data.loan
        }

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to process next loan.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Approve the loan that's currently being processed
    async approveLoan(loanId, notes = '') {
      this.isLoading = true
      this.error = null

      try {
        const response = await fcfsApi.approveLoan(loanId, notes)
        // Update the queue after approving
        await this.getQueueStatus()
        this.currentProcessing = null
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to approve loan.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Reject the loan that's currently being processed
    async rejectLoan(loanId, notes = '') {
      this.isLoading = true
      this.error = null

      try {
        const response = await fcfsApi.rejectLoan(loanId, notes)
        // Update the queue after rejecting
        await this.getQueueStatus()
        this.currentProcessing = null
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to reject loan.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Skip the loan that's currently being processed (put back in queue)
    async skipLoan(loanId, notes = '') {
      this.isLoading = true
      this.error = null

      try {
        const response = await fcfsApi.skipLoan(loanId, notes)
        // Update the queue after skipping
        await this.getQueueStatus()
        this.currentProcessing = null
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to skip loan.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Get a member's loan status in queue
    async getMemberStatus(anggotaId) {
      this.isLoading = true
      this.error = null

      try {
        const response = await fcfsApi.getMemberStatus(anggotaId)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to get member loan status.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Submit a new loan application
    async submitLoan(loanData) {
      this.isLoading = true
      this.error = null

      try {
        const response = await pinjamanApi.submitApplication(loanData)
        // Update queue after submission
        await this.getQueueStatus()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to submit loan application.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Start auto-refresh of queue status
    startAutoRefresh(intervalSeconds = 30) {
      this.stopAutoRefresh() // Clear any existing interval
      this.refreshInterval = setInterval(() => {
        this.getQueueStatus()
      }, intervalSeconds * 1000)
    },

    // Stop auto-refresh
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    },

    // Clear error
    clearError() {
      this.error = null
    },
  },
})

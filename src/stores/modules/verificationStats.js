// verificationStats.js - Store module for verification statistics dashboard
import { defineStore } from 'pinia'
import { pinjamanApi } from '@/api/pinjaman'

export const useVerificationStatsStore = defineStore('verificationStats', {
  state: () => ({
    statistics: null,
    overall: {
      total_loans: 0,
      pending_verification: 0,
      approved: 0,
      rejected: 0,
      avg_processing_time_minutes: 0,
    },
    document_stats: {
      total_count: 0,
      approved_count: 0,
      rejected_count: 0,
      pending_count: 0,
    },
    document_types: [],
    processing_time_trend: {
      labels: [],
      values: [],
    },
    officers: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    // Calculate verification success rate
    successRate: (state) => {
      const { approved, rejected } = state.overall
      const total = approved + rejected
      return total === 0 ? 0 : Math.round((approved / total) * 100)
    },

    // Calculate document verification rate
    documentVerificationRate: (state) => {
      const { total_count, pending_count } = state.document_stats
      return total_count === 0 ? 0 : Math.round(((total_count - pending_count) / total_count) * 100)
    },

    // Format average processing time
    formattedProcessingTime: (state) => {
      const minutes = state.overall.avg_processing_time_minutes || 0
      if (minutes < 60) {
        return `${Math.round(minutes)} menit`
      } else if (minutes < 1440) {
        // less than 24 hours
        return `${Math.round(minutes / 60)} jam`
      } else {
        return `${Math.round(minutes / 1440)} hari`
      }
    },

    // Chart data for processing time trend
    processingTimeChartData: (state) => {
      return {
        labels: state.processing_time_trend.labels,
        datasets: [
          {
            label: 'Waktu Pemrosesan (menit)',
            data: state.processing_time_trend.values,
            fill: false,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            tension: 0.1,
          },
        ],
      }
    },

    // Document type chart data
    documentTypeChartData: (state) => {
      return {
        labels: state.document_types.map((type) => type.name),
        datasets: [
          {
            label: 'Tingkat Persetujuan (%)',
            data: state.document_types.map((type) => type.approval_rate),
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
            borderWidth: 1,
          },
        ],
      }
    },

    // Document status chart data
    documentStatusChartData: (state) => {
      const { approved_count, rejected_count, pending_count } = state.document_stats
      return {
        labels: ['Disetujui', 'Ditolak', 'Menunggu'],
        datasets: [
          {
            data: [approved_count, rejected_count, pending_count],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 206, 86, 0.6)',
            ],
            borderWidth: 1,
          },
        ],
      }
    },

    // Top performing officers
    topOfficers: (state) => {
      return [...state.officers].sort((a, b) => b.total_processed - a.total_processed).slice(0, 5)
    },
  },

  actions: {
    // Load verification statistics
    async loadStatistics(forceRefresh = false) {
      if (this.statistics && !forceRefresh) {
        return { status: 'success', data: this.statistics }
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await pinjamanApi.getVerificationStatistics()

        if (response.data) {
          this.statistics = response.data
          this.overall = response.data.overall || this.overall
          this.document_stats = response.data.document_stats || this.document_stats
          this.document_types = response.data.document_types || []
          this.processing_time_trend = response.data.processing_time_trend || {
            labels: [],
            values: [],
          }
          this.officers = response.data.officers || []
        }

        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load verification statistics.'
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})

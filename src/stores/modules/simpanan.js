import { defineStore } from 'pinia'
import { simpananApi } from '@/api/simpanan'

export const useSimpananStore = defineStore('simpanan', {
  state: () => ({
    simpanan: {
      pokok: 0,
      wajib: 0,
      sukarela: 0,
      total: 0
    },
    riwayatSimpanan: [],
    isLoading: false,
    error: null,
    successMessage: '',
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
    filterType: 'semua',
    dateRange: {
      start: null,
      end: null
    }
  }),
  
  getters: {
    formattedSimpanan: (state) => {
      return {
        pokok: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        }).format(state.simpanan.pokok),
        wajib: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        }).format(state.simpanan.wajib),
        sukarela: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        }).format(state.simpanan.sukarela),
        total: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        }).format(state.simpanan.total)
      }
    },
    
    availableBalance: (state) => {
      return state.simpanan.sukarela
    }
  },
  
  actions: {
    async fetchSimpananSummary() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await simpananApi.getSimpananSummary()
        this.simpanan = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data simpanan'
        console.error('Error fetching simpanan summary:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchRiwayatSimpanan() {
      this.isLoading = true
      this.error = null
      
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          jenis: this.filterType !== 'semua' ? this.filterType : undefined,
          startDate: this.dateRange.start,
          endDate: this.dateRange.end
        }
        
        const response = await simpananApi.getRiwayatSimpanan(params)
        this.riwayatSimpanan = response.data.simpanan
        this.totalItems = response.data.totalItems
        this.totalPages = response.data.totalPages
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat riwayat simpanan'
        console.error('Error fetching simpanan history:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    async setorSimpananSukarela(data) {
      this.isLoading = true
      this.error = null
      this.successMessage = ''
      
      try {
        await simpananApi.setorSimpananSukarela(data)
        this.successMessage = 'Penyetoran simpanan sukarela berhasil. Menunggu verifikasi pengurus.'
        
        // Refresh data
        await this.fetchSimpananSummary()
        await this.fetchRiwayatSimpanan()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal melakukan penyetoran'
        console.error('Error submitting simpanan sukarela:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    async tarikSimpananSukarela(data) {
      this.isLoading = true
      this.error = null
      this.successMessage = ''
      
      try {
        await simpananApi.tarikSimpananSukarela(data)
        this.successMessage = 'Permintaan penarikan simpanan sukarela berhasil. Menunggu verifikasi pengurus.'
        
        // Refresh data
        await this.fetchSimpananSummary()
        await this.fetchRiwayatSimpanan()
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal melakukan penarikan'
        console.error('Error withdrawing simpanan sukarela:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    async exportSimpanan(format) {
      this.isLoading = true
      this.error = null
      
      try {
        const params = {
          jenis: this.filterType !== 'semua' ? this.filterType : undefined,
          startDate: this.dateRange.start,
          endDate: this.dateRange.end
        }
        
        const response = await simpananApi.exportSimpananReport(format, params)
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `laporan-simpanan.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        this.successMessage = `Laporan ${format.toUpperCase()} berhasil diunduh`
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengunduh laporan'
        console.error('Error exporting simpanan report:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    setFilter(filterType) {
      this.filterType = filterType
      this.currentPage = 1
      this.fetchRiwayatSimpanan()
    },
    
    setDateRange(startDate, endDate) {
      this.dateRange.start = startDate
      this.dateRange.end = endDate
      this.currentPage = 1
      this.fetchRiwayatSimpanan()
    },
    
    setPage(page) {
      this.currentPage = page
      this.fetchRiwayatSimpanan()
    },
    
    clearMessages() {
      this.error = null
      this.successMessage = ''
    }
  }
})
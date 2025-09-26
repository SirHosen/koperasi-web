<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-chart-bar me-2"></i>
              Laporan Regulasi & Kepatuhan
            </h2>
            <p class="text-muted mb-0">Laporan sesuai standar Permenkop</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Cards -->
    <div class="row">
      <!-- Financial Reports Card -->
      <div class="col-lg-6 col-xl-3 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <div class="bg-primary bg-opacity-10 rounded-3 p-3 d-inline-block">
                <i class="fas fa-calculator fa-2x text-primary"></i>
              </div>
            </div>
            <h5 class="card-title">Laporan Keuangan</h5>
            <p class="card-text text-muted">Neraca, Laba-Rugi, dan Analisis Keuangan</p>
            <div class="d-grid gap-2">
              <button
                class="btn btn-primary"
                @click="generateReport('financial', 'excel')"
                :disabled="loading"
              >
                <i class="fas fa-file-excel me-2"></i>
                Excel
              </button>
              <button
                class="btn btn-outline-primary"
                @click="generateReport('financial', 'pdf')"
                :disabled="loading"
              >
                <i class="fas fa-file-pdf me-2"></i>
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Membership Reports Card -->
      <div class="col-lg-6 col-xl-3 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <div class="bg-success bg-opacity-10 rounded-3 p-3 d-inline-block">
                <i class="fas fa-users fa-2x text-success"></i>
              </div>
            </div>
            <h5 class="card-title">Laporan Keanggotaan</h5>
            <p class="card-text text-muted">Statistik dan Pertumbuhan Anggota</p>
            <div class="d-grid gap-2">
              <button
                class="btn btn-success"
                @click="generateReport('membership', 'excel')"
                :disabled="loading"
              >
                <i class="fas fa-file-excel me-2"></i>
                Excel
              </button>
              <button
                class="btn btn-outline-success"
                @click="generateReport('membership', 'pdf')"
                :disabled="loading"
              >
                <i class="fas fa-file-pdf me-2"></i>
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loan Reports Card -->
      <div class="col-lg-6 col-xl-3 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <div class="bg-warning bg-opacity-10 rounded-3 p-3 d-inline-block">
                <i class="fas fa-money-bill-wave fa-2x text-warning"></i>
              </div>
            </div>
            <h5 class="card-title">Laporan Pinjaman</h5>
            <p class="card-text text-muted">Analisis Kinerja Pinjaman & NPL</p>
            <div class="d-grid gap-2">
              <button
                class="btn btn-warning"
                @click="generateReport('loans', 'excel')"
                :disabled="loading"
              >
                <i class="fas fa-file-excel me-2"></i>
                Excel
              </button>
              <button
                class="btn btn-outline-warning"
                @click="generateReport('loans', 'pdf')"
                :disabled="loading"
              >
                <i class="fas fa-file-pdf me-2"></i>
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SHU Reports Card -->
      <div class="col-lg-6 col-xl-3 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <div class="bg-info bg-opacity-10 rounded-3 p-3 d-inline-block">
                <i class="fas fa-percentage fa-2x text-info"></i>
              </div>
            </div>
            <h5 class="card-title">Laporan SHU</h5>
            <p class="card-text text-muted">Distribusi Sisa Hasil Usaha</p>
            <div class="d-grid gap-2">
              <button
                class="btn btn-info"
                @click="generateReport('shu', 'excel')"
                :disabled="loading"
              >
                <i class="fas fa-file-excel me-2"></i>
                Excel
              </button>
              <button
                class="btn btn-outline-info"
                @click="generateReport('shu', 'pdf')"
                :disabled="loading"
              >
                <i class="fas fa-file-pdf me-2"></i>
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Period Selection -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">
              <i class="fas fa-calendar-alt me-2"></i>
              Filter Periode
            </h5>
            <div class="row g-3">
              <div class="col-md-4">
                <label for="startDate" class="form-label">Tanggal Mulai</label>
                <input
                  type="date"
                  class="form-control"
                  id="startDate"
                  v-model="filters.startDate"
                />
              </div>
              <div class="col-md-4">
                <label for="endDate" class="form-label">Tanggal Akhir</label>
                <input type="date" class="form-control" id="endDate" v-model="filters.endDate" />
              </div>
              <div class="col-md-4">
                <label for="reportPeriod" class="form-label">Periode Cepat</label>
                <select
                  class="form-select"
                  id="reportPeriod"
                  v-model="filters.quickPeriod"
                  @change="setQuickPeriod"
                >
                  <option value="">Pilih Periode</option>
                  <option value="thisMonth">Bulan Ini</option>
                  <option value="lastMonth">Bulan Lalu</option>
                  <option value="thisQuarter">Kuartal Ini</option>
                  <option value="lastQuarter">Kuartal Lalu</option>
                  <option value="thisYear">Tahun Ini</option>
                  <option value="lastYear">Tahun Lalu</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">
              <i class="fas fa-history me-2"></i>
              Laporan Terbaru
            </h5>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Jenis Laporan</th>
                    <th>Format</th>
                    <th>Periode</th>
                    <th>Dibuat</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="recentReports.length === 0">
                    <td colspan="6" class="text-center text-muted py-4">
                      <i class="fas fa-inbox fa-2x mb-2"></i>
                      <br />
                      Belum ada laporan yang dibuat
                    </td>
                  </tr>
                  <tr v-for="report in recentReports" :key="report.id">
                    <td>
                      <i :class="getReportIcon(report.type)" class="me-2"></i>
                      {{ getReportName(report.type) }}
                    </td>
                    <td>
                      <span class="badge" :class="getFormatBadgeClass(report.format)">
                        {{ report.format.toUpperCase() }}
                      </span>
                    </td>
                    <td>{{ formatDateRange(report.startDate, report.endDate) }}</td>
                    <td>{{ formatDateTime(report.createdAt) }}</td>
                    <td>
                      <span class="badge bg-success">
                        <i class="fas fa-check me-1"></i>
                        Selesai
                      </span>
                    </td>
                    <td>
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="downloadReport(report)"
                        title="Download Ulang"
                      >
                        <i class="fas fa-download"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style="background: rgba(0, 0, 0, 0.5); z-index: 9999"
    >
      <div class="bg-white rounded-3 p-4 text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mb-0">Generating report...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/auth.js'
import axios from 'axios'

// State
const loading = ref(false)
const recentReports = ref([])

const filters = reactive({
  startDate: '',
  endDate: '',
  quickPeriod: '',
})

// Auth store
const authStore = useAuthStore()

// Methods
const generateReport = async (type, format) => {
  if (!filters.startDate || !filters.endDate) {
    alert('Mohon pilih periode laporan terlebih dahulu')
    return
  }

  loading.value = true

  try {
    const response = await axios.get(`http://localhost:3000/api/reports/${type}`, {
      params: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: format,
      },
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      responseType: format === 'json' ? 'json' : 'blob',
    })

    if (format === 'json') {
      // Show data preview or handle JSON response
      console.log('Report data:', response.data)
    } else {
      // Download file
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-${type}-${filters.startDate}-${filters.endDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }

    // Add to recent reports
    recentReports.value.unshift({
      id: Date.now(),
      type: type,
      format: format,
      startDate: filters.startDate,
      endDate: filters.endDate,
      createdAt: new Date(),
    })

    // Keep only last 10 reports
    if (recentReports.value.length > 10) {
      recentReports.value = recentReports.value.slice(0, 10)
    }
  } catch (error) {
    console.error('Error generating report:', error)
    alert('Gagal membuat laporan. Silakan coba lagi.')
  } finally {
    loading.value = false
  }
}

const setQuickPeriod = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  switch (filters.quickPeriod) {
    case 'thisMonth':
      filters.startDate = new Date(year, month, 1).toISOString().split('T')[0]
      filters.endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
      break
    case 'lastMonth':
      filters.startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      filters.endDate = new Date(year, month, 0).toISOString().split('T')[0]
      break
    case 'thisQuarter':
      const quarterStart = Math.floor(month / 3) * 3
      filters.startDate = new Date(year, quarterStart, 1).toISOString().split('T')[0]
      filters.endDate = new Date(year, quarterStart + 3, 0).toISOString().split('T')[0]
      break
    case 'lastQuarter':
      const lastQuarterStart = Math.floor(month / 3) * 3 - 3
      const lastQuarterYear = lastQuarterStart < 0 ? year - 1 : year
      const adjustedQuarterStart = lastQuarterStart < 0 ? 9 : lastQuarterStart
      filters.startDate = new Date(lastQuarterYear, adjustedQuarterStart, 1)
        .toISOString()
        .split('T')[0]
      filters.endDate = new Date(lastQuarterYear, adjustedQuarterStart + 3, 0)
        .toISOString()
        .split('T')[0]
      break
    case 'thisYear':
      filters.startDate = new Date(year, 0, 1).toISOString().split('T')[0]
      filters.endDate = new Date(year, 11, 31).toISOString().split('T')[0]
      break
    case 'lastYear':
      filters.startDate = new Date(year - 1, 0, 1).toISOString().split('T')[0]
      filters.endDate = new Date(year - 1, 11, 31).toISOString().split('T')[0]
      break
  }
}

const getReportIcon = (type) => {
  const icons = {
    financial: 'fas fa-calculator text-primary',
    membership: 'fas fa-users text-success',
    loans: 'fas fa-money-bill-wave text-warning',
    shu: 'fas fa-percentage text-info',
  }
  return icons[type] || 'fas fa-file'
}

const getReportName = (type) => {
  const names = {
    financial: 'Laporan Keuangan',
    membership: 'Laporan Keanggotaan',
    loans: 'Laporan Pinjaman',
    shu: 'Laporan SHU',
  }
  return names[type] || type
}

const getFormatBadgeClass = (format) => {
  const classes = {
    excel: 'bg-success',
    pdf: 'bg-danger',
    json: 'bg-info',
  }
  return classes[format] || 'bg-secondary'
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('id-ID')
  const end = new Date(endDate).toLocaleDateString('id-ID')
  return `${start} - ${end}`
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('id-ID')
}

const downloadReport = (report) => {
  // Re-generate and download the report
  generateReport(report.type, report.format)
}

// Initialize component
onMounted(() => {
  // Set default to current month
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  filters.startDate = new Date(year, month, 1).toISOString().split('T')[0]
  filters.endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

  // Load recent reports from localStorage if available
  const savedReports = localStorage.getItem('recentReports')
  if (savedReports) {
    recentReports.value = JSON.parse(savedReports)
  }
})

// Save recent reports to localStorage when changed
import { watch } from 'vue'
watch(
  recentReports,
  (newReports) => {
    localStorage.setItem('recentReports', JSON.stringify(newReports))
  },
  { deep: true },
)
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.btn {
  transition: all 0.2s ease-in-out;
}

.table th {
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>

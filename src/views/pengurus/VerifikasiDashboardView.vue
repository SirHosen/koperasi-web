<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useVerificationStatsStore } from '@/stores/modules/verificationStats'
import type { VerificationStats } from '@/stores/modules/verificationStats'
import VerificationNavigation from '@/components/pengurus/VerificationNavigation.vue'
import Chart from 'chart.js/auto'

// Store
const statsStore = useVerificationStatsStore()

// State
const isLoading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const stats = ref<VerificationStats | null>(null)
const statsLoaded = ref(false)

// Format number with commas
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value)
}

// Format percentage
const formatPercentage = (value: number) => {
  return `${value}%`
}

// Load statistics
const loadStatistics = async () => {
  statsLoaded.value = false
  try {
    await statsStore.loadStatistics()
    stats.value = statsStore.statistics
    isLoading.value = false
    statsLoaded.value = true

    // Initialize charts after data is loaded
    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('Error loading verification statistics:', error)
    errorMessage.value = 'Gagal memuat statistik verifikasi'
  } finally {
    isLoading.value = false
  }
}

// Refresh statistics
const refreshStats = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await statsStore.loadStatistics(true) // Force refresh
    stats.value = statsStore.statistics

    // Re-initialize charts with fresh data
    nextTick(() => {
      initCharts()
    })

    // Show success message
    successMessage.value = 'Data berhasil diperbarui'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error refreshing statistics:', error)
    errorMessage.value = 'Gagal memperbarui data'
  } finally {
    isLoading.value = false
  }
}

// Initialize charts
const initCharts = () => {
  if (!stats.value || !stats.value.overall || !statsLoaded.value) return

  // Status Distribution Chart
  const statusCtx = document.getElementById('statusChart') as HTMLCanvasElement
  if (statusCtx) {
    new Chart(statusCtx, {
      type: 'pie',
      data: {
        labels: ['Menunggu', 'Diterima', 'Ditolak'],
        datasets: [
          {
            data: [
              stats.value.document_stats.pending_count,
              stats.value.document_stats.approved_count,
              stats.value.document_stats.rejected_count,
            ],
            backgroundColor: [
              'rgba(255, 206, 86, 0.7)', // yellow for pending
              'rgba(75, 192, 192, 0.7)', // green for approved
              'rgba(255, 99, 132, 0.7)', // red for rejected
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Distribusi Status Dokumen',
          },
        },
      },
    })
  }

  // Processing Time Chart
  const timeCtx = document.getElementById('timeChart') as HTMLCanvasElement
  if (timeCtx && stats.value.processing_time_trend.labels.length > 0) {
    new Chart(timeCtx, {
      type: 'line',
      data: {
        labels: stats.value.processing_time_trend.labels,
        datasets: [
          {
            label: 'Waktu Pemrosesan (Menit)',
            data: stats.value.processing_time_trend.values,
            fill: false,
            borderColor: 'rgba(54, 162, 235, 1)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Waktu (Menit)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Tanggal',
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Tren Waktu Pemrosesan Verifikasi',
          },
        },
      },
    })
  }

  // Document Type Verification Rate Chart
  const rateCtx = document.getElementById('rateChart') as HTMLCanvasElement
  if (rateCtx && stats.value.document_types.length > 0) {
    const labels = stats.value.document_types.map((type: { name: string }) => type.name)
    const approvalRates = stats.value.document_types.map(
      (type: { approval_rate: number }) => type.approval_rate,
    )

    new Chart(rateCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tingkat Persetujuan (%)',
            data: approvalRates,
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Persentase (%)',
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Tingkat Persetujuan per Jenis Dokumen',
          },
        },
      },
    })
  }
}

// Load data when component is mounted
onMounted(async () => {
  await loadStatistics()
})
</script>

<template>
  <div class="verification-stats-container">
    <h1 class="mb-4">Dashboard Verifikasi Pinjaman</h1>

    <VerificationNavigation activeTab="dashboard" />

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat statistik verifikasi...</p>
    </div>

    <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
      {{ errorMessage }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="errorMessage = ''">Tutup</button>
    </div>

    <div v-if="successMessage" class="alert alert-success mb-3" role="alert">
      {{ successMessage }}
    </div>

    <div v-else>
      <!-- Stats cards -->
      <div class="row">
        <div class="col-md-3 col-6">
          <div class="stat-card bg-primary text-white">
            <div class="stat-value">{{ formatNumber(statsStore.overall.total_loans) }}</div>
            <div class="stat-title">Total Pinjaman</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="stat-card bg-warning text-dark">
            <div class="stat-value">
              {{ formatNumber(statsStore.overall.pending_verification) }}
            </div>
            <div class="stat-title">Menunggu Verifikasi</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="stat-card bg-success text-white">
            <div class="stat-value">{{ formatPercentage(statsStore.successRate) }}</div>
            <div class="stat-title">Tingkat Persetujuan</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="stat-card bg-info text-white">
            <div class="stat-value">{{ statsStore.formattedProcessingTime }}</div>
            <div class="stat-title">Waktu Proses Rata-rata</div>
          </div>
        </div>
      </div>

      <!-- Document verification stats -->
      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Statistik Dokumen</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="document-stat">
                    <span class="document-stat-label">Total Dokumen:</span>
                    <span class="document-stat-value">{{
                      formatNumber(statsStore.document_stats.total_count)
                    }}</span>
                  </div>
                  <div class="document-stat">
                    <span class="document-stat-label">Dokumen Diterima:</span>
                    <span class="document-stat-value">{{
                      formatNumber(statsStore.document_stats.approved_count)
                    }}</span>
                  </div>
                  <div class="document-stat">
                    <span class="document-stat-label">Dokumen Ditolak:</span>
                    <span class="document-stat-value">{{
                      formatNumber(statsStore.document_stats.rejected_count)
                    }}</span>
                  </div>
                  <div class="document-stat">
                    <span class="document-stat-label">Dokumen Menunggu:</span>
                    <span class="document-stat-value">{{
                      formatNumber(statsStore.document_stats.pending_count)
                    }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="verification-progress">
                    <h6 class="text-center">Progres Verifikasi Dokumen</h6>
                    <div class="progress-circle-container">
                      <div class="progress-circle">
                        <div class="progress-circle-value">
                          {{ formatPercentage(statsStore.documentVerificationRate) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Performa Petugas</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Petugas</th>
                      <th>Total Diproses</th>
                      <th>Disetujui</th>
                      <th>Ditolak</th>
                      <th>Rata-rata (menit)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="officer in statsStore.topOfficers" :key="officer.officer_name">
                      <td>{{ officer.officer_name }}</td>
                      <td>{{ officer.total_processed }}</td>
                      <td>{{ officer.approved }}</td>
                      <td>{{ officer.rejected }}</td>
                      <td>{{ Math.round(officer.avg_processing_minutes) }}</td>
                    </tr>
                    <tr v-if="statsStore.officers.length === 0">
                      <td colspan="5" class="text-center">Tidak ada data performa</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Refresh Button -->
      <div class="action-buttons mb-4">
        <button @click="refreshStats" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-clockwise me-2"></i> Refresh Data
        </button>
      </div>

      <!-- Charts -->
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-body">
              <div class="chart-container">
                <canvas id="statusChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-body">
              <div class="chart-container">
                <canvas id="rateChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 mb-4">
          <div class="card">
            <div class="card-body">
              <div class="chart-container">
                <canvas id="timeChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verification-stats-container {
  padding: 1rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  height: 100%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-title {
  font-size: 1rem;
  opacity: 0.9;
}

.document-stat {
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
}

.document-stat-value {
  font-weight: bold;
}

.verification-progress {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.progress-circle-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}

.progress-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#28a745 calc(var(--percentage, 0) * 3.6deg), #e9ecef 0deg);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.progress-circle::before {
  content: '';
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: white;
}

.progress-circle-value {
  position: relative;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>

<style>
.progress-circle {
  --percentage: v-bind('statsStore.documentVerificationRate');
}
</style>

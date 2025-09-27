<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Pinjaman, PinjamanStatus } from '../../types'
import { useAnggotaStore } from '@/stores/modules/anggota'
import { useFcfsStore } from '@/stores/modules/fcfs'

// Store initialization
const anggotaStore = useAnggotaStore()
const fcfsStore = useFcfsStore()
const isLoading = ref(false)
const errorMessage = ref('')

// Loan and queue data
const currentLoan = ref<Pinjaman | null>(null)
const queueStats = ref({
  totalAntrean: 0,
  estimatedWaitingTime: 0, // minutes
  processedToday: 0,
})

// Get loan status from API
const fetchLoanStatus = async () => {
  isLoading.value = true
  try {
    // First get the anggota profile to get the anggota ID
    const profile = await anggotaStore.getProfile()

    // Then get the queue status for this anggota
    const queueStatus = await fcfsStore.getMemberStatus(profile.id)

    // Update state with the data from API
    if (queueStatus?.loanStatus) {
      currentLoan.value = {
        id: queueStatus.loanStatus.id,
        anggotaId: queueStatus.loanStatus.anggota_id,
        jumlah: queueStatus.loanStatus.jumlah,
        tenor: queueStatus.loanStatus.tenor,
        bunga: queueStatus.loanStatus.bunga,
        tujuan: queueStatus.loanStatus.tujuan,
        arrivalTime: queueStatus.loanStatus.arrival_time,
        statusPinjaman: queueStatus.loanStatus.status_pinjaman as PinjamanStatus,
        posisiAntrean: queueStatus.loanStatus.posisi_antrean,
        burstTime: queueStatus.loanStatus.burst_time,
        startProcessTime: queueStatus.loanStatus.start_process_time,
        finishProcessTime: queueStatus.loanStatus.finish_process_time,
        createdAt: queueStatus.loanStatus.created_at || '',
        updatedAt: queueStatus.loanStatus.updated_at || '',
      }

      queueStats.value = {
        totalAntrean: queueStatus.queueStats.total_antrean,
        estimatedWaitingTime: calculateEstimatedWaitTime(currentLoan.value),
        processedToday: queueStatus.queueStats.processed_today,
      }
    }
  } catch (error) {
    console.error('Error fetching loan status:', error)
    errorMessage.value = 'Gagal memuat status pinjaman. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

// Calculate more accurate waiting time estimation
const calculateEstimatedWaitTime = (loanData: Pinjaman | null) => {
  if (!loanData || loanData.statusPinjaman !== 'antrean') return 0

  // Base processing time (in minutes)
  const baseProcessingTime = 15 // 15 minutes per application

  // Burst time factor (complexity of loan application)
  const burstTimeFactor = loanData.burstTime || 1

  // Adjusted processing time based on complexity
  const adjustedProcessingTime = baseProcessingTime * burstTimeFactor

  // Position in queue (minus 1 because current position doesn't need waiting)
  const positionInQueue = Math.max(0, (loanData.posisiAntrean || 1) - 1)

  // Total estimated wait time
  const estimatedWaitTime = positionInQueue * adjustedProcessingTime

  // Add buffer time for peak hours (assume 20% buffer)
  const bufferTime = estimatedWaitTime * 0.2

  return Math.round(estimatedWaitTime + bufferTime)
}

// Calculate progress percentage
const calculateProgress = (loanData: Pinjaman | null) => {
  if (!loanData) return 0

  const statusProgress: Record<string, number> = {
    antrean: 20,
    verifikasi: 40,
    disetujui: 60,
    pencairan: 80,
    aktif: 100,
    lunas: 100,
    ditolak: 0,
  }

  return statusProgress[loanData.statusPinjaman] || 0
}

// Start refreshing queue status periodically
onMounted(() => {
  // Initial fetch
  fetchLoanStatus()

  // Refresh every 30 seconds
  const refreshTimer = setInterval(fetchLoanStatus, 30000)

  // Clean up on component unmount
  return () => {
    clearInterval(refreshTimer)
  }
})

// Format date string to localized format
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format time duration
const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} menit`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours} jam ${remainingMinutes} menit`
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

// Get current status label
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    antrean: 'Dalam Antrean',
    verifikasi: 'Sedang Diverifikasi',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
    pencairan: 'Proses Pencairan',
    aktif: 'Pinjaman Aktif',
    lunas: 'Lunas',
  }

  return statusMap[status] || status
}
</script>

<template>
  <div class="queue-status-container">
    <!-- Modern Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="bi bi-list-check"></i>
          Status Pinjaman FCFS
        </h1>
        <p class="page-subtitle">Pantau status dan posisi antrean pinjaman Anda secara real-time</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Memuat data pinjaman...</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="fetchLoanStatus" class="retry-button">Coba Lagi</button>
    </div>

    <div v-else-if="!currentLoan" class="no-loan-state">
      <p>Anda belum memiliki pengajuan pinjaman yang aktif.</p>
      <router-link to="/anggota/pinjaman/ajukan" class="apply-button">Ajukan Pinjaman</router-link>
    </div>

    <div v-else class="queue-card">
      <div class="status-header">
        <div class="loan-id">ID Pinjaman: {{ currentLoan.id }}</div>
        <div class="status-badge" :class="`status-${currentLoan.statusPinjaman}`">
          {{ getStatusLabel(currentLoan.statusPinjaman) }}
        </div>
      </div>

      <div class="queue-info">
        <div
          v-if="currentLoan?.posisiAntrean && currentLoan.posisiAntrean > 0"
          class="position-info"
        >
          <div class="position-number">{{ currentLoan.posisiAntrean }}</div>
          <div class="position-label">Posisi Antrean Anda</div>
          <div class="total-queue">dari {{ queueStats.totalAntrean }} pengajuan</div>
          <div class="time-estimate">
            <span class="estimate-label">Estimasi waktu tunggu:</span>
            <span class="estimate-value">{{
              formatDuration(calculateEstimatedWaitTime(currentLoan))
            }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-label">Progress Pengajuan</div>
            <div class="progress-container">
              <div
                class="progress-fill"
                :style="{ width: `${calculateProgress(currentLoan)}%` }"
              ></div>
            </div>
            <div class="progress-text">{{ calculateProgress(currentLoan) }}% selesai</div>
          </div>
        </div>

        <div v-else-if="currentLoan?.statusPinjaman === 'verifikasi'" class="processing-info">
          <div class="processing-icon">⏳</div>
          <div class="processing-text">Pengajuan pinjaman Anda sedang diverifikasi</div>
          <div class="processing-time">
            Mulai verifikasi: {{ formatDate(currentLoan.startProcessTime || '') }}
          </div>
        </div>

        <div v-else-if="currentLoan?.statusPinjaman === 'disetujui'" class="approval-info">
          <div class="approval-icon">✅</div>
          <div class="approval-text">Selamat! Pinjaman Anda telah disetujui</div>
          <div class="approval-time">
            Disetujui pada: {{ formatDate(currentLoan.finishProcessTime || '') }}
          </div>
        </div>
      </div>

      <div class="loan-details" v-if="currentLoan">
        <h2>Detail Pinjaman</h2>
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Jumlah Pinjaman</div>
            <div class="detail-value">{{ formatCurrency(currentLoan.jumlah) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Tenor</div>
            <div class="detail-value">{{ currentLoan.tenor }} bulan</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Bunga</div>
            <div class="detail-value">{{ currentLoan.bunga }}% per bulan</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Tujuan</div>
            <div class="detail-value">{{ currentLoan.tujuan }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Tanggal Pengajuan</div>
            <div class="detail-value">{{ formatDate(currentLoan.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="progress-tracker">
      <h2>Progress Tracker</h2>
      <div class="tracker-steps">
        <div
          class="tracker-step"
          :class="{
            completed: [
              'antrean',
              'verifikasi',
              'disetujui',
              'pencairan',
              'aktif',
              'lunas',
            ].includes(currentLoan?.statusPinjaman || ''),
          }"
        >
          <div class="step-icon">1</div>
          <div class="step-label">Pengajuan</div>
        </div>
        <div
          class="tracker-step"
          :class="{
            completed: ['verifikasi', 'disetujui', 'pencairan', 'aktif', 'lunas'].includes(
              currentLoan?.statusPinjaman || '',
            ),
          }"
        >
          <div class="step-icon">2</div>
          <div class="step-label">Verifikasi</div>
        </div>
        <div
          class="tracker-step"
          :class="{
            completed: ['disetujui', 'pencairan', 'aktif', 'lunas'].includes(
              currentLoan?.statusPinjaman || '',
            ),
          }"
        >
          <div class="step-icon">3</div>
          <div class="step-label">Persetujuan</div>
        </div>
        <div
          class="tracker-step"
          :class="{
            completed: ['pencairan', 'aktif', 'lunas'].includes(currentLoan?.statusPinjaman || ''),
          }"
        >
          <div class="step-icon">4</div>
          <div class="step-label">Pencairan</div>
        </div>
        <div
          class="tracker-step"
          :class="{ completed: ['aktif', 'lunas'].includes(currentLoan?.statusPinjaman || '') }"
        >
          <div class="step-icon">5</div>
          <div class="step-label">Aktif</div>
        </div>
      </div>
    </div>

    <div class="queue-stats">
      <h2>Statistik Antrean</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ queueStats.totalAntrean }}</div>
          <div class="stat-label">Total dalam Antrean</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatDuration(queueStats.estimatedWaitingTime) }}</div>
          <div class="stat-label">Estimasi Waktu Tunggu</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ queueStats.processedToday }}</div>
          <div class="stat-label">Diproses Hari Ini</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.queue-status-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* Modern Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.header-content h1 i {
  font-size: 2rem;
  opacity: 0.9;
}

.page-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
}

/* Loading State */
.loading-state {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-state p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Error State */
.error-message {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.error-message p {
  color: #ef4444;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* No Loan State */
.no-loan-state {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.no-loan-state p {
  color: #6b7280;
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

.apply-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.apply-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  text-decoration: none;
  color: white;
}

/* Queue Card */
.queue-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 2rem;
}

.status-header {
  padding: 1.5rem 2rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loan-id {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-antrean {
  background: #3b82f6;
}
.status-verifikasi {
  background: #f59e0b;
}
.status-disetujui {
  background: #10b981;
}
.status-ditolak {
  background: #ef4444;
}
.status-pencairan {
  background: #8b5cf6;
}
.status-aktif {
  background: #6366f1;
}
.status-lunas {
  background: #6b7280;
}

/* Queue Info */
.queue-info {
  padding: 2rem;
}

.position-info {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.position-number {
  font-size: 4rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
  margin-bottom: 1rem;
}

.position-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.total-queue {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.time-estimate {
  padding: 1rem;
  background: #eff6ff;
  border-radius: 8px;
  color: #1e40af;
  border: 1px solid #dbeafe;
}

.estimate-label {
  font-weight: 500;
  margin-right: 0.5rem;
}

.estimate-value {
  font-weight: 600;
}

.processing-info,
.approval-info {
  text-align: center;
  padding: 2rem;
}

.processing-icon,
.approval-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.processing-text,
.approval-text {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.processing-time,
.approval-time {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Loan Details */
.loan-details {
  padding: 2rem;
  border-top: 1px solid #e5e7eb;
}

.loan-details h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.detail-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
}

/* Progress Tracker */
.progress-tracker {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 2rem;
  margin-bottom: 2rem;
}

.progress-tracker h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 2rem;
  text-align: center;
}

.tracker-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 0 2rem;
}

.tracker-steps::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 2rem;
  right: 2rem;
  height: 2px;
  background: linear-gradient(90deg, #e5e7eb 0%, #10b981 100%);
  z-index: 0;
  border-radius: 1px;
}

.tracker-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  z-index: 1;
}

.step-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.step-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s ease;
}

.step-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  text-align: center;
}

.tracker-step.completed .step-icon {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.tracker-step.completed .step-label {
  color: #10b981;
  font-weight: 600;
}

.tracker-step.active .step-icon {
  background: #667eea;
  border-color: #667eea;
  color: white;
  animation: pulse 2s infinite;
}

.tracker-step.active .step-label {
  color: #667eea;
  font-weight: 600;
}

/* Queue Stats */
.queue-stats {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 2rem;
}

.queue-stats h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .queue-status-container {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .header-content h1 {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .status-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .position-number {
    font-size: 3rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .tracker-steps {
    flex-direction: column;
    gap: 2rem;
    padding: 0;
  }

  .tracker-steps::before {
    top: 0;
    bottom: 0;
    left: 24px;
    right: auto;
    width: 2px;
    height: auto;
  }

  .tracker-step {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  .step-icon {
    margin-bottom: 0;
  }
}

@media (max-width: 480px) {
  .queue-status-container {
    padding: 0.5rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-content h1 {
    font-size: 1.75rem;
  }
}

/* Progress Bar Styles */
.progress-bar {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.progress-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.progress-container {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}

.progress-text {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

/* Enhanced Time Estimate */
.time-estimate {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.estimate-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.estimate-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}
.queue-card,
.progress-tracker,
.queue-stats {
  margin-bottom: 1rem;
}

.status-header,
.queue-info,
.loan-details {
  padding: 1rem;
}

.position-number {
  font-size: 2.5rem;
}

.processing-icon,
.approval-icon {
  font-size: 3rem;
}
</style>

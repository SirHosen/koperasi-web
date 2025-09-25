<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Pinjaman } from '../../types'
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
        statusPinjaman: queueStatus.loanStatus.status_pinjaman,
        posisiAntrean: queueStatus.loanStatus.posisi_antrean,
        burstTime: queueStatus.loanStatus.burst_time,
        startProcessTime: queueStatus.loanStatus.start_process_time,
        finishProcessTime: queueStatus.loanStatus.finish_process_time,
        createdAt: queueStatus.loanStatus.created_at,
        updatedAt: queueStatus.loanStatus.updated_at,
      }

      queueStats.value = {
        totalAntrean: queueStatus.queueStats.total_antrean,
        estimatedWaitingTime: queueStatus.queueStats.estimatedWaitingTime,
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

// Status color mapping
const statusColors = {
  antrean: 'bg-blue-500',
  verifikasi: 'bg-yellow-500',
  disetujui: 'bg-green-500',
  ditolak: 'bg-red-500',
  pencairan: 'bg-purple-500',
  aktif: 'bg-indigo-500',
  lunas: 'bg-gray-500',
}

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
    <h1>Status Antrean FCFS</h1>

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
              formatDuration(queueStats.estimatedWaitingTime)
            }}</span>
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
            ].includes(currentLoan.statusPinjaman),
          }"
        >
          <div class="step-icon">1</div>
          <div class="step-label">Pengajuan</div>
        </div>
        <div
          class="tracker-step"
          :class="{
            completed: ['verifikasi', 'disetujui', 'pencairan', 'aktif', 'lunas'].includes(
              currentLoan.statusPinjaman,
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
              currentLoan.statusPinjaman,
            ),
          }"
        >
          <div class="step-icon">3</div>
          <div class="step-label">Persetujuan</div>
        </div>
        <div
          class="tracker-step"
          :class="{
            completed: ['pencairan', 'aktif', 'lunas'].includes(currentLoan.statusPinjaman),
          }"
        >
          <div class="step-icon">4</div>
          <div class="step-label">Pencairan</div>
        </div>
        <div
          class="tracker-step"
          :class="{ completed: ['aktif', 'lunas'].includes(currentLoan.statusPinjaman) }"
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
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.queue-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.loan-id {
  font-weight: 500;
  color: #4b5563;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.status-antrean {
  background-color: #3b82f6;
}

.status-verifikasi {
  background-color: #f59e0b;
}

.status-disetujui {
  background-color: #10b981;
}

.status-ditolak {
  background-color: #ef4444;
}

.status-pencairan {
  background-color: #8b5cf6;
}

.status-aktif {
  background-color: #6366f1;
}

.status-lunas {
  background-color: #6b7280;
}

.queue-info {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.position-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.position-number {
  font-size: 3rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
  margin-bottom: 0.75rem;
}

.position-label {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.total-queue {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.time-estimate {
  padding: 0.75rem;
  background-color: #eff6ff;
  border-radius: 0.375rem;
  color: #1e40af;
}

.estimate-label {
  font-weight: 500;
  margin-right: 0.5rem;
}

.processing-info,
.approval-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.processing-icon,
.approval-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.processing-text,
.approval-text {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.processing-time,
.approval-time {
  color: #6b7280;
}

.loan-details {
  margin-top: 2rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.detail-item {
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

.detail-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 500;
  color: #111827;
}

.progress-tracker {
  margin-bottom: 2rem;
}

.tracker-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.tracker-steps::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e5e7eb;
  z-index: 0;
}

.tracker-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: 2px solid #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  z-index: 1;
}

.step-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.tracker-step.completed .step-icon {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}

.tracker-step.completed .step-label {
  color: #10b981;
  font-weight: 500;
}

.tracker-step.completed + .tracker-step.completed::before {
  background-color: #10b981;
}

.queue-stats {
  margin-top: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tracker-steps {
    flex-direction: column;
    gap: 1.5rem;
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
}
</style>

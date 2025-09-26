<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useFcfsStore } from '@/stores/modules/fcfs'
import VerificationNavigation from '@/components/pengurus/VerificationNavigation.vue'

// Use FCFS store
const fcfsStore = useFcfsStore()
const isLoading = ref(true)
const errorMessage = ref('')
const isProcessing = ref(false)
const processingNotes = ref('')
const autoRefreshInterval = ref<number | null>(null)

// Search and filter options
const searchTerm = ref('')
const filterStatus = ref('all')

// Fetch queue from API
const fetchQueue = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Get queue data from FCFS store
    await fcfsStore.getQueueStatus()
  } catch (error) {
    console.error('Error fetching queue data:', error)
    errorMessage.value = 'Gagal mengambil data antrean. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

// Auto-refresh queue every 60 seconds
const setupAutoRefresh = () => {
  stopAutoRefresh()
  autoRefreshInterval.value = window.setInterval(() => {
    fetchQueue()
  }, 60000) // 60 seconds
}

// Stop auto refresh
const stopAutoRefresh = () => {
  if (autoRefreshInterval.value !== null) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
}

// Process next loan in queue
const processNextLoan = async () => {
  if (isProcessing.value) return

  isProcessing.value = true
  errorMessage.value = ''

  try {
    await fcfsStore.processNext()
  } catch (error) {
    console.error('Error processing next loan:', error)
    errorMessage.value = 'Gagal memproses pinjaman berikutnya.'
  } finally {
    isProcessing.value = false
  }
}

// Approve current loan
const approveLoan = async (loanId: string) => {
  if (isProcessing.value || !fcfsStore.currentProcessing) return

  isProcessing.value = true
  errorMessage.value = ''

  try {
    // Update with your actual API call
    await fcfsStore.approveLoan(loanId, processingNotes.value)
    processingNotes.value = ''
    await fetchQueue()
  } catch (error) {
    console.error('Error approving loan:', error)
    errorMessage.value = 'Gagal menyetujui pinjaman.'
  } finally {
    isProcessing.value = false
  }
}

// Reject current loan
const rejectLoan = async (loanId: string) => {
  if (isProcessing.value || !fcfsStore.currentProcessing) return

  isProcessing.value = true
  errorMessage.value = ''

  try {
    // Update with your actual API call
    await fcfsStore.rejectLoan(loanId, processingNotes.value)
    processingNotes.value = ''
    await fetchQueue()
  } catch (error) {
    console.error('Error rejecting loan:', error)
    errorMessage.value = 'Gagal menolak pinjaman.'
  } finally {
    isProcessing.value = false
  }
}

// Skip current loan
const skipLoan = async (loanId: string) => {
  if (isProcessing.value || !fcfsStore.currentProcessing) return

  isProcessing.value = true
  errorMessage.value = ''

  try {
    // Update with your actual API call
    await fcfsStore.skipLoan(loanId, processingNotes.value)
    processingNotes.value = ''
    await fetchQueue()
  } finally {
    isProcessing.value = false
  }
}

// Format date and time
const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get badge class based on loan status
const getBadgeClass = (status: string) => {
  switch (status) {
    case 'disetujui':
      return 'bg-success'
    case 'ditolak':
      return 'bg-danger'
    case 'verifikasi':
      return 'bg-warning'
    case 'antrean':
      return 'bg-info'
    default:
      return 'bg-secondary'
  }
}

// Get status text
const getStatusText = (status: string) => {
  switch (status) {
    case 'disetujui':
      return 'Disetujui'
    case 'ditolak':
      return 'Ditolak'
    case 'verifikasi':
      return 'Verifikasi'
    case 'antrean':
      return 'Antrean'
    case 'pencairan':
      return 'Pencairan'
    case 'aktif':
      return 'Aktif'
    case 'lunas':
      return 'Lunas'
    default:
      return status
  }
}

// Filter queue based on search
const filteredQueue = computed(() => {
  if (!searchTerm.value) {
    return fcfsStore.queue
  }

  const search = searchTerm.value.toLowerCase()
  return fcfsStore.queue.filter((item) => {
    return (
      item.id.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search) ||
      item.nomor_anggota.toLowerCase().includes(search) ||
      item.tujuan.toLowerCase().includes(search)
    )
  })
})

// Filter processed items based on status and search
const filteredProcessedItems = computed(() => {
  let items = fcfsStore.processedItems || []

  // Filter by status if not "all"
  if (filterStatus.value !== 'all') {
    items = items.filter((item) => item.status_pinjaman === filterStatus.value)
  }

  // Filter by search term if present
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    items = items.filter((item) => {
      return (
        item.id.toLowerCase().includes(search) ||
        item.name.toLowerCase().includes(search) ||
        item.nomor_anggota.toLowerCase().includes(search) ||
        item.tujuan.toLowerCase().includes(search)
      )
    })
  }

  return items
})

// Lifecycle hooks
onMounted(() => {
  fetchQueue()
  setupAutoRefresh()
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script>

<template>
  <div class="antrian-container">
    <h1 class="title">Antrean Pinjaman (FCFS)</h1>

    <VerificationNavigation activeTab="queue" />

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat data antrean...</p>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchQueue">Coba Lagi</button>
    </div>

    <template v-else>
      <div class="card mb-4 p-4 bg-light">
        <h3>Status Antrean</h3>
        <div class="row">
          <div class="col-md-4">
            <div class="stat-item">
              <h4>Total Antrean</h4>
              <p class="stat-value">{{ fcfsStore.queueStats?.total_antrean || 0 }}</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-item">
              <h4>Rata-rata Waktu Proses</h4>
              <p class="stat-value">{{ fcfsStore.queueStats?.avg_processing_time || 0 }} menit</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-item">
              <h4>Masuk Antrean Hari Ini</h4>
              <p class="stat-value">{{ fcfsStore.queueStats?.arrived_today || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex gap-3 mb-4">
        <button
          class="btn btn-primary"
          @click="processNextLoan"
          :disabled="isProcessing || fcfsStore.queue.length === 0"
        >
          <span
            v-if="isProcessing"
            class="spinner-border spinner-border-sm me-1"
            role="status"
          ></span>
          Proses Berikutnya
        </button>
        <button class="btn btn-outline-secondary" @click="fetchQueue" :disabled="isLoading">
          <i class="bi bi-arrow-clockwise me-1"></i> Segarkan Antrean
        </button>
      </div>

      <div v-if="fcfsStore.currentProcessing" class="card mb-4 p-4 border-info">
        <h3>Sedang Diproses</h3>
        <div class="row">
          <div class="col-md-3">
            <p><strong>ID Pinjaman:</strong> {{ fcfsStore.currentProcessing.id }}</p>
            <p>
              <strong>Anggota:</strong> {{ fcfsStore.currentProcessing.name }} ({{
                fcfsStore.currentProcessing.nomor_anggota
              }})
            </p>
            <p>
              <strong>Jumlah:</strong> Rp
              {{ fcfsStore.currentProcessing.jumlah.toLocaleString('id-ID') }}
            </p>
          </div>
          <div class="col-md-3">
            <p><strong>Tenor:</strong> {{ fcfsStore.currentProcessing.tenor }} bulan</p>
            <p><strong>Bunga:</strong> {{ fcfsStore.currentProcessing.bunga }}%</p>
            <p>
              <strong>Masuk Antrean:</strong>
              {{ formatDateTime(fcfsStore.currentProcessing.arrival_time) }}
            </p>
          </div>
          <div class="col-md-6">
            <p><strong>Tujuan:</strong> {{ fcfsStore.currentProcessing.tujuan }}</p>
            <div class="mb-3">
              <label for="processingNotes" class="form-label">Catatan</label>
              <textarea
                id="processingNotes"
                class="form-control"
                v-model="processingNotes"
                rows="2"
              ></textarea>
            </div>
            <div class="d-flex gap-2">
              <button
                class="btn btn-success"
                @click="approveLoan(fcfsStore.currentProcessing.id)"
                :disabled="isProcessing"
              >
                Setujui
              </button>
              <button
                class="btn btn-warning"
                @click="skipLoan(fcfsStore.currentProcessing.id)"
                :disabled="isProcessing"
              >
                Lewati
              </button>
              <button
                class="btn btn-danger"
                @click="rejectLoan(fcfsStore.currentProcessing.id)"
                :disabled="isProcessing"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-header">
              <h3>Antrean Pinjaman</h3>
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-info">Total: {{ fcfsStore.queue.length }}</span>
                </div>
                <div class="input-group" style="max-width: 300px">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Cari anggota atau ID..."
                    v-model="searchTerm"
                  />
                  <button class="btn btn-outline-secondary" type="button">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Posisi</th>
                    <th>ID Pinjaman</th>
                    <th>Anggota</th>
                    <th>Jumlah</th>
                    <th>Waktu Masuk</th>
                    <th>Est. Waktu Proses</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredQueue" :key="item.id">
                    <td>{{ item.posisi_antrean }}</td>
                    <td>{{ item.id }}</td>
                    <td>{{ item.name }} ({{ item.nomor_anggota }})</td>
                    <td>Rp {{ item.jumlah.toLocaleString('id-ID') }}</td>
                    <td>{{ formatDateTime(item.arrival_time) }}</td>
                    <td>{{ item.burst_time }} menit</td>
                  </tr>
                  <tr v-if="filteredQueue.length === 0">
                    <td colspan="6" class="text-center py-4">
                      Tidak ada antrean pinjaman saat ini.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-header">
              <h3>Pinjaman Diproses</h3>
              <div class="btn-group" role="group">
                <button
                  type="button"
                  class="btn"
                  :class="filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="filterStatus = 'all'"
                >
                  Semua
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="filterStatus === 'disetujui' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="filterStatus = 'disetujui'"
                >
                  Disetujui
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="filterStatus === 'ditolak' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="filterStatus = 'ditolak'"
                >
                  Ditolak
                </button>
              </div>
            </div>
            <div class="card-body">
              <div
                v-for="item in filteredProcessedItems"
                :key="item.id"
                class="processed-item mb-3"
              >
                <div class="d-flex justify-content-between">
                  <span class="badge" :class="getBadgeClass(item.status_pinjaman)">
                    {{ getStatusText(item.status_pinjaman) }}
                  </span>
                  <small class="text-muted">{{ formatDateTime(item.finish_process_time) }}</small>
                </div>
                <p class="mb-1">ID: {{ item.id }}</p>
                <p class="mb-1">Anggota: {{ item.name }} ({{ item.nomor_anggota }})</p>
                <p class="mb-1">
                  Rp {{ item.jumlah.toLocaleString('id-ID') }} / {{ item.tenor }} bulan
                </p>
                <p v-if="item.catatan" class="mb-0 fst-italic">
                  <small>Catatan: {{ item.catatan }}</small>
                </p>
              </div>
              <div v-if="filteredProcessedItems.length === 0" class="text-center py-4">
                Belum ada pinjaman yang diproses.
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Import modern design system */
@import '@/styles/modern-design-system.css';

.antrian-container {
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.title {
  margin-bottom: 2rem;
  color: var(--gray-800);
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title::before {
  content: '⏱️';
  font-size: 1.5rem;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all var(--transition-normal);
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.stat-item h4 {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0;
}

.processed-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1rem;
  border-left: 4px solid var(--gray-300);
  margin-bottom: 1rem;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.processed-item:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.processed-item:nth-child(odd) {
  border-left-color: #667eea;
}

.processed-item:nth-child(even) {
  border-left-color: #8b5cf6;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bg-success {
  background: var(--success-gradient) !important;
}

.bg-danger {
  background: var(--danger-gradient) !important;
}

.bg-warning {
  background: var(--warning-gradient) !important;
}

.bg-info {
  background: var(--primary-gradient) !important;
}

.bg-secondary {
  background: linear-gradient(135deg, #6b7280, #9ca3af) !important;
}

/* Modern Cards */
.card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  overflow: hidden;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.card-header {
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

/* Modern Buttons */
.btn {
  border-radius: 0.75rem;
  font-weight: 600;
  padding: 0.875rem 1.5rem;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-slow);
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: var(--primary-gradient);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  color: white;
}

.btn-outline-secondary {
  background: rgba(255, 255, 255, 0.8);
  border-color: var(--gray-200);
  color: var(--gray-600);
}

.btn-outline-secondary:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  color: #667eea;
}

.btn-success {
  background: var(--success-gradient);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  color: white;
}

.btn-warning {
  background: var(--warning-gradient);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  color: white;
}

.btn-danger {
  background: var(--danger-gradient);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
  color: white;
}

/* Modern Tables */
.table {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.table thead {
  background: var(--primary-gradient);
  color: white;
}

.table th {
  border: none;
  font-weight: 600;
  padding: 1rem 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
}

.table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  vertical-align: middle;
}

.table tbody tr {
  transition: all var(--transition-fast);
}

.table tbody tr:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: scale(1.01);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

/* Modern Form Controls */
.form-control {
  border: 2px solid var(--gray-200);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.form-label {
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

/* Modern Alert */
.alert {
  border: none;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
  border-left: 4px solid;
}

.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
  border-left-color: #ef4444;
}

/* Modern Spinner */
.spinner-border {
  border: 3px solid rgba(102, 126, 234, 0.1);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .antrian-container {
    padding: 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .card-header,
  .card-body {
    padding: 1rem;
  }

  .table th,
  .table td {
    padding: 0.75rem;
  }

  .stat-item {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .antrian-container {
    padding: 0.5rem;
  }

  .title {
    font-size: 1.25rem;
  }

  .btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}
</style>

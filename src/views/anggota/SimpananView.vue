<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSimpananStore } from '@/stores/modules/simpanan'
import { useErrorHandler } from '@/lib/errorHandler'
import Chart from 'chart.js/auto'

const simpananStore = useSimpananStore()
const {
  error: errorMessage,
  loading: isLoading,
  success: successMessage,
  handleAsync,
  showSuccess,
} = useErrorHandler()

// Tabs
const activeTab = ref('summary')

// Rekening KSP state
const copied = ref(false)
const showTransferInfo = ref(false)

// Form data
const setorForm = ref({
  jumlah: '',
  keterangan: '',
})

const tarikForm = ref({
  jumlah: '',
  keterangan: '',
})

// Chart reference
const simpananChartCanvas = ref<HTMLCanvasElement | null>(null)
let simpananChart: Chart | null = null

onMounted(async () => {
  await handleAsync(async () => {
    await simpananStore.fetchSimpananSummary()
    await simpananStore.fetchRiwayatSimpanan()
    renderSimpananChart()
  }, 'Gagal memuat data simpanan')
})

function renderSimpananChart() {
  if (simpananChart) {
    simpananChart.destroy()
  }

  if (!simpananChartCanvas.value) return

  const ctx = simpananChartCanvas.value.getContext('2d')

  if (!ctx) return

  const { pokok, wajib, sukarela } = simpananStore.simpanan

  simpananChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Pokok', 'Wajib', 'Sukarela'],
      datasets: [
        {
          data: [pokok, wajib, sukarela],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 206, 86, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Komposisi Simpanan',
        },
      },
    },
  })
}

async function handleSetorSubmit() {
  if (!setorForm.value.jumlah || parseFloat(setorForm.value.jumlah) <= 0) {
    errorMessage.value = 'Jumlah simpanan harus lebih dari 0'
    return
  }

  const result = await handleAsync(
    () =>
      simpananStore.setorSimpananSukarela({
        jumlah: parseFloat(setorForm.value.jumlah),
        keterangan: setorForm.value.keterangan || 'Simpanan sukarela',
      }),
    'Gagal melakukan penyetoran',
  )

  if (result) {
    setorForm.value = { jumlah: '', keterangan: '' }
    showSuccess(simpananStore.successMessage)
    renderSimpananChart()
  }
}

async function handleTarikSubmit() {
  if (!tarikForm.value.jumlah || parseFloat(tarikForm.value.jumlah) <= 0) {
    errorMessage.value = 'Jumlah penarikan harus lebih dari 0'
    return
  }

  if (!tarikForm.value.keterangan) {
    errorMessage.value = 'Keterangan penarikan wajib diisi'
    return
  }

  const result = await handleAsync(
    () =>
      simpananStore.tarikSimpananSukarela({
        jumlah: parseFloat(tarikForm.value.jumlah),
        keterangan: tarikForm.value.keterangan,
      }),
    'Gagal melakukan penarikan',
  )

  if (result) {
    tarikForm.value = { jumlah: '', keterangan: '' }
    showSuccess(simpananStore.successMessage)
    renderSimpananChart()
  }
}

function handleFilterChange(type: string) {
  simpananStore.setFilter(type)
}

function handlePageChange(page: number) {
  simpananStore.setPage(page)
}

async function exportData(format: 'pdf' | 'excel') {
  const result = await handleAsync(
    () => simpananStore.exportSimpanan(format),
    `Gagal mengunduh laporan ${format.toUpperCase()}`,
  )

  if (result) {
    showSuccess(simpananStore.successMessage)
  }
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
const getBadgeClass = (jenis: string) => {
  switch (jenis) {
    case 'pokok':
      return 'bg-primary'
    case 'wajib':
      return 'bg-success'
    case 'sukarela':
      return 'bg-warning'
    default:
      return 'bg-primary'
  }
}

const getJenisLabel = (jenis: string) => {
  switch (jenis) {
    case 'pokok':
      return 'Pokok'
    case 'wajib':
      return 'Wajib'
    case 'sukarela':
      return 'Sukarela'
    default:
      return 'Pokok'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'diverifikasi':
      return 'bg-success'
    case 'menunggu':
      return 'bg-warning'
    case 'ditolak':
      return 'bg-danger'
    default:
      return 'bg-primary'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'diverifikasi':
      return 'Diverifikasi'
    case 'menunggu':
      return 'Menunggu'
    case 'ditolak':
      return 'Ditolak'
    default:
      return 'Diverifikasi'
  }
}

// Copy account number function
const copyAccountNumber = async () => {
  try {
    await navigator.clipboard.writeText('1234-5678-9012')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

// Format date function
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="simpanan-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Manajemen Simpanan</h1>
        <p>Kelola simpanan pokok, wajib, dan sukarela Anda</p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-tabs-container">
      <div class="nav-tabs-wrapper">
        <button
          :class="['nav-tab', { active: activeTab === 'summary' }]"
          @click="activeTab = 'summary'"
        >
          <i class="bi bi-graph-up"></i>
          <span>Ringkasan</span>
        </button>
        <button
          :class="['nav-tab', { active: activeTab === 'history' }]"
          @click="activeTab = 'history'"
        >
          <i class="bi bi-clock-history"></i>
          <span>Riwayat</span>
        </button>
        <button
          :class="['nav-tab', { active: activeTab === 'transaction' }]"
          @click="activeTab = 'transaction'"
        >
          <i class="bi bi-arrow-left-right"></i>
          <span>Transaksi</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Summary Tab -->
      <div v-show="activeTab === 'summary'" class="tab-panel">
        <div class="summary-grid">
          <!-- Total Simpanan -->
          <div class="summary-card main">
            <div class="card-icon">
              <i class="bi bi-piggy-bank"></i>
            </div>
            <div class="card-content">
              <h3>Total Simpanan</h3>
              <div class="amount">{{ formatCurrency(simpananStore.simpanan.total) }}</div>
            </div>
          </div>

          <!-- Nomor Rekening KSP Card -->
          <div class="rekening-card">
            <div class="card-header">
              <i class="bi bi-bank"></i>
              <span>Rekening KSP</span>
            </div>
            <div class="rekening-info">
              <div class="bank-name">Bank BCA</div>
              <div class="account-number" id="accountNumber">1234-5678-9012</div>
              <div class="account-name">Koperasi Simpan Pinjam Sejahtera</div>
            </div>
            <div class="rekening-actions">
              <button class="btn-copy" @click="copyAccountNumber">
                <i class="bi bi-clipboard" :class="{ 'bi-check': copied }"></i>
                {{ copied ? 'Tersalin!' : 'Salin' }}
              </button>
              <button class="btn-info" @click="showTransferInfo = !showTransferInfo">
                <i class="bi bi-info-circle"></i>
                Cara Transfer
              </button>
            </div>
            <div v-if="showTransferInfo" class="transfer-info">
              <div class="info-title">Cara Transfer:</div>
              <ol class="info-list">
                <li>Transfer ke nomor rekening di atas</li>
                <li>Gunakan kode unik 3 digit terakhir nomor anggota</li>
                <li>Simpan bukti transfer</li>
                <li>Konfirmasi ke pengurus untuk verifikasi</li>
              </ol>
            </div>
          </div>

          <!-- Breakdown Cards -->
          <div class="breakdown-grid">
            <div class="breakdown-card">
              <div class="card-header">
                <i class="bi bi-shield-check"></i>
                <span>Simpanan Pokok</span>
              </div>
              <div class="card-value">{{ formatCurrency(simpananStore.simpanan.pokok) }}</div>
            </div>

            <div class="breakdown-card">
              <div class="card-header">
                <i class="bi bi-calendar-check"></i>
                <span>Simpanan Wajib</span>
              </div>
              <div class="card-value">{{ formatCurrency(simpananStore.simpanan.wajib) }}</div>
            </div>

            <div class="breakdown-card">
              <div class="card-header">
                <i class="bi bi-wallet2"></i>
                <span>Simpanan Sukarela</span>
              </div>
              <div class="card-value">{{ formatCurrency(simpananStore.simpanan.sukarela) }}</div>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="chart-section">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Komposisi Simpanan</h3>
            </div>
            <div class="chart-container">
              <canvas ref="simpananChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- History Tab -->
      <div v-show="activeTab === 'history'" class="tab-panel">
        <div class="history-section">
          <!-- Filters -->
          <div class="filters-bar">
            <div class="filter-group">
              <button
                :class="['filter-btn', { active: simpananStore.filterType === 'semua' }]"
                @click="handleFilterChange('semua')"
              >
                Semua
              </button>
              <button
                :class="['filter-btn', { active: simpananStore.filterType === 'pokok' }]"
                @click="handleFilterChange('pokok')"
              >
                Pokok
              </button>
              <button
                :class="['filter-btn', { active: simpananStore.filterType === 'wajib' }]"
                @click="handleFilterChange('wajib')"
              >
                Wajib
              </button>
              <button
                :class="['filter-btn', { active: simpananStore.filterType === 'sukarela' }]"
                @click="handleFilterChange('sukarela')"
              >
                Sukarela
              </button>
            </div>

            <div class="export-buttons">
              <button class="export-btn" @click="exportData('pdf')">
                <i class="bi bi-file-pdf"></i>
                PDF
              </button>
              <button class="export-btn" @click="exportData('excel')">
                <i class="bi bi-file-excel"></i>
                Excel
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jenis</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="simpananStore.isLoading">
                  <td colspan="5" class="loading-row">
                    <div class="loading-spinner"></div>
                    <span>Memuat data...</span>
                  </td>
                </tr>
                <tr v-else-if="simpananStore.riwayatSimpanan.length === 0">
                  <td colspan="5" class="empty-row">
                    <i class="bi bi-inbox"></i>
                    <span>Tidak ada data simpanan</span>
                  </td>
                </tr>
                <tr v-else v-for="item in simpananStore.riwayatSimpanan" :key="item.id">
                  <td>{{ formatDate(item.tanggal) }}</td>
                  <td>
                    <span class="badge" :class="getBadgeClass(item.jenis)">
                      {{ getJenisLabel(item.jenis) }}
                    </span>
                  </td>
                  <td>
                    <span :class="item.jumlah < 0 ? 'negative' : 'positive'">
                      {{ formatCurrency(Math.abs(item.jumlah)) }}
                      <small v-if="item.jumlah < 0" class="text-muted">(Penarikan)</small>
                    </span>
                  </td>
                  <td>
                    <span class="badge" :class="getStatusClass(item.status)">
                      {{ getStatusLabel(item.status) }}
                    </span>
                  </td>
                  <td>{{ item.keterangan || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="simpananStore.totalPages > 1" class="pagination-wrapper">
            <button
              class="pagination-btn"
              :disabled="simpananStore.currentPage === 1"
              @click="handlePageChange(simpananStore.currentPage - 1)"
            >
              <i class="bi bi-chevron-left"></i>
              Sebelumnya
            </button>

            <div class="pagination-numbers">
              <button
                v-for="page in simpananStore.totalPages"
                :key="page"
                class="pagination-number"
                :class="{ active: simpananStore.currentPage === page }"
                @click="handlePageChange(page)"
              >
                {{ page }}
              </button>
            </div>

            <button
              class="pagination-btn"
              :disabled="simpananStore.currentPage === simpananStore.totalPages"
              @click="handlePageChange(simpananStore.currentPage + 1)"
            >
              Selanjutnya
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Transaction Tab -->
      <div v-show="activeTab === 'transaction'" class="tab-panel">
        <div class="transaction-section">
          <div class="transaction-grid">
            <!-- Setor Form -->
            <div class="transaction-card">
              <div class="card-header">
                <div class="header-icon">
                  <i class="bi bi-plus-circle"></i>
                </div>
                <div class="header-content">
                  <h3>Setor Simpanan Sukarela</h3>
                  <p>Tambah saldo simpanan sukarela Anda</p>
                </div>
              </div>

              <form @submit.prevent="handleSetorSubmit" class="transaction-form">
                <div class="form-group">
                  <label for="jumlahSetor">Jumlah Setoran (Rp)</label>
                  <input
                    type="number"
                    id="jumlahSetor"
                    v-model="setorForm.jumlah"
                    placeholder="Masukkan jumlah setoran"
                    min="1000"
                    step="1000"
                    required
                  />
                  <small class="form-hint">Minimal Rp 1.000</small>
                </div>

                <div class="form-group">
                  <label for="keteranganSetor">Keterangan (Opsional)</label>
                  <textarea
                    id="keteranganSetor"
                    v-model="setorForm.keterangan"
                    placeholder="Tambahkan keterangan jika diperlukan"
                    rows="3"
                  ></textarea>
                </div>

                <button type="submit" class="submit-btn primary" :disabled="isLoading">
                  <i class="bi bi-plus-circle"></i>
                  <span v-if="isLoading">Memproses...</span>
                  <span v-else>Setor Simpanan</span>
                </button>
              </form>

              <div class="info-box">
                <i class="bi bi-info-circle"></i>
                <div>
                  <strong>Catatan:</strong> Setoran akan diproses setelah diverifikasi oleh
                  pengurus. Harap lakukan transfer ke rekening koperasi.
                </div>
              </div>
            </div>

            <!-- Tarik Form -->
            <div class="transaction-card">
              <div class="card-header">
                <div class="header-icon">
                  <i class="bi bi-dash-circle"></i>
                </div>
                <div class="header-content">
                  <h3>Tarik Simpanan Sukarela</h3>
                  <p>Ambil saldo simpanan sukarela Anda</p>
                </div>
              </div>

              <form @submit.prevent="handleTarikSubmit" class="transaction-form">
                <div class="form-group">
                  <label for="jumlahTarik">Jumlah Penarikan (Rp)</label>
                  <input
                    type="number"
                    id="jumlahTarik"
                    v-model="tarikForm.jumlah"
                    placeholder="Masukkan jumlah penarikan"
                    :max="simpananStore.simpanan.sukarela"
                    min="1000"
                    step="1000"
                    required
                  />
                  <small class="form-hint">
                    Saldo tersedia: {{ formatCurrency(simpananStore.simpanan.sukarela) }}
                  </small>
                </div>

                <div class="form-group">
                  <label for="keteranganTarik">Keterangan (Wajib)</label>
                  <textarea
                    id="keteranganTarik"
                    v-model="tarikForm.keterangan"
                    placeholder="Jelaskan tujuan penarikan"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  class="submit-btn secondary"
                  :disabled="isLoading || simpananStore.simpanan.sukarela <= 0"
                >
                  <i class="bi bi-dash-circle"></i>
                  <span v-if="isLoading">Memproses...</span>
                  <span v-else>Tarik Simpanan</span>
                </button>
              </form>

              <div class="info-box warning">
                <i class="bi bi-exclamation-triangle"></i>
                <div>
                  <strong>Perhatian:</strong> Pengajuan penarikan akan diproses dalam waktu 1-3 hari
                  kerja setelah diverifikasi oleh pengurus.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMessage" class="alert success">
      <i class="bi bi-check-circle"></i>
      <span>{{ successMessage }}</span>
      <button @click="successMessage = ''">
        <i class="bi bi-x"></i>
      </button>
    </div>

    <div v-if="errorMessage" class="alert error">
      <i class="bi bi-exclamation-triangle"></i>
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''">
        <i class="bi bi-x"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.simpanan-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
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
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.header-content p {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* Navigation Tabs */
.nav-tabs-container {
  margin-bottom: 2rem;
}

.nav-tabs-wrapper {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  gap: 0.5rem;
}

.nav-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  background: rgba(102, 126, 234, 0.05);
  color: #667eea;
}

.nav-tab.active {
  background: #667eea;
  color: white;
  font-weight: 600;
}

.nav-tab i {
  font-size: 1rem;
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tab-panel {
  padding: 2rem;
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.summary-card.main {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.card-icon {
  font-size: 3rem;
  opacity: 0.9;
}

.card-content h3 {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.card-content .amount {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

/* Breakdown Grid */
.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.breakdown-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  text-align: center;
  transition: all 0.2s ease;
}

.breakdown-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.card-header i {
  font-size: 1.25rem;
}

.breakdown-card:nth-child(1) .card-header i {
  color: #3b82f6;
}

.breakdown-card:nth-child(2) .card-header i {
  color: #10b981;
}

.breakdown-card:nth-child(3) .card-header i {
  color: #f59e0b;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

/* Chart Section */
.chart-section {
  margin-top: 2rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.chart-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.chart-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-container {
  padding: 2rem;
  height: 300px;
}

/* History Section */
.history-section {
  /* Filters */
  .filters-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 2rem;
  }

  .filter-group {
    display: flex;
    gap: 0.5rem;
  }

  .filter-btn {
    padding: 0.75rem 1.25rem;
    border: 1px solid #d1d5db;
    background: white;
    color: #6b7280;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-btn:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .filter-btn.active {
    background: #667eea;
    border-color: #667eea;
    color: white;
  }

  .export-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .export-btn {
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    background: white;
    color: #6b7280;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .export-btn:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #374151;
  }
}

/* Table */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table th {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #6b7280;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.loading-row,
.empty-row {
  text-align: center;
  padding: 3rem !important;
  color: #9ca3af;
  font-style: italic;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  display: inline-block;
  vertical-align: middle;
}

.empty-row i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
  opacity: 0.5;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.bg-primary {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge.bg-success {
  background: #d1fae5;
  color: #047857;
}
.badge.bg-warning {
  background: #fef3c7;
  color: #d97706;
}
.badge.bg-danger {
  background: #fee2e2;
  color: #dc2626;
}

.positive {
  color: #10b981;
  font-weight: 500;
}
.negative {
  color: #ef4444;
  font-weight: 500;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn,
.pagination-number {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn:hover,
.pagination-number:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.pagination-number.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

/* Transaction Section */
.transaction-section {
  .transaction-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .transaction-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .card-header {
    padding: 1.5rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 12px;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .header-content h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .header-content p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  .transaction-form {
    padding: 2rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    background: white;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-hint {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.25rem;
  }

  .submit-btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .submit-btn.primary {
    background: #10b981;
    color: white;
  }

  .submit-btn.primary:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
  }

  .submit-btn.secondary {
    background: #f59e0b;
    color: white;
  }

  .submit-btn.secondary:hover:not(:disabled) {
    background: #d97706;
    transform: translateY(-1px);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .info-box {
    background: #eff6ff;
    border: 1px solid #dbeafe;
    border-radius: 8px;
    padding: 1rem;
    margin: 0 2rem 2rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .info-box i {
    color: #3b82f6;
    font-size: 1rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .info-box.warning {
    background: #fffbeb;
    border-color: #fef3c7;
  }

  .info-box.warning i {
    color: #f59e0b;
  }

  .info-box div {
    font-size: 0.875rem;
    color: #1f2937;
    line-height: 1.4;
  }
}

/* Alert Messages */
.alert {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  max-width: 400px;
  animation: slideInRight 0.3s ease;
}

.alert.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.alert.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.alert button {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.alert button:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Animations */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
  .simpanan-container {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }

  .nav-tabs-wrapper {
    flex-direction: column;
  }

  .nav-tab {
    justify-content: flex-start;
    padding: 1rem 1.5rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .breakdown-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }

  .filters-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group {
    flex-wrap: wrap;
    justify-content: center;
  }

  .export-buttons {
    width: 100%;
    justify-content: center;
  }

  .transaction-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-numbers {
    order: -1;
  }
}

@media (max-width: 480px) {
  .simpanan-container {
    padding: 0.5rem;
  }

  .page-header {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .tab-panel {
    padding: 1rem;
  }

  .summary-card.main {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .card-content .amount {
    font-size: 2rem;
  }

  .breakdown-card {
    padding: 1rem;
  }

  .card-value {
    font-size: 1.25rem;
  }

  .chart-container {
    padding: 1rem;
    height: 200px;
  }

  .table-container {
    font-size: 0.8rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }

  .transaction-form {
    padding: 1rem;
  }

  .info-box {
    margin: 0 1rem 1rem;
    padding: 0.75rem;
  }
}

/* Rekening KSP Styles */
.rekening-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.rekening-card .card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.rekening-info {
  margin-bottom: 1rem;
}

.bank-name {
  font-size: 0.9rem;
  opacity: 0.9;
}

.account-number {
  font-size: 1.5rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  margin: 0.5rem 0;
}

.account-name {
  font-size: 0.9rem;
  opacity: 0.9;
}

.rekening-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-copy,
.btn-info {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-copy:hover,
.btn-info:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.transfer-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.info-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.info-list {
  margin: 0;
  padding-left: 1.2rem;
}

.info-list li {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}
</style>

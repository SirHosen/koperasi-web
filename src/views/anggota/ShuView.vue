<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useErrorHandler } from '@/lib/errorHandler'
import Chart from 'chart.js/auto'

// SHU History interface
interface ShuHistoryItem {
  id: string
  tanggal_pembagian: string
  tahun: number
  jenis: 'jasa_modal' | 'jasa_anggota'
  jumlah: number
  persentase: number
  status: 'dibagikan' | 'menunggu'
  keterangan?: string
}

const {
  handleAsync,
  error: errorMessage,
  loading: isLoading,
  success: successMessage,
} = useErrorHandler()

// Data
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const availableYears = ref<number[]>([])

// SHU Summary Data
const shuSummary = ref({
  year: currentYear,
  shu: {
    jasa_modal: 0,
    jasa_anggota: 0,
    total_shu: 0,
  },
  member_contribution: {
    simpanan_pokok: 0,
    simpanan_wajib: 0,
    simpanan_sukarela: 0,
    jumlah_transaksi_pinjaman: 0,
  },
})

// SHU History
const shuHistory = ref<ShuHistoryItem[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const filterYear = ref('')

// Chart reference
const shuChartCanvas = ref<HTMLCanvasElement | null>(null)
let shuChart: Chart | null = null

// Tabs
const activeTab = ref('summary')

onMounted(async () => {
  // Generate available years (current year and 4 years back)
  for (let i = 0; i < 5; i++) {
    availableYears.value.push(currentYear - i)
  }

  await loadShuSummary()
  await loadShuHistory()
})

// Load SHU Summary
async function loadShuSummary() {
  await handleAsync(async () => {
    const response = await fetch(`/api/shu/summary/1?year=${selectedYear.value}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) throw new Error('Failed to fetch SHU summary')

    const result = await response.json()
    shuSummary.value = result.data

    renderShuChart()
  }, 'Gagal memuat ringkasan SHU')
}

// Load SHU History
async function loadShuHistory(page = 1) {
  await handleAsync(async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
    })

    if (filterYear.value) {
      params.append('year', filterYear.value)
    }

    const response = await fetch(`/api/shu/history/1?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) throw new Error('Failed to fetch SHU history')

    const result = await response.json()
    shuHistory.value = result.data
    currentPage.value = result.pagination.currentPage
    totalPages.value = result.pagination.totalPages
  }, 'Gagal memuat riwayat SHU')
}

// Render SHU Chart
function renderShuChart() {
  if (shuChart) {
    shuChart.destroy()
  }

  if (!shuChartCanvas.value) return

  const ctx = shuChartCanvas.value.getContext('2d')
  if (!ctx) return

  const { jasa_modal, jasa_anggota } = shuSummary.value.shu

  shuChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Jasa Modal', 'Jasa Anggota'],
      datasets: [
        {
          data: [jasa_modal, jasa_anggota],
          backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: `Distribusi SHU Tahun ${shuSummary.value.year}`,
        },
      },
    },
  })
}

// Handle Year Change
async function handleYearChange() {
  await loadShuSummary()
}

// Handle Filter Change
async function handleFilterChange() {
  currentPage.value = 1
  await loadShuHistory(1)
}

// Handle Page Change
async function handlePageChange(page: number) {
  await loadShuHistory(page)
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Calculate percentage
const calculatePercentage = (part: number, total: number) => {
  if (total === 0) return 0
  return ((part / total) * 100).toFixed(1)
}
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="h3 mb-4">
          <i class="bi bi-calculator me-2"></i>
          Sisa Hasil Usaha (SHU)
        </h1>

        <!-- Success/Error Messages -->
        <div
          v-if="successMessage"
          class="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i class="bi bi-check-circle me-2"></i>
          {{ successMessage }}
          <button
            type="button"
            class="btn-close"
            @click="successMessage = ''"
            aria-label="Close"
          ></button>
        </div>

        <div
          v-if="errorMessage"
          class="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ errorMessage }}
          <button
            type="button"
            class="btn-close"
            @click="errorMessage = ''"
            aria-label="Close"
          ></button>
        </div>

        <!-- Navigation Tabs -->
        <div class="card">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  :class="['nav-link', { active: activeTab === 'summary' }]"
                  @click="activeTab = 'summary'"
                  type="button"
                >
                  <i class="bi bi-graph-up me-2"></i>Ringkasan SHU
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  :class="['nav-link', { active: activeTab === 'history' }]"
                  @click="activeTab = 'history'"
                  type="button"
                >
                  <i class="bi bi-clock-history me-2"></i>Riwayat SHU
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  :class="['nav-link', { active: activeTab === 'breakdown' }]"
                  @click="activeTab = 'breakdown'"
                  type="button"
                >
                  <i class="bi bi-pie-chart me-2"></i>Rincian Perhitungan
                </button>
              </li>
            </ul>
          </div>

          <div class="card-body">
            <!-- Summary Tab -->
            <div v-show="activeTab === 'summary'" class="tab-pane">
              <div class="row mb-3">
                <div class="col-md-3">
                  <label for="yearSelect" class="form-label">Pilih Tahun:</label>
                  <select
                    id="yearSelect"
                    class="form-select"
                    v-model="selectedYear"
                    @change="handleYearChange"
                  >
                    <option v-for="year in availableYears" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-8">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="card mb-3 bg-primary text-white">
                        <div class="card-body">
                          <div class="d-flex justify-content-between align-items-center">
                            <div>
                              <h5 class="card-title mb-1">Total SHU Diterima</h5>
                              <h2 class="mb-0">{{ formatCurrency(shuSummary.shu.total_shu) }}</h2>
                              <small class="opacity-75">Tahun {{ shuSummary.year }}</small>
                            </div>
                            <div class="opacity-75">
                              <i class="bi bi-currency-dollar" style="font-size: 3rem"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="row">
                        <div class="col-12">
                          <div class="card mb-2 border-info">
                            <div class="card-body text-center py-3">
                              <i class="bi bi-bank text-info mb-1" style="font-size: 1.5rem"></i>
                              <h6 class="card-subtitle mb-1 text-muted">Jasa Modal</h6>
                              <h5 class="text-info mb-0">
                                {{ formatCurrency(shuSummary.shu.jasa_modal) }}
                              </h5>
                              <small class="text-muted">
                                {{
                                  calculatePercentage(
                                    shuSummary.shu.jasa_modal,
                                    shuSummary.shu.total_shu,
                                  )
                                }}%
                              </small>
                            </div>
                          </div>
                        </div>
                        <div class="col-12">
                          <div class="card mb-2 border-warning">
                            <div class="card-body text-center py-3">
                              <i
                                class="bi bi-people text-warning mb-1"
                                style="font-size: 1.5rem"
                              ></i>
                              <h6 class="card-subtitle mb-1 text-muted">Jasa Anggota</h6>
                              <h5 class="text-warning mb-0">
                                {{ formatCurrency(shuSummary.shu.jasa_anggota) }}
                              </h5>
                              <small class="text-muted">
                                {{
                                  calculatePercentage(
                                    shuSummary.shu.jasa_anggota,
                                    shuSummary.shu.total_shu,
                                  )
                                }}%
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Member Contribution Summary -->
                  <div class="card">
                    <div class="card-header">
                      <h5 class="mb-0">
                        <i class="bi bi-person-check me-2"></i>
                        Kontribusi Anggota ({{ shuSummary.year }})
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-3">
                          <div class="text-center">
                            <i
                              class="bi bi-shield-check text-primary mb-2"
                              style="font-size: 2rem"
                            ></i>
                            <h6 class="text-muted">Simpanan Pokok</h6>
                            <h5 class="text-primary">
                              {{ formatCurrency(shuSummary.member_contribution.simpanan_pokok) }}
                            </h5>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="text-center">
                            <i
                              class="bi bi-calendar-check text-success mb-2"
                              style="font-size: 2rem"
                            ></i>
                            <h6 class="text-muted">Simpanan Wajib</h6>
                            <h5 class="text-success">
                              {{ formatCurrency(shuSummary.member_contribution.simpanan_wajib) }}
                            </h5>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="text-center">
                            <i class="bi bi-wallet2 text-warning mb-2" style="font-size: 2rem"></i>
                            <h6 class="text-muted">Simpanan Sukarela</h6>
                            <h5 class="text-warning">
                              {{ formatCurrency(shuSummary.member_contribution.simpanan_sukarela) }}
                            </h5>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <div class="text-center">
                            <i class="bi bi-credit-card text-info mb-2" style="font-size: 2rem"></i>
                            <h6 class="text-muted">Transaksi Pinjaman</h6>
                            <h5 class="text-info">
                              {{ shuSummary.member_contribution.jumlah_transaksi_pinjaman }}
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title"><i class="bi bi-pie-chart me-2"></i>Distribusi SHU</h5>
                      <div style="height: 300px; position: relative">
                        <canvas ref="shuChartCanvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- History Tab -->
            <div v-show="activeTab === 'history'" class="tab-pane">
              <div class="row mb-3">
                <div class="col-md-3">
                  <label for="filterYear" class="form-label">Filter Tahun:</label>
                  <select
                    id="filterYear"
                    class="form-select"
                    v-model="filterYear"
                    @change="handleFilterChange"
                  >
                    <option value="">Semua Tahun</option>
                    <option v-for="year in availableYears" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Tanggal Pembagian</th>
                      <th>Tahun</th>
                      <th>Jenis</th>
                      <th>Jumlah</th>
                      <th>Persentase</th>
                      <th>Status</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="isLoading">
                      <td colspan="7" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Memuat data...
                      </td>
                    </tr>
                    <tr v-else-if="shuHistory.length === 0">
                      <td colspan="7" class="text-center py-4 text-muted">Belum ada data SHU</td>
                    </tr>
                    <tr v-else v-for="item in shuHistory" :key="item.id">
                      <td>{{ formatDate(item.tanggal_pembagian) }}</td>
                      <td>{{ item.tahun }}</td>
                      <td>
                        <span
                          :class="{
                            'badge rounded-pill': true,
                            'bg-info': item.jenis === 'jasa_modal',
                            'bg-warning text-dark': item.jenis === 'jasa_anggota',
                          }"
                        >
                          {{ item.jenis === 'jasa_modal' ? 'Jasa Modal' : 'Jasa Anggota' }}
                        </span>
                      </td>
                      <td class="text-success">{{ formatCurrency(item.jumlah) }}</td>
                      <td>{{ item.persentase }}%</td>
                      <td>
                        <span
                          :class="{
                            'badge rounded-pill': true,
                            'bg-success': item.status === 'dibagikan',
                            'bg-warning text-dark': item.status === 'menunggu',
                          }"
                        >
                          {{ item.status === 'dibagikan' ? 'Dibagikan' : 'Menunggu' }}
                        </span>
                      </td>
                      <td>{{ item.keterangan || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <nav v-if="totalPages > 1" aria-label="Pagination">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a
                      class="page-link"
                      href="#"
                      @click.prevent="handlePageChange(currentPage - 1)"
                    >
                      &laquo; Sebelumnya
                    </a>
                  </li>

                  <template v-for="page in totalPages" :key="page">
                    <li class="page-item" :class="{ active: currentPage === page }">
                      <a class="page-link" href="#" @click.prevent="handlePageChange(page)">
                        {{ page }}
                      </a>
                    </li>
                  </template>

                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a
                      class="page-link"
                      href="#"
                      @click.prevent="handlePageChange(currentPage + 1)"
                    >
                      Selanjutnya &raquo;
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- Breakdown Tab -->
            <div v-show="activeTab === 'breakdown'" class="tab-pane">
              <div class="row">
                <div class="col-12">
                  <div class="card">
                    <div class="card-header">
                      <h5 class="mb-0">
                        <i class="bi bi-calculator me-2"></i>
                        Metodologi Perhitungan SHU
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6">
                          <h6 class="text-primary"><i class="bi bi-bank me-1"></i>Jasa Modal</h6>
                          <p class="text-muted">
                            Jasa modal dihitung berdasarkan proporsi simpanan (pokok, wajib, dan
                            sukarela) anggota terhadap total simpanan koperasi.
                          </p>
                          <div class="alert alert-info">
                            <small>
                              <strong>Rumus:</strong><br />
                              Jasa Modal = (Simpanan Anggota / Total Simpanan) × Total Jasa Modal
                            </small>
                          </div>

                          <h6 class="mt-4">Komponen Simpanan Anda:</h6>
                          <ul class="list-unstyled">
                            <li class="mb-1">
                              <i class="bi bi-shield-check text-primary me-2"></i>
                              Simpanan Pokok:
                              {{ formatCurrency(shuSummary.member_contribution.simpanan_pokok) }}
                            </li>
                            <li class="mb-1">
                              <i class="bi bi-calendar-check text-success me-2"></i>
                              Simpanan Wajib:
                              {{ formatCurrency(shuSummary.member_contribution.simpanan_wajib) }}
                            </li>
                            <li class="mb-1">
                              <i class="bi bi-wallet2 text-warning me-2"></i>
                              Simpanan Sukarela:
                              {{ formatCurrency(shuSummary.member_contribution.simpanan_sukarela) }}
                            </li>
                          </ul>

                          <div class="bg-light p-3 rounded">
                            <strong
                              >Total Simpanan Anda:
                              {{
                                formatCurrency(
                                  shuSummary.member_contribution.simpanan_pokok +
                                    shuSummary.member_contribution.simpanan_wajib +
                                    shuSummary.member_contribution.simpanan_sukarela,
                                )
                              }}
                            </strong>
                          </div>
                        </div>

                        <div class="col-md-6">
                          <h6 class="text-warning">
                            <i class="bi bi-people me-1"></i>Jasa Anggota
                          </h6>
                          <p class="text-muted">
                            Jasa anggota dihitung berdasarkan aktivitas dan kontribusi anggota dalam
                            memanfaatkan layanan koperasi, terutama pinjaman.
                          </p>
                          <div class="alert alert-warning">
                            <small>
                              <strong>Rumus:</strong><br />
                              Jasa Anggota = (Kontribusi Bunga / Total Kontribusi) × Total Jasa
                              Anggota
                            </small>
                          </div>

                          <h6 class="mt-4">Aktivitas Anda:</h6>
                          <ul class="list-unstyled">
                            <li class="mb-1">
                              <i class="bi bi-credit-card text-info me-2"></i>
                              Jumlah Transaksi Pinjaman:
                              {{ shuSummary.member_contribution.jumlah_transaksi_pinjaman }}
                            </li>
                            <li class="mb-1">
                              <i class="bi bi-graph-up text-success me-2"></i>
                              Status:
                              {{
                                shuSummary.member_contribution.jumlah_transaksi_pinjaman > 0
                                  ? 'Anggota Aktif'
                                  : 'Anggota Pasif'
                              }}
                            </li>
                          </ul>

                          <div class="mt-4">
                            <h6>Faktor Penentu Jasa Anggota:</h6>
                            <ul class="small">
                              <li>Frekuensi penggunaan layanan pinjaman</li>
                              <li>Ketepatan pembayaran angsuran</li>
                              <li>Loyalitas keanggotaan</li>
                              <li>Partisipasi dalam kegiatan koperasi</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <hr />

                      <div class="row mt-4">
                        <div class="col-12">
                          <h6><i class="bi bi-info-circle me-2"></i>Informasi Tambahan</h6>
                          <div class="row">
                            <div class="col-md-6">
                              <div class="alert alert-secondary">
                                <h6 class="alert-heading">Periode Perhitungan</h6>
                                <p class="mb-0">
                                  SHU dihitung berdasarkan aktivitas dan simpanan selama tahun buku
                                  yang bersangkutan (1 Januari - 31 Desember {{ shuSummary.year }}).
                                </p>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="alert alert-secondary">
                                <h6 class="alert-heading">Waktu Pembagian</h6>
                                <p class="mb-0">
                                  SHU biasanya dibagikan setelah Rapat Anggota Tahunan (RAT) pada
                                  awal tahun berikutnya setelah laporan keuangan diaudit.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-tabs .nav-link {
  border-bottom: 2px solid transparent;
  color: #495057;
}

.nav-tabs .nav-link.active {
  border-bottom-color: #007bff;
  background-color: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
}

.nav-tabs .nav-link:hover {
  border-bottom-color: #dee2e6;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75em;
}

.alert {
  border: none;
  border-radius: 0.375rem;
}

.pagination .page-link {
  color: #007bff;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}
</style>

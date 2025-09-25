<script setup lang="ts">
import { ref, onMounted } from 'vue'
// @ts-expect-error - JS store file
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

async function exportData(format: string) {
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
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="h3 mb-4">
          <i class="bi bi-piggy-bank me-2"></i>
          Kelola Simpanan
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
                  <i class="bi bi-graph-up me-2"></i>Ringkasan
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  :class="['nav-link', { active: activeTab === 'history' }]"
                  @click="activeTab = 'history'"
                  type="button"
                >
                  <i class="bi bi-clock-history me-2"></i>Riwayat Simpanan
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  :class="['nav-link', { active: activeTab === 'transaction' }]"
                  @click="activeTab = 'transaction'"
                  type="button"
                >
                  <i class="bi bi-arrow-left-right me-2"></i>Transaksi
                </button>
              </li>
            </ul>
          </div>

          <div class="card-body">
            <!-- Summary Tab -->
            <div v-show="activeTab === 'summary'" class="tab-pane">
              <div class="row">
                <div class="col-md-6">
                  <div class="card mb-3 bg-primary text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 class="card-title mb-1">Total Simpanan</h5>
                          <h2 class="mb-0">{{ formatCurrency(simpananStore.simpanan.total) }}</h2>
                        </div>
                        <div class="opacity-75">
                          <i class="bi bi-piggy-bank" style="font-size: 3rem"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-4">
                      <div class="card mb-3 border-primary">
                        <div class="card-body text-center">
                          <i
                            class="bi bi-shield-check text-primary mb-2"
                            style="font-size: 2rem"
                          ></i>
                          <h6 class="card-subtitle mb-2 text-muted">Simpanan Pokok</h6>
                          <h5 class="text-primary">
                            {{ formatCurrency(simpananStore.simpanan.pokok) }}
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="card mb-3 border-success">
                        <div class="card-body text-center">
                          <i
                            class="bi bi-calendar-check text-success mb-2"
                            style="font-size: 2rem"
                          ></i>
                          <h6 class="card-subtitle mb-2 text-muted">Simpanan Wajib</h6>
                          <h5 class="text-success">
                            {{ formatCurrency(simpananStore.simpanan.wajib) }}
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="card mb-3 border-warning">
                        <div class="card-body text-center">
                          <i class="bi bi-wallet2 text-warning mb-2" style="font-size: 2rem"></i>
                          <h6 class="card-subtitle mb-2 text-muted">Simpanan Sukarela</h6>
                          <h5 class="text-warning">
                            {{ formatCurrency(simpananStore.simpanan.sukarela) }}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title"><i class="bi bi-bank me-2"></i>Informasi Rekening</h5>
                      <div class="row">
                        <div class="col-sm-6">
                          <p class="mb-1"><strong>Bank:</strong> Bank BRI</p>
                          <p class="mb-1"><strong>Cabang:</strong> Jakarta Pusat</p>
                        </div>
                        <div class="col-sm-6">
                          <p class="mb-1"><strong>No. Rekening:</strong> 0123-4567-8901</p>
                          <p class="mb-1"><strong>Atas Nama:</strong> Koperasi Simpan Pinjam</p>
                        </div>
                      </div>
                      <div class="alert alert-info mt-3 mb-0">
                        <small>
                          <i class="bi bi-info-circle me-1"></i>
                          Gunakan rekening ini untuk transfer simpanan wajib dan sukarela.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">
                        <i class="bi bi-pie-chart me-2"></i>Komposisi Simpanan
                      </h5>
                      <div style="height: 350px; position: relative">
                        <canvas ref="simpananChartCanvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- History Tab -->
            <div v-show="activeTab === 'history'" class="tab-pane">
              <div class="row mb-3">
                <div class="col-md-8">
                  <div class="btn-group" role="group">
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      :class="{ active: simpananStore.filterType === 'semua' }"
                      @click="handleFilterChange('semua')"
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      :class="{ active: simpananStore.filterType === 'pokok' }"
                      @click="handleFilterChange('pokok')"
                    >
                      Simpanan Pokok
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      :class="{ active: simpananStore.filterType === 'wajib' }"
                      @click="handleFilterChange('wajib')"
                    >
                      Simpanan Wajib
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      :class="{ active: simpananStore.filterType === 'sukarela' }"
                      @click="handleFilterChange('sukarela')"
                    >
                      Simpanan Sukarela
                    </button>
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <div class="btn-group" role="group">
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="exportData('pdf')"
                    >
                      <i class="bi bi-file-pdf me-1"></i> PDF
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="exportData('excel')"
                    >
                      <i class="bi bi-file-excel me-1"></i> Excel
                    </button>
                  </div>
                </div>
              </div>

              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jenis Simpanan</th>
                      <th>Jumlah</th>
                      <th>Status</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="simpananStore.isLoading">
                      <td colspan="5" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Memuat data...
                      </td>
                    </tr>
                    <tr v-else-if="simpananStore.riwayatSimpanan.length === 0">
                      <td colspan="5" class="text-center py-4 text-muted">
                        Tidak ada data simpanan
                      </td>
                    </tr>
                    <tr v-else v-for="item in simpananStore.riwayatSimpanan" :key="item.id">
                      <td>{{ formatDate(item.tanggal) }}</td>
                      <td>
                        <span
                          :class="{
                            'badge rounded-pill': true,
                            'bg-primary': item.jenis === 'pokok',
                            'bg-success': item.jenis === 'wajib',
                            'bg-warning text-dark': item.jenis === 'sukarela',
                          }"
                        >
                          {{
                            item.jenis === 'pokok'
                              ? 'Pokok'
                              : item.jenis === 'wajib'
                                ? 'Wajib'
                                : 'Sukarela'
                          }}
                        </span>
                      </td>
                      <td>
                        <span
                          :class="{
                            'text-danger': item.jumlah < 0,
                            'text-success': item.jumlah > 0,
                          }"
                        >
                          {{ formatCurrency(Math.abs(item.jumlah)) }}
                          <small v-if="item.jumlah < 0" class="text-muted">(Penarikan)</small>
                        </span>
                      </td>
                      <td>
                        <span
                          :class="{
                            'badge rounded-pill': true,
                            'bg-success': item.status === 'diverifikasi',
                            'bg-warning text-dark': item.status === 'menunggu',
                            'bg-danger': item.status === 'ditolak',
                          }"
                        >
                          {{
                            item.status === 'diverifikasi'
                              ? 'Diverifikasi'
                              : item.status === 'menunggu'
                                ? 'Menunggu'
                                : 'Ditolak'
                          }}
                        </span>
                      </td>
                      <td>{{ item.keterangan || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <nav v-if="simpananStore.totalPages > 1" aria-label="Pagination">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: simpananStore.currentPage === 1 }">
                    <a
                      class="page-link"
                      href="#"
                      @click.prevent="handlePageChange(simpananStore.currentPage - 1)"
                    >
                      &laquo; Sebelumnya
                    </a>
                  </li>

                  <template v-for="page in simpananStore.totalPages" :key="page">
                    <li class="page-item" :class="{ active: simpananStore.currentPage === page }">
                      <a class="page-link" href="#" @click.prevent="handlePageChange(page)">
                        {{ page }}
                      </a>
                    </li>
                  </template>

                  <li
                    class="page-item"
                    :class="{ disabled: simpananStore.currentPage === simpananStore.totalPages }"
                  >
                    <a
                      class="page-link"
                      href="#"
                      @click.prevent="handlePageChange(simpananStore.currentPage + 1)"
                    >
                      Selanjutnya &raquo;
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- Transaction Tab -->
            <div v-show="activeTab === 'transaction'" class="tab-pane">
              <div class="row">
                <div class="col-md-6">
                  <div class="card">
                    <div class="card-header bg-primary text-white">
                      <h5 class="mb-0">
                        <i class="bi bi-plus-circle me-2"></i>Setor Simpanan Sukarela
                      </h5>
                    </div>
                    <div class="card-body">
                      <form @submit.prevent="handleSetorSubmit">
                        <div class="mb-3">
                          <label for="jumlahSetor" class="form-label">Jumlah Setoran (Rp) *</label>
                          <input
                            type="number"
                            class="form-control"
                            id="jumlahSetor"
                            v-model="setorForm.jumlah"
                            placeholder="Masukkan jumlah setoran"
                            min="1000"
                            step="1000"
                            required
                          />
                          <div class="form-text">Minimal Rp 1.000</div>
                        </div>

                        <div class="mb-3">
                          <label for="keteranganSetor" class="form-label"
                            >Keterangan (Opsional)</label
                          >
                          <textarea
                            class="form-control"
                            id="keteranganSetor"
                            v-model="setorForm.keterangan"
                            rows="3"
                            placeholder="Tambahkan keterangan jika diperlukan"
                          ></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
                          <span
                            v-if="isLoading"
                            class="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          <i v-else class="bi bi-plus-circle me-2"></i>
                          Setor Simpanan Sukarela
                        </button>
                      </form>

                      <div class="alert alert-info mt-3 mb-0">
                        <small>
                          <i class="bi bi-info-circle me-1"></i>
                          Setoran akan diproses setelah diverifikasi oleh pengurus. Harap lakukan
                          transfer ke rekening koperasi.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="card">
                    <div class="card-header bg-warning">
                      <h5 class="mb-0">
                        <i class="bi bi-dash-circle me-2"></i>Tarik Simpanan Sukarela
                      </h5>
                    </div>
                    <div class="card-body">
                      <form @submit.prevent="handleTarikSubmit">
                        <div class="mb-3">
                          <label for="jumlahTarik" class="form-label"
                            >Jumlah Penarikan (Rp) *</label
                          >
                          <input
                            type="number"
                            class="form-control"
                            id="jumlahTarik"
                            v-model="tarikForm.jumlah"
                            placeholder="Masukkan jumlah penarikan"
                            :max="simpananStore.simpanan.sukarela"
                            min="1000"
                            step="1000"
                            required
                          />
                          <div class="form-text">
                            Saldo tersedia: {{ formatCurrency(simpananStore.simpanan.sukarela) }}
                          </div>
                        </div>

                        <div class="mb-3">
                          <label for="keteranganTarik" class="form-label"
                            >Keterangan (Wajib) *</label
                          >
                          <textarea
                            class="form-control"
                            id="keteranganTarik"
                            v-model="tarikForm.keterangan"
                            rows="3"
                            placeholder="Jelaskan tujuan penarikan"
                            required
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          class="btn btn-warning w-100"
                          :disabled="isLoading || simpananStore.simpanan.sukarela <= 0"
                        >
                          <span
                            v-if="isLoading"
                            class="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          <i v-else class="bi bi-dash-circle me-2"></i>
                          Tarik Simpanan Sukarela
                        </button>
                      </form>

                      <div class="alert alert-warning mt-3 mb-0">
                        <small>
                          <i class="bi bi-exclamation-triangle me-1"></i>
                          Pengajuan penarikan akan diproses dalam waktu 1-3 hari kerja setelah
                          diverifikasi oleh pengurus.
                        </small>
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

.btn-group .btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
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

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.pagination .page-link {
  color: #007bff;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}
</style>

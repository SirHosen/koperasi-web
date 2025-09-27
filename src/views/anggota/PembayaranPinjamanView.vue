<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useErrorHandler } from '@/lib/errorHandler'

// Types
interface PinjamanAktif {
  id: string
  jumlah: number
  tenor: number
  bunga: number
  angsuranPerBulan: number
  sisaPokok: number
  sisaTenor: number
  jatuhTempo: string
  status: 'lancar' | 'tunggakan'
  dendaKeterlambatan: number
}

interface PembayaranHistory {
  id: string
  tanggalBayar: string
  jumlahBayar: number
  angguranKe: number
  pokok: number
  bunga: number
  denda: number
  sisaPokok: number
  metode: 'manual' | 'transfer'
  status: 'verified' | 'pending'
  buktiPembayaran?: string
}

const {
  error: errorMessage,
  loading: isLoading,
  success: successMessage,
  handleAsync,
  showSuccess,
} = useErrorHandler()

// State
const activeTab = ref('pembayaran')
const pinjamanAktif = ref<PinjamanAktif | null>(null)
const historyPembayaran = ref<PembayaranHistory[]>([])
const currentPage = ref(1)
const totalPages = ref(1)

// Form data
const pembayaranForm = ref({
  jumlahBayar: '',
  tanggalBayar: new Date().toISOString().split('T')[0],
  metode: 'manual',
  keterangan: '',
  buktiTransfer: null as File | null,
})

// Computed
const angsuranTerbaru = computed(() => {
  if (!pinjamanAktif.value) return null

  const angsuranKe = pinjamanAktif.value.tenor - pinjamanAktif.value.sisaTenor + 1
  const totalAngsuran =
    pinjamanAktif.value.angsuranPerBulan + pinjamanAktif.value.dendaKeterlambatan

  return {
    angsuranKe,
    totalAngsuran,
    pokok: Math.round(pinjamanAktif.value.angsuranPerBulan * 0.7), // Estimasi 70% pokok
    bunga: Math.round(pinjamanAktif.value.angsuranPerBulan * 0.3), // Estimasi 30% bunga
    denda: pinjamanAktif.value.dendaKeterlambatan,
  }
})

const isFormValid = computed(() => {
  const jumlah = parseFloat(pembayaranForm.value.jumlahBayar)
  return jumlah > 0 && pembayaranForm.value.tanggalBayar && pembayaranForm.value.metode
})

// Load data
onMounted(async () => {
  await loadPinjamanAktif()
  await loadHistoryPembayaran()
})

async function loadPinjamanAktif() {
  await handleAsync(async () => {
    const response = await fetch('/api/anggota/pinjaman/aktif', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        pinjamanAktif.value = null
        return
      }
      throw new Error('Gagal memuat data pinjaman')
    }

    const result = await response.json()
    pinjamanAktif.value = result.data
  }, 'Gagal memuat data pinjaman aktif')
}

async function loadHistoryPembayaran(page = 1) {
  if (!pinjamanAktif.value) return

  await handleAsync(async () => {
    const response = await fetch(
      `/api/anggota/pinjaman/${pinjamanAktif.value!.id}/pembayaran?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    )

    if (!response.ok) throw new Error('Gagal memuat history pembayaran')

    const result = await response.json()
    historyPembayaran.value = result.data
    totalPages.value = result.pagination?.totalPages || 1
    currentPage.value = page
  }, 'Gagal memuat history pembayaran')
}

// Form handlers
function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    pembayaranForm.value.buktiTransfer = input.files[0]
  }
}

async function submitPembayaran() {
  if (!isFormValid.value || !pinjamanAktif.value) {
    errorMessage.value = 'Mohon lengkapi semua field yang diperlukan'
    return
  }

  await handleAsync(async () => {
    const formData = new FormData()
    formData.append('pinjaman_id', pinjamanAktif.value!.id)
    formData.append('jumlah_bayar', pembayaranForm.value.jumlahBayar)
    formData.append('tanggal_bayar', pembayaranForm.value.tanggalBayar)
    formData.append('metode', pembayaranForm.value.metode)
    formData.append('keterangan', pembayaranForm.value.keterangan)

    if (pembayaranForm.value.buktiTransfer) {
      formData.append('bukti_transfer', pembayaranForm.value.buktiTransfer)
    }

    const response = await fetch('/api/anggota/pinjaman/pembayaran', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    })

    if (!response.ok) throw new Error('Gagal menyimpan pembayaran')

    await response.json()

    // Reset form
    pembayaranForm.value = {
      jumlahBayar: '',
      tanggalBayar: new Date().toISOString().split('T')[0],
      metode: 'manual',
      keterangan: '',
      buktiTransfer: null,
    }

    // Reload data
    await loadPinjamanAktif()
    await loadHistoryPembayaran()

    showSuccess('Pembayaran berhasil disubmit dan akan diverifikasi oleh pengurus')
  }, 'Gagal menyimpan pembayaran')
}

// Utilities
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'verified':
      return 'bg-success'
    case 'pending':
      return 'bg-warning'
    default:
      return 'bg-secondary'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'verified':
      return 'Terverifikasi'
    case 'pending':
      return 'Menunggu Verifikasi'
    default:
      return 'Unknown'
  }
}
</script>

<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="bi bi-credit-card me-2"></i>
              Pembayaran Pinjaman
            </h2>
            <p class="text-muted mb-0">Kelola pembayaran angsuran pinjaman Anda</p>
          </div>
        </div>
      </div>
    </div>

    <!-- No Active Loan -->
    <div v-if="!pinjamanAktif && !isLoading" class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-info-circle fa-3x text-muted mb-3"></i>
            <h4>Tidak Ada Pinjaman Aktif</h4>
            <p class="text-muted">Anda tidak memiliki pinjaman aktif saat ini.</p>
            <router-link to="/anggota/pinjaman/form" class="btn btn-primary">
              <i class="bi bi-plus me-2"></i>
              Ajukan Pinjaman
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Loan Content -->
    <div v-else-if="pinjamanAktif">
      <!-- Loan Summary Card -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="text-muted small">Sisa Pokok Pinjaman</div>
                    <div class="h4 text-primary">{{ formatCurrency(pinjamanAktif.sisaPokok) }}</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="text-muted small">Angsuran per Bulan</div>
                    <div class="h4 text-success">
                      {{ formatCurrency(pinjamanAktif.angsuranPerBulan) }}
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="text-muted small">Sisa Tenor</div>
                    <div class="h4 text-warning">{{ pinjamanAktif.sisaTenor }} bulan</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="text-muted small">Status</div>
                    <div class="h5">
                      <span
                        class="badge"
                        :class="pinjamanAktif.status === 'lancar' ? 'bg-success' : 'bg-danger'"
                      >
                        {{ pinjamanAktif.status === 'lancar' ? 'Lancar' : 'Tunggakan' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="row">
        <div class="col-12">
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'pembayaran' }"
                @click="activeTab = 'pembayaran'"
              >
                <i class="bi bi-credit-card me-2"></i>
                Input Pembayaran
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'history' }"
                @click="activeTab = 'history'"
              >
                <i class="bi bi-clock-history me-2"></i>
                History Pembayaran
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Input Pembayaran Tab -->
      <div v-if="activeTab === 'pembayaran'" class="row">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">Form Pembayaran Angsuran</h5>
            </div>
            <div class="card-body">
              <!-- Alert Messages -->
              <div v-if="errorMessage" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ errorMessage }}
              </div>
              <div v-if="successMessage" class="alert alert-success">
                <i class="bi bi-check-circle me-2"></i>
                {{ successMessage }}
              </div>

              <form @submit.prevent="submitPembayaran">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label"
                      >Jumlah Pembayaran <span class="text-danger">*</span></label
                    >
                    <div class="input-group">
                      <span class="input-group-text">Rp</span>
                      <input
                        type="number"
                        class="form-control"
                        v-model="pembayaranForm.jumlahBayar"
                        :placeholder="pinjamanAktif.angsuranPerBulan.toString()"
                        required
                      />
                    </div>
                    <div class="form-text">
                      Angsuran normal: {{ formatCurrency(pinjamanAktif.angsuranPerBulan) }}
                      <span v-if="pinjamanAktif.dendaKeterlambatan > 0">
                        + Denda: {{ formatCurrency(pinjamanAktif.dendaKeterlambatan) }}
                      </span>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label"
                      >Tanggal Pembayaran <span class="text-danger">*</span></label
                    >
                    <input
                      type="date"
                      class="form-control"
                      v-model="pembayaranForm.tanggalBayar"
                      required
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label"
                      >Metode Pembayaran <span class="text-danger">*</span></label
                    >
                    <select class="form-select" v-model="pembayaranForm.metode" required>
                      <option value="manual">Bayar Manual (Kantor)</option>
                      <option value="transfer">Transfer Bank</option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-3" v-if="pembayaranForm.metode === 'transfer'">
                    <label class="form-label">Bukti Transfer</label>
                    <input
                      type="file"
                      class="form-control"
                      accept="image/*,.pdf"
                      @change="handleFileChange"
                    />
                    <div class="form-text">Upload bukti transfer (JPG, PNG, PDF)</div>
                  </div>

                  <div class="col-12 mb-3">
                    <label class="form-label">Keterangan</label>
                    <textarea
                      class="form-control"
                      rows="3"
                      v-model="pembayaranForm.keterangan"
                      placeholder="Keterangan tambahan (opsional)"
                    ></textarea>
                  </div>
                </div>

                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="!isFormValid || isLoading"
                  >
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-save me-2"></i>
                    {{ isLoading ? 'Menyimpan...' : 'Submit Pembayaran' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header">
              <h6 class="mb-0">Rincian Angsuran</h6>
            </div>
            <div class="card-body" v-if="angsuranTerbaru">
              <div class="d-flex justify-content-between mb-2">
                <span>Angsuran ke-{{ angsuranTerbaru.angsuranKe }}</span>
                <span class="fw-bold">{{ formatCurrency(angsuranTerbaru.totalAngsuran) }}</span>
              </div>
              <hr class="my-2" />
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Pokok:</span>
                <span>{{ formatCurrency(angsuranTerbaru.pokok) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Bunga:</span>
                <span>{{ formatCurrency(angsuranTerbaru.bunga) }}</span>
              </div>
              <div v-if="angsuranTerbaru.denda > 0" class="d-flex justify-content-between mb-1">
                <span class="text-muted text-danger">Denda:</span>
                <span class="text-danger">{{ formatCurrency(angsuranTerbaru.denda) }}</span>
              </div>
              <hr class="my-2" />
              <div class="d-flex justify-content-between">
                <span class="fw-bold">Total:</span>
                <span class="fw-bold">{{ formatCurrency(angsuranTerbaru.totalAngsuran) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Pembayaran Tab -->
      <div v-if="activeTab === 'history'" class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">Riwayat Pembayaran</h5>
            </div>
            <div class="card-body">
              <div v-if="historyPembayaran.length === 0" class="text-center py-4">
                <i class="bi bi-inbox fa-2x text-muted mb-3"></i>
                <p class="text-muted">Belum ada riwayat pembayaran</p>
              </div>

              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Tanggal</th>
                      <th>Angsuran Ke</th>
                      <th>Jumlah Bayar</th>
                      <th>Pokok</th>
                      <th>Bunga</th>
                      <th>Denda</th>
                      <th>Sisa Pokok</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="pembayaran in historyPembayaran" :key="pembayaran.id">
                      <td>{{ formatDate(pembayaran.tanggalBayar) }}</td>
                      <td>{{ pembayaran.angguranKe }}</td>
                      <td>{{ formatCurrency(pembayaran.jumlahBayar) }}</td>
                      <td>{{ formatCurrency(pembayaran.pokok) }}</td>
                      <td>{{ formatCurrency(pembayaran.bunga) }}</td>
                      <td>{{ formatCurrency(pembayaran.denda) }}</td>
                      <td>{{ formatCurrency(pembayaran.sisaPokok) }}</td>
                      <td>
                        <span class="badge" :class="getStatusClass(pembayaran.status)">
                          {{ getStatusLabel(pembayaran.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <nav v-if="totalPages > 1" class="mt-4">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="loadHistoryPembayaran(currentPage - 1)">
                      Previous
                    </button>
                  </li>
                  <li
                    v-for="page in totalPages"
                    :key="page"
                    class="page-item"
                    :class="{ active: currentPage === page }"
                  >
                    <button class="page-link" @click="loadHistoryPembayaran(page)">
                      {{ page }}
                    </button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="loadHistoryPembayaran(currentPage + 1)">
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !pinjamanAktif" class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <div class="spinner-border text-primary mb-3"></div>
            <p class="text-muted">Memuat data pinjaman...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  background-color: #fff;
  border-bottom: 2px solid #007bff;
  color: #007bff;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.table th {
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>

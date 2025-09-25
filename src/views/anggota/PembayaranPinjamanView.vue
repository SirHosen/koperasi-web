<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useErrorHandler } from '@/lib/errorHandler'

const {
  handleAsync,
  error: errorMessage,
  loading: isLoading,
  success: successMessage,
  showSuccess,
} = useErrorHandler()

const currentPage = ref(1)
const totalPages = ref(1)

// Constants
const paymentMethods = [
  { value: 'transfer', label: 'Transfer Bank' },
  { value: 'tunai', label: 'Tunai' },
  { value: 'auto_debit', label: 'Auto Debit' },
]

// Tabs
const activeTab = ref('payment')

onMounted(async () => {
  await loadCurrentLoans()
  await loadPaymentHistory()
})

// Load current active loans
async function loadCurrentLoans() {
  await handleAsync(async () => {
    const response = await fetch('/api/pinjaman/active', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) throw new Error('Failed to fetch active loans')

    const result = await response.json()
    currentLoans.value = result.data || []

    // Auto select first loan if available
    if (currentLoans.value.length > 0) {
      selectedLoan.value = currentLoans.value[0]
      paymentForm.value.loan_id = selectedLoan.value.id
    }
  }, 'Gagal memuat data pinjaman aktif')
}

// Load payment history
async function loadPaymentHistory(page = 1) {
  await handleAsync(async () => {
    const response = await fetch(`/api/pinjaman/payments/history?page=${page}&limit=10`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) throw new Error('Failed to fetch payment history')

    const result = await response.json()
    paymentHistory.value = result.data
    currentPage.value = result.pagination.currentPage
    totalPages.value = result.pagination.totalPages
  }, 'Gagal memuat riwayat pembayaran')
}

// Handle loan selection change
function handleLoanChange() {
  selectedLoan.value =
    currentLoans.value.find((loan) => loan.id === paymentForm.value.loan_id) || null
}

// Handle file upload
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    paymentForm.value.bukti_transfer = target.files[0]
  }
}

// Submit payment
async function submitPayment() {
  if (!paymentForm.value.loan_id) {
    errorMessage.value = 'Pilih pinjaman terlebih dahulu'
    return
  }

  if (!paymentForm.value.jumlah_bayar || parseFloat(paymentForm.value.jumlah_bayar) <= 0) {
    errorMessage.value = 'Jumlah pembayaran harus lebih dari 0'
    return
  }

  const formData = new FormData()
  formData.append('loan_id', paymentForm.value.loan_id)
  formData.append('jumlah_bayar', paymentForm.value.jumlah_bayar)
  formData.append('tanggal_bayar', paymentForm.value.tanggal_bayar)
  formData.append('metode_pembayaran', paymentForm.value.metode_pembayaran)
  formData.append('nomor_referensi', paymentForm.value.nomor_referensi)
  formData.append('keterangan', paymentForm.value.keterangan)

  if (paymentForm.value.bukti_transfer) {
    formData.append('bukti_transfer', paymentForm.value.bukti_transfer)
  }

  const result = await handleAsync(async () => {
    const response = await fetch('/api/pinjaman/payments/manual', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    })

    if (!response.ok) throw new Error('Failed to submit payment')

    return await response.json()
  }, 'Gagal mengirim pembayaran')

  if (result) {
    showSuccess('Pembayaran berhasil diinput dan akan diverifikasi')
    resetForm()
    await loadCurrentLoans()
    await loadPaymentHistory()
  }
}

// Reset form
function resetForm() {
  paymentForm.value = {
    loan_id: currentLoans.value.length > 0 ? currentLoans.value[0].id : '',
    jumlah_bayar: '',
    tanggal_bayar: new Date().toISOString().split('T')[0],
    metode_pembayaran: 'transfer',
    nomor_referensi: '',
    keterangan: '',
    bukti_transfer: null,
  }

  // Reset file input
  const fileInput = document.getElementById('buktiTransfer') as HTMLInputElement
  if (fileInput) fileInput.value = ''
}

// Handle page change
async function handlePageChange(page: number) {
  await loadPaymentHistory(page)
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

// Payment loan interface
interface PaymentLoan {
  id: string
  jumlah_pinjaman: number
  bunga_total: number
  total_dibayar?: number
  tenor_bulan: number
  jenis_pinjaman: string
  tanggal_jatuh_tempo?: string
}

// Payment history interface
interface PaymentHistory {
  id: string
  tanggal_bayar: string
  jenis_pinjaman: string
  jumlah_bayar: number
  metode_pembayaran: string
  nomor_referensi?: string
  status: string
  bukti_transfer?: string
}

// Data
const currentLoans = ref<PaymentLoan[]>([])
const selectedLoan = ref<PaymentLoan | null>(null)
const paymentForm = ref({
  loan_id: '',
  jumlah_bayar: '',
  tanggal_bayar: new Date().toISOString().split('T')[0],
  metode_pembayaran: 'transfer',
  nomor_referensi: '',
  keterangan: '',
  bukti_transfer: null as File | null,
})

const paymentHistory = ref<PaymentHistory[]>([])

// Calculate remaining balance
const calculateRemainingBalance = (loan: PaymentLoan | null) => {
  if (!loan) return 0
  return loan.jumlah_pinjaman + loan.bunga_total - (loan.total_dibayar || 0)
}

// Calculate installment amount
const calculateInstallmentAmount = (loan: PaymentLoan | null) => {
  if (!loan) return 0
  return (loan.jumlah_pinjaman + loan.bunga_total) / loan.tenor_bulan
}
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="h3 mb-4">
          <i class="bi bi-credit-card me-2"></i>
          Input Pembayaran Pinjaman
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
                  :class="['nav-link', { active: activeTab === 'payment' }]"
                  @click="activeTab = 'payment'"
                  type="button"
                >
                  <i class="bi bi-plus-circle me-2"></i>Input Pembayaran
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  :class="['nav-link', { active: activeTab === 'history' }]"
                  @click="activeTab = 'history'"
                  type="button"
                >
                  <i class="bi bi-clock-history me-2"></i>Riwayat Pembayaran
                </button>
              </li>
            </ul>
          </div>

          <div class="card-body">
            <!-- Payment Input Tab -->
            <div v-show="activeTab === 'payment'" class="tab-pane">
              <div v-if="currentLoans.length === 0" class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Anda tidak memiliki pinjaman aktif saat ini.
              </div>

              <div v-else class="row">
                <div class="col-md-8">
                  <form @submit.prevent="submitPayment">
                    <div class="card">
                      <div class="card-header">
                        <h5 class="mb-0"><i class="bi bi-form me-2"></i>Form Input Pembayaran</h5>
                      </div>
                      <div class="card-body">
                        <div class="row">
                          <div class="col-md-6">
                            <div class="mb-3">
                              <label for="loanSelect" class="form-label">Pilih Pinjaman *</label>
                              <select
                                id="loanSelect"
                                class="form-select"
                                v-model="paymentForm.loan_id"
                                @change="handleLoanChange"
                                required
                              >
                                <option value="">-- Pilih Pinjaman --</option>
                                <option
                                  v-for="loan in currentLoans"
                                  :key="loan.id"
                                  :value="loan.id"
                                >
                                  {{ loan.jenis_pinjaman }} -
                                  {{ formatCurrency(loan.jumlah_pinjaman) }}
                                </option>
                              </select>
                            </div>
                          </div>

                          <div class="col-md-6">
                            <div class="mb-3">
                              <label for="tanggalBayar" class="form-label"
                                >Tanggal Pembayaran *</label
                              >
                              <input
                                type="date"
                                class="form-control"
                                id="tanggalBayar"
                                v-model="paymentForm.tanggal_bayar"
                                :max="new Date().toISOString().split('T')[0]"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col-md-6">
                            <div class="mb-3">
                              <label for="jumlahBayar" class="form-label"
                                >Jumlah Pembayaran (Rp) *</label
                              >
                              <input
                                type="number"
                                class="form-control"
                                id="jumlahBayar"
                                v-model="paymentForm.jumlah_bayar"
                                placeholder="Masukkan jumlah pembayaran"
                                min="1000"
                                step="1000"
                                required
                              />
                              <div class="form-text" v-if="selectedLoan">
                                Angsuran bulanan:
                                {{ formatCurrency(calculateInstallmentAmount(selectedLoan)) }}
                              </div>
                            </div>
                          </div>

                          <div class="col-md-6">
                            <div class="mb-3">
                              <label for="metodePembayaran" class="form-label"
                                >Metode Pembayaran *</label
                              >
                              <select
                                id="metodePembayaran"
                                class="form-select"
                                v-model="paymentForm.metode_pembayaran"
                                required
                              >
                                <option
                                  v-for="method in paymentMethods"
                                  :key="method.value"
                                  :value="method.value"
                                >
                                  {{ method.label }}
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div class="row">
                          <div class="col-md-6">
                            <div class="mb-3">
                              <label for="nomorReferensi" class="form-label">Nomor Referensi</label>
                              <input
                                type="text"
                                class="form-control"
                                id="nomorReferensi"
                                v-model="paymentForm.nomor_referensi"
                                placeholder="No. transaksi/referensi"
                              />
                              <div class="form-text">
                                Nomor transaksi bank atau referensi pembayaran
                              </div>
                            </div>
                          </div>

                          <div class="col-md-6">
                            <div class="mb-3">
                              <label for="buktiTransfer" class="form-label">Bukti Transfer</label>
                              <input
                                type="file"
                                class="form-control"
                                id="buktiTransfer"
                                @change="handleFileUpload"
                                accept="image/*,.pdf"
                              />
                              <div class="form-text">
                                Upload bukti transfer/pembayaran (JPG, PNG, PDF - Max 5MB)
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="mb-3">
                          <label for="keterangan" class="form-label">Keterangan</label>
                          <textarea
                            class="form-control"
                            id="keterangan"
                            v-model="paymentForm.keterangan"
                            rows="3"
                            placeholder="Keterangan tambahan (opsional)"
                          ></textarea>
                        </div>

                        <div class="d-flex gap-2">
                          <button type="submit" class="btn btn-primary" :disabled="isLoading">
                            <span
                              v-if="isLoading"
                              class="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            <i v-else class="bi bi-send me-2"></i>
                            Input Pembayaran
                          </button>

                          <button
                            type="button"
                            class="btn btn-outline-secondary"
                            @click="resetForm"
                          >
                            <i class="bi bi-arrow-clockwise me-2"></i>
                            Reset Form
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <div class="col-md-4">
                  <div class="card" v-if="selectedLoan">
                    <div class="card-header">
                      <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Detail Pinjaman</h5>
                    </div>
                    <div class="card-body">
                      <dl class="row">
                        <dt class="col-sm-6">Jenis Pinjaman:</dt>
                        <dd class="col-sm-6">{{ selectedLoan.jenis_pinjaman }}</dd>

                        <dt class="col-sm-6">Jumlah Pinjaman:</dt>
                        <dd class="col-sm-6">{{ formatCurrency(selectedLoan.jumlah_pinjaman) }}</dd>

                        <dt class="col-sm-6">Bunga Total:</dt>
                        <dd class="col-sm-6">{{ formatCurrency(selectedLoan.bunga_total) }}</dd>

                        <dt class="col-sm-6">Total Harus Dibayar:</dt>
                        <dd class="col-sm-6 text-primary">
                          <strong>{{
                            formatCurrency(selectedLoan.jumlah_pinjaman + selectedLoan.bunga_total)
                          }}</strong>
                        </dd>

                        <dt class="col-sm-6">Sudah Dibayar:</dt>
                        <dd class="col-sm-6 text-success">
                          {{ formatCurrency(selectedLoan.total_dibayar || 0) }}
                        </dd>

                        <dt class="col-sm-6">Sisa Tagihan:</dt>
                        <dd class="col-sm-6 text-danger">
                          <strong>{{
                            formatCurrency(calculateRemainingBalance(selectedLoan))
                          }}</strong>
                        </dd>

                        <dt class="col-sm-6">Tenor:</dt>
                        <dd class="col-sm-6">{{ selectedLoan.tenor_bulan }} bulan</dd>

                        <dt class="col-sm-6">Angsuran/Bulan:</dt>
                        <dd class="col-sm-6">
                          {{ formatCurrency(calculateInstallmentAmount(selectedLoan)) }}
                        </dd>

                        <dt class="col-sm-6">Jatuh Tempo:</dt>
                        <dd class="col-sm-6">
                          {{
                            selectedLoan.tanggal_jatuh_tempo
                              ? formatDate(selectedLoan.tanggal_jatuh_tempo)
                              : '-'
                          }}
                        </dd>
                      </dl>
                    </div>
                  </div>

                  <div class="card mt-3">
                    <div class="card-body">
                      <h6 class="card-title">
                        <i class="bi bi-question-circle me-2"></i>Petunjuk Pembayaran
                      </h6>
                      <ul class="small">
                        <li>Pastikan jumlah pembayaran sesuai dengan angsuran bulanan</li>
                        <li>Upload bukti transfer untuk mempercepat verifikasi</li>
                        <li>Pembayaran akan diverifikasi dalam 1-2 hari kerja</li>
                        <li>Hubungi pengurus jika ada pertanyaan</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment History Tab -->
            <div v-show="activeTab === 'history'" class="tab-pane">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Tanggal Bayar</th>
                      <th>Pinjaman</th>
                      <th>Jumlah Dibayar</th>
                      <th>Metode</th>
                      <th>No. Referensi</th>
                      <th>Status</th>
                      <th>Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="isLoading">
                      <td colspan="7" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Memuat data...
                      </td>
                    </tr>
                    <tr v-else-if="paymentHistory.length === 0">
                      <td colspan="7" class="text-center py-4 text-muted">
                        Belum ada riwayat pembayaran
                      </td>
                    </tr>
                    <tr v-else v-for="payment in paymentHistory" :key="payment.id">
                      <td>{{ formatDate(payment.tanggal_bayar) }}</td>
                      <td>{{ payment.jenis_pinjaman }}</td>
                      <td class="text-success">{{ formatCurrency(payment.jumlah_bayar) }}</td>
                      <td>
                        <span class="badge bg-secondary">{{ payment.metode_pembayaran }}</span>
                      </td>
                      <td>{{ payment.nomor_referensi || '-' }}</td>
                      <td>
                        <span
                          :class="{
                            'badge rounded-pill': true,
                            'bg-success': payment.status === 'diverifikasi',
                            'bg-warning text-dark': payment.status === 'menunggu',
                            'bg-danger': payment.status === 'ditolak',
                          }"
                        >
                          {{
                            payment.status === 'diverifikasi'
                              ? 'Diverifikasi'
                              : payment.status === 'menunggu'
                                ? 'Menunggu'
                                : 'Ditolak'
                          }}
                        </span>
                      </td>
                      <td>
                        <a
                          v-if="payment.bukti_transfer"
                          :href="payment.bukti_transfer"
                          target="_blank"
                          class="btn btn-sm btn-outline-primary"
                        >
                          <i class="bi bi-eye"></i>
                        </a>
                        <span v-else class="text-muted">-</span>
                      </td>
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

dl {
  margin-bottom: 0;
}

dt {
  font-weight: 600;
  font-size: 0.875rem;
  color: #6c757d;
}

dd {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
</style>

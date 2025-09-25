<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePinjamanVerifikasiStore } from '@/stores/modules/pinjamanVerifikasi'
import DocumentViewerModal from '@/components/shared/DocumentViewerModal.vue'
import VerificationNavigation from '@/components/pengurus/VerificationNavigation.vue'
import { useErrorHandler } from '@/lib/errorHandler'

// Store
const pinjamanStore = usePinjamanVerifikasiStore()

// Error handling
const {
  error: errorMessage,
  loading: isLoading,
  success: successMessage,
  handleAsync,
  showSuccess,
} = useErrorHandler()

// State
const selectedLoanId = ref('')
const notes = ref('')
const searchTerm = ref('')
const sortBy = ref('created_at')
const sortDir = ref('desc')

// Document viewer state
const showDocumentViewer = ref(false)
const currentDocument = ref({
  path: '',
  name: '',
  type: '',
})

// Open document viewer
const openDocumentViewer = (doc: { pathFile: string; namaFile: string; jenisDokumen: string }) => {
  currentDocument.value = {
    path: doc.pathFile,
    name: doc.namaFile,
    type: doc.jenisDokumen,
  }
  showDocumentViewer.value = true
}

// Get loan details
const showLoanDetails = async (id: string) => {
  if (selectedLoanId.value === id) {
    selectedLoanId.value = ''
    return
  }

  selectedLoanId.value = id

  await handleAsync(() => pinjamanStore.getLoanDetails(id), 'Gagal memuat detail pinjaman')
}

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Verify document
const verifyDocument = async (loanId: string, docId: string, status: 'diterima' | 'ditolak') => {
  const result = await handleAsync(
    () => pinjamanStore.verifyDocument(loanId, docId, status, notes.value),
    'Gagal memverifikasi dokumen',
  )

  if (result) {
    notes.value = ''
    showSuccess(`Dokumen berhasil ${status === 'diterima' ? 'diterima' : 'ditolak'}`)
  }
}

// Complete verification
const completeVerification = async (loanId: string, isApproved: boolean) => {
  if (!confirmAllDocumentsVerified()) {
    errorMessage.value = 'Semua dokumen harus diverifikasi terlebih dahulu'
    return
  }

  try {
    await pinjamanStore.completeLoanVerification(loanId, isApproved, notes.value)
    notes.value = ''
    selectedLoanId.value = ''
  } catch (error) {
    console.error('Error completing verification:', error)
    errorMessage.value = 'Gagal menyelesaikan verifikasi'
  }
}

// Check if all documents are verified
const confirmAllDocumentsVerified = () => {
  if (!pinjamanStore.currentVerifikasi?.dokumenPendukung) return false

  return !pinjamanStore.currentVerifikasi.dokumenPendukung.some((doc) => doc.status === 'menunggu')
}

// Get document status class
const getDocStatusClass = (status: string) => {
  switch (status) {
    case 'diterima':
      return 'bg-success'
    case 'ditolak':
      return 'bg-danger'
    default:
      return 'bg-warning'
  }
}

// Filter and sort loans
const filteredLoans = computed(() => {
  let result = [...(pinjamanStore.verifikasiList || [])]

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter((loan) => {
      return (
        loan.id.toLowerCase().includes(term) ||
        loan.name.toLowerCase().includes(term) ||
        loan.nomor_anggota.toLowerCase().includes(term) ||
        loan.tujuan.toLowerCase().includes(term)
      )
    })
  }

  // Sort
  result.sort((a, b) => {
    let valA, valB

    switch (sortBy.value) {
      case 'jumlah':
        valA = a.jumlah
        valB = b.jumlah
        break
      case 'created_at':
        valA = new Date(a.created_at).getTime()
        valB = new Date(b.created_at).getTime()
        break
      case 'name':
        valA = a.name.toLowerCase()
        valB = b.name.toLowerCase()
        break
      default:
        valA = String(a.id)
        valB = String(b.id)
    }

    if (sortDir.value === 'asc') {
      return valA > valB ? 1 : -1
    } else {
      return valA < valB ? 1 : -1
    }
  })

  return result
})

// Toggle sort
const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
}

// Get sort icon
const getSortIcon = (field: string) => {
  if (sortBy.value !== field) return 'bi-arrow-down-up'
  return sortDir.value === 'asc' ? 'bi-sort-up' : 'bi-sort-down'
}

// Load data on mount
onMounted(async () => {
  await handleAsync(
    () => pinjamanStore.getVerifikasiList(),
    'Gagal memuat daftar pinjaman untuk verifikasi',
  )
})
</script>

<template>
  <div class="verification-container">
    <h1 class="mb-4">Verifikasi Pinjaman</h1>

    <VerificationNavigation activeTab="verification" />

    <div v-if="isLoading && !selectedLoanId" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat data verifikasi pinjaman...</p>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="errorMessage = ''">Tutup</button>
    </div>

    <div v-else-if="successMessage" class="alert alert-success" role="alert">
      {{ successMessage }}
    </div>

    <div v-else>
      <!-- Search and filter -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-6">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Cari pinjaman..."
                  v-model="searchTerm"
                />
                <button class="btn btn-outline-secondary" type="button">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
            <div class="col-md-6 text-md-end mt-3 mt-md-0">
              <span class="badge bg-primary me-2"
                >Total: {{ pinjamanStore.verifikasiList.length }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Loan verification list -->
      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Daftar Pinjaman untuk Diverifikasi</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th class="sortable" @click="toggleSort('id')">
                        ID <i class="bi" :class="getSortIcon('id')"></i>
                      </th>
                      <th class="sortable" @click="toggleSort('name')">
                        Anggota <i class="bi" :class="getSortIcon('name')"></i>
                      </th>
                      <th class="sortable" @click="toggleSort('jumlah')">
                        Jumlah <i class="bi" :class="getSortIcon('jumlah')"></i>
                      </th>
                      <th class="sortable" @click="toggleSort('created_at')">
                        Tanggal <i class="bi" :class="getSortIcon('created_at')"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="loan in filteredLoans"
                      :key="loan.id"
                      :class="{ 'table-active': selectedLoanId === loan.id }"
                      @click="showLoanDetails(loan.id)"
                      style="cursor: pointer"
                    >
                      <td>{{ loan.id }}</td>
                      <td>
                        {{ loan.name }} <br /><small>{{ loan.nomor_anggota }}</small>
                      </td>
                      <td>{{ formatCurrency(loan.jumlah) }}</td>
                      <td>{{ formatDate(loan.created_at) }}</td>
                    </tr>
                    <tr v-if="filteredLoans.length === 0">
                      <td colspan="4" class="text-center py-4">
                        Tidak ada pinjaman untuk diverifikasi
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <!-- Detail view -->
          <div v-if="selectedLoanId" class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Detail Verifikasi</h5>
              <button class="btn-close" @click="selectedLoanId = ''"></button>
            </div>
            <div class="card-body">
              <div v-if="isLoading" class="text-center py-3">
                <div class="spinner-border spinner-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else-if="pinjamanStore.currentVerifikasi">
                <div class="loan-details mb-4">
                  <h6>Informasi Pinjaman</h6>
                  <div class="row">
                    <div class="col-md-6">
                      <p><strong>ID:</strong> {{ pinjamanStore.currentVerifikasi.id }}</p>
                      <p><strong>Anggota:</strong> {{ pinjamanStore.currentVerifikasi.name }}</p>
                      <p>
                        <strong>Nomor Anggota:</strong>
                        {{ pinjamanStore.currentVerifikasi.nomor_anggota }}
                      </p>
                    </div>
                    <div class="col-md-6">
                      <p>
                        <strong>Jumlah:</strong>
                        {{ formatCurrency(pinjamanStore.currentVerifikasi.jumlah) }}
                      </p>
                      <p>
                        <strong>Tenor:</strong> {{ pinjamanStore.currentVerifikasi.tenor }} bulan
                      </p>
                      <p><strong>Tujuan:</strong> {{ pinjamanStore.currentVerifikasi.tujuan }}</p>
                    </div>
                  </div>
                </div>

                <h6>Dokumen Pendukung</h6>
                <div class="document-list">
                  <div
                    v-for="doc in pinjamanStore.currentVerifikasi.dokumenPendukung"
                    :key="doc.id"
                    class="document-item card mb-2"
                  >
                    <div class="card-body py-2">
                      <div class="row align-items-center">
                        <div class="col-md-4">
                          <span class="document-name">{{ doc.namaFile }}</span>
                          <small class="d-block text-muted">{{ doc.jenisDokumen }}</small>
                          <span class="badge ms-2" :class="getDocStatusClass(doc.status)">
                            {{ doc.status }}
                          </span>
                        </div>
                        <div class="col-md-4">
                          <button
                            @click="openDocumentViewer(doc)"
                            class="btn btn-sm btn-outline-secondary"
                          >
                            <i class="bi bi-file-earmark"></i> Lihat Dokumen
                          </button>
                        </div>
                        <div class="col-md-4 text-end">
                          <button
                            @click="
                              verifyDocument(
                                pinjamanStore.currentVerifikasi?.id,
                                doc.id,
                                'diterima',
                              )
                            "
                            class="btn btn-sm btn-success me-1"
                            :disabled="doc.status === 'diterima'"
                          >
                            <i class="bi bi-check-lg"></i> Terima
                          </button>
                          <button
                            @click="
                              verifyDocument(pinjamanStore.currentVerifikasi?.id, doc.id, 'ditolak')
                            "
                            class="btn btn-sm btn-danger"
                            :disabled="doc.status === 'ditolak'"
                          >
                            <i class="bi bi-x-lg"></i> Tolak
                          </button>
                        </div>
                      </div>
                      <div v-if="doc.catatan" class="mt-1 small text-muted">
                        <i class="bi bi-chat-left-text"></i> {{ doc.catatan }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notes and actions -->
                <div class="mt-4">
                  <div class="mb-3">
                    <label for="verificationNotes" class="form-label">Catatan Verifikasi</label>
                    <textarea
                      id="verificationNotes"
                      class="form-control"
                      v-model="notes"
                      rows="3"
                    ></textarea>
                  </div>

                  <div class="d-flex justify-content-between">
                    <button
                      @click="completeVerification(pinjamanStore.currentVerifikasi?.id, false)"
                      class="btn btn-danger"
                    >
                      <i class="bi bi-x-circle"></i> Tolak Pinjaman
                    </button>
                    <button
                      @click="completeVerification(pinjamanStore.currentVerifikasi?.id, true)"
                      class="btn btn-success"
                    >
                      <i class="bi bi-check-circle"></i> Setujui Pinjaman
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="card">
            <div class="card-body text-center py-5">
              <i class="bi bi-file-earmark-text" style="font-size: 3rem; opacity: 0.5"></i>
              <p class="mt-3">Pilih pinjaman untuk melihat detail</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Document Viewer Modal -->
    <DocumentViewerModal
      :show="showDocumentViewer"
      :documentPath="currentDocument.path"
      :documentName="currentDocument.name"
      :documentType="currentDocument.type"
      @close="showDocumentViewer = false"
    />
  </div>
</template>

<style scoped>
.verification-container {
  padding: 1rem;
}

.sortable {
  cursor: pointer;
}

.sortable:hover {
  background-color: #f8f9fa;
}

.document-item {
  transition: all 0.2s;
}

.document-item:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>

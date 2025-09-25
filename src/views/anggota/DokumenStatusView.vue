<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAnggotaDokumenStore } from '@/stores/modules/anggotaDokumen'
import DocumentViewerModal from '@/components/shared/DocumentViewerModal.vue'

// Store
const dokumenStore = useAnggotaDokumenStore()

// State
const isLoading = ref(true)
const errorMessage = ref('')
const showDocumentViewer = ref(false)
const currentDocument = ref({
  path: '',
  name: '',
  type: '',
})

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
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Get status class
const getStatusClass = (status: string) => {
  switch (status) {
    case 'diterima':
      return 'bg-success'
    case 'ditolak':
      return 'bg-danger'
    default:
      return 'bg-warning'
  }
}

// Get loan status class
const getLoanStatusClass = (status: string) => {
  switch (status) {
    case 'disetujui':
      return 'bg-success'
    case 'ditolak':
      return 'bg-danger'
    case 'verifikasi':
      return 'bg-info'
    case 'antrean':
      return 'bg-warning'
    case 'aktif':
      return 'bg-primary'
    case 'lunas':
      return 'bg-secondary'
    default:
      return 'bg-light'
  }
}

// View document details
const viewDocumentDetails = (loanId: string) => {
  dokumenStore.setCurrentLoan(loanId)
}

// Close document details
const closeDocumentDetails = () => {
  dokumenStore.clearCurrentLoan()
}

// Open document viewer
const openDocumentViewer = (document: any) => {
  currentDocument.value = {
    path: document.path_file || '',
    name: document.nama_file || '',
    type: document.jenis_dokumen || '',
  }
  showDocumentViewer.value = true
}

// Load data
onMounted(async () => {
  try {
    await dokumenStore.loadDocuments()
  } catch (error) {
    console.error('Error loading documents:', error)
    errorMessage.value = 'Gagal memuat status dokumen'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="document-tracking-container">
    <h1 class="mb-4">Status Verifikasi Dokumen</h1>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat data dokumen...</p>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="errorMessage = ''">Tutup</button>
    </div>

    <div v-else>
      <!-- Document overview card -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="stat-card">
                <h5>Progress Verifikasi</h5>
                <div class="progress">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{ width: dokumenStore.documentProgress + '%' }"
                    :aria-valuenow="dokumenStore.documentProgress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {{ dokumenStore.documentProgress }}%
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="stat-card">
                <h5>Dokumen Menunggu</h5>
                <p class="stat-value text-warning">
                  {{ dokumenStore.pendingDocumentLoans.length }} Pinjaman
                </p>
              </div>
            </div>

            <div class="col-md-4">
              <div class="stat-card">
                <h5>Dokumen Ditolak</h5>
                <p class="stat-value text-danger">
                  {{ dokumenStore.rejectedDocumentLoans.length }} Pinjaman
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Document list -->
      <div class="row">
        <div class="col-md-5">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Daftar Pinjaman</h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <button
                  v-for="loan in dokumenStore.loanDocuments"
                  :key="loan.id"
                  class="list-group-item list-group-item-action"
                  :class="{ active: dokumenStore.currentLoanDocuments?.id === loan.id }"
                  @click="viewDocumentDetails(loan.id)"
                >
                  <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">{{ loan.id }}</h6>
                    <small>{{ formatDate(loan.created_at) }}</small>
                  </div>
                  <p class="mb-1">{{ loan.tujuan }}</p>
                  <div class="d-flex justify-content-between">
                    <small>{{ formatCurrency(loan.jumlah) }}</small>
                    <span class="badge" :class="getLoanStatusClass(loan.status_pinjaman)">
                      {{ loan.status_pinjaman }}
                    </span>
                  </div>
                  <div class="document-progress mt-2">
                    <div class="progress" style="height: 5px">
                      <div
                        class="progress-bar bg-success"
                        role="progressbar"
                        :style="{
                          width: (loan.accepted_documents / loan.total_documents) * 100 + '%',
                        }"
                      ></div>
                      <div
                        class="progress-bar bg-danger"
                        role="progressbar"
                        :style="{
                          width: (loan.rejected_documents / loan.total_documents) * 100 + '%',
                        }"
                      ></div>
                    </div>
                    <small class="d-block mt-1">
                      {{ loan.accepted_documents }} Diterima, {{ loan.rejected_documents }} Ditolak,
                      {{ loan.pending_documents }} Menunggu
                    </small>
                  </div>
                </button>

                <div
                  v-if="dokumenStore.loanDocuments.length === 0"
                  class="list-group-item text-center py-4"
                >
                  <i class="bi bi-file-earmark-text" style="font-size: 2rem; opacity: 0.5"></i>
                  <p class="mt-3">Belum ada pinjaman dengan dokumen</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-7">
          <div v-if="dokumenStore.currentLoanDocuments" class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Detail Dokumen</h5>
              <button class="btn-close" @click="closeDocumentDetails"></button>
            </div>
            <div class="card-body">
              <div class="loan-details mb-4">
                <h6>Informasi Pinjaman</h6>
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>ID:</strong> {{ dokumenStore.currentLoanDocuments.id }}</p>
                    <p><strong>Tujuan:</strong> {{ dokumenStore.currentLoanDocuments.tujuan }}</p>
                  </div>
                  <div class="col-md-6">
                    <p>
                      <strong>Jumlah:</strong>
                      {{ formatCurrency(dokumenStore.currentLoanDocuments.jumlah) }}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        class="badge"
                        :class="
                          getLoanStatusClass(dokumenStore.currentLoanDocuments.status_pinjaman)
                        "
                      >
                        {{ dokumenStore.currentLoanDocuments.status_pinjaman }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <h6>Dokumen Pendukung</h6>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Dokumen</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="doc in dokumenStore.currentLoanDocuments.documents" :key="doc.id">
                      <td>
                        {{ doc.jenis_dokumen }}
                        <small class="text-muted d-block">{{ doc.nama_file }}</small>
                      </td>
                      <td>
                        <span class="badge" :class="getStatusClass(doc.status)">
                          {{ doc.status }}
                        </span>
                        <small v-if="doc.catatan" class="d-block mt-1">
                          <i class="bi bi-chat-left-text"></i> {{ doc.catatan }}
                        </small>
                      </td>
                      <td>{{ formatDate(doc.updated_at || doc.uploaded_at) }}</td>
                      <td>
                        <button
                          @click="openDocumentViewer(doc)"
                          class="btn btn-sm btn-outline-primary"
                        >
                          <i class="bi bi-eye"></i> Lihat
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                v-if="dokumenStore.currentLoanDocuments.rejected_documents > 0"
                class="alert alert-warning mt-3"
              >
                <i class="bi bi-exclamation-triangle"></i>
                Ada dokumen yang ditolak. Silakan unggah ulang dokumen yang dibutuhkan.
              </div>
            </div>
          </div>

          <div v-else class="card">
            <div class="card-body text-center py-5">
              <i class="bi bi-file-earmark-text" style="font-size: 3rem; opacity: 0.5"></i>
              <p class="mt-3">Pilih pinjaman untuk melihat detail dokumen</p>
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
.document-tracking-container {
  padding: 1rem;
}

.stat-card {
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  height: 100%;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.document-progress {
  margin-top: 8px;
}

.list-group-item.active {
  background-color: #f0f8ff;
  border-color: #0d6efd;
  color: #212529;
}

.list-group-item.active .badge {
  border: 1px solid #fff;
}
</style>

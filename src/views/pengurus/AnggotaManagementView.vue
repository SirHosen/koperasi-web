<template>
  <div class="anggota-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="bi bi-people-fill me-2"></i>Manajemen Anggota</h1>
        <p class="text-muted">Kelola data anggota koperasi</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline-success me-2" @click="exportToExcel" :disabled="isLoading">
          <i class="bi bi-file-earmark-excel me-1"></i>
          Export Excel
        </button>
        <button class="btn btn-primary" @click="showCreateModal = true">
          <i class="bi bi-plus-lg me-1"></i>
          Tambah Anggota
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Pencarian</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Nama, No. Anggota, Email, NIK..."
              v-model="filters.search"
              @input="debouncedSearch"
            />
          </div>
        </div>
        <div class="col-md-2">
          <label class="form-label">Status</label>
          <select class="form-select" v-model="filters.status" @change="loadMembers">
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Urutkan</label>
          <select class="form-select" v-model="filters.sortBy" @change="loadMembers">
            <option value="created_at">Tanggal Daftar</option>
            <option value="name">Nama</option>
            <option value="nomor_anggota">No. Anggota</option>
            <option value="tanggal_bergabung">Tanggal Bergabung</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Urutan</label>
          <select class="form-select" v-model="filters.sortOrder" @change="loadMembers">
            <option value="DESC">Terbaru</option>
            <option value="ASC">Terlama</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Per Halaman</label>
          <select class="form-select" v-model="filters.limit" @change="loadMembers">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="alert alert-success" role="alert">
      <i class="bi bi-check-circle me-2"></i>
      {{ successMessage }}
    </div>

    <!-- Members Table -->
    <div class="table-section">
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Memuat data anggota...</p>
      </div>

      <div v-else-if="members.length === 0" class="text-center py-5">
        <i class="bi bi-people display-1 text-muted"></i>
        <h5 class="mt-3 text-muted">Tidak ada data anggota</h5>
        <p class="text-muted">
          Belum ada anggota yang terdaftar atau sesuai dengan filter pencarian
        </p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>No. Anggota</th>
              <th>Nama</th>
              <th>Email</th>
              <th>NIK</th>
              <th>Telepon</th>
              <th>Tanggal Bergabung</th>
              <th>Total Simpanan</th>
              <th>Pinjaman Aktif</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.id">
              <td>
                <strong>{{ member.nomor_anggota }}</strong>
              </td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="avatar-sm me-2">
                    <i class="bi bi-person-circle fs-4 text-muted"></i>
                  </div>
                  <div>
                    <div class="fw-semibold">{{ member.name }}</div>
                    <small class="text-muted">{{ member.username }}</small>
                  </div>
                </div>
              </td>
              <td>{{ member.email }}</td>
              <td>{{ member.nik }}</td>
              <td>{{ member.telepon }}</td>
              <td>{{ formatDate(member.tanggal_bergabung) }}</td>
              <td>
                <div class="fw-semibold text-success">
                  {{ formatCurrency(member.total_simpanan) }}
                </div>
              </td>
              <td>
                <span v-if="member.pinjaman_aktif > 0" class="badge bg-warning">
                  {{ member.pinjaman_aktif }} Aktif
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span
                  :class="{
                    badge: true,
                    'bg-success': member.status_aktif,
                    'bg-secondary': !member.status_aktif,
                  }"
                >
                  {{ member.status_aktif ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-info"
                    @click="viewMember(member.id)"
                    title="Lihat Detail"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-outline-primary" @click="editMember(member)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-if="member.pinjaman_aktif === 0"
                    class="btn btn-outline-danger"
                    @click="confirmDelete(member)"
                    title="Nonaktifkan"
                  >
                    <i class="bi bi-person-x"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="pagination-section">
      <nav>
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
            <button
              class="page-link"
              @click="changePage(pagination.currentPage - 1)"
              :disabled="pagination.currentPage === 1"
            >
              Previous
            </button>
          </li>

          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: page === pagination.currentPage }"
          >
            <button class="page-link" @click="changePage(page)">
              {{ page }}
            </button>
          </li>

          <li
            class="page-item"
            :class="{ disabled: pagination.currentPage === pagination.totalPages }"
          >
            <button
              class="page-link"
              @click="changePage(pagination.currentPage + 1)"
              :disabled="pagination.currentPage === pagination.totalPages"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      <div class="text-center text-muted mt-2">
        Menampilkan {{ (pagination.currentPage - 1) * pagination.itemsPerPage + 1 }} -
        {{ Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) }}
        dari {{ pagination.totalItems }} anggota
      </div>
    </div>

    <!-- Create/Edit Member Modal -->
    <div
      class="modal fade"
      :class="{ show: showCreateModal || showEditModal }"
      tabindex="-1"
      :style="{ display: showCreateModal || showEditModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="saveMember">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ showCreateModal ? 'Tambah Anggota Baru' : 'Edit Anggota' }}
              </h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="memberForm.name"
                    :class="{ 'is-invalid': formErrors.name }"
                    required
                  />
                  <div v-if="formErrors.name" class="invalid-feedback">
                    {{ formErrors.name }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    v-model="memberForm.email"
                    :class="{ 'is-invalid': formErrors.email }"
                    required
                  />
                  <div v-if="formErrors.email" class="invalid-feedback">
                    {{ formErrors.email }}
                  </div>
                </div>
                <div v-if="showCreateModal" class="col-md-6">
                  <label class="form-label">Username *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="memberForm.username"
                    :class="{ 'is-invalid': formErrors.username }"
                    required
                  />
                  <div v-if="formErrors.username" class="invalid-feedback">
                    {{ formErrors.username }}
                  </div>
                </div>
                <div v-if="showCreateModal" class="col-md-6">
                  <label class="form-label">Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="memberForm.password"
                    :class="{ 'is-invalid': formErrors.password }"
                    required
                  />
                  <div v-if="formErrors.password" class="invalid-feedback">
                    {{ formErrors.password }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">NIK *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="memberForm.nik"
                    :class="{ 'is-invalid': formErrors.nik }"
                    :disabled="showEditModal"
                    required
                  />
                  <div v-if="formErrors.nik" class="invalid-feedback">
                    {{ formErrors.nik }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Telepon *</label>
                  <input
                    type="tel"
                    class="form-control"
                    v-model="memberForm.telepon"
                    :class="{ 'is-invalid': formErrors.telepon }"
                    required
                  />
                  <div v-if="formErrors.telepon" class="invalid-feedback">
                    {{ formErrors.telepon }}
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label">Alamat *</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    v-model="memberForm.alamat"
                    :class="{ 'is-invalid': formErrors.alamat }"
                    required
                  ></textarea>
                  <div v-if="formErrors.alamat" class="invalid-feedback">
                    {{ formErrors.alamat }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tanggal Bergabung *</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="memberForm.tanggal_bergabung"
                    :disabled="showEditModal"
                    required
                  />
                </div>
                <div v-if="showCreateModal" class="col-md-6">
                  <label class="form-label">Simpanan Pokok</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="memberForm.simpanan_pokok"
                    min="0"
                    step="1000"
                  />
                  <div class="form-text">Opsional, bisa diisi kemudian</div>
                </div>
                <div v-if="showEditModal" class="col-md-6">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="memberForm.status_aktif">
                    <option :value="true">Aktif</option>
                    <option :value="false">Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ showCreateModal ? 'Tambah Anggota' : 'Simpan Perubahan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div v-if="showCreateModal || showEditModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Router
const router = useRouter()

// Reactive data
const isLoading = ref(false)
const isSubmitting = ref(false)
const members = ref([])
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
})

// Filters
const filters = ref({
  search: '',
  status: 'all',
  sortBy: 'created_at',
  sortOrder: 'DESC',
  limit: 10,
})

// Messages
const errorMessage = ref('')
const successMessage = ref('')

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const currentMemberId = ref(null)

// Form data
const memberForm = ref({
  name: '',
  email: '',
  username: '',
  password: '',
  nik: '',
  alamat: '',
  telepon: '',
  tanggal_bergabung: new Date().toISOString().split('T')[0],
  simpanan_pokok: 0,
  status_aktif: true,
})

const formErrors = ref({})

// Computed
const visiblePages = computed(() => {
  const pages = []
  const current = pagination.value.currentPage
  const total = pagination.value.totalPages

  // Show up to 5 pages
  let start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)

  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1
    loadMembers()
  }, 500)
}

// Methods
const loadMembers = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const params = new URLSearchParams({
      page: pagination.value.currentPage.toString(),
      limit: filters.value.limit.toString(),
      search: filters.value.search,
      status: filters.value.status,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder,
    })

    const response = await axios.get(`${API_URL}/anggota-management?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (response.data.status === 'success') {
      members.value = response.data.data
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Error loading members:', error)
    errorMessage.value = 'Gagal memuat data anggota'
  } finally {
    isLoading.value = false
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.currentPage = page
    loadMembers()
  }
}

const viewMember = (memberId: string) => {
  router.push(`/pengurus/anggota/${memberId}`)
}

const editMember = (member: Record<string, unknown>) => {
  currentMemberId.value = member.id as string
  memberForm.value = {
    name: member.name as string,
    email: member.email as string,
    username: member.username as string,
    password: '',
    nik: member.nik as string,
    alamat: member.alamat as string,
    telepon: member.telepon as string,
    tanggal_bergabung: (member.tanggal_bergabung as string)?.split('T')[0] || '',
    simpanan_pokok: 0,
    status_aktif: member.status_aktif as boolean,
  }
  formErrors.value = {}
  showEditModal.value = true
}

const confirmDelete = (member: Record<string, unknown>) => {
  if (confirm(`Apakah Anda yakin ingin menonaktifkan anggota ${member.name}?`)) {
    deleteMember(member.id as string)
  }
}

const deleteMember = async (memberId: string) => {
  try {
    await axios.delete(`${API_URL}/anggota-management/${memberId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    successMessage.value = 'Anggota berhasil dinonaktifkan'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    loadMembers()
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    errorMessage.value = axiosError.response?.data?.message || 'Gagal menonaktifkan anggota'
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }
}

const saveMember = async () => {
  isSubmitting.value = true
  formErrors.value = {}
  errorMessage.value = ''

  try {
    const url = showCreateModal.value
      ? `${API_URL}/anggota-management`
      : `${API_URL}/anggota-management/${currentMemberId.value}`

    const method = showCreateModal.value ? 'post' : 'put'

    const response = await axios[method](url, memberForm.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (response.data.status === 'success') {
      successMessage.value = showCreateModal.value
        ? 'Anggota berhasil ditambahkan'
        : 'Anggota berhasil diupdate'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
      closeModal()
      loadMembers()
    }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { errors?: Record<string, string>; message?: string } }
    }
    if (axiosError.response?.data?.errors) {
      formErrors.value = axiosError.response.data.errors
    } else {
      errorMessage.value = axiosError.response?.data?.message || 'Terjadi kesalahan'
      setTimeout(() => {
        errorMessage.value = ''
      }, 5000)
    }
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  currentMemberId.value = null
  memberForm.value = {
    name: '',
    email: '',
    username: '',
    password: '',
    nik: '',
    alamat: '',
    telepon: '',
    tanggal_bergabung: new Date().toISOString().split('T')[0],
    simpanan_pokok: 0,
    status_aktif: true,
  }
  formErrors.value = {}
}

const exportToExcel = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/anggota-management/export/excel?status=${filters.value.status}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob',
      },
    )

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `data-anggota-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    successMessage.value = 'Data anggota berhasil diekspor'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch {
    errorMessage.value = 'Gagal mengekspor data anggota'
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }
}

// Utility functions
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

// Lifecycle
onMounted(() => {
  loadMembers()
})
</script>

<style scoped>
.anggota-management {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.header-content h1 {
  margin: 0;
  color: #495057;
}

.filters-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.table-section {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.table {
  margin: 0;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-section {
  margin-top: 2rem;
}

.modal {
  background: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  margin: 1.75rem auto;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .filters-section .row > div {
    margin-bottom: 1rem;
  }
}
</style>

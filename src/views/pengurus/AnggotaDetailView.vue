<template>
  <div class="anggota-detail">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat detail anggota...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ errorMessage }}
    </div>

    <!-- Member Detail -->
    <div v-else-if="member">
      <!-- Header -->
      <div class="page-header">
        <div class="d-flex align-items-center">
          <button class="btn btn-outline-secondary me-3" @click="goBack">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div>
            <h1 class="mb-1">Detail Anggota</h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item">
                  <router-link to="/pengurus/dashboard">Dashboard</router-link>
                </li>
                <li class="breadcrumb-item">
                  <router-link to="/pengurus/anggota">Manajemen Anggota</router-link>
                </li>
                <li class="breadcrumb-item active">{{ member.name }}</li>
              </ol>
            </nav>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline-primary me-2" @click="editMember">
            <i class="bi bi-pencil me-1"></i>
            Edit
          </button>
          <div class="dropdown">
            <button
              class="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu">
              <li>
                <button class="dropdown-item" @click="printProfile">
                  <i class="bi bi-printer me-2"></i>
                  Cetak Profil
                </button>
              </li>
              <li>
                <button class="dropdown-item" @click="exportData">
                  <i class="bi bi-download me-2"></i>
                  Export Data
                </button>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button
                  class="dropdown-item text-danger"
                  @click="confirmDeactivate"
                  :disabled="member.pinjaman_aktif > 0"
                >
                  <i class="bi bi-person-x me-2"></i>
                  Nonaktifkan
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Member Info Cards -->
      <div class="row g-4">
        <!-- Basic Info -->
        <div class="col-lg-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-person-badge me-2"></i>
                Informasi Dasar
              </h5>
            </div>
            <div class="card-body">
              <div class="text-center mb-4">
                <div class="avatar-lg mx-auto mb-3">
                  <i class="bi bi-person-circle display-3 text-muted"></i>
                </div>
                <h4 class="mb-1">{{ member.name }}</h4>
                <p class="text-muted mb-2">{{ member.username }}</p>
                <span
                  :class="{
                    badge: true,
                    'bg-success': member.status_aktif,
                    'bg-secondary': !member.status_aktif,
                  }"
                >
                  {{ member.status_aktif ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </div>

              <div class="info-list">
                <div class="info-item">
                  <strong>No. Anggota:</strong>
                  <span>{{ member.nomor_anggota }}</span>
                </div>
                <div class="info-item">
                  <strong>Email:</strong>
                  <span>{{ member.email }}</span>
                </div>
                <div class="info-item">
                  <strong>NIK:</strong>
                  <span>{{ member.nik }}</span>
                </div>
                <div class="info-item">
                  <strong>Telepon:</strong>
                  <span>{{ member.telepon }}</span>
                </div>
                <div class="info-item">
                  <strong>Tanggal Bergabung:</strong>
                  <span>{{ formatDate(member.tanggal_bergabung) }}</span>
                </div>
                <div class="info-item">
                  <strong>Alamat:</strong>
                  <span class="text-wrap">{{ member.alamat }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Summary -->
        <div class="col-lg-8">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-bar-chart me-2"></i>
                Ringkasan Keuangan
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3 mb-4">
                <div class="col-md-3">
                  <div class="stat-card bg-primary-subtle">
                    <div class="stat-icon">
                      <i class="bi bi-piggy-bank text-primary"></i>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ formatCurrency(member.total_simpanan) }}</div>
                      <div class="stat-label">Total Simpanan</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card bg-success-subtle">
                    <div class="stat-icon">
                      <i class="bi bi-cash-stack text-success"></i>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ formatCurrency(member.simpanan_pokok) }}</div>
                      <div class="stat-label">Simpanan Pokok</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card bg-warning-subtle">
                    <div class="stat-icon">
                      <i class="bi bi-credit-card text-warning"></i>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ member.pinjaman_aktif }}</div>
                      <div class="stat-label">Pinjaman Aktif</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card bg-info-subtle">
                    <div class="stat-icon">
                      <i class="bi bi-calendar-event text-info"></i>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ getMembershipDuration() }}</div>
                      <div class="stat-label">Lama Keanggotaan</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Activities -->
              <div v-if="activities.length > 0">
                <h6 class="mb-3">Aktivitas Terbaru</h6>
                <div class="activity-list">
                  <div
                    v-for="activity in activities.slice(0, 5)"
                    :key="activity.id"
                    class="activity-item"
                  >
                    <div class="activity-icon">
                      <i :class="getActivityIcon(activity.type)"></i>
                    </div>
                    <div class="activity-content">
                      <div class="activity-title">{{ activity.description }}</div>
                      <div class="activity-meta">
                        <span class="text-muted">{{ formatDate(activity.created_at) }}</span>
                        <span v-if="activity.amount" class="ms-2 fw-semibold">
                          {{ formatCurrency(activity.amount) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="text-center mt-3" v-if="activities.length > 5">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="showAllActivities = !showAllActivities"
                  >
                    {{ showAllActivities ? 'Sembunyikan' : 'Lihat Semua' }} Aktivitas
                  </button>
                </div>
              </div>
              <div v-else class="text-center text-muted py-4">
                <i class="bi bi-clock-history display-6"></i>
                <p class="mt-2">Belum ada aktivitas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Sections -->
      <div class="row g-4 mt-1">
        <!-- Simpanan Details -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="bi bi-piggy-bank me-2"></i>
                Detail Simpanan
              </h5>
              <button class="btn btn-outline-primary btn-sm" @click="loadSimpananHistory">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
            <div class="card-body">
              <div v-if="simpananHistory.length > 0">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Jenis</th>
                        <th>Jumlah</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="simpanan in simpananHistory.slice(0, 5)" :key="simpanan.id">
                        <td>{{ formatDate(simpanan.tanggal) }}</td>
                        <td>{{ simpanan.jenis_simpanan }}</td>
                        <td>{{ formatCurrency(simpanan.jumlah) }}</td>
                        <td>
                          <span class="badge bg-success">{{ simpanan.status }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="text-center mt-2" v-if="simpananHistory.length > 5">
                  <small class="text-muted"
                    >Menampilkan 5 dari {{ simpananHistory.length }} transaksi</small
                  >
                </div>
              </div>
              <div v-else class="text-center text-muted py-3">
                <i class="bi bi-piggy-bank display-6"></i>
                <p class="mt-2">Belum ada riwayat simpanan</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pinjaman Details -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="bi bi-credit-card me-2"></i>
                Detail Pinjaman
              </h5>
              <button class="btn btn-outline-primary btn-sm" @click="loadPinjamanHistory">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
            <div class="card-body">
              <div v-if="pinjamanHistory.length > 0">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Jumlah</th>
                        <th>Tenor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="pinjaman in pinjamanHistory.slice(0, 5)" :key="pinjaman.id">
                        <td>{{ formatDate(pinjaman.tanggal_pengajuan) }}</td>
                        <td>{{ formatCurrency(pinjaman.jumlah_pinjaman) }}</td>
                        <td>{{ pinjaman.tenor_bulan }} bulan</td>
                        <td>
                          <span
                            :class="{
                              badge: true,
                              'bg-success': pinjaman.status === 'approved',
                              'bg-warning': pinjaman.status === 'pending',
                              'bg-danger': pinjaman.status === 'rejected',
                            }"
                          >
                            {{ getPinjamanStatusText(pinjaman.status) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="text-center mt-2" v-if="pinjamanHistory.length > 5">
                  <small class="text-muted"
                    >Menampilkan 5 dari {{ pinjamanHistory.length }} pinjaman</small
                  >
                </div>
              </div>
              <div v-else class="text-center text-muted py-3">
                <i class="bi bi-credit-card display-6"></i>
                <p class="mt-2">Belum ada riwayat pinjaman</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Router
const router = useRouter()
const route = useRoute()

// Types
interface Member {
  id: string
  name: string
  username: string
  email: string
  nik: string
  alamat: string
  telepon: string
  nomor_anggota: string
  tanggal_bergabung: string
  status_aktif: boolean
  total_simpanan: number
  simpanan_pokok: number
  pinjaman_aktif: number
}

interface Activity {
  id: number
  type: string
  description: string
  amount?: number
  created_at: string
}

interface Simpanan {
  id: number
  tanggal: string
  jenis_simpanan: string
  jumlah: number
  status: string
}

interface Pinjaman {
  id: number
  tanggal_pengajuan: string
  jumlah_pinjaman: number
  tenor_bulan: number
  status: string
}

// Reactive data
const isLoading = ref(true)
const errorMessage = ref('')
const member = ref<Member | null>(null)
const activities = ref<Activity[]>([])
const simpananHistory = ref<Simpanan[]>([])
const pinjamanHistory = ref<Pinjaman[]>([])
const showAllActivities = ref(false)

// Methods
const loadMemberDetail = async () => {
  const memberId = route.params.id as string

  try {
    const response = await axios.get(`${API_URL}/anggota-management/${memberId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (response.data.status === 'success') {
      member.value = response.data.data
      await Promise.all([loadActivities(), loadSimpananHistory(), loadPinjamanHistory()])
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    errorMessage.value = axiosError.response?.data?.message || 'Gagal memuat detail anggota'
  } finally {
    isLoading.value = false
  }
}

const loadActivities = async () => {
  try {
    // Mock activities - replace with actual API call
    activities.value = [
      {
        id: 1,
        type: 'simpanan',
        description: 'Simpanan Wajib Bulan November',
        amount: 50000,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        type: 'pinjaman',
        description: 'Pengajuan Pinjaman Disetujui',
        amount: 5000000,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]
  } catch (error) {
    console.error('Error loading activities:', error)
  }
}

const loadSimpananHistory = async () => {
  try {
    // Mock data - replace with actual API call
    simpananHistory.value = [
      {
        id: 1,
        tanggal: new Date().toISOString(),
        jenis_simpanan: 'Simpanan Wajib',
        jumlah: 50000,
        status: 'Berhasil',
      },
    ]
  } catch (error) {
    console.error('Error loading simpanan history:', error)
  }
}

const loadPinjamanHistory = async () => {
  try {
    // Mock data - replace with actual API call
    pinjamanHistory.value = [
      {
        id: 1,
        tanggal_pengajuan: new Date().toISOString(),
        jumlah_pinjaman: 5000000,
        tenor_bulan: 12,
        status: 'approved',
      },
    ]
  } catch (error) {
    console.error('Error loading pinjaman history:', error)
  }
}

const goBack = () => {
  router.push('/pengurus/anggota')
}

const editMember = () => {
  // Navigate to edit page or open edit modal
  router.push(`/pengurus/anggota/${route.params.id}/edit`)
}

const confirmDeactivate = () => {
  if (
    member.value &&
    confirm(`Apakah Anda yakin ingin menonaktifkan anggota ${member.value.name}?`)
  ) {
    deactivateMember()
  }
}

const deactivateMember = async () => {
  const memberId = route.params.id as string

  try {
    await axios.delete(`${API_URL}/anggota-management/${memberId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    router.push('/pengurus/anggota')
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    errorMessage.value = axiosError.response?.data?.message || 'Gagal menonaktifkan anggota'
  }
}

const printProfile = () => {
  window.print()
}

const exportData = () => {
  // Implement data export functionality
  console.log('Export member data')
}

// Utility functions
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

const getMembershipDuration = () => {
  if (!member.value?.tanggal_bergabung) return '-'

  const joinDate = new Date(member.value.tanggal_bergabung)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - joinDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 30) {
    return `${diffDays} hari`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} bulan`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingMonths = Math.floor((diffDays % 365) / 30)
    return `${years} tahun ${remainingMonths} bulan`
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'simpanan':
      return 'bi bi-piggy-bank text-success'
    case 'pinjaman':
      return 'bi bi-credit-card text-warning'
    default:
      return 'bi bi-circle text-muted'
  }
}

const getPinjamanStatusText = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Disetujui'
    case 'pending':
      return 'Menunggu'
    case 'rejected':
      return 'Ditolak'
    default:
      return status
  }
}

// Lifecycle
onMounted(() => {
  loadMemberDetail()
})
</script>

<style scoped>
.anggota-detail {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.avatar-lg {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item strong {
  min-width: 120px;
  color: #6c757d;
  font-weight: 500;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
}

.activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-meta {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}

@media print {
  .header-actions,
  .btn {
    display: none !important;
  }
}
</style>

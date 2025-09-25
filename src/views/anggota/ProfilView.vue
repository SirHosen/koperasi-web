<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'
import { useErrorHandler } from '@/lib/errorHandler'

// Types
interface ActivityHistory {
  id: number
  activity: string
  timestamp: string
  ip: string
  device: string
  status: 'success' | 'failed' | 'pending'
}

const authStore = useAuthStore()
const {
  error: errorMessage,
  loading: isLoading,
  success: successMessage,
  handleAsync,
  showSuccess,
} = useErrorHandler()

// Tabs
const activeTab = ref('profile')

// Profile form data
const profileForm = ref({
  nama: '',
  email: '',
  nomorHp: '',
  alamat: '',
  tanggalLahir: '',
  jenisKelamin: '',
  pekerjaan: '',
  penghasilan: '',
})

// Security form data
const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Notification settings
const notificationSettings = ref({
  emailNotifications: true,
  smsNotifications: false,
  whatsappNotifications: true,
  pengingat: {
    simpananWajib: true,
    jatuhTempoPinjaman: true,
    rapatAnggotaTahunan: true,
    pengumuman: true,
  },
  frekuensi: {
    harian: false,
    mingguan: true,
    bulanan: true,
  },
})

// Activity history data
const activityHistory = ref<ActivityHistory[]>([])
const totalPages = ref(1)
const isLoadingHistory = ref(false)

// Original profile data for comparison
const originalProfile = ref({
  nama: '',
  email: '',
  nomorHp: '',
  alamat: '',
  tanggalLahir: '',
  jenisKelamin: '',
  pekerjaan: '',
  penghasilan: '',
})

// Computed
const hasProfileChanges = computed(() => {
  return JSON.stringify(profileForm.value) !== JSON.stringify(originalProfile.value)
})

const isPasswordValid = computed(() => {
  return (
    securityForm.value.newPassword.length >= 8 &&
    securityForm.value.newPassword === securityForm.value.confirmPassword
  )
})

onMounted(async () => {
  await loadUserProfile()
  await loadNotificationSettings()
  if (activeTab.value === 'activity') {
    await loadActivityHistory()
  }
})

// Load user profile
const loadUserProfile = async () => {
  await handleAsync(async () => {
    // Mock data - replace with actual API call
    const mockProfile = {
      nama: authStore.user?.name || 'John Doe',
      email: authStore.user?.email || 'john@example.com',
      nomorHp: '081234567890',
      alamat: 'Jl. Sudirman No. 123, Jakarta',
      tanggalLahir: '1990-01-15',
      jenisKelamin: 'Laki-laki',
      pekerjaan: 'Pegawai Swasta',
      penghasilan: '5000000',
    }

    profileForm.value = { ...mockProfile }
    originalProfile.value = { ...mockProfile }
  }, 'Gagal memuat profil pengguna')
}

// Load notification settings
const loadNotificationSettings = async () => {
  await handleAsync(async () => {
    // Mock data - replace with actual API call
    // Settings already initialized with defaults
    return true
  }, 'Gagal memuat pengaturan notifikasi')
}

// Load activity history
const loadActivityHistory = async () => {
  isLoadingHistory.value = true

  await handleAsync(async () => {
    // Mock data - replace with actual API call
    const mockHistory: ActivityHistory[] = [
      {
        id: 1,
        activity: 'Login ke sistem',
        timestamp: '2025-09-25T09:30:00Z',
        ip: '192.168.1.100',
        device: 'Chrome - Windows',
        status: 'success',
      },
      {
        id: 2,
        activity: 'Mengajukan pinjaman Rp 5.000.000',
        timestamp: '2025-09-24T14:15:00Z',
        ip: '192.168.1.100',
        device: 'Chrome - Windows',
        status: 'success',
      },
      {
        id: 3,
        activity: 'Update profil pengguna',
        timestamp: '2025-09-23T16:45:00Z',
        ip: '192.168.1.100',
        device: 'Firefox - Windows',
        status: 'success',
      },
      {
        id: 4,
        activity: 'Gagal login - password salah',
        timestamp: '2025-09-22T08:20:00Z',
        ip: '192.168.1.101',
        device: 'Chrome - Android',
        status: 'failed',
      },
      {
        id: 5,
        activity: 'Setor simpanan sukarela Rp 500.000',
        timestamp: '2025-09-21T11:30:00Z',
        ip: '192.168.1.100',
        device: 'Chrome - Windows',
        status: 'success',
      },
    ]

    activityHistory.value = mockHistory
    totalPages.value = 1
  }, 'Gagal memuat riwayat aktivitas')

  isLoadingHistory.value = false
}

// Handle activity tab click
const handleActivityTabClick = () => {
  activeTab.value = 'activity'
  if (!activityHistory.value.length) {
    loadActivityHistory()
  }
}

// Save profile changes
const saveProfile = async () => {
  if (!hasProfileChanges.value) {
    showSuccess('Tidak ada perubahan untuk disimpan')
    return
  }

  const result = await handleAsync(async () => {
    // Mock API call - replace with actual API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }, 'Gagal menyimpan profil')

  if (result) {
    originalProfile.value = { ...profileForm.value }
    showSuccess('Profil berhasil diperbarui')
  }
}

// Change password
const changePassword = async () => {
  if (!securityForm.value.currentPassword) {
    errorMessage.value = 'Password saat ini harus diisi'
    return
  }

  if (!isPasswordValid.value) {
    errorMessage.value = 'Password baru harus minimal 8 karakter dan konfirmasi harus sama'
    return
  }

  const result = await handleAsync(async () => {
    // Mock API call - replace with actual API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }, 'Gagal mengubah password')

  if (result) {
    securityForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
    showSuccess('Password berhasil diubah')
  }
}

// Save notification settings
const saveNotificationSettings = async () => {
  const result = await handleAsync(async () => {
    // Mock API call - replace with actual API
    await new Promise((resolve) => setTimeout(resolve, 500))
    return true
  }, 'Gagal menyimpan pengaturan notifikasi')

  if (result) {
    showSuccess('Pengaturan notifikasi berhasil disimpan')
  }
}

// Format date time
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get status badge class
const getStatusBadgeClass = (status: string) => {
  return {
    badge: true,
    'bg-success': status === 'success',
    'bg-danger': status === 'failed',
    'bg-warning': status === 'pending',
  }
}
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="h3 mb-4">
          <i class="bi bi-person-circle me-2"></i>
          Profil & Pengaturan
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
                  :class="['nav-link', { active: activeTab === 'profile' }]"
                  @click="activeTab = 'profile'"
                  type="button"
                >
                  <i class="bi bi-person me-2"></i>Data Pribadi
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  :class="['nav-link', { active: activeTab === 'security' }]"
                  @click="activeTab = 'security'"
                  type="button"
                >
                  <i class="bi bi-shield-lock me-2"></i>Keamanan
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  :class="['nav-link', { active: activeTab === 'notifications' }]"
                  @click="activeTab = 'notifications'"
                  type="button"
                >
                  <i class="bi bi-bell me-2"></i>Notifikasi
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  :class="['nav-link', { active: activeTab === 'activity' }]"
                  @click="handleActivityTabClick"
                  type="button"
                >
                  <i class="bi bi-clock-history me-2"></i>Riwayat Aktivitas
                </button>
              </li>
            </ul>
          </div>

          <div class="card-body">
            <!-- Profile Tab -->
            <div v-show="activeTab === 'profile'" class="tab-pane">
              <form @submit.prevent="saveProfile">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="nama" class="form-label">Nama Lengkap *</label>
                      <input
                        type="text"
                        class="form-control"
                        id="nama"
                        v-model="profileForm.nama"
                        required
                      />
                    </div>

                    <div class="mb-3">
                      <label for="email" class="form-label">Email *</label>
                      <input
                        type="email"
                        class="form-control"
                        id="email"
                        v-model="profileForm.email"
                        required
                      />
                    </div>

                    <div class="mb-3">
                      <label for="nomorHp" class="form-label">Nomor HP *</label>
                      <input
                        type="tel"
                        class="form-control"
                        id="nomorHp"
                        v-model="profileForm.nomorHp"
                        required
                      />
                    </div>

                    <div class="mb-3">
                      <label for="tanggalLahir" class="form-label">Tanggal Lahir</label>
                      <input
                        type="date"
                        class="form-control"
                        id="tanggalLahir"
                        v-model="profileForm.tanggalLahir"
                      />
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="jenisKelamin" class="form-label">Jenis Kelamin</label>
                      <select
                        class="form-select"
                        id="jenisKelamin"
                        v-model="profileForm.jenisKelamin"
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div class="mb-3">
                      <label for="pekerjaan" class="form-label">Pekerjaan</label>
                      <input
                        type="text"
                        class="form-control"
                        id="pekerjaan"
                        v-model="profileForm.pekerjaan"
                      />
                    </div>

                    <div class="mb-3">
                      <label for="penghasilan" class="form-label">Penghasilan (Rp/bulan)</label>
                      <input
                        type="number"
                        class="form-control"
                        id="penghasilan"
                        v-model="profileForm.penghasilan"
                        min="0"
                      />
                    </div>

                    <div class="mb-3">
                      <label for="alamat" class="form-label">Alamat</label>
                      <textarea
                        class="form-control"
                        id="alamat"
                        rows="3"
                        v-model="profileForm.alamat"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="profileForm = { ...originalProfile }"
                    :disabled="!hasProfileChanges"
                  >
                    <i class="bi bi-arrow-counterclockwise me-2"></i>Reset
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="isLoading || !hasProfileChanges"
                  >
                    <span
                      v-if="isLoading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    <i v-else class="bi bi-check-lg me-2"></i>
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>

            <!-- Security Tab -->
            <div v-show="activeTab === 'security'" class="tab-pane">
              <div class="row">
                <div class="col-md-6">
                  <h5 class="mb-3"><i class="bi bi-key me-2"></i>Ubah Password</h5>

                  <form @submit.prevent="changePassword">
                    <div class="mb-3">
                      <label for="currentPassword" class="form-label">Password Saat Ini *</label>
                      <input
                        type="password"
                        class="form-control"
                        id="currentPassword"
                        v-model="securityForm.currentPassword"
                        required
                      />
                    </div>

                    <div class="mb-3">
                      <label for="newPassword" class="form-label">Password Baru *</label>
                      <input
                        type="password"
                        class="form-control"
                        id="newPassword"
                        v-model="securityForm.newPassword"
                        minlength="8"
                        required
                      />
                      <div class="form-text">Minimal 8 karakter</div>
                    </div>

                    <div class="mb-3">
                      <label for="confirmPassword" class="form-label"
                        >Konfirmasi Password Baru *</label
                      >
                      <input
                        type="password"
                        class="form-control"
                        id="confirmPassword"
                        v-model="securityForm.confirmPassword"
                        required
                        :class="{
                          'is-invalid':
                            securityForm.confirmPassword &&
                            securityForm.newPassword !== securityForm.confirmPassword,
                        }"
                      />
                      <div
                        v-if="
                          securityForm.confirmPassword &&
                          securityForm.newPassword !== securityForm.confirmPassword
                        "
                        class="invalid-feedback"
                      >
                        Password konfirmasi tidak sama
                      </div>
                    </div>

                    <button
                      type="submit"
                      class="btn btn-warning"
                      :disabled="isLoading || !isPasswordValid"
                    >
                      <span
                        v-if="isLoading"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      <i v-else class="bi bi-shield-check me-2"></i>
                      Ubah Password
                    </button>
                  </form>
                </div>

                <div class="col-md-6">
                  <h5 class="mb-3"><i class="bi bi-info-circle me-2"></i>Tips Keamanan</h5>

                  <div class="alert alert-info">
                    <ul class="mb-0">
                      <li>Gunakan password yang kuat (minimal 8 karakter)</li>
                      <li>Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                      <li>Jangan gunakan informasi pribadi yang mudah ditebak</li>
                      <li>Ganti password secara berkala</li>
                      <li>Jangan bagikan password ke orang lain</li>
                    </ul>
                  </div>

                  <div class="card">
                    <div class="card-body">
                      <h6 class="card-title">
                        <i class="bi bi-clock-history me-2"></i>Login Terakhir
                      </h6>
                      <p class="card-text">
                        <strong>Waktu:</strong> {{ formatDateTime('2025-09-25T09:30:00Z') }}<br />
                        <strong>Perangkat:</strong> Chrome - Windows<br />
                        <strong>IP:</strong> 192.168.1.100
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications Tab -->
            <div v-show="activeTab === 'notifications'" class="tab-pane">
              <form @submit.prevent="saveNotificationSettings">
                <div class="row">
                  <div class="col-md-6">
                    <h5 class="mb-3"><i class="bi bi-envelope me-2"></i>Metode Notifikasi</h5>

                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          v-model="notificationSettings.emailNotifications"
                        />
                        <label class="form-check-label" for="emailNotifications">
                          <i class="bi bi-envelope me-2"></i>Email
                        </label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="smsNotifications"
                          v-model="notificationSettings.smsNotifications"
                        />
                        <label class="form-check-label" for="smsNotifications">
                          <i class="bi bi-chat-text me-2"></i>SMS
                        </label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="whatsappNotifications"
                          v-model="notificationSettings.whatsappNotifications"
                        />
                        <label class="form-check-label" for="whatsappNotifications">
                          <i class="bi bi-whatsapp me-2"></i>WhatsApp
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <h5 class="mb-3"><i class="bi bi-bell me-2"></i>Jenis Pengingat</h5>

                    <div class="mb-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="simpananWajib"
                          v-model="notificationSettings.pengingat.simpananWajib"
                        />
                        <label class="form-check-label" for="simpananWajib">
                          Simpanan Wajib Bulanan
                        </label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="jatuhTempoPinjaman"
                          v-model="notificationSettings.pengingat.jatuhTempoPinjaman"
                        />
                        <label class="form-check-label" for="jatuhTempoPinjaman">
                          Jatuh Tempo Pinjaman
                        </label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="rapatAnggotaTahunan"
                          v-model="notificationSettings.pengingat.rapatAnggotaTahunan"
                        />
                        <label class="form-check-label" for="rapatAnggotaTahunan">
                          Rapat Anggota Tahunan
                        </label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="pengumuman"
                          v-model="notificationSettings.pengingat.pengumuman"
                        />
                        <label class="form-check-label" for="pengumuman"> Pengumuman Umum </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row mt-4">
                  <div class="col-12">
                    <h5 class="mb-3"><i class="bi bi-calendar me-2"></i>Frekuensi Pengingat</h5>

                    <div class="row">
                      <div class="col-md-4">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            id="harian"
                            v-model="notificationSettings.frekuensi.harian"
                          />
                          <label class="form-check-label" for="harian"> Harian </label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            id="mingguan"
                            v-model="notificationSettings.frekuensi.mingguan"
                          />
                          <label class="form-check-label" for="mingguan"> Mingguan </label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            id="bulanan"
                            v-model="notificationSettings.frekuensi.bulanan"
                          />
                          <label class="form-check-label" for="bulanan"> Bulanan </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end mt-4">
                  <button type="submit" class="btn btn-primary" :disabled="isLoading">
                    <span
                      v-if="isLoading"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    <i v-else class="bi bi-check-lg me-2"></i>
                    Simpan Pengaturan
                  </button>
                </div>
              </form>
            </div>

            <!-- Activity History Tab -->
            <div v-show="activeTab === 'activity'" class="tab-pane">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Riwayat Aktivitas</h5>
                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="loadActivityHistory"
                  :disabled="isLoadingHistory"
                >
                  <span
                    v-if="isLoadingHistory"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  <i v-else class="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
              </div>

              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Aktivitas</th>
                      <th>Perangkat</th>
                      <th>IP Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="isLoadingHistory">
                      <td colspan="5" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Memuat riwayat aktivitas...
                      </td>
                    </tr>
                    <tr v-else-if="activityHistory.length === 0">
                      <td colspan="5" class="text-center py-4 text-muted">
                        Tidak ada riwayat aktivitas
                      </td>
                    </tr>
                    <tr v-else v-for="activity in activityHistory" :key="activity.id">
                      <td>{{ formatDateTime(activity.timestamp) }}</td>
                      <td>{{ activity.activity }}</td>
                      <td>
                        <small class="text-muted">{{ activity.device }}</small>
                      </td>
                      <td>
                        <code class="small">{{ activity.ip }}</code>
                      </td>
                      <td>
                        <span :class="getStatusBadgeClass(activity.status)">
                          {{ activity.status === 'success' ? 'Berhasil' : 'Gagal' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination placeholder -->
              <nav v-if="totalPages > 1" aria-label="Activity pagination">
                <ul class="pagination justify-content-center">
                  <li class="page-item">
                    <a class="page-link" href="#" aria-label="Previous">
                      <span aria-hidden="true">&laquo;</span>
                    </a>
                  </li>
                  <li class="page-item active">
                    <a class="page-link" href="#">1</a>
                  </li>
                  <li class="page-item">
                    <a class="page-link" href="#" aria-label="Next">
                      <span aria-hidden="true">&raquo;</span>
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

.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75em;
}

code {
  font-size: 0.8em;
}

.alert ul {
  padding-left: 1.2em;
}

.card .card-title {
  color: #495057;
  font-weight: 600;
}
</style>

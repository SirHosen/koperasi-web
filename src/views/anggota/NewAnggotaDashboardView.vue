<template>
  <div class="modern-dashboard">
    <!-- Header Section with Gradient -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <div class="avatar-container">
            <div class="avatar">
              <i class="bi bi-person-circle"></i>
            </div>
            <div class="status-indicator"></div>
          </div>
          <div class="welcome-text">
            <h1 class="fade-in">Selamat Datang, {{ user.nama }}</h1>
            <p class="member-info">
              <span class="member-id">{{ user.noAnggota }}</span>
              <span class="separator">•</span>
              <span class="join-date">Bergabung {{ formatDate(user.tanggalBergabung) }}</span>
            </p>
          </div>
        </div>

        <div class="header-actions">
          <div class="quick-stats">
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(simpanan.total) }}</div>
              <div class="stat-label">Total Simpanan</div>
            </div>
          </div>
          <button class="notification-btn" @click="toggleNotifications">
            <i class="bi bi-bell"></i>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Summary Cards -->
      <div class="cards-section">
        <div class="section-header">
          <h2>Ringkasan Keuangan</h2>
          <p class="section-subtitle">Overview aktivitas keuangan Anda</p>
        </div>

        <div class="cards-grid">
          <!-- Simpanan Card -->
          <div class="modern-card savings-card" @click="navigateTo('simpanan')">
            <div class="card-header">
              <div class="card-icon savings">
                <i class="bi bi-piggy-bank"></i>
              </div>
              <div class="card-menu">
                <i class="bi bi-three-dots"></i>
              </div>
            </div>

            <div class="card-content">
              <div class="card-title">Simpanan</div>
              <div class="card-amount">{{ formatCurrency(simpanan.total) }}</div>

              <div class="card-breakdown">
                <div class="breakdown-item">
                  <span class="breakdown-label">Pokok</span>
                  <span class="breakdown-value">{{ formatCurrency(simpanan.pokok) }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Wajib</span>
                  <span class="breakdown-value">{{ formatCurrency(simpanan.wajib) }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Sukarela</span>
                  <span class="breakdown-value">{{ formatCurrency(simpanan.sukarela) }}</span>
                </div>
              </div>

              <div class="card-trend">
                <i class="bi bi-arrow-up trend-up"></i>
                <span>+2.5% dari bulan lalu</span>
              </div>
            </div>

            <div class="card-footer">
              <span class="view-detail">Lihat Detail</span>
              <i class="bi bi-arrow-right"></i>
            </div>
          </div>

          <!-- Pinjaman Card -->
          <div class="modern-card loan-card" @click="navigateTo('pinjaman/status')">
            <div class="card-header">
              <div class="card-icon loan">
                <i class="bi bi-cash-stack"></i>
              </div>
              <div class="card-menu">
                <i class="bi bi-three-dots"></i>
              </div>
            </div>

            <div class="card-content">
              <div class="card-title">Pinjaman Aktif</div>
              <div class="card-amount" v-if="pinjaman.active">
                {{ formatCurrency(pinjaman.active.sisaPokok) }}
              </div>
              <div class="card-amount empty" v-else>Tidak Ada Pinjaman</div>

              <div class="card-breakdown" v-if="pinjaman.active">
                <div class="breakdown-item">
                  <span class="breakdown-label">Angsuran/Bulan</span>
                  <span class="breakdown-value">{{
                    formatCurrency(pinjaman.active.angsuranPerBulan)
                  }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Tenor Sisa</span>
                  <span class="breakdown-value">{{ pinjaman.active.tenorSisa }} bulan</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Jatuh Tempo</span>
                  <span class="breakdown-value">{{ formatDate(pinjaman.active.jatuhTempo) }}</span>
                </div>
              </div>

              <div class="card-status" v-if="pinjaman.active">
                <span class="status-badge" :class="pinjaman.active.status">
                  {{ pinjaman.active.status === 'lancar' ? 'Lancar' : 'Tunggakan' }}
                </span>
              </div>
            </div>

            <div class="card-footer">
              <span class="view-detail">{{
                pinjaman.active ? 'Kelola Pinjaman' : 'Ajukan Pinjaman'
              }}</span>
              <i class="bi bi-arrow-right"></i>
            </div>
          </div>

          <!-- SHU Card -->
          <div class="modern-card shu-card" @click="navigateTo('shu')">
            <div class="card-header">
              <div class="card-icon shu">
                <i class="bi bi-trophy"></i>
              </div>
              <div class="card-menu">
                <i class="bi bi-three-dots"></i>
              </div>
            </div>

            <div class="card-content">
              <div class="card-title">SHU {{ shu.tahunTerakhir }}</div>
              <div class="card-amount">{{ formatCurrency(shu.nominal) }}</div>

              <div class="card-breakdown">
                <div class="breakdown-item">
                  <span class="breakdown-label">Status</span>
                  <span class="breakdown-value">
                    <span class="status-badge" :class="shu.status">
                      {{ shu.status === 'sudah' ? 'Telah Dibagikan' : 'Belum Dibagikan' }}
                    </span>
                  </span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Tanggal Bagi</span>
                  <span class="breakdown-value">{{ formatDate(shu.tanggalPembagian) }}</span>
                </div>
              </div>

              <div class="card-trend">
                <i class="bi bi-graph-up trend-up"></i>
                <span>{{ getYearlyGrowth() }} vs tahun lalu</span>
              </div>
            </div>

            <div class="card-footer">
              <span class="view-detail">Lihat Riwayat SHU</span>
              <i class="bi bi-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2>Aksi Cepat</h2>
          <p class="section-subtitle">Lakukan transaksi dengan mudah</p>
        </div>

        <div class="quick-actions-grid">
          <button class="quick-action-btn" @click="navigateTo('simpanan')">
            <div class="action-icon">
              <i class="bi bi-plus-circle"></i>
            </div>
            <div class="action-content">
              <div class="action-title">Setor Simpanan</div>
              <div class="action-subtitle">Tambah simpanan sukarela</div>
            </div>
          </button>

          <button class="quick-action-btn" @click="navigateTo('pinjaman/ajukan')">
            <div class="action-icon">
              <i class="bi bi-file-earmark-plus"></i>
            </div>
            <div class="action-content">
              <div class="action-title">Ajukan Pinjaman</div>
              <div class="action-subtitle">Buat pengajuan baru</div>
            </div>
          </button>

          <button class="quick-action-btn" @click="navigateTo('pinjaman/bayar')">
            <div class="action-icon">
              <i class="bi bi-credit-card"></i>
            </div>
            <div class="action-content">
              <div class="action-title">Bayar Angsuran</div>
              <div class="action-subtitle">Pembayaran cicilan</div>
            </div>
          </button>

          <button class="quick-action-btn" @click="navigateTo('profil')">
            <div class="action-icon">
              <i class="bi bi-person-gear"></i>
            </div>
            <div class="action-content">
              <div class="action-title">Update Profil</div>
              <div class="action-subtitle">Kelola akun Anda</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <div class="section-header">
          <h2>Aktivitas Terbaru</h2>
          <button class="view-all-btn" @click="navigateTo('simpanan')">Lihat Semua</button>
        </div>

        <div class="activity-list">
          <div
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="activity-item"
          >
            <div class="activity-icon" :class="transaction.type">
              <i :class="getTransactionIcon(transaction.type)"></i>
            </div>

            <div class="activity-content">
              <div class="activity-title">{{ transaction.description }}</div>
              <div class="activity-meta">
                <span class="activity-date">{{ formatDateTime(transaction.date) }}</span>
                <span class="activity-status" :class="transaction.status">
                  {{ getStatusText(transaction.status) }}
                </span>
              </div>
            </div>

            <div class="activity-amount" :class="transaction.type">
              {{ transaction.type === 'credit' ? '+' : '-'
              }}{{ formatCurrency(transaction.amount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Panel -->
      <div class="notifications-section" v-if="showNotifications">
        <div class="section-header">
          <h2>Notifikasi</h2>
          <button class="mark-read-btn" @click="markAllAsRead">Tandai Dibaca</button>
        </div>

        <div class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
          >
            <div class="notification-icon" :class="notification.type">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>

            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatDateTime(notification.date) }}</div>
            </div>

            <button class="notification-action" @click="markAsRead(notification.id)">
              <i class="bi bi-check"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Types
interface UserProfile {
  id: string
  nama: string
  email: string
  noAnggota: string
  tanggalBergabung: string
  status: 'aktif' | 'nonaktif'
}

interface SimpananSummary {
  pokok: number
  wajib: number
  sukarela: number
  total: number
}

interface PinjamanSummary {
  active: {
    jumlah: number
    sisaPokok: number
    sisaBunga: number
    angsuranPerBulan: number
    tenorSisa: number
    jatuhTempo: string
    status: 'lancar' | 'tunggakan'
  } | null
}

interface ShuSummary {
  tahunTerakhir: number
  nominal: number
  tanggalPembagian: string
  status: 'belum' | 'sudah'
  riwayat: { tahun: number; nominal: number }[]
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  date: string
  read: boolean
}

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'credit' | 'debit'
  status: 'completed' | 'pending' | 'failed'
  date: string
}

// Router
const router = useRouter()

// Reactive Data
const showNotifications = ref(false)

// Mock Data
const user = ref<UserProfile>({
  id: 'user-1',
  nama: 'Budi Santoso',
  email: 'budi@gmail.com',
  noAnggota: 'A-20230056',
  tanggalBergabung: '2023-01-15',
  status: 'aktif',
})

const simpanan = ref<SimpananSummary>({
  pokok: 100000,
  wajib: 360000,
  sukarela: 2540000,
  total: 3000000,
})

const pinjaman = ref<PinjamanSummary>({
  active: {
    jumlah: 5000000,
    sisaPokok: 3200000,
    sisaBunga: 480000,
    angsuranPerBulan: 520833,
    tenorSisa: 8,
    jatuhTempo: '2025-10-15',
    status: 'lancar',
  },
})

const shu = ref<ShuSummary>({
  tahunTerakhir: 2024,
  nominal: 2520000,
  tanggalPembagian: '2025-04-05',
  status: 'sudah',
  riwayat: [
    { tahun: 2024, nominal: 2520000 },
    { tahun: 2023, nominal: 1750000 },
    { tahun: 2022, nominal: 1250000 },
  ],
})

const notifications = ref<Notification[]>([
  {
    id: 'n1',
    title: 'Pembayaran Berhasil',
    message: 'Pembayaran simpanan wajib bulan September telah berhasil diproses.',
    type: 'success',
    date: '2025-09-21T14:30:00Z',
    read: false,
  },
  {
    id: 'n2',
    title: 'Rapat Anggota Tahunan',
    message: 'Rapat Anggota Tahunan akan dilaksanakan pada tanggal 15 Oktober 2025.',
    type: 'info',
    date: '2025-09-18T09:15:00Z',
    read: false,
  },
  {
    id: 'n3',
    title: 'Pengingat Angsuran',
    message: 'Angsuran pinjaman Anda akan jatuh tempo dalam 7 hari.',
    type: 'warning',
    date: '2025-09-08T10:45:00Z',
    read: true,
  },
])

const recentTransactions = ref<Transaction[]>([
  {
    id: 'tx1',
    description: 'Setor Simpanan Sukarela',
    amount: 500000,
    type: 'credit',
    status: 'completed',
    date: '2025-09-23T10:30:00Z',
  },
  {
    id: 'tx2',
    description: 'Bayar Angsuran Pinjaman',
    amount: 520833,
    type: 'debit',
    status: 'completed',
    date: '2025-09-15T14:15:00Z',
  },
  {
    id: 'tx3',
    description: 'Pembagian SHU 2024',
    amount: 2520000,
    type: 'credit',
    status: 'completed',
    date: '2025-04-05T09:00:00Z',
  },
])

// Computed
const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

// Methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const navigateTo = (route: string) => {
  router.push(`/anggota/${route}`)
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const markAsRead = (notificationId: string) => {
  const notification = notifications.value.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach((n) => (n.read = true))
}

const getTransactionIcon = (type: string): string => {
  return type === 'credit' ? 'bi bi-arrow-down-circle' : 'bi bi-arrow-up-circle'
}

const getNotificationIcon = (type: string): string => {
  const icons = {
    success: 'bi bi-check-circle',
    info: 'bi bi-info-circle',
    warning: 'bi bi-exclamation-triangle',
    error: 'bi bi-x-circle',
  }
  return icons[type as keyof typeof icons] || 'bi bi-bell'
}

const getStatusText = (status: string): string => {
  const statusTexts = {
    completed: 'Berhasil',
    pending: 'Menunggu',
    failed: 'Gagal',
  }
  return statusTexts[status as keyof typeof statusTexts] || status
}

const getYearlyGrowth = (): string => {
  if (shu.value.riwayat.length > 1) {
    const currentYear = shu.value.riwayat[0].nominal
    const previousYear = shu.value.riwayat[1].nominal
    const growth = ((currentYear / previousYear) * 100 - 100).toFixed(1)
    return `+${growth}%`
  }
  return '+0%'
}

// Lifecycle
onMounted(() => {
  // Initialize animations
  setTimeout(() => {
    const cards = document.querySelectorAll('.modern-card')
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-in')
      }, index * 100)
    })
  }, 100)
})
</script>

<style scoped>
/* Modern Dashboard Styles */
.modern-dashboard {
  min-height: 100vh;
  background: linear-gradient(120deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

/* Header Section */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 0 0 2rem 2rem;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.welcome-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 4rem;
  height: 4rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 1rem;
  height: 1rem;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
}

.welcome-text h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(45deg, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  opacity: 0.9;
}

.member-id {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.separator {
  opacity: 0.6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.quick-stats {
  text-align: right;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.notification-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.25rem;
  text-align: center;
}

/* Dashboard Grid */
.dashboard-grid {
  padding: 0 2rem 2rem;
  display: grid;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.section-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.modern-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  position: relative;
  overflow: hidden;
}

.modern-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.modern-card:hover::before {
  transform: scaleX(1);
}

.modern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
}

.modern-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.card-icon.savings {
  background: linear-gradient(135deg, #10b981, #059669);
}

.card-icon.loan {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.card-icon.shu {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.card-menu {
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.card-menu:hover {
  background: #f3f4f6;
  color: #374151;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.card-amount.empty {
  font-size: 1.25rem;
  color: #9ca3af;
  font-weight: 500;
}

.card-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breakdown-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.breakdown-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #059669;
  margin-bottom: 1rem;
}

.trend-up {
  color: #059669;
}

.card-status {
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.lancar,
.status-badge.sudah {
  background: #dcfce7;
  color: #166534;
}

.status-badge.tunggakan,
.status-badge.belum {
  background: #fef3c7;
  color: #92400e;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  color: #6366f1;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.quick-action-btn {
  background: white;
  border: 2px solid #f1f5f9;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.quick-action-btn:hover {
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
}

.action-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.action-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.action-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

/* Activity Section */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.activity-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-icon.credit {
  background: linear-gradient(135deg, #10b981, #059669);
}

.activity-icon.debit {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.activity-date {
  color: #64748b;
}

.activity-status.completed {
  color: #059669;
  font-weight: 500;
}

.activity-amount {
  font-weight: 700;
  font-size: 1.125rem;
}

.activity-amount.credit {
  color: #059669;
}

.activity-amount.debit {
  color: #ef4444;
}

/* Notifications */
.notifications-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.notification-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.notification-icon.success {
  background: #10b981;
}
.notification-icon.info {
  background: #3b82f6;
}
.notification-icon.warning {
  background: #f59e0b;
}
.notification-icon.error {
  background: #ef4444;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.notification-message {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.notification-time {
  color: #9ca3af;
  font-size: 0.75rem;
}

.notification-action {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.notification-action:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Utility Buttons */
.view-all-btn,
.mark-read-btn {
  background: none;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-all-btn:hover,
.mark-read-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 1.5rem;
    border-radius: 0 0 1.5rem 1.5rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .welcome-section {
    flex-direction: column;
    text-align: center;
  }

  .welcome-text h1 {
    font-size: 1.5rem;
  }

  .dashboard-grid {
    padding: 0 1rem 2rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .activity-amount {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 1rem;
  }

  .welcome-text h1 {
    font-size: 1.25rem;
  }

  .card-amount {
    font-size: 1.5rem;
  }

  .modern-card {
    padding: 1rem;
  }
}
</style>

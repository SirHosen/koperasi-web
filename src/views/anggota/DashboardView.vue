<script setup lang="ts">
import { ref } from 'vue'
import type { SimpananSummary, Notification } from '../../types'

// Mock data for dashboard
const simpanan = ref<SimpananSummary>({
  pokok: 100000,
  wajib: 250000,
  sukarela: 1500000,
  total: 1850000,
})

const pinjamanAktif = ref({
  count: 1,
  totalOutstanding: 3500000,
  nextPayment: {
    date: '2025-10-15',
    amount: 350000,
  },
})

const notifications = ref<Notification[]>([
  {
    id: '1',
    user_id: 'user123',
    title: 'Pembayaran Simpanan Wajib',
    message: 'Jangan lupa membayar simpanan wajib bulan Oktober',
    is_read: false,
    type: 'info',
    created_at: '2025-09-20T10:00:00Z',
    updated_at: '2025-09-20T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user123',
    title: 'Rapat Anggota Tahunan',
    message: 'RAT akan dilaksanakan pada tanggal 15 November 2025',
    is_read: true,
    type: 'info',
    created_at: '2025-09-18T14:30:00Z',
    updated_at: '2025-09-18T14:30:00Z',
  },
  {
    id: '3',
    user_id: 'user123',
    title: 'Angsuran Pinjaman',
    message: 'Angsuran pinjaman Anda akan jatuh tempo dalam 5 hari',
    is_read: false,
    type: 'warning',
    created_at: '2025-09-22T09:15:00Z',
    updated_at: '2025-09-22T09:15:00Z',
  },
])

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'info': return 'bi bi-info-circle'
    case 'warning': return 'bi bi-exclamation-triangle'
    case 'success': return 'bi bi-check-circle'
    case 'error': return 'bi bi-x-circle'
    default: return 'bi bi-info-circle'
  }
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>Selamat Datang, Anggota!</h1>
      <p class="header-subtitle">Kelola simpanan dan pinjaman Anda dengan mudah</p>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">
          <i class="bi bi-piggy-bank"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(simpanan.total) }}</div>
          <div class="stat-label">Total Simpanan</div>
        </div>
      </div>

      <div class="stat-card secondary">
        <div class="stat-icon">
          <i class="bi bi-cash-stack"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ pinjamanAktif.count }}</div>
          <div class="stat-label">Pinjaman Aktif</div>
        </div>
      </div>

      <div class="stat-card tertiary">
        <div class="stat-icon">
          <i class="bi bi-bell"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ notifications.filter(n => !n.is_read).length }}</div>
          <div class="stat-label">Notifikasi Baru</div>
        </div>
      </div>
    </div>

    <!-- Main Actions -->
    <div class="main-actions">
      <h2>Aksi Cepat</h2>
      <div class="actions-grid">
        <router-link to="/anggota/simpanan/setor" class="action-card">
          <div class="action-icon">
            <i class="bi bi-plus-circle"></i>
          </div>
          <div class="action-title">Setor Simpanan</div>
          <div class="action-desc">Tambah saldo simpanan Anda</div>
        </router-link>

        <router-link to="/anggota/simpanan/tarik" class="action-card">
          <div class="action-icon">
            <i class="bi bi-dash-circle"></i>
          </div>
          <div class="action-title">Tarik Simpanan</div>
          <div class="action-desc">Ambil saldo simpanan</div>
        </router-link>

        <router-link to="/anggota/pinjaman/ajukan" class="action-card">
          <div class="action-icon">
            <i class="bi bi-file-earmark-plus"></i>
          </div>
          <div class="action-title">Ajukan Pinjaman</div>
          <div class="action-desc">Pengajuan pinjaman baru</div>
        </router-link>

        <router-link to="/anggota/pinjaman/bayar" class="action-card">
          <div class="action-icon">
            <i class="bi bi-credit-card"></i>
          </div>
          <div class="action-title">Bayar Angsuran</div>
          <div class="action-desc">Pembayaran angsuran pinjaman</div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <div class="activity-header">
        <h2>Aktivitas Terbaru</h2>
        <router-link to="/anggota/notifications" class="view-all-link">Lihat Semua</router-link>
      </div>

      <div class="activity-list">
        <div v-for="notification in notifications.slice(0, 5)" :key="notification.id" class="activity-item" :class="{ unread: !notification.is_read }">
          <div class="activity-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ notification.title }}</div>
            <div class="activity-message">{{ notification.message }}</div>
            <div class="activity-time">{{ formatDate(notification.created_at) }}</div>
          </div>
          <button v-if="!notification.is_read" @click="markAsRead(notification.id)" class="mark-read-btn">
            Tandai Dibaca
          </button>
        </div>

        <div v-if="notifications.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>Tidak ada aktivitas terbaru</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.info-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
}

.info-item {
  display: flex;
  margin-bottom: 0.75rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  width: 180px;
  color: #4b5563;
}

.value {
  color: #111827;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status.active {
  background-color: #d1fae5;
  color: #065f46;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.dashboard-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.card-details {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.detail-item span:first-child {
  color: #6b7280;
}

.detail-item span:last-child {
  font-weight: 500;
}

.card-action {
  text-align: right;
}

.action-link {
  color: #10b981;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-link:hover {
  text-decoration: underline;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
}

.action-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-item {
  display: flex;
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid transparent;
}

.notification-item.unread {
  background-color: #f9fafb;
}

.notification-item.info {
  border-left-color: #3b82f6;
}

.notification-item.warning {
  border-left-color: #f59e0b;
}

.notification-item.success {
  border-left-color: #10b981;
}

.notification-item.error {
  border-left-color: #ef4444;
}

.notification-icon {
  margin-right: 1rem;
  display: flex;
  align-items: flex-start;
  font-size: 1.25rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.notification-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.mark-read-button {
  align-self: flex-start;
  background: none;
  border: none;
  color: #10b981;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.mark-read-button:hover {
  text-decoration: underline;
}

.empty-notification {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

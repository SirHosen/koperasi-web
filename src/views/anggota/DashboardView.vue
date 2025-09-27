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
  padding: 2rem;
}

/* Header */
.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
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
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.header-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-card.primary::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.stat-card.secondary::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.stat-card.tertiary::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #10b98120, #05966920);
  color: #10b981;
}

.stat-card.secondary .stat-icon {
  background: linear-gradient(135deg, #f59e0b20, #d9770620);
  color: #f59e0b;
}

.stat-card.tertiary .stat-icon {
  background: linear-gradient(135deg, #ef444420, #dc262620);
  color: #ef4444;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Main Actions */
.main-actions {
  margin-bottom: 3rem;
}

.main-actions h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.action-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea20, #764ba220);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.action-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.action-desc {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Recent Activity */
.recent-activity {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.activity-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.activity-list {
  padding: 0;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
  position: relative;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item.unread {
  background: #f8fafc;
}

.activity-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #667eea;
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.activity-item.unread .activity-icon {
  background: #667eea20;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.activity-message {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.activity-time {
  color: #9ca3af;
  font-size: 0.75rem;
}

.mark-read-btn {
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.mark-read-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .action-card {
    padding: 1.5rem;
  }

  .activity-header {
    padding: 1rem 1.5rem;
  }

  .activity-item {
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 0.5rem;
  }

  .dashboard-header {
    padding: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.75rem;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

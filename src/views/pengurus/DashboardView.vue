<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { KpiSummary, AntreanStats } from '../../types'

// Mock KPI data
const kpiData = ref<KpiSummary>({
  totalAnggota: 250,
  anggotaAktif: 235,
  totalAset: 1250000000,
  totalPinjaman: 950000000,
  totalSimpanan: 1050000000,
  nplRatio: 1.2,
})

// Mock antrean data
const antreanData = ref<AntreanStats>({
  totalAntrean: 7,
  averageWaitingTime: 45, // in minutes
  longestWaitingTime: 120, // in minutes
  processedToday: 4,
})

// Mock alert data
const alerts = ref([
  {
    id: 'alert-1',
    type: 'warning',
    title: 'Pinjaman Jatuh Tempo',
    message: '3 anggota memiliki pinjaman yang akan jatuh tempo dalam 3 hari',
    time: '2 jam yang lalu',
  },
  {
    id: 'alert-2',
    type: 'danger',
    title: 'Rasio NPL Meningkat',
    message: 'Rasio NPL naik 0.3% dalam 7 hari terakhir',
    time: '1 hari yang lalu',
  },
  {
    id: 'alert-3',
    type: 'info',
    title: 'Antrean Menumpuk',
    message: '7 pengajuan pinjaman dalam antrean menunggu verifikasi',
    time: '3 jam yang lalu',
  },
])

// Simulated monthly metrics
const monthlyData = ref({
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  simpanan: [102, 110, 125, 130, 142, 155, 162, 170, 185],
  pinjaman: [85, 90, 100, 110, 115, 130, 145, 160, 170],
})

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

// Format time duration
const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} menit`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours} jam ${remainingMinutes} menit`
}

// Simulation of an admin activity
onMounted(() => {
  // This would typically fetch data from an API
  console.log('Admin dashboard mounted')
})
</script>

<template>
  <div class="admin-dashboard-container">
    <h1>Dashboard Pengurus</h1>

    <!-- KPI Cards -->
    <section class="kpi-section">
      <div class="kpi-cards">
        <div class="kpi-card">
          <div class="card-icon member-icon">👥</div>
          <div class="card-content">
            <div class="card-title">Total Anggota</div>
            <div class="card-value">{{ kpiData.totalAnggota }}</div>
            <div class="card-subtitle">{{ kpiData.anggotaAktif }} Anggota Aktif</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="card-icon assets-icon">💰</div>
          <div class="card-content">
            <div class="card-title">Total Aset</div>
            <div class="card-value">{{ formatCurrency(kpiData.totalAset) }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="card-icon savings-icon">🏦</div>
          <div class="card-content">
            <div class="card-title">Total Simpanan</div>
            <div class="card-value">{{ formatCurrency(kpiData.totalSimpanan) }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="card-icon loan-icon">📝</div>
          <div class="card-content">
            <div class="card-title">Total Pinjaman</div>
            <div class="card-value">{{ formatCurrency(kpiData.totalPinjaman) }}</div>
          </div>
        </div>

        <div class="kpi-card" :class="{ warning: kpiData.nplRatio > 1 }">
          <div class="card-icon npl-icon">⚠️</div>
          <div class="card-content">
            <div class="card-title">NPL Ratio</div>
            <div class="card-value">{{ kpiData.nplRatio }}%</div>
            <div class="card-subtitle">Max: 5%</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FCFS Antrean Stats -->
    <section class="antrean-section">
      <h2>Status Antrean FCFS</h2>
      <div class="antrean-cards">
        <div class="antrean-card">
          <div class="antrean-value">{{ antreanData.totalAntrean }}</div>
          <div class="antrean-label">Total Dalam Antrean</div>
        </div>

        <div class="antrean-card">
          <div class="antrean-value">{{ formatDuration(antreanData.averageWaitingTime) }}</div>
          <div class="antrean-label">Waktu Tunggu Rata-rata</div>
        </div>

        <div class="antrean-card">
          <div class="antrean-value">{{ formatDuration(antreanData.longestWaitingTime) }}</div>
          <div class="antrean-label">Waktu Tunggu Terlama</div>
        </div>

        <div class="antrean-card">
          <div class="antrean-value">{{ antreanData.processedToday }}</div>
          <div class="antrean-label">Diproses Hari Ini</div>
        </div>
      </div>

      <div class="action-buttons">
        <router-link to="/pengurus/antrean" class="action-button">
          Kelola Antrean FCFS
        </router-link>
      </div>
    </section>

    <!-- Dashboard Main Content -->
    <div class="dashboard-main">
      <div class="dashboard-column">
        <!-- Alert System -->
        <section class="alerts-section">
          <h2>Alert System</h2>
          <div class="alert-list">
            <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.type">
              <div class="alert-header">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-time">{{ alert.time }}</div>
              </div>
              <div class="alert-message">{{ alert.message }}</div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="quick-actions-section">
          <h2>Aksi Cepat</h2>
          <div class="actions-grid">
            <router-link to="/pengurus/antrean/proses" class="quick-action">
              <span class="action-icon">⏱️</span>
              <span class="action-label">Proses Antrean</span>
            </router-link>
            <router-link to="/pengurus/anggota/baru" class="quick-action">
              <span class="action-icon">👤</span>
              <span class="action-label">Anggota Baru</span>
            </router-link>
            <router-link to="/pengurus/pinjaman/verifikasi" class="quick-action">
              <span class="action-icon">✅</span>
              <span class="action-label">Verifikasi Pinjaman</span>
            </router-link>
            <router-link to="/pengurus/verifikasi/dashboard" class="quick-action">
              <span class="action-icon">📈</span>
              <span class="action-label">Dashboard Verifikasi</span>
            </router-link>
            <router-link to="/pengurus/laporan/harian" class="quick-action">
              <span class="action-icon">📊</span>
              <span class="action-label">Laporan Harian</span>
            </router-link>
          </div>
        </section>
      </div>

      <div class="dashboard-column">
        <!-- Chart Section (Placeholder) -->
        <section class="chart-section">
          <h2>Pertumbuhan Bulanan</h2>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div
                  v-for="(value, index) in monthlyData.simpanan"
                  :key="`simpanan-${index}`"
                  class="chart-bar simpanan"
                  :style="{ height: `${value}px` }"
                ></div>
              </div>
              <div class="chart-bars">
                <div
                  v-for="(value, index) in monthlyData.pinjaman"
                  :key="`pinjaman-${index}`"
                  class="chart-bar pinjaman"
                  :style="{ height: `${value}px` }"
                ></div>
              </div>
              <div class="chart-labels">
                <div
                  v-for="(month, index) in monthlyData.months"
                  :key="`month-${index}`"
                  class="chart-label"
                >
                  {{ month }}
                </div>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color simpanan"></div>
                <div class="legend-label">Simpanan (dalam juta)</div>
              </div>
              <div class="legend-item">
                <div class="legend-color pinjaman"></div>
                <div class="legend-label">Pinjaman (dalam juta)</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

section {
  margin-bottom: 2rem;
}

/* KPI Cards */
.kpi-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.kpi-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kpi-card.warning {
  background-color: #fff7ed;
  border-left: 4px solid #f59e0b;
}

.card-icon {
  font-size: 1.75rem;
  margin-right: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
}

.member-icon {
  background-color: #eff6ff;
}
.assets-icon {
  background-color: #ecfdf5;
}
.savings-icon {
  background-color: #eef2ff;
}
.loan-icon {
  background-color: #fef2f2;
}
.npl-icon {
  background-color: #fff7ed;
}

.card-content {
  flex: 1;
}

.card-title {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.card-value {
  color: #111827;
  font-weight: 700;
  font-size: 1.25rem;
}

.card-subtitle {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Antrean Stats */
.antrean-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.antrean-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.antrean-value {
  font-weight: 700;
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 0.5rem;
}

.antrean-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.action-button {
  padding: 0.75rem 1.25rem;
  background-color: #10b981;
  color: white;
  font-weight: 500;
  border-radius: 0.375rem;
  text-decoration: none;
}

/* Dashboard Main Content */
.dashboard-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Alerts */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid transparent;
}

.alert-item.info {
  border-left-color: #3b82f6;
}

.alert-item.warning {
  border-left-color: #f59e0b;
}

.alert-item.danger {
  border-left-color: #ef4444;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.alert-title {
  font-weight: 600;
}

.alert-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.alert-message {
  font-size: 0.875rem;
  color: #4b5563;
}

/* Quick Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.quick-action {
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

.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
}

.action-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

/* Chart Section */
.chart-section {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container {
  margin-top: 1rem;
}

.chart-placeholder {
  position: relative;
  height: 280px;
  padding-bottom: 2rem;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.chart-bar {
  width: 20px;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s;
}

.chart-bar.simpanan {
  background-color: #10b981;
  opacity: 0.8;
}

.chart-bar.pinjaman {
  background-color: #3b82f6;
  opacity: 0.8;
  transform: translateX(15px);
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.chart-label {
  font-size: 0.75rem;
  color: #6b7280;
  width: 30px;
  text-align: center;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.simpanan {
  background-color: #10b981;
}

.legend-color.pinjaman {
  background-color: #3b82f6;
}

.legend-label {
  font-size: 0.75rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }
}
</style>

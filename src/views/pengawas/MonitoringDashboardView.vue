<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-eye me-2"></i>
              Monitoring Dashboard Pengawas
            </h2>
            <p class="text-muted mb-0">Real-time monitoring dan oversight koperasi</p>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-primary btn-sm"
              @click="refreshAllData"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
            <button class="btn btn-outline-success btn-sm" @click="exportDashboard">
              <i class="fas fa-download"></i>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert System -->
    <div v-if="alerts.length > 0" class="row mb-4">
      <div class="col-12">
        <div class="alert alert-warning alert-dismissible fade show">
          <h6 class="alert-heading">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Sistem Alert ({{ alerts.length }})
          </h6>
          <div class="row">
            <div v-for="alert in alerts" :key="alert.id" class="col-md-6 mb-2">
              <div class="d-flex align-items-center">
                <span class="badge me-2" :class="getAlertBadgeClass(alert.severity)">
                  {{ alert.severity.toUpperCase() }}
                </span>
                <small>{{ alert.message }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time KPI Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-primary bg-opacity-10 rounded-circle p-3">
                  <i class="fas fa-heartbeat fa-2x text-primary"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h6 class="text-muted mb-0">Kesehatan Koperasi</h6>
                <h3 class="mb-0" :class="getHealthScoreClass(kpiData.healthScore)">
                  {{ kpiData.healthScore }}/100
                </h3>
                <small class="text-muted">
                  <i class="fas" :class="getHealthTrendIcon(kpiData.healthTrend)"></i>
                  {{ kpiData.healthTrend > 0 ? '+' : '' }}{{ kpiData.healthTrend }}%
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-success bg-opacity-10 rounded-circle p-3">
                  <i class="fas fa-shield-alt fa-2x text-success"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h6 class="text-muted mb-0">Compliance Score</h6>
                <h3 class="mb-0" :class="getComplianceScoreClass(kpiData.complianceScore)">
                  {{ kpiData.complianceScore }}%
                </h3>
                <small class="text-success">
                  <i class="fas fa-check-circle"></i>
                  {{ kpiData.complianceItems }} item terpenuhi
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-warning bg-opacity-10 rounded-circle p-3">
                  <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h6 class="text-muted mb-0">Risk Level</h6>
                <h3 class="mb-0" :class="getRiskLevelClass(kpiData.riskLevel)">
                  {{ kpiData.riskLevel }}
                </h3>
                <small class="text-muted"> {{ kpiData.riskFactors }} faktor risiko aktif </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-info bg-opacity-10 rounded-circle p-3">
                  <i class="fas fa-chart-line fa-2x text-info"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h6 class="text-muted mb-0">Performance Index</h6>
                <h3 class="mb-0 text-info">{{ kpiData.performanceIndex }}</h3>
                <small class="text-muted">
                  <i class="fas fa-clock"></i>
                  Update {{ formatTime(kpiData.lastUpdate) }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row">
      <!-- Financial Health Chart -->
      <div class="col-lg-8 mb-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-chart-area me-2"></i>
                Kesehatan Keuangan
              </h5>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn"
                  :class="activeTab === 'health' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="activeTab = 'health'"
                >
                  Health
                </button>
                <button
                  class="btn"
                  :class="activeTab === 'liquidity' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="activeTab = 'liquidity'"
                >
                  Likuiditas
                </button>
                <button
                  class="btn"
                  :class="activeTab === 'profitability' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="activeTab = 'profitability'"
                >
                  Profitabilitas
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <canvas id="healthChart" height="300"></canvas>
          </div>
        </div>
      </div>

      <!-- Compliance Status -->
      <div class="col-lg-4 mb-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">
              <i class="fas fa-clipboard-check me-2"></i>
              Status Kepatuhan
            </h5>
          </div>
          <div class="card-body">
            <div v-for="compliance in complianceStatus" :key="compliance.id" class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="fw-medium">{{ compliance.category }}</small>
                <span class="badge" :class="getComplianceBadgeClass(compliance.status)">
                  {{ compliance.status }}
                </span>
              </div>
              <div class="progress" style="height: 8px">
                <div
                  class="progress-bar"
                  :class="getComplianceProgressClass(compliance.status)"
                  :style="{ width: compliance.percentage + '%' }"
                ></div>
              </div>
              <small class="text-muted">{{ compliance.description }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk Monitoring -->
    <div class="row mb-4">
      <div class="col-lg-6 mb-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">
              <i class="fas fa-shield-exclamation me-2"></i>
              Risk Heat Map
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div v-for="risk in riskMatrix" :key="risk.id" class="col-6 col-md-4 mb-3">
                <div class="text-center p-3 rounded" :class="getRiskHeatmapClass(risk.level)">
                  <div class="fs-4 mb-2">
                    <i :class="risk.icon"></i>
                  </div>
                  <h6 class="mb-1">{{ risk.category }}</h6>
                  <small>{{ risk.level }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="col-lg-6 mb-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-history me-2"></i>
                Aktivitas Terkini
              </h5>
              <router-link to="/pengawas/audit/activities" class="btn btn-sm btn-outline-primary">
                Lihat Semua
              </router-link>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="activity in recentActivities" :key="activity.id" class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                      <i :class="activity.icon" class="me-2" :style="{ color: activity.color }"></i>
                      <h6 class="mb-0">{{ activity.title }}</h6>
                    </div>
                    <p class="mb-1 text-muted">{{ activity.description }}</p>
                    <small class="text-muted">
                      <i class="fas fa-user me-1"></i>
                      {{ activity.user }} • {{ formatTime(activity.timestamp) }}
                    </small>
                  </div>
                  <span class="badge" :class="getActivityBadgeClass(activity.severity)">
                    {{ activity.severity }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">
              <i class="fas fa-bolt me-2"></i>
              Quick Actions
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-lg-3 col-md-6 mb-3">
                <router-link
                  to="/pengawas/audit/transactions"
                  class="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-decoration-none"
                >
                  <i class="fas fa-search fa-2x mb-2"></i>
                  <span>Review Transaksi</span>
                  <small class="text-muted">{{ transactionsPending }} pending</small>
                </router-link>
              </div>
              <div class="col-lg-3 col-md-6 mb-3">
                <router-link
                  to="/pengawas/reports"
                  class="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-decoration-none"
                >
                  <i class="fas fa-file-alt fa-2x mb-2"></i>
                  <span>Generate Report</span>
                  <small class="text-muted">Laporan Pengawasan</small>
                </router-link>
              </div>
              <div class="col-lg-3 col-md-6 mb-3">
                <router-link
                  to="/pengawas/fcfs-analytics"
                  class="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-decoration-none"
                >
                  <i class="fas fa-chart-bar fa-2x mb-2"></i>
                  <span>FCFS Analytics</span>
                  <small class="text-muted">System Performance</small>
                </router-link>
              </div>
              <div class="col-lg-3 col-md-6 mb-3">
                <router-link
                  to="/pengawas/audit/system"
                  class="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-decoration-none"
                >
                  <i class="fas fa-cog fa-2x mb-2"></i>
                  <span>System Audit</span>
                  <small class="text-muted">Security & Access</small>
                </router-link>
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
import Chart from 'chart.js/auto'

// Types
interface Alert {
  id: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
}

interface KPIData {
  healthScore: number
  healthTrend: number
  complianceScore: number
  complianceItems: number
  riskLevel: string
  riskFactors: number
  performanceIndex: number
  lastUpdate: string
}

interface ComplianceStatus {
  id: number
  category: string
  status: 'compliant' | 'warning' | 'non-compliant'
  percentage: number
  description: string
}

interface RiskMatrix {
  id: number
  category: string
  level: 'low' | 'medium' | 'high' | 'critical'
  icon: string
}

interface RecentActivity {
  id: number
  title: string
  description: string
  user: string
  timestamp: string
  severity: 'info' | 'warning' | 'danger'
  icon: string
  color: string
}

// Reactive data
const loading = ref(false)
const activeTab = ref('health')
const transactionsPending = ref(12)

const alerts = ref<Alert[]>([
  {
    id: 1,
    severity: 'high',
    message: 'NPL Ratio mencapai 4.2% - mendekati batas aman',
    timestamp: '2024-01-15T10:30:00',
  },
  {
    id: 2,
    severity: 'medium',
    message: 'Likuiditas turun 8% dibanding bulan lalu',
    timestamp: '2024-01-15T09:15:00',
  },
])

const kpiData = ref<KPIData>({
  healthScore: 82,
  healthTrend: 2.5,
  complianceScore: 94,
  complianceItems: 28,
  riskLevel: 'Medium',
  riskFactors: 3,
  performanceIndex: 8.7,
  lastUpdate: '2024-01-15T11:00:00',
})

const complianceStatus = ref<ComplianceStatus[]>([
  {
    id: 1,
    category: 'Permenkop No.8/2023',
    status: 'compliant',
    percentage: 95,
    description: 'Laporan keuangan dan operasional',
  },
  {
    id: 2,
    category: 'UU No.25/1992',
    status: 'compliant',
    percentage: 100,
    description: 'Struktur organisasi dan tata kelola',
  },
  {
    id: 3,
    category: 'Basel III Equivalent',
    status: 'warning',
    percentage: 78,
    description: 'Rasio kecukupan modal',
  },
  {
    id: 4,
    category: 'Internal Policy',
    status: 'compliant',
    percentage: 92,
    description: 'Kebijakan internal koperasi',
  },
])

const riskMatrix = ref<RiskMatrix[]>([
  { id: 1, category: 'Credit', level: 'medium', icon: 'fas fa-credit-card' },
  { id: 2, category: 'Liquidity', level: 'low', icon: 'fas fa-tint' },
  { id: 3, category: 'Operational', level: 'low', icon: 'fas fa-cogs' },
  { id: 4, category: 'System', level: 'medium', icon: 'fas fa-server' },
  { id: 5, category: 'Compliance', level: 'low', icon: 'fas fa-gavel' },
  { id: 6, category: 'Market', level: 'high', icon: 'fas fa-chart-line' },
])

const recentActivities = ref<RecentActivity[]>([
  {
    id: 1,
    title: 'Large Transaction Alert',
    description: 'Transaksi pinjaman Rp 50,000,000 memerlukan review',
    user: 'System Auto',
    timestamp: '2024-01-15T10:45:00',
    severity: 'warning',
    icon: 'fas fa-exclamation-triangle',
    color: '#ffc107',
  },
  {
    id: 2,
    title: 'Override FCFS Queue',
    description: 'Admin melakukan override pada antrean pinjaman',
    user: 'Admin Koperasi',
    timestamp: '2024-01-15T10:30:00',
    severity: 'info',
    icon: 'fas fa-exchange-alt',
    color: '#17a2b8',
  },
  {
    id: 3,
    title: 'Failed Login Attempt',
    description: 'Multiple failed login attempts dari IP suspicious',
    user: 'Security System',
    timestamp: '2024-01-15T10:15:00',
    severity: 'danger',
    icon: 'fas fa-shield-alt',
    color: '#dc3545',
  },
])

// Methods
async function refreshAllData() {
  loading.value = true
  try {
    // Mock API calls
    await new Promise((resolve) => setTimeout(resolve, 2000))
    // In real implementation, fetch all dashboard data
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    loading.value = false
  }
}

function exportDashboard() {
  // Mock export functionality
  console.log('Exporting dashboard data...')
}

// Utility methods
function getAlertBadgeClass(severity: string): string {
  const classes = {
    low: 'bg-info',
    medium: 'bg-warning',
    high: 'bg-danger',
    critical: 'bg-dark',
  }
  return classes[severity as keyof typeof classes] || 'bg-secondary'
}

function getHealthScoreClass(score: number): string {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-warning'
  return 'text-danger'
}

function getHealthTrendIcon(trend: number): string {
  return trend > 0 ? 'fa-arrow-up text-success' : 'fa-arrow-down text-danger'
}

function getComplianceScoreClass(score: number): string {
  if (score >= 90) return 'text-success'
  if (score >= 70) return 'text-warning'
  return 'text-danger'
}

function getRiskLevelClass(level: string): string {
  const classes = {
    Low: 'text-success',
    Medium: 'text-warning',
    High: 'text-danger',
    Critical: 'text-dark',
  }
  return classes[level as keyof typeof classes] || 'text-secondary'
}

function getComplianceBadgeClass(status: string): string {
  const classes = {
    compliant: 'bg-success',
    warning: 'bg-warning',
    'non-compliant': 'bg-danger',
  }
  return classes[status as keyof typeof classes] || 'bg-secondary'
}

function getComplianceProgressClass(status: string): string {
  const classes = {
    compliant: 'bg-success',
    warning: 'bg-warning',
    'non-compliant': 'bg-danger',
  }
  return classes[status as keyof typeof classes] || 'bg-secondary'
}

function getRiskHeatmapClass(level: string): string {
  const classes = {
    low: 'bg-success bg-opacity-25 text-success',
    medium: 'bg-warning bg-opacity-25 text-warning',
    high: 'bg-danger bg-opacity-25 text-danger',
    critical: 'bg-dark bg-opacity-25 text-dark',
  }
  return classes[level as keyof typeof classes] || 'bg-secondary bg-opacity-25'
}

function getActivityBadgeClass(severity: string): string {
  const classes = {
    info: 'bg-info',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }
  return classes[severity as keyof typeof classes] || 'bg-secondary'
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  // Initialize charts and load data
  setTimeout(() => {
    initializeCharts()
  }, 100)
})

function initializeCharts() {
  // Initialize health chart
  const healthCtx = document.getElementById('healthChart') as HTMLCanvasElement
  if (healthCtx) {
    new Chart(healthCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Health Score',
            data: [75, 78, 80, 82, 81, 82],
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })
  }
}
</script>

<style scoped>
.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.bg-opacity-10 {
  --bs-bg-opacity: 0.1;
}

.bg-opacity-25 {
  --bs-bg-opacity: 0.25;
}

.badge {
  font-size: 0.75em;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.progress {
  border-radius: 0.375rem;
}

.list-group-item {
  border-left: none;
  border-right: none;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .btn-group-sm > .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }

  .fs-4 {
    font-size: 1.25rem !important;
  }
}
</style>

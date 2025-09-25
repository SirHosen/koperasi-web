<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useErrorHandler } from '@/lib/errorHandler'
import Chart from 'chart.js/auto'

// Types
interface SavingOverview {
  jenis: string
  total_setor: number
  total_tarik: number
  jumlah_transaksi: number
}

interface LoanOverview {
  status_pinjaman: string
  jumlah: number
  total_nilai: number
  rata_rata_bunga: number
}

interface CashFlowOverview {
  jenis: string
  total: number
}

interface FinancialOverview {
  current_year: number
  savings: SavingOverview[]
  loans: LoanOverview[]
  cash_flow: CashFlowOverview[]
}

interface ComplianceMetric {
  metric: string
  value: number
  description: string
}

interface AuditReport {
  id: number
  tanggal_audit: string
  judul_audit: string
  jenis_audit: string
  status_audit: string
  auditor: string
  temuan_utama?: string
}

interface Recommendation {
  id: number
  category: string
  priority: string
  description: string
  target_date: string
  status: string
  created_at: string
}

const { handleAsync, error: errorMessage, loading: isLoading } = useErrorHandler()

// Data
const financialOverview = ref<FinancialOverview>({
  current_year: new Date().getFullYear(),
  savings: [],
  loans: [],
  cash_flow: []
})

const complianceMetrics = ref<ComplianceMetric[]>([])
const auditReports = ref<AuditReport[]>([])
const recommendations = ref<Recommendation[]>([])
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref('')

// Tabs
const activeTab = ref('overview')

// Chart references
const savingsChartCanvas = ref<HTMLCanvasElement | null>(null)
const loansChartCanvas = ref<HTMLCanvasElement | null>(null)
const cashFlowChartCanvas = ref<HTMLCanvasElement | null>(null)

let savingsChart: Chart | null = null
let loansChart: Chart | null = null
let cashFlowChart: Chart | null = null

const months = [
  { value: '', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
]

onMounted(async () => {
  await loadFinancialOverview()
  await loadComplianceMetrics()
  await loadAuditReports()
  await loadRecommendations()
})

// Load financial oversight data
async function loadFinancialOverview() {
  await handleAsync(async () => {
    const params = new URLSearchParams({
      year: selectedYear.value.toString()
    })
    
    if (selectedMonth.value) {
      params.append('month', selectedMonth.value)
    }
    
    const response = await fetch(`/api/pengawas/oversight/financial?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch financial overview')
    
    const result = await response.json()
    financialOverview.value = result.data
    
    renderCharts()
  }, 'Gagal memuat data keuangan')
}

// Load compliance monitoring data
async function loadComplianceMetrics() {
  await handleAsync(async () => {
    const response = await fetch('/api/pengawas/compliance/monitoring', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch compliance metrics')
    
    const result = await response.json()
    complianceMetrics.value = result.data
  }, 'Gagal memuat data kepatuhan')
}

// Load audit reports
async function loadAuditReports() {
  await handleAsync(async () => {
    const response = await fetch('/api/pengawas/audit/reports?limit=5', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch audit reports')
    
    const result = await response.json()
    auditReports.value = result.data
  }, 'Gagal memuat laporan audit')
}

// Load recommendations
async function loadRecommendations() {
  await handleAsync(async () => {
    const response = await fetch('/api/pengawas/recommendations?limit=5', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch recommendations')
    
    const result = await response.json()
    recommendations.value = result.data
  }, 'Gagal memuat rekomendasi')
}

// Render charts
function renderCharts() {
  renderSavingsChart()
  renderLoansChart()
  renderCashFlowChart()
}

function renderSavingsChart() {
  if (savingsChart) savingsChart.destroy()
  if (!savingsChartCanvas.value) return
  
  const ctx = savingsChartCanvas.value.getContext('2d')
  if (!ctx) return
  
  const labels = financialOverview.value.savings.map((item: SavingOverview) => 
    item.jenis.charAt(0).toUpperCase() + item.jenis.slice(1)
  )
  const data = financialOverview.value.savings.map((item: SavingOverview) => item.total_setor)
  
  savingsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Setoran',
        data,
        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(255, 206, 86, 0.8)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Total Setoran Simpanan'
        }
      }
    }
  })
}

function renderLoansChart() {
  if (loansChart) loansChart.destroy()
  if (!loansChartCanvas.value) return
  
  const ctx = loansChartCanvas.value.getContext('2d')
  if (!ctx) return
  
  const labels = financialOverview.value.loans.map((item: LoanOverview) => 
    item.status_pinjaman.charAt(0).toUpperCase() + item.status_pinjaman.slice(1)
  )
  const data = financialOverview.value.loans.map((item: LoanOverview) => item.jumlah)
  
  loansChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Status Pinjaman'
        }
      }
    }
  })
}

function renderCashFlowChart() {
  if (cashFlowChart) cashFlowChart.destroy()
  if (!cashFlowChartCanvas.value) return
  
  const ctx = cashFlowChartCanvas.value.getContext('2d')
  if (!ctx) return
  
  const labels = financialOverview.value.cash_flow.map((item: CashFlowOverview) => 
    item.jenis === 'masuk' ? 'Kas Masuk' : 'Kas Keluar'
  )
  const data = financialOverview.value.cash_flow.map((item: CashFlowOverview) => item.total)
  
  cashFlowChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Jumlah (Rp)',
        data,
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Arus Kas'
        }
      }
    }
  })
}

// Handle filter change
async function handleFilterChange() {
  await loadFinancialOverview()
}

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
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get metric color class
const getMetricColorClass = (metric: ComplianceMetric) => {
  switch (metric.metric) {
    case 'loan_approval_time':
      return metric.value <= 3 ? 'text-success' : metric.value <= 7 ? 'text-warning' : 'text-danger'
    case 'pending_verifications':
      return metric.value === 0 ? 'text-success' : metric.value <= 5 ? 'text-warning' : 'text-danger'
    case 'overdue_loans':
      return metric.value === 0 ? 'text-success' : metric.value <= 3 ? 'text-warning' : 'text-danger'
    default:
      return 'text-primary'
  }
}
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="h3 mb-4">
          <i class="bi bi-shield-check me-2"></i>
          Dashboard Pengawas
        </h1>
        
        <!-- Error Messages -->
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
        </div>
        
        <!-- Navigation Tabs -->
        <div class="card">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button 
                  :class="['nav-link', { active: activeTab === 'overview' }]"
                  @click="activeTab = 'overview'"
                  type="button"
                >
                  <i class="bi bi-graph-up me-2"></i>Ikhtisar Keuangan
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button 
                  :class="['nav-link', { active: activeTab === 'compliance' }]"
                  @click="activeTab = 'compliance'"
                  type="button"
                >
                  <i class="bi bi-check-circle me-2"></i>Monitoring Kepatuhan
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button 
                  :class="['nav-link', { active: activeTab === 'audit' }]"
                  @click="activeTab = 'audit'"
                  type="button"
                >
                  <i class="bi bi-file-text me-2"></i>Laporan Audit
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button 
                  :class="['nav-link', { active: activeTab === 'recommendations' }]"
                  @click="activeTab = 'recommendations'"
                  type="button"
                >
                  <i class="bi bi-lightbulb me-2"></i>Rekomendasi
                </button>
              </li>
            </ul>
          </div>
          
          <div class="card-body">
            <!-- Financial Overview Tab -->
            <div v-show="activeTab === 'overview'" class="tab-pane">
              <div class="row mb-3">
                <div class="col-md-3">
                  <label for="yearSelect" class="form-label">Tahun:</label>
                  <select 
                    id="yearSelect" 
                    class="form-select" 
                    v-model="selectedYear" 
                    @change="handleFilterChange"
                  >
                    <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
                    <option :value="new Date().getFullYear() - 1">{{ new Date().getFullYear() - 1 }}</option>
                    <option :value="new Date().getFullYear() - 2">{{ new Date().getFullYear() - 2 }}</option>
                  </select>
                </div>
                
                <div class="col-md-3">
                  <label for="monthSelect" class="form-label">Bulan:</label>
                  <select 
                    id="monthSelect" 
                    class="form-select" 
                    v-model="selectedMonth" 
                    @change="handleFilterChange"
                  >
                    <option v-for="month in months" :key="month.value" :value="month.value">
                      {{ month.label }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-4">
                  <div class="card mb-3">
                    <div class="card-body">
                      <h5 class="card-title">Simpanan</h5>
                      <div style="height: 250px; position: relative;">
                        <canvas ref="savingsChartCanvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="card mb-3">
                    <div class="card-body">
                      <h5 class="card-title">Pinjaman</h5>
                      <div style="height: 250px; position: relative;">
                        <canvas ref="loansChartCanvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="card mb-3">
                    <div class="card-body">
                      <h5 class="card-title">Arus Kas</h5>
                      <div style="height: 250px; position: relative;">
                        <canvas ref="cashFlowChartCanvas"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Detailed Tables -->
              <div class="row">
                <div class="col-md-6">
                  <div class="card">
                    <div class="card-header">
                      <h5 class="mb-0">Detail Simpanan</h5>
                    </div>
                    <div class="card-body">
                      <div class="table-responsive">
                        <table class="table table-sm">
                          <thead>
                            <tr>
                              <th>Jenis</th>
                              <th>Total Setor</th>
                              <th>Total Tarik</th>
                              <th>Transaksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="saving in financialOverview.savings" :key="saving.jenis">
                              <td>{{ saving.jenis.charAt(0).toUpperCase() + saving.jenis.slice(1) }}</td>
                              <td class="text-success">{{ formatCurrency(saving.total_setor) }}</td>
                              <td class="text-danger">{{ formatCurrency(saving.total_tarik) }}</td>
                              <td>{{ saving.jumlah_transaksi }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="card">
                    <div class="card-header">
                      <h5 class="mb-0">Detail Pinjaman</h5>
                    </div>
                    <div class="card-body">
                      <div class="table-responsive">
                        <table class="table table-sm">
                          <thead>
                            <tr>
                              <th>Status</th>
                              <th>Jumlah</th>
                              <th>Total Nilai</th>
                              <th>Rata-rata Bunga</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="loan in financialOverview.loans" :key="loan.status_pinjaman">
                              <td>
                                <span :class="{
                                  'badge rounded-pill': true,
                                  'bg-warning': loan.status_pinjaman === 'menunggu',
                                  'bg-success': loan.status_pinjaman === 'disetujui',
                                  'bg-primary': loan.status_pinjaman === 'aktif',
                                  'bg-secondary': loan.status_pinjaman === 'lunas'
                                }">
                                  {{ loan.status_pinjaman }}
                                </span>
                              </td>
                              <td>{{ loan.jumlah }}</td>
                              <td>{{ formatCurrency(loan.total_nilai) }}</td>
                              <td>{{ loan.rata_rata_bunga.toFixed(1) }}%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Compliance Monitoring Tab -->
            <div v-show="activeTab === 'compliance'" class="tab-pane">
              <div class="row">
                <div v-for="metric in complianceMetrics" :key="metric.metric" class="col-md-6 col-lg-3">
                  <div class="card mb-3">
                    <div class="card-body text-center">
                      <i class="bi bi-speedometer2 mb-2" style="font-size: 2rem;" :class="getMetricColorClass(metric)"></i>
                      <h5 :class="getMetricColorClass(metric)">{{ metric.value }}</h5>
                      <p class="card-text text-muted small">{{ metric.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Indikator Kepatuhan
                  </h5>
                </div>
                <div class="card-body">
                  <div class="alert alert-info">
                    <h6 class="alert-heading">Panduan Interpretasi:</h6>
                    <ul class="mb-0">
                      <li><span class="badge bg-success me-2">Hijau</span> Baik - Sesuai standar</li>
                      <li><span class="badge bg-warning me-2">Kuning</span> Perhatian - Perlu monitoring</li>
                      <li><span class="badge bg-danger me-2">Merah</span> Kritis - Perlu tindakan segera</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Audit Reports Tab -->
            <div v-show="activeTab === 'audit'" class="tab-pane">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Tanggal Audit</th>
                      <th>Judul</th>
                      <th>Jenis</th>
                      <th>Status</th>
                      <th>Auditor</th>
                      <th>Temuan Utama</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="isLoading">
                      <td colspan="6" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Memuat data...
                      </td>
                    </tr>
                    <tr v-else-if="auditReports.length === 0">
                      <td colspan="6" class="text-center py-4 text-muted">
                        Belum ada laporan audit
                      </td>
                    </tr>
                    <tr v-else v-for="report in auditReports" :key="report.id">
                      <td>{{ formatDate(report.tanggal_audit) }}</td>
                      <td>{{ report.judul_audit }}</td>
                      <td>
                        <span class="badge bg-info">{{ report.jenis_audit }}</span>
                      </td>
                      <td>
                        <span :class="{
                          'badge rounded-pill': true,
                          'bg-secondary': report.status_audit === 'draft',
                          'bg-success': report.status_audit === 'final'
                        }">
                          {{ report.status_audit }}
                        </span>
                      </td>
                      <td>{{ report.auditor }}</td>
                      <td>{{ report.temuan_utama || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Recommendations Tab -->
            <div v-show="activeTab === 'recommendations'" class="tab-pane">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Kategori</th>
                      <th>Prioritas</th>
                      <th>Deskripsi</th>
                      <th>Target</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="isLoading">
                      <td colspan="6" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Memuat data...
                      </td>
                    </tr>
                    <tr v-else-if="recommendations.length === 0">
                      <td colspan="6" class="text-center py-4 text-muted">
                        Belum ada rekomendasi
                      </td>
                    </tr>
                    <tr v-else v-for="rec in recommendations" :key="rec.id">
                      <td>{{ formatDate(rec.created_at) }}</td>
                      <td>
                        <span class="badge bg-secondary">{{ rec.category }}</span>
                      </td>
                      <td>
                        <span :class="{
                          'badge rounded-pill': true,
                          'bg-danger': rec.priority === 'tinggi',
                          'bg-warning text-dark': rec.priority === 'sedang',
                          'bg-info': rec.priority === 'rendah'
                        }">
                          {{ rec.priority }}
                        </span>
                      </td>
                      <td>{{ rec.description }}</td>
                      <td>{{ formatDate(rec.target_date) }}</td>
                      <td>
                        <span :class="{
                          'badge rounded-pill': true,
                          'bg-success': rec.status === 'completed',
                          'bg-primary': rec.status === 'active',
                          'bg-secondary': rec.status === 'pending'
                        }">
                          {{ rec.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75em;
}

.alert {
  border: none;
  border-radius: 0.375rem;
}
</style>
<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-search me-2"></i>
              Transaction Review & Audit
            </h2>
            <p class="text-muted mb-0">Review dan audit semua transaksi koperasi</p>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-danger btn-sm"
              @click="flagSuspiciousTransactions"
              :disabled="processing"
            >
              <i class="fas fa-flag"></i>
              Flag Suspicious
            </button>
            <button class="btn btn-outline-primary btn-sm" @click="exportTransactions">
              <i class="fas fa-download"></i>
              Export
            </button>
            <button
              class="btn btn-outline-success btn-sm"
              @click="refreshTransactions"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-primary bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-exchange-alt fa-2x text-primary"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Total Transaksi</h6>
            <h3 class="mb-0">{{ stats.totalTransactions }}</h3>
            <small class="text-muted">Hari ini: {{ stats.todayTransactions }}</small>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-warning bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Suspicious</h6>
            <h3 class="mb-0 text-warning">{{ stats.suspiciousTransactions }}</h3>
            <small class="text-muted">Perlu review: {{ stats.pendingReview }}</small>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-success bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-check-circle fa-2x text-success"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Approved</h6>
            <h3 class="mb-0 text-success">{{ stats.approvedTransactions }}</h3>
            <small class="text-success"
              >{{
                ((stats.approvedTransactions / stats.totalTransactions) * 100).toFixed(1)
              }}%</small
            >
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-info bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-chart-line fa-2x text-info"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Total Volume</h6>
            <h3 class="mb-0 text-info">{{ formatCurrency(stats.totalVolume) }}</h3>
            <small class="text-muted">Rata-rata: {{ formatCurrency(stats.averageAmount) }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Tanggal Dari</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="filters.dateFrom"
                  @change="applyFilters"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Tanggal Sampai</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="filters.dateTo"
                  @change="applyFilters"
                />
              </div>
              <div class="col-md-2">
                <label class="form-label">Jenis Transaksi</label>
                <select
                  class="form-select"
                  v-model="filters.transactionType"
                  @change="applyFilters"
                >
                  <option value="">Semua Jenis</option>
                  <option value="simpanan">Simpanan</option>
                  <option value="pinjaman">Pinjaman</option>
                  <option value="shu">SHU</option>
                  <option value="biaya_admin">Biaya Admin</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">Status</label>
                <select class="form-select" v-model="filters.status" @change="applyFilters">
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspicious">Suspicious</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">Minimal Amount</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="filters.minAmount"
                  @input="applyFilters"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'all' }"
                  @click="activeTab = 'all'"
                >
                  <i class="fas fa-list me-2"></i>
                  All Transactions ({{ filteredTransactions.length }})
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'suspicious' }"
                  @click="activeTab = 'suspicious'"
                >
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Suspicious ({{ suspiciousTransactions.length }})
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'approval' }"
                  @click="activeTab = 'approval'"
                >
                  <i class="fas fa-route me-2"></i>
                  Approval Chain
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'analytics' }"
                  @click="activeTab = 'analytics'"
                >
                  <i class="fas fa-chart-bar me-2"></i>
                  Analytics
                </button>
              </li>
            </ul>
          </div>
          <div class="card-body p-0">
            <!-- All Transactions Tab -->
            <div v-if="activeTab === 'all'" class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        class="form-check-input"
                        @change="toggleSelectAll"
                        :checked="selectedTransactions.length === filteredTransactions.length"
                      />
                    </th>
                    <th>ID Transaksi</th>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Anggota</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Risk Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="transaction in paginatedTransactions" :key="transaction.id">
                    <td>
                      <input
                        type="checkbox"
                        class="form-check-input"
                        :value="transaction.id"
                        v-model="selectedTransactions"
                      />
                    </td>
                    <td>
                      <strong>{{ transaction.id }}</strong>
                      <br />
                      <small class="text-muted">{{ transaction.reference }}</small>
                    </td>
                    <td>
                      {{ formatDateTime(transaction.created_at) }}
                      <br />
                      <small class="text-muted">{{ formatTime(transaction.created_at) }}</small>
                    </td>
                    <td>
                      <span class="badge" :class="getTransactionTypeBadge(transaction.type)">
                        {{ transaction.type }}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{{ transaction.member_name }}</strong>
                        <br />
                        <small class="text-muted">{{ transaction.member_number }}</small>
                      </div>
                    </td>
                    <td>
                      <div class="text-end">
                        <strong>{{ formatCurrency(transaction.amount) }}</strong>
                        <br />
                        <small class="text-muted">{{ transaction.currency }}</small>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="getStatusBadge(transaction.status)">
                        {{ transaction.status }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="progress me-2" style="width: 60px; height: 8px">
                          <div
                            class="progress-bar"
                            :class="getRiskProgressClass(transaction.risk_score)"
                            :style="{ width: transaction.risk_score + '%' }"
                          ></div>
                        </div>
                        <small>{{ transaction.risk_score }}%</small>
                      </div>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-primary"
                          @click="viewTransactionDetail(transaction)"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button
                          class="btn btn-outline-warning"
                          @click="viewApprovalChain(transaction)"
                        >
                          <i class="fas fa-route"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger"
                          @click="flagTransaction(transaction)"
                          v-if="transaction.status !== 'suspicious'"
                        >
                          <i class="fas fa-flag"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Suspicious Transactions Tab -->
            <div v-else-if="activeTab === 'suspicious'" class="p-4">
              <div v-if="suspiciousTransactions.length === 0" class="text-center py-5">
                <i class="fas fa-shield-alt fa-3x text-success mb-3"></i>
                <h5 class="text-muted">Tidak Ada Transaksi Mencurigakan</h5>
                <p class="text-muted">Semua transaksi terverifikasi normal</p>
              </div>

              <div v-else>
                <div
                  v-for="transaction in suspiciousTransactions"
                  :key="transaction.id"
                  class="card mb-3 border-warning"
                >
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-md-8">
                        <div class="d-flex align-items-center mb-2">
                          <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                          <h6 class="mb-0">{{ transaction.id }} - {{ transaction.member_name }}</h6>
                          <span class="badge bg-warning ms-2"
                            >Risk: {{ transaction.risk_score }}%</span
                          >
                        </div>
                        <p class="mb-1">
                          <strong>Amount:</strong> {{ formatCurrency(transaction.amount) }} •
                          <strong>Type:</strong> {{ transaction.type }} • <strong>Date:</strong>
                          {{ formatDateTime(transaction.created_at) }}
                        </p>
                        <div class="mb-2">
                          <strong>Suspicious Indicators:</strong>
                          <div class="mt-1">
                            <span
                              v-for="indicator in transaction.suspicious_indicators"
                              :key="indicator"
                              class="badge bg-danger me-1 mb-1"
                            >
                              {{ indicator }}
                            </span>
                          </div>
                        </div>
                        <small class="text-muted">{{ transaction.suspicious_reason }}</small>
                      </div>
                      <div class="col-md-4 text-end">
                        <div class="btn-group-vertical">
                          <button
                            class="btn btn-sm btn-outline-success"
                            @click="approveTransaction(transaction)"
                          >
                            <i class="fas fa-check"></i> Approve
                          </button>
                          <button
                            class="btn btn-sm btn-outline-primary"
                            @click="requestMoreInfo(transaction)"
                          >
                            <i class="fas fa-info-circle"></i> More Info
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="rejectTransaction(transaction)"
                          >
                            <i class="fas fa-times"></i> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Approval Chain Tab -->
            <div v-else-if="activeTab === 'approval'" class="p-4">
              <div class="row">
                <div class="col-md-4">
                  <h6>Pilih Transaksi untuk Trace</h6>
                  <input
                    type="text"
                    class="form-control mb-3"
                    placeholder="Masukkan ID Transaksi..."
                    v-model="approvalTraceId"
                    @keyup.enter="traceApprovalChain"
                  />
                  <button class="btn btn-primary w-100" @click="traceApprovalChain">
                    <i class="fas fa-search"></i> Trace Approval
                  </button>
                </div>
                <div class="col-md-8">
                  <div v-if="approvalChain.length > 0">
                    <h6>Approval Chain untuk Transaksi {{ approvalTraceId }}</h6>
                    <div class="timeline">
                      <div
                        v-for="(step, index) in approvalChain"
                        :key="index"
                        class="timeline-item"
                      >
                        <div class="timeline-marker" :class="getApprovalStepClass(step.status)">
                          <i :class="getApprovalStepIcon(step.status)"></i>
                        </div>
                        <div class="timeline-content">
                          <h6 class="mb-1">{{ step.step_name }}</h6>
                          <p class="mb-1">{{ step.description }}</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                              <i class="fas fa-user me-1"></i>{{ step.approver }}
                            </small>
                            <small class="text-muted">{{ formatDateTime(step.timestamp) }}</small>
                          </div>
                          <div v-if="step.notes" class="mt-2">
                            <small><strong>Notes:</strong> {{ step.notes }}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-5">
                    <i class="fas fa-route fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Trace Approval Chain</h5>
                    <p class="text-muted">Masukkan ID transaksi untuk melihat approval chain</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Analytics Tab -->
            <div v-else-if="activeTab === 'analytics'" class="p-4">
              <div class="row">
                <div class="col-md-6 mb-4">
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0">Transaction Volume by Type</h6>
                    </div>
                    <div class="card-body">
                      <canvas id="volumeChart" height="300"></canvas>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 mb-4">
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0">Risk Score Distribution</h6>
                    </div>
                    <div class="card-body">
                      <canvas id="riskChart" height="300"></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-12">
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0">Transaction Trend (Last 30 Days)</h6>
                    </div>
                    <div class="card-body">
                      <canvas id="trendChart" height="200"></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="activeTab === 'all'"
              class="d-flex justify-content-between align-items-center p-3 border-top"
            >
              <div class="text-muted">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} of
                {{ filteredTransactions.length }} entries
              </div>
              <nav>
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button
                      class="page-link"
                      @click="currentPage = 1"
                      :disabled="currentPage === 1"
                    >
                      First
                    </button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                      Previous
                    </button>
                  </li>
                  <li
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === currentPage }"
                  >
                    <button class="page-link" @click="currentPage = page">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button
                      class="page-link"
                      @click="currentPage++"
                      :disabled="currentPage === totalPages"
                    >
                      Next
                    </button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button
                      class="page-link"
                      @click="currentPage = totalPages"
                      :disabled="currentPage === totalPages"
                    >
                      Last
                    </button>
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Chart from 'chart.js/auto'

// Types
interface Transaction {
  id: string
  reference: string
  created_at: string
  type: string
  member_name: string
  member_number: string
  amount: number
  currency: string
  status: string
  risk_score: number
  suspicious_indicators?: string[]
  suspicious_reason?: string
}

interface ApprovalStep {
  step_name: string
  description: string
  approver: string
  timestamp: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
}

interface TransactionStats {
  totalTransactions: number
  todayTransactions: number
  suspiciousTransactions: number
  pendingReview: number
  approvedTransactions: number
  totalVolume: number
  averageAmount: number
}

// Reactive data
const loading = ref(false)
const processing = ref(false)
const activeTab = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(20)
const selectedTransactions = ref<string[]>([])
const approvalTraceId = ref('')
const approvalChain = ref<ApprovalStep[]>([])

const filters = ref({
  dateFrom: '',
  dateTo: '',
  transactionType: '',
  status: '',
  minAmount: 0,
})

const stats = ref<TransactionStats>({
  totalTransactions: 2847,
  todayTransactions: 23,
  suspiciousTransactions: 12,
  pendingReview: 8,
  approvedTransactions: 2801,
  totalVolume: 850000000,
  averageAmount: 298764,
})

const transactions = ref<Transaction[]>([
  {
    id: 'TXN-2024-0001',
    reference: 'REF-001-2024',
    created_at: '2024-01-15T10:30:00',
    type: 'pinjaman',
    member_name: 'Ahmad Subagyo',
    member_number: 'A001234',
    amount: 50000000,
    currency: 'IDR',
    status: 'suspicious',
    risk_score: 85,
    suspicious_indicators: ['Large Amount', 'Unusual Pattern', 'New Member'],
    suspicious_reason: 'Pinjaman dengan jumlah besar dari anggota baru',
  },
  {
    id: 'TXN-2024-0002',
    reference: 'REF-002-2024',
    created_at: '2024-01-15T09:15:00',
    type: 'simpanan',
    member_name: 'Siti Nurhaliza',
    member_number: 'A001456',
    amount: 5000000,
    currency: 'IDR',
    status: 'approved',
    risk_score: 15,
  },
  {
    id: 'TXN-2024-0003',
    reference: 'REF-003-2024',
    created_at: '2024-01-15T08:45:00',
    type: 'shu',
    member_name: 'Budi Santoso',
    member_number: 'A001789',
    amount: 2500000,
    currency: 'IDR',
    status: 'pending',
    risk_score: 25,
  },
])

// Computed properties
const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (filters.value.dateFrom) {
    filtered = filtered.filter((t) => t.created_at >= filters.value.dateFrom)
  }
  if (filters.value.dateTo) {
    filtered = filtered.filter((t) => t.created_at <= filters.value.dateTo)
  }
  if (filters.value.transactionType) {
    filtered = filtered.filter((t) => t.type === filters.value.transactionType)
  }
  if (filters.value.status) {
    filtered = filtered.filter((t) => t.status === filters.value.status)
  }
  if (filters.value.minAmount > 0) {
    filtered = filtered.filter((t) => t.amount >= filters.value.minAmount)
  }

  return filtered
})

const suspiciousTransactions = computed(() => {
  return filteredTransactions.value.filter((t) => t.status === 'suspicious')
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTransactions.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
async function refreshTransactions() {
  loading.value = true
  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  currentPage.value = 1
}

function toggleSelectAll() {
  if (selectedTransactions.value.length === filteredTransactions.value.length) {
    selectedTransactions.value = []
  } else {
    selectedTransactions.value = filteredTransactions.value.map((t) => t.id)
  }
}

function viewTransactionDetail(transaction: Transaction) {
  // Mock view detail
  console.log('Viewing transaction:', transaction.id)
}

function viewApprovalChain(transaction: Transaction) {
  approvalTraceId.value = transaction.id
  traceApprovalChain()
}

function traceApprovalChain() {
  // Mock approval chain data
  approvalChain.value = [
    {
      step_name: 'Initial Submit',
      description: 'Transaksi disubmit oleh anggota',
      approver: 'System Auto',
      timestamp: '2024-01-15T10:30:00',
      status: 'approved',
    },
    {
      step_name: 'Risk Assessment',
      description: 'Otomatis risk scoring system',
      approver: 'Risk Engine',
      timestamp: '2024-01-15T10:31:00',
      status: 'approved',
      notes: 'Risk score: 85% - High risk detected',
    },
    {
      step_name: 'Manager Review',
      description: 'Review manual oleh manager',
      approver: 'Admin Manager',
      timestamp: '2024-01-15T11:00:00',
      status: 'pending',
      notes: 'Pending manual review due to high risk score',
    },
  ]
}

function flagTransaction(transaction: Transaction) {
  transaction.status = 'suspicious'
  transaction.suspicious_indicators = ['Manual Flag']
  transaction.suspicious_reason = 'Manually flagged by supervisor'
  stats.value.suspiciousTransactions++
}

function flagSuspiciousTransactions() {
  processing.value = true
  // Mock bulk flag operation
  setTimeout(() => {
    processing.value = false
  }, 2000)
}

function approveTransaction(transaction: Transaction) {
  transaction.status = 'approved'
  stats.value.approvedTransactions++
  stats.value.suspiciousTransactions--
}

function rejectTransaction(transaction: Transaction) {
  transaction.status = 'rejected'
  stats.value.suspiciousTransactions--
}

function requestMoreInfo(transaction: Transaction) {
  // Mock request more info
  console.log('Requesting more info for:', transaction.id)
}

function exportTransactions() {
  // Mock export
  console.log('Exporting transactions...')
}

// Utility methods
function getTransactionTypeBadge(type: string): string {
  const badges = {
    simpanan: 'bg-success',
    pinjaman: 'bg-primary',
    shu: 'bg-info',
    biaya_admin: 'bg-warning',
  }
  return badges[type as keyof typeof badges] || 'bg-secondary'
}

function getStatusBadge(status: string): string {
  const badges = {
    pending: 'bg-warning',
    approved: 'bg-success',
    rejected: 'bg-danger',
    suspicious: 'bg-dark',
  }
  return badges[status as keyof typeof badges] || 'bg-secondary'
}

function getRiskProgressClass(score: number): string {
  if (score >= 70) return 'bg-danger'
  if (score >= 40) return 'bg-warning'
  return 'bg-success'
}

function getApprovalStepClass(status: string): string {
  const classes = {
    pending: 'bg-warning',
    approved: 'bg-success',
    rejected: 'bg-danger',
  }
  return classes[status as keyof typeof classes] || 'bg-secondary'
}

function getApprovalStepIcon(status: string): string {
  const icons = {
    pending: 'fas fa-clock',
    approved: 'fas fa-check',
    rejected: 'fas fa-times',
  }
  return icons[status as keyof typeof icons] || 'fas fa-question'
}

function formatDateTime(datetime: string): string {
  return new Date(datetime).toLocaleDateString('id-ID')
}

function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

onMounted(() => {
  // Set default date range
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

  filters.value.dateFrom = lastMonth.toISOString().split('T')[0]
  filters.value.dateTo = today.toISOString().split('T')[0]

  // Initialize charts
  setTimeout(() => {
    initializeCharts()
  }, 100)
})

function initializeCharts() {
  // Volume Chart
  const volumeCtx = document.getElementById('volumeChart') as HTMLCanvasElement
  if (volumeCtx) {
    new Chart(volumeCtx, {
      type: 'doughnut',
      data: {
        labels: ['Simpanan', 'Pinjaman', 'SHU', 'Biaya Admin'],
        datasets: [
          {
            data: [45, 35, 15, 5],
            backgroundColor: ['#28a745', '#007bff', '#17a2b8', '#ffc107'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  // Risk Chart
  const riskCtx = document.getElementById('riskChart') as HTMLCanvasElement
  if (riskCtx) {
    new Chart(riskCtx, {
      type: 'bar',
      data: {
        labels: ['Low (0-30)', 'Medium (31-70)', 'High (71-100)'],
        datasets: [
          {
            label: 'Number of Transactions',
            data: [1250, 890, 45],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  // Trend Chart
  const trendCtx = document.getElementById('trendChart') as HTMLCanvasElement
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Total Transactions',
            data: [654, 789, 567, 834],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }
}
</script>

<style scoped>
.bg-opacity-10 {
  --bs-bg-opacity: 0.1;
}

.timeline {
  position: relative;
  padding-left: 3rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 2rem;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: -2.5rem;
  top: 2rem;
  width: 2px;
  height: calc(100% - 1rem);
  background-color: #dee2e6;
}

.timeline-marker {
  position: absolute;
  left: -3rem;
  top: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
}

.timeline-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border-left: 3px solid #dee2e6;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: transparent;
  border-bottom-color: #0d6efd;
}

.table th {
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.progress {
  border-radius: 0.375rem;
}

.badge {
  font-size: 0.75em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .timeline {
    padding-left: 2rem;
  }

  .timeline-marker {
    left: -2rem;
    width: 1.5rem;
    height: 1.5rem;
  }

  .timeline-item:not(:last-child)::before {
    left: -1.75rem;
  }
}
</style>

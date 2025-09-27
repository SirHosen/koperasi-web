<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-file-alt me-2"></i>
              Reports Access Center
            </h2>
            <p class="text-muted mb-0">Read-only access ke semua laporan koperasi</p>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-primary btn-sm"
              @click="refreshReports"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
            <button
              class="btn btn-outline-success btn-sm"
              @click="bulkExport"
              :disabled="selectedReports.length === 0"
            >
              <i class="fas fa-download"></i>
              Bulk Export ({{ selectedReports.length }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Statistics -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-primary bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-chart-line fa-2x text-primary"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Financial Reports</h6>
            <h3 class="mb-0">{{ reportStats.financial }}</h3>
            <small class="text-muted">{{ reportStats.financialRecent }} recent</small>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-success bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-cogs fa-2x text-success"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Operational Reports</h6>
            <h3 class="mb-0">{{ reportStats.operational }}</h3>
            <small class="text-muted">{{ reportStats.operationalRecent }} recent</small>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-warning bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-shield-alt fa-2x text-warning"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Compliance Reports</h6>
            <h3 class="mb-0">{{ reportStats.compliance }}</h3>
            <small class="text-muted">{{ reportStats.complianceRecent }} recent</small>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-info bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-users fa-2x text-info"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Member Reports</h6>
            <h3 class="mb-0">{{ reportStats.member }}</h3>
            <small class="text-muted">{{ reportStats.memberRecent }} recent</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Search Reports</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search by name, type, or creator..."
                  v-model="searchQuery"
                  @input="applyFilters"
                />
              </div>
              <div class="col-md-2">
                <label class="form-label">Category</label>
                <select class="form-select" v-model="filters.category" @change="applyFilters">
                  <option value="">All Categories</option>
                  <option value="financial">Financial</option>
                  <option value="operational">Operational</option>
                  <option value="compliance">Compliance</option>
                  <option value="member">Member</option>
                  <option value="risk">Risk</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">Date From</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="filters.dateFrom"
                  @change="applyFilters"
                />
              </div>
              <div class="col-md-2">
                <label class="form-label">Date To</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="filters.dateTo"
                  @change="applyFilters"
                />
              </div>
              <div class="col-md-2">
                <label class="form-label">Status</label>
                <select class="form-select" v-model="filters.status" @change="applyFilters">
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div class="col-md-1">
                <label class="form-label">&nbsp;</label>
                <button class="btn btn-outline-secondary w-100" @click="resetFilters">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports Table -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-table me-2"></i>
                Reports List ({{ filteredReports.length }})
              </h5>
              <div class="d-flex gap-2">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn"
                    :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="viewMode = 'table'"
                  >
                    <i class="fas fa-table"></i>
                  </button>
                  <button
                    class="btn"
                    :class="viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="viewMode = 'grid'"
                  >
                    <i class="fas fa-th"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <!-- Table View -->
            <div v-if="viewMode === 'table'" class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th width="50">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        @change="toggleSelectAll"
                        :checked="
                          selectedReports.length === filteredReports.length &&
                          filteredReports.length > 0
                        "
                      />
                    </th>
                    <th>Report Name</th>
                    <th>Category</th>
                    <th>Period</th>
                    <th>Created By</th>
                    <th>Created Date</th>
                    <th>Status</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="report in paginatedReports" :key="report.id">
                    <td>
                      <input
                        type="checkbox"
                        class="form-check-input"
                        :value="report.id"
                        v-model="selectedReports"
                      />
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="me-3">
                          <i
                            :class="getReportIcon(report.category)"
                            class="fa-lg"
                            :style="{ color: getReportColor(report.category) }"
                          ></i>
                        </div>
                        <div>
                          <h6 class="mb-0">{{ report.title }}</h6>
                          <small class="text-muted">{{ report.description }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="getCategoryBadge(report.category)">
                        {{ report.category }}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{{ formatPeriod(report.period_start, report.period_end) }}</strong>
                        <br />
                        <small class="text-muted">{{
                          getDuration(report.period_start, report.period_end)
                        }}</small>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div
                          class="bg-secondary rounded-circle p-2 me-2"
                          style="width: 32px; height: 32px"
                        >
                          <i class="fas fa-user text-white" style="font-size: 0.75rem"></i>
                        </div>
                        <div>
                          <strong>{{ report.created_by }}</strong>
                          <br />
                          <small class="text-muted">{{ report.creator_role }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {{ formatDateTime(report.created_at) }}
                      <br />
                      <small class="text-muted">{{ formatTime(report.created_at) }}</small>
                    </td>
                    <td>
                      <span class="badge" :class="getStatusBadge(report.status)">
                        {{ report.status }}
                      </span>
                    </td>
                    <td>
                      <strong>{{ formatFileSize(report.file_size) }}</strong>
                      <br />
                      <small class="text-muted">{{ report.format.toUpperCase() }}</small>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-primary"
                          @click="previewReport(report)"
                          :disabled="!canPreview(report.format)"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" @click="downloadReport(report)">
                          <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-outline-info" @click="shareReport(report)">
                          <i class="fas fa-share"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Grid View -->
            <div v-else class="p-4">
              <div class="row">
                <div
                  v-for="report in paginatedReports"
                  :key="report.id"
                  class="col-lg-4 col-md-6 mb-4"
                >
                  <div class="card h-100 border-0 shadow-sm">
                    <div class="card-header bg-white border-bottom-0">
                      <div class="d-flex justify-content-between align-items-start">
                        <div class="d-flex align-items-center">
                          <input
                            type="checkbox"
                            class="form-check-input me-2"
                            :value="report.id"
                            v-model="selectedReports"
                          />
                          <i
                            :class="getReportIcon(report.category)"
                            class="fa-2x"
                            :style="{ color: getReportColor(report.category) }"
                          ></i>
                        </div>
                        <span class="badge" :class="getCategoryBadge(report.category)">
                          {{ report.category }}
                        </span>
                      </div>
                    </div>
                    <div class="card-body">
                      <h6 class="card-title">{{ report.title }}</h6>
                      <p class="card-text text-muted small">{{ report.description }}</p>

                      <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <small class="text-muted">Period</small>
                          <small>{{ getDuration(report.period_start, report.period_end) }}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <small class="text-muted">Created by</small>
                          <small>{{ report.created_by }}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <small class="text-muted">Size</small>
                          <small>{{ formatFileSize(report.file_size) }}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                          <small class="text-muted">Status</small>
                          <span class="badge" :class="getStatusBadge(report.status)">
                            {{ report.status }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="card-footer bg-white border-top">
                      <div class="d-flex gap-1">
                        <button
                          class="btn btn-sm btn-outline-primary flex-fill"
                          @click="previewReport(report)"
                          :disabled="!canPreview(report.format)"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-success flex-fill"
                          @click="downloadReport(report)"
                        >
                          <i class="fas fa-download"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-info flex-fill"
                          @click="shareReport(report)"
                        >
                          <i class="fas fa-share"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              class="d-flex justify-content-between align-items-center p-3 border-top"
            >
              <div class="text-muted">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                {{ Math.min(currentPage * itemsPerPage, filteredReports.length) }} of
                {{ filteredReports.length }} reports
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

    <!-- Report Preview Modal -->
    <div class="modal fade" id="reportPreviewModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedReport?.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedReport" class="text-center py-5">
              <i class="fas fa-file-alt fa-4x text-muted mb-3"></i>
              <h5>Report Preview</h5>
              <p class="text-muted">Preview untuk {{ selectedReport.title }}</p>
              <div class="mt-3">
                <button class="btn btn-primary me-2" @click="downloadReport(selectedReport)">
                  <i class="fas fa-download"></i>
                  Download Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Types
interface Report {
  id: string
  title: string
  description: string
  category: 'financial' | 'operational' | 'compliance' | 'member' | 'risk'
  period_start: string
  period_end: string
  created_by: string
  creator_role: string
  created_at: string
  status: 'published' | 'draft' | 'archived'
  format: 'pdf' | 'excel' | 'csv'
  file_size: number
  file_path: string
}

interface ReportStats {
  financial: number
  financialRecent: number
  operational: number
  operationalRecent: number
  compliance: number
  complianceRecent: number
  member: number
  memberRecent: number
}

// Reactive data
const loading = ref(false)
const viewMode = ref<'table' | 'grid'>('table')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const searchQuery = ref('')
const selectedReports = ref<string[]>([])
const selectedReport = ref<Report | null>(null)

const filters = ref({
  category: '',
  dateFrom: '',
  dateTo: '',
  status: '',
})

const reportStats = ref<ReportStats>({
  financial: 45,
  financialRecent: 8,
  operational: 32,
  operationalRecent: 5,
  compliance: 28,
  complianceRecent: 3,
  member: 41,
  memberRecent: 7,
})

const reports = ref<Report[]>([
  {
    id: 'RPT-2024-001',
    title: 'Laporan Keuangan Januari 2024',
    description: 'Neraca, rugi laba, dan arus kas periode Januari 2024',
    category: 'financial',
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    created_by: 'Admin Keuangan',
    creator_role: 'Financial Manager',
    created_at: '2024-02-05T10:30:00',
    status: 'published',
    format: 'pdf',
    file_size: 2548000,
    file_path: '/reports/financial/2024-01.pdf',
  },
  {
    id: 'RPT-2024-002',
    title: 'Laporan Operasional Q1 2024',
    description: 'Laporan operasional koperasi kuartal pertama 2024',
    category: 'operational',
    period_start: '2024-01-01',
    period_end: '2024-03-31',
    created_by: 'Supervisor Ops',
    creator_role: 'Operations Manager',
    created_at: '2024-04-02T14:15:00',
    status: 'published',
    format: 'excel',
    file_size: 1876000,
    file_path: '/reports/operational/2024-q1.xlsx',
  },
  {
    id: 'RPT-2024-003',
    title: 'Compliance Report Permenkop',
    description: 'Laporan kepatuhan sesuai Permenkop No.8/2023',
    category: 'compliance',
    period_start: '2024-01-01',
    period_end: '2024-03-31',
    created_by: 'Compliance Officer',
    creator_role: 'Compliance Manager',
    created_at: '2024-04-05T09:45:00',
    status: 'published',
    format: 'pdf',
    file_size: 3456000,
    file_path: '/reports/compliance/permenkop-2024-q1.pdf',
  },
  {
    id: 'RPT-2024-004',
    title: 'Member Growth Analysis',
    description: 'Analisis pertumbuhan dan profil anggota',
    category: 'member',
    period_start: '2024-01-01',
    period_end: '2024-03-31',
    created_by: 'Data Analyst',
    creator_role: 'Business Analyst',
    created_at: '2024-04-03T11:20:00',
    status: 'published',
    format: 'csv',
    file_size: 892000,
    file_path: '/reports/member/growth-2024-q1.csv',
  },
])

// Computed properties
const filteredReports = computed(() => {
  let filtered = reports.value

  // Search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (report) =>
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        report.created_by.toLowerCase().includes(query) ||
        report.category.toLowerCase().includes(query),
    )
  }

  // Category filter
  if (filters.value.category) {
    filtered = filtered.filter((report) => report.category === filters.value.category)
  }

  // Date filters
  if (filters.value.dateFrom) {
    filtered = filtered.filter((report) => report.created_at >= filters.value.dateFrom)
  }
  if (filters.value.dateTo) {
    filtered = filtered.filter((report) => report.created_at <= filters.value.dateTo)
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter((report) => report.status === filters.value.status)
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredReports.value.length / itemsPerPage.value)
})

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredReports.value.slice(start, end)
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
async function refreshReports() {
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

function resetFilters() {
  filters.value = {
    category: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  }
  searchQuery.value = ''
  applyFilters()
}

function toggleSelectAll() {
  if (selectedReports.value.length === filteredReports.value.length) {
    selectedReports.value = []
  } else {
    selectedReports.value = filteredReports.value.map((r) => r.id)
  }
}

function previewReport(report: Report) {
  selectedReport.value = report
  const modalElement = document.getElementById('reportPreviewModal')
  if (modalElement && window.bootstrap) {
    const modal = new window.bootstrap.Modal(modalElement)
    modal.show()
  }
}

function downloadReport(report: Report) {
  // Mock download
  console.log('Downloading report:', report.title)

  // Create mock download link
  const link = document.createElement('a')
  link.href = '#' // Would be actual file URL
  link.download = `${report.title}.${report.format}`
  link.click()
}

function shareReport(report: Report) {
  // Mock share functionality
  console.log('Sharing report:', report.title)
}

function bulkExport() {
  console.log('Bulk exporting reports:', selectedReports.value)
}

function canPreview(format: string): boolean {
  return ['pdf'].includes(format)
}

// Utility methods
function getReportIcon(category: string): string {
  const icons = {
    financial: 'fas fa-chart-line',
    operational: 'fas fa-cogs',
    compliance: 'fas fa-shield-alt',
    member: 'fas fa-users',
    risk: 'fas fa-exclamation-triangle',
  }
  return icons[category as keyof typeof icons] || 'fas fa-file'
}

function getReportColor(category: string): string {
  const colors = {
    financial: '#007bff',
    operational: '#28a745',
    compliance: '#ffc107',
    member: '#17a2b8',
    risk: '#dc3545',
  }
  return colors[category as keyof typeof colors] || '#6c757d'
}

function getCategoryBadge(category: string): string {
  const badges = {
    financial: 'bg-primary',
    operational: 'bg-success',
    compliance: 'bg-warning',
    member: 'bg-info',
    risk: 'bg-danger',
  }
  return badges[category as keyof typeof badges] || 'bg-secondary'
}

function getStatusBadge(status: string): string {
  const badges = {
    published: 'bg-success',
    draft: 'bg-warning',
    archived: 'bg-secondary',
  }
  return badges[status as keyof typeof badges] || 'bg-secondary'
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

function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)

  return `${startDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`
}

function getDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 31) return `${diffDays} days`
  if (diffDays <= 93) return `${Math.round(diffDays / 30)} months`
  return `${Math.round(diffDays / 365)} year`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  // Set default date range to last 3 months
  const today = new Date()
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())

  filters.value.dateFrom = threeMonthsAgo.toISOString().split('T')[0]
  filters.value.dateTo = today.toISOString().split('T')[0]
})
</script>

<style scoped>
.bg-opacity-10 {
  --bs-bg-opacity: 0.1;
}

.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
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

.badge {
  font-size: 0.75em;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

/* Grid view styling */
.card-footer {
  padding: 0.75rem;
}

.flex-fill {
  flex: 1 1 auto;
}

/* Modal styling */
.modal-xl {
  max-width: 90%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .btn-group-sm > .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }

  .modal-xl {
    max-width: 95%;
  }
}
</style>

<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-file-contract me-2"></i>
              Laporan Regulasi
            </h2>
            <p class="text-muted mb-0">
              Laporan kepatuhan sesuai Permenkop No.8/2023 dan peraturan terkait
            </p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" @click="scheduleReport">
              <i class="fas fa-clock"></i>
              Jadwal Otomatis
            </button>
            <button class="btn btn-outline-success" @click="refreshReports" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-primary bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-file-alt fa-2x text-primary"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Total Laporan</h6>
            <h3 class="mb-0">{{ stats.totalReports }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-success bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-check-circle fa-2x text-success"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Laporan Selesai</h6>
            <h3 class="mb-0">{{ stats.completedReports }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-warning bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Menunggu Review</h6>
            <h3 class="mb-0">{{ stats.pendingReports }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-2">
              <div class="bg-info bg-opacity-10 rounded-circle p-3">
                <i class="fas fa-calendar fa-2x text-info"></i>
              </div>
            </div>
            <h6 class="text-muted mb-1">Deadline Terdekat</h6>
            <h3 class="mb-0">{{ stats.upcomingDeadlines }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Report Templates -->
      <div class="col-md-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">Template Laporan</h5>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div
                v-for="template in reportTemplates"
                :key="template.id"
                class="list-group-item list-group-item-action"
                @click="selectTemplate(template)"
                style="cursor: pointer"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ template.name }}</h6>
                    <p class="mb-1 text-muted small">{{ template.description }}</p>
                    <small class="text-muted">Periode: {{ template.frequency }}</small>
                  </div>
                  <div class="text-end">
                    <span class="badge" :class="getTemplateBadgeClass(template.status)">
                      {{ template.status }}
                    </span>
                    <br />
                    <small class="text-muted">{{ template.nextDue }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Generation -->
      <div class="col-md-8">
        <div v-if="!selectedTemplate" class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="fas fa-file-plus fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Pilih Template Laporan</h5>
            <p class="text-muted">Pilih template dari daftar untuk membuat laporan regulasi</p>
          </div>
        </div>

        <div v-else class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">{{ selectedTemplate.name }}</h5>
              <div class="d-flex gap-2">
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="previewReport"
                  :disabled="generating"
                >
                  <i class="fas fa-eye"></i>
                  Preview
                </button>
                <button
                  class="btn btn-sm btn-primary"
                  @click="generateReport"
                  :disabled="generating"
                >
                  <span v-if="generating" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-file-download me-2"></i>
                  {{ generating ? 'Generating...' : 'Generate' }}
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <!-- Report Configuration -->
            <form @submit.prevent="generateReport">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Periode Mulai</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="reportConfig.startDate"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Periode Akhir</label>
                  <input type="date" class="form-control" v-model="reportConfig.endDate" required />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Format Output</label>
                  <select class="form-select" v-model="reportConfig.format" required>
                    <option value="">Pilih Format</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Bahasa</label>
                  <select class="form-select" v-model="reportConfig.language" required>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <!-- Template-specific options -->
              <div v-if="selectedTemplate.type === 'financial'" class="mb-3">
                <label class="form-label">Opsi Laporan Keuangan</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="reportConfig.includeNotes"
                    id="includeNotes"
                  />
                  <label class="form-check-label" for="includeNotes">
                    Sertakan Catatan Atas Laporan Keuangan
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="reportConfig.includeComparison"
                    id="includeComparison"
                  />
                  <label class="form-check-label" for="includeComparison">
                    Sertakan Perbandingan Periode Sebelumnya
                  </label>
                </div>
              </div>

              <div v-if="selectedTemplate.type === 'member'" class="mb-3">
                <label class="form-label">Filter Anggota</label>
                <div class="row">
                  <div class="col-md-6">
                    <label class="form-label small">Status Keanggotaan</label>
                    <select class="form-select form-select-sm" v-model="reportConfig.memberStatus">
                      <option value="">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="suspended">Suspend</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small">Wilayah</label>
                    <select class="form-select form-select-sm" v-model="reportConfig.region">
                      <option value="">Semua Wilayah</option>
                      <option value="jakarta">Jakarta</option>
                      <option value="bandung">Bandung</option>
                      <option value="surabaya">Surabaya</option>
                    </select>
                  </div>
                </div>
              </div>

              <div v-if="selectedTemplate.type === 'loan'" class="mb-3">
                <label class="form-label">Filter Pinjaman</label>
                <div class="row">
                  <div class="col-md-4">
                    <label class="form-label small">Status Pinjaman</label>
                    <select class="form-select form-select-sm" v-model="reportConfig.loanStatus">
                      <option value="">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="paid">Lunas</option>
                      <option value="overdue">Menunggak</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small">Kategori Risiko</label>
                    <select class="form-select form-select-sm" v-model="reportConfig.riskCategory">
                      <option value="">Semua Kategori</option>
                      <option value="low">Risiko Rendah</option>
                      <option value="medium">Risiko Sedang</option>
                      <option value="high">Risiko Tinggi</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small">Minimal Amount</label>
                    <input
                      type="number"
                      class="form-control form-control-sm"
                      v-model.number="reportConfig.minAmount"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <!-- Additional Notes -->
              <div class="mb-3">
                <label class="form-label">Catatan Tambahan</label>
                <textarea
                  class="form-control"
                  rows="3"
                  v-model="reportConfig.notes"
                  placeholder="Catatan atau keterangan khusus untuk laporan..."
                ></textarea>
              </div>
            </form>

            <!-- Template Information -->
            <div class="card bg-light">
              <div class="card-body">
                <h6>Informasi Template</h6>
                <div class="row">
                  <div class="col-md-6">
                    <small class="text-muted">
                      <strong>Deskripsi:</strong> {{ selectedTemplate.description }}
                    </small>
                    <br />
                    <small class="text-muted">
                      <strong>Dasar Hukum:</strong> {{ selectedTemplate.regulation }}
                    </small>
                    <br />
                    <small class="text-muted">
                      <strong>Frekuensi:</strong> {{ selectedTemplate.frequency }}
                    </small>
                  </div>
                  <div class="col-md-6">
                    <small class="text-muted">
                      <strong>Last Generated:</strong>
                      {{ selectedTemplate.lastGenerated || 'Belum pernah' }}
                    </small>
                    <br />
                    <small class="text-muted">
                      <strong>Next Due:</strong> {{ selectedTemplate.nextDue }}
                    </small>
                    <br />
                    <small class="text-muted">
                      <strong>Auto Generate:</strong>
                      {{ selectedTemplate.autoGenerate ? 'Ya' : 'Tidak' }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Riwayat Laporan</h5>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" @click="exportHistory">
                  <i class="fas fa-download"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="recentReports.length === 0" class="text-center p-4">
              <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h6 class="text-muted">Belum Ada Laporan</h6>
              <p class="text-muted mb-0">Laporan yang telah dibuat akan muncul di sini</p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Nama Laporan</th>
                    <th>Periode</th>
                    <th>Format</th>
                    <th>Status</th>
                    <th>Generated By</th>
                    <th>Generated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="report in recentReports" :key="report.id">
                    <td>
                      <div>
                        <strong>{{ report.name }}</strong>
                        <br />
                        <small class="text-muted">{{ report.description }}</small>
                      </div>
                    </td>
                    <td>
                      {{ formatPeriod(report.startDate, report.endDate) }}
                    </td>
                    <td>
                      <span class="badge bg-secondary">{{ report.format.toUpperCase() }}</span>
                    </td>
                    <td>
                      <span class="badge" :class="getReportStatusBadge(report.status)">
                        {{ getReportStatusText(report.status) }}
                      </span>
                    </td>
                    <td>{{ report.generatedBy }}</td>
                    <td>{{ formatDateTime(report.generatedAt) }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-primary"
                          @click="downloadReport(report)"
                          :disabled="report.status !== 'completed'"
                        >
                          <i class="fas fa-download"></i>
                        </button>
                        <button
                          class="btn btn-outline-info"
                          @click="viewReport(report)"
                          :disabled="report.status !== 'completed'"
                        >
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-danger" @click="deleteReport(report)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div class="modal fade" id="scheduleModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Jadwal Laporan Otomatis</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSchedule">
              <div class="mb-3">
                <label class="form-label">Template Laporan</label>
                <select class="form-select" v-model="scheduleForm.templateId" required>
                  <option value="">Pilih Template</option>
                  <option
                    v-for="template in reportTemplates"
                    :key="template.id"
                    :value="template.id"
                  >
                    {{ template.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Frekuensi</label>
                <select class="form-select" v-model="scheduleForm.frequency" required>
                  <option value="">Pilih Frekuensi</option>
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="quarterly">Kuartalan</option>
                  <option value="yearly">Tahunan</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Mulai Tanggal</label>
                <input type="date" class="form-control" v-model="scheduleForm.startDate" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Email Penerima</label>
                <input
                  type="email"
                  class="form-control"
                  v-model="scheduleForm.email"
                  placeholder="admin@koperasi.com"
                  required
                />
              </div>

              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="scheduleForm.autoGenerate"
                  id="autoGenerate"
                />
                <label class="form-check-label" for="autoGenerate">
                  Generate dan kirim otomatis
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveSchedule">
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
declare global {
  interface Window {
    bootstrap: {
      Modal: {
        new (element: Element): { show(): void; hide(): void }
        getInstance(element: Element | null): { hide(): void } | null
      }
    }
  }
}

interface ReportTemplate {
  id: number
  name: string
  description: string
  type: string
  frequency: string
  regulation: string
  status: string
  nextDue: string
  lastGenerated?: string
  autoGenerate: boolean
}

interface ReportConfig {
  startDate: string
  endDate: string
  format: string
  language: string
  includeNotes: boolean
  includeComparison: boolean
  memberStatus: string
  region: string
  loanStatus: string
  riskCategory: string
  minAmount: number
  notes: string
}

interface RecentReport {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  format: string
  status: string
  generatedBy: string
  generatedAt: string
  filePath?: string
}

interface ScheduleForm {
  templateId: number
  frequency: string
  startDate: string
  email: string
  autoGenerate: boolean
}

export default {
  name: 'RegulatoryReportsView',
  data() {
    return {
      loading: false,
      generating: false,
      selectedTemplate: null as ReportTemplate | null,

      stats: {
        totalReports: 24,
        completedReports: 20,
        pendingReports: 3,
        upcomingDeadlines: 2,
      },

      reportTemplates: [
        {
          id: 1,
          name: 'Laporan Keuangan Bulanan',
          description: 'Neraca, R/L, dan Arus Kas sesuai SAK-ETAP',
          type: 'financial',
          frequency: 'Bulanan',
          regulation: 'Permenkop No.8/2023',
          status: 'Active',
          nextDue: '2024-02-01',
          lastGenerated: '2024-01-01',
          autoGenerate: true,
        },
        {
          id: 2,
          name: 'Laporan Anggota dan Simpanan',
          description: 'Data keanggotaan dan perkembangan simpanan',
          type: 'member',
          frequency: 'Bulanan',
          regulation: 'UU No.25/1992',
          status: 'Active',
          nextDue: '2024-02-01',
          lastGenerated: '2024-01-01',
          autoGenerate: true,
        },
        {
          id: 3,
          name: 'Laporan Pinjaman dan NPL',
          description: 'Portofolio pinjaman dan analisis risiko kredit',
          type: 'loan',
          frequency: 'Bulanan',
          regulation: 'Permenkop No.8/2023',
          status: 'Active',
          nextDue: '2024-02-01',
          lastGenerated: '2024-01-01',
          autoGenerate: true,
        },
        {
          id: 4,
          name: 'Laporan RAT Tahunan',
          description: 'Laporan lengkap untuk Rapat Anggota Tahunan',
          type: 'annual',
          frequency: 'Tahunan',
          regulation: 'UU No.25/1992 Pasal 23',
          status: 'Active',
          nextDue: '2024-12-31',
          lastGenerated: '2023-12-31',
          autoGenerate: false,
        },
        {
          id: 5,
          name: 'Laporan Pengawasan Internal',
          description: 'Laporan hasil pengawasan internal koperasi',
          type: 'audit',
          frequency: 'Kuartalan',
          regulation: 'Permenkop No.8/2023',
          status: 'Active',
          nextDue: '2024-03-31',
          lastGenerated: '2023-12-31',
          autoGenerate: false,
        },
        {
          id: 6,
          name: 'Laporan Kepatuhan Regulasi',
          description: 'Laporan kepatuhan terhadap peraturan koperasi',
          type: 'compliance',
          frequency: 'Kuartalan',
          regulation: 'Permenkop No.8/2023',
          status: 'Active',
          nextDue: '2024-03-31',
          autoGenerate: false,
        },
      ] as ReportTemplate[],

      reportConfig: {
        startDate: '',
        endDate: '',
        format: 'pdf',
        language: 'id',
        includeNotes: true,
        includeComparison: false,
        memberStatus: '',
        region: '',
        loanStatus: '',
        riskCategory: '',
        minAmount: 0,
        notes: '',
      } as ReportConfig,

      recentReports: [
        {
          id: 1,
          name: 'Laporan Keuangan Desember 2023',
          description: 'Laporan keuangan bulanan',
          startDate: '2023-12-01',
          endDate: '2023-12-31',
          format: 'pdf',
          status: 'completed',
          generatedBy: 'Admin User',
          generatedAt: '2024-01-05T09:30:00',
        },
        {
          id: 2,
          name: 'Laporan Anggota Q4 2023',
          description: 'Laporan perkembangan anggota kuartal 4',
          startDate: '2023-10-01',
          endDate: '2023-12-31',
          format: 'excel',
          status: 'completed',
          generatedBy: 'Admin User',
          generatedAt: '2024-01-03T14:15:00',
        },
        {
          id: 3,
          name: 'Laporan NPL Januari 2024',
          description: 'Analisis Non Performing Loan',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: 'pdf',
          status: 'generating',
          generatedBy: 'System Auto',
          generatedAt: '2024-02-01T08:00:00',
        },
      ] as RecentReport[],

      scheduleForm: {
        templateId: 0,
        frequency: '',
        startDate: '',
        email: '',
        autoGenerate: true,
      } as ScheduleForm,
    }
  },

  mounted() {
    this.setDefaultDates()
    this.refreshReports()
  },

  methods: {
    setDefaultDates() {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      this.reportConfig.startDate = firstDay.toISOString().split('T')[0]
      this.reportConfig.endDate = lastDay.toISOString().split('T')[0]
    },

    async refreshReports() {
      this.loading = true
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // In real implementation, this would fetch latest data
      } catch (error) {
        console.error('Error refreshing reports:', error)
        this.$toast?.error('Gagal memperbarui data laporan')
      } finally {
        this.loading = false
      }
    },

    selectTemplate(template: ReportTemplate) {
      this.selectedTemplate = template
      this.setDefaultDates()

      // Set default config based on template type
      if (template.frequency === 'Bulanan') {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)

        this.reportConfig.startDate = firstDay.toISOString().split('T')[0]
        this.reportConfig.endDate = lastDay.toISOString().split('T')[0]
      }
    },

    async generateReport() {
      if (!this.selectedTemplate) return

      this.generating = true
      try {
        // Mock API call for report generation
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Add new report to recent reports
        const newReport: RecentReport = {
          id: Date.now(),
          name: `${this.selectedTemplate.name} - ${this.formatPeriod(this.reportConfig.startDate, this.reportConfig.endDate)}`,
          description: this.selectedTemplate.description,
          startDate: this.reportConfig.startDate,
          endDate: this.reportConfig.endDate,
          format: this.reportConfig.format,
          status: 'completed',
          generatedBy: 'Current User',
          generatedAt: new Date().toISOString(),
        }

        this.recentReports.unshift(newReport)

        // Update stats
        this.stats.totalReports++
        this.stats.completedReports++

        this.$toast?.success('Laporan berhasil dibuat')

        // Auto download
        this.downloadReport(newReport)
      } catch (error) {
        console.error('Error generating report:', error)
        this.$toast?.error('Gagal membuat laporan')
      } finally {
        this.generating = false
      }
    },

    previewReport() {
      if (!this.selectedTemplate) return
      this.$toast?.info('Membuka preview laporan...')
      // In real implementation, this would open a preview modal or new tab
    },

    downloadReport(report: RecentReport) {
      // Mock download
      this.$toast?.success(`Mengunduh ${report.name}...`)

      // In real implementation, this would trigger actual file download
      const link = document.createElement('a')
      link.href = '#' // Would be actual file URL
      link.download = `${report.name}.${report.format}`
      link.click()
    },

    viewReport(report: RecentReport) {
      this.$toast?.info(`Membuka ${report.name}...`)
      // In real implementation, this would open report viewer
    },

    deleteReport(report: RecentReport) {
      if (confirm(`Apakah Anda yakin ingin menghapus laporan "${report.name}"?`)) {
        const index = this.recentReports.findIndex((r) => r.id === report.id)
        if (index > -1) {
          this.recentReports.splice(index, 1)
          this.stats.totalReports--
          if (report.status === 'completed') {
            this.stats.completedReports--
          }
          this.$toast?.success('Laporan berhasil dihapus')
        }
      }
    },

    scheduleReport() {
      // Show schedule modal
      const modalElement = document.getElementById('scheduleModal')
      if (modalElement) {
        const bootstrapModal = window.bootstrap?.Modal
        if (bootstrapModal) {
          const modal = new bootstrapModal(modalElement)
          modal.show()
        }
      }
    },

    async saveSchedule() {
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Find template and update auto generate status
        const template = this.reportTemplates.find((t) => t.id === this.scheduleForm.templateId)
        if (template) {
          template.autoGenerate = this.scheduleForm.autoGenerate
        }

        this.$toast?.success('Jadwal laporan berhasil disimpan')

        // Close modal
        const modalElement = document.getElementById('scheduleModal')
        if (modalElement) {
          const bootstrapModal = window.bootstrap?.Modal
          if (bootstrapModal) {
            const modal = bootstrapModal.getInstance(modalElement)
            modal?.hide()
          }
        }

        // Reset form
        this.scheduleForm = {
          templateId: 0,
          frequency: '',
          startDate: '',
          email: '',
          autoGenerate: true,
        }
      } catch (error) {
        console.error('Error saving schedule:', error)
        this.$toast?.error('Gagal menyimpan jadwal')
      }
    },

    exportHistory() {
      this.$toast?.info('Mengexport riwayat laporan...')
      // In real implementation, this would export report history
    },

    // Utility methods
    getTemplateBadgeClass(status: string): string {
      const classes = {
        Active: 'bg-success',
        Inactive: 'bg-secondary',
        Pending: 'bg-warning',
      }
      return classes[status as keyof typeof classes] || 'bg-secondary'
    },

    getReportStatusBadge(status: string): string {
      const classes = {
        completed: 'bg-success',
        generating: 'bg-warning',
        failed: 'bg-danger',
        pending: 'bg-info',
      }
      return classes[status as keyof typeof classes] || 'bg-secondary'
    },

    getReportStatusText(status: string): string {
      const texts = {
        completed: 'Selesai',
        generating: 'Generating',
        failed: 'Gagal',
        pending: 'Pending',
      }
      return texts[status as keyof typeof texts] || status
    },

    formatPeriod(startDate: string, endDate: string): string {
      if (!startDate || !endDate) return ''

      const start = new Date(startDate)
      const end = new Date(endDate)

      const startStr = start.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      const endStr = end.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

      return `${startStr} - ${endStr}`
    },

    formatDateTime(dateTimeString: string): string {
      if (!dateTimeString) return ''
      return new Date(dateTimeString).toLocaleString('id-ID')
    },
  },
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

.list-group-item:hover {
  background-color: #f8f9fa;
}

.bg-opacity-10 {
  --bs-bg-opacity: 0.1;
}

.badge {
  font-size: 0.75em;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.table th {
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
}

/* Custom responsive table */
@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }

  .btn-group-sm > .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }
}
</style>

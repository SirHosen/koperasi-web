<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="h3 mb-0">Verifikasi Calon Anggota</h2>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary" @click="refreshData" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Menunggu Verifikasi</h6>
                <h3 class="mb-0 text-warning">{{ stats.pending }}</h3>
              </div>
              <div class="bg-warning bg-opacity-10 p-3 rounded">
                <i class="fas fa-clock text-warning"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Disetujui</h6>
                <h3 class="mb-0 text-success">{{ stats.approved }}</h3>
              </div>
              <div class="bg-success bg-opacity-10 p-3 rounded">
                <i class="fas fa-check text-success"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Ditolak</h6>
                <h3 class="mb-0 text-danger">{{ stats.rejected }}</h3>
              </div>
              <div class="bg-danger bg-opacity-10 p-3 rounded">
                <i class="fas fa-times text-danger"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Total Aplikasi</h6>
                <h3 class="mb-0 text-primary">{{ stats.total }}</h3>
              </div>
              <div class="bg-primary bg-opacity-10 p-3 rounded">
                <i class="fas fa-users text-primary"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Status</label>
            <select class="form-select" v-model="filters.status" @change="filterApplications">
              <option value="">Semua Status</option>
              <option value="pending">Menunggu Verifikasi</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Tanggal Daftar</label>
            <input
              type="date"
              class="form-control"
              v-model="filters.dateFrom"
              @change="filterApplications"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Sampai Tanggal</label>
            <input
              type="date"
              class="form-control"
              v-model="filters.dateTo"
              @change="filterApplications"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Pencarian</label>
            <input
              type="text"
              class="form-control"
              placeholder="Nama, NIK, atau Email"
              v-model="filters.search"
              @input="filterApplications"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Applications List -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white border-bottom">
        <h5 class="mb-0">Daftar Calon Anggota</h5>
      </div>
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center p-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data...</p>
        </div>

        <!-- No Data State -->
        <div v-else-if="filteredApplications.length === 0" class="text-center p-4">
          <i class="fas fa-users fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Tidak ada calon anggota</h5>
          <p class="text-muted">
            {{
              filters.status || filters.search
                ? 'Tidak ada data yang sesuai dengan filter'
                : 'Belum ada pendaftaran anggota baru'
            }}
          </p>
        </div>

        <!-- Applications Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Tanggal Daftar</th>
                <th>Informasi Calon</th>
                <th>Dokumen</th>
                <th>Status</th>
                <th>Verifikator</th>
                <th width="120">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="application in paginatedApplications" :key="application.id">
                <td>
                  <small class="text-muted">{{ formatDate(application.tanggal_daftar) }}</small>
                </td>
                <td>
                  <div>
                    <strong>{{ application.nama_lengkap }}</strong>
                    <br />
                    <small class="text-muted">
                      NIK: {{ application.nik }}<br />
                      {{ application.email }}<br />
                      {{ application.no_hp }}
                    </small>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span
                      v-for="doc in application.documents"
                      :key="doc.type"
                      class="badge"
                      :class="doc.uploaded ? 'bg-success' : 'bg-danger'"
                    >
                      {{ doc.name }}
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="{
                      'bg-warning': application.status === 'pending',
                      'bg-success': application.status === 'approved',
                      'bg-danger': application.status === 'rejected',
                    }"
                  >
                    {{ getStatusText(application.status) }}
                  </span>
                </td>
                <td>
                  <small class="text-muted">
                    {{ application.verified_by || '-' }}
                    <br v-if="application.verified_at" />
                    {{ application.verified_at ? formatDate(application.verified_at) : '' }}
                  </small>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-primary"
                      @click="viewApplication(application)"
                      title="Lihat Detail"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      v-if="application.status === 'pending'"
                      class="btn btn-outline-success"
                      @click="approveApplication(application)"
                      title="Setujui"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      v-if="application.status === 'pending'"
                      class="btn btn-outline-danger"
                      @click="rejectApplication(application)"
                      title="Tolak"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="card-footer bg-white">
          <nav>
            <ul class="pagination justify-content-center mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                  <i class="fas fa-angle-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="fas fa-angle-left"></i>
                </button>
              </li>
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="currentPage = page">
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  class="page-link"
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                >
                  <i class="fas fa-angle-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  class="page-link"
                  @click="currentPage = totalPages"
                  :disabled="currentPage === totalPages"
                >
                  <i class="fas fa-angle-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- View Application Modal -->
    <div class="modal fade" id="viewApplicationModal" tabindex="-1" ref="viewApplicationModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detail Calon Anggota</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedApplication">
              <!-- Personal Information -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2 mb-3">Informasi Personal</h6>
                </div>
                <div class="col-md-6">
                  <dl class="row">
                    <dt class="col-sm-4">Nama Lengkap</dt>
                    <dd class="col-sm-8">{{ selectedApplication.nama_lengkap }}</dd>
                    <dt class="col-sm-4">NIK</dt>
                    <dd class="col-sm-8">{{ selectedApplication.nik }}</dd>
                    <dt class="col-sm-4">Tempat Lahir</dt>
                    <dd class="col-sm-8">{{ selectedApplication.tempat_lahir }}</dd>
                    <dt class="col-sm-4">Tanggal Lahir</dt>
                    <dd class="col-sm-8">{{ formatDate(selectedApplication.tanggal_lahir) }}</dd>
                  </dl>
                </div>
                <div class="col-md-6">
                  <dl class="row">
                    <dt class="col-sm-4">Email</dt>
                    <dd class="col-sm-8">{{ selectedApplication.email }}</dd>
                    <dt class="col-sm-4">No. HP</dt>
                    <dd class="col-sm-8">{{ selectedApplication.no_hp }}</dd>
                    <dt class="col-sm-4">Jenis Kelamin</dt>
                    <dd class="col-sm-8">
                      {{ selectedApplication.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' }}
                    </dd>
                    <dt class="col-sm-4">Agama</dt>
                    <dd class="col-sm-8">{{ selectedApplication.agama }}</dd>
                  </dl>
                </div>
              </div>

              <!-- Address Information -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2 mb-3">Alamat</h6>
                </div>
                <div class="col-12">
                  <dl class="row">
                    <dt class="col-sm-2">Alamat</dt>
                    <dd class="col-sm-10">{{ selectedApplication.alamat }}</dd>
                    <dt class="col-sm-2">Kelurahan</dt>
                    <dd class="col-sm-4">{{ selectedApplication.kelurahan }}</dd>
                    <dt class="col-sm-2">Kecamatan</dt>
                    <dd class="col-sm-4">{{ selectedApplication.kecamatan }}</dd>
                    <dt class="col-sm-2">Kota</dt>
                    <dd class="col-sm-4">{{ selectedApplication.kota }}</dd>
                    <dt class="col-sm-2">Provinsi</dt>
                    <dd class="col-sm-4">{{ selectedApplication.provinsi }}</dd>
                  </dl>
                </div>
              </div>

              <!-- Work Information -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2 mb-3">Informasi Pekerjaan</h6>
                </div>
                <div class="col-md-6">
                  <dl class="row">
                    <dt class="col-sm-4">Pekerjaan</dt>
                    <dd class="col-sm-8">{{ selectedApplication.pekerjaan }}</dd>
                    <dt class="col-sm-4">Penghasilan</dt>
                    <dd class="col-sm-8">
                      Rp {{ formatCurrency(selectedApplication.penghasilan) }}
                    </dd>
                  </dl>
                </div>
                <div class="col-md-6">
                  <dl class="row">
                    <dt class="col-sm-4">Nama Perusahaan</dt>
                    <dd class="col-sm-8">{{ selectedApplication.nama_perusahaan || '-' }}</dd>
                    <dt class="col-sm-4">Alamat Perusahaan</dt>
                    <dd class="col-sm-8">{{ selectedApplication.alamat_perusahaan || '-' }}</dd>
                  </dl>
                </div>
              </div>

              <!-- Documents -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2 mb-3">Dokumen</h6>
                </div>
                <div class="col-12">
                  <div class="row g-3">
                    <div
                      v-for="doc in selectedApplication.documents"
                      :key="doc.type"
                      class="col-md-6"
                    >
                      <div class="card border">
                        <div class="card-body">
                          <div class="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 class="card-title mb-1">{{ doc.name }}</h6>
                              <span
                                class="badge"
                                :class="doc.uploaded ? 'bg-success' : 'bg-danger'"
                              >
                                {{ doc.uploaded ? 'Terupload' : 'Belum Upload' }}
                              </span>
                            </div>
                            <button
                              v-if="doc.uploaded"
                              class="btn btn-outline-primary btn-sm"
                              @click="viewDocument(doc)"
                            >
                              <i class="fas fa-eye"></i> Lihat
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Verification History -->
              <div
                v-if="
                  selectedApplication.verification_history &&
                  selectedApplication.verification_history.length > 0
                "
                class="row"
              >
                <div class="col-12">
                  <h6 class="border-bottom pb-2 mb-3">Riwayat Verifikasi</h6>
                  <div class="timeline">
                    <div
                      v-for="history in selectedApplication.verification_history"
                      :key="history.id"
                      class="timeline-item"
                    >
                      <div
                        class="timeline-marker"
                        :class="{
                          'bg-success': history.status === 'approved',
                          'bg-danger': history.status === 'rejected',
                          'bg-warning': history.status === 'pending',
                        }"
                      ></div>
                      <div class="timeline-content">
                        <h6 class="mb-1">{{ getStatusText(history.status) }}</h6>
                        <p class="mb-1">{{ history.notes }}</p>
                        <small class="text-muted">
                          {{ history.verified_by }} - {{ formatDate(history.created_at) }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            <button
              v-if="selectedApplication && selectedApplication.status === 'pending'"
              type="button"
              class="btn btn-success"
              @click="approveApplication(selectedApplication)"
            >
              <i class="fas fa-check"></i> Setujui
            </button>
            <button
              v-if="selectedApplication && selectedApplication.status === 'pending'"
              type="button"
              class="btn btn-danger"
              @click="rejectApplication(selectedApplication)"
            >
              <i class="fas fa-times"></i> Tolak
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval Modal -->
    <div class="modal fade" id="approvalModal" tabindex="-1" ref="approvalModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Setujui Calon Anggota</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedApplication">
              <p class="mb-3">Apakah Anda yakin ingin menyetujui pendaftaran anggota baru:</p>
              <div class="alert alert-info">
                <strong>{{ selectedApplication.nama_lengkap }}</strong
                ><br />
                NIK: {{ selectedApplication.nik }}<br />
                Email: {{ selectedApplication.email }}
              </div>
              <div class="mb-3">
                <label class="form-label">Catatan Persetujuan</label>
                <textarea
                  class="form-control"
                  v-model="approvalForm.notes"
                  rows="3"
                  placeholder="Catatan opsional untuk persetujuan..."
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button
              type="button"
              class="btn btn-success"
              @click="confirmApproval"
              :disabled="processing"
            >
              <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-check me-2"></i>
              {{ processing ? 'Memproses...' : 'Ya, Setujui' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div class="modal fade" id="rejectionModal" tabindex="-1" ref="rejectionModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tolak Calon Anggota</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedApplication">
              <p class="mb-3">Apakah Anda yakin ingin menolak pendaftaran anggota baru:</p>
              <div class="alert alert-warning">
                <strong>{{ selectedApplication.nama_lengkap }}</strong
                ><br />
                NIK: {{ selectedApplication.nik }}<br />
                Email: {{ selectedApplication.email }}
              </div>
              <div class="mb-3">
                <label class="form-label"
                  >Alasan Penolakan <span class="text-danger">*</span></label
                >
                <textarea
                  class="form-control"
                  v-model="rejectionForm.notes"
                  rows="3"
                  placeholder="Jelaskan alasan penolakan..."
                  :class="{ 'is-invalid': rejectionForm.submitted && !rejectionForm.notes }"
                ></textarea>
                <div
                  v-if="rejectionForm.submitted && !rejectionForm.notes"
                  class="invalid-feedback"
                >
                  Alasan penolakan harus diisi
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="confirmRejection"
              :disabled="processing"
            >
              <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-times me-2"></i>
              {{ processing ? 'Memproses...' : 'Ya, Tolak' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Modal } from 'bootstrap'

export default {
  name: 'VerifikasiAnggotaView',
  data() {
    return {
      loading: false,
      processing: false,
      applications: [],
      filteredApplications: [],
      selectedApplication: null,
      currentPage: 1,
      itemsPerPage: 10,

      // Modals
      viewApplicationModal: null,
      approvalModal: null,
      rejectionModal: null,

      // Stats
      stats: {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      },

      // Filters
      filters: {
        status: '',
        dateFrom: '',
        dateTo: '',
        search: '',
      },

      // Forms
      approvalForm: {
        notes: '',
      },
      rejectionForm: {
        notes: '',
        submitted: false,
      },
    }
  },

  computed: {
    paginatedApplications() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredApplications.slice(start, end)
    },

    totalPages() {
      return Math.ceil(this.filteredApplications.length / this.itemsPerPage)
    },

    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    },
  },

  async mounted() {
    await this.loadApplications()
    this.initializeModals()
  },

  methods: {
    initializeModals() {
      this.viewApplicationModal = new Modal(this.$refs.viewApplicationModal)
      this.approvalModal = new Modal(this.$refs.approvalModal)
      this.rejectionModal = new Modal(this.$refs.rejectionModal)
    },

    async loadApplications() {
      this.loading = true
      try {
        // Mock data - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.applications = [
          {
            id: 1,
            nama_lengkap: 'John Doe',
            nik: '3201234567890123',
            email: 'john.doe@email.com',
            no_hp: '081234567890',
            tempat_lahir: 'Jakarta',
            tanggal_lahir: '1990-01-15',
            jenis_kelamin: 'L',
            agama: 'Islam',
            alamat: 'Jl. Merdeka No. 123',
            kelurahan: 'Menteng',
            kecamatan: 'Menteng',
            kota: 'Jakarta Pusat',
            provinsi: 'DKI Jakarta',
            pekerjaan: 'Pegawai Swasta',
            penghasilan: 5000000,
            nama_perusahaan: 'PT ABC',
            alamat_perusahaan: 'Jl. Sudirman No. 456',
            tanggal_daftar: '2024-01-15',
            status: 'pending',
            verified_by: null,
            verified_at: null,
            documents: [
              { type: 'ktp', name: 'KTP', uploaded: true },
              { type: 'kk', name: 'Kartu Keluarga', uploaded: true },
              { type: 'slip_gaji', name: 'Slip Gaji', uploaded: false },
              { type: 'foto', name: 'Pas Foto', uploaded: true },
            ],
            verification_history: [],
          },
          {
            id: 2,
            nama_lengkap: 'Jane Smith',
            nik: '3201234567890124',
            email: 'jane.smith@email.com',
            no_hp: '081234567891',
            tempat_lahir: 'Bandung',
            tanggal_lahir: '1985-03-20',
            jenis_kelamin: 'P',
            agama: 'Kristen',
            alamat: 'Jl. Pahlawan No. 789',
            kelurahan: 'Coblong',
            kecamatan: 'Coblong',
            kota: 'Bandung',
            provinsi: 'Jawa Barat',
            pekerjaan: 'Guru',
            penghasilan: 4000000,
            nama_perusahaan: 'SMA Negeri 1',
            alamat_perusahaan: 'Jl. Pendidikan No. 123',
            tanggal_daftar: '2024-01-10',
            status: 'approved',
            verified_by: 'Admin System',
            verified_at: '2024-01-12',
            documents: [
              { type: 'ktp', name: 'KTP', uploaded: true },
              { type: 'kk', name: 'Kartu Keluarga', uploaded: true },
              { type: 'slip_gaji', name: 'Slip Gaji', uploaded: true },
              { type: 'foto', name: 'Pas Foto', uploaded: true },
            ],
            verification_history: [
              {
                id: 1,
                status: 'approved',
                notes: 'Semua dokumen lengkap dan valid',
                verified_by: 'Admin System',
                created_at: '2024-01-12',
              },
            ],
          },
        ]

        this.filterApplications()
        this.calculateStats()
      } catch (error) {
        console.error('Error loading applications:', error)
        this.$toast?.error('Gagal memuat data aplikasi')
      } finally {
        this.loading = false
      }
    },

    filterApplications() {
      let filtered = [...this.applications]

      // Filter by status
      if (this.filters.status) {
        filtered = filtered.filter((app) => app.status === this.filters.status)
      }

      // Filter by date range
      if (this.filters.dateFrom) {
        filtered = filtered.filter((app) => app.tanggal_daftar >= this.filters.dateFrom)
      }

      if (this.filters.dateTo) {
        filtered = filtered.filter((app) => app.tanggal_daftar <= this.filters.dateTo)
      }

      // Filter by search
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        filtered = filtered.filter(
          (app) =>
            app.nama_lengkap.toLowerCase().includes(search) ||
            app.nik.includes(search) ||
            app.email.toLowerCase().includes(search),
        )
      }

      this.filteredApplications = filtered
      this.currentPage = 1
    },

    calculateStats() {
      this.stats = {
        pending: this.applications.filter((app) => app.status === 'pending').length,
        approved: this.applications.filter((app) => app.status === 'approved').length,
        rejected: this.applications.filter((app) => app.status === 'rejected').length,
        total: this.applications.length,
      }
    },

    async refreshData() {
      await this.loadApplications()
    },

    viewApplication(application) {
      this.selectedApplication = application
      this.viewApplicationModal.show()
    },

    approveApplication(application) {
      this.selectedApplication = application
      this.approvalForm.notes = ''
      this.approvalModal.show()
    },

    rejectApplication(application) {
      this.selectedApplication = application
      this.rejectionForm.notes = ''
      this.rejectionForm.submitted = false
      this.rejectionModal.show()
    },

    async confirmApproval() {
      this.processing = true
      try {
        // Mock API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Update application status
        const appIndex = this.applications.findIndex(
          (app) => app.id === this.selectedApplication.id,
        )
        if (appIndex !== -1) {
          this.applications[appIndex].status = 'approved'
          this.applications[appIndex].verified_by = 'Admin System'
          this.applications[appIndex].verified_at = new Date().toISOString().split('T')[0]

          // Add to verification history
          this.applications[appIndex].verification_history.push({
            id: Date.now(),
            status: 'approved',
            notes: this.approvalForm.notes || 'Aplikasi disetujui',
            verified_by: 'Admin System',
            created_at: new Date().toISOString().split('T')[0],
          })
        }

        this.filterApplications()
        this.calculateStats()

        this.approvalModal.hide()
        this.viewApplicationModal?.hide()
        this.$toast?.success('Aplikasi berhasil disetujui')
      } catch (error) {
        console.error('Error approving application:', error)
        this.$toast?.error('Gagal menyetujui aplikasi')
      } finally {
        this.processing = false
      }
    },

    async confirmRejection() {
      this.rejectionForm.submitted = true

      if (!this.rejectionForm.notes) {
        return
      }

      this.processing = true
      try {
        // Mock API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Update application status
        const appIndex = this.applications.findIndex(
          (app) => app.id === this.selectedApplication.id,
        )
        if (appIndex !== -1) {
          this.applications[appIndex].status = 'rejected'
          this.applications[appIndex].verified_by = 'Admin System'
          this.applications[appIndex].verified_at = new Date().toISOString().split('T')[0]

          // Add to verification history
          this.applications[appIndex].verification_history.push({
            id: Date.now(),
            status: 'rejected',
            notes: this.rejectionForm.notes,
            verified_by: 'Admin System',
            created_at: new Date().toISOString().split('T')[0],
          })
        }

        this.filterApplications()
        this.calculateStats()

        this.rejectionModal.hide()
        this.viewApplicationModal?.hide()
        this.$toast?.success('Aplikasi berhasil ditolak')
      } catch (error) {
        console.error('Error rejecting application:', error)
        this.$toast?.error('Gagal menolak aplikasi')
      } finally {
        this.processing = false
      }
    },

    viewDocument(doc) {
      // Mock document viewing - replace with actual implementation
      window.open(`/api/documents/${doc.type}`, '_blank')
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },

    formatCurrency(amount) {
      if (!amount) return '0'
      return new Intl.NumberFormat('id-ID').format(amount)
    },

    getStatusText(status) {
      const statusMap = {
        pending: 'Menunggu Verifikasi',
        approved: 'Disetujui',
        rejected: 'Ditolak',
      }
      return statusMap[status] || status
    },
  },
}
</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0.25rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #dee2e6;
}

.timeline-content {
  padding-left: 0.5rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #dee2e6;
}

.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.badge {
  font-size: 0.75em;
}
</style>

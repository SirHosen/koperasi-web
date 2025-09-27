<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-list-ol me-2"></i>
              Manajemen Antrean FCFS
            </h2>
            <p class="text-muted mb-0">Monitoring dan override sistem First Come First Served</p>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-warning"
              @click="showOverrideModal = true"
              :disabled="loading || selectedItems.length === 0"
            >
              <i class="fas fa-exchange-alt"></i>
              Override Selected
            </button>
            <button class="btn btn-outline-success" @click="refreshQueue" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Queue Statistics -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white">
          <div class="card-body text-center">
            <i class="fas fa-list fa-2x mb-2"></i>
            <h4>{{ queueStats.total }}</h4>
            <small>Total Antrean</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white">
          <div class="card-body text-center">
            <i class="fas fa-clock fa-2x mb-2"></i>
            <h4>{{ queueStats.processing }}</h4>
            <small>Sedang Diproses</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark">
          <div class="card-body text-center">
            <i class="fas fa-exchange-alt fa-2x mb-2"></i>
            <h4>{{ queueStats.overrides }}</h4>
            <small>Override Today</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white">
          <div class="card-body text-center">
            <i class="fas fa-hourglass-half fa-2x mb-2"></i>
            <h4>{{ queueStats.avgWaitTime }}h</h4>
            <small>Avg Wait Time</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Queue Table -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Antrean Pinjaman</h5>
              <div class="d-flex gap-2">
                <select
                  class="form-select form-select-sm"
                  v-model="filterStatus"
                  style="width: auto"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="loading" class="text-center p-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Memuat antrean...</p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th width="40">
                      <input type="checkbox" class="form-check-input" @change="toggleSelectAll" />
                    </th>
                    <th>Queue #</th>
                    <th>Nama Anggota</th>
                    <th>Jenis Pinjaman</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in queueItems"
                    :key="item.id"
                    :class="{ 'table-warning': item.isOverridden }"
                  >
                    <td>
                      <input
                        type="checkbox"
                        class="form-check-input"
                        :value="item.id"
                        v-model="selectedItems"
                      />
                    </td>
                    <td>
                      <strong>#{{ item.queueNumber }}</strong>
                      <div v-if="item.isOverridden" class="text-warning">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        <small>Overridden</small>
                      </div>
                    </td>
                    <td>
                      <strong>{{ item.memberName }}</strong>
                      <br />
                      <small class="text-muted">{{ item.memberNumber }}</small>
                    </td>
                    <td>
                      <span class="badge bg-primary">{{ item.loanType }}</span>
                    </td>
                    <td>Rp {{ formatCurrency(item.amount) }}</td>
                    <td>
                      <span class="badge bg-warning">{{ item.status }}</span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-warning"
                          @click="openOverrideModal(item)"
                          title="Override Priority"
                        >
                          <i class="fas fa-exchange-alt"></i>
                        </button>
                        <button
                          class="btn btn-outline-success"
                          @click="processLoan(item.id)"
                          title="Process"
                        >
                          <i class="fas fa-play"></i>
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

    <!-- Override Modal -->
    <div
      v-if="showOverrideModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Override FCFS Queue
            </h5>
            <button type="button" class="btn-close" @click="closeOverrideModal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="fas fa-info-circle me-2"></i>
              <strong>Peringatan:</strong> Anda akan mengubah urutan antrean FCFS. Tindakan ini akan
              dicatat dalam audit log.
            </div>

            <div class="mb-3">
              <label class="form-label"
                >Justifikasi Override <span class="text-danger">*</span></label
              >
              <textarea
                class="form-control"
                v-model="overrideJustification"
                rows="4"
                placeholder="Jelaskan alasan mengapa perlu mengubah urutan antrean FCFS..."
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Priority Level</label>
              <select class="form-select" v-model="overridePriority">
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="overrideConfirmation"
                id="overrideConfirmation"
              />
              <label class="form-check-label" for="overrideConfirmation">
                Saya memahami bahwa tindakan ini akan dicatat dalam audit trail
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeOverrideModal">
              Batal
            </button>
            <button
              type="button"
              class="btn btn-warning"
              @click="confirmOverride"
              :disabled="!overrideJustification || !overrideConfirmation"
            >
              <i class="fas fa-exchange-alt me-2"></i>
              Confirm Override
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
interface QueueItem {
  id: number
  queueNumber: number
  memberName: string
  memberNumber: string
  loanType: string
  amount: number
  status: string
  isOverridden: boolean
}

interface QueueStats {
  total: number
  processing: number
  overrides: number
  avgWaitTime: number
}

export default {
  name: 'AntreanView',
  data() {
    return {
      loading: false,

      // Queue data
      queueItems: [
        {
          id: 1,
          queueNumber: 1,
          memberName: 'Ahmad Subagyo',
          memberNumber: 'A001234',
          loanType: 'Konsumsi',
          amount: 15000000,
          status: 'pending',
          isOverridden: false,
        },
        {
          id: 2,
          queueNumber: 2,
          memberName: 'Siti Nurhaliza',
          memberNumber: 'A001456',
          loanType: 'Produktif',
          amount: 25000000,
          status: 'processing',
          isOverridden: true,
        },
        {
          id: 3,
          queueNumber: 3,
          memberName: 'Budi Santoso',
          memberNumber: 'A001789',
          loanType: 'Mikro',
          amount: 5000000,
          status: 'pending',
          isOverridden: false,
        },
      ] as QueueItem[],

      selectedItems: [] as number[],
      filterStatus: '',

      // Statistics
      queueStats: {
        total: 3,
        processing: 1,
        overrides: 1,
        avgWaitTime: 18,
      } as QueueStats,

      // Modal
      showOverrideModal: false,
      overrideJustification: '',
      overridePriority: 'normal',
      overrideConfirmation: false,
    }
  },

  methods: {
    async refreshQueue() {
      this.loading = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // Refresh data
      } finally {
        this.loading = false
      }
    },

    toggleSelectAll() {
      if (this.selectedItems.length === this.queueItems.length) {
        this.selectedItems = []
      } else {
        this.selectedItems = this.queueItems.map((item) => item.id)
      }
    },

    openOverrideModal(item: QueueItem) {
      this.selectedItems = [item.id]
      this.showOverrideModal = true
    },

    closeOverrideModal() {
      this.showOverrideModal = false
      this.overrideJustification = ''
      this.overridePriority = 'normal'
      this.overrideConfirmation = false
    },

    async confirmOverride() {
      if (!this.overrideJustification || !this.overrideConfirmation) {
        return
      }

      try {
        // Apply override logic
        this.selectedItems.forEach((itemId) => {
          const item = this.queueItems.find((q) => q.id === itemId)
          if (item) {
            item.isOverridden = true
          }
        })

        this.closeOverrideModal()
        this.selectedItems = []
        this.$toast?.success('Override berhasil diterapkan')

        // Audit log
        console.log('Override applied with justification:', this.overrideJustification)
      } catch (error) {
        console.error('Error applying override:', error)
        this.$toast?.error('Gagal melakukan override')
      }
    },

    async processLoan(itemId: number) {
      if (confirm('Mulai memproses pinjaman ini?')) {
        const item = this.queueItems.find((q) => q.id === itemId)
        if (item) {
          item.status = 'processing'
          this.queueStats.processing = this.queueItems.filter(
            (item) => item.status === 'processing',
          ).length
        }
        this.$toast?.success('Pinjaman mulai diproses')
      }
    },

    formatCurrency(amount: number): string {
      return new Intl.NumberFormat('id-ID').format(amount)
    },
  },
}
</script>

<style scoped>
.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.table-warning {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

.modal.show {
  display: block !important;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}
</style>

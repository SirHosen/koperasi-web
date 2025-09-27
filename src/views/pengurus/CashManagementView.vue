<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="h3 mb-0">Manajemen Kas</h2>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" @click="exportCashReport" :disabled="loading">
              <i class="fas fa-download"></i>
              Export Laporan
            </button>
            <button class="btn btn-outline-secondary" @click="refreshData" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Position Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Kas Tunai</h6>
                <h3 class="mb-0 text-primary">Rp {{ formatCurrency(cashPosition.tunai) }}</h3>
                <small
                  class="text-muted"
                  :class="{
                    'text-success': cashPosition.tunai_trend > 0,
                    'text-danger': cashPosition.tunai_trend < 0,
                  }"
                >
                  <i
                    class="fas"
                    :class="{
                      'fa-arrow-up': cashPosition.tunai_trend > 0,
                      'fa-arrow-down': cashPosition.tunai_trend < 0,
                      'fa-minus': cashPosition.tunai_trend === 0,
                    }"
                  ></i>
                  {{ Math.abs(cashPosition.tunai_trend) }}% dari bulan lalu
                </small>
              </div>
              <div class="bg-primary bg-opacity-10 p-3 rounded">
                <i class="fas fa-money-bills text-primary"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Kas Bank</h6>
                <h3 class="mb-0 text-success">Rp {{ formatCurrency(cashPosition.bank) }}</h3>
                <small
                  class="text-muted"
                  :class="{
                    'text-success': cashPosition.bank_trend > 0,
                    'text-danger': cashPosition.bank_trend < 0,
                  }"
                >
                  <i
                    class="fas"
                    :class="{
                      'fa-arrow-up': cashPosition.bank_trend > 0,
                      'fa-arrow-down': cashPosition.bank_trend < 0,
                      'fa-minus': cashPosition.bank_trend === 0,
                    }"
                  ></i>
                  {{ Math.abs(cashPosition.bank_trend) }}% dari bulan lalu
                </small>
              </div>
              <div class="bg-success bg-opacity-10 p-3 rounded">
                <i class="fas fa-university text-success"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Total Likuiditas</h6>
                <h3 class="mb-0 text-info">Rp {{ formatCurrency(cashPosition.total) }}</h3>
                <div class="progress mt-2" style="height: 4px">
                  <div
                    class="progress-bar"
                    :class="{
                      'bg-danger': liquidityRatio < 20,
                      'bg-warning': liquidityRatio >= 20 && liquidityRatio < 50,
                      'bg-success': liquidityRatio >= 50,
                    }"
                    :style="{ width: Math.min(liquidityRatio, 100) + '%' }"
                  ></div>
                </div>
                <small class="text-muted">Rasio Likuiditas: {{ liquidityRatio.toFixed(1) }}%</small>
              </div>
              <div class="bg-info bg-opacity-10 p-3 rounded">
                <i class="fas fa-chart-line text-info"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle mb-2 text-muted">Cash Flow Hari Ini</h6>
                <h3
                  class="mb-0"
                  :class="{
                    'text-success': dailyCashFlow >= 0,
                    'text-danger': dailyCashFlow < 0,
                  }"
                >
                  Rp {{ formatCurrency(Math.abs(dailyCashFlow)) }}
                </h3>
                <small class="text-muted">
                  {{ dailyCashFlow >= 0 ? 'Masuk' : 'Keluar' }} Bersih
                </small>
              </div>
              <div
                class="p-3 rounded"
                :class="{
                  'bg-success bg-opacity-10': dailyCashFlow >= 0,
                  'bg-danger bg-opacity-10': dailyCashFlow < 0,
                }"
              >
                <i
                  class="fas"
                  :class="{
                    'fa-arrow-trend-up text-success': dailyCashFlow >= 0,
                    'fa-arrow-trend-down text-danger': dailyCashFlow < 0,
                  }"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts Section -->
    <div v-if="alerts.length > 0" class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">
              <i class="fas fa-exclamation-triangle text-warning me-2"></i>
              Peringatan Likuiditas
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div v-for="alert in alerts" :key="alert.id" class="col-md-6">
                <div
                  class="alert mb-0"
                  :class="{
                    'alert-danger': alert.level === 'critical',
                    'alert-warning': alert.level === 'warning',
                    'alert-info': alert.level === 'info',
                  }"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="alert-heading mb-1">{{ alert.title }}</h6>
                      <p class="mb-0">{{ alert.message }}</p>
                      <small class="text-muted">{{ formatDateTime(alert.created_at) }}</small>
                    </div>
                    <button
                      type="button"
                      class="btn-close"
                      @click="dismissAlert(alert.id)"
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Flow Chart and Bank Accounts -->
    <div class="row mb-4">
      <!-- Cash Flow Chart -->
      <div class="col-lg-8 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Arus Kas (30 Hari Terakhir)</h5>
              <div class="btn-group btn-group-sm" role="group">
                <input
                  type="radio"
                  class="btn-check"
                  name="chartPeriod"
                  id="period7"
                  value="7"
                  v-model="chartPeriod"
                />
                <label class="btn btn-outline-primary" for="period7">7 Hari</label>

                <input
                  type="radio"
                  class="btn-check"
                  name="chartPeriod"
                  id="period30"
                  value="30"
                  v-model="chartPeriod"
                />
                <label class="btn btn-outline-primary" for="period30">30 Hari</label>

                <input
                  type="radio"
                  class="btn-check"
                  name="chartPeriod"
                  id="period90"
                  value="90"
                  v-model="chartPeriod"
                />
                <label class="btn btn-outline-primary" for="period90">90 Hari</label>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 300px">
              <canvas ref="cashFlowChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank Accounts -->
      <div class="col-lg-4 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Rekening Bank</h5>
              <button class="btn btn-outline-primary btn-sm" @click="openAddAccountModal">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="bankAccounts.length === 0" class="text-center text-muted py-4">
              <i class="fas fa-university fa-2x mb-2"></i>
              <p class="mb-0">Belum ada rekening bank</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="account in bankAccounts"
                :key="account.id"
                class="border rounded p-3 mb-3"
              >
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 class="mb-1">{{ account.bank_name }}</h6>
                    <p class="text-muted mb-0 small">{{ account.account_number }}</p>
                  </div>
                  <div class="dropdown">
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      type="button"
                      :id="'accountDropdown' + account.id"
                      data-bs-toggle="dropdown"
                    >
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li>
                        <a class="dropdown-item" href="#" @click="editAccount(account)">
                          <i class="fas fa-edit me-2"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="#" @click="viewTransactions(account)">
                          <i class="fas fa-list me-2"></i>Transaksi
                        </a>
                      </li>
                      <li><hr class="dropdown-divider" /></li>
                      <li>
                        <a
                          class="dropdown-item text-danger"
                          href="#"
                          @click="deleteAccount(account)"
                        >
                          <i class="fas fa-trash me-2"></i>Hapus
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-success fw-bold">
                    Rp {{ formatCurrency(account.balance) }}
                  </span>
                  <span
                    class="badge"
                    :class="{
                      'bg-success': account.status === 'active',
                      'bg-danger': account.status === 'inactive',
                    }"
                  >
                    {{ account.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </div>
                <div class="progress mt-2" style="height: 4px">
                  <div
                    class="progress-bar bg-success"
                    :style="{ width: (account.balance / cashPosition.bank) * 100 + '%' }"
                  ></div>
                </div>
                <small class="text-muted"> Update: {{ formatDate(account.last_update) }} </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cash Transactions and Projections -->
    <div class="row mb-4">
      <!-- Recent Transactions -->
      <div class="col-lg-8 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Transaksi Kas Terbaru</h5>
              <div class="d-flex gap-2">
                <select
                  class="form-select form-select-sm"
                  v-model="transactionFilter"
                  @change="filterTransactions"
                  style="width: auto"
                >
                  <option value="">Semua Transaksi</option>
                  <option value="inflow">Kas Masuk</option>
                  <option value="outflow">Kas Keluar</option>
                </select>
                <button class="btn btn-outline-primary btn-sm" @click="openAddTransactionModal">
                  <i class="fas fa-plus"></i>
                  Transaksi
                </button>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="filteredTransactions.length === 0" class="text-center p-4">
              <i class="fas fa-receipt fa-2x text-muted mb-2"></i>
              <p class="text-muted mb-0">Belum ada transaksi</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Tanggal</th>
                    <th>Deskripsi</th>
                    <th>Kategori</th>
                    <th>Jumlah</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="transaction in filteredTransactions.slice(0, 10)"
                    :key="transaction.id"
                  >
                    <td>
                      <small>{{ formatDateTime(transaction.created_at) }}</small>
                    </td>
                    <td>
                      <div>
                        <strong>{{ transaction.description }}</strong>
                        <br />
                        <small class="text-muted">{{ transaction.reference || '-' }}</small>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-secondary">{{ transaction.category }}</span>
                    </td>
                    <td>
                      <span
                        class="fw-bold"
                        :class="{
                          'text-success': transaction.type === 'inflow',
                          'text-danger': transaction.type === 'outflow',
                        }"
                      >
                        {{ transaction.type === 'inflow' ? '+' : '-' }}
                        Rp {{ formatCurrency(transaction.amount) }}
                      </span>
                    </td>
                    <td>
                      <span class="text-muted">
                        Rp {{ formatCurrency(transaction.balance_after) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="filteredTransactions.length > 10" class="card-footer bg-white text-center">
            <button class="btn btn-outline-primary btn-sm" @click="viewAllTransactions">
              Lihat Semua Transaksi ({{ filteredTransactions.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Cash Flow Projections -->
      <div class="col-lg-4 mb-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">Proyeksi Kas (7 Hari)</h5>
          </div>
          <div class="card-body">
            <div class="space-y-3">
              <div
                v-for="projection in cashProjections"
                :key="projection.date"
                class="d-flex justify-content-between align-items-center p-2 border rounded"
              >
                <div>
                  <div class="fw-bold">{{ formatDate(projection.date) }}</div>
                  <small class="text-muted">{{ projection.day_name }}</small>
                </div>
                <div class="text-end">
                  <div
                    class="fw-bold"
                    :class="{
                      'text-success': projection.net_flow >= 0,
                      'text-danger': projection.net_flow < 0,
                    }"
                  >
                    {{ projection.net_flow >= 0 ? '+' : '' }}Rp
                    {{ formatCurrency(Math.abs(projection.net_flow)) }}
                  </div>
                  <small class="text-muted">
                    Saldo: Rp {{ formatCurrency(projection.projected_balance) }}
                  </small>
                </div>
              </div>
            </div>

            <!-- Warning for Low Cash -->
            <div v-if="hasLowCashProjection" class="alert alert-warning mt-3 mb-0">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Peringatan:</strong> Proyeksi menunjukkan kemungkinan kas rendah dalam 7 hari
              ke depan.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <div class="modal fade" id="addTransactionModal" tabindex="-1" ref="addTransactionModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Transaksi Kas</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTransaction">
              <div class="mb-3">
                <label class="form-label">Jenis Transaksi <span class="text-danger">*</span></label>
                <select
                  class="form-select"
                  v-model="transactionForm.type"
                  :class="{ 'is-invalid': transactionForm.submitted && !transactionForm.type }"
                  required
                >
                  <option value="">Pilih Jenis</option>
                  <option value="inflow">Kas Masuk</option>
                  <option value="outflow">Kas Keluar</option>
                </select>
                <div
                  v-if="transactionForm.submitted && !transactionForm.type"
                  class="invalid-feedback"
                >
                  Jenis transaksi harus dipilih
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Kategori <span class="text-danger">*</span></label>
                <select
                  class="form-select"
                  v-model="transactionForm.category"
                  :class="{ 'is-invalid': transactionForm.submitted && !transactionForm.category }"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <optgroup v-if="transactionForm.type === 'inflow'" label="Kas Masuk">
                    <option value="setoran_anggota">Setoran Anggota</option>
                    <option value="bunga_simpanan">Bunga Simpanan</option>
                    <option value="administrasi">Biaya Administrasi</option>
                    <option value="pendapatan_lain">Pendapatan Lain</option>
                  </optgroup>
                  <optgroup v-if="transactionForm.type === 'outflow'" label="Kas Keluar">
                    <option value="pencairan_pinjaman">Pencairan Pinjaman</option>
                    <option value="penarikan_simpanan">Penarikan Simpanan</option>
                    <option value="biaya_operasional">Biaya Operasional</option>
                    <option value="biaya_lain">Biaya Lain</option>
                  </optgroup>
                </select>
                <div
                  v-if="transactionForm.submitted && !transactionForm.category"
                  class="invalid-feedback"
                >
                  Kategori harus dipilih
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Jumlah <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    type="number"
                    class="form-control"
                    v-model="transactionForm.amount"
                    :class="{
                      'is-invalid':
                        transactionForm.submitted &&
                        (!transactionForm.amount || transactionForm.amount <= 0),
                    }"
                    placeholder="0"
                    min="1"
                    required
                  />
                  <div
                    v-if="
                      transactionForm.submitted &&
                      (!transactionForm.amount || transactionForm.amount <= 0)
                    "
                    class="invalid-feedback"
                  >
                    Jumlah harus lebih dari 0
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Deskripsi <span class="text-danger">*</span></label>
                <textarea
                  class="form-control"
                  v-model="transactionForm.description"
                  :class="{
                    'is-invalid': transactionForm.submitted && !transactionForm.description,
                  }"
                  rows="3"
                  placeholder="Deskripsi transaksi..."
                  required
                ></textarea>
                <div
                  v-if="transactionForm.submitted && !transactionForm.description"
                  class="invalid-feedback"
                >
                  Deskripsi harus diisi
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Referensi</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="transactionForm.reference"
                  placeholder="No. referensi, kuitansi, dll (opsional)"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Akun Bank/Kas</label>
                <select class="form-select" v-model="transactionForm.account_id">
                  <option value="">Kas Tunai</option>
                  <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
                    {{ account.bank_name }} - {{ account.account_number }}
                  </option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveTransaction"
              :disabled="processing"
            >
              <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-save me-2"></i>
              {{ processing ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Bank Account Modal -->
    <div class="modal fade" id="addAccountModal" tabindex="-1" ref="addAccountModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ accountForm.isEdit ? 'Edit' : 'Tambah' }} Rekening Bank</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAccount">
              <div class="mb-3">
                <label class="form-label">Nama Bank <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="accountForm.bank_name"
                  :class="{ 'is-invalid': accountForm.submitted && !accountForm.bank_name }"
                  placeholder="Contoh: BCA, Mandiri, BRI"
                  required
                />
                <div
                  v-if="accountForm.submitted && !accountForm.bank_name"
                  class="invalid-feedback"
                >
                  Nama bank harus diisi
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Nomor Rekening <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="accountForm.account_number"
                  :class="{ 'is-invalid': accountForm.submitted && !accountForm.account_number }"
                  placeholder="Nomor rekening"
                  required
                />
                <div
                  v-if="accountForm.submitted && !accountForm.account_number"
                  class="invalid-feedback"
                >
                  Nomor rekening harus diisi
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Nama Pemegang Rekening <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  v-model="accountForm.account_holder"
                  :class="{ 'is-invalid': accountForm.submitted && !accountForm.account_holder }"
                  placeholder="Nama sesuai rekening"
                  required
                />
                <div
                  v-if="accountForm.submitted && !accountForm.account_holder"
                  class="invalid-feedback"
                >
                  Nama pemegang rekening harus diisi
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Saldo Awal <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    type="number"
                    class="form-control"
                    v-model="accountForm.balance"
                    :class="{ 'is-invalid': accountForm.submitted && accountForm.balance < 0 }"
                    placeholder="0"
                    min="0"
                    required
                  />
                  <div
                    v-if="accountForm.submitted && accountForm.balance < 0"
                    class="invalid-feedback"
                  >
                    Saldo tidak boleh negatif
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Status</label>
                <select class="form-select" v-model="accountForm.status">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveAccount"
              :disabled="processing"
            >
              <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-save me-2"></i>
              {{ processing ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Modal } from 'bootstrap'
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend)

interface Transaction {
  id: number
  type: 'inflow' | 'outflow'
  category: string
  amount: number
  description: string
  reference: string
  balance_after: number
  created_at: string
}

export default {
  name: 'CashManagementView',
  data() {
    return {
      loading: false,
      processing: false,

      // Chart
      cashFlowChart: null as Chart | null,
      chartPeriod: '30',

      // Modals
      addTransactionModal: null as Modal | null,
      addAccountModal: null as Modal | null,

      // Cash Position
      cashPosition: {
        tunai: 50000000,
        bank: 150000000,
        total: 200000000,
        tunai_trend: 5.2,
        bank_trend: -2.1,
      },

      // Alerts
      alerts: [
        {
          id: 1,
          level: 'warning',
          title: 'Kas Tunai Rendah',
          message: 'Kas tunai turun dibawah 10% dari total likuiditas',
          created_at: new Date().toISOString(),
        },
      ],

      // Bank Accounts
      bankAccounts: [
        {
          id: 1,
          bank_name: 'BCA',
          account_number: '1234567890',
          account_holder: 'KSP Maju Bersama',
          balance: 75000000,
          status: 'active',
          last_update: new Date().toISOString().split('T')[0],
        },
        {
          id: 2,
          bank_name: 'Mandiri',
          account_number: '0987654321',
          account_holder: 'KSP Maju Bersama',
          balance: 75000000,
          status: 'active',
          last_update: new Date().toISOString().split('T')[0],
        },
      ],

      // Transactions
      transactions: [] as Transaction[],
      filteredTransactions: [] as Transaction[],
      transactionFilter: '',

      // Forms
      transactionForm: {
        type: '',
        category: '',
        amount: '',
        description: '',
        reference: '',
        account_id: '',
        submitted: false,
      },

      accountForm: {
        isEdit: false,
        id: null,
        bank_name: '',
        account_number: '',
        account_holder: '',
        balance: 0,
        status: 'active',
        submitted: false,
      },
    }
  },

  computed: {
    liquidityRatio() {
      // Mock calculation - percentage of cash vs total obligations
      const totalObligations = 400000000 // Mock data
      return (this.cashPosition.total / totalObligations) * 100
    },

    dailyCashFlow() {
      // Mock calculation for today's net cash flow
      return 2500000
    },

    cashProjections() {
      const projections = []
      const today = new Date()
      let currentBalance = this.cashPosition.total

      for (let i = 1; i <= 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)

        // Mock projected cash flow calculation
        const baseFlow = Math.random() * 10000000 - 5000000
        const netFlow = Math.round(baseFlow)
        currentBalance += netFlow

        projections.push({
          date: date.toISOString().split('T')[0],
          day_name: date.toLocaleDateString('id-ID', { weekday: 'long' }),
          net_flow: netFlow,
          projected_balance: Math.max(0, currentBalance),
        })
      }

      return projections
    },

    hasLowCashProjection() {
      return this.cashProjections.some((p) => p.projected_balance < 20000000)
    },
  },

  async mounted() {
    await this.loadData()
    this.initializeModals()
    this.initializeChart()
    this.generateMockTransactions()
  },

  methods: {
    initializeModals() {
      this.addTransactionModal = new Modal(this.$refs.addTransactionModal)
      this.addAccountModal = new Modal(this.$refs.addAccountModal)
    },

    initializeChart() {
      const ctx = (this.$refs.cashFlowChart as HTMLCanvasElement).getContext('2d')

      // Generate mock data for chart
      const labels = []
      const inflowData = []
      const outflowData = []
      const balanceData = []

      const today = new Date()
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        labels.push(date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }))

        inflowData.push(Math.random() * 20000000 + 5000000)
        outflowData.push(Math.random() * 15000000 + 3000000)
        balanceData.push(Math.random() * 50000000 + 150000000)
      }

      this.cashFlowChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Kas Masuk',
              data: inflowData,
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Kas Keluar',
              data: outflowData,
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Saldo',
              data: balanceData,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Tanggal',
              },
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Cash Flow (Rp)',
              },
              ticks: {
                callback: function (value: string | number) {
                  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(value))
                },
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Saldo (Rp)',
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                callback: function (value: string | number) {
                  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(value))
                },
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  return (
                    context.dataset.label +
                    ': Rp ' +
                    new Intl.NumberFormat('id-ID').format(context.parsed.y)
                  )
                },
              },
            },
          },
        },
      })
    },

    generateMockTransactions() {
      const transactions = []
      let balance = this.cashPosition.total

      for (let i = 0; i < 50; i++) {
        const isInflow = Math.random() > 0.5
        const amount = Math.floor(Math.random() * 10000000) + 1000000
        const date = new Date()
        date.setDate(date.getDate() - i)

        if (isInflow) {
          balance += amount
        } else {
          balance -= amount
        }

        transactions.push({
          id: i + 1,
          type: isInflow ? 'inflow' : 'outflow',
          category: isInflow ? 'setoran_anggota' : 'pencairan_pinjaman',
          amount: amount,
          description: isInflow ? 'Setoran anggota' : 'Pencairan pinjaman',
          reference: `REF${String(i + 1).padStart(6, '0')}`,
          balance_after: balance,
          created_at: date.toISOString(),
        })
      }

      this.transactions = transactions.reverse()
      this.filteredTransactions = [...this.transactions]
    },

    async loadData() {
      this.loading = true
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Data is already initialized in data()
      } catch (error) {
        console.error('Error loading cash management data:', error)
        this.$toast?.error('Gagal memuat data manajemen kas')
      } finally {
        this.loading = false
      }
    },

    async refreshData() {
      await this.loadData()
    },

    filterTransactions() {
      if (!this.transactionFilter) {
        this.filteredTransactions = [...this.transactions]
      } else {
        this.filteredTransactions = this.transactions.filter(
          (t) => t.type === this.transactionFilter,
        )
      }
    },

    openAddTransactionModal() {
      this.resetTransactionForm()
      this.addTransactionModal.show()
    },

    openAddAccountModal() {
      this.resetAccountForm()
      this.addAccountModal.show()
    },

    resetTransactionForm() {
      this.transactionForm = {
        type: '',
        category: '',
        amount: '',
        description: '',
        reference: '',
        account_id: '',
        submitted: false,
      }
    },

    resetAccountForm() {
      this.accountForm = {
        isEdit: false,
        id: null,
        bank_name: '',
        account_number: '',
        account_holder: '',
        balance: 0,
        status: 'active',
        submitted: false,
      }
    },

    async saveTransaction() {
      this.transactionForm.submitted = true

      if (
        !this.transactionForm.type ||
        !this.transactionForm.category ||
        !this.transactionForm.amount ||
        !this.transactionForm.description ||
        Number(this.transactionForm.amount) <= 0
      ) {
        return
      }

      this.processing = true
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Add transaction to list
        const newTransaction = {
          id: this.transactions.length + 1,
          type: this.transactionForm.type,
          category: this.transactionForm.category,
          amount: Number(this.transactionForm.amount),
          description: this.transactionForm.description,
          reference: this.transactionForm.reference,
          balance_after:
            this.cashPosition.total +
            (this.transactionForm.type === 'inflow'
              ? parseInt(this.transactionForm.amount)
              : -parseInt(this.transactionForm.amount)),
          created_at: new Date().toISOString(),
        }

        this.transactions.unshift(newTransaction)
        this.filterTransactions()

        // Update cash position
        if (this.transactionForm.type === 'inflow') {
          this.cashPosition.total += Number(this.transactionForm.amount)
          if (this.transactionForm.account_id) {
            this.cashPosition.bank += Number(this.transactionForm.amount)
          } else {
            this.cashPosition.tunai += Number(this.transactionForm.amount)
          }
        } else {
          this.cashPosition.total -= Number(this.transactionForm.amount)
          if (this.transactionForm.account_id) {
            this.cashPosition.bank -= Number(this.transactionForm.amount)
          } else {
            this.cashPosition.tunai -= Number(this.transactionForm.amount)
          }
        }

        this.addTransactionModal.hide()
        this.$toast?.success('Transaksi berhasil disimpan')
      } catch (error) {
        console.error('Error saving transaction:', error)
        this.$toast?.error('Gagal menyimpan transaksi')
      } finally {
        this.processing = false
      }
    },

    async saveAccount() {
      this.accountForm.submitted = true

      if (
        !this.accountForm.bank_name ||
        !this.accountForm.account_number ||
        !this.accountForm.account_holder ||
        this.accountForm.balance < 0
      ) {
        return
      }

      this.processing = true
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (this.accountForm.isEdit) {
          // Update existing account
          const index = this.bankAccounts.findIndex((acc) => acc.id === this.accountForm.id)
          if (index !== -1) {
            this.bankAccounts[index] = {
              ...this.bankAccounts[index],
              bank_name: this.accountForm.bank_name,
              account_number: this.accountForm.account_number,
              account_holder: this.accountForm.account_holder,
              balance: this.accountForm.balance,
              status: this.accountForm.status,
            }
          }
        } else {
          // Add new account
          const newAccount = {
            id: this.bankAccounts.length + 1,
            bank_name: this.accountForm.bank_name,
            account_number: this.accountForm.account_number,
            account_holder: this.accountForm.account_holder,
            balance: this.accountForm.balance,
            status: this.accountForm.status,
            last_update: new Date().toISOString().split('T')[0],
          }

          this.bankAccounts.push(newAccount)

          // Update total bank balance
          this.cashPosition.bank += this.accountForm.balance
          this.cashPosition.total += this.accountForm.balance
        }

        this.addAccountModal.hide()
        this.$toast?.success(
          `Rekening berhasil ${this.accountForm.isEdit ? 'diperbarui' : 'ditambahkan'}`,
        )
      } catch (error) {
        console.error('Error saving account:', error)
        this.$toast?.error(
          `Gagal ${this.accountForm.isEdit ? 'memperbarui' : 'menambahkan'} rekening`,
        )
      } finally {
        this.processing = false
      }
    },

    editAccount(account) {
      this.accountForm = {
        isEdit: true,
        id: account.id,
        bank_name: account.bank_name,
        account_number: account.account_number,
        account_holder: account.account_holder,
        balance: account.balance,
        status: account.status,
        submitted: false,
      }

      this.addAccountModal.show()
    },

    deleteAccount(account) {
      if (
        confirm(
          `Apakah Anda yakin ingin menghapus rekening ${account.bank_name} - ${account.account_number}?`,
        )
      ) {
        const index = this.bankAccounts.findIndex((acc) => acc.id === account.id)
        if (index !== -1) {
          // Update cash position
          this.cashPosition.bank -= account.balance
          this.cashPosition.total -= account.balance

          this.bankAccounts.splice(index, 1)
          this.$toast?.success('Rekening berhasil dihapus')
        }
      }
    },

    viewTransactions(account) {
      // Mock function - implement transaction history view
      this.$toast?.info(`Menampilkan transaksi untuk ${account.bank_name}`)
    },

    viewAllTransactions() {
      // Mock function - implement full transaction view
      this.$toast?.info('Menampilkan semua transaksi')
    },

    dismissAlert(alertId) {
      const index = this.alerts.findIndex((alert) => alert.id === alertId)
      if (index !== -1) {
        this.alerts.splice(index, 1)
      }
    },

    exportCashReport() {
      // Mock function - implement cash report export
      this.$toast?.info('Mengekspor laporan kas...')
    },

    formatCurrency(amount) {
      if (!amount && amount !== 0) return '0'
      return new Intl.NumberFormat('id-ID').format(amount)
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },

    formatDateTime(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
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

.chart-container {
  position: relative;
}

.table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.progress {
  background-color: #e9ecef;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.alert-danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.alert-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.alert-info {
  background-color: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.badge {
  font-size: 0.75em;
}

.dropdown-toggle::after {
  display: none;
}
</style>

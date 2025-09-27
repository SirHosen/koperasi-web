<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-calculator me-2"></i>
              Akuntansi & Buku Besar
            </h2>
            <p class="text-muted mb-0">Manajemen akuntansi dan laporan keuangan sesuai SAK</p>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-success"
              @click="generateFinancialReport"
              :disabled="loading"
            >
              <i class="fas fa-file-excel"></i>
              Laporan Keuangan
            </button>
            <button class="btn btn-outline-primary" @click="refreshData" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="row mb-4">
      <div class="col-12">
        <ul class="nav nav-tabs" id="accountingTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'journal' }"
              @click="activeTab = 'journal'"
              type="button"
            >
              <i class="fas fa-book me-2"></i>
              Jurnal Umum
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'ledger' }"
              @click="activeTab = 'ledger'"
              type="button"
            >
              <i class="fas fa-list me-2"></i>
              Buku Besar
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'trial-balance' }"
              @click="activeTab = 'trial-balance'"
              type="button"
            >
              <i class="fas fa-balance-scale me-2"></i>
              Neraca Saldo
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'reports' }"
              @click="activeTab = 'reports'"
              type="button"
            >
              <i class="fas fa-chart-bar me-2"></i>
              Laporan Keuangan
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Journal Tab -->
    <div v-if="activeTab === 'journal'">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Jurnal Umum</h5>
                <button class="btn btn-primary" @click="openAddJournalModal">
                  <i class="fas fa-plus"></i>
                  Tambah Jurnal
                </button>
              </div>
            </div>
            <div class="card-body p-0">
              <!-- Filter -->
              <div class="border-bottom p-3">
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label">Dari Tanggal</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="journalFilters.dateFrom"
                      @change="loadJournalEntries"
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Sampai Tanggal</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="journalFilters.dateTo"
                      @change="loadJournalEntries"
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Akun</label>
                    <select
                      class="form-select"
                      v-model="journalFilters.account"
                      @change="loadJournalEntries"
                    >
                      <option value="">Semua Akun</option>
                      <option
                        v-for="account in chartOfAccounts"
                        :key="account.code"
                        :value="account.code"
                      >
                        {{ account.code }} - {{ account.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Pencarian</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Deskripsi atau referensi..."
                      v-model="journalFilters.search"
                      @input="loadJournalEntries"
                    />
                  </div>
                </div>
              </div>

              <!-- Journal Entries -->
              <div v-if="loading" class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Memuat jurnal...</p>
              </div>

              <div v-else-if="journalEntries.length === 0" class="text-center p-4">
                <i class="fas fa-book fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Belum ada jurnal</h5>
                <p class="text-muted">Mulai dengan menambahkan jurnal pertama</p>
              </div>

              <div v-else class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Tanggal</th>
                      <th>No. Jurnal</th>
                      <th>Deskripsi</th>
                      <th>Akun</th>
                      <th>Debet</th>
                      <th>Kredit</th>
                      <th>Referensi</th>
                      <th width="100">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="entry in paginatedJournalEntries" :key="entry.id">
                      <tr class="table-secondary">
                        <td colspan="8">
                          <strong>{{ formatDate(entry.date) }}</strong> - {{ entry.description }}
                          <span class="badge bg-primary ms-2">{{ entry.journal_number }}</span>
                        </td>
                      </tr>
                      <tr v-for="detail in entry.details" :key="detail.id">
                        <td></td>
                        <td></td>
                        <td class="ps-4">{{ detail.description }}</td>
                        <td>{{ detail.account_code }} - {{ detail.account_name }}</td>
                        <td class="text-end">
                          <span v-if="detail.debit > 0" class="text-success">
                            Rp {{ formatCurrency(detail.debit) }}
                          </span>
                        </td>
                        <td class="text-end">
                          <span v-if="detail.credit > 0" class="text-danger">
                            Rp {{ formatCurrency(detail.credit) }}
                          </span>
                        </td>
                        <td>{{ detail.reference || '-' }}</td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-primary"
                              @click="editJournalEntry(entry)"
                              title="Edit"
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                            <button
                              class="btn btn-outline-danger"
                              @click="deleteJournalEntry(entry.id)"
                              title="Hapus"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div v-if="journalEntries.length > journalItemsPerPage" class="card-footer bg-white">
                <nav>
                  <ul class="pagination justify-content-center mb-0">
                    <li class="page-item" :class="{ disabled: journalCurrentPage === 1 }">
                      <button
                        class="page-link"
                        @click="journalCurrentPage = 1"
                        :disabled="journalCurrentPage === 1"
                      >
                        <i class="fas fa-angle-double-left"></i>
                      </button>
                    </li>
                    <li class="page-item" :class="{ disabled: journalCurrentPage === 1 }">
                      <button
                        class="page-link"
                        @click="journalCurrentPage--"
                        :disabled="journalCurrentPage === 1"
                      >
                        <i class="fas fa-angle-left"></i>
                      </button>
                    </li>
                    <li
                      v-for="page in journalVisiblePages"
                      :key="page"
                      class="page-item"
                      :class="{ active: page === journalCurrentPage }"
                    >
                      <button class="page-link" @click="journalCurrentPage = page">
                        {{ page }}
                      </button>
                    </li>
                    <li
                      class="page-item"
                      :class="{ disabled: journalCurrentPage === journalTotalPages }"
                    >
                      <button
                        class="page-link"
                        @click="journalCurrentPage++"
                        :disabled="journalCurrentPage === journalTotalPages"
                      >
                        <i class="fas fa-angle-right"></i>
                      </button>
                    </li>
                    <li
                      class="page-item"
                      :class="{ disabled: journalCurrentPage === journalTotalPages }"
                    >
                      <button
                        class="page-link"
                        @click="journalCurrentPage = journalTotalPages"
                        :disabled="journalCurrentPage === journalTotalPages"
                      >
                        <i class="fas fa-angle-double-right"></i>
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

    <!-- Ledger Tab -->
    <div v-if="activeTab === 'ledger'">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Buku Besar</h5>
            </div>
            <div class="card-body">
              <!-- Account Selection -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <label class="form-label">Pilih Akun</label>
                  <select
                    class="form-select"
                    v-model="selectedLedgerAccount"
                    @change="loadLedgerDetails"
                  >
                    <option value="">Pilih Akun untuk Melihat Buku Besar</option>
                    <option
                      v-for="account in chartOfAccounts"
                      :key="account.code"
                      :value="account.code"
                    >
                      {{ account.code }} - {{ account.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Dari Tanggal</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="ledgerFilters.dateFrom"
                    @change="loadLedgerDetails"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Sampai Tanggal</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="ledgerFilters.dateTo"
                    @change="loadLedgerDetails"
                  />
                </div>
              </div>

              <!-- Ledger Details -->
              <div v-if="selectedLedgerAccount && ledgerDetails.length > 0">
                <div class="mb-3">
                  <h6>{{ selectedAccountInfo?.code }} - {{ selectedAccountInfo?.name }}</h6>
                  <div class="row g-3">
                    <div class="col-md-4">
                      <div class="bg-light p-3 rounded">
                        <small class="text-muted">Saldo Awal</small>
                        <h6 class="mb-0">Rp {{ formatCurrency(ledgerSummary.openingBalance) }}</h6>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="bg-light p-3 rounded">
                        <small class="text-muted">Total Mutasi</small>
                        <h6 class="mb-0 text-primary">
                          Rp {{ formatCurrency(ledgerSummary.totalMutation) }}
                        </h6>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="bg-light p-3 rounded">
                        <small class="text-muted">Saldo Akhir</small>
                        <h6 class="mb-0 text-success">
                          Rp {{ formatCurrency(ledgerSummary.closingBalance) }}
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Tanggal</th>
                        <th>Keterangan</th>
                        <th>Referensi</th>
                        <th class="text-end">Debet</th>
                        <th class="text-end">Kredit</th>
                        <th class="text-end">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="detail in ledgerDetails" :key="detail.id">
                        <td>{{ formatDate(detail.date) }}</td>
                        <td>{{ detail.description }}</td>
                        <td>{{ detail.reference || '-' }}</td>
                        <td class="text-end">
                          <span v-if="detail.debit > 0" class="text-success">
                            Rp {{ formatCurrency(detail.debit) }}
                          </span>
                          <span v-else>-</span>
                        </td>
                        <td class="text-end">
                          <span v-if="detail.credit > 0" class="text-danger">
                            Rp {{ formatCurrency(detail.credit) }}
                          </span>
                          <span v-else>-</span>
                        </td>
                        <td class="text-end fw-bold">
                          Rp {{ formatCurrency(detail.running_balance) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-else-if="selectedLedgerAccount" class="text-center p-4">
                <i class="fas fa-list fa-2x text-muted mb-2"></i>
                <p class="text-muted">
                  Tidak ada transaksi untuk akun ini pada periode yang dipilih
                </p>
              </div>

              <div v-else class="text-center p-4">
                <i class="fas fa-list fa-2x text-muted mb-2"></i>
                <p class="text-muted">Pilih akun untuk melihat buku besar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trial Balance Tab -->
    <div v-if="activeTab === 'trial-balance'">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Neraca Saldo</h5>
                <div class="d-flex gap-2">
                  <input
                    type="date"
                    class="form-control"
                    v-model="trialBalanceDate"
                    @change="loadTrialBalance"
                    style="width: auto"
                  />
                  <button class="btn btn-outline-success" @click="exportTrialBalance">
                    <i class="fas fa-download"></i>
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body p-0">
              <div v-if="loading" class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Memuat neraca saldo...</p>
              </div>

              <div v-else class="table-responsive">
                <table class="table table-bordered mb-0">
                  <thead class="table-dark">
                    <tr>
                      <th>Kode Akun</th>
                      <th>Nama Akun</th>
                      <th class="text-end">Debet</th>
                      <th class="text-end">Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="category in trialBalanceData" :key="category.category">
                      <tr class="table-secondary">
                        <td colspan="4">
                          <strong>{{ category.category.toUpperCase() }}</strong>
                        </td>
                      </tr>
                      <tr v-for="account in category.accounts" :key="account.code">
                        <td>{{ account.code }}</td>
                        <td>{{ account.name }}</td>
                        <td class="text-end">
                          <span v-if="account.debit_balance > 0">
                            Rp {{ formatCurrency(account.debit_balance) }}
                          </span>
                          <span v-else>-</span>
                        </td>
                        <td class="text-end">
                          <span v-if="account.credit_balance > 0">
                            Rp {{ formatCurrency(account.credit_balance) }}
                          </span>
                          <span v-else>-</span>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                  <tfoot class="table-dark">
                    <tr>
                      <th colspan="2">TOTAL</th>
                      <th class="text-end">
                        Rp {{ formatCurrency(trialBalanceTotals.totalDebit) }}
                      </th>
                      <th class="text-end">
                        Rp {{ formatCurrency(trialBalanceTotals.totalCredit) }}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Balance Check -->
              <div class="card-footer bg-white">
                <div class="d-flex justify-content-between align-items-center">
                  <span>Status Neraca:</span>
                  <span
                    class="badge fs-6"
                    :class="{
                      'bg-success':
                        trialBalanceTotals.totalDebit === trialBalanceTotals.totalCredit,
                      'bg-danger': trialBalanceTotals.totalDebit !== trialBalanceTotals.totalCredit,
                    }"
                  >
                    {{
                      trialBalanceTotals.totalDebit === trialBalanceTotals.totalCredit
                        ? 'BALANCE'
                        : 'TIDAK BALANCE'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports Tab -->
    <div v-if="activeTab === 'reports'">
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Laporan Laba Rugi</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <div class="row g-2">
                  <div class="col-md-6">
                    <input
                      type="date"
                      class="form-control form-control-sm"
                      v-model="reportFilters.incomeStatement.dateFrom"
                      @change="loadIncomeStatement"
                    />
                  </div>
                  <div class="col-md-6">
                    <input
                      type="date"
                      class="form-control form-control-sm"
                      v-model="reportFilters.incomeStatement.dateTo"
                      @change="loadIncomeStatement"
                    />
                  </div>
                </div>
              </div>

              <div v-if="incomeStatementData">
                <!-- Revenue -->
                <div class="mb-3">
                  <h6 class="text-primary">PENDAPATAN</h6>
                  <div
                    v-for="item in incomeStatementData.revenue"
                    :key="item.account_code"
                    class="d-flex justify-content-between"
                  >
                    <span>{{ item.account_name }}</span>
                    <span>Rp {{ formatCurrency(item.amount) }}</span>
                  </div>
                  <hr />
                  <div class="d-flex justify-content-between fw-bold">
                    <span>Total Pendapatan</span>
                    <span>Rp {{ formatCurrency(incomeStatementData.totalRevenue) }}</span>
                  </div>
                </div>

                <!-- Expenses -->
                <div class="mb-3">
                  <h6 class="text-danger">BEBAN</h6>
                  <div
                    v-for="item in incomeStatementData.expenses"
                    :key="item.account_code"
                    class="d-flex justify-content-between"
                  >
                    <span>{{ item.account_name }}</span>
                    <span>Rp {{ formatCurrency(item.amount) }}</span>
                  </div>
                  <hr />
                  <div class="d-flex justify-content-between fw-bold">
                    <span>Total Beban</span>
                    <span>Rp {{ formatCurrency(incomeStatementData.totalExpenses) }}</span>
                  </div>
                </div>

                <!-- Net Income -->
                <div class="bg-light p-3 rounded">
                  <div class="d-flex justify-content-between fw-bold fs-5">
                    <span>Laba (Rugi) Bersih</span>
                    <span
                      :class="{
                        'text-success': incomeStatementData.netIncome >= 0,
                        'text-danger': incomeStatementData.netIncome < 0,
                      }"
                    >
                      Rp {{ formatCurrency(Math.abs(incomeStatementData.netIncome)) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-3">
                <button class="btn btn-outline-success btn-sm" @click="exportIncomeStatement">
                  <i class="fas fa-download"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Neraca</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <input
                  type="date"
                  class="form-control form-control-sm"
                  v-model="reportFilters.balanceSheet.date"
                  @change="loadBalanceSheet"
                />
              </div>

              <div v-if="balanceSheetData">
                <!-- Assets -->
                <div class="mb-3">
                  <h6 class="text-primary">ASET</h6>
                  <div
                    v-for="item in balanceSheetData.assets"
                    :key="item.account_code"
                    class="d-flex justify-content-between"
                  >
                    <span>{{ item.account_name }}</span>
                    <span>Rp {{ formatCurrency(item.amount) }}</span>
                  </div>
                  <hr />
                  <div class="d-flex justify-content-between fw-bold">
                    <span>Total Aset</span>
                    <span>Rp {{ formatCurrency(balanceSheetData.totalAssets) }}</span>
                  </div>
                </div>

                <!-- Liabilities -->
                <div class="mb-3">
                  <h6 class="text-warning">KEWAJIBAN</h6>
                  <div
                    v-for="item in balanceSheetData.liabilities"
                    :key="item.account_code"
                    class="d-flex justify-content-between"
                  >
                    <span>{{ item.account_name }}</span>
                    <span>Rp {{ formatCurrency(item.amount) }}</span>
                  </div>
                  <hr />
                  <div class="d-flex justify-content-between fw-bold">
                    <span>Total Kewajiban</span>
                    <span>Rp {{ formatCurrency(balanceSheetData.totalLiabilities) }}</span>
                  </div>
                </div>

                <!-- Equity -->
                <div class="mb-3">
                  <h6 class="text-info">EKUITAS</h6>
                  <div
                    v-for="item in balanceSheetData.equity"
                    :key="item.account_code"
                    class="d-flex justify-content-between"
                  >
                    <span>{{ item.account_name }}</span>
                    <span>Rp {{ formatCurrency(item.amount) }}</span>
                  </div>
                  <hr />
                  <div class="d-flex justify-content-between fw-bold">
                    <span>Total Ekuitas</span>
                    <span>Rp {{ formatCurrency(balanceSheetData.totalEquity) }}</span>
                  </div>
                </div>

                <!-- Total -->
                <div class="bg-light p-3 rounded">
                  <div class="d-flex justify-content-between fw-bold fs-5">
                    <span>Total Kewajiban + Ekuitas</span>
                    <span>Rp {{ formatCurrency(balanceSheetData.totalLiabilitiesEquity) }}</span>
                  </div>
                  <div class="d-flex justify-content-between mt-2">
                    <small>Balance Check:</small>
                    <span
                      class="badge"
                      :class="{
                        'bg-success':
                          balanceSheetData.totalAssets === balanceSheetData.totalLiabilitiesEquity,
                        'bg-danger':
                          balanceSheetData.totalAssets !== balanceSheetData.totalLiabilitiesEquity,
                      }"
                    >
                      {{
                        balanceSheetData.totalAssets === balanceSheetData.totalLiabilitiesEquity
                          ? 'BALANCE'
                          : 'TIDAK BALANCE'
                      }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-3">
                <button class="btn btn-outline-success btn-sm" @click="exportBalanceSheet">
                  <i class="fas fa-download"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Journal Modal -->
    <div
      v-if="showAddJournalModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingJournal ? 'Edit Jurnal' : 'Tambah Jurnal Baru' }}</h5>
            <button type="button" class="btn-close" @click="closeAddJournalModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveJournalEntry">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Tanggal <span class="text-danger">*</span></label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="journalForm.date"
                    :class="{ 'is-invalid': journalForm.submitted && !journalForm.date }"
                    required
                  />
                  <div v-if="journalForm.submitted && !journalForm.date" class="invalid-feedback">
                    Tanggal harus diisi
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">No. Jurnal</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="journalForm.journalNumber"
                    placeholder="Auto generate jika kosong"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Deskripsi <span class="text-danger">*</span></label>
                <textarea
                  class="form-control"
                  v-model="journalForm.description"
                  :class="{ 'is-invalid': journalForm.submitted && !journalForm.description }"
                  rows="2"
                  placeholder="Deskripsi jurnal..."
                  required
                ></textarea>
                <div
                  v-if="journalForm.submitted && !journalForm.description"
                  class="invalid-feedback"
                >
                  Deskripsi harus diisi
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Detail Jurnal <span class="text-danger">*</span></label>
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th width="300">Akun</th>
                        <th>Deskripsi</th>
                        <th width="150">Debet</th>
                        <th width="150">Kredit</th>
                        <th width="100">Referensi</th>
                        <th width="50">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(detail, index) in journalForm.details" :key="index">
                        <td>
                          <select
                            class="form-select form-select-sm"
                            v-model="detail.accountCode"
                            :class="{ 'is-invalid': journalForm.submitted && !detail.accountCode }"
                            required
                          >
                            <option value="">Pilih Akun</option>
                            <option
                              v-for="account in chartOfAccounts"
                              :key="account.code"
                              :value="account.code"
                            >
                              {{ account.code }} - {{ account.name }}
                            </option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            class="form-control form-control-sm"
                            v-model="detail.description"
                            placeholder="Deskripsi detail..."
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm text-end"
                            v-model.number="detail.debit"
                            @input="validateJournalBalance"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm text-end"
                            v-model.number="detail.credit"
                            @input="validateJournalBalance"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            class="form-control form-control-sm"
                            v-model="detail.reference"
                            placeholder="Ref..."
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            class="btn btn-outline-danger btn-sm"
                            @click="removeJournalDetail(index)"
                            :disabled="journalForm.details.length <= 2"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table-secondary">
                      <tr>
                        <th colspan="2">TOTAL</th>
                        <th class="text-end">{{ formatCurrency(journalForm.totalDebit) }}</th>
                        <th class="text-end">{{ formatCurrency(journalForm.totalCredit) }}</th>
                        <th colspan="2">
                          <span
                            class="badge"
                            :class="{
                              'bg-success':
                                journalForm.totalDebit === journalForm.totalCredit &&
                                journalForm.totalDebit > 0,
                              'bg-danger':
                                journalForm.totalDebit !== journalForm.totalCredit ||
                                journalForm.totalDebit === 0,
                            }"
                          >
                            {{
                              journalForm.totalDebit === journalForm.totalCredit &&
                              journalForm.totalDebit > 0
                                ? 'BALANCE'
                                : 'TIDAK BALANCE'
                            }}
                          </span>
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <button
                  type="button"
                  class="btn btn-outline-primary btn-sm"
                  @click="addJournalDetail"
                >
                  <i class="fas fa-plus"></i>
                  Tambah Baris
                </button>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddJournalModal">
              Batal
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveJournalEntry"
              :disabled="
                processing ||
                journalForm.totalDebit !== journalForm.totalCredit ||
                journalForm.totalDebit === 0
              "
            >
              <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-save me-2"></i>
              {{ processing ? 'Menyimpan...' : editingJournal ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Vue instance type extension
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast?: {
      success: (message: string) => void
      error: (message: string) => void
      info: (message: string) => void
    }
  }
}

interface ChartOfAccount {
  code: string
  name: string
  category: string
  normal_balance: string
}

interface JournalDetail {
  id?: number
  account_code: string
  account_name: string
  description: string
  debit: number
  credit: number
  reference?: string
}

interface JournalEntry {
  id: number
  date: string
  journal_number: string
  description: string
  details: JournalDetail[]
}

interface LedgerEntry {
  id: number
  date: string
  description: string
  reference: string
  debit: number
  credit: number
  running_balance: number
}

interface TrialBalanceEntry {
  category: string
  accounts: {
    code: string
    name: string
    debit_balance: number
    credit_balance: number
  }[]
}

interface IncomeStatementData {
  revenue: {
    account_code: string
    account_name: string
    amount: number
  }[]
  expenses: {
    account_code: string
    account_name: string
    amount: number
  }[]
  totalRevenue: number
  totalExpenses: number
  netIncome: number
}

interface BalanceSheetData {
  assets: {
    account_code: string
    account_name: string
    amount: number
  }[]
  liabilities: {
    account_code: string
    account_name: string
    amount: number
  }[]
  equity: {
    account_code: string
    account_name: string
    amount: number
  }[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  totalLiabilitiesEquity: number
}

export default {
  name: 'AccountingView',
  data() {
    return {
      loading: false,
      processing: false,
      activeTab: 'journal',

      // Chart of Accounts
      chartOfAccounts: [
        { code: '1100', name: 'Kas', category: 'asset', normal_balance: 'debit' },
        { code: '1200', name: 'Bank', category: 'asset', normal_balance: 'debit' },
        { code: '1300', name: 'Piutang Anggota', category: 'asset', normal_balance: 'debit' },
        { code: '1400', name: 'Inventaris', category: 'asset', normal_balance: 'debit' },
        { code: '2100', name: 'Simpanan Anggota', category: 'liability', normal_balance: 'credit' },
        { code: '2200', name: 'Hutang Usaha', category: 'liability', normal_balance: 'credit' },
        { code: '3100', name: 'Modal Koperasi', category: 'equity', normal_balance: 'credit' },
        { code: '3200', name: 'Cadangan Umum', category: 'equity', normal_balance: 'credit' },
        { code: '4100', name: 'Pendapatan Jasa', category: 'revenue', normal_balance: 'credit' },
        { code: '4200', name: 'Pendapatan Bunga', category: 'revenue', normal_balance: 'credit' },
        { code: '5100', name: 'Beban Operasional', category: 'expense', normal_balance: 'debit' },
        { code: '5200', name: 'Beban Administrasi', category: 'expense', normal_balance: 'debit' },
      ],

      // Journal
      journalEntries: [] as JournalEntry[],
      journalFilters: {
        dateFrom: '',
        dateTo: '',
        account: '',
        search: '',
      },
      journalCurrentPage: 1,
      journalItemsPerPage: 10,
      showAddJournalModal: false,
      editingJournal: null as JournalEntry | null,
      journalForm: {
        date: new Date().toISOString().split('T')[0],
        journalNumber: '',
        description: '',
        details: [
          { accountCode: '', description: '', debit: 0, credit: 0, reference: '' },
          { accountCode: '', description: '', debit: 0, credit: 0, reference: '' },
        ],
        totalDebit: 0,
        totalCredit: 0,
        submitted: false,
      },

      // Ledger
      selectedLedgerAccount: '',
      ledgerDetails: [] as LedgerEntry[],
      ledgerFilters: {
        dateFrom: '',
        dateTo: '',
      },
      ledgerSummary: {
        openingBalance: 0,
        totalMutation: 0,
        closingBalance: 0,
      },

      // Trial Balance
      trialBalanceDate: new Date().toISOString().split('T')[0],
      trialBalanceData: [] as TrialBalanceEntry[],
      trialBalanceTotals: {
        totalDebit: 0,
        totalCredit: 0,
      },

      // Reports
      reportFilters: {
        incomeStatement: {
          dateFrom: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0],
        },
        balanceSheet: {
          date: new Date().toISOString().split('T')[0],
        },
      },
      incomeStatementData: null as IncomeStatementData | null,
      balanceSheetData: null as BalanceSheetData | null,
    }
  },

  computed: {
    paginatedJournalEntries() {
      const start = (this.journalCurrentPage - 1) * this.journalItemsPerPage
      const end = start + this.journalItemsPerPage
      return this.journalEntries.slice(start, end)
    },

    journalTotalPages() {
      return Math.ceil(this.journalEntries.length / this.journalItemsPerPage)
    },

    journalVisiblePages() {
      const pages = []
      const start = Math.max(1, this.journalCurrentPage - 2)
      const end = Math.min(this.journalTotalPages, this.journalCurrentPage + 2)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    },

    selectedAccountInfo() {
      return this.chartOfAccounts.find((acc) => acc.code === this.selectedLedgerAccount)
    },
  },

  async mounted() {
    await this.loadJournalEntries()
    await this.loadTrialBalance()
    await this.loadIncomeStatement()
    await this.loadBalanceSheet()
  },

  methods: {
    async refreshData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadJournalEntries(),
          this.loadTrialBalance(),
          this.loadIncomeStatement(),
          this.loadBalanceSheet(),
        ])
      } finally {
        this.loading = false
      }
    },

    async loadJournalEntries() {
      this.loading = true
      try {
        // Mock data - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.journalEntries = [
          {
            id: 1,
            date: '2024-01-15',
            journal_number: 'JU001',
            description: 'Setoran simpanan anggota',
            details: [
              {
                id: 1,
                account_code: '1100',
                account_name: 'Kas',
                description: 'Penerimaan setoran anggota',
                debit: 1000000,
                credit: 0,
                reference: 'SET001',
              },
              {
                id: 2,
                account_code: '2100',
                account_name: 'Simpanan Anggota',
                description: 'Setoran simpanan pokok',
                debit: 0,
                credit: 1000000,
                reference: 'SET001',
              },
            ],
          },
        ]
      } catch (error) {
        console.error('Error loading journal entries:', error)
        this.$toast?.error('Gagal memuat data jurnal')
      } finally {
        this.loading = false
      }
    },

    async loadLedgerDetails() {
      if (!this.selectedLedgerAccount) return

      this.loading = true
      try {
        // Mock data - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.ledgerDetails = [
          {
            id: 1,
            date: '2024-01-15',
            description: 'Penerimaan setoran anggota',
            reference: 'SET001',
            debit: 1000000,
            credit: 0,
            running_balance: 1000000,
          },
        ]

        this.ledgerSummary = {
          openingBalance: 0,
          totalMutation: 1000000,
          closingBalance: 1000000,
        }
      } catch (error) {
        console.error('Error loading ledger details:', error)
        this.$toast?.error('Gagal memuat buku besar')
      } finally {
        this.loading = false
      }
    },

    async loadTrialBalance() {
      this.loading = true
      try {
        // Mock data - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.trialBalanceData = [
          {
            category: 'Aset',
            accounts: [
              { code: '1100', name: 'Kas', debit_balance: 5000000, credit_balance: 0 },
              { code: '1200', name: 'Bank', debit_balance: 15000000, credit_balance: 0 },
              { code: '1300', name: 'Piutang Anggota', debit_balance: 8000000, credit_balance: 0 },
            ],
          },
          {
            category: 'Kewajiban',
            accounts: [
              {
                code: '2100',
                name: 'Simpanan Anggota',
                debit_balance: 0,
                credit_balance: 20000000,
              },
              { code: '2200', name: 'Hutang Usaha', debit_balance: 0, credit_balance: 2000000 },
            ],
          },
          {
            category: 'Ekuitas',
            accounts: [
              { code: '3100', name: 'Modal Koperasi', debit_balance: 0, credit_balance: 5000000 },
              { code: '3200', name: 'Cadangan Umum', debit_balance: 0, credit_balance: 1000000 },
            ],
          },
        ]

        // Calculate totals
        let totalDebit = 0
        let totalCredit = 0

        this.trialBalanceData.forEach((category) => {
          category.accounts.forEach((account) => {
            totalDebit += account.debit_balance
            totalCredit += account.credit_balance
          })
        })

        this.trialBalanceTotals = {
          totalDebit,
          totalCredit,
        }
      } catch (error) {
        console.error('Error loading trial balance:', error)
        this.$toast?.error('Gagal memuat neraca saldo')
      } finally {
        this.loading = false
      }
    },

    async loadIncomeStatement() {
      this.loading = true
      try {
        // Mock data - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const revenue = [
          { account_code: '4100', account_name: 'Pendapatan Jasa', amount: 5000000 },
          { account_code: '4200', account_name: 'Pendapatan Bunga', amount: 2000000 },
        ]

        const expenses = [
          { account_code: '5100', account_name: 'Beban Operasional', amount: 3000000 },
          { account_code: '5200', account_name: 'Beban Administrasi', amount: 1000000 },
        ]

        const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0)
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)

        this.incomeStatementData = {
          revenue,
          expenses,
          totalRevenue,
          totalExpenses,
          netIncome: totalRevenue - totalExpenses,
        }
      } catch (error) {
        console.error('Error loading income statement:', error)
        this.$toast?.error('Gagal memuat laporan laba rugi')
      } finally {
        this.loading = false
      }
    },

    async loadBalanceSheet() {
      this.loading = true
      try {
        // Mock data - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const assets = [
          { account_code: '1100', account_name: 'Kas', amount: 5000000 },
          { account_code: '1200', account_name: 'Bank', amount: 15000000 },
          { account_code: '1300', account_name: 'Piutang Anggota', amount: 8000000 },
        ]

        const liabilities = [
          { account_code: '2100', account_name: 'Simpanan Anggota', amount: 20000000 },
          { account_code: '2200', account_name: 'Hutang Usaha', amount: 2000000 },
        ]

        const equity = [
          { account_code: '3100', account_name: 'Modal Koperasi', amount: 5000000 },
          { account_code: '3200', account_name: 'Cadangan Umum', amount: 1000000 },
        ]

        const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0)
        const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0)
        const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0)

        this.balanceSheetData = {
          assets,
          liabilities,
          equity,
          totalAssets,
          totalLiabilities,
          totalEquity,
          totalLiabilitiesEquity: totalLiabilities + totalEquity,
        }
      } catch (error) {
        console.error('Error loading balance sheet:', error)
        this.$toast?.error('Gagal memuat neraca')
      } finally {
        this.loading = false
      }
    },

    // Journal methods
    openAddJournalModal() {
      this.editingJournal = null
      this.resetJournalForm()
      this.showAddJournalModal = true
    },

    closeAddJournalModal() {
      this.showAddJournalModal = false
      this.editingJournal = null
      this.resetJournalForm()
    },

    resetJournalForm() {
      this.journalForm = {
        date: new Date().toISOString().split('T')[0],
        journalNumber: '',
        description: '',
        details: [
          { accountCode: '', description: '', debit: 0, credit: 0, reference: '' },
          { accountCode: '', description: '', debit: 0, credit: 0, reference: '' },
        ],
        totalDebit: 0,
        totalCredit: 0,
        submitted: false,
      }
    },

    addJournalDetail() {
      this.journalForm.details.push({
        accountCode: '',
        description: '',
        debit: 0,
        credit: 0,
        reference: '',
      })
    },

    removeJournalDetail(index: number) {
      if (this.journalForm.details.length > 2) {
        this.journalForm.details.splice(index, 1)
        this.validateJournalBalance()
      }
    },

    validateJournalBalance() {
      let totalDebit = 0
      let totalCredit = 0

      this.journalForm.details.forEach((detail) => {
        totalDebit += Number(detail.debit) || 0
        totalCredit += Number(detail.credit) || 0
      })

      this.journalForm.totalDebit = totalDebit
      this.journalForm.totalCredit = totalCredit
    },

    async saveJournalEntry() {
      this.journalForm.submitted = true

      if (!this.journalForm.date || !this.journalForm.description) {
        return
      }

      if (
        this.journalForm.totalDebit !== this.journalForm.totalCredit ||
        this.journalForm.totalDebit === 0
      ) {
        this.$toast?.error('Jurnal harus balance dan tidak boleh nol')
        return
      }

      this.processing = true
      try {
        // Mock API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Add to journal entries (mock)
        const newEntry = {
          id: this.journalEntries.length + 1,
          date: this.journalForm.date,
          journal_number:
            this.journalForm.journalNumber ||
            `JU${String(this.journalEntries.length + 1).padStart(3, '0')}`,
          description: this.journalForm.description,
          details: this.journalForm.details.map((detail, index) => ({
            id: index + 1,
            account_code: detail.accountCode,
            account_name:
              this.chartOfAccounts.find((acc) => acc.code === detail.accountCode)?.name || '',
            description: detail.description,
            debit: Number(detail.debit) || 0,
            credit: Number(detail.credit) || 0,
            reference: detail.reference,
          })),
        }

        if (this.editingJournal) {
          // Update existing entry
          const index = this.journalEntries.findIndex(
            (entry) => entry.id === this.editingJournal!.id,
          )
          if (index !== -1) {
            this.journalEntries[index] = newEntry
          }
        } else {
          // Add new entry
          this.journalEntries.unshift(newEntry)
        }

        this.closeAddJournalModal()
        this.$toast?.success('Jurnal berhasil disimpan')
      } catch (error) {
        console.error('Error saving journal entry:', error)
        this.$toast?.error('Gagal menyimpan jurnal')
      } finally {
        this.processing = false
      }
    },

    editJournalEntry(entry: JournalEntry) {
      this.editingJournal = entry
      this.journalForm = {
        date: entry.date,
        journalNumber: entry.journal_number,
        description: entry.description,
        details: entry.details.map((detail: JournalDetail) => ({
          accountCode: detail.account_code,
          description: detail.description,
          debit: detail.debit,
          credit: detail.credit,
          reference: detail.reference || '',
        })),
        totalDebit: 0,
        totalCredit: 0,
        submitted: false,
      }
      this.validateJournalBalance()
      this.showAddJournalModal = true
    },

    async deleteJournalEntry(entryId: number) {
      if (confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
        try {
          // Mock API call - replace with actual API
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const index = this.journalEntries.findIndex((entry) => entry.id === entryId)
          if (index !== -1) {
            this.journalEntries.splice(index, 1)
          }

          this.$toast?.success('Jurnal berhasil dihapus')
        } catch (error) {
          console.error('Error deleting journal entry:', error)
          this.$toast?.error('Gagal menghapus jurnal')
        }
      }
    },

    // Export methods
    generateFinancialReport() {
      this.$toast?.info('Generating comprehensive financial report...')
    },

    exportTrialBalance() {
      this.$toast?.info('Exporting trial balance...')
    },

    exportIncomeStatement() {
      this.$toast?.info('Exporting income statement...')
    },

    exportBalanceSheet() {
      this.$toast?.info('Exporting balance sheet...')
    },

    // Utility methods
    formatDate(dateString: string) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },

    formatCurrency(amount: number) {
      if (!amount && amount !== 0) return '0'
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

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  background-color: #fff;
  border-bottom: 2px solid #0d6efd;
  color: #0d6efd;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: #0d6efd;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-top: none;
}

.table-responsive {
  border-radius: 0.375rem;
}

.badge {
  font-size: 0.75em;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.modal.show {
  display: block !important;
}

.table-bordered td,
.table-bordered th {
  border: 1px solid #dee2e6;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.text-success {
  color: #198754 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-primary {
  color: #0d6efd !important;
}

.text-warning {
  color: #fd7e14 !important;
}

.text-info {
  color: #0dcaf0 !important;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.alert {
  border-radius: 0.5rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>

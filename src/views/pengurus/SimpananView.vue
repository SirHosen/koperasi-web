<script setup lang="ts">
import { ref, computed } from 'vue'

// Mock data for simpanan
interface SimpananEntry {
  id: string
  anggotaId: string
  jenis: 'pokok' | 'wajib' | 'sukarela'
  jumlah: number
  tanggal: string
  keterangan?: string
  metodePembayaran: string
  status: 'berhasil' | 'pending' | 'gagal'
  buktiTransfer?: string
}

interface AnggotaSimpanan {
  id: string
  nama: string
  pokok: number
  wajib: number
  sukarela: number
  total: number
  lastUpdate: string
  status: 'aktif' | 'nonaktif'
}

// Mock data for anggota simpanan summary
const anggotaSimpanan = ref<AnggotaSimpanan[]>([
  {
    id: 'A-20230056',
    nama: 'Budi Santoso',
    pokok: 500000,
    wajib: 3600000,
    sukarela: 1150000,
    total: 5250000,
    lastUpdate: '2025-09-21T14:30:00Z',
    status: 'aktif',
  },
  {
    id: 'A-20210034',
    nama: 'Dewi Lestari',
    pokok: 500000,
    wajib: 7200000,
    sukarela: 1050000,
    total: 8750000,
    lastUpdate: '2025-09-20T10:15:00Z',
    status: 'aktif',
  },
  {
    id: 'A-20230001',
    nama: 'Ahmad Fadli',
    pokok: 500000,
    wajib: 1600000,
    sukarela: 0,
    total: 2100000,
    lastUpdate: '2025-09-19T09:45:00Z',
    status: 'aktif',
  },
  {
    id: 'A-20220078',
    nama: 'Siti Nurhaliza',
    pokok: 500000,
    wajib: 4000000,
    sukarela: 0,
    total: 4500000,
    lastUpdate: '2025-09-18T16:20:00Z',
    status: 'aktif',
  },
  {
    id: 'A-20210092',
    nama: 'Rudi Hermawan',
    pokok: 500000,
    wajib: 7600000,
    sukarela: 4400000,
    total: 12500000,
    lastUpdate: '2025-09-22T11:10:00Z',
    status: 'aktif',
  },
  {
    id: 'A-20240012',
    nama: 'Lia Indrawati',
    pokok: 500000,
    wajib: 1200000,
    sukarela: 50000,
    total: 1750000,
    lastUpdate: '2025-09-15T13:40:00Z',
    status: 'aktif',
  },
  {
    id: 'A-20240045',
    nama: 'Doni Kusuma',
    pokok: 500000,
    wajib: 900000,
    sukarela: 1850000,
    total: 3250000,
    lastUpdate: '2025-09-17T15:25:00Z',
    status: 'aktif',
  },
  {
    id: 'A-20220103',
    nama: 'Rina Wijaya',
    pokok: 500000,
    wajib: 4300000,
    sukarela: 3500000,
    total: 8300000,
    lastUpdate: '2025-09-14T10:50:00Z',
    status: 'aktif',
  },
  {
    id: 'A-20230091',
    nama: 'Taufik Hidayat',
    pokok: 500000,
    wajib: 0,
    sukarela: 0,
    total: 500000,
    lastUpdate: '2025-06-10T09:30:00Z',
    status: 'nonaktif',
  },
])

// Mock data for recent transactions
const recentTransactions = ref<SimpananEntry[]>([
  {
    id: 'SP-20250923-001',
    anggotaId: 'A-20230056',
    jenis: 'wajib',
    jumlah: 100000,
    tanggal: '2025-09-23T09:15:00Z',
    metodePembayaran: 'Transfer Bank',
    status: 'berhasil',
    buktiTransfer: '/images/bukti/sp001.jpg',
  },
  {
    id: 'SP-20250923-002',
    anggotaId: 'A-20210034',
    jenis: 'sukarela',
    jumlah: 500000,
    tanggal: '2025-09-23T10:30:00Z',
    metodePembayaran: 'Transfer Bank',
    status: 'berhasil',
    buktiTransfer: '/images/bukti/sp002.jpg',
  },
  {
    id: 'SP-20250923-003',
    anggotaId: 'A-20240012',
    jenis: 'wajib',
    jumlah: 100000,
    tanggal: '2025-09-23T11:05:00Z',
    metodePembayaran: 'Tunai',
    status: 'berhasil',
  },
  {
    id: 'SP-20250923-004',
    anggotaId: 'A-20240045',
    jenis: 'wajib',
    jumlah: 100000,
    tanggal: '2025-09-23T13:20:00Z',
    metodePembayaran: 'Transfer Bank',
    status: 'pending',
    buktiTransfer: '/images/bukti/sp004.jpg',
  },
  {
    id: 'SP-20250923-005',
    anggotaId: 'A-20230091',
    jenis: 'wajib',
    jumlah: 100000,
    tanggal: '2025-09-23T14:45:00Z',
    metodePembayaran: 'Transfer Bank',
    status: 'pending',
    buktiTransfer: '/images/bukti/sp005.jpg',
  },
  {
    id: 'SP-20250922-001',
    anggotaId: 'A-20210092',
    jenis: 'sukarela',
    jumlah: 1000000,
    tanggal: '2025-09-22T08:10:00Z',
    metodePembayaran: 'Transfer Bank',
    status: 'berhasil',
    buktiTransfer: '/images/bukti/sp006.jpg',
  },
  {
    id: 'SP-20250922-002',
    anggotaId: 'A-20220078',
    jenis: 'wajib',
    jumlah: 100000,
    tanggal: '2025-09-22T10:35:00Z',
    metodePembayaran: 'Tunai',
    status: 'berhasil',
  },
  {
    id: 'SP-20250922-003',
    anggotaId: 'A-20220103',
    jenis: 'sukarela',
    jumlah: 500000,
    tanggal: '2025-09-22T15:50:00Z',
    metodePembayaran: 'Transfer Bank',
    status: 'berhasil',
    buktiTransfer: '/images/bukti/sp008.jpg',
  },
])

// UI state
const selectedView = ref<'summary' | 'transactions'>('summary')
const selectedAnggota = ref<string | null>(null)
const searchQuery = ref('')
const sortBy = ref<string>('total')
const sortOrder = ref<'asc' | 'desc'>('desc')
const filterStatus = ref<'all' | 'aktif' | 'nonaktif'>('all')
const filterTransactionStatus = ref<'all' | 'berhasil' | 'pending' | 'gagal'>('all')
const filterJenisSimpanan = ref<'all' | 'pokok' | 'wajib' | 'sukarela'>('all')

// Format utilities
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get anggota name by ID
const getAnggotaName = (id: string) => {
  const anggota = anggotaSimpanan.value.find((a) => a.id === id)
  return anggota ? anggota.nama : id
}

// Filter and sort anggota simpanan
const filteredSimpanan = computed(() => {
  let filtered = [...anggotaSimpanan.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (simpanan) =>
        simpanan.id.toLowerCase().includes(query) || simpanan.nama.toLowerCase().includes(query),
    )
  }

  // Apply status filter
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter((simpanan) => simpanan.status === filterStatus.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const valueA = a[sortBy.value as keyof AnggotaSimpanan]
    const valueB = b[sortBy.value as keyof AnggotaSimpanan]

    if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
    if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

// Filter transactions
const filteredTransactions = computed(() => {
  let filtered = [...recentTransactions.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (tx) =>
        tx.id.toLowerCase().includes(query) ||
        tx.anggotaId.toLowerCase().includes(query) ||
        getAnggotaName(tx.anggotaId).toLowerCase().includes(query),
    )
  }

  // Apply status filter
  if (filterTransactionStatus.value !== 'all') {
    filtered = filtered.filter((tx) => tx.status === filterTransactionStatus.value)
  }

  // Apply jenis simpanan filter
  if (filterJenisSimpanan.value !== 'all') {
    filtered = filtered.filter((tx) => tx.jenis === filterJenisSimpanan.value)
  }

  // Always sort by date descending
  filtered.sort((a, b) => {
    return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  })

  return filtered
})

// Summary calculations
const simpananSummary = computed(() => {
  let totalPokok = 0
  let totalWajib = 0
  let totalSukarela = 0

  anggotaSimpanan.value.forEach((simpanan) => {
    totalPokok += simpanan.pokok
    totalWajib += simpanan.wajib
    totalSukarela += simpanan.sukarela
  })

  return {
    totalPokok,
    totalWajib,
    totalSukarela,
    totalKeseluruhan: totalPokok + totalWajib + totalSukarela,
    jumlahAnggota: anggotaSimpanan.value.filter((s) => s.status === 'aktif').length,
  }
})

// Handle sorting change
const changeSorting = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
}

// View anggota details
const viewAnggotaDetails = (id: string) => {
  selectedAnggota.value = id
}

// Close anggota details
const closeAnggotaDetails = () => {
  selectedAnggota.value = null
}

// Get transaction status class
const getTransactionStatusClass = (status: string) => {
  if (status === 'berhasil') return 'status-success'
  if (status === 'pending') return 'status-warning'
  return 'status-danger'
}

// Process pending transaction
const processTransaction = (transaction: SimpananEntry, action: 'approve' | 'reject') => {
  const index = recentTransactions.value.findIndex((t) => t.id === transaction.id)
  if (index === -1) return

  // Update transaction status
  recentTransactions.value[index] = {
    ...transaction,
    status: action === 'approve' ? 'berhasil' : 'gagal',
    keterangan: action === 'reject' ? 'Ditolak oleh pengurus' : undefined,
  }

  // If approved, update anggota simpanan balance
  if (action === 'approve') {
    const anggotaIndex = anggotaSimpanan.value.findIndex((a) => a.id === transaction.anggotaId)
    if (anggotaIndex === -1) return

    const anggota = anggotaSimpanan.value[anggotaIndex]
    const newTotal = anggota.total + transaction.jumlah

    anggotaSimpanan.value[anggotaIndex] = {
      ...anggota,
      [transaction.jenis]:
        (anggota[transaction.jenis as keyof AnggotaSimpanan] as number) + transaction.jumlah,
      total: newTotal,
      lastUpdate: new Date().toISOString(),
    }
  }
}
</script>

<template>
  <div class="simpanan-management">
    <div class="page-header">
      <h1>Pengelolaan Simpanan</h1>

      <div class="view-toggle">
        <button
          class="view-button"
          :class="{ active: selectedView === 'summary' }"
          @click="selectedView = 'summary'"
        >
          Ringkasan Simpanan
        </button>
        <button
          class="view-button"
          :class="{ active: selectedView === 'transactions' }"
          @click="selectedView = 'transactions'"
        >
          Transaksi
        </button>
      </div>
    </div>

    <!-- Overall Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card total-anggota">
        <div class="card-icon">👥</div>
        <div class="card-content">
          <div class="card-value">{{ simpananSummary.jumlahAnggota }}</div>
          <div class="card-label">Jumlah Anggota</div>
        </div>
      </div>

      <div class="summary-card total-simpanan">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <div class="card-value">{{ formatCurrency(simpananSummary.totalKeseluruhan) }}</div>
          <div class="card-label">Total Simpanan</div>
        </div>
      </div>

      <div class="summary-card simpanan-pokok">
        <div class="card-icon">🔷</div>
        <div class="card-content">
          <div class="card-value">{{ formatCurrency(simpananSummary.totalPokok) }}</div>
          <div class="card-label">Simpanan Pokok</div>
        </div>
      </div>

      <div class="summary-card simpanan-wajib">
        <div class="card-icon">🔶</div>
        <div class="card-content">
          <div class="card-value">{{ formatCurrency(simpananSummary.totalWajib) }}</div>
          <div class="card-label">Simpanan Wajib</div>
        </div>
      </div>

      <div class="summary-card simpanan-sukarela">
        <div class="card-icon">🟢</div>
        <div class="card-content">
          <div class="card-value">{{ formatCurrency(simpananSummary.totalSukarela) }}</div>
          <div class="card-label">Simpanan Sukarela</div>
        </div>
      </div>
    </div>

    <!-- Simpanan Summary View -->
    <div v-if="selectedView === 'summary'" class="section simpanan-summary-section">
      <div class="section-header">
        <h2>Daftar Simpanan Anggota</h2>

        <div class="filter-controls">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari ID / Nama Anggota"
            class="search-input"
          />

          <select v-model="filterStatus" class="filter-select">
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non-Aktif</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th @click="changeSorting('id')">
                ID Anggota
                <span v-if="sortBy === 'id'" class="sort-icon">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="changeSorting('nama')">
                Nama Anggota
                <span v-if="sortBy === 'nama'" class="sort-icon">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="changeSorting('pokok')">
                Simpanan Pokok
                <span v-if="sortBy === 'pokok'" class="sort-icon">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="changeSorting('wajib')">
                Simpanan Wajib
                <span v-if="sortBy === 'wajib'" class="sort-icon">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="changeSorting('sukarela')">
                Simpanan Sukarela
                <span v-if="sortBy === 'sukarela'" class="sort-icon">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="changeSorting('total')">
                Total
                <span v-if="sortBy === 'total'" class="sort-icon">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="simpanan in filteredSimpanan" :key="simpanan.id">
              <td>{{ simpanan.id }}</td>
              <td>{{ simpanan.nama }}</td>
              <td>{{ formatCurrency(simpanan.pokok) }}</td>
              <td>{{ formatCurrency(simpanan.wajib) }}</td>
              <td>{{ formatCurrency(simpanan.sukarela) }}</td>
              <td class="total-amount">{{ formatCurrency(simpanan.total) }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="simpanan.status === 'aktif' ? 'status-active' : 'status-inactive'"
                >
                  {{ simpanan.status === 'aktif' ? 'Aktif' : 'Non-Aktif' }}
                </span>
              </td>
              <td>
                <button class="action-button" @click="viewAnggotaDetails(simpanan.id)">
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredSimpanan.length === 0" class="empty-state">
          <p>Tidak ada data simpanan yang sesuai dengan filter</p>
        </div>
      </div>
    </div>

    <!-- Transactions View -->
    <div v-if="selectedView === 'transactions'" class="section transactions-section">
      <div class="section-header">
        <h2>Transaksi Simpanan</h2>

        <div class="filter-controls">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari ID Transaksi / Anggota"
            class="search-input"
          />

          <div class="filter-group">
            <select v-model="filterTransactionStatus" class="filter-select">
              <option value="all">Semua Status</option>
              <option value="berhasil">Berhasil</option>
              <option value="pending">Pending</option>
              <option value="gagal">Gagal</option>
            </select>

            <select v-model="filterJenisSimpanan" class="filter-select">
              <option value="all">Semua Jenis</option>
              <option value="pokok">Pokok</option>
              <option value="wajib">Wajib</option>
              <option value="sukarela">Sukarela</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table transactions-table">
          <thead>
            <tr>
              <th>ID Transaksi</th>
              <th>Anggota</th>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Jumlah</th>
              <th>Metode Pembayaran</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="transaction in filteredTransactions" :key="transaction.id">
              <td>{{ transaction.id }}</td>
              <td>{{ getAnggotaName(transaction.anggotaId) }}</td>
              <td>{{ formatDate(transaction.tanggal) }}</td>
              <td>
                <span class="jenis-badge" :class="`jenis-${transaction.jenis}`">
                  {{
                    transaction.jenis === 'pokok'
                      ? 'Pokok'
                      : transaction.jenis === 'wajib'
                        ? 'Wajib'
                        : 'Sukarela'
                  }}
                </span>
              </td>
              <td>{{ formatCurrency(transaction.jumlah) }}</td>
              <td>{{ transaction.metodePembayaran }}</td>
              <td>
                <span class="status-badge" :class="getTransactionStatusClass(transaction.status)">
                  {{
                    transaction.status === 'berhasil'
                      ? 'Berhasil'
                      : transaction.status === 'pending'
                        ? 'Menunggu'
                        : 'Gagal'
                  }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    v-if="transaction.status === 'pending'"
                    class="action-button approve"
                    @click="processTransaction(transaction, 'approve')"
                  >
                    ✓
                  </button>
                  <button
                    v-if="transaction.status === 'pending'"
                    class="action-button reject"
                    @click="processTransaction(transaction, 'reject')"
                  >
                    ✗
                  </button>
                  <button class="action-button view" v-if="transaction.buktiTransfer">👁️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredTransactions.length === 0" class="empty-state">
          <p>Tidak ada transaksi yang sesuai dengan filter</p>
        </div>
      </div>
    </div>

    <!-- Anggota Detail Modal -->
    <div v-if="selectedAnggota" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Detail Simpanan Anggota</h3>
          <button @click="closeAnggotaDetails" class="close-button">&times;</button>
        </div>

        <div class="modal-content">
          <div v-if="anggotaSimpanan.find((a) => a.id === selectedAnggota)" class="anggota-detail">
            <div class="anggota-info">
              <div class="info-item">
                <span class="info-label">ID Anggota:</span>
                <span class="info-value">{{
                  anggotaSimpanan.find((a) => a.id === selectedAnggota)?.id
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Nama:</span>
                <span class="info-value">{{
                  anggotaSimpanan.find((a) => a.id === selectedAnggota)?.nama
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span
                  class="status-badge"
                  :class="
                    anggotaSimpanan.find((a) => a.id === selectedAnggota)?.status === 'aktif'
                      ? 'status-active'
                      : 'status-inactive'
                  "
                >
                  {{
                    anggotaSimpanan.find((a) => a.id === selectedAnggota)?.status === 'aktif'
                      ? 'Aktif'
                      : 'Non-Aktif'
                  }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Terakhir Diperbarui:</span>
                <span class="info-value">{{
                  formatDate(
                    anggotaSimpanan.find((a) => a.id === selectedAnggota)?.lastUpdate || '',
                  )
                }}</span>
              </div>
            </div>

            <div class="savings-summary">
              <div class="savings-card">
                <div class="savings-type">Simpanan Pokok</div>
                <div class="savings-amount">
                  {{
                    formatCurrency(
                      anggotaSimpanan.find((a) => a.id === selectedAnggota)?.pokok || 0,
                    )
                  }}
                </div>
              </div>
              <div class="savings-card">
                <div class="savings-type">Simpanan Wajib</div>
                <div class="savings-amount">
                  {{
                    formatCurrency(
                      anggotaSimpanan.find((a) => a.id === selectedAnggota)?.wajib || 0,
                    )
                  }}
                </div>
              </div>
              <div class="savings-card">
                <div class="savings-type">Simpanan Sukarela</div>
                <div class="savings-amount">
                  {{
                    formatCurrency(
                      anggotaSimpanan.find((a) => a.id === selectedAnggota)?.sukarela || 0,
                    )
                  }}
                </div>
              </div>
              <div class="savings-card total">
                <div class="savings-type">Total</div>
                <div class="savings-amount">
                  {{
                    formatCurrency(
                      anggotaSimpanan.find((a) => a.id === selectedAnggota)?.total || 0,
                    )
                  }}
                </div>
              </div>
            </div>

            <div class="anggota-transactions">
              <h4>Riwayat Transaksi</h4>

              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID Transaksi</th>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="transaction in recentTransactions.filter(
                      (t) => t.anggotaId === selectedAnggota,
                    )"
                    :key="transaction.id"
                  >
                    <td>{{ transaction.id }}</td>
                    <td>{{ formatDate(transaction.tanggal) }}</td>
                    <td>
                      <span class="jenis-badge" :class="`jenis-${transaction.jenis}`">
                        {{
                          transaction.jenis === 'pokok'
                            ? 'Pokok'
                            : transaction.jenis === 'wajib'
                              ? 'Wajib'
                              : 'Sukarela'
                        }}
                      </span>
                    </td>
                    <td>{{ formatCurrency(transaction.jumlah) }}</td>
                    <td>
                      <span
                        class="status-badge"
                        :class="getTransactionStatusClass(transaction.status)"
                      >
                        {{
                          transaction.status === 'berhasil'
                            ? 'Berhasil'
                            : transaction.status === 'pending'
                              ? 'Menunggu'
                              : 'Gagal'
                        }}
                      </span>
                    </td>
                  </tr>

                  <tr
                    v-if="
                      recentTransactions.filter((t) => t.anggotaId === selectedAnggota).length === 0
                    "
                  >
                    <td colspan="5" class="no-transactions">
                      <p>Tidak ada riwayat transaksi</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="modal-actions">
              <button class="action-button">Cetak Laporan</button>
              <button class="action-button primary" @click="closeAnggotaDetails">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simpanan-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-button {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
}

.view-button.active {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: 1.75rem;
  background-color: #f3f4f6;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.card-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.total-anggota .card-icon {
  background-color: #dbeafe;
}

.total-simpanan .card-icon {
  background-color: #c7d2fe;
}

.simpanan-pokok .card-icon {
  background-color: #e0e7ff;
}

.simpanan-wajib .card-icon {
  background-color: #fef3c7;
}

.simpanan-sukarela .card-icon {
  background-color: #d1fae5;
}

/* Section Styling */
.section {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  min-width: 250px;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

/* Table Styling */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f9fafb;
  padding: 0.75rem 1rem;
  text-align: left;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
}

.data-table th:hover {
  background-color: #f3f4f6;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
  color: #4b5563;
}

.sort-icon {
  margin-left: 0.25rem;
  color: #9ca3af;
}

.total-amount {
  font-weight: 600;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.status-danger {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* Transaction Jenis Badges */
.jenis-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.jenis-pokok {
  background-color: #e0e7ff;
  color: #3730a3;
}

.jenis-wajib {
  background-color: #fef3c7;
  color: #92400e;
}

.jenis-sukarela {
  background-color: #d1fae5;
  color: #065f46;
}

/* Action Buttons */
.action-button {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: #eff6ff;
  color: #1d4ed8;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.action-button.approve {
  background-color: #d1fae5;
  color: #065f46;
}

.action-button.reject {
  background-color: #fee2e2;
  color: #b91c1c;
}

.action-button.view {
  background-color: #f3f4f6;
  color: #4b5563;
}

.action-button.primary {
  background-color: #10b981;
  color: white;
}

/* Empty State */
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
}

.modal-content {
  padding: 1.5rem;
}

/* Anggota Detail */
.anggota-detail {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.anggota-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.info-value {
  font-weight: 500;
}

/* Savings Summary */
.savings-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.savings-card {
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: #f9fafb;
  text-align: center;
}

.savings-card.total {
  background-color: #10b981;
  color: white;
}

.savings-type {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.savings-amount {
  font-size: 1.125rem;
  font-weight: 700;
}

/* Anggota Transactions */
.anggota-transactions {
  margin-top: 1rem;
}

.anggota-transactions h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.no-transactions {
  text-align: center;
  color: #6b7280;
  padding: 1.5rem;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.modal-actions .action-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filter-controls {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-input {
    width: 100%;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .anggota-info {
    grid-template-columns: 1fr;
  }

  .savings-summary {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

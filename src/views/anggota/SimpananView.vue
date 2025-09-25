<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Types
interface SimpananData {
  pokok: number
  wajib: number
  sukarela: number
  total: number
  lastUpdate: string
}

interface TransaksiSimpanan {
  id: string
  jenis: 'pokok' | 'wajib' | 'sukarela'
  nominal: number
  tanggal: string
  keterangan: string
  bukti: string | null
  status: 'berhasil' | 'pending' | 'gagal'
}

// Simpanan data
const simpanan = ref<SimpananData>({
  pokok: 500000,
  wajib: 3600000,
  sukarela: 1150000,
  total: 5250000,
  lastUpdate: '2025-09-21T14:30:00Z',
})

// Transaksi simpanan data
const transaksiSimpanan = ref<TransaksiSimpanan[]>([
  {
    id: 'TS-25092101',
    jenis: 'wajib',
    nominal: 100000,
    tanggal: '2025-09-21T14:30:00Z',
    keterangan: 'Simpanan wajib bulan September 2025',
    bukti: 'bukti-transfer-sep2025.jpg',
    status: 'berhasil',
  },
  {
    id: 'TS-25091001',
    jenis: 'sukarela',
    nominal: 250000,
    tanggal: '2025-09-10T09:20:00Z',
    keterangan: 'Tambahan simpanan sukarela',
    bukti: 'bukti-transfer-sukarela-sep2025.jpg',
    status: 'berhasil',
  },
  {
    id: 'TS-25082001',
    jenis: 'wajib',
    nominal: 100000,
    tanggal: '2025-08-20T11:30:00Z',
    keterangan: 'Simpanan wajib bulan Agustus 2025',
    bukti: 'bukti-transfer-aug2025.jpg',
    status: 'berhasil',
  },
  {
    id: 'TS-25071501',
    jenis: 'wajib',
    nominal: 100000,
    tanggal: '2025-07-15T10:45:00Z',
    keterangan: 'Simpanan wajib bulan Juli 2025',
    bukti: 'bukti-transfer-jul2025.jpg',
    status: 'berhasil',
  },
  {
    id: 'TS-25070501',
    jenis: 'sukarela',
    nominal: 500000,
    tanggal: '2025-07-05T08:30:00Z',
    keterangan: 'Tambahan simpanan sukarela',
    bukti: 'bukti-transfer-sukarela-jul2025.jpg',
    status: 'berhasil',
  },
])

// UI state
const activeTab = ref('ringkasan')
const showAddSimpananForm = ref(false)
const filterStatus = ref('all')
const filterJenis = ref('all')
const sortBy = ref('tanggal')
const sortDirection = ref('desc')
const searchQuery = ref('')
const sukarelaAmount = ref(0)
const simpananKeterangan = ref('')
const selectedFile = ref<File | null>(null)

// Format utilities
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Filtered and sorted transactions
const filteredTransactions = computed(() => {
  let result = [...transaksiSimpanan.value]

  // Filter by status
  if (filterStatus.value !== 'all') {
    result = result.filter((item) => item.status === filterStatus.value)
  }

  // Filter by jenis
  if (filterJenis.value !== 'all') {
    result = result.filter((item) => item.jenis === filterJenis.value)
  }

  // Search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.keterangan.toLowerCase().includes(query) ||
        formatCurrency(item.nominal).toLowerCase().includes(query),
    )
  }

  // Sort
  result.sort((a, b) => {
    if (sortBy.value === 'tanggal') {
      return sortDirection.value === 'asc'
        ? new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
        : new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    } else if (sortBy.value === 'nominal') {
      return sortDirection.value === 'asc' ? a.nominal - b.nominal : b.nominal - a.nominal
    } else if (sortBy.value === 'jenis') {
      return sortDirection.value === 'asc'
        ? a.jenis.localeCompare(b.jenis)
        : b.jenis.localeCompare(a.jenis)
    }
    return 0
  })

  return result
})

// Actions
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

const toggleAddSimpananForm = () => {
  showAddSimpananForm.value = !showAddSimpananForm.value
  if (!showAddSimpananForm.value) {
    // Reset form
    sukarelaAmount.value = 0
    simpananKeterangan.value = ''
    selectedFile.value = null
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0]
  }
}

const submitSimpanan = () => {
  // Here we would normally submit to an API
  // For now, we'll just add to our local state

  if (sukarelaAmount.value <= 0) {
    alert('Jumlah simpanan harus lebih dari 0')
    return
  }

  const newTransaksi: TransaksiSimpanan = {
    id: `TS-${new Date().getTime().toString().substring(0, 8)}`,
    jenis: 'sukarela',
    nominal: sukarelaAmount.value,
    tanggal: new Date().toISOString(),
    keterangan: simpananKeterangan.value || 'Tambahan simpanan sukarela',
    bukti: selectedFile.value ? selectedFile.value.name : null,
    status: 'pending',
  }

  transaksiSimpanan.value.unshift(newTransaksi)
  toggleAddSimpananForm()

  // Show success message
  alert('Permintaan simpanan sukarela berhasil diajukan dan sedang menunggu verifikasi')
}
</script>

<template>
  <div class="simpanan-container">
    <div class="page-header">
      <h1>Simpanan Saya</h1>
      <button class="action-button primary" @click="toggleAddSimpananForm">
        + Tambah Simpanan Sukarela
      </button>
    </div>

    <div class="tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'ringkasan' }"
        @click="setActiveTab('ringkasan')"
      >
        Ringkasan
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'riwayat' }"
        @click="setActiveTab('riwayat')"
      >
        Riwayat Transaksi
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'informasi' }"
        @click="setActiveTab('informasi')"
      >
        Informasi
      </button>
    </div>

    <!-- Ringkasan Tab -->
    <div v-if="activeTab === 'ringkasan'" class="tab-content">
      <div class="simpanan-summary">
        <div class="summary-card total">
          <h3>Total Simpanan</h3>
          <div class="amount">{{ formatCurrency(simpanan.total) }}</div>
          <div class="last-update">
            Terakhir diperbarui: {{ formatDateTime(simpanan.lastUpdate) }}
          </div>
        </div>

        <div class="simpanan-details-grid">
          <div class="summary-card">
            <div class="card-header">
              <h3>Simpanan Pokok</h3>
              <div class="amount">{{ formatCurrency(simpanan.pokok) }}</div>
            </div>
            <div class="card-content">
              <p>Simpanan awal yang dibayarkan saat pertama menjadi anggota koperasi.</p>
              <div class="stat-label">Status: <span class="status-badge success">Lunas</span></div>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Simpanan Wajib</h3>
              <div class="amount">{{ formatCurrency(simpanan.wajib) }}</div>
            </div>
            <div class="card-content">
              <p>Simpanan berkala yang wajib dibayarkan setiap bulan.</p>
              <div class="stat-label">
                Status Bulan Ini: <span class="status-badge success">Lunas</span>
              </div>
              <div class="stat-label">Jumlah per Bulan: {{ formatCurrency(100000) }}</div>
              <div class="stat-label">
                Jatuh Tempo Berikutnya: {{ formatDate('2025-10-15T00:00:00Z') }}
              </div>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-header">
              <h3>Simpanan Sukarela</h3>
              <div class="amount">{{ formatCurrency(simpanan.sukarela) }}</div>
            </div>
            <div class="card-content">
              <p>Simpanan tambahan yang dapat disetorkan atau ditarik sesuai keinginan.</p>
              <button class="action-button" @click="toggleAddSimpananForm">
                + Tambah Simpanan Sukarela
              </button>
            </div>
          </div>
        </div>

        <div class="recent-transactions">
          <div class="section-header">
            <h3>Transaksi Terbaru</h3>
            <button class="view-all-button" @click="setActiveTab('riwayat')">Lihat Semua</button>
          </div>

          <div class="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>ID Transaksi</th>
                  <th>Tanggal</th>
                  <th>Jenis</th>
                  <th>Nominal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in transaksiSimpanan.slice(0, 3)" :key="tx.id">
                  <td>{{ tx.id }}</td>
                  <td>{{ formatDateTime(tx.tanggal) }}</td>
                  <td>
                    <span class="jenis-badge" :class="tx.jenis">
                      {{
                        tx.jenis === 'pokok'
                          ? 'Simpanan Pokok'
                          : tx.jenis === 'wajib'
                            ? 'Simpanan Wajib'
                            : 'Simpanan Sukarela'
                      }}
                    </span>
                  </td>
                  <td class="amount">{{ formatCurrency(tx.nominal) }}</td>
                  <td>
                    <span
                      class="status-badge"
                      :class="{
                        success: tx.status === 'berhasil',
                        warning: tx.status === 'pending',
                        danger: tx.status === 'gagal',
                      }"
                    >
                      {{
                        tx.status === 'berhasil'
                          ? 'Berhasil'
                          : tx.status === 'pending'
                            ? 'Menunggu'
                            : 'Gagal'
                      }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Riwayat Tab -->
    <div v-if="activeTab === 'riwayat'" class="tab-content">
      <div class="filter-controls">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari transaksi..."
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <label>Jenis:</label>
          <select v-model="filterJenis">
            <option value="all">Semua</option>
            <option value="pokok">Simpanan Pokok</option>
            <option value="wajib">Simpanan Wajib</option>
            <option value="sukarela">Simpanan Sukarela</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select v-model="filterStatus">
            <option value="all">Semua</option>
            <option value="berhasil">Berhasil</option>
            <option value="pending">Menunggu</option>
            <option value="gagal">Gagal</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Urutkan:</label>
          <select v-model="sortBy">
            <option value="tanggal">Tanggal</option>
            <option value="nominal">Nominal</option>
            <option value="jenis">Jenis</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Arah:</label>
          <button
            class="sort-button"
            @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
          >
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>

      <div class="transactions-table full">
        <table>
          <thead>
            <tr>
              <th>ID Transaksi</th>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Nominal</th>
              <th>Keterangan</th>
              <th>Status</th>
              <th>Bukti</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in filteredTransactions" :key="tx.id">
              <td>{{ tx.id }}</td>
              <td>{{ formatDateTime(tx.tanggal) }}</td>
              <td>
                <span class="jenis-badge" :class="tx.jenis">
                  {{
                    tx.jenis === 'pokok'
                      ? 'Simpanan Pokok'
                      : tx.jenis === 'wajib'
                        ? 'Simpanan Wajib'
                        : 'Simpanan Sukarela'
                  }}
                </span>
              </td>
              <td class="amount">{{ formatCurrency(tx.nominal) }}</td>
              <td>{{ tx.keterangan }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="{
                    success: tx.status === 'berhasil',
                    warning: tx.status === 'pending',
                    danger: tx.status === 'gagal',
                  }"
                >
                  {{
                    tx.status === 'berhasil'
                      ? 'Berhasil'
                      : tx.status === 'pending'
                        ? 'Menunggu'
                        : 'Gagal'
                  }}
                </span>
              </td>
              <td>
                <button v-if="tx.bukti" class="action-button small">Lihat Bukti</button>
                <span v-else>-</span>
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="7" class="no-data">Tidak ada transaksi yang sesuai dengan filter</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Informasi Tab -->
    <div v-if="activeTab === 'informasi'" class="tab-content">
      <div class="info-section">
        <div class="info-cards">
          <div class="info-card">
            <h3>Simpanan Pokok</h3>
            <p>
              Simpanan pokok adalah sejumlah uang yang wajib dibayarkan oleh anggota kepada koperasi
              pada saat masuk menjadi anggota. Simpanan ini tidak dapat diambil kembali selama yang
              bersangkutan masih menjadi anggota koperasi.
            </p>
            <div class="info-details">
              <div class="info-item">
                <div class="info-label">Besaran:</div>
                <div class="info-value">{{ formatCurrency(500000) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Pembayaran:</div>
                <div class="info-value">Satu kali saat pendaftaran</div>
              </div>
              <div class="info-item">
                <div class="info-label">Penarikan:</div>
                <div class="info-value">Hanya saat berhenti menjadi anggota</div>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3>Simpanan Wajib</h3>
            <p>
              Simpanan wajib adalah jumlah simpanan tertentu yang harus dibayarkan oleh anggota
              kepada koperasi dalam waktu dan kesempatan tertentu, misalnya setiap bulan dengan
              jumlah simpanan yang sama. Simpanan ini tidak dapat diambil kembali selama yang
              bersangkutan masih menjadi anggota koperasi.
            </p>
            <div class="info-details">
              <div class="info-item">
                <div class="info-label">Besaran:</div>
                <div class="info-value">{{ formatCurrency(100000) }} per bulan</div>
              </div>
              <div class="info-item">
                <div class="info-label">Tenggat Waktu:</div>
                <div class="info-value">Setiap tanggal 15</div>
              </div>
              <div class="info-item">
                <div class="info-label">Penarikan:</div>
                <div class="info-value">Hanya saat berhenti menjadi anggota</div>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3>Simpanan Sukarela</h3>
            <p>
              Simpanan sukarela adalah simpanan yang besarnya tidak ditentukan, tetapi bergantung
              kepada kemampuan anggota. Simpanan ini dapat disetorkan dan diambil kapan saja oleh
              anggota.
            </p>
            <div class="info-details">
              <div class="info-item">
                <div class="info-label">Besaran:</div>
                <div class="info-value">Tidak ditentukan (minimal {{ formatCurrency(10000) }})</div>
              </div>
              <div class="info-item">
                <div class="info-label">Penyetoran:</div>
                <div class="info-value">Kapan saja</div>
              </div>
              <div class="info-item">
                <div class="info-label">Penarikan:</div>
                <div class="info-value">Kapan saja (proses 1-3 hari kerja)</div>
              </div>
            </div>
            <button class="action-button" @click="toggleAddSimpananForm">
              + Tambah Simpanan Sukarela
            </button>
          </div>
        </div>

        <div class="faq-section">
          <h3>Pertanyaan Umum</h3>

          <div class="faq-item">
            <div class="faq-question">Bagaimana cara menambah simpanan sukarela?</div>
            <div class="faq-answer">
              <p>
                Untuk menambah simpanan sukarela, Anda dapat mengklik tombol "+ Tambah Simpanan
                Sukarela" yang tersedia di halaman ini. Kemudian isi formulir yang muncul dengan
                jumlah yang ingin ditambahkan dan lampirkan bukti transfer atau pembayaran. Pengurus
                koperasi akan memverifikasi dan memproses simpanan Anda.
              </p>
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-question">Bagaimana cara menarik simpanan sukarela?</div>
            <div class="faq-answer">
              <p>
                Untuk menarik simpanan sukarela, silakan menghubungi pengurus koperasi melalui menu
                "Pengajuan" kemudian pilih "Penarikan Simpanan Sukarela". Isi formulir pengajuan
                dengan jumlah yang ingin ditarik dan alasannya. Pengurus akan memproses pengajuan
                Anda dalam waktu 1-3 hari kerja.
              </p>
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-question">Apakah saya bisa menarik simpanan pokok dan wajib?</div>
            <div class="faq-answer">
              <p>
                Simpanan pokok dan simpanan wajib tidak dapat ditarik selama Anda masih menjadi
                anggota koperasi. Simpanan tersebut hanya dapat diambil ketika Anda mengajukan
                pengunduran diri sebagai anggota koperasi dan telah disetujui oleh pengurus.
              </p>
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-question">Apa keuntungan dari simpanan sukarela?</div>
            <div class="faq-answer">
              <p>
                Simpanan sukarela akan mendapatkan jasa (bunga) sesuai dengan kebijakan koperasi.
                Selain itu, jumlah simpanan juga akan memengaruhi proporsi SHU (Sisa Hasil Usaha)
                yang Anda dapatkan pada akhir tahun buku. Semakin besar simpanan Anda, semakin besar
                potensi SHU yang akan Anda terima.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Simpanan Form Modal -->
    <div v-if="showAddSimpananForm" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Tambah Simpanan Sukarela</h3>
          <button class="close-button" @click="toggleAddSimpananForm">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="amount">Jumlah Simpanan</label>
            <div class="amount-input">
              <span class="currency-symbol">Rp</span>
              <input
                type="number"
                id="amount"
                v-model="sukarelaAmount"
                placeholder="Masukkan jumlah simpanan"
                min="10000"
              />
            </div>
            <p class="input-hint">Minimal Rp10.000</p>
          </div>

          <div class="form-group">
            <label for="keterangan">Keterangan (Opsional)</label>
            <textarea
              id="keterangan"
              v-model="simpananKeterangan"
              placeholder="Tambahkan keterangan untuk simpanan ini"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="bukti">Bukti Transfer</label>
            <input
              type="file"
              id="bukti"
              @change="handleFileChange"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
            />
            <p class="input-hint">Format yang diterima: JPG, PNG, PDF (Max: 2MB)</p>
          </div>

          <div class="form-group payment-info">
            <h4>Informasi Pembayaran</h4>
            <div class="payment-details">
              <p><strong>Bank:</strong> Bank Mandiri</p>
              <p><strong>No. Rekening:</strong> 1234567890</p>
              <p><strong>Atas Nama:</strong> Koperasi Simpan Pinjam Sejahtera</p>
              <p>
                Mohon transfer sesuai dengan jumlah yang diinputkan dan lampirkan bukti transfer.
              </p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="action-button" @click="toggleAddSimpananForm">Batal</button>
          <button
            class="action-button primary"
            @click="submitSimpanan"
            :disabled="!selectedFile || sukarelaAmount < 10000"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simpanan-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab-button {
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
}

.tab-button.active {
  color: #10b981;
  border-bottom: 2px solid #10b981;
}

.tab-content {
  min-height: 400px;
}

/* Simpanan Summary */
.simpanan-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-card.total {
  background-color: #f0fdfa;
  border-left: 4px solid #10b981;
}

.summary-card.total h3 {
  color: #065f46;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.summary-card.total .amount {
  font-size: 2rem;
  font-weight: 700;
  color: #064e3b;
  margin-bottom: 0.5rem;
}

.summary-card.total .last-update {
  color: #6b7280;
  font-size: 0.875rem;
}

.simpanan-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.summary-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-card .card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
}

.summary-card .amount {
  font-weight: 600;
  color: #111827;
}

.summary-card .card-content {
  color: #4b5563;
}

.summary-card .card-content p {
  margin-bottom: 1rem;
}

.stat-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Recent Transactions */
.recent-transactions {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.view-all-button {
  background: none;
  border: none;
  color: #10b981;
  font-weight: 500;
  cursor: pointer;
}

/* Transactions Table */
.transactions-table {
  width: 100%;
  overflow-x: auto;
}

.transactions-table table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.transactions-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.transactions-table .amount {
  font-weight: 500;
}

.transactions-table tbody tr:hover {
  background-color: #f9fafb;
}

.jenis-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.jenis-badge.pokok {
  background-color: #dbeafe;
  color: #1e40af;
}

.jenis-badge.wajib {
  background-color: #fef3c7;
  color: #92400e;
}

.jenis-badge.sukarela {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.danger {
  background-color: #fee2e2;
  color: #b91c1c;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 2rem 0;
}

/* Filter Controls */
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
}

.sort-button {
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  color: #111827;
  margin-top: 0;
  margin-bottom: 1rem;
}

.info-card p {
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.info-details {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-label {
  width: 100px;
  font-weight: 500;
  color: #374151;
}

.info-value {
  color: #111827;
}

/* FAQ Section */
.faq-section {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.faq-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #111827;
}

.faq-item {
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.25rem;
}

.faq-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.faq-question {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.faq-answer {
  color: #4b5563;
  line-height: 1.5;
}

/* Action Buttons */
.action-button {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.action-button.primary {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}

.action-button.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input[type='number'],
.form-group input[type='text'],
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.amount-input {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: hidden;
}

.currency-symbol {
  background-color: #f3f4f6;
  padding: 0.5rem 0.75rem;
  color: #374151;
  border-right: 1px solid #d1d5db;
}

.amount-input input {
  border: none;
  flex: 1;
  padding: 0.5rem;
}

.input-hint {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.payment-info {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
}

.payment-info h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #111827;
}

.payment-details p {
  margin: 0.25rem 0;
  color: #4b5563;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .simpanan-details-grid,
  .info-cards {
    grid-template-columns: 1fr;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    justify-content: space-between;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>

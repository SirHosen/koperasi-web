<script setup lang="ts">
import { ref, computed } from 'vue'

// Types for SHU management
interface ShuPeriod {
  id: string
  tahun: number
  totalShu: number
  status: 'draft' | 'disetujui' | 'dibagikan' | 'ditutup'
  tanggalPenetapan: string | null
  tanggalPembagian: string | null
  keterangan?: string
  persentaseAlokasi: ShuAlokasi
}

interface ShuAlokasi {
  cadangan: number
  anggota: number
  pengurus: number
  pengawas: number
  pendidikan: number
  sosial: number
}

interface ShuAnggota {
  anggotaId: string
  nama: string
  totalSimpanan: number
  persentaseSimpanan: number
  jumlahPinjaman: number
  persentasePinjaman: number
  totalShu: number
  statusPembayaran: 'belum' | 'sudah'
  tanggalDibayar?: string
}

// Mock data for SHU periods
const shuPeriods = ref<ShuPeriod[]>([
  {
    id: 'SHU-2025',
    tahun: 2025,
    totalShu: 120000000,
    status: 'draft',
    tanggalPenetapan: null,
    tanggalPembagian: null,
    keterangan: 'Menunggu persetujuan dalam RAT',
    persentaseAlokasi: {
      cadangan: 10,
      anggota: 60,
      pengurus: 10,
      pengawas: 5,
      pendidikan: 10,
      sosial: 5,
    },
  },
  {
    id: 'SHU-2024',
    tahun: 2024,
    totalShu: 95000000,
    status: 'disetujui',
    tanggalPenetapan: '2025-03-15T00:00:00Z',
    tanggalPembagian: null,
    keterangan: 'Menunggu pembagian',
    persentaseAlokasi: {
      cadangan: 10,
      anggota: 60,
      pengurus: 10,
      pengawas: 5,
      pendidikan: 10,
      sosial: 5,
    },
  },
  {
    id: 'SHU-2023',
    tahun: 2023,
    totalShu: 78500000,
    status: 'dibagikan',
    tanggalPenetapan: '2024-03-10T00:00:00Z',
    tanggalPembagian: '2024-04-05T00:00:00Z',
    keterangan: 'Pembagian selesai',
    persentaseAlokasi: {
      cadangan: 10,
      anggota: 60,
      pengurus: 10,
      pengawas: 5,
      pendidikan: 10,
      sosial: 5,
    },
  },
  {
    id: 'SHU-2022',
    tahun: 2022,
    totalShu: 65000000,
    status: 'ditutup',
    tanggalPenetapan: '2023-03-18T00:00:00Z',
    tanggalPembagian: '2023-04-10T00:00:00Z',
    keterangan: 'Periode ditutup',
    persentaseAlokasi: {
      cadangan: 12,
      anggota: 58,
      pengurus: 10,
      pengawas: 5,
      pendidikan: 10,
      sosial: 5,
    },
  },
])

// Mock data for SHU anggota (for a specific period)
const shuAnggota = ref<ShuAnggota[]>([
  {
    anggotaId: 'A-20230056',
    nama: 'Budi Santoso',
    totalSimpanan: 5250000,
    persentaseSimpanan: 3.5,
    jumlahPinjaman: 15000000,
    persentasePinjaman: 5.2,
    totalShu: 2520000,
    statusPembayaran: 'belum',
    tanggalDibayar: undefined,
  },
  {
    anggotaId: 'A-20210034',
    nama: 'Dewi Lestari',
    totalSimpanan: 8750000,
    persentaseSimpanan: 5.8,
    jumlahPinjaman: 0,
    persentasePinjaman: 0,
    totalShu: 2088000,
    statusPembayaran: 'belum',
    tanggalDibayar: undefined,
  },
  {
    anggotaId: 'A-20230001',
    nama: 'Ahmad Fadli',
    totalSimpanan: 2100000,
    persentaseSimpanan: 1.4,
    jumlahPinjaman: 5000000,
    persentasePinjaman: 1.7,
    totalShu: 900000,
    statusPembayaran: 'belum',
    tanggalDibayar: undefined,
  },
  {
    anggotaId: 'A-20220078',
    nama: 'Siti Nurhaliza',
    totalSimpanan: 4500000,
    persentaseSimpanan: 3.0,
    jumlahPinjaman: 20000000,
    persentasePinjaman: 6.9,
    totalShu: 2844000,
    statusPembayaran: 'belum',
    tanggalDibayar: undefined,
  },
  {
    anggotaId: 'A-20210092',
    nama: 'Rudi Hermawan',
    totalSimpanan: 12500000,
    persentaseSimpanan: 8.3,
    jumlahPinjaman: 30000000,
    persentasePinjaman: 10.4,
    totalShu: 5400000,
    statusPembayaran: 'belum',
    tanggalDibayar: undefined,
  },
  {
    anggotaId: 'A-20240012',
    nama: 'Lia Indrawati',
    totalSimpanan: 1750000,
    persentaseSimpanan: 1.2,
    jumlahPinjaman: 10000000,
    persentasePinjaman: 3.5,
    totalShu: 1368000,
    statusPembayaran: 'belum',
    tanggalDibayar: undefined,
  },
  {
    anggotaId: 'A-20240045',
    nama: 'Doni Kusuma',
    totalSimpanan: 3250000,
    persentaseSimpanan: 2.2,
    jumlahPinjaman: 8000000,
    persentasePinjaman: 2.8,
    totalShu: 1440000,
    statusPembayaran: 'belum',
    tanggalDibayar: undefined,
  },
  {
    anggotaId: 'A-20220103',
    nama: 'Rina Wijaya',
    totalSimpanan: 8300000,
    persentaseSimpanan: 5.5,
    jumlahPinjaman: 25000000,
    persentasePinjaman: 8.7,
    totalShu: 4068000,
    statusPembayaran: 'belum',
    tanggalDibayar: undefined,
  },
])

// UI state variables
const selectedPeriod = ref<string | null>('SHU-2024')
const sortBy = ref<string>('totalShu')
const sortOrder = ref<'asc' | 'desc'>('desc')
const searchQuery = ref('')
const showCreateForm = ref(false)
const confirmAction = ref<{ type: string; message: string; confirm: () => void } | null>(null)

// New period form
const newPeriod = ref<Partial<ShuPeriod>>({
  tahun: new Date().getFullYear(),
  totalShu: 0,
  status: 'draft',
  persentaseAlokasi: {
    cadangan: 10,
    anggota: 60,
    pengurus: 10,
    pengawas: 5,
    pendidikan: 10,
    sosial: 5,
  },
})

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

// Format date
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format percentage
const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

// Get status badge class
const getStatusBadgeClass = (status: string) => {
  if (status === 'draft') return 'status-draft'
  if (status === 'disetujui') return 'status-approved'
  if (status === 'dibagikan') return 'status-distributed'
  return 'status-closed'
}

// Get selected period
const selectedPeriodData = computed(() => {
  return shuPeriods.value.find((p) => p.id === selectedPeriod.value)
})

// Filtered and sorted anggota SHU
const filteredAnggota = computed(() => {
  let filtered = [...shuAnggota.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.anggotaId.toLowerCase().includes(query) || item.nama.toLowerCase().includes(query),
    )
  }

  filtered.sort((a, b) => {
    const valueA = a[sortBy.value as keyof ShuAnggota]
    const valueB = b[sortBy.value as keyof ShuAnggota]

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
    } else if (typeof valueA === 'string' && typeof valueB === 'string') {
      const comparison = valueA.localeCompare(valueB)
      return sortOrder.value === 'asc' ? comparison : -comparison
    }
    return 0
  })

  return filtered
}) // Calculate total values
const anggotaShuTotal = computed(() => {
  return shuAnggota.value.reduce((sum, item) => sum + item.totalShu, 0)
})

// Calculate SHU allocation amounts
const shuAlokasi = computed(() => {
  if (!selectedPeriodData.value) return null

  const { totalShu, persentaseAlokasi } = selectedPeriodData.value

  return {
    cadangan: (persentaseAlokasi.cadangan / 100) * totalShu,
    anggota: (persentaseAlokasi.anggota / 100) * totalShu,
    pengurus: (persentaseAlokasi.pengurus / 100) * totalShu,
    pengawas: (persentaseAlokasi.pengawas / 100) * totalShu,
    pendidikan: (persentaseAlokasi.pendidikan / 100) * totalShu,
    sosial: (persentaseAlokasi.sosial / 100) * totalShu,
  }
})

// Validate allocation percentages
const isAllocationValid = computed(() => {
  if (!newPeriod.value.persentaseAlokasi) return false
  const { cadangan, anggota, pengurus, pengawas, pendidikan, sosial } =
    newPeriod.value.persentaseAlokasi
  const total = cadangan + anggota + pengurus + pengawas + pendidikan + sosial
  return total === 100
})

// Change sorting
const changeSorting = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
}

// Select period
const selectPeriod = (periodId: string) => {
  selectedPeriod.value = periodId
}

// Create new period
const openCreateForm = () => {
  showCreateForm.value = true
}

// Cancel creating new period
const cancelCreateForm = () => {
  showCreateForm.value = false
  newPeriod.value = {
    tahun: new Date().getFullYear(),
    totalShu: 0,
    status: 'draft',
    persentaseAlokasi: {
      cadangan: 10,
      anggota: 60,
      pengurus: 10,
      pengawas: 5,
      pendidikan: 10,
      sosial: 5,
    },
  }
}

// Submit new period
const submitNewPeriod = () => {
  if (!isAllocationValid.value) return

  const id = `SHU-${newPeriod.value.tahun}`
  const existingPeriodIndex = shuPeriods.value.findIndex((p) => p.id === id)

  if (existingPeriodIndex >= 0) {
    alert(`Periode SHU untuk tahun ${newPeriod.value.tahun} sudah ada!`)
    return
  }

  const newShuPeriod: ShuPeriod = {
    id,
    tahun: newPeriod.value.tahun as number,
    totalShu: newPeriod.value.totalShu as number,
    status: 'draft',
    tanggalPenetapan: null,
    tanggalPembagian: null,
    keterangan: 'Menunggu persetujuan dalam RAT',
    persentaseAlokasi: newPeriod.value.persentaseAlokasi as ShuAlokasi,
  }

  shuPeriods.value.push(newShuPeriod)
  showCreateForm.value = false
  selectedPeriod.value = newShuPeriod.id

  // Reset form
  newPeriod.value = {
    tahun: new Date().getFullYear(),
    totalShu: 0,
    status: 'draft',
    persentaseAlokasi: {
      cadangan: 10,
      anggota: 60,
      pengurus: 10,
      pengawas: 5,
      pendidikan: 10,
      sosial: 5,
    },
  }
}

// Approve SHU
const approveShu = () => {
  if (!selectedPeriod.value) return

  const index = shuPeriods.value.findIndex((p) => p.id === selectedPeriod.value)
  if (index === -1) return

  confirmAction.value = {
    type: 'approve',
    message:
      'Apakah Anda yakin ingin menyetujui SHU ini? Ini akan mengubah status SHU menjadi "Disetujui".',
    confirm: () => {
      shuPeriods.value[index] = {
        ...shuPeriods.value[index],
        status: 'disetujui',
        tanggalPenetapan: new Date().toISOString(),
        keterangan: 'Disetujui, menunggu pembagian',
      }
      confirmAction.value = null
    },
  }
}

// Distribute SHU
const distributeShu = () => {
  if (!selectedPeriod.value) return

  const index = shuPeriods.value.findIndex((p) => p.id === selectedPeriod.value)
  if (index === -1) return

  confirmAction.value = {
    type: 'distribute',
    message:
      'Apakah Anda yakin ingin membagikan SHU ini? Ini akan mengubah status SHU menjadi "Dibagikan".',
    confirm: () => {
      shuPeriods.value[index] = {
        ...shuPeriods.value[index],
        status: 'dibagikan',
        tanggalPembagian: new Date().toISOString(),
        keterangan: 'Pembagian selesai',
      }
      confirmAction.value = null
    },
  }
}

// Close SHU
const closeShu = () => {
  if (!selectedPeriod.value) return

  const index = shuPeriods.value.findIndex((p) => p.id === selectedPeriod.value)
  if (index === -1) return

  confirmAction.value = {
    type: 'close',
    message:
      'Apakah Anda yakin ingin menutup periode SHU ini? Ini akan mengubah status SHU menjadi "Ditutup" dan tidak dapat diubah lagi.',
    confirm: () => {
      shuPeriods.value[index] = {
        ...shuPeriods.value[index],
        status: 'ditutup',
        keterangan: 'Periode ditutup',
      }
      confirmAction.value = null
    },
  }
}

// Cancel confirmation
const cancelConfirm = () => {
  confirmAction.value = null
}

// Mark paid for individual members
const markPaid = (anggotaId: string) => {
  const index = shuAnggota.value.findIndex((a) => a.anggotaId === anggotaId)
  if (index === -1) return

  shuAnggota.value[index] = {
    ...shuAnggota.value[index],
    statusPembayaran: 'sudah',
    tanggalDibayar: new Date().toISOString(),
  }
}

// Mark all as paid
const markAllPaid = () => {
  confirmAction.value = {
    type: 'mark-all-paid',
    message: 'Apakah Anda yakin ingin menandai semua anggota telah dibayar?',
    confirm: () => {
      const now = new Date().toISOString()
      shuAnggota.value = shuAnggota.value.map((anggota) => ({
        ...anggota,
        statusPembayaran: 'sudah',
        tanggalDibayar: now,
      }))
      confirmAction.value = null
    },
  }
}
</script>

<template>
  <div class="shu-management">
    <div class="page-header">
      <h1>Pengelolaan SHU</h1>

      <button class="add-button" @click="openCreateForm">+ Tambah Periode SHU</button>
    </div>

    <!-- SHU Periods List -->
    <div class="period-list-container">
      <div
        class="period-card"
        v-for="period in shuPeriods"
        :key="period.id"
        :class="{ active: selectedPeriod === period.id }"
        @click="selectPeriod(period.id)"
      >
        <div class="period-header">
          <span class="period-title">SHU {{ period.tahun }}</span>
          <span class="status-badge" :class="getStatusBadgeClass(period.status)">
            {{
              period.status === 'draft'
                ? 'Draft'
                : period.status === 'disetujui'
                  ? 'Disetujui'
                  : period.status === 'dibagikan'
                    ? 'Dibagikan'
                    : 'Ditutup'
            }}
          </span>
        </div>
        <div class="period-amount">{{ formatCurrency(period.totalShu) }}</div>
        <div class="period-details">
          <div class="period-detail-item">
            <span class="detail-label">Alokasi Anggota:</span>
            <span class="detail-value">{{ period.persentaseAlokasi.anggota }}%</span>
          </div>
          <div class="period-detail-item">
            <span class="detail-label">Tanggal Penetapan:</span>
            <span class="detail-value">{{ formatDate(period.tanggalPenetapan) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected SHU Period Details -->
    <div v-if="selectedPeriodData" class="shu-details">
      <div class="details-header">
        <h2>Detail SHU {{ selectedPeriodData.tahun }}</h2>

        <!-- Action buttons based on status -->
        <div class="action-buttons">
          <button
            v-if="selectedPeriodData.status === 'draft'"
            class="action-button approve"
            @click="approveShu"
          >
            Setujui SHU
          </button>
          <button
            v-if="selectedPeriodData.status === 'disetujui'"
            class="action-button distribute"
            @click="distributeShu"
          >
            Bagikan SHU
          </button>
          <button
            v-if="selectedPeriodData.status === 'dibagikan'"
            class="action-button close"
            @click="closeShu"
          >
            Tutup Periode
          </button>
          <button class="action-button report">Cetak Laporan</button>
        </div>
      </div>

      <!-- SHU Information Cards -->
      <div class="shu-info-cards">
        <div class="info-card">
          <div class="info-card-title">Total SHU</div>
          <div class="info-card-value">{{ formatCurrency(selectedPeriodData.totalShu) }}</div>
          <div class="info-card-detail">
            <div class="info-card-detail-label">Status:</div>
            <div class="status-badge" :class="getStatusBadgeClass(selectedPeriodData.status)">
              {{
                selectedPeriodData.status === 'draft'
                  ? 'Draft'
                  : selectedPeriodData.status === 'disetujui'
                    ? 'Disetujui'
                    : selectedPeriodData.status === 'dibagikan'
                      ? 'Dibagikan'
                      : 'Ditutup'
              }}
            </div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-title">Tanggal Penetapan</div>
          <div class="info-card-value date">
            {{ formatDate(selectedPeriodData.tanggalPenetapan) }}
          </div>
          <div class="info-card-detail">
            <div class="info-card-detail-label">Pembagian:</div>
            <div>{{ formatDate(selectedPeriodData.tanggalPembagian) }}</div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-title">Keterangan</div>
          <div class="info-card-value note">{{ selectedPeriodData.keterangan || '-' }}</div>
        </div>
      </div>

      <!-- SHU Allocation Breakdown -->
      <div class="shu-allocation">
        <h3>Alokasi SHU</h3>

        <div class="allocation-breakdown">
          <div class="allocation-item">
            <div class="allocation-header">
              <div class="allocation-title">Cadangan</div>
              <div class="allocation-percentage">
                {{ selectedPeriodData.persentaseAlokasi.cadangan }}%
              </div>
            </div>
            <div class="allocation-amount">{{ formatCurrency(shuAlokasi?.cadangan || 0) }}</div>
          </div>

          <div class="allocation-item anggota">
            <div class="allocation-header">
              <div class="allocation-title">Anggota</div>
              <div class="allocation-percentage">
                {{ selectedPeriodData.persentaseAlokasi.anggota }}%
              </div>
            </div>
            <div class="allocation-amount">{{ formatCurrency(shuAlokasi?.anggota || 0) }}</div>
          </div>

          <div class="allocation-item">
            <div class="allocation-header">
              <div class="allocation-title">Pengurus</div>
              <div class="allocation-percentage">
                {{ selectedPeriodData.persentaseAlokasi.pengurus }}%
              </div>
            </div>
            <div class="allocation-amount">{{ formatCurrency(shuAlokasi?.pengurus || 0) }}</div>
          </div>

          <div class="allocation-item">
            <div class="allocation-header">
              <div class="allocation-title">Pengawas</div>
              <div class="allocation-percentage">
                {{ selectedPeriodData.persentaseAlokasi.pengawas }}%
              </div>
            </div>
            <div class="allocation-amount">{{ formatCurrency(shuAlokasi?.pengawas || 0) }}</div>
          </div>

          <div class="allocation-item">
            <div class="allocation-header">
              <div class="allocation-title">Pendidikan</div>
              <div class="allocation-percentage">
                {{ selectedPeriodData.persentaseAlokasi.pendidikan }}%
              </div>
            </div>
            <div class="allocation-amount">{{ formatCurrency(shuAlokasi?.pendidikan || 0) }}</div>
          </div>

          <div class="allocation-item">
            <div class="allocation-header">
              <div class="allocation-title">Sosial</div>
              <div class="allocation-percentage">
                {{ selectedPeriodData.persentaseAlokasi.sosial }}%
              </div>
            </div>
            <div class="allocation-amount">{{ formatCurrency(shuAlokasi?.sosial || 0) }}</div>
          </div>
        </div>
      </div>

      <!-- SHU Anggota List -->
      <div class="shu-anggota">
        <div class="anggota-header">
          <h3>Pembagian SHU Anggota</h3>

          <div class="anggota-controls">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari ID / Nama Anggota"
              class="search-input"
            />

            <button
              v-if="
                selectedPeriodData.status === 'disetujui' ||
                selectedPeriodData.status === 'dibagikan'
              "
              class="mark-all-button"
              @click="markAllPaid"
            >
              Tandai Semua Terbayar
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th @click="changeSorting('anggotaId')">
                  ID Anggota
                  <span v-if="sortBy === 'anggotaId'" class="sort-icon">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="changeSorting('nama')">
                  Nama Anggota
                  <span v-if="sortBy === 'nama'" class="sort-icon">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="changeSorting('totalSimpanan')">
                  Total Simpanan
                  <span v-if="sortBy === 'totalSimpanan'" class="sort-icon">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="changeSorting('persentaseSimpanan')">
                  % Simpanan
                  <span v-if="sortBy === 'persentaseSimpanan'" class="sort-icon">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="changeSorting('jumlahPinjaman')">
                  Jasa Pinjaman
                  <span v-if="sortBy === 'jumlahPinjaman'" class="sort-icon">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="changeSorting('persentasePinjaman')">
                  % Pinjaman
                  <span v-if="sortBy === 'persentasePinjaman'" class="sort-icon">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="changeSorting('totalShu')">
                  Total SHU
                  <span v-if="sortBy === 'totalShu'" class="sort-icon">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="anggota in filteredAnggota" :key="anggota.anggotaId">
                <td>{{ anggota.anggotaId }}</td>
                <td>{{ anggota.nama }}</td>
                <td>{{ formatCurrency(anggota.totalSimpanan) }}</td>
                <td>{{ formatPercentage(anggota.persentaseSimpanan) }}</td>
                <td>{{ formatCurrency(anggota.jumlahPinjaman) }}</td>
                <td>{{ formatPercentage(anggota.persentasePinjaman) }}</td>
                <td class="shu-amount">{{ formatCurrency(anggota.totalShu) }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="anggota.statusPembayaran === 'sudah' ? 'status-paid' : 'status-unpaid'"
                  >
                    {{ anggota.statusPembayaran === 'sudah' ? 'Terbayar' : 'Belum Dibayar' }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="
                      anggota.statusPembayaran === 'belum' &&
                      (selectedPeriodData.status === 'disetujui' ||
                        selectedPeriodData.status === 'dibagikan')
                    "
                    class="pay-button"
                    @click="markPaid(anggota.anggotaId)"
                  >
                    Bayar
                  </button>
                  <span v-else-if="anggota.statusPembayaran === 'sudah'">
                    {{ formatDate(anggota.tanggalDibayar) }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>

            <!-- Footer for totals -->
            <tfoot>
              <tr>
                <td colspan="6" class="total-label">Total SHU Anggota</td>
                <td class="shu-amount total-amount">{{ formatCurrency(anggotaShuTotal) }}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>

          <div v-if="filteredAnggota.length === 0" class="empty-state">
            <p>Tidak ada data anggota yang sesuai dengan pencarian</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create New SHU Period Form -->
    <div v-if="showCreateForm" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Tambah Periode SHU Baru</h3>
          <button class="close-button" @click="cancelCreateForm">&times;</button>
        </div>

        <div class="modal-content">
          <form @submit.prevent="submitNewPeriod" class="shu-form">
            <div class="form-group">
              <label for="tahun">Tahun Periode</label>
              <input
                type="number"
                id="tahun"
                v-model.number="newPeriod.tahun"
                min="2020"
                max="2050"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="totalShu">Total SHU</label>
              <input
                type="number"
                id="totalShu"
                v-model.number="newPeriod.totalShu"
                min="0"
                step="100000"
                required
                class="form-input"
              />
            </div>

            <h4>Alokasi SHU (%)</h4>
            <div class="allocation-form">
              <div class="form-group">
                <label for="cadangan">Cadangan</label>
                <input
                  type="number"
                  id="cadangan"
                  v-model.number="newPeriod.persentaseAlokasi!.cadangan"
                  min="0"
                  max="100"
                  class="form-input percentage-input"
                />
              </div>

              <div class="form-group">
                <label for="anggota">Anggota</label>
                <input
                  type="number"
                  id="anggota"
                  v-model.number="newPeriod.persentaseAlokasi!.anggota"
                  min="0"
                  max="100"
                  class="form-input percentage-input"
                />
              </div>

              <div class="form-group">
                <label for="pengurus">Pengurus</label>
                <input
                  type="number"
                  id="pengurus"
                  v-model.number="newPeriod.persentaseAlokasi!.pengurus"
                  min="0"
                  max="100"
                  class="form-input percentage-input"
                />
              </div>

              <div class="form-group">
                <label for="pengawas">Pengawas</label>
                <input
                  type="number"
                  id="pengawas"
                  v-model.number="newPeriod.persentaseAlokasi!.pengawas"
                  min="0"
                  max="100"
                  class="form-input percentage-input"
                />
              </div>

              <div class="form-group">
                <label for="pendidikan">Pendidikan</label>
                <input
                  type="number"
                  id="pendidikan"
                  v-model.number="newPeriod.persentaseAlokasi!.pendidikan"
                  min="0"
                  max="100"
                  class="form-input percentage-input"
                />
              </div>

              <div class="form-group">
                <label for="sosial">Sosial</label>
                <input
                  type="number"
                  id="sosial"
                  v-model.number="newPeriod.persentaseAlokasi!.sosial"
                  min="0"
                  max="100"
                  class="form-input percentage-input"
                />
              </div>
            </div>

            <div class="allocation-validation">
              <div class="validation-message" :class="{ invalid: !isAllocationValid }">
                Total alokasi:
                {{
                  newPeriod.persentaseAlokasi
                    ? newPeriod.persentaseAlokasi.cadangan +
                      newPeriod.persentaseAlokasi.anggota +
                      newPeriod.persentaseAlokasi.pengurus +
                      newPeriod.persentaseAlokasi.pengawas +
                      newPeriod.persentaseAlokasi.pendidikan +
                      newPeriod.persentaseAlokasi.sosial
                    : 0
                }}% (harus 100%)
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-button" @click="cancelCreateForm">Batal</button>
              <button type="submit" class="submit-button" :disabled="!isAllocationValid">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="confirmAction" class="modal-overlay">
      <div class="modal-container confirm-modal">
        <div class="modal-header">
          <h3>Konfirmasi</h3>
          <button class="close-button" @click="cancelConfirm">&times;</button>
        </div>

        <div class="modal-content">
          <p class="confirm-message">{{ confirmAction.message }}</p>

          <div class="form-actions">
            <button class="cancel-button" @click="cancelConfirm">Batal</button>
            <button
              class="submit-button"
              :class="{
                'approve-button': confirmAction.type === 'approve',
                'distribute-button': confirmAction.type === 'distribute',
                'close-button': confirmAction.type === 'close',
              }"
              @click="confirmAction.confirm"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shu-management {
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

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 1.5rem 0 0.75rem 0;
}

.add-button {
  padding: 0.5rem 1rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Period List Styling */
.period-list-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.period-card {
  min-width: 240px;
  max-width: 300px;
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: all 0.2s;
}

.period-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.period-card.active {
  border-left-color: #10b981;
  background-color: #f0fdfa;
}

.period-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.period-title {
  font-weight: 600;
  color: #111827;
}

.period-amount {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.5rem 0 1rem 0;
}

.period-details {
  font-size: 0.875rem;
}

.period-detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.detail-label {
  color: #6b7280;
}

/* SHU Details Styling */
.shu-details {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
}

.action-button.approve {
  background-color: #10b981;
  color: white;
}

.action-button.distribute {
  background-color: #3b82f6;
  color: white;
}

.action-button.close {
  background-color: #6b7280;
  color: white;
}

.action-button.report {
  background-color: #f3f4f6;
  color: #374151;
}

/* SHU Info Cards */
.shu-info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-card {
  background-color: #f9fafb;
  padding: 1.25rem;
  border-radius: 0.375rem;
}

.info-card-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.info-card-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.info-card-value.date,
.info-card-value.note {
  font-size: 1rem;
  font-weight: 500;
}

.info-card-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.info-card-detail-label {
  color: #6b7280;
}

/* Status Badge Styling */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-draft {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-approved {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-distributed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-closed {
  background-color: #e5e7eb;
  color: #374151;
}

.status-paid {
  background-color: #d1fae5;
  color: #065f46;
}

.status-unpaid {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* SHU Allocation Styling */
.shu-allocation {
  margin-bottom: 2rem;
}

.allocation-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.allocation-item {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  border-left: 4px solid #9ca3af;
}

.allocation-item.anggota {
  border-left-color: #10b981;
  background-color: #f0fdfa;
}

.allocation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.allocation-title {
  font-weight: 500;
  color: #374151;
}

.allocation-percentage {
  font-weight: 600;
  color: #111827;
}

.allocation-amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

/* SHU Anggota Styling */
.shu-anggota {
  margin-top: 2rem;
}

.anggota-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.anggota-controls {
  display: flex;
  gap: 0.75rem;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  min-width: 250px;
}

.mark-all-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
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
  position: sticky;
  top: 0;
  z-index: 10;
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

.data-table tfoot td {
  background-color: #f9fafb;
  font-weight: 600;
}

.sort-icon {
  margin-left: 0.25rem;
  color: #9ca3af;
}

.shu-amount {
  font-weight: 600;
  color: #111827;
}

.total-label {
  text-align: right;
}

.total-amount {
  font-weight: 700;
  color: #10b981;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.pay-button {
  padding: 0.25rem 0.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-container.confirm-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
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

/* Form Styling */
.shu-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 100%;
}

.percentage-input {
  max-width: 100px;
}

.allocation-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.allocation-validation {
  margin: 1rem 0;
}

.validation-message {
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.validation-message.invalid {
  background-color: #fee2e2;
  color: #b91c1c;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
}

.submit-button {
  padding: 0.5rem 1rem;
  background-color: #10b981;
  border: none;
  border-radius: 0.375rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.submit-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.approve-button {
  background-color: #10b981;
}

.distribute-button {
  background-color: #3b82f6;
}

.close-button {
  background-color: #6b7280;
}

.confirm-message {
  margin: 1rem 0 2rem;
  text-align: center;
  color: #374151;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .details-header,
  .anggota-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }

  .anggota-controls {
    width: 100%;
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .allocation-breakdown {
    grid-template-columns: 1fr;
  }
}
</style>

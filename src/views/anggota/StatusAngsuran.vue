<template>
  <div class="status-angsuran">
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Status Angsuran Pinjaman</h5>
      </div>
      <div class="card-body">
        <div class="mb-4">
          <label class="form-label">Pilih Pinjaman</label>
          <select class="form-select" v-model="selectedPinjaman" @change="loadDataAngsuran">
            <option v-for="pinjaman in daftarPinjaman" :key="pinjaman.id" :value="pinjaman.id">
              Pinjaman #{{ pinjaman.id }} - {{ formatCurrency(pinjaman.jumlah_pinjaman) }}
            </option>
          </select>
        </div>

        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Jatuh Tempo</th>
                <th>Pokok</th>
                <th>Bunga</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tanggal Bayar</th>
                <th>Denda</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(angsuran, index) in daftarAngsuran" :key="index">
                <td>{{ angsuran.ke }}</td>
                <td>{{ formatDate(angsuran.jatuh_tempo) }}</td>
                <td>{{ formatCurrency(angsuran.pokok) }}</td>
                <td>{{ formatCurrency(angsuran.bunga) }}</td>
                <td>{{ formatCurrency(angsuran.total) }}</td>
                <td>
                  <span :class="`badge ${getStatusBadge(angsuran.status)}`">
                    {{ angsuran.status }}
                  </span>
                </td>
                <td>{{ angsuran.tanggal_bayar ? formatDate(angsuran.tanggal_bayar) : '-' }}</td>
                <td>{{ angsuran.denda ? formatCurrency(angsuran.denda) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePinjamanStore } from '@/stores/modules/pinjaman'
import { useErrorHandler } from '@/lib/errorHandler'

const pinjamanStore = usePinjamanStore()
const { handleAsync } = useErrorHandler()

// State
const selectedPinjaman = ref('')
const daftarPinjaman = ref([])
const daftarAngsuran = ref([])

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getStatusBadge = (status) => {
  const statusMap = {
    LUNAS: 'bg-success',
    'BELUM LUNAS': 'bg-warning',
    'LEWAT JATUH TEMPO': 'bg-danger',
  }
  return statusMap[status] || 'bg-secondary'
}

const loadDaftarPinjaman = async () => {
  try {
    // Ganti dengan pemanggilan store/API yang sesuai
    // daftarPinjaman.value = await pinjamanStore.getDaftarPinjaman()

    // Contoh data dummy
    daftarPinjaman.value = [
      {
        id: 'PJN-2023-001',
        jumlah_pinjaman: 10000000,
        sisa_pokok: 8000000,
        angsuran_per_bulan: 1000000,
        bunga: 1.5,
        tenor: 10,
        tanggal_pinjaman: '2023-01-15',
        status: 'aktif',
      },
    ]

    if (daftarPinjaman.value.length > 0) {
      selectedPinjaman.value = daftarPinjaman.value[0].id
      await loadDataAngsuran()
    }
  } catch (error) {
    console.error('Gagal memuat daftar pinjaman:', error)
  }
}

const loadDataAngsuran = async () => {
  if (!selectedPinjaman.value) return

  try {
    // Ganti dengan pemanggilan store/API yang sesuai
    // const response = await pinjamanStore.getDetailAngsuran(selectedPinjaman.value)
    // daftarAngsuran.value = response.angsuran

    // Contoh data dummy
    const pinjaman = daftarPinjaman.value.find((p) => p.id === selectedPinjaman.value)
    if (!pinjaman) return

    // Generate dummy angsuran
    const angsuranList = []
    let sisaPokok = pinjaman.jumlah_pinjaman

    for (let i = 1; i <= pinjaman.tenor; i++) {
      const bunga = sisaPokok * (pinjaman.bunga / 100)
      const pokok = pinjaman.angsuran_per_bulan - bunga
      sisaPokok = Math.max(0, sisaPokok - pokok)

      const tanggalJatuhTempo = new Date(pinjaman.tanggal_pinjaman)
      tanggalJatuhTempo.setMonth(tanggalJatuhTempo.getMonth() + i)

      const isPaid = i <= 2 // Dummy: 2 angsuran pertama sudah lunas
      const isLate = i === 3 // Dummy: angsuran ke-3 lewat jatuh tempo

      angsuranList.push({
        ke: i,
        jatuh_tempo: tanggalJatuhTempo.toISOString().split('T')[0],
        pokok: pokok,
        bunga: bunga,
        total: pokok + bunga,
        status: isPaid ? 'LUNAS' : isLate ? 'LEWAT JATUH TEMPO' : 'BELUM LUNAS',
        tanggal_bayar: isPaid
          ? new Date(tanggalJatuhTempo.getTime() - i * 2 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          : null,
        denda: isLate ? 50000 : 0,
      })
    }

    daftarAngsuran.value = angsuranList
  } catch (error) {
    console.error('Gagal memuat data angsuran:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadDaftarPinjaman()
})
</script>

<template>
  <div class="simpanan-pokok-wajib">
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Simpanan Pokok</h5>
          </div>
          <div class="card-body">
            <div v-if="simpananPokok.pokok > 0">
              <p>Status: <span class="badge bg-success">Lunas</span></p>
              <p>Jumlah: {{ formatCurrency(simpananPokok.pokok) }}</p>
              <p>Tanggal Pembayaran: {{ formatDate(simpananPokok.tanggal_pembayaran) }}</p>
            </div>
            <div v-else>
              <p class="text-muted">Anda belum membayar simpanan pokok.</p>
              <button class="btn btn-primary" @click="showBayarPokok = true">
                Bayar Simpanan Pokok
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">Simpanan Wajib</h5>
          </div>
          <div class="card-body">
            <p>Tagihan Bulan Ini: {{ formatCurrency(simpananWajib.tagihan_bulan_ini) }}</p>
            <p>
              Status:
              <span :class="getStatusClass(simpananWajib.status_bulan_ini)">
                {{ simpananWajib.status_bulan_ini }}
              </span>
            </p>
            <p>Jatuh Tempo: {{ formatDate(simpananWajib.jatuh_tempo) }}</p>
            <button
              class="btn btn-success"
              @click="showBayarWajib = true"
              :disabled="simpananWajib.status_bulan_ini === 'Lunas'"
            >
              Bayar Simpanan Wajib
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSimpananStore } from '@/stores/modules/simpanan'
import { useErrorHandler } from '@/lib/errorHandler'

const simpananStore = useSimpananStore()
const { handleAsync } = useErrorHandler()

// State
const showBayarPokok = ref(false)
const showBayarWajib = ref(false)

// Data
const simpananPokok = ref({
  pokok: 0,
  tanggal_pembayaran: null,
  jumlah_wajib: 100000,
})

const simpananWajib = ref({
  tagihan_bulan_ini: 50000,
  status_bulan_ini: 'Belum Lunas',
  jatuh_tempo: new Date(new Date().setDate(10)),
})

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const getStatusClass = (status) => {
  const statusMap = {
    Lunas: 'badge bg-success',
    'Belum Lunas': 'badge bg-warning',
    Terlambat: 'badge bg-danger',
  }
  return statusMap[status] || 'badge bg-secondary'
}
</script>

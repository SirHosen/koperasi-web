<template>
  <div class="pembayaran-pinjaman">
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Input Pembayaran Pinjaman</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitPembayaran">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Pilih Pinjaman</label>
              <select class="form-select" v-model="form.pinjaman_id" required>
                <option v-for="pinjaman in daftarPinjaman" :key="pinjaman.id" :value="pinjaman.id">
                  Pinjaman #{{ pinjaman.id }} -
                  {{ formatCurrency(pinjaman.sisa_pokok) }}
                  ({{ pinjaman.angsuran_ke }}/{{ pinjaman.total_angsuran }})
                </option>
              </select>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Jumlah Pembayaran</label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.jumlah"
                  @input="formatAmount"
                  required
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Tanggal Pembayaran</label>
              <input type="date" class="form-control" v-model="form.tanggal_bayar" required />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Metode Pembayaran</label>
              <select class="form-select" v-model="form.metode_pembayaran" required>
                <option value="transfer">Transfer Bank</option>
                <option value="tunai">Tunai</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Nomor Referensi/Bukti Bayar</label>
            <input type="text" class="form-control" v-model="form.nomor_referensi" required />
          </div>

          <div class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button type="button" class="btn btn-outline-secondary me-md-2" @click="resetForm">
              Reset
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
              Simpan Pembayaran
            </button>
          </div>
        </form>
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
const isLoading = ref(false)
const daftarPinjaman = ref([])

// Form data
const form = ref({
  pinjaman_id: '',
  jumlah: '',
  tanggal_bayar: new Date().toISOString().split('T')[0],
  metode_pembayaran: 'transfer',
  nomor_referensi: '',
  keterangan: '',
})

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatAmount = (event) => {
  const target = event.target
  const value = target.value.replace(/\D/g, '')
  form.value.jumlah = value ? new Intl.NumberFormat('id-ID').format(parseInt(value)) : ''
}

const loadPinjamanAktif = async () => {
  try {
    // Ganti dengan pemanggilan store/API yang sesuai
    // daftarPinjaman.value = await pinjamanStore.getPinjamanAktif()

    // Contoh data dummy
    daftarPinjaman.value = [
      {
        id: 'PJN-2023-001',
        sisa_pokok: 4500000,
        angsuran_ke: 5,
        total_angsuran: 12,
      },
    ]
  } catch (error) {
    console.error('Gagal memuat data pinjaman:', error)
  }
}

const submitPembayaran = async () => {
  try {
    isLoading.value = true

    await handleAsync(async () => {
      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      resetForm()
      await loadPinjamanAktif()
    }, 'Pembayaran berhasil disimpan')
  } catch (error) {
    console.error('Gagal menyimpan pembayaran:', error)
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.value = {
    pinjaman_id: form.value.pinjaman_id, // Jangan reset pinjaman_id
    jumlah: '',
    tanggal_bayar: new Date().toISOString().split('T')[0],
    metode_pembayaran: 'transfer',
    nomor_referensi: '',
    keterangan: '',
  }
}

// Lifecycle
onMounted(() => {
  loadPinjamanAktif()
})
</script>

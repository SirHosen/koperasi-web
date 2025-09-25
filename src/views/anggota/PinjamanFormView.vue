<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnggotaStore } from '@/stores/modules/anggota'
import { useFcfsStore } from '@/stores/modules/fcfs'

const router = useRouter()
const anggotaStore = useAnggotaStore()
const fcfsStore = useFcfsStore()
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form state
const jumlahPinjaman = ref<number | null>(null)
const tenor = ref<number>(12)
const tujuan = ref('')
const dokumenSlipGaji = ref<File | null>(null)
const dokumenPendukungLain = ref<File | null>(null)

// System data
const bunga = ref(1.5) // 1.5% per month (will be fetched from system settings)
const adminFee = 50000
const anggotaId = ref('')

// Computed values
const angsuranPerBulan = computed(() => {
  if (!jumlahPinjaman.value || tenor.value <= 0) return 0

  const principal = jumlahPinjaman.value / tenor.value
  const interestPayment = jumlahPinjaman.value * (bunga.value / 100)

  return Math.round(principal + interestPayment)
})

const totalBayar = computed(() => {
  if (!jumlahPinjaman.value) return 0
  return angsuranPerBulan.value * tenor.value
})

const totalBunga = computed(() => {
  if (!jumlahPinjaman.value) return 0
  return totalBayar.value - jumlahPinjaman.value
})

// File handling
const handleSlipGajiChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    dokumenSlipGaji.value = input.files[0]
  }
}

const handleDokumenLainChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    dokumenPendukungLain.value = input.files[0]
  }
}

// Load anggota data and system settings
onMounted(async () => {
  try {
    // Load anggota profile
    const profile = await anggotaStore.getProfile()
    anggotaId.value = profile.id

    // Check if anggota already has an active loan application
    const activePinjaman = await anggotaStore.getActivePinjaman()

    if (
      activePinjaman.some((p) => ['antrean', 'verifikasi', 'disetujui'].includes(p.statusPinjaman))
    ) {
      errorMessage.value = 'Anda sudah memiliki pengajuan pinjaman yang sedang diproses'
      setTimeout(() => router.push('/anggota/pinjaman/status'), 3000)
      return
    }

    // Load system settings (bunga pinjaman)
    // In a real app, you would fetch this from your API
  } catch (error) {
    console.error('Error loading anggota data:', error)
    errorMessage.value = 'Terjadi kesalahan saat memuat data'
  }
})

// Form submission
const submitApplication = async () => {
  if (!jumlahPinjaman.value || !tujuan.value || !dokumenSlipGaji.value) {
    errorMessage.value = 'Mohon lengkapi semua field yang wajib diisi'
    return
  }

  isLoading.value = true

  try {
    // Submit loan application
    const loanData = {
      anggotaId: anggotaId.value,
      jumlah: jumlahPinjaman.value,
      tenor: tenor.value,
      tujuan: tujuan.value,
    }

    const result = await fcfsStore.submitLoan(loanData)

    // Upload documents
    if (dokumenSlipGaji.value || dokumenPendukungLain.value) {
      const formData = new FormData()
      if (dokumenSlipGaji.value) {
        formData.append('slipGaji', dokumenSlipGaji.value)
      }
      if (dokumenPendukungLain.value) {
        formData.append('dokumenLain', dokumenPendukungLain.value)
      }

      // Use the pinjaman API to upload documents
      // This would typically be implemented in the fcfs store
      // For now we're skipping the actual upload as it would need file handling
    }

    // Success message
    successMessage.value = `Pengajuan pinjaman berhasil! Anda berada di posisi #${result.posisiAntrean} dalam antrean FCFS.`

    // Reset form after success
    jumlahPinjaman.value = null
    tenor.value = 12
    tujuan.value = ''
    dokumenSlipGaji.value = null
    dokumenPendukungLain.value = null
    errorMessage.value = ''

    // Redirect to loan status page
    setTimeout(() => router.push('/anggota/pinjaman/status'), 3000)
  } catch (error) {
    errorMessage.value = fcfsStore.error || 'Terjadi kesalahan saat mengajukan pinjaman'
    console.error('Application error:', error)
  } finally {
    isLoading.value = false
  }
}

// Formatting
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <div class="loan-application-container">
    <!-- Modern Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="bi bi-cash-coin"></i>
          Pengajuan Pinjaman (FCFS)
        </h1>
        <p class="page-subtitle">Ajukan pinjaman dengan sistem antrean First Come, First Served</p>
      </div>
    </div>

    <div class="info-box">
      <div class="info-icon">
        <i class="bi bi-info-circle-fill"></i>
      </div>
      <div class="info-content">
        <p>
          <strong>First Come, First Served (FCFS)</strong> - Pengajuan pinjaman akan diproses sesuai
          urutan waktu masuk.
        </p>
        <p>Seluruh berkas akan diperiksa oleh pengurus sesuai urutan antrean.</p>
      </div>
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <form @submit.prevent="submitApplication" class="application-form" v-if="!successMessage">
      <div class="form-sections">
        <section class="form-section">
          <h2>Detail Pinjaman</h2>

          <div class="form-group">
            <label for="jumlahPinjaman">Jumlah Pinjaman (Rp) *</label>
            <input
              id="jumlahPinjaman"
              v-model.number="jumlahPinjaman"
              type="number"
              min="1000000"
              step="100000"
              placeholder="Contoh: 5000000"
              required
            />
            <div class="helper-text">Minimal Rp 1.000.000</div>
          </div>

          <div class="form-group">
            <label for="tenor">Tenor (Bulan) *</label>
            <select id="tenor" v-model="tenor" required>
              <option value="6">6 Bulan</option>
              <option value="12">12 Bulan</option>
              <option value="18">18 Bulan</option>
              <option value="24">24 Bulan</option>
              <option value="36">36 Bulan</option>
            </select>
          </div>

          <div class="form-group">
            <label for="tujuan">Tujuan Pinjaman *</label>
            <textarea
              id="tujuan"
              v-model="tujuan"
              rows="3"
              placeholder="Jelaskan tujuan penggunaan dana pinjaman"
              required
            ></textarea>
          </div>
        </section>

        <section class="form-section">
          <h2>Dokumen Pendukung</h2>

          <div class="form-group">
            <label for="slipGaji">Slip Gaji (PDF) *</label>
            <input
              id="slipGaji"
              type="file"
              accept=".pdf"
              @change="handleSlipGajiChange"
              required
            />
            <div class="helper-text">Upload slip gaji terbaru dalam format PDF</div>
          </div>

          <div class="form-group">
            <label for="dokumenLain">Dokumen Pendukung Lain</label>
            <input id="dokumenLain" type="file" accept=".pdf" @change="handleDokumenLainChange" />
            <div class="helper-text">Opsional: Dokumen pendukung lainnya (PDF)</div>
          </div>
        </section>
      </div>

      <section class="simulation-section">
        <h2>Simulasi Angsuran</h2>
        <div class="simulation-result" v-if="jumlahPinjaman">
          <div class="detail-row">
            <div class="detail-label">Jumlah Pinjaman</div>
            <div class="detail-value">{{ formatCurrency(jumlahPinjaman) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Bunga</div>
            <div class="detail-value">{{ bunga }}% per bulan</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Tenor</div>
            <div class="detail-value">{{ tenor }} bulan</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Biaya Admin</div>
            <div class="detail-value">{{ formatCurrency(adminFee) }}</div>
          </div>
          <div class="detail-row total">
            <div class="detail-label">Angsuran per Bulan</div>
            <div class="detail-value">{{ formatCurrency(angsuranPerBulan) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Total Pembayaran</div>
            <div class="detail-value">{{ formatCurrency(totalBayar) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Total Bunga</div>
            <div class="detail-value">{{ formatCurrency(totalBunga) }}</div>
          </div>
        </div>
        <div class="empty-simulation" v-else>
          Masukkan jumlah pinjaman untuk melihat simulasi angsuran
        </div>
      </section>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="terms-agreement">
        <input id="agreement" type="checkbox" required />
        <label for="agreement">
          Saya menyetujui syarat dan ketentuan pinjaman Koperasi Simpan Pinjam, termasuk suku bunga
          dan jadwal pembayaran yang telah disimulasikan di atas.
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="cancel-button" @click="router.push('/anggota/dashboard')">
          Batal
        </button>
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Memproses...' : 'Ajukan Pinjaman' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.loan-application-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Modern Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.header-content h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content h1 i {
  font-size: 2rem;
}

.page-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.info-box {
  display: flex;
  align-items: flex-start;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

.info-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  color: #667eea;
}

.info-content p {
  margin: 0 0 0.5rem 0;
  color: #1e40af;
  font-size: 0.875rem;
}

.success-message {
  background-color: #d1fae5;
  color: #065f46;
  padding: 1.25rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.form-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-section {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

input[type='number'],
input[type='text'],
select,
textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

input[type='file'] {
  padding: 0.5rem 0;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.helper-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.simulation-section {
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.simulation-result {
  background-color: white;
  border-radius: 0.375rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row.total {
  font-weight: 700;
  font-size: 1.125rem;
  padding: 0.75rem 0;
  margin: 0.5rem 0;
  border-bottom: 2px solid #10b981;
  color: #10b981;
}

.empty-simulation {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.terms-agreement {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.terms-agreement label {
  font-size: 0.75rem;
  color: #4b5563;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button {
  padding: 0.875rem 2rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  border-color: #cbd5e1;
  background-color: #f8fafc;
  transform: translateY(-1px);
}

.submit-button {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .form-sections {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

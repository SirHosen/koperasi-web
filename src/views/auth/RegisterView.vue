<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const formData = ref({
  name: '',
  email: '',
  telepon: '',
  nik: '',
  alamat: '',
  occupation: '',
  income: '',
  username: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

// Form state
const currentStep = ref(1)
const totalSteps = 3
const errorMessage = ref('')
const successMessage = ref('')

// Income options
const incomeOptions = [
  { value: 'below_2m', label: 'Dibawah Rp 2.000.000' },
  { value: '2m_5m', label: 'Rp 2.000.000 - Rp 5.000.000' },
  { value: '5m_10m', label: 'Rp 5.000.000 - Rp 10.000.000' },
  { value: '10m_20m', label: 'Rp 10.000.000 - Rp 20.000.000' },
  { value: 'above_20m', label: 'Diatas Rp 20.000.000' },
]

// Clear any previous errors on mount
onMounted(() => {
  authStore.clearError()
})

// Form validation
const validateCurrentStep = () => {
  errorMessage.value = ''

  if (currentStep.value === 1) {
    if (!formData.value.name) return 'Nama lengkap wajib diisi'
    if (!formData.value.nik) return 'NIK wajib diisi'
    if (formData.value.nik.length !== 16) return 'NIK harus 16 digit'
    if (!formData.value.email) return 'Email wajib diisi'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) return 'Format email tidak valid'
    if (!formData.value.telepon) return 'Nomor telepon wajib diisi'
    if (!/^[0-9]{10,13}$/.test(formData.value.telepon.replace(/\D/g, '')))
      return 'Nomor telepon tidak valid'
  } else if (currentStep.value === 2) {
    if (!formData.value.alamat) return 'Alamat wajib diisi'
    if (!formData.value.occupation) return 'Pekerjaan wajib diisi'
    if (!formData.value.income) return 'Penghasilan wajib dipilih'
  } else if (currentStep.value === 3) {
    if (!formData.value.username) return 'Username wajib diisi'
    if (formData.value.username.length < 5) return 'Username minimal 5 karakter'
    if (!formData.value.password) return 'Password wajib diisi'
    if (formData.value.password.length < 8) return 'Password minimal 8 karakter'
    if (!formData.value.confirmPassword) return 'Konfirmasi password wajib diisi'
    if (formData.value.password !== formData.value.confirmPassword)
      return 'Password dan konfirmasi password tidak sama'
    if (!formData.value.acceptTerms) return 'Anda harus menyetujui syarat dan ketentuan'
  }

  return ''
}

// Navigation between steps
const nextStep = () => {
  const error = validateCurrentStep()
  if (error) {
    errorMessage.value = error
    return
  }

  if (currentStep.value < totalSteps) {
    currentStep.value++
    window.scrollTo(0, 0)
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    errorMessage.value = ''
    window.scrollTo(0, 0)
  }
}

// Submit registration
const submitRegistration = async () => {
  const error = validateCurrentStep()
  if (error) {
    errorMessage.value = error
    return
  }

  // Prepare data for API
  const registrationData = {
    username: formData.value.username,
    password: formData.value.password,
    email: formData.value.email,
    name: formData.value.name,
    nik: formData.value.nik,
    alamat: formData.value.alamat,
    telepon: formData.value.telepon,
  }

  try {
    errorMessage.value = ''

    // Call registration API through auth store
    const result = await authStore.register(registrationData)

    // Display success message
    successMessage.value = `Pendaftaran berhasil! Nomor anggota Anda adalah ${result.data.nomor_anggota}.
                          Silakan transfer simpanan pokok sebesar ${formatCurrency(result.data.simpanan_pokok)}
                          ke rekening koperasi dan login ke akun Anda.`

    // Redirect after 5 seconds
    setTimeout(() => {
      router.push('/login')
    }, 5000)
  } catch (error) {
    errorMessage.value = authStore.error || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
    console.error('Registration error:', error)
  }
}

// Format currency for display
const formatCurrency = (value: string | number) => {
  if (!value) return 'Rp 0'

  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d]/g, '')) : value

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numericValue)
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">Pendaftaran Anggota Baru</h1>
        <p class="register-subtitle">Bergabunglah dengan Koperasi Simpan Pinjam kami</p>
      </div>

      <!-- Progress Indicator -->
      <div class="progress-container">
        <div class="step-indicators">
          <div
            v-for="step in totalSteps"
            :key="step"
            class="step-indicator"
            :class="{
              completed: step < currentStep,
              current: step === currentStep,
              upcoming: step > currentStep,
            }"
          >
            <span class="step-number">{{ step }}</span>
            <span class="step-label">
              {{ step === 1 ? 'Data Pribadi' : step === 2 ? 'Informasi Tambahan' : 'Buat Akun' }}
            </span>
          </div>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="`width: ${((currentStep - 1) / (totalSteps - 1)) * 100}%`"
          ></div>
        </div>
      </div>

      <!-- Form Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <form
        @submit.prevent="currentStep === totalSteps ? submitRegistration() : nextStep()"
        class="register-form"
      >
        <!-- Step 1: Personal Data -->
        <div v-if="currentStep === 1" class="form-step">
          <h2 class="step-title">Data Pribadi</h2>

          <div class="form-group">
            <label for="fullName">Nama Lengkap</label>
            <input
              type="text"
              id="fullName"
              v-model="formData.name"
              placeholder="Masukkan nama lengkap Anda"
              autocomplete="name"
            />
          </div>

          <div class="form-group">
            <label for="nik">NIK (Nomor Induk Kependudukan)</label>
            <input
              type="text"
              id="nik"
              v-model="formData.nik"
              placeholder="Masukkan 16 digit NIK Anda"
              maxlength="16"
            />
            <small class="form-hint">NIK terdiri dari 16 digit angka</small>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              placeholder="Masukkan alamat email Anda"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="phone">Nomor Telepon</label>
            <input
              type="tel"
              id="phone"
              v-model="formData.telepon"
              placeholder="Contoh: 08123456789"
              autocomplete="tel"
            />
          </div>
        </div>

        <!-- Step 2: Additional Information -->
        <div v-if="currentStep === 2" class="form-step">
          <h2 class="step-title">Informasi Tambahan</h2>

          <div class="form-group">
            <label for="address">Alamat</label>
            <textarea
              id="address"
              v-model="formData.alamat"
              rows="3"
              placeholder="Masukkan alamat lengkap Anda"
              autocomplete="street-address"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="occupation">Pekerjaan</label>
            <input
              type="text"
              id="occupation"
              v-model="formData.occupation"
              placeholder="Masukkan pekerjaan Anda"
            />
          </div>

          <div class="form-group">
            <label for="income">Penghasilan per Bulan</label>
            <select id="income" v-model="formData.income">
              <option value="" disabled selected>Pilih penghasilan</option>
              <option v-for="option in incomeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Step 3: Account Creation -->
        <div v-if="currentStep === 3" class="form-step">
          <h2 class="step-title">Buat Akun</h2>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              v-model="formData.username"
              placeholder="Buat username untuk login"
              autocomplete="username"
            />
            <small class="form-hint">Minimal 5 karakter</small>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              placeholder="Buat password Anda"
              autocomplete="new-password"
            />
            <small class="form-hint">Minimal 8 karakter</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Konfirmasi Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              placeholder="Konfirmasi password Anda"
              autocomplete="new-password"
            />
          </div>

          <div class="form-group checkbox-group">
            <input type="checkbox" id="acceptTerms" v-model="formData.acceptTerms" />
            <label for="acceptTerms">
              Saya menyetujui <a href="#" @click.prevent>syarat dan ketentuan</a> keanggotaan
              koperasi
            </label>
          </div>

          <div class="additional-info">
            <p>Dengan mendaftar, Anda setuju untuk:</p>
            <ul>
              <li>Membayar simpanan pokok sebesar Rp 500.000 (satu kali)</li>
              <li>Membayar simpanan wajib sebesar Rp 100.000 per bulan</li>
              <li>Mematuhi AD/ART Koperasi Simpan Pinjam</li>
            </ul>
          </div>
        </div>

        <!-- Form Navigation -->
        <div class="form-navigation">
          <button v-if="currentStep > 1" type="button" class="back-button" @click="prevStep">
            Kembali
          </button>

          <button type="submit" class="next-button" :disabled="authStore.isLoading">
            <span v-if="authStore.isLoading">Memproses...</span>
            <span v-else-if="currentStep < totalSteps">Lanjut</span>
            <span v-else>Daftar</span>
          </button>
        </div>
      </form>

      <div class="register-footer">
        <p>Sudah memiliki akun? <router-link to="/login">Masuk</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  padding: 2rem 1rem;
}

.register-card {
  width: 100%;
  max-width: 600px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #6b7280;
}

/* Progress Indicator */
.progress-container {
  margin-bottom: 2rem;
}

.step-indicators {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-number {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  margin-bottom: 0.5rem;
  z-index: 1;
  background-color: #e5e7eb;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.step-indicator.completed .step-number {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

.step-indicator.current .step-number {
  background-color: white;
  color: #10b981;
  border-color: #10b981;
}

.step-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.step-indicator.current .step-label {
  color: #10b981;
  font-weight: 600;
}

.step-indicator.completed .step-label {
  color: #10b981;
}

.progress-bar {
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  margin-top: 0.5rem;
  position: relative;
}

.progress-fill {
  height: 100%;
  background-color: #10b981;
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Error and Success Messages */
.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.success-message {
  background-color: #d1fae5;
  color: #065f46;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

/* Form */
.register-form {
  margin-bottom: 1.5rem;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #374151;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

.form-group input:not([type='checkbox']),
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.form-hint {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.checkbox-group input {
  margin-top: 0.25rem;
}

.checkbox-group label {
  font-weight: normal;
}

.checkbox-group a {
  color: #10b981;
  text-decoration: none;
}

.additional-info {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.additional-info p {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.additional-info ul {
  font-size: 0.875rem;
  color: #4b5563;
  margin-left: 1.5rem;
}

.additional-info li {
  margin-bottom: 0.25rem;
}

/* Form Navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.back-button {
  padding: 0.625rem 1.25rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
}

.next-button {
  padding: 0.625rem 1.25rem;
  background-color: #10b981;
  border: none;
  border-radius: 0.375rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
  min-width: 100px;
}

.next-button:hover {
  background-color: #059669;
}

.next-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

/* Footer */
.register-footer {
  text-align: center;
  font-size: 0.875rem;
  color: #4b5563;
}

.register-footer a {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .step-label {
    display: none;
  }

  .form-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .back-button,
  .next-button {
    width: 100%;
  }
}
</style>

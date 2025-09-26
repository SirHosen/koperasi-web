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
    if (!formData.value.alamat) return 'Alamat wajib diisi'
  } else if (currentStep.value === 2) {
    if (!formData.value.email) return 'Email wajib diisi'
    if (!formData.value.telepon) return 'Nomor telepon wajib diisi'
    if (!formData.value.income) return 'Perkiraan pendapatan wajib dipilih'
  } else if (currentStep.value === 3) {
    if (!formData.value.username) return 'Username wajib diisi'
    if (!formData.value.password) return 'Password wajib diisi'
    if (formData.value.password.length < 6) return 'Password harus minimal 6 karakter'
    if (formData.value.password !== formData.value.confirmPassword)
      return 'Password konfirmasi tidak cocok'
    if (!formData.value.acceptTerms) return 'Anda harus menyetujui syarat dan ketentuan'
  }

  return null
}

// Navigate to next step
const nextStep = () => {
  const error = validateCurrentStep()
  if (error) {
    errorMessage.value = error
    return
  }

  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

// Navigate to previous step
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
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
    <div class="register-content">
      <!-- Header with Back Navigation -->
      <div class="register-header">
        <router-link to="/login" class="back-button">
          <i class="bi bi-arrow-left"></i>
        </router-link>
        <div class="logo-container">
          <i class="bi bi-bank2"></i>
        </div>
        <h1 class="register-title">Pendaftaran Anggota Baru</h1>
        <p>Bergabunglah dengan koperasi simpan pinjam terpercaya</p>
      </div>
          <div class="step-indicator">
            <div class="step-badges">
              <div
                v-for="step in totalSteps"
                :key="step"
                class="step-badge"
                :class="{
                  active: step === currentStep,
                  completed: step < currentStep,
                }"
              >
                <span class="step-number">{{ step }}</span>
                <div class="step-label">
                  <span>{{
                    step === 1 ? 'Data Pribadi' : step === 2 ? 'Informasi Tambahan' : 'Akun'
                  }}</span>
                </div>
              </div>
            </div>

            <div class="progress-bar-container">
              <div
                class="progress-fill"
                :style="`width: ${((currentStep - 1) / (totalSteps - 1)) * 100}%`"
              ></div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="alert alert-success" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            <span v-html="successMessage.replace(/\n/g, '<br>')"></span>
          </div>

          <!-- Registration Form -->
          <form
            @submit.prevent="currentStep === totalSteps ? submitRegistration() : nextStep()"
            class="register-form"
          >
            <!-- Step 1: Personal Information -->
            <div v-if="currentStep === 1" class="form-step">
              <h3 class="step-title">Informasi Pribadi</h3>
              <p class="step-description">Masukkan data diri Anda dengan lengkap dan benar.</p>

              <div class="form-group">
                <label for="name" class="form-label">Nama Lengkap</label>
                <div class="input-with-icon">
                  <i class="bi bi-person"></i>
                  <input
                    type="text"
                    id="name"
                    v-model="formData.name"
                    class="form-control"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="nik" class="form-label">NIK (Nomor Induk Kependudukan)</label>
                <div class="input-with-icon">
                  <i class="bi bi-card-text"></i>
                  <input
                    type="text"
                    id="nik"
                    v-model="formData.nik"
                    class="form-control"
                    placeholder="Masukkan 16 digit NIK"
                    maxlength="16"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="alamat" class="form-label">Alamat</label>
                <div class="input-with-icon textarea">
                  <i class="bi bi-geo-alt"></i>
                  <textarea
                    id="alamat"
                    v-model="formData.alamat"
                    class="form-control"
                    placeholder="Masukkan alamat lengkap"
                    rows="3"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Step 2: Additional Information -->
            <div v-if="currentStep === 2" class="form-step">
              <h3 class="step-title">Informasi Tambahan</h3>
              <p class="step-description">Berikan informasi kontak dan finansial Anda.</p>

              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <div class="input-with-icon">
                  <i class="bi bi-envelope"></i>
                  <input
                    type="email"
                    id="email"
                    v-model="formData.email"
                    class="form-control"
                    placeholder="contoh@email.com"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="telepon" class="form-label">Nomor Telepon</label>
                <div class="input-with-icon">
                  <i class="bi bi-phone"></i>
                  <input
                    type="tel"
                    id="telepon"
                    v-model="formData.telepon"
                    class="form-control"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="occupation" class="form-label">Pekerjaan</label>
                <div class="input-with-icon">
                  <i class="bi bi-briefcase"></i>
                  <input
                    type="text"
                    id="occupation"
                    v-model="formData.occupation"
                    class="form-control"
                    placeholder="Masukkan pekerjaan Anda"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="income" class="form-label">Perkiraan Pendapatan Per Bulan</label>
                <div class="input-with-icon select">
                  <i class="bi bi-cash-stack"></i>
                  <select id="income" v-model="formData.income" class="form-control" required>
                    <option value="" disabled selected>Pilih rentang pendapatan</option>
                    <option
                      v-for="option in incomeOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 3: Account Information -->
            <div v-if="currentStep === 3" class="form-step">
              <h3 class="step-title">Buat Akun</h3>
              <p class="step-description">Buat username dan password untuk akun Anda.</p>

              <div class="form-group">
                <label for="username" class="form-label">Username</label>
                <div class="input-with-icon">
                  <i class="bi bi-person-badge"></i>
                  <input
                    type="text"
                    id="username"
                    v-model="formData.username"
                    class="form-control"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <div class="input-with-icon">
                  <i class="bi bi-lock"></i>
                  <input
                    type="password"
                    id="password"
                    v-model="formData.password"
                    class="form-control"
                    placeholder="Minimal 6 karakter"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword" class="form-label">Konfirmasi Password</label>
                <div class="input-with-icon">
                  <i class="bi bi-lock-fill"></i>
                  <input
                    type="password"
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    class="form-control"
                    placeholder="Masukkan kembali password"
                    required
                  />
                </div>
              </div>

              <div class="form-check terms-check">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  v-model="formData.acceptTerms"
                  class="form-check-input"
                  required
                />
                <label class="form-check-label" for="acceptTerms">
                  Saya menyetujui <a href="#" class="terms-link">syarat dan ketentuan</a> yang
                  berlaku
                </label>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="form-navigation">
              <button
                type="button"
                v-if="currentStep > 1"
                class="btn btn-secondary prev-btn"
                @click="prevStep"
              >
                <i class="bi bi-arrow-left me-1"></i>
                Sebelumnya
              </button>

              <button
                type="submit"
                class="btn btn-primary next-btn"
                :disabled="authStore.isLoading"
              >
                <span v-if="currentStep < totalSteps">
                  Selanjutnya
                  <i class="bi bi-arrow-right ms-1"></i>
                </span>
                <span v-else>
                  <span
                    v-if="authStore.isLoading"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  Daftar Sekarang
                </span>
              </button>
            </div>
          </form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  z-index: 0;
}


.register-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.register-header {
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  padding-top: 0.5rem;
}

.back-button {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f1f3f5;
  color: #495057;
  text-decoration: none;
  transition: all 0.2s;
  z-index: 10;
  cursor: pointer;
}

.back-button:hover {
  background-color: #e9ecef;
  transform: translateX(-2px);
}

.logo-container {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #667eea;
}


.register-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
  letter-spacing: -0.025em;
}

.register-header p {
  color: #718096;
  font-size: 0.875rem;
  max-width: 280px;
  margin: 0 auto;
  line-height: 1.4;
  font-weight: 400;
}


/* Step Indicator */
.step-indicator {
  margin-bottom: 1.5rem;
}

.step-badges {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.step-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.step-badge.active .step-number {
  background-color: #2771d8;
  color: white;
  box-shadow: 0 2px 8px rgba(39, 113, 216, 0.3);
  transform: scale(1.1);
}

.step-badge.completed .step-number {
  background-color: #48bb78;
  color: white;
}

.step-badge.completed .step-number:after {
  content: '✓';
}

.step-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.step-badge.active .step-label {
  color: #667eea;
  font-weight: 600;
}

.progress-bar-container {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 4px;
  position: relative;
  margin-top: 1rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #667eea, #48bb78);
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* Form Steps */
.form-step {
  animation: fadeIn 0.3s ease-in-out;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
  letter-spacing: -0.025em;
}

.step-description {
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 1.25rem;
  line-height: 1.4;
}

/* Form Controls */
.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 1rem;
  color: #a0aec0;
  z-index: 1;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.input-with-icon.textarea i {
  top: 1.2rem;
  transform: none;
}

.input-with-icon.select i {
  z-index: 0;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem 0.625rem 2.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #2d3748;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-control:focus {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);
  outline: none;
}

.form-control:focus + .input-with-icon i {
  color: #667eea;
}

.form-control::placeholder {
  color: #a0aec0;
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%232771d8' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 01.708 0L8 10.293l5.646-5.647a.5.5 0 01.708.708l-6 6a.5.5 0 01-.708 0l-6-6a.5.5 0 010-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px;
  padding-right: 2.5rem;
}

.terms-check {
  display: flex;
  align-items: center;
  margin: 1rem 0;
  font-size: 0.8rem;
}

.form-check-input {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.terms-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  text-decoration: underline;
}

/* Navigation Buttons */
.form-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.625rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.prev-btn {
  padding-left: 1rem;
}

.next-btn {
  padding-right: 1rem;
  min-width: 150px;
}


/* Alert Messages */
.alert {
  padding: 0.875rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;
  font-size: 0.8rem;
}

.alert-danger {
  background-color: #fee;
  color: #e74c3c;
  border-left: 3px solid #e74c3c;
}

.alert-success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-left: 3px solid #2e7d32;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 576px) {
  .register-content {
    max-width: 100%;
    height: 100vh;
    border-radius: 0;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .step-badge .step-label {
    display: none;
  }

  .form-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .prev-btn,
  .next-btn {
    width: 100%;
  }
}
</style>

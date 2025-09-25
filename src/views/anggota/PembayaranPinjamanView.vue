<script setup lang="ts"><script setup lang="ts"><script setup lang="ts"><script setup lang="ts">

// Placeholder untuk PembayaranPinjamanView.vue

</script>import { ref, onMounted } from 'vue'



<template>import { ref, onMounted } from 'vue'import { ref, onMounted } from 'vue'

  <div class="payment-container">

    <div class="page-header">// Data

      <div class="header-content">

        <h1>const activeTab = ref('payment')import { useErrorHandler } from '@/lib/errorHandler'import { useErrorHandler } from '@/lib/errorHandler'

          <i class="bi bi-credit-card"></i>

          Pembayaran Pinjamanconst currentLoans = ref([])

        </h1>

        <p class="page-subtitle">Fitur dalam pengembangan</p>const paymentHistory = ref([])

      </div>

    </div>const selectedLoan = ref(null)



    <div class="info-message">const isLoading = ref(false)const {const {

      <i class="bi bi-info-circle"></i>

      <p>Fitur pembayaran pinjaman sedang dalam tahap pengembangan.</p>const errorMessage = ref('')

      <p>Silakan hubungi pengurus untuk pembayaran pinjaman.</p>

    </div>const successMessage = ref('')  handleAsync,  handleAsync,

  </div>

</template>



<style scoped>// Form data  error: errorMessage,  error: errorMessage,

.payment-container {

  max-width: 1200px;const paymentForm = ref({

  margin: 0 auto;

  padding: 0 1rem;  loan_id: '',  loading: isLoading,  loading: isLoading,

}

  jumlah_bayar: '',

.page-header {

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  tanggal_bayar: new Date().toISOString().split('T')[0],  success: successMessage,  success: successMessage,

  color: white;

  padding: 2rem;  metode_pembayaran: 'transfer',

  border-radius: 1rem;

  margin-bottom: 2rem;  nomor_referensi: '',  showSuccess,  showSuccess,

  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

}  keterangan: '',



.header-content h1 {  bukti_transfer: null,} = useErrorHandler()} = useErrorHandler()

  font-size: 2.25rem;

  font-weight: 700;})

  margin: 0 0 0.5rem 0;

  display: flex;

  align-items: center;

  gap: 0.75rem;// Constants

}

const paymentMethods = [// Interfaces// Interfaces

.header-content h1 i {

  font-size: 2rem;  { value: 'transfer', label: 'Transfer Bank' },

}

  { value: 'tunai', label: 'Tunai' },interface PaymentLoan {interface PaymentLoan {

.page-subtitle {

  margin: 0;  { value: 'auto_debit', label: 'Auto Debit' },

  opacity: 0.9;

  font-size: 1.1rem;]  id: string  id: string

}



.info-message {

  background: white;// Methods  jumlah_pinjaman: number  jumlah_pinjaman: number

  border-radius: 1rem;

  padding: 3rem;onMounted(async () => {

  text-align: center;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);  // Load initial data  bunga_total: number  bunga_total: number

  border: 1px solid rgba(0, 0, 0, 0.05);

}  loadCurrentLoans()



.info-message i {  loadPaymentHistory()  total_dibayar?: number  total_dibayar?: number

  font-size: 3rem;

  color: #667eea;})

  margin-bottom: 1rem;

  display: block;  tenor_bulan: number  tenor_bulan: number

}

function loadCurrentLoans() {

.info-message p {

  margin: 0.5rem 0;  // Simulate loading current loans  jenis_pinjaman: string  jenis_pinjaman: string

  color: #64748b;

  font-size: 1.1rem;  currentLoans.value = []

}

</style>}  tanggal_jatuh_tempo?: string  tanggal_jatuh_tempo?: string



function loadPaymentHistory() {}}

  // Simulate loading payment history

  paymentHistory.value = []

}

interface PaymentHistory {interface PaymentHistory {

function handleLoanChange() {

  selectedLoan.value = currentLoans.value.find(loan => loan.id === paymentForm.value.loan_id) || null  id: string  id: string

}

  tanggal_bayar: string  tanggal_bayar: string

function handleFileUpload(event) {

  const target = event.target  jenis_pinjaman: string  jenis_pinjaman: string

  if (target.files && target.files[0]) {

    paymentForm.value.bukti_transfer = target.files[0]  jumlah_bayar: number  jumlah_bayar: number

  }

}  metode_pembayaran: string  metode_pembayaran: string



function submitPayment() {  nomor_referensi?: string  nomor_referensi?: string

  if (!paymentForm.value.loan_id) {

    errorMessage.value = 'Pilih pinjaman terlebih dahulu'  status: string  status: string

    return

  }  bukti_transfer?: string  bukti_transfer?: string



  isLoading.value = true}}

  // Simulate payment submission

  setTimeout(() => {

    successMessage.value = 'Pembayaran berhasil diinput dan akan diverifikasi'

    resetForm()// Data// Data

    isLoading.value = false

  }, 2000)const currentLoans = ref<PaymentLoan[]>([])const currentLoans = ref<PaymentLoan[]>([])

}

const selectedLoan = ref<PaymentLoan | null>(null)const selectedLoan = ref<PaymentLoan | null>(null)

function resetForm() {

  paymentForm.value = {const paymentHistory = ref<PaymentHistory[]>([])const paymentHistory = ref<PaymentHistory[]>([])

    loan_id: '',

    jumlah_bayar: '',const activeTab = ref('payment')const activeTab = ref('payment')

    tanggal_bayar: new Date().toISOString().split('T')[0],

    metode_pembayaran: 'transfer',const currentPage = ref(1)const currentPage = ref(1)

    nomor_referensi: '',

    keterangan: '',const totalPages = ref(1)const totalPages = ref(1)

    bukti_transfer: null,

  }

}

// Form data// Form data

const formatCurrency = (amount) => {

  return new Intl.NumberFormat('id-ID', {const paymentForm = ref({const paymentForm = ref({

    style: 'currency',

    currency: 'IDR',  loan_id: '',  loan_id: '',

    maximumFractionDigits: 0,

  }).format(amount)  jumlah_bayar: '',  jumlah_bayar: '',

}

</script>  tanggal_bayar: new Date().toISOString().split('T')[0],  tanggal_bayar: new Date().toISOString().split('T')[0],



<template>  metode_pembayaran: 'transfer',  metode_pembayaran: 'transfer',

  <div class="payment-container">

    <!-- Modern Header -->  nomor_referensi: '',  nomor_referensi: '',

    <div class="page-header">

      <div class="header-content">  keterangan: '',  keterangan: '',

        <h1>

          <i class="bi bi-credit-card"></i>  bukti_transfer: null as File | null,  bukti_transfer: null as File | null,

          Pembayaran Pinjaman

        </h1>})})

        <p class="page-subtitle">Input dan kelola pembayaran angsuran pinjaman Anda</p>

      </div>

    </div>

// Constants// Constants

    <!-- Success/Error Messages -->

    <div v-if="successMessage" class="success-message">const paymentMethods = [const paymentMethods = [

      <i class="bi bi-check-circle"></i>

      {{ successMessage }}  { value: 'transfer', label: 'Transfer Bank' },  { value: 'transfer', label: 'Transfer Bank' },

    </div>

  { value: 'tunai', label: 'Tunai' },  { value: 'tunai', label: 'Tunai' },

    <div v-if="errorMessage" class="error-message">

      <i class="bi bi-exclamation-triangle"></i>  { value: 'auto_debit', label: 'Auto Debit' },  { value: 'auto_debit', label: 'Auto Debit' },

      {{ errorMessage }}

    </div>]]



    <!-- Tabs -->

    <div class="tabs-container">

      <div class="tabs-header">// Methods// Methods

        <button

          :class="['tab-button', { active: activeTab === 'payment' }]"onMounted(async () => {onMounted(async () => {

          @click="activeTab = 'payment'"

        >  await loadCurrentLoans()  await loadCurrentLoans()

          <i class="bi bi-plus-circle"></i>

          Input Pembayaran  await loadPaymentHistory()  await loadPaymentHistory()

        </button>

        <button})})

          :class="['tab-button', { active: activeTab === 'history' }]"

          @click="activeTab = 'history'"

        >

          <i class="bi bi-clock-history"></i>async function loadCurrentLoans() {async function loadCurrentLoans() {

          Riwayat Pembayaran

        </button>  await handleAsync(async () => {  await handleAsync(async () => {

      </div>

    const response = await fetch('/api/pinjaman/active', {    const response = await fetch('/api/pinjaman/active', {

      <!-- Payment Tab -->

      <div v-show="activeTab === 'payment'" class="tab-content">      headers: {      headers: {

        <div v-if="currentLoans.length === 0" class="no-loans-message">

          <i class="bi bi-info-circle"></i>        Authorization: `Bearer ${localStorage.getItem('token')}`,        Authorization: `Bearer ${localStorage.getItem('token')}`,

          <p>Anda tidak memiliki pinjaman aktif saat ini.</p>

          <router-link to="/anggota/pinjaman/ajukan" class="apply-button">      },      },

            Ajukan Pinjaman

          </router-link>    })    })

        </div>



        <div v-else class="payment-form-container">

          <div class="form-section">    if (!response.ok) throw new Error('Failed to fetch active loans')    if (!response.ok) throw new Error('Failed to fetch active loans')

            <h2>Form Input Pembayaran</h2>

            <form @submit.prevent="submitPayment" class="payment-form">

              <div class="form-grid">

                <div class="form-group">    const result = await response.json()    const result = await response.json()

                  <label for="loanSelect">Pilih Pinjaman *</label>

                  <select    currentLoans.value = result.data || []    currentLoans.value = result.data || []

                    id="loanSelect"

                    v-model="paymentForm.loan_id"

                    @change="handleLoanChange"

                    required    if (currentLoans.value.length > 0) {    if (currentLoans.value.length > 0) {

                  >

                    <option value="">-- Pilih Pinjaman --</option>      selectedLoan.value = currentLoans.value[0]      selectedLoan.value = currentLoans.value[0]

                    <option

                      v-for="loan in currentLoans"      paymentForm.value.loan_id = selectedLoan.value.id      paymentForm.value.loan_id = selectedLoan.value.id

                      :key="loan.id"

                      :value="loan.id"    }    }

                    >

                      {{ loan.jenis_pinjaman }} - {{ formatCurrency(loan.jumlah_pinjaman) }}  }, 'Gagal memuat data pinjaman aktif')  }, 'Gagal memuat data pinjaman aktif')

                    </option>

                  </select>}}

                </div>



                <div class="form-group">

                  <label for="tanggalBayar">Tanggal Pembayaran *</label>async function loadPaymentHistory(page = 1) {async function loadPaymentHistory(page = 1) {

                  <input

                    type="date"  await handleAsync(async () => {  await handleAsync(async () => {

                    id="tanggalBayar"

                    v-model="paymentForm.tanggal_bayar"    const response = await fetch(`/api/pinjaman/payments/history?page=${page}&limit=10`, {    const response = await fetch(`/api/pinjaman/payments/history?page=${page}&limit=10`, {

                    :max="new Date().toISOString().split('T')[0]"

                    required      headers: {      headers: {

                  />

                </div>        Authorization: `Bearer ${localStorage.getItem('token')}`,        Authorization: `Bearer ${localStorage.getItem('token')}`,



                <div class="form-group">      },      },

                  <label for="jumlahBayar">Jumlah Pembayaran (Rp) *</label>

                  <input    })    })

                    type="number"

                    id="jumlahBayar"

                    v-model="paymentForm.jumlah_bayar"

                    placeholder="Masukkan jumlah pembayaran"    if (!response.ok) throw new Error('Failed to fetch payment history')    if (!response.ok) throw new Error('Failed to fetch payment history')

                    min="1000"

                    step="1000"

                    required

                  />    const result = await response.json()    const result = await response.json()

                </div>

    paymentHistory.value = result.data    paymentHistory.value = result.data

                <div class="form-group">

                  <label for="metodePembayaran">Metode Pembayaran *</label>    currentPage.value = result.pagination.currentPage    currentPage.value = result.pagination.currentPage

                  <select

                    id="metodePembayaran"    totalPages.value = result.pagination.totalPages    totalPages.value = result.pagination.totalPages

                    v-model="paymentForm.metode_pembayaran"

                    required  }, 'Gagal memuat riwayat pembayaran')  }, 'Gagal memuat riwayat pembayaran')

                  >

                    <option}}

                      v-for="method in paymentMethods"

                      :key="method.value"

                      :value="method.value"

                    >function handleLoanChange() {function handleLoanChange() {

                      {{ method.label }}

                    </option>  selectedLoan.value =  selectedLoan.value =

                  </select>

                </div>    currentLoans.value.find((loan) => loan.id === paymentForm.value.loan_id) || null    currentLoans.value.find((loan) => loan.id === paymentForm.value.loan_id) || null



                <div class="form-group">}}

                  <label for="nomorReferensi">Nomor Referensi</label>

                  <input

                    type="text"

                    id="nomorReferensi"function handleFileUpload(event: Event) {function handleFileUpload(event: Event) {

                    v-model="paymentForm.nomor_referensi"

                    placeholder="No. transaksi/referensi"  const target = event.target as HTMLInputElement  const target = event.target as HTMLInputElement

                  />

                  <div class="helper-text">  if (target.files && target.files[0]) {  if (target.files && target.files[0]) {

                    Nomor transaksi bank atau referensi pembayaran

                  </div>    paymentForm.value.bukti_transfer = target.files[0]    paymentForm.value.bukti_transfer = target.files[0]

                </div>

  }  }

                <div class="form-group">

                  <label for="buktiTransfer">Bukti Transfer</label>}}

                  <input

                    type="file"

                    id="buktiTransfer"

                    @change="handleFileUpload"async function submitPayment() {async function submitPayment() {

                    accept="image/*,.pdf"

                  />  if (!paymentForm.value.loan_id) {  if (!paymentForm.value.loan_id) {

                  <div class="helper-text">

                    Upload bukti transfer (gambar atau PDF, maks. 5MB)    errorMessage.value = 'Pilih pinjaman terlebih dahulu'    errorMessage.value = 'Pilih pinjaman terlebih dahulu'

                  </div>

                </div>    return    return

              </div>

  }  }

              <div class="form-group full-width">

                <label for="keterangan">Keterangan</label>

                <textarea

                  id="keterangan"  if (!paymentForm.value.jumlah_bayar || parseFloat(paymentForm.value.jumlah_bayar) <= 0) {  if (!paymentForm.value.jumlah_bayar || parseFloat(paymentForm.value.jumlah_bayar) <= 0) {

                  v-model="paymentForm.keterangan"

                  rows="3"    errorMessage.value = 'Jumlah pembayaran harus lebih dari 0'    errorMessage.value = 'Jumlah pembayaran harus lebih dari 0'

                  placeholder="Keterangan pembayaran (opsional)"

                ></textarea>    return    return

              </div>

  }  }

              <div class="form-actions">

                <button type="button" @click="resetForm" class="cancel-button">

                  Reset Form

                </button>  const formData = new FormData()  const formData = new FormData()

                <button type="submit" :disabled="isLoading" class="submit-button">

                  {{ isLoading ? 'Memproses...' : 'Kirim Pembayaran' }}  formData.append('loan_id', paymentForm.value.loan_id)  formData.append('loan_id', paymentForm.value.loan_id)

                </button>

              </div>  formData.append('jumlah_bayar', paymentForm.value.jumlah_bayar)  formData.append('jumlah_bayar', paymentForm.value.jumlah_bayar)

            </form>

          </div>  formData.append('tanggal_bayar', paymentForm.value.tanggal_bayar)  formData.append('tanggal_bayar', paymentForm.value.tanggal_bayar)

        </div>

      </div>  formData.append('metode_pembayaran', paymentForm.value.metode_pembayaran)  formData.append('metode_pembayaran', paymentForm.value.metode_pembayaran)



      <!-- History Tab -->  formData.append('nomor_referensi', paymentForm.value.nomor_referensi)  formData.append('nomor_referensi', paymentForm.value.nomor_referensi)

      <div v-show="activeTab === 'history'" class="tab-content">

        <div class="history-section">  formData.append('keterangan', paymentForm.value.keterangan)  formData.append('keterangan', paymentForm.value.keterangan)

          <h2>Riwayat Pembayaran</h2>



          <div v-if="paymentHistory.length === 0" class="no-history-message">

            <i class="bi bi-clock-history"></i>  if (paymentForm.value.bukti_transfer) {  if (paymentForm.value.bukti_transfer) {

            <p>Belum ada riwayat pembayaran</p>

          </div>    formData.append('bukti_transfer', paymentForm.value.bukti_transfer)    formData.append('bukti_transfer', paymentForm.value.bukti_transfer)



          <div v-else class="history-table">  }  }

            <div class="table-header">

              <div class="col">Tanggal</div>

              <div class="col">Jenis Pinjaman</div>

              <div class="col">Jumlah</div>  const result = await handleAsync(async () => {  const result = await handleAsync(async () => {

              <div class="col">Metode</div>

              <div class="col">Status</div>    const response = await fetch('/api/pinjaman/payments/manual', {    const response = await fetch('/api/pinjaman/payments/manual', {

            </div>

                  method: 'POST',      method: 'POST',

            <div

              v-for="payment in paymentHistory"      headers: {      headers: {

              :key="payment.id"

              class="table-row"        Authorization: `Bearer ${localStorage.getItem('token')}`,        Authorization: `Bearer ${localStorage.getItem('token')}`,

            >

              <div class="col">{{ payment.tanggal_bayar }}</div>      },      },

              <div class="col">{{ payment.jenis_pinjaman }}</div>

              <div class="col">{{ formatCurrency(payment.jumlah_bayar) }}</div>      body: formData,      body: formData,

              <div class="col">{{ payment.metode_pembayaran }}</div>

              <div class="col">    })    })

                <span :class="['status-badge', `status-${payment.status}`]">

                  {{ payment.status }}

                </span>

              </div>    if (!response.ok) throw new Error('Failed to submit payment')    if (!response.ok) throw new Error('Failed to submit payment')

            </div>

          </div>

        </div>

      </div>    return await response.json()    return await response.json()

    </div>

  </div>  }, 'Gagal mengirim pembayaran')  }, 'Gagal mengirim pembayaran')

</template>



<style scoped>

.payment-container {  if (result) {  if (result) {

  max-width: 1200px;

  margin: 0 auto;    showSuccess('Pembayaran berhasil diinput dan akan diverifikasi')    showSuccess('Pembayaran berhasil diinput dan akan diverifikasi')

  padding: 0 1rem;

}    resetForm()    resetForm()



/* Modern Page Header */    await loadCurrentLoans()    await loadCurrentLoans()

.page-header {

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);    await loadPaymentHistory()    await loadPaymentHistory()

  color: white;

  padding: 2rem;  }  }

  border-radius: 1rem;

  margin-bottom: 2rem;}}

  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

}



.header-content h1 {function resetForm() {// Reset form

  font-size: 2.25rem;

  font-weight: 700;  paymentForm.value = {function resetForm() {

  margin: 0 0 0.5rem 0;

  display: flex;    loan_id: currentLoans.value.length > 0 ? currentLoans.value[0].id : '',  paymentForm.value = {

  align-items: center;

  gap: 0.75rem;    jumlah_bayar: '',    loan_id: currentLoans.value.length > 0 ? currentLoans.value[0].id : '',

}

    tanggal_bayar: new Date().toISOString().split('T')[0],    jumlah_bayar: '',

.header-content h1 i {

  font-size: 2rem;    metode_pembayaran: 'transfer',    tanggal_bayar: new Date().toISOString().split('T')[0],

}

    nomor_referensi: '',    metode_pembayaran: 'transfer',

.page-subtitle {

  margin: 0;    keterangan: '',    nomor_referensi: '',

  opacity: 0.9;

  font-size: 1.1rem;    bukti_transfer: null,    keterangan: '',

}

  }    bukti_transfer: null,

/* Messages */

.success-message {  }

  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);

  color: #065f46;  const fileInput = document.getElementById('buktiTransfer') as HTMLInputElement

  padding: 1rem 1.5rem;

  border-radius: 0.75rem;  if (fileInput) fileInput.value = ''  // Reset file input

  margin-bottom: 1.5rem;

  display: flex;}  const fileInput = document.getElementById('buktiTransfer') as HTMLInputElement

  align-items: center;

  gap: 0.5rem;  if (fileInput) fileInput.value = ''

  border: 1px solid rgba(16, 185, 129, 0.2);

}async function handlePageChange(page: number) {}



.error-message {  await loadPaymentHistory(page)

  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);

  color: #991b1b;}// Handle page change

  padding: 1rem 1.5rem;

  border-radius: 0.75rem;async function handlePageChange(page: number) {

  margin-bottom: 1.5rem;

  display: flex;const formatCurrency = (amount: number) => {  await loadPaymentHistory(page)

  align-items: center;

  gap: 0.5rem;  return new Intl.NumberFormat('id-ID', {}

  border: 1px solid rgba(239, 68, 68, 0.2);

}    style: 'currency',



/* Tabs */    currency: 'IDR',// Format currency

.tabs-container {

  background: white;    maximumFractionDigits: 0,const formatCurrency = (amount: number) => {

  border-radius: 1rem;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);  }).format(amount)  return new Intl.NumberFormat('id-ID', {

  border: 1px solid rgba(0, 0, 0, 0.05);

  overflow: hidden;}    style: 'currency',

}

    currency: 'IDR',

.tabs-header {

  display: flex;const formatDate = (dateString: string) => {    maximumFractionDigits: 0,

  border-bottom: 1px solid #e5e7eb;

}  return new Date(dateString).toLocaleDateString('id-ID', {  }).format(amount)



.tab-button {    year: 'numeric',}

  flex: 1;

  padding: 1rem 1.5rem;    month: 'long',

  background: white;

  border: none;    day: 'numeric',// Format date

  cursor: pointer;

  font-weight: 500;  })const formatDate = (dateString: string) => {

  display: flex;

  align-items: center;}  return new Date(dateString).toLocaleDateString('id-ID', {

  gap: 0.5rem;

  justify-content: center;    year: 'numeric',

  transition: all 0.3s ease;

  color: #64748b;const calculateRemainingBalance = (loan: PaymentLoan | null) => {    month: 'long',

}

  if (!loan) return 0    day: 'numeric',

.tab-button:hover {

  background-color: #f8fafc;  return loan.jumlah_pinjaman + loan.bunga_total - (loan.total_dibayar || 0)  })

}

}}

.tab-button.active {

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  color: white;

}const calculateInstallmentAmount = (loan: PaymentLoan | null) => {// Payment loan interface



.tab-content {  if (!loan) return 0interface PaymentLoan {

  padding: 2rem;

}  return (loan.jumlah_pinjaman + loan.bunga_total) / loan.tenor_bulan  id: string



/* Payment Form */}  jumlah_pinjaman: number

.payment-form-container {

  display: grid;</script>  bunga_total: number

  grid-template-columns: 1fr;

  gap: 2rem;  total_dibayar?: number

}

<template>  tenor_bulan: number

.form-section h2 {

  font-size: 1.25rem;  <div class="payment-container">  jenis_pinjaman: string

  font-weight: 600;

  color: #374151;    <!-- Modern Header -->  tanggal_jatuh_tempo?: string

  margin-bottom: 1.5rem;

  padding-bottom: 0.5rem;    <div class="page-header">}

  border-bottom: 2px solid #e5e7eb;

}      <div class="header-content">



.payment-form {        <h1>// Payment history interface

  background: #f8fafc;

  padding: 2rem;          <i class="bi bi-credit-card"></i>interface PaymentHistory {

  border-radius: 1rem;

  border: 1px solid rgba(0, 0, 0, 0.05);          Pembayaran Pinjaman  id: string

}

        </h1>  tanggal_bayar: string

.form-grid {

  display: grid;        <p class="page-subtitle">Input dan kelola pembayaran angsuran pinjaman Anda</p>  jenis_pinjaman: string

  grid-template-columns: 1fr 1fr;

  gap: 1.5rem;      </div>  jumlah_bayar: number

  margin-bottom: 1.5rem;

}    </div>  metode_pembayaran: string



.form-group {  nomor_referensi?: string

  display: flex;

  flex-direction: column;    <!-- Success/Error Messages -->  status: string

}

    <div v-if="successMessage" class="success-message">  bukti_transfer?: string

.form-group.full-width {

  grid-column: 1 / -1;      <i class="bi bi-check-circle"></i>}

}

      {{ successMessage }}

.form-group label {

  font-weight: 500;    </div>// Data

  color: #374151;

  margin-bottom: 0.5rem;const currentLoans = ref<PaymentLoan[]>([])

}

    <div v-if="errorMessage" class="error-message">const selectedLoan = ref<PaymentLoan | null>(null)

.form-group input,

.form-group select,      <i class="bi bi-exclamation-triangle"></i>const paymentForm = ref({

.form-group textarea {

  padding: 0.75rem;      {{ errorMessage }}  loan_id: '',

  border: 1px solid #d1d5db;

  border-radius: 0.5rem;    </div>  jumlah_bayar: '',

  font-size: 0.875rem;

}  tanggal_bayar: new Date().toISOString().split('T')[0],



.form-group input:focus,    <!-- Tabs -->  metode_pembayaran: 'transfer',

.form-group select:focus,

.form-group textarea:focus {    <div class="tabs-container">  nomor_referensi: '',

  outline: none;

  border-color: #667eea;      <div class="tabs-header">  keterangan: '',

  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);

}        <button  bukti_transfer: null as File | null,



.helper-text {          :class="['tab-button', { active: activeTab === 'payment' }]"})

  font-size: 0.75rem;

  color: #6b7280;          @click="activeTab = 'payment'"

  margin-top: 0.25rem;

}        >const paymentHistory = ref<PaymentHistory[]>([])



.form-actions {          <i class="bi bi-plus-circle"></i>

  display: flex;

  justify-content: flex-end;          Input Pembayaran// Calculate remaining balance

  gap: 1rem;

}        </button>const calculateRemainingBalance = (loan: PaymentLoan | null) => {



.cancel-button {        <button  if (!loan) return 0

  padding: 0.875rem 2rem;

  background: white;          :class="['tab-button', { active: activeTab === 'history' }]"  return loan.jumlah_pinjaman + loan.bunga_total - (loan.total_dibayar || 0)

  border: 2px solid #e2e8f0;

  border-radius: 0.75rem;          @click="activeTab = 'history'"}

  color: #64748b;

  font-weight: 600;        >

  cursor: pointer;

  transition: all 0.3s ease;          <i class="bi bi-clock-history"></i>// Calculate installment amount

}

          Riwayat Pembayaranconst calculateInstallmentAmount = (loan: PaymentLoan | null) => {

.cancel-button:hover {

  border-color: #cbd5e1;        </button>  if (!loan) return 0

  background-color: #f8fafc;

  transform: translateY(-1px);      </div>  return (loan.jumlah_pinjaman + loan.bunga_total) / loan.tenor_bulan

}

}

.submit-button {

  padding: 0.875rem 2rem;      <!-- Payment Tab --></script>

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  border: none;      <div v-show="activeTab === 'payment'" class="tab-content">

  border-radius: 0.75rem;

  color: white;        <div v-if="currentLoans.length === 0" class="no-loans-message"><template>

  font-weight: 600;

  cursor: pointer;          <i class="bi bi-info-circle"></i>  <div class="payment-container">

  transition: all 0.3s ease;

  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);          <p>Anda tidak memiliki pinjaman aktif saat ini.</p>    <!-- Modern Header -->

}

        </div>    <div class="page-header">

.submit-button:hover {

  transform: translateY(-2px);      <div class="header-content">

  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);

}        <div v-else class="payment-form-container">        <h1>



.submit-button:disabled {          <div class="form-section">          <i class="bi bi-credit-card"></i>

  background: #94a3b8;

  cursor: not-allowed;            <h2>Form Input Pembayaran</h2>          Pembayaran Pinjaman

  transform: none;

  box-shadow: none;            <form @submit.prevent="submitPayment" class="payment-form">        </h1>

}

              <div class="form-grid">        <p class="page-subtitle">Input dan kelola pembayaran angsuran pinjaman Anda</p>

/* No loans/history messages */

.no-loans-message,                <div class="form-group">      </div>

.no-history-message {

  text-align: center;                  <label for="loanSelect">Pilih Pinjaman *</label>    </div>

  padding: 3rem;

  color: #64748b;                  <select

}

                    id="loanSelect"    <!-- Success/Error Messages -->

.no-loans-message i,

.no-history-message i {                    v-model="paymentForm.loan_id"    <div v-if="successMessage" class="success-message">

  font-size: 3rem;

  margin-bottom: 1rem;                    @change="handleLoanChange"      <i class="bi bi-check-circle"></i>

  display: block;

  opacity: 0.5;                    required      {{ successMessage }}

}

                  >    </div>

.apply-button {

  padding: 0.875rem 2rem;                    <option value="">-- Pilih Pinjaman --</option>

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  color: white;                    <option    <div v-if="errorMessage" class="error-message">

  text-decoration: none;

  border-radius: 0.75rem;                      v-for="loan in currentLoans"      <i class="bi bi-exclamation-triangle"></i>

  font-weight: 600;

  transition: all 0.3s ease;                      :key="loan.id"      {{ errorMessage }}

  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  display: inline-block;                      :value="loan.id"    </div>

  margin-top: 1rem;

}                    >



.apply-button:hover {                      {{ loan.jenis_pinjaman }} - {{ formatCurrency(loan.jumlah_pinjaman) }}        <!-- Navigation Tabs -->

  transform: translateY(-2px);

  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);                    </option>        <div class="card">

  text-decoration: none;

  color: white;                  </select>          <div class="card-header">

}

                </div>            <ul class="nav nav-tabs card-header-tabs" role="tablist">

/* History Table */

.history-table {              <li class="nav-item" role="presentation">

  background: #f8fafc;

  border-radius: 1rem;                <div class="form-group">                <button

  padding: 1.5rem;

  border: 1px solid rgba(0, 0, 0, 0.05);                  <label for="tanggalBayar">Tanggal Pembayaran *</label>                  :class="['nav-link', { active: activeTab === 'payment' }]"

}

                  <input                  @click="activeTab = 'payment'"

.table-header {

  display: grid;                    type="date"                  type="button"

  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

  gap: 1rem;                    id="tanggalBayar"                >

  padding: 1rem;

  background: white;                    v-model="paymentForm.tanggal_bayar"                  <i class="bi bi-plus-circle me-2"></i>Input Pembayaran

  border-radius: 0.5rem;

  font-weight: 600;                    :max="new Date().toISOString().split('T')[0]"                </button>

  color: #374151;

  margin-bottom: 0.5rem;                    required              </li>

}

                  />              <li class="nav-item" role="presentation">

.table-row {

  display: grid;                </div>                <button

  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

  gap: 1rem;                  :class="['nav-link', { active: activeTab === 'history' }]"

  padding: 1rem;

  background: white;                <div class="form-group">                  @click="activeTab = 'history'"

  border-radius: 0.5rem;

  margin-bottom: 0.5rem;                  <label for="jumlahBayar">Jumlah Pembayaran (Rp) *</label>                  type="button"

  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

}                  <input                >



.table-row .col {                    type="number"                  <i class="bi bi-clock-history me-2"></i>Riwayat Pembayaran

  display: flex;

  align-items: center;                    id="jumlahBayar"                </button>

}

                    v-model="paymentForm.jumlah_bayar"              </li>

.status-badge {

  padding: 0.25rem 0.75rem;                    placeholder="Masukkan jumlah pembayaran"            </ul>

  border-radius: 9999px;

  font-size: 0.75rem;                    min="1000"          </div>

  font-weight: 500;

  text-transform: uppercase;                    step="1000"

}

                    required          <div class="card-body">

.status-pending {

  background: #fef3c7;                  />            <!-- Payment Input Tab -->

  color: #92400e;

}                  <div class="helper-text" v-if="selectedLoan">            <div v-show="activeTab === 'payment'" class="tab-pane">



.status-approved {                    Angsuran bulanan: {{ formatCurrency(calculateInstallmentAmount(selectedLoan)) }}              <div v-if="currentLoans.length === 0" class="alert alert-info">

  background: #d1fae5;

  color: #065f46;                  </div>                <i class="bi bi-info-circle me-2"></i>

}

                </div>                Anda tidak memiliki pinjaman aktif saat ini.

.status-rejected {

  background: #fee2e2;              </div>

  color: #991b1b;

}                <div class="form-group">



/* Responsive */                  <label for="metodePembayaran">Metode Pembayaran *</label>              <div v-else class="row">

@media (max-width: 768px) {

  .form-grid {                  <select                <div class="col-md-8">

    grid-template-columns: 1fr;

  }                    id="metodePembayaran"                  <form @submit.prevent="submitPayment">



  .table-header,                    v-model="paymentForm.metode_pembayaran"                    <div class="card">

  .table-row {

    grid-template-columns: 1fr;                    required                      <div class="card-header">

    gap: 0.5rem;

  }                  >                        <h5 class="mb-0"><i class="bi bi-form me-2"></i>Form Input Pembayaran</h5>



  .table-header .col,                    <option                      </div>

  .table-row .col {

    padding: 0.5rem 0;                      v-for="method in paymentMethods"                      <div class="card-body">

    border-bottom: 1px solid #f3f4f6;

  }                      :key="method.value"                        <div class="row">



  .table-header .col:last-child,                      :value="method.value"                          <div class="col-md-6">

  .table-row .col:last-child {

    border-bottom: none;                    >                            <div class="mb-3">

  }

}                      {{ method.label }}                              <label for="loanSelect" class="form-label">Pilih Pinjaman *</label>

</style>
                    </option>                              <select

                  </select>                                id="loanSelect"

                </div>                                class="form-select"

                                v-model="paymentForm.loan_id"

                <div class="form-group">                                @change="handleLoanChange"

                  <label for="nomorReferensi">Nomor Referensi</label>                                required

                  <input                              >

                    type="text"                                <option value="">-- Pilih Pinjaman --</option>

                    id="nomorReferensi"                                <option

                    v-model="paymentForm.nomor_referensi"                                  v-for="loan in currentLoans"

                    placeholder="No. transaksi/referensi"                                  :key="loan.id"

                  />                                  :value="loan.id"

                  <div class="helper-text">                                >

                    Nomor transaksi bank atau referensi pembayaran                                  {{ loan.jenis_pinjaman }} -

                  </div>                                  {{ formatCurrency(loan.jumlah_pinjaman) }}

                </div>                                </option>

                              </select>

                <div class="form-group">                            </div>

                  <label for="buktiTransfer">Bukti Transfer</label>                          </div>

                  <input

                    type="file"                          <div class="col-md-6">

                    id="buktiTransfer"                            <div class="mb-3">

                    @change="handleFileUpload"                              <label for="tanggalBayar" class="form-label"

                    accept="image/*,.pdf"                                >Tanggal Pembayaran *</label

                  />                              >

                  <div class="helper-text">                              <input

                    Upload bukti transfer (gambar atau PDF, maks. 5MB)                                type="date"

                  </div>                                class="form-control"

                </div>                                id="tanggalBayar"

              </div>                                v-model="paymentForm.tanggal_bayar"

                                :max="new Date().toISOString().split('T')[0]"

              <div class="form-group full-width">                                required

                <label for="keterangan">Keterangan</label>                              />

                <textarea                            </div>

                  id="keterangan"                          </div>

                  v-model="paymentForm.keterangan"                        </div>

                  rows="3"

                  placeholder="Keterangan pembayaran (opsional)"                        <div class="row">

                ></textarea>                          <div class="col-md-6">

              </div>                            <div class="mb-3">

                              <label for="jumlahBayar" class="form-label"

              <div class="form-actions">                                >Jumlah Pembayaran (Rp) *</label

                <button type="button" @click="resetForm" class="cancel-button">                              >

                  Reset Form                              <input

                </button>                                type="number"

                <button type="submit" :disabled="isLoading" class="submit-button">                                class="form-control"

                  {{ isLoading ? 'Memproses...' : 'Kirim Pembayaran' }}                                id="jumlahBayar"

                </button>                                v-model="paymentForm.jumlah_bayar"

              </div>                                placeholder="Masukkan jumlah pembayaran"

            </form>                                min="1000"

          </div>                                step="1000"

                                required

          <!-- Loan Summary -->                              />

          <div v-if="selectedLoan" class="loan-summary">                              <div class="form-text" v-if="selectedLoan">

            <h2>Ringkasan Pinjaman</h2>                                Angsuran bulanan:

            <div class="summary-card">                                {{ formatCurrency(calculateInstallmentAmount(selectedLoan)) }}

              <div class="summary-item">                              </div>

                <span class="label">Jenis Pinjaman</span>                            </div>

                <span class="value">{{ selectedLoan.jenis_pinjaman }}</span>                          </div>

              </div>

              <div class="summary-item">                          <div class="col-md-6">

                <span class="label">Jumlah Pinjaman</span>                            <div class="mb-3">

                <span class="value">{{ formatCurrency(selectedLoan.jumlah_pinjaman) }}</span>                              <label for="metodePembayaran" class="form-label"

              </div>                                >Metode Pembayaran *</label

              <div class="summary-item">                              >

                <span class="label">Total Bunga</span>                              <select

                <span class="value">{{ formatCurrency(selectedLoan.bunga_total) }}</span>                                id="metodePembayaran"

              </div>                                class="form-select"

              <div class="summary-item">                                v-model="paymentForm.metode_pembayaran"

                <span class="label">Sudah Dibayar</span>                                required

                <span class="value">{{ formatCurrency(selectedLoan.total_dibayar || 0) }}</span>                              >

              </div>                                <option

              <div class="summary-item total">                                  v-for="method in paymentMethods"

                <span class="label">Sisa Saldo</span>                                  :key="method.value"

                <span class="value">{{ formatCurrency(calculateRemainingBalance(selectedLoan)) }}</span>                                  :value="method.value"

              </div>                                >

            </div>                                  {{ method.label }}

          </div>                                </option>

        </div>                              </select>

      </div>                            </div>

                          </div>

      <!-- History Tab -->                        </div>

      <div v-show="activeTab === 'history'" class="tab-content">

        <div class="history-section">                        <div class="row">

          <h2>Riwayat Pembayaran</h2>                          <div class="col-md-6">

                                      <div class="mb-3">

          <div v-if="paymentHistory.length === 0" class="no-history-message">                              <label for="nomorReferensi" class="form-label">Nomor Referensi</label>

            <i class="bi bi-clock-history"></i>                              <input

            <p>Belum ada riwayat pembayaran</p>                                type="text"

          </div>                                class="form-control"

                                id="nomorReferensi"

          <div v-else class="history-table">                                v-model="paymentForm.nomor_referensi"

            <div class="table-header">                                placeholder="No. transaksi/referensi"

              <div class="col">Tanggal</div>                              />

              <div class="col">Jenis Pinjaman</div>                              <div class="form-text">

              <div class="col">Jumlah</div>                                Nomor transaksi bank atau referensi pembayaran

              <div class="col">Metode</div>                              </div>

              <div class="col">Status</div>                            </div>

            </div>                          </div>



            <div                          <div class="col-md-6">

              v-for="payment in paymentHistory"                            <div class="mb-3">

              :key="payment.id"                              <label for="buktiTransfer" class="form-label">Bukti Transfer</label>

              class="table-row"                              <input

            >                                type="file"

              <div class="col">{{ formatDate(payment.tanggal_bayar) }}</div>                                class="form-control"

              <div class="col">{{ payment.jenis_pinjaman }}</div>                                id="buktiTransfer"

              <div class="col">{{ formatCurrency(payment.jumlah_bayar) }}</div>                                @change="handleFileUpload"

              <div class="col">{{ payment.metode_pembayaran }}</div>                                accept="image/*,.pdf"

              <div class="col">                              />

                <span :class="['status-badge', `status-${payment.status}`]">                              <div class="form-text">

                  {{ payment.status }}                                Upload bukti transfer/pembayaran (JPG, PNG, PDF - Max 5MB)

                </span>                              </div>

              </div>                            </div>

            </div>                          </div>

                        </div>

            <!-- Pagination -->

            <div v-if="totalPages > 1" class="pagination">                        <div class="mb-3">

              <button                          <label for="keterangan" class="form-label">Keterangan</label>

                :disabled="currentPage <= 1"                          <textarea

                @click="handlePageChange(currentPage - 1)"                            class="form-control"

                class="page-button"                            id="keterangan"

              >                            v-model="paymentForm.keterangan"

                <i class="bi bi-chevron-left"></i>                            rows="3"

              </button>                            placeholder="Keterangan tambahan (opsional)"

                                        ></textarea>

              <span class="page-info">                        </div>

                Halaman {{ currentPage }} dari {{ totalPages }}

              </span>                        <div class="d-flex gap-2">

                                        <button type="submit" class="btn btn-primary" :disabled="isLoading">

              <button                            <span

                :disabled="currentPage >= totalPages"                              v-if="isLoading"

                @click="handlePageChange(currentPage + 1)"                              class="spinner-border spinner-border-sm me-2"

                class="page-button"                              role="status"

              >                            ></span>

                <i class="bi bi-chevron-right"></i>                            <i v-else class="bi bi-send me-2"></i>

              </button>                            Input Pembayaran

            </div>                          </button>

          </div>

        </div>                          <button

      </div>                            type="button"

    </div>                            class="btn btn-outline-secondary"

  </div>                            @click="resetForm"

</template>                          >

                            <i class="bi bi-arrow-clockwise me-2"></i>

<style scoped>                            Reset Form

.payment-container {                          </button>

  max-width: 1200px;                        </div>

  margin: 0 auto;                      </div>

  padding: 0 1rem;                    </div>

}                  </form>

                </div>

/* Modern Page Header */

.page-header {                <div class="col-md-4">

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);                  <div class="card" v-if="selectedLoan">

  color: white;                    <div class="card-header">

  padding: 2rem;                      <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Detail Pinjaman</h5>

  border-radius: 1rem;                    </div>

  margin-bottom: 2rem;                    <div class="card-body">

  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);                      <dl class="row">

}                        <dt class="col-sm-6">Jenis Pinjaman:</dt>

                        <dd class="col-sm-6">{{ selectedLoan.jenis_pinjaman }}</dd>

.header-content h1 {

  font-size: 2.25rem;                        <dt class="col-sm-6">Jumlah Pinjaman:</dt>

  font-weight: 700;                        <dd class="col-sm-6">{{ formatCurrency(selectedLoan.jumlah_pinjaman) }}</dd>

  margin: 0 0 0.5rem 0;

  display: flex;                        <dt class="col-sm-6">Bunga Total:</dt>

  align-items: center;                        <dd class="col-sm-6">{{ formatCurrency(selectedLoan.bunga_total) }}</dd>

  gap: 0.75rem;

}                        <dt class="col-sm-6">Total Harus Dibayar:</dt>

                        <dd class="col-sm-6 text-primary">

.header-content h1 i {                          <strong>{{

  font-size: 2rem;                            formatCurrency(selectedLoan.jumlah_pinjaman + selectedLoan.bunga_total)

}                          }}</strong>

                        </dd>

.page-subtitle {

  margin: 0;                        <dt class="col-sm-6">Sudah Dibayar:</dt>

  opacity: 0.9;                        <dd class="col-sm-6 text-success">

  font-size: 1.1rem;                          {{ formatCurrency(selectedLoan.total_dibayar || 0) }}

}                        </dd>



/* Messages */                        <dt class="col-sm-6">Sisa Tagihan:</dt>

.success-message {                        <dd class="col-sm-6 text-danger">

  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);                          <strong>{{

  color: #065f46;                            formatCurrency(calculateRemainingBalance(selectedLoan))

  padding: 1rem 1.5rem;                          }}</strong>

  border-radius: 0.75rem;                        </dd>

  margin-bottom: 1.5rem;

  display: flex;                        <dt class="col-sm-6">Tenor:</dt>

  align-items: center;                        <dd class="col-sm-6">{{ selectedLoan.tenor_bulan }} bulan</dd>

  gap: 0.5rem;

  border: 1px solid rgba(16, 185, 129, 0.2);                        <dt class="col-sm-6">Angsuran/Bulan:</dt>

}                        <dd class="col-sm-6">

                          {{ formatCurrency(calculateInstallmentAmount(selectedLoan)) }}

.error-message {                        </dd>

  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);

  color: #991b1b;                        <dt class="col-sm-6">Jatuh Tempo:</dt>

  padding: 1rem 1.5rem;                        <dd class="col-sm-6">

  border-radius: 0.75rem;                          {{

  margin-bottom: 1.5rem;                            selectedLoan.tanggal_jatuh_tempo

  display: flex;                              ? formatDate(selectedLoan.tanggal_jatuh_tempo)

  align-items: center;                              : '-'

  gap: 0.5rem;                          }}

  border: 1px solid rgba(239, 68, 68, 0.2);                        </dd>

}                      </dl>

                    </div>

/* Tabs */                  </div>

.tabs-container {

  background: white;                  <div class="card mt-3">

  border-radius: 1rem;                    <div class="card-body">

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);                      <h6 class="card-title">

  border: 1px solid rgba(0, 0, 0, 0.05);                        <i class="bi bi-question-circle me-2"></i>Petunjuk Pembayaran

  overflow: hidden;                      </h6>

}                      <ul class="small">

                        <li>Pastikan jumlah pembayaran sesuai dengan angsuran bulanan</li>

.tabs-header {                        <li>Upload bukti transfer untuk mempercepat verifikasi</li>

  display: flex;                        <li>Pembayaran akan diverifikasi dalam 1-2 hari kerja</li>

  border-bottom: 1px solid #e5e7eb;                        <li>Hubungi pengurus jika ada pertanyaan</li>

}                      </ul>

                    </div>

.tab-button {                  </div>

  flex: 1;                </div>

  padding: 1rem 1.5rem;              </div>

  background: white;            </div>

  border: none;

  cursor: pointer;            <!-- Payment History Tab -->

  font-weight: 500;            <div v-show="activeTab === 'history'" class="tab-pane">

  display: flex;              <div class="table-responsive">

  align-items: center;                <table class="table table-striped table-hover">

  gap: 0.5rem;                  <thead>

  justify-content: center;                    <tr>

  transition: all 0.3s ease;                      <th>Tanggal Bayar</th>

  color: #64748b;                      <th>Pinjaman</th>

}                      <th>Jumlah Dibayar</th>

                      <th>Metode</th>

.tab-button:hover {                      <th>No. Referensi</th>

  background-color: #f8fafc;                      <th>Status</th>

}                      <th>Bukti</th>

                    </tr>

.tab-button.active {                  </thead>

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);                  <tbody>

  color: white;                    <tr v-if="isLoading">

}                      <td colspan="7" class="text-center py-4">

                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>

.tab-content {                        Memuat data...

  padding: 2rem;                      </td>

}                    </tr>

                    <tr v-else-if="paymentHistory.length === 0">

/* Payment Form */                      <td colspan="7" class="text-center py-4 text-muted">

.payment-form-container {                        Belum ada riwayat pembayaran

  display: grid;                      </td>

  grid-template-columns: 2fr 1fr;                    </tr>

  gap: 2rem;                    <tr v-else v-for="payment in paymentHistory" :key="payment.id">

}                      <td>{{ formatDate(payment.tanggal_bayar) }}</td>

                      <td>{{ payment.jenis_pinjaman }}</td>

.form-section h2,                      <td class="text-success">{{ formatCurrency(payment.jumlah_bayar) }}</td>

.loan-summary h2 {                      <td>

  font-size: 1.25rem;                        <span class="badge bg-secondary">{{ payment.metode_pembayaran }}</span>

  font-weight: 600;                      </td>

  color: #374151;                      <td>{{ payment.nomor_referensi || '-' }}</td>

  margin-bottom: 1.5rem;                      <td>

  padding-bottom: 0.5rem;                        <span

  border-bottom: 2px solid #e5e7eb;                          :class="{

}                            'badge rounded-pill': true,

                            'bg-success': payment.status === 'diverifikasi',

.payment-form {                            'bg-warning text-dark': payment.status === 'menunggu',

  background: #f8fafc;                            'bg-danger': payment.status === 'ditolak',

  padding: 2rem;                          }"

  border-radius: 1rem;                        >

  border: 1px solid rgba(0, 0, 0, 0.05);                          {{

}                            payment.status === 'diverifikasi'

                              ? 'Diverifikasi'

.form-grid {                              : payment.status === 'menunggu'

  display: grid;                                ? 'Menunggu'

  grid-template-columns: 1fr 1fr;                                : 'Ditolak'

  gap: 1.5rem;                          }}

  margin-bottom: 1.5rem;                        </span>

}                      </td>

                      <td>

.form-group {                        <a

  display: flex;                          v-if="payment.bukti_transfer"

  flex-direction: column;                          :href="payment.bukti_transfer"

}                          target="_blank"

                          class="btn btn-sm btn-outline-primary"

.form-group.full-width {                        >

  grid-column: 1 / -1;                          <i class="bi bi-eye"></i>

}                        </a>

                        <span v-else class="text-muted">-</span>

.form-group label {                      </td>

  font-weight: 500;                    </tr>

  color: #374151;                  </tbody>

  margin-bottom: 0.5rem;                </table>

}              </div>



.form-group input,              <!-- Pagination -->

.form-group select,              <nav v-if="totalPages > 1" aria-label="Pagination">

.form-group textarea {                <ul class="pagination justify-content-center">

  padding: 0.75rem;                  <li class="page-item" :class="{ disabled: currentPage === 1 }">

  border: 1px solid #d1d5db;                    <a

  border-radius: 0.5rem;                      class="page-link"

  font-size: 0.875rem;                      href="#"

}                      @click.prevent="handlePageChange(currentPage - 1)"

                    >

.form-group input:focus,                      &laquo; Sebelumnya

.form-group select:focus,                    </a>

.form-group textarea:focus {                  </li>

  outline: none;

  border-color: #667eea;                  <template v-for="page in totalPages" :key="page">

  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);                    <li class="page-item" :class="{ active: currentPage === page }">

}                      <a class="page-link" href="#" @click.prevent="handlePageChange(page)">

                        {{ page }}

.helper-text {                      </a>

  font-size: 0.75rem;                    </li>

  color: #6b7280;                  </template>

  margin-top: 0.25rem;

}                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">

                    <a

.form-actions {                      class="page-link"

  display: flex;                      href="#"

  justify-content: flex-end;                      @click.prevent="handlePageChange(currentPage + 1)"

  gap: 1rem;                    >

}                      Selanjutnya &raquo;

                    </a>

.cancel-button {                  </li>

  padding: 0.875rem 2rem;                </ul>

  background: white;              </nav>

  border: 2px solid #e2e8f0;            </div>

  border-radius: 0.75rem;          </div>

  color: #64748b;        </div>

  font-weight: 600;      </div>

  cursor: pointer;    </div>

  transition: all 0.3s ease;  </div>

}</template>



.cancel-button:hover {<style scoped>

  border-color: #cbd5e1;.nav-tabs .nav-link {

  background-color: #f8fafc;  border-bottom: 2px solid transparent;

  transform: translateY(-1px);  color: #495057;

}}



.submit-button {.nav-tabs .nav-link.active {

  padding: 0.875rem 2rem;  border-bottom-color: #007bff;

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  background-color: transparent;

  border: none;  border-top: none;

  border-radius: 0.75rem;  border-left: none;

  color: white;  border-right: none;

  font-weight: 600;}

  cursor: pointer;

  transition: all 0.3s ease;.nav-tabs .nav-link:hover {

  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);  border-bottom-color: #dee2e6;

}}



.submit-button:hover {.card {

  transform: translateY(-2px);  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);

  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);  border: 1px solid rgba(0, 0, 0, 0.125);

}}



.submit-button:disabled {.card-header {

  background: #94a3b8;  background-color: rgba(0, 0, 0, 0.03);

  cursor: not-allowed;  border-bottom: 1px solid rgba(0, 0, 0, 0.125);

  transform: none;}

  box-shadow: none;

}.table th {

  border-top: none;

/* Loan Summary */  font-weight: 600;

.loan-summary {  color: #495057;

  background: #f8fafc;}

  padding: 2rem;

  border-radius: 1rem;.badge {

  border: 1px solid rgba(0, 0, 0, 0.05);  font-size: 0.75em;

  height: fit-content;}

}

.alert {

.summary-card {  border: none;

  background: white;  border-radius: 0.375rem;

  padding: 1.5rem;}

  border-radius: 0.75rem;

  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);.pagination .page-link {

}  color: #007bff;

}

.summary-item {

  display: flex;.pagination .page-item.active .page-link {

  justify-content: space-between;  background-color: #007bff;

  padding: 0.75rem 0;  border-color: #007bff;

  border-bottom: 1px solid #f3f4f6;}

}

dl {

.summary-item:last-child {  margin-bottom: 0;

  border-bottom: none;}

}

dt {

.summary-item.total {  font-weight: 600;

  font-weight: 700;  font-size: 0.875rem;

  font-size: 1.1rem;  color: #6c757d;

  color: #667eea;}

  border-top: 2px solid #e5e7eb;

  margin-top: 0.5rem;dd {

  padding-top: 1rem;  font-size: 0.875rem;

}  margin-bottom: 0.5rem;

}

.summary-item .label {</style>

  color: #6b7280;
}

.summary-item .value {
  font-weight: 500;
  color: #374151;
}

/* No loans/history messages */
.no-loans-message,
.no-history-message {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.no-loans-message i,
.no-history-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  opacity: 0.5;
}

/* History Table */
.history-table {
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-row .col {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-approved {
  background: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-button {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-button:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: #374151;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-form-container {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .table-header .col,
  .table-row .col {
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .table-header .col:last-child,
  .table-row .col:last-child {
    border-bottom: none;
  }
}
</style>

<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h3 mb-0">
              <i class="fas fa-clipboard-check me-2"></i>
              Verifikasi Pinjaman (5C Analysis)
            </h2>
            <p class="text-muted mb-0">
              Sistem penilaian kredit berdasarkan 5C: Character, Capacity, Capital, Collateral,
              Condition
            </p>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-primary"
              @click="exportVerificationReport"
              :disabled="!selectedApplication"
            >
              <i class="fas fa-file-export"></i>
              Export Report
            </button>
            <button
              class="btn btn-outline-success"
              @click="refreshApplications"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Applications List -->
      <div class="col-md-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0">Daftar Pengajuan</h5>
          </div>
          <div class="card-body p-0">
            <div v-if="loading" class="text-center p-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Memuat aplikasi...</p>
            </div>

            <div v-else-if="applications.length === 0" class="text-center p-4">
              <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h6 class="text-muted">Tidak ada pengajuan</h6>
              <p class="text-muted mb-0">Belum ada pengajuan yang perlu diverifikasi</p>
            </div>

            <div v-else class="list-group list-group-flush">
              <div
                v-for="app in applications"
                :key="app.id"
                class="list-group-item list-group-item-action"
                :class="{ active: selectedApplication?.id === app.id }"
                @click="selectApplication(app)"
                style="cursor: pointer"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ app.memberName }}</h6>
                    <p class="mb-1 text-muted">{{ app.memberNumber }}</p>
                    <small class="text-muted">Rp {{ formatCurrency(app.amount) }}</small>
                  </div>
                  <div class="text-end">
                    <span class="badge" :class="getStatusBadgeClass(app.verificationStatus)">
                      {{ getStatusText(app.verificationStatus) }}
                    </span>
                    <br />
                    <small class="text-muted">{{ formatDate(app.submissionDate) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5C Verification Form -->
      <div class="col-md-8">
        <div v-if="!selectedApplication" class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="fas fa-hand-pointer fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Pilih Pengajuan</h5>
            <p class="text-muted">Pilih pengajuan dari daftar untuk memulai verifikasi 5C</p>
          </div>
        </div>

        <div v-else class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Verifikasi 5C - {{ selectedApplication.memberName }}</h5>
              <div class="d-flex gap-2">
                <span
                  class="badge fs-6"
                  :class="getOverallScoreBadgeClass(verificationForm.overallScore)"
                >
                  Score: {{ verificationForm.overallScore }}/100
                </span>
                <span
                  class="badge fs-6"
                  :class="getRecommendationBadgeClass(verificationForm.recommendation)"
                >
                  {{ verificationForm.recommendation || 'Pending' }}
                </span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <!-- Application Info -->
            <div class="row mb-4">
              <div class="col-md-6">
                <h6>Informasi Pengajuan</h6>
                <table class="table table-sm">
                  <tr>
                    <td>Nama Anggota</td>
                    <td>{{ selectedApplication.memberName }}</td>
                  </tr>
                  <tr>
                    <td>No. Anggota</td>
                    <td>{{ selectedApplication.memberNumber }}</td>
                  </tr>
                  <tr>
                    <td>Jenis Pinjaman</td>
                    <td>{{ selectedApplication.loanType }}</td>
                  </tr>
                  <tr>
                    <td>Jumlah</td>
                    <td>Rp {{ formatCurrency(selectedApplication.amount) }}</td>
                  </tr>
                  <tr>
                    <td>Jangka Waktu</td>
                    <td>{{ selectedApplication.term }} bulan</td>
                  </tr>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Riwayat Pinjaman</h6>
                <table class="table table-sm">
                  <tr>
                    <td>Total Pinjaman Sebelumnya</td>
                    <td>{{ selectedApplication.previousLoans || 0 }}</td>
                  </tr>
                  <tr>
                    <td>Pinjaman Aktif</td>
                    <td>Rp {{ formatCurrency(selectedApplication.activeLoan || 0) }}</td>
                  </tr>
                  <tr>
                    <td>Keterlambatan</td>
                    <td>{{ selectedApplication.delayHistory || 0 }} kali</td>
                  </tr>
                  <tr>
                    <td>Rating Kredit</td>
                    <td>
                      <span
                        class="badge"
                        :class="getCreditRatingBadge(selectedApplication.creditRating)"
                      >
                        {{ selectedApplication.creditRating || 'N/A' }}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- 5C Assessment Form -->
            <form @submit.prevent="saveVerification">
              <!-- 1. Character (20 points) -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-user me-2 text-primary"></i>
                    1. Character (Karakter) - Bobot: 20%
                  </h6>
                  <small class="text-muted"
                    >Penilaian terhadap karakter dan integritas peminjam</small
                  >
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Riwayat Pembayaran</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.character.paymentHistory"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Penilaian</option>
                          <option value="5">Sangat Baik (5) - Tidak pernah terlambat</option>
                          <option value="4">Baik (4) - Jarang terlambat</option>
                          <option value="3">Cukup (3) - Kadang terlambat</option>
                          <option value="2">Kurang (2) - Sering terlambat</option>
                          <option value="1">Buruk (1) - Selalu terlambat</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Reputasi di Masyarakat</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.character.reputation"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Penilaian</option>
                          <option value="5">Sangat Baik (5) - Sangat dipercaya</option>
                          <option value="4">Baik (4) - Dipercaya</option>
                          <option value="3">Cukup (3) - Cukup dipercaya</option>
                          <option value="2">Kurang (2) - Kurang dipercaya</option>
                          <option value="1">Buruk (1) - Tidak dipercaya</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Komitmen Koperasi</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.character.commitment"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Penilaian</option>
                          <option value="5">Sangat Baik (5) - Sangat aktif dalam koperasi</option>
                          <option value="4">Baik (4) - Aktif dalam koperasi</option>
                          <option value="3">Cukup (3) - Cukup aktif</option>
                          <option value="2">Kurang (2) - Kurang aktif</option>
                          <option value="1">Buruk (1) - Tidak aktif</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Catatan Tambahan</label>
                        <textarea
                          class="form-control"
                          rows="3"
                          v-model="verificationForm.character.notes"
                          placeholder="Catatan khusus mengenai karakter peminjam..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div class="bg-light p-2 rounded">
                    <strong>Character Score: {{ verificationForm.character.score }}/20</strong>
                  </div>
                </div>
              </div>

              <!-- 2. Capacity (25 points) -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-chart-line me-2 text-success"></i>
                    2. Capacity (Kemampuan) - Bobot: 25%
                  </h6>
                  <small class="text-muted"
                    >Penilaian kemampuan pembayaran berdasarkan pendapatan</small
                  >
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Pendapatan Bulanan</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="verificationForm.capacity.monthlyIncome"
                          @input="calculateScore"
                          placeholder="Pendapatan per bulan"
                        />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Pengeluaran Bulanan</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="verificationForm.capacity.monthlyExpense"
                          @input="calculateScore"
                          placeholder="Pengeluaran per bulan"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Kewajiban Lain</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="verificationForm.capacity.otherObligations"
                          @input="calculateScore"
                          placeholder="Kewajiban hutang lain"
                        />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Stabilitas Pekerjaan</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.capacity.jobStability"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Penilaian</option>
                          <option value="5">Sangat Stabil (5) - PNS/Pegawai tetap >5 tahun</option>
                          <option value="4">Stabil (4) - Pegawai tetap 2-5 tahun</option>
                          <option value="3">Cukup Stabil (3) - Pegawai kontrak/usaha mapan</option>
                          <option value="2">Kurang Stabil (2) - Usaha baru/freelance</option>
                          <option value="1">Tidak Stabil (1) - Tidak ada pekerjaan tetap</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-4">
                      <div class="bg-light p-2 rounded text-center">
                        <small class="text-muted">Net Income</small>
                        <br />
                        <strong
                          >Rp
                          {{
                            formatCurrency(
                              (verificationForm.capacity.monthlyIncome || 0) -
                                (verificationForm.capacity.monthlyExpense || 0) -
                                (verificationForm.capacity.otherObligations || 0),
                            )
                          }}</strong
                        >
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="bg-light p-2 rounded text-center">
                        <small class="text-muted">Debt-to-Income Ratio</small>
                        <br />
                        <strong>{{ calculateDTI() }}%</strong>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="bg-light p-2 rounded text-center">
                        <small class="text-muted">Capacity Score</small>
                        <br />
                        <strong>{{ verificationForm.capacity.score }}/25</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. Capital (20 points) -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-coins me-2 text-warning"></i>
                    3. Capital (Modal) - Bobot: 20%
                  </h6>
                  <small class="text-muted">Penilaian modal dan aset yang dimiliki</small>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Simpanan di Koperasi</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="verificationForm.capital.savingsBalance"
                          @input="calculateScore"
                          placeholder="Saldo simpanan"
                        />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Tabungan/Deposito Lain</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="verificationForm.capital.otherSavings"
                          @input="calculateScore"
                          placeholder="Tabungan di bank lain"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Nilai Aset</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="verificationForm.capital.assetValue"
                          @input="calculateScore"
                          placeholder="Nilai total aset"
                        />
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Modal Usaha</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="verificationForm.capital.businessCapital"
                          @input="calculateScore"
                          placeholder="Modal usaha yang dimiliki"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="bg-light p-2 rounded">
                    <strong>Capital Score: {{ verificationForm.capital.score }}/20</strong>
                  </div>
                </div>
              </div>

              <!-- 4. Collateral (15 points) -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-home me-2 text-info"></i>
                    4. Collateral (Jaminan) - Bobot: 15%
                  </h6>
                  <small class="text-muted">Penilaian jaminan yang diberikan</small>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Jenis Jaminan</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.collateral.type"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Jenis Jaminan</option>
                          <option value="5">Sertifikat Tanah/Rumah (5)</option>
                          <option value="4">BPKB Kendaraan (4)</option>
                          <option value="3">Simpanan Berjangka (3)</option>
                          <option value="2">Barang Berharga (2)</option>
                          <option value="1">Tanpa Jaminan (1)</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Nilai Jaminan</label>
                        <input
                          type="number"
                          class="form-control"
                          v-model.number="verificationForm.collateral.value"
                          @input="calculateScore"
                          placeholder="Nilai taksiran jaminan"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Kondisi Jaminan</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.collateral.condition"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Kondisi</option>
                          <option value="5">Sangat Baik (5)</option>
                          <option value="4">Baik (4)</option>
                          <option value="3">Cukup (3)</option>
                          <option value="2">Kurang (2)</option>
                          <option value="1">Buruk (1)</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Rasio Jaminan</label>
                        <div class="form-control-plaintext">
                          {{ calculateCollateralRatio() }}% dari nilai pinjaman
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-light p-2 rounded">
                    <strong>Collateral Score: {{ verificationForm.collateral.score }}/15</strong>
                  </div>
                </div>
              </div>

              <!-- 5. Condition (20 points) -->
              <div class="card mb-4">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-chart-area me-2 text-danger"></i>
                    5. Condition (Kondisi) - Bobot: 20%
                  </h6>
                  <small class="text-muted">Penilaian kondisi ekonomi dan prospek usaha</small>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Kondisi Ekonomi</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.condition.economicCondition"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Kondisi</option>
                          <option value="5">Sangat Mendukung (5)</option>
                          <option value="4">Mendukung (4)</option>
                          <option value="3">Normal (3)</option>
                          <option value="2">Kurang Mendukung (2)</option>
                          <option value="1">Tidak Mendukung (1)</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Prospek Usaha</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.condition.businessProspect"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Prospek</option>
                          <option value="5">Sangat Bagus (5)</option>
                          <option value="4">Bagus (4)</option>
                          <option value="3">Cukup (3)</option>
                          <option value="2">Kurang (2)</option>
                          <option value="1">Buruk (1)</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Tujuan Pinjaman</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.condition.loanPurpose"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Tujuan</option>
                          <option value="5">Produktif - Menghasilkan (5)</option>
                          <option value="4">Semi Produktif (4)</option>
                          <option value="3">Konsumtif Terpadu (3)</option>
                          <option value="2">Konsumtif Biasa (2)</option>
                          <option value="1">Konsumtif Tidak Jelas (1)</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Risiko Sektor</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.condition.sectorRisk"
                          @change="calculateScore"
                        >
                          <option value="">Pilih Risiko</option>
                          <option value="5">Sangat Rendah (5)</option>
                          <option value="4">Rendah (4)</option>
                          <option value="3">Sedang (3)</option>
                          <option value="2">Tinggi (2)</option>
                          <option value="1">Sangat Tinggi (1)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="bg-light p-2 rounded">
                    <strong>Condition Score: {{ verificationForm.condition.score }}/20</strong>
                  </div>
                </div>
              </div>

              <!-- Overall Assessment -->
              <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                  <h6 class="mb-0">
                    <i class="fas fa-award me-2"></i>
                    Penilaian Keseluruhan
                  </h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h4 class="text-center">
                        Total Score:
                        <span
                          :class="{
                            'text-success': verificationForm.overallScore >= 80,
                            'text-warning':
                              verificationForm.overallScore >= 60 &&
                              verificationForm.overallScore < 80,
                            'text-danger': verificationForm.overallScore < 60,
                          }"
                        >
                          {{ verificationForm.overallScore }}/100
                        </span>
                      </h4>

                      <div class="mb-3">
                        <label class="form-label">Rekomendasi</label>
                        <select
                          class="form-select"
                          v-model="verificationForm.recommendation"
                          required
                        >
                          <option value="">Pilih Rekomendasi</option>
                          <option value="APPROVE">SETUJUI</option>
                          <option value="APPROVE_WITH_CONDITIONS">SETUJUI DENGAN SYARAT</option>
                          <option value="REJECT">TOLAK</option>
                        </select>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Catatan Verifikator</label>
                        <textarea
                          class="form-control"
                          rows="4"
                          v-model="verificationForm.verifierNotes"
                          placeholder="Catatan dan alasan rekomendasi..."
                          required
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">
                      <h6>Breakdown Score:</h6>
                      <div class="progress-stacked mb-3" style="height: 30px">
                        <div class="progress" role="progressbar" :style="{ width: '20%' }">
                          <div class="progress-bar bg-primary">
                            Character: {{ verificationForm.character.score }}
                          </div>
                        </div>
                        <div class="progress" role="progressbar" :style="{ width: '25%' }">
                          <div class="progress-bar bg-success">
                            Capacity: {{ verificationForm.capacity.score }}
                          </div>
                        </div>
                        <div class="progress" role="progressbar" :style="{ width: '20%' }">
                          <div class="progress-bar bg-warning">
                            Capital: {{ verificationForm.capital.score }}
                          </div>
                        </div>
                        <div class="progress" role="progressbar" :style="{ width: '15%' }">
                          <div class="progress-bar bg-info">
                            Collateral: {{ verificationForm.collateral.score }}
                          </div>
                        </div>
                        <div class="progress" role="progressbar" :style="{ width: '20%' }">
                          <div class="progress-bar bg-danger">
                            Condition: {{ verificationForm.condition.score }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="resetForm">
                  <i class="fas fa-undo"></i>
                  Reset
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="processing || !verificationForm.recommendation"
                >
                  <span v-if="processing" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ processing ? 'Menyimpan...' : 'Simpan Verifikasi' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
interface LoanApplication {
  id: number
  memberName: string
  memberNumber: string
  loanType: string
  amount: number
  term: number
  submissionDate: string
  verificationStatus: string
  previousLoans?: number
  activeLoan?: number
  delayHistory?: number
  creditRating?: string
}

interface VerificationForm {
  character: {
    paymentHistory: number
    reputation: number
    commitment: number
    notes: string
    score: number
  }
  capacity: {
    monthlyIncome: number
    monthlyExpense: number
    otherObligations: number
    jobStability: number
    score: number
  }
  capital: {
    savingsBalance: number
    otherSavings: number
    assetValue: number
    businessCapital: number
    score: number
  }
  collateral: {
    type: number
    value: number
    condition: number
    score: number
  }
  condition: {
    economicCondition: number
    businessProspect: number
    loanPurpose: number
    sectorRisk: number
    score: number
  }
  overallScore: number
  recommendation: string
  verifierNotes: string
}

export default {
  name: 'CreditVerificationView',
  data() {
    return {
      loading: false,
      processing: false,
      applications: [] as LoanApplication[],
      selectedApplication: null as LoanApplication | null,

      verificationForm: {
        character: {
          paymentHistory: 0,
          reputation: 0,
          commitment: 0,
          notes: '',
          score: 0,
        },
        capacity: {
          monthlyIncome: 0,
          monthlyExpense: 0,
          otherObligations: 0,
          jobStability: 0,
          score: 0,
        },
        capital: {
          savingsBalance: 0,
          otherSavings: 0,
          assetValue: 0,
          businessCapital: 0,
          score: 0,
        },
        collateral: {
          type: 0,
          value: 0,
          condition: 0,
          score: 0,
        },
        condition: {
          economicCondition: 0,
          businessProspect: 0,
          loanPurpose: 0,
          sectorRisk: 0,
          score: 0,
        },
        overallScore: 0,
        recommendation: '',
        verifierNotes: '',
      } as VerificationForm,
    }
  },

  async mounted() {
    await this.refreshApplications()
  },

  methods: {
    async refreshApplications() {
      this.loading = true
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.applications = [
          {
            id: 1,
            memberName: 'Ahmad Subagyo',
            memberNumber: 'A001234',
            loanType: 'Produktif',
            amount: 15000000,
            term: 12,
            submissionDate: '2024-01-15',
            verificationStatus: 'pending',
            previousLoans: 2,
            activeLoan: 5000000,
            delayHistory: 0,
            creditRating: 'A',
          },
          {
            id: 2,
            memberName: 'Siti Nurhaliza',
            memberNumber: 'A001456',
            loanType: 'Konsumsi',
            amount: 25000000,
            term: 24,
            submissionDate: '2024-01-16',
            verificationStatus: 'in_progress',
            previousLoans: 1,
            activeLoan: 0,
            delayHistory: 1,
            creditRating: 'B',
          },
        ]
      } catch (error) {
        console.error('Error loading applications:', error)
        this.$toast?.error('Gagal memuat data aplikasi')
      } finally {
        this.loading = false
      }
    },

    selectApplication(app: LoanApplication) {
      this.selectedApplication = app
      this.resetForm()
      // Load existing verification if any
      this.loadExistingVerification(app.id)
    },

    loadExistingVerification(appId: number) {
      // Mock loading existing verification data
      // In real implementation, this would load from database
      console.log(`Loading verification for application ${appId}`)
    },

    calculateScore() {
      // Calculate Character Score (20 points)
      const charTotal =
        (this.verificationForm.character.paymentHistory || 0) +
        (this.verificationForm.character.reputation || 0) +
        (this.verificationForm.character.commitment || 0)
      this.verificationForm.character.score = Math.round((charTotal / 15) * 20)

      // Calculate Capacity Score (25 points)
      const netIncome =
        (this.verificationForm.capacity.monthlyIncome || 0) -
        (this.verificationForm.capacity.monthlyExpense || 0) -
        (this.verificationForm.capacity.otherObligations || 0)
      let capacityScore = 0
      if (netIncome > 0 && this.selectedApplication) {
        const monthlyPayment =
          (this.selectedApplication.amount * 1.1) / this.selectedApplication.term // Assume 10% interest
        const paymentRatio = monthlyPayment / netIncome
        if (paymentRatio <= 0.3) capacityScore += 15
        else if (paymentRatio <= 0.5) capacityScore += 10
        else if (paymentRatio <= 0.7) capacityScore += 5
      }
      capacityScore += (this.verificationForm.capacity.jobStability || 0) * 2
      this.verificationForm.capacity.score = Math.min(capacityScore, 25)

      // Calculate Capital Score (20 points)
      const totalCapital =
        (this.verificationForm.capital.savingsBalance || 0) +
        (this.verificationForm.capital.otherSavings || 0) +
        (this.verificationForm.capital.assetValue || 0) +
        (this.verificationForm.capital.businessCapital || 0)
      let capitalScore = 0
      if (this.selectedApplication && totalCapital > 0) {
        const capitalRatio = totalCapital / this.selectedApplication.amount
        if (capitalRatio >= 1) capitalScore = 20
        else if (capitalRatio >= 0.5) capitalScore = 15
        else if (capitalRatio >= 0.25) capitalScore = 10
        else capitalScore = 5
      }
      this.verificationForm.capital.score = capitalScore

      // Calculate Collateral Score (15 points)
      const collateralBase =
        (this.verificationForm.collateral.type || 0) +
        (this.verificationForm.collateral.condition || 0)
      this.verificationForm.collateral.score = Math.round((collateralBase / 10) * 15)

      // Calculate Condition Score (20 points)
      const conditionTotal =
        (this.verificationForm.condition.economicCondition || 0) +
        (this.verificationForm.condition.businessProspect || 0) +
        (this.verificationForm.condition.loanPurpose || 0) +
        (this.verificationForm.condition.sectorRisk || 0)
      this.verificationForm.condition.score = Math.round((conditionTotal / 20) * 20)

      // Calculate Overall Score
      this.verificationForm.overallScore =
        this.verificationForm.character.score +
        this.verificationForm.capacity.score +
        this.verificationForm.capital.score +
        this.verificationForm.collateral.score +
        this.verificationForm.condition.score
    },

    calculateDTI(): number {
      const income = this.verificationForm.capacity.monthlyIncome || 0
      const totalDebt = this.verificationForm.capacity.otherObligations || 0
      if (income === 0) return 0
      return Math.round((totalDebt / income) * 100)
    },

    calculateCollateralRatio(): number {
      if (!this.selectedApplication || this.verificationForm.collateral.value === 0) return 0
      return Math.round(
        (this.verificationForm.collateral.value / this.selectedApplication.amount) * 100,
      )
    },

    async saveVerification() {
      if (!this.selectedApplication) return

      this.processing = true
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Update application status
        this.selectedApplication.verificationStatus = 'completed'

        this.$toast?.success('Verifikasi berhasil disimpan')

        // Reset form after successful save
        this.resetForm()
        this.selectedApplication = null
        await this.refreshApplications()
      } catch (error) {
        console.error('Error saving verification:', error)
        this.$toast?.error('Gagal menyimpan verifikasi')
      } finally {
        this.processing = false
      }
    },

    resetForm() {
      this.verificationForm = {
        character: {
          paymentHistory: 0,
          reputation: 0,
          commitment: 0,
          notes: '',
          score: 0,
        },
        capacity: {
          monthlyIncome: 0,
          monthlyExpense: 0,
          otherObligations: 0,
          jobStability: 0,
          score: 0,
        },
        capital: {
          savingsBalance: 0,
          otherSavings: 0,
          assetValue: 0,
          businessCapital: 0,
          score: 0,
        },
        collateral: {
          type: 0,
          value: 0,
          condition: 0,
          score: 0,
        },
        condition: {
          economicCondition: 0,
          businessProspect: 0,
          loanPurpose: 0,
          sectorRisk: 0,
          score: 0,
        },
        overallScore: 0,
        recommendation: '',
        verifierNotes: '',
      }
    },

    exportVerificationReport() {
      if (!this.selectedApplication) return
      this.$toast?.info('Exporting verification report...')
    },

    // Utility methods
    getStatusBadgeClass(status: string): string {
      const classes = {
        pending: 'bg-warning',
        in_progress: 'bg-info',
        completed: 'bg-success',
        rejected: 'bg-danger',
      }
      return classes[status as keyof typeof classes] || 'bg-secondary'
    },

    getStatusText(status: string): string {
      const texts = {
        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
        rejected: 'Rejected',
      }
      return texts[status as keyof typeof texts] || status
    },

    getOverallScoreBadgeClass(score: number): string {
      if (score >= 80) return 'bg-success'
      if (score >= 60) return 'bg-warning'
      return 'bg-danger'
    },

    getRecommendationBadgeClass(recommendation: string): string {
      const classes = {
        APPROVE: 'bg-success',
        APPROVE_WITH_CONDITIONS: 'bg-warning',
        REJECT: 'bg-danger',
      }
      return classes[recommendation as keyof typeof classes] || 'bg-secondary'
    },

    getCreditRatingBadge(rating: string): string {
      const classes = {
        A: 'bg-success',
        B: 'bg-primary',
        C: 'bg-warning',
        D: 'bg-danger',
      }
      return classes[rating as keyof typeof classes] || 'bg-secondary'
    },

    formatDate(dateString: string): string {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },

    formatCurrency(amount: number): string {
      if (!amount && amount !== 0) return '0'
      return new Intl.NumberFormat('id-ID').format(amount)
    },
  },
}
</script>

<style scoped>
.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.progress-stacked {
  display: flex;
}

.progress-stacked .progress {
  overflow: visible;
}

.badge {
  font-size: 0.75em;
}

.text-success {
  color: #198754 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.table-sm td {
  padding: 0.25rem 0.5rem;
}

/* Custom progress styling */
.progress {
  border-radius: 0.375rem;
}

.progress-bar {
  font-size: 0.75rem;
  font-weight: 600;
}
</style>

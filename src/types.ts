// Types for the Koperasi Simpan Pinjam Application

// User and authentication types
export type UserRole = 'anggota' | 'pengurus' | 'pengawas'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  name: string
  createdAt: string
  updatedAt: string
}

// Anggota (Member) types
export interface Anggota {
  id: string
  userId: string
  nomorAnggota: string
  nik: string
  name: string
  alamat: string
  telepon: string
  email: string
  tanggalBergabung: string
  statusAktif: boolean
  fotoProfil?: string
  createdAt: string
  updatedAt: string
}

// Simpanan (Savings) types
export type SimpananType = 'pokok' | 'wajib' | 'sukarela'

export interface Simpanan {
  id: string
  anggotaId: string
  jenis: SimpananType
  jumlah: number
  tanggal: string
  keterangan?: string
  createdAt: string
  updatedAt: string
}

export interface SimpananSummary {
  pokok: number
  wajib: number
  sukarela: number
  total: number
}

// Pinjaman (Loan) types
export type PinjamanStatus =
  | 'antrean'
  | 'verifikasi'
  | 'disetujui'
  | 'ditolak'
  | 'pencairan'
  | 'aktif'
  | 'lunas'

export interface Pinjaman {
  id: string
  anggotaId: string
  jumlah: number
  tenor: number // in months
  bunga: number // in percentage
  tujuan: string
  dokumenPendukung?: string[] // file paths
  arrivalTime: string // ISO date string
  startProcessTime?: string
  finishProcessTime?: string
  statusPinjaman: PinjamanStatus
  posisiAntrean?: number
  burstTime?: number // estimated processing time in minutes
  waitingTime?: number // in minutes
  catatan?: string
  createdAt: string
  updatedAt: string
}

export interface Angsuran {
  id: string
  pinjamanId: string
  anggotaId: string
  jumlahPokok: number
  jumlahBunga: number
  totalBayar: number
  tanggalJatuhTempo: string
  tanggalBayar?: string
  buktiPembayaran?: string
  status: 'belum' | 'lunas' | 'terlambat'
  createdAt: string
  updatedAt: string
}

// SHU (Sisa Hasil Usaha) types
export interface ShuAnggota {
  id: string
  anggotaId: string
  tahun: number
  jasaSimpanan: number
  jasaPinjaman: number
  totalShu: number
  persentase: number
  createdAt: string
  updatedAt: string
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  type?: 'info' | 'warning' | 'success' | 'error'
  link?: string
  created_at: string
  updated_at?: string
}

// FCFS Simulator types (initial simulation feature)
export type Urgency = 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi'

export interface LoanApplication {
  id: string
  pemohon: string
  jumlahPinjaman: number // in Rupiah
  arrivalTime: number // minutes from start of day or epoch-based minutes in UI
  burstTime: number // processing time in minutes (verifikasi + analisis + keputusan)
  urgency?: Urgency
}

export interface ScheduledItem extends LoanApplication {
  startTime: number
  finishTime: number
  waitingTime: number
  turnaroundTime: number
}

export interface FcfsResult {
  schedule: ScheduledItem[]
  averageWaitingTime: number
  averageTurnaroundTime: number
}

// Dashboard Analytics types
export interface KpiSummary {
  totalAnggota: number
  anggotaAktif: number
  totalAset: number
  totalPinjaman: number
  totalSimpanan: number
  nplRatio: number
}

export interface AntreanStats {
  totalAntrean: number
  averageWaitingTime: number // in minutes
  longestWaitingTime: number // in minutes
  processedToday: number
}

// Verification Dashboard types
export interface VerificationStatistics {
  overall: {
    total_processed: number
    approval_rate: number
    rejection_rate: number
    average_processing_time: number
  }
  document_stats: {
    total_count: number
    approved_count: number
    rejected_count: number
    pending_count: number
  }
  document_types: DocumentTypeStats[]
  processing_time_trend: {
    labels: string[]
    values: number[]
  }
  officer_performance: OfficerPerformance[]
}

export interface DocumentTypeStats {
  name: string
  approval_rate: number
  count: number
}

export interface OfficerPerformance {
  officer_name: string
  processed_count: number
  approved_count: number
  rejected_count: number
  average_processing_time: number
}

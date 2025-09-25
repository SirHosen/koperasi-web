// Declaration file for anggota store module
declare module '@/stores/modules/anggota' {
  interface SimpananSummary {
    pokok: number
    wajib: number
    sukarela: number
    total: number
  }

  interface AnggotaProfile {
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
  }

  interface Pinjaman {
    id: string
    anggotaId: string
    jumlah: number
    tenor: number
    bunga: number
    tujuan: string
    arrivalTime: string
    statusPinjaman: string
    posisiAntrean?: number
    createdAt: string
    updatedAt: string
  }

  interface MemberQueueStatus {
    posisiAntrean: number
    estimasiWaktu: string
    statusPinjaman: string
    totalAntrean: number
  }

  export function useAnggotaStore(): {
    profile: AnggotaProfile | null
    isLoading: boolean
    error: string | null
    simpananSummary: SimpananSummary | null
    pinjamanActive: Pinjaman[]
    pinjamanHistory: Pinjaman[]
    hasActiveLoan: boolean
    totalSimpanan: number
    activeAnggota: boolean
    getProfile: () => Promise<AnggotaProfile>
    getSimpananSummary: () => Promise<SimpananSummary>
    getActivePinjaman: () => Promise<Pinjaman[]>
    getPinjamanHistory: () => Promise<Pinjaman[]>
    getQueueStatus: () => Promise<MemberQueueStatus>
    clearError: () => void
  }
}

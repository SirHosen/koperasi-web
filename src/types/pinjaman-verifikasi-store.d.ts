// Declaration file for pinjaman verifikasi store module
declare module '@/stores/modules/pinjamanVerifikasi' {
  interface DocumentItem {
    id: string
    jenisDokumen: string
    namaFile: string
    pathFile: string
    status: 'menunggu' | 'diterima' | 'ditolak'
    catatan?: string
  }

  interface VerifikasiLoan {
    id: string
    anggota_id: string
    jumlah: number
    tenor: number
    bunga: number
    tujuan: string
    dokumenPendukung: DocumentItem[]
    status_pinjaman: string
    arrival_time: string
    name: string
    nomor_anggota: string
    created_at: string
    updated_at: string
  }

  export function usePinjamanVerifikasiStore(): {
    verifikasiList: VerifikasiLoan[]
    currentVerifikasi: VerifikasiLoan | null
    isLoading: boolean
    error: string | null
    getVerifikasiList: () => Promise<{ loans: VerifikasiLoan[] }>
    getLoanDetails: (id: string) => Promise<{ loan: VerifikasiLoan }>
    verifyDocument: (
      loanId: string,
      docId: string,
      status: 'diterima' | 'ditolak',
      notes?: string,
    ) => Promise<{ success: boolean }>
    completeLoanVerification: (
      loanId: string,
      isApproved: boolean,
      notes?: string,
    ) => Promise<{ success: boolean }>
    clearError: () => void
  }
}

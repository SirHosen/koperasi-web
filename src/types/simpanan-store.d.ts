// Declaration file for simpanan store module
declare module '@/stores/modules/simpanan' {
  interface SimpananSummary {
    pokok: number
    wajib: number
    sukarela: number
    total: number
  }

  interface RiwayatSimpanan {
    id: string | number
    user_id: string | number
    jenis: 'pokok' | 'wajib' | 'sukarela'
    jumlah: number
    status: 'pending' | 'disetujui' | 'ditolak' | 'menunggu' | 'diverifikasi'
    tanggal: string
    keterangan?: string
    created_at: string
    updated_at: string
  }

  interface SimpananResponse {
    success: boolean
    data: SimpananSummary
    message: string
  }

  interface RiwayatSimpananResponse {
    success: boolean
    data: {
      simpanan: RiwayatSimpanan[]
      totalItems: number
      totalPages: number
      currentPage: number
    }
    message: string
  }

  interface SetorSimpananData {
    jumlah: number
    bukti_transfer?: File
    keterangan?: string
  }

  interface TarikSimpananData {
    jumlah: number
    keterangan?: string
  }

  interface SimpananParams {
    page?: number
    limit?: number
    jenis?: string
    startDate?: string | null
    endDate?: string | null
  }

  interface FormattedSimpanan {
    pokok: string
    wajib: string
    sukarela: string
    total: string
  }

  interface DateRange {
    start: string | null
    end: string | null
  }

  export function useSimpananStore(): {
    // State
    simpanan: SimpananSummary
    riwayatSimpanan: RiwayatSimpanan[]
    isLoading: boolean
    error: string | null
    successMessage: string
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
    filterType: string
    dateRange: DateRange

    // Getters
    formattedSimpanan: FormattedSimpanan
    availableBalance: number

    // Actions
    fetchSimpananSummary: () => Promise<void>
    fetchRiwayatSimpanan: () => Promise<void>
    setorSimpananSukarela: (data: SetorSimpananData) => Promise<boolean>
    tarikSimpananSukarela: (data: TarikSimpananData) => Promise<boolean>
    exportSimpanan: (format: 'pdf' | 'excel') => Promise<boolean>
    setFilter: (filterType: string) => void
    setDateRange: (startDate: string | null, endDate: string | null) => void
    setPage: (page: number) => void
    clearMessages: () => void
  }
}

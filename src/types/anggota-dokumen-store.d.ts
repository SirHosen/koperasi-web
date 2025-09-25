// Declaration file for anggota document tracking store
declare module '@/stores/modules/anggotaDokumen' {
  interface DocumentItem {
    id: string
    jenis_dokumen: string
    nama_file: string
    status: 'menunggu' | 'diterima' | 'ditolak'
    catatan?: string
    uploaded_at: string
    updated_at?: string
  }

  interface LoanDocuments {
    id: string
    jumlah: number
    tenor: number
    bunga: number
    tujuan: string
    status_pinjaman: string
    created_at: string
    total_documents: number
    accepted_documents: number
    rejected_documents: number
    pending_documents: number
    documents: DocumentItem[]
  }

  export function useAnggotaDokumenStore(): {
    loanDocuments: LoanDocuments[]
    currentLoanDocuments: LoanDocuments | null
    isLoading: boolean
    error: string | null
    documentProgress: number
    pendingDocumentLoans: LoanDocuments[]
    rejectedDocumentLoans: LoanDocuments[]
    loadDocuments: () => Promise<{ loans: LoanDocuments[] }>
    setCurrentLoan: (loanId: string) => LoanDocuments | null
    clearCurrentLoan: () => void
    clearError: () => void
  }
}

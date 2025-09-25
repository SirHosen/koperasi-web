// Declaration file for fcfs store module
declare module '@/stores/modules/fcfs' {
  interface QueueItem {
    id: string;
    anggota_id: string;
    jumlah: number;
    tenor: number;
    bunga: number;
    tujuan: string;
    arrival_time: string;
    status_pinjaman: string;
    posisi_antrean: number;
    burst_time: number;
    waiting_time?: number;
    name: string;
    nomor_anggota: string;
    start_process_time?: string;
    finish_process_time?: string;
    catatan?: string;
  }

  interface QueueStats {
    total_antrean: number;
    avg_processing_time: number;
    max_processing_time: number;
    arrived_today: number;
    processed_today: number;
  }

  export function useFcfsStore(): {
    queue: QueueItem[];
    queueStats: QueueStats | null;
    currentProcessing: QueueItem | null;
    isLoading: boolean;
    error: string | null;
    processedItems: QueueItem[];
    refreshInterval: ReturnType<typeof setInterval> | null;
    queueLength: number;
    averageWaitingTime: number;
    totalProcessed: number;
    getQueueStatus: () => Promise<{ queue: QueueItem[]; stats: QueueStats }>;
    getProcessedItems: () => Promise<QueueItem[]>;
    processNext: () => Promise<{ loanId: string }>;
    getMemberStatus: (anggotaId: string) => Promise<{ loanStatus: QueueItem; queueStats: QueueStats }>;
    submitLoan: (loanData: { anggotaId: string; jumlah: number; tenor: number; tujuan: string }) => Promise<{
      loanId: string;
      posisiAntrean: number;
      burstTime: number;
      estimatedWaitingTime: number;
    }>;
    approveLoan: (loanId: string, notes?: string) => Promise<{ success: boolean }>;
    rejectLoan: (loanId: string, notes?: string) => Promise<{ success: boolean }>;
    skipLoan: (loanId: string, notes?: string) => Promise<{ success: boolean }>;
    startAutoRefresh: (intervalSeconds?: number) => void;
    stopAutoRefresh: () => void;
    clearError: () => void;
  };
}
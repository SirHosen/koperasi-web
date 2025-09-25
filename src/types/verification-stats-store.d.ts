// Declaration file for verification statistics store
declare module '@/stores/modules/verificationStats' {
  interface VerificationStats {
    overall: {
      total_loans: number
      pending_verification: number
      approved: number
      rejected: number
      avg_processing_time_minutes: number
    }
    document_stats: {
      total_count: number
      approved_count: number
      rejected_count: number
      pending_count: number
    }
    document_types: Array<{
      name: string
      total_count: number
      approved_count: number
      approval_rate: number
    }>
    processing_time_trend: {
      labels: string[]
      values: number[]
    }
    officers: Array<{
      officer_name: string
      total_processed: number
      approved: number
      rejected: number
      avg_processing_minutes: number
    }>
  }

  interface ChartDataset {
    label: string
    data: number[]
    backgroundColor: string | string[]
    borderColor: string | string[]
    borderWidth: number
    fill?: boolean
    tension?: number
  }

  interface ChartData {
    labels: string[]
    datasets: ChartDataset[]
  }

  export function useVerificationStatsStore(): {
    statistics: VerificationStats | null
    overall: {
      total_loans: number
      pending_verification: number
      approved: number
      rejected: number
      avg_processing_time_minutes: number
    }
    document_stats: {
      total_count: number
      approved_count: number
      rejected_count: number
      pending_count: number
    }
    document_types: Array<{
      name: string
      total_count: number
      approved_count: number
      approval_rate: number
    }>
    processing_time_trend: {
      labels: string[]
      values: number[]
    }
    officers: Array<{
      officer_name: string
      total_processed: number
      approved: number
      rejected: number
      avg_processing_minutes: number
    }>
    isLoading: boolean
    error: string | null
    successRate: number
    documentVerificationRate: number
    formattedProcessingTime: string
    processingTimeChartData: ChartData
    documentTypeChartData: ChartData
    documentStatusChartData: ChartData
    topOfficers: Array<{
      officer_name: string
      total_processed: number
      approved: number
      rejected: number
      avg_processing_minutes: number
    }>
    loadStatistics: (forceRefresh?: boolean) => Promise<{ status: string; data: VerificationStats }>
  }
}

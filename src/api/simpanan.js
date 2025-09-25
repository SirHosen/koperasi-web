import axios from 'axios'

export const simpananApi = {
  // Get summary of all savings types for current member
  getSimpananSummary() {
    return axios.get('/api/simpanan/summary')
  },

  // Get savings history with filters and pagination
  getRiwayatSimpanan(params) {
    return axios.get('/api/simpanan/riwayat', { params })
  },

  // Submit sukarela (voluntary) savings
  setorSimpananSukarela(data) {
    return axios.post('/api/simpanan/setor/sukarela', data)
  },

  // Request withdrawal of sukarela (voluntary) savings
  tarikSimpananSukarela(data) {
    return axios.post('/api/simpanan/tarik/sukarela', data)
  },

  // For admin - verify savings transaction
  verifikasiSimpanan(simpananId, data) {
    return axios.put(`/api/simpanan/${simpananId}/verifikasi`, data)
  },

  // For admin - get pending savings transactions
  getPendingSimpanan(params) {
    return axios.get('/api/simpanan/pending', { params })
  },

  // Export report to PDF or Excel
  exportSimpananReport(format, params) {
    return axios.get(`/api/simpanan/export/${format}`, {
      params,
      responseType: 'blob',
    })
  },
}

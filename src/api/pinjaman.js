// FCFS & Pinjaman API Client

import axios from 'axios';
import { useAuthStore } from '@/stores/modules/auth';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Set auth token for all requests
const setAuthHeader = () => {
  const authStore = useAuthStore();
  if (authStore.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
  }
};

// FCFS Queue API
export const fcfsApi = {
  // Get current FCFS queue status
  getQueueStatus: async () => {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/fcfs/queue`);
    return response.data;
  },
  
  // Get specific loan application details
  getLoanApplication: async (id) => {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/fcfs/queue/${id}`);
    return response.data;
  },
  
  // Process the next loan in queue (for pengurus)
  processNext: async () => {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/fcfs/process-next`);
    return response.data;
  },
  
  // Get member's loan status
  getMemberStatus: async (anggotaId) => {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/fcfs/status/${anggotaId}`);
    return response.data;
  },
  
  // Approve a loan
  approveLoan: async (loanId, notes = '') => {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/fcfs/approve/${loanId}`, { notes });
    return response.data;
  },
  
  // Reject a loan
  rejectLoan: async (loanId, notes = '') => {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/fcfs/reject/${loanId}`, { notes });
    return response.data;
  },
  
  // Skip a loan (put back in queue)
  skipLoan: async (loanId, notes = '') => {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/fcfs/skip/${loanId}`, { notes });
    return response.data;
  },
  
  // Get processed items
  getProcessedItems: async () => {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/fcfs/processed`);
    return response.data;
  }
};

// Pinjaman (Loans) API
export const pinjamanApi = {
  // Get loans in verification status
  getVerifikasiList: async () => {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/pinjaman/verification`);
    return response.data;
  },
  
  // Verify a document
  verifyDocument: async (loanId, docId, status, notes = '') => {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/pinjaman/${loanId}/verify-document/${docId}`, {
      status,
      notes
    });
    return response.data;
  },
  
  // Complete loan verification
  completeLoanVerification: async (loanId, isApproved, notes = '') => {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/pinjaman/${loanId}/complete-verification`, {
      isApproved,
      notes
    });
    return response.data;
  },
  
  // Submit a new loan application
  submitApplication: async (loanData) => {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/fcfs/submit`, loanData);
    return response.data;
  },
  
  // Upload supporting documents
  uploadDocuments: async (loanId, formData) => {
    setAuthHeader();
    const response = await axios.post(`${API_URL}/pinjaman/${loanId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Update loan status (approve, reject, etc.)
  updateStatus: async (loanId, statusData) => {
    setAuthHeader();
    const response = await axios.put(`${API_URL}/pinjaman/${loanId}/status`, statusData);
    return response.data;
  },
  
  // Get loan verification details
  getVerificationDetails: async (loanId) => {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/pinjaman/${loanId}/verification`);
    return response.data;
  },
  
  // Get list of loans in verification status (for pengurus)
  getLoansForVerification: async () => {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/pinjaman/verification`);
    return response.data;
  },
  
  // Get a member's active loans
  getMemberActiveLoans: async (anggotaId) => {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/pinjaman/member/${anggotaId}/active`);
    return response.data;
  },
  
  // Get a member's loan history
  getMemberLoanHistory: async (anggotaId) => {
    setAuthHeader();
    const response = await axios.get(`${API_URL}/pinjaman/member/${anggotaId}/history`);
    return response.data;
  }
};
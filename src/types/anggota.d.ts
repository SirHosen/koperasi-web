// Type definitions for AnggotaManagementView
// Create this file in src/types/anggota.d.ts

export interface Member {
  id: string
  nomor_anggota: string
  name: string
  username: string
  email: string
  nik: string
  telepon: string
  alamat: string
  tanggal_bergabung: string
  total_simpanan: number
  pinjaman_aktif: number
  status_aktif: boolean
}

export interface MemberForm {
  name: string
  email: string
  username: string
  password: string
  nik: string
  alamat: string
  telepon: string
  status_aktif: boolean
  tanggal_bergabung: string
  simpanan_pokok?: number
}

export interface FormErrors {
  name?: string
  email?: string
  username?: string
  password?: string
  nik?: string
  alamat?: string
  telepon?: string
  [key: string]: string | undefined
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface Filters {
  search: string
  status: string
  sortBy: string
  sortOrder: string
  limit: number
}

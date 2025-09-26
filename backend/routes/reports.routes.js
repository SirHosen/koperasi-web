import express from 'express'
import { pool } from '../db.js'
import { authenticateJWT, checkRole } from '../middleware/auth.middleware.js'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import logger from '../utils/logger.js'
import { successResponse, errorResponse } from '../utils/response.js'

const router = express.Router()

// Generate comprehensive financial report (Laporan Keuangan)
router.get('/financial', authenticateJWT, checkRole(['pengurus', 'pengawas']), async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query
    const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
    const end = endDate || new Date().toISOString().split('T')[0]

    logger.info('Generating financial report', {
      startDate: start,
      endDate: end,
      format,
      userId: req.user?.id,
    })

    // Get all financial data in parallel for better performance
    const [_simpananData, pinjamanData, modalData, biayaOperasional, pendapatanBunga] =
      await Promise.all([
        // Total Simpanan (Assets)
        pool.execute(
          `
        SELECT
          jenis,
          SUM(jumlah) as total,
          COUNT(*) as jumlah_transaksi
        FROM simpanan
        WHERE tanggal BETWEEN ? AND ? AND status = 'diverifikasi'
        GROUP BY jenis
      `,
          [start, end],
        ),

        // Pinjaman (Liabilities & Income)
        pool.execute(
          `
        SELECT
          COUNT(*) as total_pinjaman,
          SUM(CASE WHEN status_pinjaman = 'aktif' THEN jumlah ELSE 0 END) as pinjaman_aktif,
          SUM(CASE WHEN status_pinjaman = 'lunas' THEN jumlah ELSE 0 END) as pinjaman_lunas,
          AVG(bunga) as rata_rata_bunga
        FROM pinjaman
        WHERE arrival_time BETWEEN ? AND ?
      `,
          [start, end],
        ),

        // Modal Koperasi
        pool.execute(
          `
        SELECT
          SUM(CASE WHEN jenis = 'pokok' THEN jumlah ELSE 0 END) as modal_pokok,
          SUM(CASE WHEN jenis = 'wajib' THEN jumlah ELSE 0 END) as modal_wajib,
          SUM(CASE WHEN jenis = 'sukarela' THEN jumlah ELSE 0 END) as modal_sukarela
        FROM simpanan
        WHERE tanggal BETWEEN ? AND ? AND status = 'diverifikasi'
      `,
          [start, end],
        ),

        // Simulasi Biaya Operasional (dummy data untuk demo)
        Promise.resolve([
          [
            {
              biaya_admin: 500000,
              biaya_operasional: 1200000,
              biaya_promosi: 300000,
              total_biaya: 2000000,
            },
          ],
        ]),

        // Pendapatan Bunga
        pool.execute(
          `
        SELECT
          SUM(jumlah * bunga / 100) as estimasi_pendapatan_bunga
        FROM pinjaman
        WHERE status_pinjaman IN ('aktif', 'lunas')
        AND arrival_time BETWEEN ? AND ?
      `,
          [start, end],
        ),
      ])

    // Process data
    const pinjaman = pinjamanData[0][0]
    const modal = modalData[0][0]
    const biaya = biayaOperasional[0][0]
    const pendapatan = pendapatanBunga[0][0]

    // Calculate financial metrics
    const totalAset =
      (modal.modal_pokok || 0) + (modal.modal_wajib || 0) + (modal.modal_sukarela || 0)
    const totalKewajiban = pinjaman.pinjaman_aktif || 0
    const totalModal = totalAset - totalKewajiban
    const pendapatanBersih = (pendapatan.estimasi_pendapatan_bunga || 0) - (biaya.total_biaya || 0)

    const reportData = {
      metadata: {
        periode: {
          mulai: start,
          selesai: end,
        },
        tanggal_generate: new Date().toISOString(),
        generated_by: req.user?.username || 'System',
      },
      neraca: {
        aset: {
          kas_bank: totalAset * 0.3, // Simulasi 30% kas
          pinjaman_anggota: pinjaman.pinjaman_aktif || 0,
          investasi: totalAset * 0.1, // Simulasi 10% investasi
          total_aset: totalAset + (pinjaman.pinjaman_aktif || 0),
        },
        kewajiban: {
          simpanan_anggota: totalAset,
          kewajiban_lain: totalAset * 0.05, // Simulasi 5% kewajiban lain
          total_kewajiban: totalAset * 1.05,
        },
        modal: {
          modal_disetor: totalModal,
          cadangan: totalModal * 0.2, // Simulasi 20% cadangan
          shu_belum_dibagi: pendapatanBersih * 0.3,
          total_modal: totalModal + totalModal * 0.2 + pendapatanBersih * 0.3,
        },
      },
      laba_rugi: {
        pendapatan: {
          bunga_pinjaman: pendapatan.estimasi_pendapatan_bunga || 0,
          provisi_administrasi: (pinjaman.total_pinjaman || 0) * 0.005, // 0.5% dari total pinjaman
          pendapatan_lain: 100000, // Simulasi
          total_pendapatan:
            (pendapatan.estimasi_pendapatan_bunga || 0) +
            (pinjaman.total_pinjaman || 0) * 0.005 +
            100000,
        },
        beban: {
          beban_bunga_simpanan: totalAset * 0.02, // Simulasi 2% per tahun
          beban_operasional: biaya.total_biaya || 0,
          beban_penyisihan: (pinjaman.pinjaman_aktif || 0) * 0.01, // 1% penyisihan
          total_beban:
            totalAset * 0.02 + (biaya.total_biaya || 0) + (pinjaman.pinjaman_aktif || 0) * 0.01,
        },
        shu_sebelum_pajak: 0,
        pajak: 0,
        shu_setelah_pajak: 0,
      },
      statistik: {
        jumlah_anggota_aktif: 0,
        pertumbuhan_simpanan: 0,
        rasio_kredit: (totalKewajiban / (totalAset || 1)) * 100,
        tingkat_kolektibilitas: 95.5, // Simulasi
      },
    }

    // Calculate SHU
    reportData.laba_rugi.shu_sebelum_pajak =
      reportData.laba_rugi.pendapatan.total_pendapatan - reportData.laba_rugi.beban.total_beban
    reportData.laba_rugi.pajak = Math.max(0, reportData.laba_rugi.shu_sebelum_pajak * 0.1) // Simulasi pajak 10%
    reportData.laba_rugi.shu_setelah_pajak =
      reportData.laba_rugi.shu_sebelum_pajak - reportData.laba_rugi.pajak

    // Get member statistics
    const [memberStats] = await pool.execute(`
      SELECT
        COUNT(*) as total_anggota,
        COUNT(CASE WHEN status_aktif = 1 THEN 1 END) as anggota_aktif
      FROM anggota
    `)
    reportData.statistik.jumlah_anggota_aktif = memberStats[0].anggota_aktif

    // Export based on format
    if (format === 'excel') {
      return await generateFinancialExcel(res, reportData)
    } else if (format === 'pdf') {
      return await generateFinancialPDF(res, reportData)
    }

    successResponse(res, reportData, 'Laporan keuangan berhasil digenerate')
  } catch (error) {
    logger.error('Error generating financial report:', error)
    errorResponse(res, 'Gagal generate laporan keuangan', 500)
  }
})

// Generate membership report (Laporan Keanggotaan)
router.get(
  '/membership',
  authenticateJWT,
  checkRole(['pengurus', 'pengawas']),
  async (req, res) => {
    try {
      const { year, format = 'json' } = req.query
      const currentYear = year || new Date().getFullYear()

      logger.info('Generating membership report', {
        year: currentYear,
        format,
        userId: req.user?.id,
      })

      const [membershipData] = await pool.execute(
        `
      SELECT
        COUNT(*) as total_anggota,
        COUNT(CASE WHEN status_aktif = 1 THEN 1 END) as anggota_aktif,
        COUNT(CASE WHEN status_aktif = 0 THEN 1 END) as anggota_nonaktif,
        COUNT(CASE WHEN YEAR(tanggal_bergabung) = ? THEN 1 END) as anggota_baru_tahun_ini,
        AVG(CASE WHEN status_aktif = 1 THEN simpanan_pokok ELSE NULL END) as rata_rata_simpanan_pokok
      FROM anggota
    `,
        [currentYear],
      )

      const [monthlyGrowth] = await pool.execute(
        `
      SELECT
        MONTH(tanggal_bergabung) as bulan,
        COUNT(*) as jumlah_anggota_baru
      FROM anggota
      WHERE YEAR(tanggal_bergabung) = ?
      GROUP BY MONTH(tanggal_bergabung)
      ORDER BY bulan
    `,
        [currentYear],
      )

      const [simpananStats] = await pool.execute(`
      SELECT
        a.id,
        a.name,
        a.nomor_anggota,
        a.tanggal_bergabung,
        a.status_aktif,
        COALESCE(SUM(s.jumlah), 0) as total_simpanan,
        COUNT(s.id) as jumlah_transaksi_simpanan
      FROM anggota a
      LEFT JOIN simpanan s ON a.id = s.anggota_id AND s.status = 'diverifikasi'
      GROUP BY a.id
      ORDER BY total_simpanan DESC
    `)

      const reportData = {
        metadata: {
          tahun: currentYear,
          tanggal_generate: new Date().toISOString(),
          generated_by: req.user?.username || 'System',
        },
        ringkasan: membershipData[0],
        pertumbuhan_bulanan: monthlyGrowth[0],
        detail_anggota: simpananStats[0],
        statistik: {
          tingkat_partisipasi: (
            (membershipData[0].anggota_aktif / membershipData[0].total_anggota) *
            100
          ).toFixed(2),
          rata_rata_simpanan:
            simpananStats[0].reduce((sum, member) => sum + member.total_simpanan, 0) /
            simpananStats[0].length,
          anggota_terbesar: simpananStats[0].slice(0, 10), // Top 10
        },
      }

      if (format === 'excel') {
        return await generateMembershipExcel(res, reportData)
      } else if (format === 'pdf') {
        return await generateMembershipPDF(res, reportData)
      }

      successResponse(res, reportData, 'Laporan keanggotaan berhasil digenerate')
    } catch (error) {
      logger.error('Error generating membership report:', error)
      errorResponse(res, 'Gagal generate laporan keanggotaan', 500)
    }
  },
)

// Generate loan report (Laporan Pinjaman)
router.get('/loans', authenticateJWT, checkRole(['pengurus', 'pengawas']), async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query
    const start = startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
    const end = endDate || new Date().toISOString().split('T')[0]

    logger.info('Generating loan report', {
      startDate: start,
      endDate: end,
      format,
      userId: req.user?.id,
    })

    const [loanSummary] = await pool.execute(
      `
      SELECT
        status_pinjaman,
        COUNT(*) as jumlah,
        SUM(jumlah) as total_nominal,
        AVG(jumlah) as rata_rata_nominal,
        AVG(bunga) as rata_rata_bunga,
        AVG(tenor) as rata_rata_tenor
      FROM pinjaman
      WHERE arrival_time BETWEEN ? AND ?
      GROUP BY status_pinjaman
    `,
      [start, end],
    )

    const [loanDetails] = await pool.execute(
      `
      SELECT
        p.id,
        a.name as nama_anggota,
        a.nomor_anggota,
        p.jumlah,
        p.tenor,
        p.bunga,
        p.tujuan,
        p.status_pinjaman,
        p.arrival_time,
        p.start_process_time,
        p.finish_process_time,
        DATEDIFF(COALESCE(p.finish_process_time, NOW()), p.arrival_time) as durasi_proses
      FROM pinjaman p
      JOIN anggota a ON p.anggota_id = a.id
      WHERE p.arrival_time BETWEEN ? AND ?
      ORDER BY p.arrival_time DESC
    `,
      [start, end],
    )

    const [monthlyTrend] = await pool.execute(
      `
      SELECT
        YEAR(arrival_time) as tahun,
        MONTH(arrival_time) as bulan,
        COUNT(*) as jumlah_pengajuan,
        SUM(jumlah) as total_nominal,
        COUNT(CASE WHEN status_pinjaman = 'disetujui' THEN 1 END) as disetujui,
        COUNT(CASE WHEN status_pinjaman = 'ditolak' THEN 1 END) as ditolak
      FROM pinjaman
      WHERE arrival_time BETWEEN ? AND ?
      GROUP BY YEAR(arrival_time), MONTH(arrival_time)
      ORDER BY tahun, bulan
    `,
      [start, end],
    )

    const totalPinjaman = loanSummary[0].reduce((sum, item) => sum + item.total_nominal, 0)
    const totalPengajuan = loanSummary[0].reduce((sum, item) => sum + item.jumlah, 0)

    const reportData = {
      metadata: {
        periode: { mulai: start, selesai: end },
        tanggal_generate: new Date().toISOString(),
        generated_by: req.user?.username || 'System',
      },
      ringkasan: {
        total_pengajuan: totalPengajuan,
        total_nominal: totalPinjaman,
        rata_rata_nominal: totalPinjaman / (totalPengajuan || 1),
        breakdown_status: loanSummary[0],
      },
      tren_bulanan: monthlyTrend[0],
      detail_pinjaman: loanDetails[0],
      analisis: {
        tingkat_persetujuan:
          ((loanSummary[0].find((s) => s.status_pinjaman === 'disetujui')?.jumlah || 0) /
            totalPengajuan) *
          100,
        rata_rata_proses:
          loanDetails[0].reduce((sum, loan) => sum + (loan.durasi_proses || 0), 0) /
          loanDetails[0].length,
        pinjaman_terbesar: Math.max(...loanDetails[0].map((loan) => loan.jumlah)),
        bunga_tertinggi: Math.max(...loanDetails[0].map((loan) => loan.bunga)),
      },
    }

    if (format === 'excel') {
      return await generateLoanExcel(res, reportData)
    } else if (format === 'pdf') {
      return await generateLoanPDF(res, reportData)
    }

    successResponse(res, reportData, 'Laporan pinjaman berhasil digenerate')
  } catch (error) {
    logger.error('Error generating loan report:', error)
    errorResponse(res, 'Gagal generate laporan pinjaman', 500)
  }
})

// Generate SHU report (Laporan Sisa Hasil Usaha)
router.get('/shu', authenticateJWT, checkRole(['pengurus', 'pengawas']), async (req, res) => {
  try {
    const { year, format = 'json' } = req.query
    const currentYear = year || new Date().getFullYear()

    logger.info('Generating SHU report', { year: currentYear, format, userId: req.user?.id })

    // Calculate SHU based on member contributions
    const [memberContributions] = await pool.execute(
      `
      SELECT
        a.id,
        a.name,
        a.nomor_anggota,
        COALESCE(SUM(CASE WHEN s.jenis = 'pokok' THEN s.jumlah ELSE 0 END), 0) as simpanan_pokok,
        COALESCE(SUM(CASE WHEN s.jenis = 'wajib' THEN s.jumlah ELSE 0 END), 0) as simpanan_wajib,
        COALESCE(SUM(CASE WHEN s.jenis = 'sukarela' THEN s.jumlah ELSE 0 END), 0) as simpanan_sukarela,
        COALESCE(SUM(p.jumlah), 0) as total_pinjaman
      FROM anggota a
      LEFT JOIN simpanan s ON a.id = s.anggota_id AND s.status = 'diverifikasi' AND YEAR(s.tanggal) = ?
      LEFT JOIN pinjaman p ON a.id = p.anggota_id AND p.status_pinjaman IN ('aktif', 'lunas') AND YEAR(p.arrival_time) = ?
      WHERE a.status_aktif = 1
      GROUP BY a.id
    `,
      [currentYear, currentYear],
    )

    // Simulasi SHU calculation
    const totalSimpanan = memberContributions[0].reduce(
      (sum, member) =>
        sum + member.simpanan_pokok + member.simpanan_wajib + member.simpanan_sukarela,
      0,
    )
    const totalPinjaman = memberContributions[0].reduce(
      (sum, member) => sum + member.total_pinjaman,
      0,
    )

    // Simulasi SHU berdasarkan formula umum koperasi
    const totalSHU = 50000000 // Simulasi total SHU
    const shuJasaModal = totalSHU * 0.3 // 30% untuk jasa modal
    const shuJasaUsaha = totalSHU * 0.7 // 70% untuk jasa usaha

    const memberSHU = memberContributions[0].map((member) => {
      const persentaseModal =
        (member.simpanan_pokok + member.simpanan_wajib + member.simpanan_sukarela) / totalSimpanan
      const persentaseUsaha = member.total_pinjaman / (totalPinjaman || 1)

      return {
        ...member,
        persentase_modal: persentaseModal * 100,
        persentase_usaha: persentaseUsaha * 100,
        shu_jasa_modal: shuJasaModal * persentaseModal,
        shu_jasa_usaha: shuJasaUsaha * persentaseUsaha,
        total_shu: shuJasaModal * persentaseModal + shuJasaUsaha * persentaseUsaha,
      }
    })

    const reportData = {
      metadata: {
        tahun: currentYear,
        tanggal_generate: new Date().toISOString(),
        generated_by: req.user?.username || 'System',
      },
      ringkasan_shu: {
        total_shu: totalSHU,
        shu_jasa_modal: shuJasaModal,
        shu_jasa_usaha: shuJasaUsaha,
        jumlah_anggota_penerima: memberSHU.length,
      },
      distribusi_shu: memberSHU,
      statistik: {
        shu_tertinggi: Math.max(...memberSHU.map((m) => m.total_shu)),
        shu_terendah: Math.min(...memberSHU.map((m) => m.total_shu)),
        rata_rata_shu: memberSHU.reduce((sum, m) => sum + m.total_shu, 0) / memberSHU.length,
        total_simpanan_dasar: totalSimpanan,
        total_transaksi_usaha: totalPinjaman,
      },
    }

    if (format === 'excel') {
      return await generateSHUExcel(res, reportData)
    } else if (format === 'pdf') {
      return await generateSHUPDF(res, reportData)
    }

    successResponse(res, reportData, 'Laporan SHU berhasil digenerate')
  } catch (error) {
    logger.error('Error generating SHU report:', error)
    errorResponse(res, 'Gagal generate laporan SHU', 500)
  }
})

// Excel generation functions
async function generateFinancialExcel(res, data) {
  const workbook = new ExcelJS.Workbook()

  // Neraca sheet
  const neracaSheet = workbook.addWorksheet('Neraca')
  neracaSheet.addRow(['NERACA KOPERASI'])
  neracaSheet.addRow([
    `Periode: ${data.metadata.periode.mulai} s/d ${data.metadata.periode.selesai}`,
  ])
  neracaSheet.addRow([])

  neracaSheet.addRow(['ASET'])
  neracaSheet.addRow(['Kas dan Bank', data.neraca.aset.kas_bank])
  neracaSheet.addRow(['Pinjaman Anggota', data.neraca.aset.pinjaman_anggota])
  neracaSheet.addRow(['Investasi', data.neraca.aset.investasi])
  neracaSheet.addRow(['Total Aset', data.neraca.aset.total_aset])
  neracaSheet.addRow([])

  neracaSheet.addRow(['KEWAJIBAN'])
  neracaSheet.addRow(['Simpanan Anggota', data.neraca.kewajiban.simpanan_anggota])
  neracaSheet.addRow(['Kewajiban Lain', data.neraca.kewajiban.kewajiban_lain])
  neracaSheet.addRow(['Total Kewajiban', data.neraca.kewajiban.total_kewajiban])
  neracaSheet.addRow([])

  neracaSheet.addRow(['MODAL'])
  neracaSheet.addRow(['Modal Disetor', data.neraca.modal.modal_disetor])
  neracaSheet.addRow(['Cadangan', data.neraca.modal.cadangan])
  neracaSheet.addRow(['SHU Belum Dibagi', data.neraca.modal.shu_belum_dibagi])
  neracaSheet.addRow(['Total Modal', data.neraca.modal.total_modal])

  // Laba Rugi sheet
  const labaRugiSheet = workbook.addWorksheet('Laba Rugi')
  labaRugiSheet.addRow(['LAPORAN LABA RUGI'])
  labaRugiSheet.addRow([
    `Periode: ${data.metadata.periode.mulai} s/d ${data.metadata.periode.selesai}`,
  ])
  labaRugiSheet.addRow([])

  labaRugiSheet.addRow(['PENDAPATAN'])
  labaRugiSheet.addRow(['Bunga Pinjaman', data.laba_rugi.pendapatan.bunga_pinjaman])
  labaRugiSheet.addRow(['Provisi Administrasi', data.laba_rugi.pendapatan.provisi_administrasi])
  labaRugiSheet.addRow(['Pendapatan Lain', data.laba_rugi.pendapatan.pendapatan_lain])
  labaRugiSheet.addRow(['Total Pendapatan', data.laba_rugi.pendapatan.total_pendapatan])
  labaRugiSheet.addRow([])

  labaRugiSheet.addRow(['BEBAN'])
  labaRugiSheet.addRow(['Beban Bunga Simpanan', data.laba_rugi.beban.beban_bunga_simpanan])
  labaRugiSheet.addRow(['Beban Operasional', data.laba_rugi.beban.beban_operasional])
  labaRugiSheet.addRow(['Beban Penyisihan', data.laba_rugi.beban.beban_penyisihan])
  labaRugiSheet.addRow(['Total Beban', data.laba_rugi.beban.total_beban])
  labaRugiSheet.addRow([])

  labaRugiSheet.addRow(['SHU Sebelum Pajak', data.laba_rugi.shu_sebelum_pajak])
  labaRugiSheet.addRow(['Pajak', data.laba_rugi.pajak])
  labaRugiSheet.addRow(['SHU Setelah Pajak', data.laba_rugi.shu_setelah_pajak])

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-keuangan-${new Date().toISOString().split('T')[0]}.xlsx`,
  )

  await workbook.xlsx.write(res)
  res.end()
}

async function generateMembershipExcel(res, data) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Laporan Keanggotaan')

  sheet.addRow(['LAPORAN KEANGGOTAAN KOPERASI'])
  sheet.addRow([`Tahun: ${data.metadata.tahun}`])
  sheet.addRow([])

  sheet.addRow(['RINGKASAN'])
  sheet.addRow(['Total Anggota', data.ringkasan.total_anggota])
  sheet.addRow(['Anggota Aktif', data.ringkasan.anggota_aktif])
  sheet.addRow(['Anggota Non-aktif', data.ringkasan.anggota_nonaktif])
  sheet.addRow(['Anggota Baru Tahun Ini', data.ringkasan.anggota_baru_tahun_ini])
  sheet.addRow([])

  sheet.addRow(['DETAIL ANGGOTA'])
  sheet.addRow([
    'No. Anggota',
    'Nama',
    'Tanggal Bergabung',
    'Status',
    'Total Simpanan',
    'Jumlah Transaksi',
  ])

  data.detail_anggota.forEach((member) => {
    sheet.addRow([
      member.nomor_anggota,
      member.name,
      member.tanggal_bergabung,
      member.status_aktif ? 'Aktif' : 'Non-aktif',
      member.total_simpanan,
      member.jumlah_transaksi_simpanan,
    ])
  })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-keanggotaan-${data.metadata.tahun}.xlsx`,
  )

  await workbook.xlsx.write(res)
  res.end()
}

async function generateLoanExcel(res, data) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Laporan Pinjaman')

  sheet.addRow(['LAPORAN PINJAMAN KOPERASI'])
  sheet.addRow([`Periode: ${data.metadata.periode.mulai} s/d ${data.metadata.periode.selesai}`])
  sheet.addRow([])

  sheet.addRow(['RINGKASAN'])
  sheet.addRow(['Total Pengajuan', data.ringkasan.total_pengajuan])
  sheet.addRow(['Total Nominal', data.ringkasan.total_nominal])
  sheet.addRow(['Rata-rata Nominal', data.ringkasan.rata_rata_nominal])
  sheet.addRow([])

  sheet.addRow(['DETAIL PINJAMAN'])
  sheet.addRow([
    'No. Anggota',
    'Nama Anggota',
    'Jumlah',
    'Tenor',
    'Bunga',
    'Status',
    'Tanggal Pengajuan',
    'Durasi Proses',
  ])

  data.detail_pinjaman.forEach((loan) => {
    sheet.addRow([
      loan.nomor_anggota,
      loan.nama_anggota,
      loan.jumlah,
      loan.tenor,
      loan.bunga,
      loan.status_pinjaman,
      loan.arrival_time,
      loan.durasi_proses,
    ])
  })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-pinjaman-${new Date().toISOString().split('T')[0]}.xlsx`,
  )

  await workbook.xlsx.write(res)
  res.end()
}

async function generateSHUExcel(res, data) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Laporan SHU')

  sheet.addRow(['LAPORAN SISA HASIL USAHA (SHU)'])
  sheet.addRow([`Tahun: ${data.metadata.tahun}`])
  sheet.addRow([])

  sheet.addRow(['RINGKASAN SHU'])
  sheet.addRow(['Total SHU', data.ringkasan_shu.total_shu])
  sheet.addRow(['SHU Jasa Modal (30%)', data.ringkasan_shu.shu_jasa_modal])
  sheet.addRow(['SHU Jasa Usaha (70%)', data.ringkasan_shu.shu_jasa_usaha])
  sheet.addRow([])

  sheet.addRow(['DISTRIBUSI SHU PER ANGGOTA'])
  sheet.addRow([
    'No. Anggota',
    'Nama',
    'Simpanan Total',
    'Total Pinjaman',
    '% Modal',
    '% Usaha',
    'SHU Jasa Modal',
    'SHU Jasa Usaha',
    'Total SHU',
  ])

  data.distribusi_shu.forEach((member) => {
    sheet.addRow([
      member.nomor_anggota,
      member.name,
      member.simpanan_pokok + member.simpanan_wajib + member.simpanan_sukarela,
      member.total_pinjaman,
      member.persentase_modal.toFixed(2) + '%',
      member.persentase_usaha.toFixed(2) + '%',
      member.shu_jasa_modal,
      member.shu_jasa_usaha,
      member.total_shu,
    ])
  })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-shu-${data.metadata.tahun}.xlsx`,
  )

  await workbook.xlsx.write(res)
  res.end()
}

// PDF generation functions (simplified - full implementation would be more complex)
async function generateFinancialPDF(res, data) {
  const doc = new PDFDocument()
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-keuangan-${new Date().toISOString().split('T')[0]}.pdf`,
  )

  doc.pipe(res)

  doc.fontSize(16).text('LAPORAN KEUANGAN KOPERASI', 50, 50)
  doc
    .fontSize(12)
    .text(`Periode: ${data.metadata.periode.mulai} s/d ${data.metadata.periode.selesai}`, 50, 80)

  doc.text('\nNERACA', 50, 120)
  doc.text(`Total Aset: Rp ${data.neraca.aset.total_aset.toLocaleString('id-ID')}`, 50, 140)
  doc.text(
    `Total Kewajiban: Rp ${data.neraca.kewajiban.total_kewajiban.toLocaleString('id-ID')}`,
    50,
    160,
  )
  doc.text(`Total Modal: Rp ${data.neraca.modal.total_modal.toLocaleString('id-ID')}`, 50, 180)

  doc.text('\nLABA RUGI', 50, 220)
  doc.text(
    `Total Pendapatan: Rp ${data.laba_rugi.pendapatan.total_pendapatan.toLocaleString('id-ID')}`,
    50,
    240,
  )
  doc.text(`Total Beban: Rp ${data.laba_rugi.beban.total_beban.toLocaleString('id-ID')}`, 50, 260)
  doc.text(
    `SHU Setelah Pajak: Rp ${data.laba_rugi.shu_setelah_pajak.toLocaleString('id-ID')}`,
    50,
    280,
  )

  doc.end()
}

async function generateMembershipPDF(res, data) {
  const doc = new PDFDocument()
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-keanggotaan-${data.metadata.tahun}.pdf`,
  )

  doc.pipe(res)

  doc.fontSize(16).text('LAPORAN KEANGGOTAAN KOPERASI', 50, 50)
  doc.fontSize(12).text(`Tahun: ${data.metadata.tahun}`, 50, 80)

  doc.text(`Total Anggota: ${data.ringkasan.total_anggota}`, 50, 120)
  doc.text(`Anggota Aktif: ${data.ringkasan.anggota_aktif}`, 50, 140)
  doc.text(`Anggota Baru: ${data.ringkasan.anggota_baru_tahun_ini}`, 50, 160)

  doc.end()
}

async function generateLoanPDF(res, data) {
  const doc = new PDFDocument()
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-pinjaman-${new Date().toISOString().split('T')[0]}.pdf`,
  )

  doc.pipe(res)

  doc.fontSize(16).text('LAPORAN PINJAMAN KOPERASI', 50, 50)
  doc
    .fontSize(12)
    .text(`Periode: ${data.metadata.periode.mulai} s/d ${data.metadata.periode.selesai}`, 50, 80)

  doc.text(`Total Pengajuan: ${data.ringkasan.total_pengajuan}`, 50, 120)
  doc.text(`Total Nominal: Rp ${data.ringkasan.total_nominal.toLocaleString('id-ID')}`, 50, 140)
  doc.text(`Tingkat Persetujuan: ${data.analisis.tingkat_persetujuan}%`, 50, 160)

  doc.end()
}

async function generateSHUPDF(res, data) {
  const doc = new PDFDocument()
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=laporan-shu-${data.metadata.tahun}.pdf`,
  )

  doc.pipe(res)

  doc.fontSize(16).text('LAPORAN SISA HASIL USAHA (SHU)', 50, 50)
  doc.fontSize(12).text(`Tahun: ${data.metadata.tahun}`, 50, 80)

  doc.text(`Total SHU: Rp ${data.ringkasan_shu.total_shu.toLocaleString('id-ID')}`, 50, 120)
  doc.text(`Jumlah Penerima: ${data.ringkasan_shu.jumlah_anggota_penerima} anggota`, 50, 140)
  doc.text(`Rata-rata SHU: Rp ${data.statistik.rata_rata_shu.toLocaleString('id-ID')}`, 50, 160)

  doc.end()
}

export default router

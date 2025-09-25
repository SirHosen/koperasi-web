// pinjaman.routes.js - Routes for loan management
import express from 'express'
import { pool } from '../db.js'
import { v4 as uuidv4 } from 'uuid'
import { checkRole } from '../middleware/auth.middleware.js'
import multer from 'multer'
import path from 'path'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `document-${uniqueSuffix}${ext}`)
  },
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'))
    }
  }
})

/**
 * Get all loan applications in verification status
 * GET /api/pinjaman/verification
 */
router.get('/verification', checkRole(['pengurus']), async (req, res) => {
  try {
    const [loans] = await pool.query(
      `SELECT p.id, p.anggota_id, p.jumlah, p.tenor, p.bunga, p.tujuan,
       p.status_pinjaman, p.arrival_time, p.created_at, p.updated_at,
       a.nomor_anggota, u.name
       FROM pinjaman p
       JOIN anggota a ON p.anggota_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE p.status_pinjaman = 'verifikasi'
       ORDER BY p.created_at DESC`
    )

    return res.status(200).json({
      status: 'success',
      data: {
        loans
      }
    })
  } catch (error) {
    console.error('Error fetching verification loans:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Get a specific loan application with documents
 * GET /api/pinjaman/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Get loan details
    const [loans] = await pool.query(
      `SELECT p.id, p.anggota_id, p.jumlah, p.tenor, p.bunga, p.tujuan,
       p.status_pinjaman, p.arrival_time, p.catatan, p.created_at, p.updated_at,
       a.nomor_anggota, u.name
       FROM pinjaman p
       JOIN anggota a ON p.anggota_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE p.id = ?`,
      [id]
    )

    if (loans.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Loan not found' })
    }

    // Get documents
    const [documents] = await pool.query(
      `SELECT id, jenis_dokumen as jenisDokumen, nama_file as namaFile, 
       path_file as pathFile, status, catatan
       FROM dokumen_pinjaman
       WHERE pinjaman_id = ?`,
      [id]
    )

    // Add documents to loan object
    const loan = {
      ...loans[0],
      dokumenPendukung: documents
    }

    return res.status(200).json({
      status: 'success',
      data: {
        loan
      }
    })
  } catch (error) {
    console.error('Error fetching loan details:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Verify a document
 * POST /api/pinjaman/:loanId/verify-document/:docId
 */
router.post('/:loanId/verify-document/:docId', checkRole(['pengurus']), async (req, res) => {
  try {
    const { loanId, docId } = req.params
    const { status, notes } = req.body

    if (!['diterima', 'ditolak'].includes(status)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Status must be either "diterima" or "ditolak"' 
      })
    }

    // Update document status
    const [result] = await pool.query(
      `UPDATE dokumen_pinjaman 
       SET status = ?, catatan = ?
       WHERE id = ? AND pinjaman_id = ?`,
      [status, notes, docId, loanId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Document not found or does not belong to the specified loan' 
      })
    }

    return res.status(200).json({
      status: 'success',
      data: {
        success: true
      }
    })
  } catch (error) {
    console.error('Error verifying document:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Complete loan verification
 * POST /api/pinjaman/:loanId/complete-verification
 */
router.post('/:loanId/complete-verification', checkRole(['pengurus']), async (req, res) => {
  try {
    const { loanId } = req.params
    const { isApproved, notes } = req.body
    
    // Get loan details first to verify status
    const [loans] = await pool.query(
      `SELECT status_pinjaman FROM pinjaman WHERE id = ?`,
      [loanId]
    )
    
    if (loans.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Loan not found' })
    }
    
    if (loans[0].status_pinjaman !== 'verifikasi') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Loan is not in verification status' 
      })
    }
    
    // Check if all documents are verified
    const [pendingDocs] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM dokumen_pinjaman 
       WHERE pinjaman_id = ? AND status = 'menunggu'`,
      [loanId]
    )
    
    if (pendingDocs[0].count > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'All documents must be verified before completing verification' 
      })
    }

    // Update loan status based on approval
    const newStatus = isApproved ? 'disetujui' : 'ditolak'
    
    const [result] = await pool.query(
      `UPDATE pinjaman 
       SET status_pinjaman = ?, catatan = CONCAT(COALESCE(catatan, ''), '\n', ?)
       WHERE id = ?`,
      [newStatus, notes, loanId]
    )

    return res.status(200).json({
      status: 'success',
      data: {
        success: true
      }
    })
  } catch (error) {
    console.error('Error completing verification:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

/**
 * Submit a new loan application
 * POST /api/pinjaman/submit
 */
router.post('/submit', checkRole(['anggota']), upload.array('dokumen', 5), async (req, res) => {
  try {
    const { 
      jumlah, 
      tenor, 
      bunga, 
      tujuan, 
      jenisDokumen 
    } = req.body;

    const userId = req.user.id;
    const loanId = uuidv4();
    
    // Get anggota_id from users
    const [anggotaResult] = await pool.query(
      'SELECT a.id FROM anggota a JOIN users u ON a.user_id = u.id WHERE u.id = ?',
      [userId]
    );
    
    if (anggotaResult.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Anggota tidak ditemukan' });
    }
    
    const anggotaId = anggotaResult[0].id;
    const now = new Date();
    
    // Create loan record
    await pool.query(
      `INSERT INTO pinjaman (
        id, anggota_id, jumlah, tenor, bunga, tujuan,
        arrival_time, status_pinjaman, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'antrean', ?, ?)`,
      [
        loanId, 
        anggotaId,
        jumlah,
        tenor,
        bunga,
        tujuan,
        now,
        now,
        now
      ]
    );
    
    // Process uploaded documents
    if (req.files && req.files.length > 0) {
      const jenisDokumenArray = Array.isArray(jenisDokumen) ? jenisDokumen : [jenisDokumen];
      
      // Process each uploaded file
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const docId = uuidv4();
        const docType = jenisDokumenArray[i] || 'Dokumen Pendukung';
        
        // Save document record
        await pool.query(
          `INSERT INTO dokumen_pinjaman (
            id, pinjaman_id, jenis_dokumen, nama_file,
            path_file, ukuran_file, status, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'menunggu', ?)`,
          [
            docId,
            loanId,
            docType,
            file.originalname,
            file.path,
            file.size,
            now
          ]
        );
      }
    }
    
    // Update queue position (get current max position and add 1)
    const [queueResult] = await pool.query(
      'SELECT MAX(posisi_antrean) as max_pos FROM pinjaman WHERE status_pinjaman = "antrean"'
    );
    
    const newPosition = (queueResult[0].max_pos || 0) + 1;
    
    await pool.query(
      'UPDATE pinjaman SET posisi_antrean = ? WHERE id = ?',
      [newPosition, loanId]
    );
    
    return res.status(201).json({
      status: 'success',
      data: {
        id: loanId,
        posisiAntrean: newPosition,
        message: 'Permohonan pinjaman berhasil diajukan'
      }
    });
    
  } catch (error) {
    console.error('Error submitting loan application:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
})

export default router
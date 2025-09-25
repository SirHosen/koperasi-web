// DocumentPreview.vue - Component to preview different types of documents
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  documentPath: {
    type: String,
    required: true,
  },
  documentName: {
    type: String,
    required: true,
  },
})

const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

// Determine document type based on file extension
const documentType = computed(() => {
  const filename = props.documentName.toLowerCase()
  if (filename.endsWith('.pdf')) return 'pdf'
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png'))
    return 'image'
  return 'unknown'
})

// Document source URL (with proper handling for relative vs absolute URLs)
const documentUrl = computed(() => {
  const path = props.documentPath
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // For relative paths, construct the proper URL based on API server
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  const baseUrl = apiUrl.replace('/api', '')
  return `${baseUrl}/${path.replace(/^\//, '')}`
})

// Load document
const loadDocument = () => {
  isLoading.value = true
  hasError.value = false

  // For images and PDFs, we'll simulate a loading check
  const img = new Image()
  img.onload = () => {
    isLoading.value = false
  }
  img.onerror = () => {
    isLoading.value = false
    hasError.value = true
    errorMessage.value = 'Gagal memuat dokumen. Pastikan format file didukung.'
  }

  // Start loading
  if (documentType.value === 'image') {
    img.src = documentUrl.value
  } else {
    // For PDFs and other types, we'll just simulate a brief loading period
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }
}

// Initialize on mount
onMounted(() => {
  loadDocument()
})
</script>

<template>
  <div class="document-preview">
    <div v-if="isLoading" class="preview-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat dokumen...</p>
    </div>

    <div v-else-if="hasError" class="preview-error">
      <i class="bi bi-exclamation-triangle-fill text-danger"></i>
      <p>{{ errorMessage }}</p>
      <a :href="documentUrl" target="_blank" class="btn btn-sm btn-outline-primary">
        Buka di Tab Baru
      </a>
    </div>

    <div v-else class="preview-content">
      <!-- PDF Preview -->
      <div v-if="documentType === 'pdf'" class="pdf-preview">
        <div class="pdf-controls">
          <a :href="documentUrl" target="_blank" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-file-earmark-pdf"></i> Buka PDF di Tab Baru
          </a>
        </div>
        <iframe :src="documentUrl" class="pdf-frame" title="PDF Preview"></iframe>
      </div>

      <!-- Image Preview -->
      <div v-else-if="documentType === 'image'" class="image-preview">
        <img :src="documentUrl" :alt="props.documentName" class="preview-image" />
      </div>

      <!-- Unknown File Type -->
      <div v-else class="unknown-preview">
        <i class="bi bi-file-earmark" style="font-size: 3rem"></i>
        <p>Tipe file ini tidak dapat ditampilkan.</p>
        <a :href="documentUrl" target="_blank" class="btn btn-sm btn-outline-primary">
          Download File
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-preview {
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.preview-loading,
.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
}

.preview-error i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.pdf-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pdf-controls {
  padding: 8px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.pdf-frame {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
}

.image-preview {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.unknown-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
}
</style>

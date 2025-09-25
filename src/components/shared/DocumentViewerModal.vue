// DocumentViewerModal.vue - Modal for document viewing
<script setup lang="ts">
import DocumentPreview from './DocumentPreview.vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  documentPath: {
    type: String,
    default: '',
  },
  documentName: {
    type: String,
    default: '',
  },
  documentType: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-backdrop">
      <div class="modal-document" @click.stop>
        <div class="modal-header">
          <h5>
            {{ documentName }}
            <span v-if="documentType" class="document-type">({{ documentType }})</span>
          </h5>
          <button @click="closeModal" class="btn-close" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <DocumentPreview :documentPath="documentPath" :documentName="documentName" />
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-document {
  background-color: white;
  border-radius: 8px;
  width: 80%;
  max-width: 1000px;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
}

.document-type {
  color: #6c757d;
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.modal-body {
  padding: 0;
  overflow: hidden;
  flex: 1;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <div class="container">
    <!-- Controls -->
    <div class="controls">
      <div class="control-group">
        <label>Quality:</label>
        <div class="btn-group">
          <button
            v-for="q in [20, 40, 60, 80, 100]"
            :key="q"
            @click="setQuality(q)"
            :class="{ active: qualityPercent === q }"
          >
            {{ q }}%
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Left: Upload -->
      <div class="left-panel" @click="triggerUpload">
        <div class="image-container">
          <div v-if="!originalUrl" class="upload-placeholder">
            <PhPlus :size="32" />
            <p>Click to upload</p>
          </div>
          <img v-else :src="originalUrl" />
        </div>
        <div class="info-bar">
          <span>{{ formatSize(originalSize) }}</span>
        </div>
        <input type="file" accept="image/*" ref="fileInput" @change="handleFile" hidden />
      </div>

      <!-- Right: Result -->
      <div class="right-panel">
        <div class="image-container">
          <div v-if="!compressedUrl" class="upload-placeholder">
            <PhEquals :size="32" />
            <p>Result</p>
          </div>
          <img v-else :src="compressedUrl" />
        </div>
        <div class="info-bar">
          <span v-if="compressedUrl">{{ formatSize(compressedSize) }}</span>
          <div v-if="compressedUrl" class="download-group">
            <input
              v-model="fileName"
              type="text"
              placeholder="Enter filename"
              class="filename-input"
            />
            <button class="download-btn" @click="downloadImage">Download</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PhPlus, PhEquals } from '@phosphor-icons/vue'

const fileInput = ref(null)
const originalUrl = ref('')
const compressedUrl = ref('')
const originalSize = ref(0)
const compressedSize = ref(0)
const qualityPercent = ref(60)
const fileName = ref('')
let lastFile = null

const quality = () => qualityPercent.value / 100

const formatSize = (size) => {
  if (!size) return ''
  if (size >= 1024) {
    return (size / 1024).toFixed(2) + ' MB'
  }
  return size.toFixed(2) + ' KB'
}

const triggerUpload = () => fileInput.value?.click()

const handleFile = (event) => {
  const file = event.target.files[0]
  if (!file) return
  lastFile = file
  originalSize.value = file.size / 1024
  originalUrl.value = URL.createObjectURL(file)
  compressImage(file)
}

const setQuality = (percent) => {
  qualityPercent.value = percent
  if (lastFile) compressImage(lastFile)
}

const downloadImage = () => {
  if (!compressedUrl.value) return
  const link = document.createElement('a')
  link.href = compressedUrl.value
  link.download = fileName.value || 'compressed.jpg'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const compressImage = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const maxW = 800
      const scale = maxW / img.width
      canvas.width = maxW
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        compressedSize.value = blob.size / 1024
        compressedUrl.value = URL.createObjectURL(blob)
      }, 'image/jpeg', quality())
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.container {
  width: 80%;
  max-width: 1500px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.controls {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.control-group label {
  color: #b3b3b3;
  font-size: 16px;
  font-weight: 500;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.btn-group button {
  background-color: transparent;
  color: #b3b3b3;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-group button:hover {
  color: #ffffff;
}

.btn-group button.active {
  background-color: #4a4a4a;
  color: #ffffff;
}

.content {
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.left-panel, .right-panel {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.left-panel {
  background-color: #2d2d2d;
  cursor: pointer;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.right-panel {
  background-color: #252525;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.image-container {
  flex: 1;
  background-color: transparent;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #b3b3b3;
  width: 100%;
  transition: all 0.3s ease;
}

.upload-placeholder p {
  margin-top: 8px;
  font-size: 14px;
}

.info-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #b3b3b3;
  font-size: 14px;
  padding: 0 10px;
}

.download-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filename-input {
  background-color: rgba(255, 255, 255, 0.05);
  border: none;
  color: #ffffff;
  padding: 6px 8px;
  font-size: 14px;
  width: 120px;
  height: 28px;
  transition: all 0.3s ease;
  border-radius: 6px;
  line-height: 1;
}

.filename-input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.08);
}

.filename-input::placeholder {
  color: #666666;
}

.download-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  height: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  border-radius: 6px;
  line-height: 1;
}

.download-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
  .container {
    width: 100%;
  }

  .content {
    flex-direction: column;
  }

  .left-panel {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border-bottom-left-radius: 0;
  }

  .right-panel {
    border-top-right-radius: 0;
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px;
  }

  .controls {
    margin-bottom: 15px;
  }

  .control-group {
    flex-direction: column;
    gap: 5px;
  }

  .btn-group {
    width: 100%;
    justify-content: space-between;
  }

  .btn-group button {
    padding: 4px 6px;
    font-size: 13px;
  }
}
</style>

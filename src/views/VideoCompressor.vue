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
          <video v-else :src="originalUrl" controls></video>
        </div>
        <div class="info-bar">
          <span>{{ formatSize(originalSize) }}</span>
        </div>
        <input type="file" accept="video/*" ref="fileInput" @change="handleFile" hidden />
      </div>

      <!-- Right: Result -->
      <div class="right-panel">
        <div class="image-container">
          <div v-if="!compressedUrl" class="upload-placeholder">
            <template v-if="isCompressing">
              <div class="progress-ring-container">
                <svg class="progress-ring" width="120" height="120">
                  <circle
                    class="progress-ring-circle-bg"
                    stroke="#4a4a4a"
                    stroke-width="8"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                  />
                  <circle
                    class="progress-ring-circle"
                    stroke="#00ff00"
                    stroke-width="8"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    :style="{ strokeDashoffset: progressOffset }"
                  />
                </svg>
                <div class="progress-text">{{ displayedProgress.toFixed(1) }}%</div>
              </div>
            </template>
            <template v-else>
              <PhEquals :size="32" />
              <p>Result</p>
            </template>
          </div>
          <video v-else :src="compressedUrl" controls></video>
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
            <button class="download-btn" @click="downloadVideo">Download</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { PhPlus, PhEquals } from '@phosphor-icons/vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

const originalUrl = ref(null)
const originalSize = ref(0)
const compressedUrl = ref(null)
const compressedSize = ref(0)
const fileName = ref('')
const fileInput = ref(null)
const qualityPercent = ref(60)
const progress = ref(0)
const displayedProgress = ref(0)
const isCompressing = ref(false)
const CIRCLE_RADIUS = 52
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

// 監聽實際進度的變化，平滑過渡到顯示進度
watch(progress, (newValue) => {
  const startValue = displayedProgress.value
  const endValue = newValue
  const duration = 300 // 動畫持續時間（毫秒）
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用緩動函數使動畫更自然
    const easeOutQuad = t => t * (2 - t)
    displayedProgress.value = startValue + (endValue - startValue) * easeOutQuad(progress)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
})

const progressOffset = computed(() => {
  return CIRCLE_CIRCUMFERENCE * (1 - displayedProgress.value / 100)
})

let ffmpeg
const isFFmpegLoaded = ref(false)
let totalDurationSec = 0 // 影片總秒數，用於進度估算

onMounted(async () => {
  console.log('[FFMPEG] 初始化中...')
  ffmpeg = new FFmpeg({ log: true })
  await ffmpeg.load()
  isFFmpegLoaded.value = true
  console.log('[FFMPEG] 載入完成')
})

const triggerUpload = () => {
  console.log('[UI] 點擊上傳區塊')
  fileInput.value.click()
}

const setQuality = async (q) => {
  console.log(`[品質設定] 切換為 ${q}%`)
  qualityPercent.value = q
  
  // 如果已經有原始影片，則重新壓縮
  if (originalUrl.value) {
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput && fileInput.files.length > 0) {
      console.log('[重新壓縮] 開始重新壓縮影片')
      await compressVideo(fileInput.files[0])
    }
  }
}

const handleFile = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  console.log('[檔案上傳] 選擇檔案:', file.name)

  if (!isFFmpegLoaded.value) {
    console.warn('[錯誤] FFmpeg 尚未載入完成')
    alert('FFmpeg 尚未載入完成，請稍後再試')
    return
  }

  const url = URL.createObjectURL(file)
  originalUrl.value = url
  originalSize.value = file.size
  console.log('[原始影片] URL 建立完成，大小:', formatSize(file.size))

  await compressVideo(file)
}

const compressVideo = async (file) => {
  console.log('[壓縮開始] 開始寫入檔案')
  compressedUrl.value = null
  isCompressing.value = true
  progress.value = 0

  // 重置 FFmpeg 實例
  ffmpeg = new FFmpeg({ log: true })
  await ffmpeg.load()

  let durationFound = false

  // 設置進度監聽
  ffmpeg.on('log', ({ type, message }) => {
    console.log(`[FFmpeg Log] type: ${type}, message: ${message}`)
    
    // 從日誌中獲取影片時長
    if (!durationFound && message.includes('Duration')) {
      const durMatch = message.match(/Duration: (\d+):(\d+):([\d.]+)/)
      if (durMatch) {
        const [, hours, minutes, seconds] = durMatch
        totalDurationSec = (+hours * 3600) + (+minutes * 60) + (+seconds)
        durationFound = true
        console.log(`[影片長度] ${totalDurationSec}s`)
      }
    }

    // 更新進度
    if (type === 'stderr') {
      const timeMatch = message.match(/time=(\d+):(\d+):(\d+\.\d+)/)
      if (timeMatch && totalDurationSec > 0) {
        const [, hours, minutes, seconds] = timeMatch
        const currentTime = (+hours * 3600) + (+minutes * 60) + (+seconds)
        const percentage = (currentTime / totalDurationSec) * 100
        progress.value = Math.min(percentage, 100)
        console.log(`[進度更新] 當前時間: ${currentTime}s, 總時間: ${totalDurationSec}s, 進度: ${progress.value.toFixed(1)}%`)
      }
    }
  })

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'
  
  try {
    // 寫入檔案
    await ffmpeg.writeFile(inputName, await fetchFile(file))
    console.log('[寫入完成] input.mp4')

    // 取得影片時長（執行 -i 指令時會輸出影片資訊）
    console.log('[取得長度] 解析影片時間...')
    await ffmpeg.exec(['-i', inputName])

    const bitrate = Math.floor((qualityPercent.value / 100) * 3000)
    console.log(`[壓縮參數] bitrate=${bitrate}k`)

    // 執行壓縮
    console.log('[執行壓縮] 開始 ffmpeg.exec')
    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-b:v', `${bitrate}k`,
      '-preset', 'ultrafast',
      '-movflags', 'frag_keyframe+empty_moov',
      outputName
    ])
    console.log('[執行壓縮] 完成')

    // 讀取結果
    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([data.buffer], { type: 'video/mp4' })
    compressedSize.value = blob.size
    compressedUrl.value = URL.createObjectURL(blob)
    console.log('[壓縮結果] 成功產生影片:', formatSize(blob.size))

  } catch (err) {
    console.error('[FFmpeg 錯誤] 執行失敗:', err)
  } finally {
    isCompressing.value = false
    progress.value = 100
  }
}

const formatSize = (size) => {
  if (!size) return ''
  return (size / 1024 / 1024).toFixed(2) + ' MB'
}

const downloadVideo = () => {
  console.log('[下載影片] 檔名:', fileName.value)
  const link = document.createElement('a')
  link.href = compressedUrl.value
  link.download = fileName.value || 'compressed.mp4'
  link.click()
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

.image-container video {
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

.progress-ring-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
}

.progress-ring {
  transform: rotate(-90deg);
  will-change: transform;
}

.progress-ring-circle {
  stroke-dasharray: 326.73;
  stroke-dashoffset: 326.73;
  transition: stroke-dashoffset 0.3s ease-out;
  transform-origin: center;
  stroke: #e8e8af;
  stroke-linecap: round;
}

.progress-text {
  position: absolute;
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  transition: all 0.3s ease-out;
}

.progress-ring-circle-bg {
  opacity: 0.2;
}

/* 添加動畫效果 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

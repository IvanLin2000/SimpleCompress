import { createRouter, createWebHistory } from 'vue-router'
import ImageCompressor from '@/views/ImageCompressor.vue'
import VideoCompressor from '@/views/VideoCompressor.vue'

const routes = [
  { path: '/', redirect: '/image' },
  { path: '/image', component: ImageCompressor },
  { path: '/video', component: VideoCompressor },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

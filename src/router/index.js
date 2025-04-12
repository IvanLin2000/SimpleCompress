import { createRouter, createWebHistory } from 'vue-router'
import ImageCompressor from '@/views/ImageCompressor.vue'
import VideoCompressor from '@/views/VideoCompressor.vue'

const routes = [
  { path: '/', redirect: '/image' },
  { path: '/image', component: ImageCompressor },
  { path: '/video', component: VideoCompressor },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

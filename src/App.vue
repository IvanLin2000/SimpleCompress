<template>
  <div class="app-container">
    <!-- 上方導覽列 -->
    <nav class="nav">
      <div class="logo">SimpleCompress</div>
      <div class="nav-center">
        <router-link to="/image" class="nav-btn" :class="{ active: isImage }">
          <span class="desktop-text">Image</span>
          <PhImage :size="24" class="mobile-icon" />
        </router-link>
        <router-link to="/video" class="nav-btn" :class="{ active: isVideo }">
          <span class="desktop-text">Video</span>
          <PhVideo :size="24" class="mobile-icon" />
        </router-link>
      </div>
      <div class="logo-placeholder"></div>
    </nav>

    <!-- 路由內容 -->
    <router-view />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { PhImage, PhVideo } from '@phosphor-icons/vue'

const route = useRoute()
const isImage = computed(() => route.path.startsWith('/image'))
const isVideo = computed(() => route.path.startsWith('/video'))
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 20px;
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  background-color: #2d2d2d;
  padding: 15px 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  width: 80%;
  max-width: 1500px;
}

.logo {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.nav-center {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.logo-placeholder {
  visibility: hidden;
}

.mobile-icon {
  display: none;
}

.desktop-text {
  display: block;
}

@media (max-width: 768px) {
  .nav {
    grid-template-columns: auto auto;
    justify-content: space-between;
    width: 100%;
    padding: 12px 12px;
  }

  .logo-placeholder {
    display: none;
  }

  .mobile-icon {
    display: block;
  }

  .desktop-text {
    display: none;
  }

  .nav-center {
    order: 2;
    gap: 10px;
  }

  .logo {
    order: 1;
    margin-bottom: 0;
  }

  .nav-btn {
    padding: 8px 12px;
  }
}

.nav-btn {
  text-decoration: none;
  color: #b3b3b3;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-align: center;
}

.nav-btn:hover {
  background-color: #404040;
  color: #ffffff;
}

.nav-btn.active {
  background-color: #4a4a4a;
  color: #ffffff;
}

.nav-btn.active:hover {
  background-color: #5a5a5a;
  color: #ffffff;
}
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  height: 100%;
  width: 100%;
}
</style>

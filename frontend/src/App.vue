<script setup>
import { computed, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import WelcomePage from './pages/WelcomePage.vue'
import DashboardPage from './pages/DashboardPage.vue'
import MakePage from './pages/MakePage.vue'
import ImageMakePage from './pages/ImageMakePage.vue'

const routePath = ref(window.location.pathname)
const dashboardRefreshKey = ref(0)
const makeRefreshKey = ref(0)
const imageMakeRefreshKey = ref(0)

const isMakePage = computed(() => routePath.value.startsWith('/make'))
const isImageMakePage = computed(() => routePath.value.startsWith('/image-make'))
const isDashboardPage = computed(() => routePath.value.startsWith('/dashboard'))
const activePage = computed(() => {
  if (isImageMakePage.value) return 'image-make'
  if (isMakePage.value) return 'make'
  if (isDashboardPage.value) return 'dashboard'
  return 'welcome'
})

function refreshActivePage() {
  if (isImageMakePage.value) {
    imageMakeRefreshKey.value += 1
    return
  }
  if (isMakePage.value) {
    makeRefreshKey.value += 1
    return
  }
  if (isDashboardPage.value) {
    dashboardRefreshKey.value += 1
  }
}
</script>

<template>
  <div class="app-shell">
    <AppHeader :active-page="activePage" @refresh="refreshActivePage" />

    <ImageMakePage v-if="isImageMakePage" :key="imageMakeRefreshKey" />

    <MakePage v-else-if="isMakePage" :key="makeRefreshKey" />

    <DashboardPage v-else-if="isDashboardPage" :key="dashboardRefreshKey" />

    <WelcomePage v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import { routes } from './router'

const route = useRoute()

const isDark = ref(false)
const useMode = ref<'native' | 'vue'>('native')
const rendererType = ref<'canvas' | 'svg'>('canvas')

const pageTitle = computed(() => {
  const current = routes.find(r => r.path === route.path)
  return (current?.meta?.title as string) || '示例'
})

watch(isDark, (dark) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}, { immediate: true })

provide('isDark', isDark)
provide('useMode', useMode)
provide('rendererType', rendererType)
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">@ldesign/chart</div>
        <div class="sidebar-subtitle">Playground</div>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="r in routes.filter(r => r.path !== '/')"
          :key="r.path"
          :to="r.path"
          class="nav-item"
          :class="{ active: route.path === r.path }"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <template v-if="r.meta?.icon === 'line'">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </template>
            <template v-else-if="r.meta?.icon === 'bar'">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </template>
            <template v-else-if="r.meta?.icon === 'pie'">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
              <path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </template>
          </svg>
          <span>{{ r.meta?.title }}</span>
        </router-link>
      </nav>
    </aside>

    <main class="main-content">
      <header class="toolbar">
        <div class="toolbar-left">
          <span class="toolbar-hint">使用模式与渲染器：</span>
        </div>
        <div class="toolbar-right">
          <div class="btn-group">
            <button class="btn" :class="{ active: useMode === 'native' }" @click="useMode = 'native'">原生 JS</button>
            <button class="btn" :class="{ active: useMode === 'vue' }" @click="useMode = 'vue'">Vue</button>
          </div>
          <div class="btn-group">
            <button class="btn" :class="{ active: rendererType === 'canvas' }" @click="rendererType = 'canvas'">Canvas</button>
            <button class="btn" :class="{ active: rendererType === 'svg' }" @click="rendererType = 'svg'">SVG</button>
          </div>
          <button class="icon-btn" @click="isDark = !isDark" :title="isDark ? '亮色模式' : '暗色模式'">
            <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
        </div>
      </header>
      <div class="content-area">
        <router-view v-slot="{ Component }">
          <component :is="Component" :use-mode="useMode" :renderer-type="rendererType" :is-dark="isDark" />
        </router-view>
      </div>
    </main>
  </div>
</template>

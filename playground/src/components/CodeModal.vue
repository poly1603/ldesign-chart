<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml)

const props = defineProps<{
  visible: boolean
  title: string
  code: string
  language: 'javascript' | 'vue'
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)

const highlightedCode = computed(() => {
  const lang = props.language === 'vue' ? 'xml' : 'javascript'
  try {
    return hljs.highlight(props.code, { language: lang }).value
  } catch {
    return props.code
  }
})

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    emit('close')
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.visible, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              {{ title }}
              <span :class="['tag', language === 'vue' ? 'tag-vue' : 'tag-native']">
                {{ language === 'vue' ? 'Vue' : 'JS' }}
              </span>
            </div>
            <button class="modal-close" @click="emit('close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <pre><code v-html="highlightedCode"></code></pre>
          </div>
          <div class="modal-footer">
            <button :class="['btn-copy', { copied }]" @click="copyCode">
              <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ copied ? '已复制' : '复制代码' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-content, .modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-content, .modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import ChartExample from './ChartExample.vue'

interface AnimationOption {
  value: string
  label: string
  desc: string
}

interface Example {
  id: string
  title: string
  options: any
  nativeCode: string
  vueCode: string
}

const props = withDefaults(defineProps<{
  title: string
  description: string
  examples: Example[]
  useMode: 'native' | 'vue'
  rendererType: 'canvas' | 'svg'
  isDark: boolean
  // 动画选项（可选）
  animationTypes?: AnimationOption[]
  selectedAnimation?: string
  // 布局模式：header（动画在头部右侧）或 sidebar（动画在右侧面板）
  layout?: 'header' | 'sidebar'
}>(), {
  layout: 'header'
})

const emit = defineEmits<{
  (e: 'update:selectedAnimation', value: string): void
  (e: 'refresh', index: number): void
}>()

const exampleCount = computed(() => props.examples.length)
const hasAnimations = computed(() => props.animationTypes && props.animationTypes.length > 0)

defineExpose({ exampleCount })
</script>

<template>
  <div class="chart-page" :class="{ 'with-sidebar': layout === 'sidebar' && hasAnimations }">
    <div class="page-content">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <div class="title-row">
            <h2 class="page-title">{{ title }}</h2>
            <span class="example-count">{{ exampleCount }} 个示例</span>
          </div>
          <p class="page-desc" v-html="description"></p>
        </div>
        
        <!-- 右侧动画选择器（header 模式） -->
        <div v-if="hasAnimations && layout === 'header'" class="header-right">
          <div class="animation-selector">
            <span class="selector-label">动画效果</span>
            <div class="animation-options">
              <label 
                v-for="anim in animationTypes" 
                :key="anim.value" 
                class="animation-option"
                :class="{ active: selectedAnimation === anim.value }"
              >
                <input 
                  type="radio" 
                  :value="anim.value" 
                  :checked="selectedAnimation === anim.value"
                  @change="emit('update:selectedAnimation', anim.value)"
                />
                <span class="option-content">
                  <span class="option-label">{{ anim.label }}</span>
                  <span class="option-desc">{{ anim.desc }}</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 示例网格 -->
      <div class="examples-grid">
        <ChartExample
          v-for="(example, index) in examples"
          :key="example.id"
          :title="example.title"
          :options="example.options"
          :native-code="example.nativeCode"
          :vue-code="example.vueCode"
          :use-mode="useMode"
          :renderer-type="rendererType"
          :is-dark="isDark"
          @refresh="emit('refresh', index)"
        />
      </div>
    </div>

    <!-- 右侧动画面板（sidebar 模式） -->
    <div v-if="hasAnimations && layout === 'sidebar'" class="animation-panel">
      <h3 class="panel-title">动画效果</h3>
      <div class="animation-options vertical">
        <label
          v-for="anim in animationTypes"
          :key="anim.value"
          class="animation-option"
          :class="{ active: selectedAnimation === anim.value }"
        >
          <input
            type="radio"
            :value="anim.value"
            :checked="selectedAnimation === anim.value"
            @change="emit('update:selectedAnimation', anim.value)"
            class="radio-input"
          />
          <div class="option-content">
            <span class="option-label">{{ anim.label }}</span>
            <span class="option-desc">{{ anim.desc }}</span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-page {
  padding: 20px;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.example-count {
  background: var(--primary-color, #409eff);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
}

.page-desc {
  margin: 0;
  color: var(--text-secondary, #666);
  font-size: 14px;
}

.header-right {
  flex-shrink: 0;
}

.animation-selector {
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 8px;
  padding: 12px 16px;
}

.selector-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #666);
  margin-bottom: 8px;
}

.animation-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.animation-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--bg-primary, white);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.animation-option:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.animation-option.active {
  border-color: var(--primary-color, #409eff);
  background: rgba(64, 158, 255, 0.05);
}

.animation-option input {
  display: none;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-label {
  font-weight: 500;
  font-size: 12px;
  color: var(--text-primary, #333);
}

.option-desc {
  color: var(--text-secondary, #999);
  font-size: 10px;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

/* Sidebar 布局 */
.chart-page.with-sidebar {
  display: flex;
  gap: 24px;
}

.chart-page.with-sidebar .page-content {
  flex: 1;
  min-width: 0;
}

.animation-panel {
  width: 180px;
  flex-shrink: 0;
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 8px;
  padding: 16px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.panel-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.animation-options.vertical {
  flex-direction: column;
  gap: 8px;
}

.animation-options.vertical .animation-option {
  width: 100%;
}

.radio-input {
  display: none;
}

/* 响应式 */
@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
  }
  
  .header-right {
    width: 100%;
  }
  
  .animation-options {
    flex-wrap: wrap;
  }

  .chart-page.with-sidebar {
    flex-direction: column;
  }

  .animation-panel {
    width: 100%;
    position: static;
  }

  .animation-options.vertical {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .animation-options.vertical .animation-option {
    width: auto;
  }
}
</style>

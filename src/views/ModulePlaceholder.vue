<template>
  <div class="page-container">
    <div class="breadcrumb">
      <template v-if="sectionLabel">
        <span class="crumb-segment">{{ sectionLabel }}</span>
        <el-icon class="crumb-sep"><span class="slash">/</span></el-icon>
      </template>
      <span :class="sectionLabel ? 'crumb-leaf' : 'crumb-segment'">{{ pageTitle }}</span>
    </div>
    <h1 class="page-title">{{ pageTitle }}</h1>
    <div class="content-module">
      <p class="hint">该模块界面尚未实现，后续将按需求补充具体内容。</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => route.meta.title || '模块')
const sectionLabel = computed(() => {
  const s = route.meta.section
  if (s == null || s === '') return null
  if (s === route.meta.title) return null
  return s
})
</script>

<style scoped>
.page-container {
  background: var(--neutral-2);
  padding: 16px;
  min-height: 100%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 12px;
  font-family: var(--font-family);
  color: var(--neutral-9);
  margin-bottom: 8px;
}

.crumb-segment {
  color: var(--neutral-10);
  font-weight: 600;
}

.crumb-leaf {
  color: var(--neutral-9);
}

.crumb-sep {
  font-size: 12px;
  color: var(--neutral-7);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.slash {
  font-style: normal;
  line-height: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--neutral-10);
  margin: 0 0 16px;
}

.content-module {
  background: var(--neutral-0);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-1);
}

.hint {
  margin: 0;
  font-size: 12px;
  color: var(--neutral-9);
  line-height: 1.5;
}
</style>

<template>
  <div class="placeholder-page">
    <div class="placeholder-card">
      <h2 class="placeholder-title">{{ title }}</h2>
      <p class="placeholder-text">该模块为机构端原型占位页面，后续按业务需求接入真实功能。</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta?.title || '占位页面')
</script>

<style scoped>
.placeholder-page {
  padding: 16px;
}

.placeholder-card {
  background: #fff;
  border: 1px solid var(--neutral-4);
  padding: 24px;
}

.placeholder-title {
  margin: 0 0 10px;
  font-size: 18px;
  color: var(--neutral-10);
}

.placeholder-text {
  margin: 0;
  font-size: 12px;
  color: var(--neutral-9);
}
</style>

<template>
  <div class="page-container">
    <div class="breadcrumb">
      <span class="crumb-segment">密钥管理</span>
      <el-icon class="crumb-sep"><span class="slash">/</span></el-icon>
      <span class="crumb-leaf">库内密钥</span>
    </div>
    <h1 class="page-title">库内密钥</h1>
    <KeysListInstitutionLibraryKey />
  </div>
</template>

<script setup>
import KeysListInstitutionLibraryKey from '../keys/KeysListInstitutionLibraryKey.vue'
import '../keys/keyListCommon.css'
</script>

<style scoped>
.page-container {
  background: var(--neutral-1);
  padding: 16px;
  min-height: 100%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--neutral-9);
  margin-bottom: 6px;
}

.crumb-leaf {
  color: var(--neutral-10);
  font-weight: 500;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  color: var(--neutral-10);
  margin: 0 0 16px;
}
</style>

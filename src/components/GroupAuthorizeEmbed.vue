<template>
  <div v-if="group" class="gae-root">
    <div class="pad-x broad-bottom">
      <h2 class="section-title section-title--accent">
        <span class="section-title__bar" aria-hidden="true" />
        授权机构信息
      </h2>
      <p class="gae-group-hint">「{{ group.name }}」分组授权机构</p>
      <el-form :inline="true" :model="query" class="filter-form auth-search-form" @submit.prevent>
        <el-form-item label="机构名称">
          <el-input v-model="query.keyword" placeholder="请输入机构名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="启用" value="启用" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="auth-search-btn">查询</el-button>
          <el-button @click="handleReset" class="auth-search-btn">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="toolbar auth-toolbar-actions">
        <el-button type="primary" @click="onAddAuth">新增授权机构</el-button>
        <el-button :disabled="!selection.length" @click="onCancelAuth">取消授权</el-button>
      </div>
    </div>

    <div class="detail-main-board__sheet">
      <el-table :data="pagedRows" class="auth-table" row-key="id" style="width: 100%" @selection-change="onSelectionChange">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="orgName" label="机构名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="orgCode" label="机构代号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="adminAccount" label="管理员账号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="maxUsers" label="最大用户数" width="100" align="center" />
        <el-table-column prop="keyCount" label="分配密钥数" width="100" align="center" />
        <el-table-column label="机构状态" width="100">
          <template #default="{ row }">
            <span class="status-dot" :class="row.orgStatus === '启用' ? 'success' : 'muted'" />
            {{ row.orgStatus }}
          </template>
        </el-table-column>
        <el-table-column prop="authTime" label="授权时间" width="168" />
      </el-table>
    </div>

    <div class="pager-wrap pad-x broad-top">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="resource-pager"
        :total="filteredRows.length"
        :page-sizes="[10, 20, 30, 50, 100]"
        layout="total, prev, pager, next, sizes"
      />
    </div>

    <AddAuthorizedOrgDialog v-model="addAuthVisible" :group-id="props.groupId" @success="onAddAuthSuccess" />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { findGroupById, listAuthorizedForGroup } from '../mock/cryptoDeviceResourceMock.js'
import AddAuthorizedOrgDialog from './AddAuthorizedOrgDialog.vue'

const props = defineProps({
  groupId: { type: String, required: true }
})

const emit = defineEmits(['updated'])

const group = computed(() => findGroupById(props.groupId))

const query = reactive({ keyword: '', status: '' })
const applied = reactive({ ...query })

function handleSearch() {
  Object.assign(applied, query)
  page.value = 1
}

function handleReset() {
  query.keyword = ''
  query.status = ''
  Object.assign(applied, query)
  page.value = 1
}

const rows = computed(() => listAuthorizedForGroup(props.groupId))

const filteredRows = computed(() => {
  return rows.value.filter((r) => {
    if (applied.keyword) {
      const k = applied.keyword
      if (!r.orgName.includes(k) && !r.orgCode.includes(k)) return false
    }
    if (applied.status && r.orgStatus !== applied.status) return false
    return true
  })
})

const page = ref(1)
const pageSize = ref(10)
const selection = ref([])

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

watch([rows, () => props.groupId], () => {
  page.value = 1
  selection.value = []
})

function onSelectionChange(val) {
  selection.value = val
}

const addAuthVisible = ref(false)

function onAddAuth() {
  addAuthVisible.value = true
}

function onAddAuthSuccess() {
  emit('updated')
}

function onCancelAuth() {
  ElMessage.info('取消授权为占位能力，后续接入接口。')
}
</script>

<style scoped>
.gae-root {
  padding-top: 0;
  padding-bottom: 0;
}

.pad-x {
  padding-left: 16px;
  padding-right: 16px;
}

.broad-bottom {
  border-bottom: 1px solid var(--neutral-4);
}

.broad-top {
  border-top: 1px solid var(--neutral-4);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--neutral-10);
  margin: 0 0 8px;
}

.section-title--accent {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title__bar {
  width: 3px;
  height: 14px;
  background: var(--brand-6);
  border-radius: 1px;
  flex-shrink: 0;
}

.gae-group-hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--neutral-8);
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 8px;
  margin-left: 0 !important;
}

.auth-search-form {
  font-size: 12px;
}

.auth-search-form :deep(.el-form-item__label) {
  font-size: 12px;
  line-height: 32px;
  height: 32px;
}

.auth-search-form :deep(.el-form-item__content) {
  font-size: 12px;
  line-height: 32px;
}

.auth-search-form :deep(.el-input__wrapper),
.auth-search-form :deep(.el-input__inner),
.auth-search-form :deep(.el-select__wrapper),
.auth-search-form :deep(.el-select__placeholder),
.auth-search-form :deep(.el-select__selected-item),
.auth-search-form :deep(.el-select .el-input__inner) {
  font-size: 12px !important;
}

.auth-search-form :deep(.el-button) {
  font-size: 12px;
  padding: 2px 16px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.auth-toolbar-actions :deep(.el-button) {
  font-size: 12px;
  padding: 2px 16px;
}

.detail-main-board__sheet {
  width: 100%;
}

.auth-table {
  font-size: 12px;
  color: var(--neutral-9);
  --el-table-border-color: transparent;
  --el-table-border: none;
}

.auth-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.auth-table :deep(.el-table__border-left-patch),
.auth-table :deep(.el-table__border-right-patch) {
  display: none;
}

.auth-table :deep(thead .el-table__cell) {
  background-color: #f5f5f5 !important;
  color: var(--neutral-10) !important;
  border-right: none !important;
  border-left: none !important;
  border-top: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.auth-table :deep(tbody .el-table__cell) {
  background-color: #ffffff !important;
  border-right: none !important;
  border-left: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.auth-table :deep(tbody tr:hover > td.el-table__cell) {
  background-color: #ffffff !important;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.status-dot.success {
  background: var(--success-6);
}

.status-dot.muted {
  background: var(--neutral-6);
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  padding-bottom: 12px;
  background: var(--neutral-0);
}

.resource-pager {
  flex-wrap: wrap;
  row-gap: 8px;
  justify-content: flex-end;
  padding: 0;
  font-size: 12px;
}

.resource-pager :deep(.el-pagination__total) {
  margin-right: 12px;
  color: var(--neutral-10);
  font-size: 12px;
}

.resource-pager :deep(.el-pager li),
.resource-pager :deep(.btn-prev),
.resource-pager :deep(.btn-next) {
  border-radius: 4px !important;
  font-size: 12px;
}

.resource-pager :deep(.el-pagination__sizes .el-select .el-input__wrapper),
.resource-pager :deep(.el-pagination__sizes .el-select__wrapper) {
  border-color: var(--brand-6) !important;
  border-radius: 4px !important;
  font-size: 12px;
}

.auth-search-btn {
  font-size: 12px;
  padding: 2px 16px;
}
</style>

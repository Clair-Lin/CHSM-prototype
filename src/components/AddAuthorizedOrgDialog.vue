<template>
  <el-dialog
    :model-value="modelValue"
    title="新增授权机构"
    width="920px"
    align-center
    destroy-on-close
    class="add-auth-dialog"
    append-to-body
    @update:model-value="$emit('update:modelValue', $event)"
    @open="onDialogOpen"
    @closed="onDialogClosed"
  >
    <div class="add-auth-dialog-body">
      <div class="add-auth-dialog-main">
        <el-form
          :inline="true"
          :model="addPickerQuery"
          class="add-auth-filter-form auth-search-form"
          label-width="auto"
          @submit.prevent
        >
          <el-form-item label="机构名称" class="add-auth-filter-form__item">
            <el-input
              v-model="addPickerQuery.keyword"
              placeholder="请输入机构名称"
              clearable
              class="add-auth-filter-input"
            />
          </el-form-item>
          <el-form-item label="状态" class="add-auth-filter-form__item">
            <el-select v-model="addPickerQuery.status" placeholder="请选择状态" clearable class="add-auth-filter-select">
              <el-option label="启用" value="启用" />
              <el-option label="停用" value="停用" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="add-auth-filter-actions">
          <el-button type="primary" @click="handleAddPickerSearch" class="auth-search-btn">查询</el-button>
          <el-button class="add-auth-btn-reset auth-search-btn" @click="handleAddPickerReset">重置</el-button>
        </div>
        <el-table
          ref="addPickerTableRef"
          :data="addPickerPagedRows"
          class="add-auth-picker-table"
          row-key="id"
          style="width: 100%"
          @selection-change="onAddPickerSelectionChange"
        >
          <el-table-column type="selection" width="48" reserve-selection />
          <el-table-column prop="name" label="机构名称" min-width="100" show-overflow-tooltip />
          <el-table-column prop="code" label="机构代号" min-width="100" show-overflow-tooltip />
          <el-table-column prop="adminAccount" label="管理员账号" min-width="100" show-overflow-tooltip />
          <el-table-column label="机构状态" width="100">
            <template #default="{ row }">
              <span class="status-dot" :class="row.orgStatus === '启用' ? 'success' : 'muted'" />
              {{ row.orgStatus }}
            </template>
          </el-table-column>
        </el-table>
        <div class="add-auth-picker-pager">
          <el-pagination
            v-model:current-page="addPickerPage"
            v-model:page-size="addPickerPageSize"
            class="resource-pager"
            :total="addPickerFiltered.length"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, prev, pager, next, sizes"
          />
        </div>
      </div>
      <div class="add-auth-dialog-side">
        <p class="add-auth-side-title">
          已选 <span class="add-auth-side-count">{{ addPickerSelection.length }}</span> 个机构
        </p>
        <div v-if="!addPickerSelection.length" class="add-auth-side-empty">无选择的机构!</div>
        <ul v-else class="add-auth-side-list">
          <li v-for="o in addPickerSelection" :key="o.id" class="add-auth-side-item">{{ o.name }}</li>
        </ul>
      </div>
    </div>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submitAddAuth">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { appendAuthorizedOrgsForGroup, listAuthorizedForGroup } from '../mock/cryptoDeviceResourceMock.js'
import { organizationMock } from '../mock/organizationMock.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  groupId: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'success'])

const addPickerTableRef = ref(null)
const addPickerQuery = reactive({ keyword: '', status: '' })
const addPickerApplied = reactive({ keyword: '', status: '' })
const addPickerPage = ref(1)
const addPickerPageSize = ref(10)
const addPickerSelection = ref([])

const addPickerBaseList = computed(() => {
  const gid = props.groupId
  if (!gid) return []
  const codes = new Set((listAuthorizedForGroup(gid) || []).map((a) => a.orgCode))
  return organizationMock.rows.filter((o) => !o.builtin && !codes.has(o.code))
})

const addPickerFiltered = computed(() => {
  return addPickerBaseList.value.filter((o) => {
    if (addPickerApplied.keyword) {
      const k = addPickerApplied.keyword
      if (!o.name.includes(k) && !o.code.includes(k)) return false
    }
    if (addPickerApplied.status && o.orgStatus !== addPickerApplied.status) return false
    return true
  })
})

const addPickerPagedRows = computed(() => {
  const start = (addPickerPage.value - 1) * addPickerPageSize.value
  return addPickerFiltered.value.slice(start, start + addPickerPageSize.value)
})

watch(addPickerPageSize, () => {
  addPickerPage.value = 1
})

watch(addPickerFiltered, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / addPickerPageSize.value) || 1)
  if (addPickerPage.value > maxPage) addPickerPage.value = maxPage
})

watch(
  () => props.groupId,
  () => {
    addPickerPage.value = 1
  }
)

function handleAddPickerSearch() {
  addPickerApplied.keyword = addPickerQuery.keyword
  addPickerApplied.status = addPickerQuery.status
  addPickerPage.value = 1
}

function handleAddPickerReset() {
  addPickerQuery.keyword = ''
  addPickerQuery.status = ''
  addPickerApplied.keyword = ''
  addPickerApplied.status = ''
  addPickerPage.value = 1
}

function onAddPickerSelectionChange(rows) {
  addPickerSelection.value = rows || []
}

function resetPicker() {
  addPickerQuery.keyword = ''
  addPickerQuery.status = ''
  addPickerApplied.keyword = ''
  addPickerApplied.status = ''
  addPickerPage.value = 1
  addPickerPageSize.value = 10
  addPickerSelection.value = []
}

function onDialogOpen() {
  resetPicker()
  nextTick(() => {
    addPickerTableRef.value?.clearSelection?.()
  })
}

function onDialogClosed() {
  resetPicker()
  nextTick(() => {
    addPickerTableRef.value?.clearSelection?.()
  })
}

function close() {
  emit('update:modelValue', false)
}

function submitAddAuth() {
  if (!props.groupId) {
    ElMessage.warning('分组信息无效')
    return
  }
  if (!addPickerSelection.value.length) {
    ElMessage.warning('请至少选择一个机构')
    return
  }
  const n = appendAuthorizedOrgsForGroup(props.groupId, addPickerSelection.value)
  if (n <= 0) {
    ElMessage.warning('所选机构均已授权，无需重复添加')
    return
  }
  ElMessage.success(`已新增 ${n} 个授权机构（原型数据）`)
  emit('update:modelValue', false)
  emit('success')
}
</script>

<style scoped>
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
.auth-search-form :deep(.el-select__wrapper) {
  font-size: 12px !important;
}

.add-auth-filter-actions :deep(.el-button) {
  font-size: 12px;
  padding: 0px 10px;
}

.add-auth-dialog-body {
  display: flex;
  align-items: stretch;
  gap: 0;
  min-height: 320px;
  margin: -8px 0 0;
}

.add-auth-dialog-main {
  flex: 3;
  min-width: 0;
  padding-right: 16px;
}

.add-auth-dialog-side {
  flex: 1;
  min-width: 168px;
  max-width: 220px;
  border-left: 1px solid var(--neutral-4);
  padding-left: 16px;
  display: flex;
  flex-direction: column;
}

.add-auth-filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 8px;
  row-gap: 6px;
  width: 100%;
  margin: 0;
  padding: 0;
  font-size: 12px;
}

.add-auth-filter-form :deep(.el-form-item) {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  margin: 0;
  margin-bottom: 10px;
}

.add-auth-filter-form :deep(.el-form-item__label-wrap) {
  margin: 0 !important;
}

.add-auth-filter-form :deep(.el-form-item__label) {
  float: none;
  height: 32px;
  line-height: 32px;
  padding: 0 4px 0 0;
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 12px;
}

.add-auth-filter-form :deep(.el-form-item__content) {
  display: inline-flex;
  align-items: center;
  margin-left: 0 !important;
  line-height: 32px;
}

.add-auth-filter-input {
  width: 200px;
}

.add-auth-filter-select {
  width: 140px;
}

.add-auth-filter-actions {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.add-auth-btn-reset {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: var(--neutral-0);
}

.auth-search-btn {
  font-size: 12px;
  padding: 2px 16px;
}

.add-auth-btn-reset:hover {
  border-color: var(--el-color-primary-light-3);
  color: var(--el-color-primary-light-3);
  background: var(--el-color-primary-light-9);
}

.add-auth-picker-table {
  font-size: 12px;
  color: var(--neutral-10);
  --el-table-border-color: transparent;
  --el-table-border: none;
}

.add-auth-picker-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.add-auth-picker-table :deep(thead .el-table__cell) {
  background-color: #f5f5f5 !important;
  color: var(--neutral-10) !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.add-auth-picker-table :deep(tbody .el-table__cell) {
  background-color: #fff !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.add-auth-picker-pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  font-size: 12px;
}

.add-auth-picker-pager :deep(.el-pagination__total),
.add-auth-picker-pager :deep(.el-pager li),
.add-auth-picker-pager :deep(.btn-prev),
.add-auth-picker-pager :deep(.btn-next),
.add-auth-picker-pager :deep(.el-select .el-input__wrapper),
.add-auth-picker-pager :deep(.el-select__wrapper) {
  font-size: 12px;
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
}

.resource-pager :deep(.el-pagination__sizes .el-select .el-input__wrapper),
.resource-pager :deep(.el-pagination__sizes .el-select__wrapper) {
  border-color: var(--brand-6) !important;
  border-radius: 4px !important;
}

.add-auth-side-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--neutral-10);
}

.add-auth-side-count {
  color: var(--el-color-danger);
  font-weight: 600;
}

.add-auth-side-empty {
  flex: 1;
  font-size: 12px;
  color: var(--neutral-8);
  line-height: 1.6;
}

.add-auth-side-list {
  margin: 0;
  padding: 0 0 0 16px;
  font-size: 12px;
  color: var(--neutral-10);
  line-height: 1.7;
}

.add-auth-side-item {
  margin-bottom: 4px;
}
</style>

<style>
.add-auth-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.add-auth-dialog .el-dialog__header {
  margin: 0;
  padding: 12px 16px;
  background: #e8edf3;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.add-auth-dialog .el-dialog__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.add-auth-dialog .el-dialog__headerbtn {
  top: 10px;
  right: 12px;
}

.add-auth-dialog .el-dialog__body {
  padding: 16px 16px 8px;
}

.add-auth-dialog .el-dialog__footer {
  padding: 8px 16px 16px;
}

.add-auth-dialog .el-dialog__footer .el-button {
  font-size: 12px;
  padding: 2px 16px;
}
</style>

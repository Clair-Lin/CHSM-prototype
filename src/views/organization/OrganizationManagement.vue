<template>
  <div class="page-container">
    <div class="breadcrumb">
      <span class="crumb-leaf">机构管理</span>
    </div>
    <h1 class="page-title">机构管理</h1>

    <div class="content-module filter-card">
      <el-form :inline="true" :model="query" class="filter-form" label-width="auto" @submit.prevent>
        <el-form-item label="机构名称">
          <el-input v-model="query.name" placeholder="请输入机构名称" clearable class="filter-input" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option label="启用" value="启用" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button class="btn-reset-outline" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-module table-card">
      <div class="table-card__toolbar">
        <el-button type="primary" @click="onAdd">
          <el-icon class="btn-plus"><Plus /></el-icon>
          新增机构
        </el-button>
      </div>
      <div class="table-card__sheet">
        <el-table :data="pagedRows" class="org-table" style="width: 100%" row-key="id">
          <el-table-column prop="name" label="机构名称" min-width="100" show-overflow-tooltip />
          <el-table-column prop="code" label="机构代号" min-width="88" show-overflow-tooltip />
          <el-table-column label="机构联系人" width="100" show-overflow-tooltip>
            <template #default="{ row }">{{ formatDash(row.contact) }}</template>
          </el-table-column>
          <el-table-column label="手机号" width="108" show-overflow-tooltip>
            <template #default="{ row }">{{ formatDash(row.mobile) }}</template>
          </el-table-column>
          <el-table-column prop="adminAccount" label="管理员账号" min-width="108" show-overflow-tooltip />
          <el-table-column prop="maxUsers" label="最大用户数" width="92" align="center" />
          <el-table-column prop="keyCount" label="分配密钥数" width="92" align="center" />
          <el-table-column prop="serviceMonths" label="服务时长(月)" width="108" align="center" />
          <el-table-column label="机构状态" width="100">
            <template #default="{ row }">
              <span class="status-cell">
                <span
                  class="status-dot"
                  :class="row.orgStatus === '启用' ? 'status-dot--success' : 'status-dot--muted'"
                  aria-hidden="true"
                />
                {{ row.orgStatus }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="thirdPartyAuth" label="第三方认证" width="100" align="center" />
          <el-table-column prop="createdAt" label="创建时间" width="168" />
          <el-table-column prop="expiresAt" label="到期时间" width="168" />
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <div class="ops-row">
                <el-button type="primary" link class="ops-link" @click="onEdit(row)">编辑</el-button>
                <el-button
                  v-if="!row.builtin"
                  type="primary"
                  link
                  class="ops-link"
                  @click="onToggleDisable(row)"
                >
                  {{ row.orgStatus === '启用' ? '禁用' : '启用' }}
                </el-button>
                <el-button type="primary" link class="ops-link" @click="onResetPwd(row)">重置密码</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          class="resource-pager"
          :total="filteredRows.length"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, prev, pager, next, sizes"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { organizationMock, setOrganizationStatus } from '../../mock/organizationMock.js'

const query = reactive({ name: '', status: '' })
const applied = reactive({ ...query })

const page = ref(1)
const pageSize = ref(10)

function handleSearch() {
  Object.assign(applied, query)
  page.value = 1
}

function handleReset() {
  query.name = ''
  query.status = ''
  Object.assign(applied, query)
  page.value = 1
}

function formatDash(val) {
  return val == null || val === '' ? '--' : val
}

const filteredRows = computed(() => {
  return organizationMock.rows.filter((row) => {
    if (applied.name && !row.name.includes(applied.name) && !row.code.includes(applied.name)) return false
    if (applied.status && row.orgStatus !== applied.status) return false
    return true
  })
})

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

watch(pageSize, () => {
  page.value = 1
})

watch(filteredRows, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / pageSize.value) || 1)
  if (page.value > maxPage) page.value = maxPage
})

function onAdd() {
  ElMessage.info('新增机构为占位能力，后续接入接口。')
}

function onEdit(row) {
  ElMessage.info(`编辑机构「${row.name}」为占位能力。`)
}

function onToggleDisable(row) {
  const willEnable = row.orgStatus !== '启用'
  const verb = willEnable ? '启用' : '禁用'
  ElMessageBox.confirm(`确定${verb}机构「${row.name}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      if (setOrganizationStatus(row.id, willEnable)) ElMessage.success(`已${verb}（原型数据）`)
      else ElMessage.warning('内置机构不可更改状态')
    })
    .catch(() => {})
}

function onResetPwd(row) {
  ElMessageBox.confirm(`确定重置机构「${row.name}」管理员密码吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => ElMessage.success('已发起重置（原型）'))
    .catch(() => {})
}
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
  flex-wrap: wrap;
  gap: 4px;
  font-size: 12px;
  font-family: var(--font-family);
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

.content-module {
  background: var(--neutral-0);
  padding: 12px;
  box-shadow: var(--shadow-1);
}

.filter-card {
  margin-bottom: 12px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 12px;
  margin-right: 16px;
}

.filter-input {
  width: 200px;
}

.filter-select {
  width: 120px;
}

.btn-reset-outline {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: var(--neutral-0);
}

.btn-reset-outline:hover {
  border-color: var(--el-color-primary-light-3);
  color: var(--el-color-primary-light-3);
  background: var(--el-color-primary-light-9);
}

.table-card {
  padding: 0;
}

.table-card__toolbar {
  padding: 15px;
}

.table-card__toolbar :deep(.el-button) {
  padding: 2px 16px;
  font-size: 12px;
}

.btn-plus {
  margin-right: 4px;
  vertical-align: middle;
}

.table-card__sheet {
  width: 100%;
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot--success {
  background: var(--el-color-success);
}

.status-dot--muted {
  background: var(--neutral-6);
}

.ops-row {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.ops-link {
  padding: 0;
  font-size: 12px;
  height: auto;
  min-height: 0;
}

.org-table {
  font-size: 12px;
  color: var(--neutral-10);
  --el-table-border-color: transparent;
  --el-table-border: none;
}

.org-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.org-table :deep(.el-table__border-left-patch),
.org-table :deep(.el-table__border-right-patch) {
  display: none;
}

.org-table :deep(thead .el-table__cell) {
  background-color: #f5f5f5 !important;
  color: var(--neutral-10) !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.org-table :deep(tbody .el-table__cell) {
  background-color: #ffffff !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.org-table :deep(tbody tr:hover > td.el-table__cell) {
  background-color: #ffffff !important;
}

.org-table :deep(.el-table__fixed-right::before) {
  background-color: transparent;
}

.org-table :deep(.el-table__fixed-right) {
  box-shadow: -8px 0 12px -8px rgba(0, 0, 0, 0.06);
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 12px 12px 12px 0;
  background: var(--neutral-0);
}

.resource-pager {
  flex-wrap: wrap;
  row-gap: 8px;
  justify-content: flex-end;
}

.resource-pager :deep(.el-pagination__total) {
  margin-right: 12px;
  color: var(--neutral-10);
}

.resource-pager :deep(.btn-prev),
.resource-pager :deep(.btn-next),
.resource-pager :deep(.el-pager li) {
  border-radius: 4px !important;
}

.resource-pager :deep(.el-pagination__sizes .el-select .el-input__wrapper),
.resource-pager :deep(.el-pagination__sizes .el-select__wrapper) {
  border-color: var(--brand-6) !important;
  border-radius: 4px !important;
}
</style>

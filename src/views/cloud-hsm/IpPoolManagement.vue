<template>
  <div class="page-container">
    <div class="breadcrumb">
      <span class="crumb-segment">云密码机管理</span>
      <el-icon class="crumb-sep"><span class="slash">/</span></el-icon>
      <span class="crumb-leaf">IP池管理</span>
    </div>
    <h1 class="page-title">IP池管理</h1>

    <div class="filter-strip">
      <el-form :inline="true" :model="query" class="filter-form" label-width="auto" @submit.prevent>
        <el-form-item label="IP池名称" class="filter-form__item">
          <el-input v-model="query.name" placeholder="请输入IP池名称" clearable class="filter-input" />
        </el-form-item>
        <el-form-item class="filter-form__item filter-form__actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button class="btn-reset-outline" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-module table-card">
      <div class="table-card__toolbar">
        <el-button type="primary" @click="openAdd">新增</el-button>
      </div>
      <div class="table-card__sheet">
        <el-table :data="pagedRows" class="vsm-table" style="width: 100%" row-key="id">
          <el-table-column prop="name" label="IP池名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="startIp" label="开始IP" min-width="130" show-overflow-tooltip />
          <el-table-column prop="endIp" label="结束IP" min-width="130" show-overflow-tooltip />
          <el-table-column prop="gateway" label="网关地址" min-width="130" show-overflow-tooltip />
          <el-table-column prop="subnetMask" label="子网掩码" width="120" show-overflow-tooltip />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <span class="status-cell">
                <span class="status-dot" :class="row.enabled ? 'status-dot--success' : 'status-dot--muted'" aria-hidden="true" />
                <span>{{ row.enabled ? '启用' : '停用' }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="168" />
          <el-table-column label="操作" fixed="right" width="120">
            <template #default="{ row }">
              <div class="ops-row">
                <el-button type="primary" link class="ops-link" @click="openEdit(row)">编辑</el-button>
                <el-button type="primary" link class="ops-link" @click="onDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '新增IP池' : '编辑IP池'"
      width="520px"
      align-center
      destroy-on-close
      class="ip-pool-dialog"
      @closed="onDialogClosed"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px" class="ip-pool-form">
        <el-form-item label="IP池名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入IP池名称" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="开始IP" prop="startIp">
          <el-input v-model="form.startIp" placeholder="例如 192.168.212.200" />
        </el-form-item>
        <el-form-item label="结束IP" prop="endIp">
          <el-input v-model="form.endIp" placeholder="例如 192.168.212.255" />
        </el-form-item>
        <el-form-item label="网关地址" prop="gateway">
          <el-input v-model="form.gateway" placeholder="例如 192.168.212.1" />
        </el-form-item>
        <el-form-item label="子网掩码" prop="subnetMask">
          <el-input v-model="form.subnetMask" placeholder="例如 255.255.255.0" />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-radio-group v-model="form.enabled">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ipPoolResourceMock } from '../../mock/ipPoolMock.js'

const query = reactive({ name: '' })
const applied = reactive({ ...query })
const page = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const dialogMode = ref('add')
const editingId = ref('')
const formRef = ref(null)

const form = reactive({
  name: '',
  startIp: '',
  endIp: '',
  gateway: '',
  subnetMask: '',
  enabled: true
})

const ipv4Re =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/

function validateIpv4(_rule, value, callback) {
  if (!value || !String(value).trim()) {
    callback(new Error('请输入合法 IPv4 地址'))
    return
  }
  if (!ipv4Re.test(String(value).trim())) {
    callback(new Error('请输入合法 IPv4 地址'))
    return
  }
  callback()
}

const formRules = {
  name: [{ required: true, message: '请输入IP池名称', trigger: 'blur' }],
  startIp: [{ required: true, validator: validateIpv4, trigger: 'blur' }],
  endIp: [{ required: true, validator: validateIpv4, trigger: 'blur' }],
  gateway: [{ required: true, validator: validateIpv4, trigger: 'blur' }],
  subnetMask: [{ required: true, validator: validateIpv4, trigger: 'blur' }]
}

watch(pageSize, () => {
  page.value = 1
})

function handleSearch() {
  applied.name = query.name
  page.value = 1
}

function handleReset() {
  query.name = ''
  applied.name = ''
  page.value = 1
}

const filteredRows = computed(() => {
  const key = String(applied.name || '').trim()
  if (!key) return ipPoolResourceMock.rows
  return ipPoolResourceMock.rows.filter((row) => row.name.includes(key))
})

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

watch(filteredRows, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / pageSize.value) || 1)
  if (page.value > maxPage) page.value = maxPage
})

function resetForm() {
  form.name = ''
  form.startIp = ''
  form.endIp = ''
  form.gateway = ''
  form.subnetMask = '255.255.255.0'
  form.enabled = true
}

function openAdd() {
  dialogMode.value = 'add'
  editingId.value = ''
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  dialogMode.value = 'edit'
  editingId.value = row.id
  form.name = row.name
  form.startIp = row.startIp
  form.endIp = row.endIp
  form.gateway = row.gateway
  form.subnetMask = row.subnetMask
  form.enabled = row.enabled
  dialogVisible.value = true
}

function onDialogClosed() {
  editingId.value = ''
  formRef.value?.resetFields?.()
}

function formatNow() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function submitForm() {
  formRef.value?.validate((ok) => {
    if (!ok) return
    if (dialogMode.value === 'add') {
      ipPoolResourceMock.rows.push({
        id: `pool-${Date.now()}`,
        name: form.name.trim(),
        startIp: form.startIp.trim(),
        endIp: form.endIp.trim(),
        gateway: form.gateway.trim(),
        subnetMask: form.subnetMask.trim(),
        enabled: form.enabled,
        createdAt: formatNow()
      })
      ElMessage.success('已新增（原型数据）')
    } else {
      const idx = ipPoolResourceMock.rows.findIndex((r) => r.id === editingId.value)
      if (idx >= 0) {
        ipPoolResourceMock.rows[idx] = {
          ...ipPoolResourceMock.rows[idx],
          name: form.name.trim(),
          startIp: form.startIp.trim(),
          endIp: form.endIp.trim(),
          gateway: form.gateway.trim(),
          subnetMask: form.subnetMask.trim(),
          enabled: form.enabled
        }
      }
      ElMessage.success('已保存（原型数据）')
    }
    dialogVisible.value = false
  })
}

function onDelete(row) {
  ElMessageBox.confirm(`确定删除IP池「${row.name}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      const i = ipPoolResourceMock.rows.findIndex((r) => r.id === row.id)
      if (i >= 0) ipPoolResourceMock.rows.splice(i, 1)
      ElMessage.success('已删除（原型数据）')
    })
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

.crumb-segment,
.crumb-leaf {
  color: var(--neutral-10);
  font-weight: 500;
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
  font-weight: 500;
  color: var(--neutral-10);
  margin: 0 0 16px;
}

.content-module {
  background: var(--neutral-0);
  box-shadow: var(--shadow-1);
}

.filter-strip {
  margin-bottom: 10px;
  padding: 10px 15px;
  background: var(--neutral-0);
  box-shadow: var(--shadow-1);
}

.table-card {
  padding: 0;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  column-gap: 8px;
  row-gap: 6px;
  width: 100%;
  margin: 0;
  padding: 0;
}

.filter-form :deep(.el-form-item) {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  margin: 0;
}

.filter-form :deep(.el-form-item__label-wrap) {
  margin: 0 !important;
}

.filter-form :deep(.el-form-item__label) {
  float: none;
  height: 32px;
  line-height: 32px;
  padding: 0 4px 0 0;
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-form :deep(.el-form-item__content) {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-left: 0 !important;
  line-height: 32px;
}

.filter-input {
  width: 200px;
}

.filter-form__actions :deep(.el-form-item__content) {
  gap: 6px;
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

.table-card__toolbar {
  padding: 12px 15px;
}

.table-card__toolbar :deep(.el-button) {
  padding: 2px 16px;
  font-size: 12px;
}

.table-card__sheet {
  width: 100%;
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--neutral-10);
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
  gap: 12px;
  white-space: nowrap;
}

.ops-link {
  padding: 0;
  font-size: 12px;
  height: auto;
  min-height: 0;
  align-items: center;
}

.vsm-table {
  font-size: 12px;
  color: var(--neutral-10);
  --el-table-border-color: transparent;
  --el-table-border: none;
}

.vsm-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.vsm-table :deep(.el-table__border-left-patch),
.vsm-table :deep(.el-table__border-right-patch) {
  display: none;
}

.vsm-table :deep(thead .el-table__cell) {
  background-color: #f5f5f5 !important;
  color: var(--neutral-10) !important;
  border-right: none !important;
  border-left: none !important;
  border-top: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.vsm-table :deep(tbody .el-table__cell) {
  background-color: #ffffff !important;
  border-right: none !important;
  border-left: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.vsm-table :deep(tbody tr:hover > td.el-table__cell) {
  background-color: #ffffff !important;
}

.vsm-table :deep(.el-table__fixed-right::before) {
  background-color: transparent;
}

.vsm-table :deep(.el-table__fixed-right) {
  box-shadow: -8px 0 12px -8px rgba(0, 0, 0, 0.06);
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0 0;
  background: transparent;
  box-shadow: none;
}

.resource-pager {
  flex-wrap: wrap;
  row-gap: 8px;
  justify-content: flex-end;
  margin-right: 0;
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

.resource-pager :deep(.el-pagination__sizes .el-select:hover .el-input__wrapper),
.resource-pager :deep(.el-pagination__sizes .el-select:hover .el-select__wrapper) {
  border-color: var(--brand-5) !important;
}

.ip-pool-form {
  padding-top: 4px;
}

.ip-pool-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
</style>

<style>
.ip-pool-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.ip-pool-dialog .el-dialog__header {
  margin: 0;
  padding: 12px 16px;
  background: #e8edf3;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.ip-pool-dialog .el-dialog__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.ip-pool-dialog .el-dialog__headerbtn {
  top: 10px;
  right: 12px;
}

.ip-pool-dialog .el-dialog__body {
  padding: 20px 16px 8px;
}

.ip-pool-dialog .el-dialog__footer {
  padding: 8px 16px 16px;
}
</style>

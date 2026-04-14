<template>
  <div class="page-container">
    <div class="breadcrumb">
      <span class="crumb-leaf">密码设备资源管理</span>
    </div>
    <h1 class="page-title">密码设备资源管理</h1>

    <div class="content-module filter-card">
      <el-form :inline="true" :model="query" class="filter-form" @submit.prevent>
        <el-form-item label="分组名称">
          <el-input v-model="query.groupName" placeholder="请输入分组名称" clearable />
        </el-form-item>
        <el-form-item label="设备IP">
          <el-input v-model="query.deviceIp" placeholder="请输入设备IP" clearable />
        </el-form-item>
        <el-form-item label="厂商">
          <el-select v-model="query.manufacturer" placeholder="请选择厂商" clearable>
            <el-option v-for="o in MANUFACTURER_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="query.deviceType" placeholder="请选择设备类型" clearable>
            <el-option v-for="o in DEVICE_TYPE_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-module table-card">
      <div class="table-card__toolbar">
        <el-button type="primary" @click="openCreate">新增分组</el-button>
      </div>
      <div class="table-card__sheet">
        <el-table :data="pagedRows" class="group-table" style="width: 100%">
        <el-table-column label="分组编号" min-width="80" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'cell-muted': !row.code }">{{ formatDash(row.code) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分组名称" min-width="80" show-overflow-tooltip />
        <el-table-column prop="groupType" label="分组类型" width="100" show-overflow-tooltip />
        <el-table-column label="设备数量" width="100" align="center">
          <template #default="{ row }">{{ countDevicesInGroup(row.id) }}</template>
        </el-table-column>
        <el-table-column label="厂商" width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'cell-muted': !row.manufacturer }">{{ formatDash(row.manufacturer) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备类型" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'cell-muted': !row.deviceType }">{{ formatDash(row.deviceType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="200" />
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row)">查看分组</el-button>
            <template v-if="!row.builtin">
              <el-button type="primary" link @click="onEdit(row)">编辑</el-button>
              <el-button type="primary" link @click="goAuthorize(row)">授权</el-button>
              <el-button type="danger" link @click="onDelete(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      </div>
      <div class="pager-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          class="resource-pager"
          :total="filteredGroups.length"
          :page-sizes="[10, 20, 30, 50, 100]"
          layout="total, prev, pager, next, sizes"
        />
      </div>
    </div>

    <el-dialog
      v-model="createVisible"
      title="新增设备分组"
      width="520px"
      align-center
      destroy-on-close
      class="crypto-create-group-dialog"
      @closed="resetCreateForm"
    >
      <el-form ref="createFormRef" class="device-group-create-form" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入分组名称" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="厂商" prop="manufacturer">
          <el-select v-model="createForm.manufacturer" placeholder="请选择厂商">
            <el-option v-for="o in MANUFACTURER_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="createForm.deviceType" placeholder="请选择设备类型">
            <el-option v-for="o in DEVICE_TYPE_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MANUFACTURER_OPTIONS,
  DEVICE_TYPE_OPTIONS,
  cryptoDeviceResourceMock,
  addCustomGroup,
  deleteCustomGroup,
  listDevicesForGroup,
  countDevicesInGroup
} from '../../mock/cryptoDeviceResourceMock.js'

const router = useRouter()

const query = reactive({
  groupName: '',
  deviceIp: '',
  manufacturer: '',
  deviceType: ''
})

const applied = reactive({ ...query })

function handleSearch() {
  Object.assign(applied, query)
  page.value = 1
}

function handleReset() {
  query.groupName = ''
  query.deviceIp = ''
  query.manufacturer = ''
  query.deviceType = ''
  Object.assign(applied, query)
  page.value = 1
}

function groupMatchesDeviceIp(group, ipq) {
  if (!ipq) return true
  const devs = listDevicesForGroup(group.id)
  return devs.some((d) => d.ip.includes(ipq))
}

const filteredGroups = computed(() => {
  return cryptoDeviceResourceMock.groups.filter((g) => {
    if (applied.groupName && !g.name.includes(applied.groupName)) return false
    if (applied.manufacturer) {
      if (!g.manufacturer) return false
      if (g.manufacturer !== applied.manufacturer) return false
    }
    if (applied.deviceType) {
      if (!g.deviceType) return false
      if (g.deviceType !== applied.deviceType) return false
    }
    if (!groupMatchesDeviceIp(g, applied.deviceIp)) return false
    return true
  })
})

function formatDash(val) {
  return val == null || val === '' ? '--' : val
}

const page = ref(1)
const pageSize = ref(10)

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredGroups.value.slice(start, start + pageSize.value)
})

const createVisible = ref(false)
const createFormRef = ref()
const createForm = reactive({
  name: '',
  manufacturer: '',
  deviceType: ''
})

const createRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请选择厂商', trigger: 'change' }],
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
}

function openCreate() {
  createVisible.value = true
}

function resetCreateForm() {
  createForm.name = ''
  createForm.manufacturer = ''
  createForm.deviceType = ''
  createFormRef.value?.clearValidate?.()
}

async function submitCreate() {
  await createFormRef.value?.validate?.()
  addCustomGroup({ ...createForm })
  createVisible.value = false
  ElMessage.success('已新增分组（原型数据）')
  page.value = 1
}

function goDetail(row) {
  router.push({ name: 'CryptoDeviceGroupDetail', params: { groupId: row.id } })
}

function goAuthorize(row) {
  router.push({ name: 'CryptoDeviceGroupAuthorize', params: { groupId: row.id } })
}

function onEdit() {
  ElMessage.info('编辑分组为占位能力，后续接入接口。')
}

function onDelete(row) {
  ElMessageBox.confirm(`确定删除分组「${row.name}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      if (deleteCustomGroup(row.id)) ElMessage.success('已删除（原型数据）')
      else ElMessage.warning('内置分组不可删除')
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
  padding: 12px;
  box-shadow: var(--shadow-1);
}

.table-card {
  padding: 0;

}

.filter-card {
  margin-bottom: 12px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.table-card__toolbar {
  padding: 15px 15px 15px 15px;
}

.table-card__toolbar :deep(.el-button) {
  padding: 2px 16px;
  font-size: 12px;
  margin-left: 0px;
}

.table-card__sheet {
  width: 100%;
}

.group-table {
  font-size: 12px;
  color: var(--neutral-10);
  --el-table-border-color: transparent;
  --el-table-border: none;
}

.group-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.group-table :deep(.el-table__border-left-patch),
.group-table :deep(.el-table__border-right-patch) {
  display: none;
}

.group-table :deep(thead .el-table__cell) {
  background-color: #f5f5f5 !important;
  color: var(--neutral-10) !important;
  border-right: none !important;
  border-left: none !important;
  border-top: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.group-table :deep(tbody .el-table__cell) {
  background-color: #ffffff !important;
  border-right: none !important;
  border-left: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.group-table :deep(tbody tr:hover > td.el-table__cell) {
  background-color: #ffffff !important;
}

.group-table :deep(.el-table__fixed-right::before) {
  background-color: transparent;
}

.group-table :deep(.el-table__fixed-right) {
  box-shadow: -8px 0 12px -8px rgba(0, 0, 0, 0.06);
}

.group-table :deep(.cell-muted) {
  color: var(--neutral-10);
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 12px 1px 12px 0px;
  background: var(--neutral-0);
}

.resource-pager {
  flex-wrap: wrap;
  row-gap: 8px;
  justify-content: flex-end;
  margin-right: 12px;
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
</style>

<style>
/* 新增设备分组：去掉 el-dialog 根节点默认大内边距，与克隆向导内嵌弹窗一致 */
.crypto-create-group-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.crypto-create-group-dialog .el-dialog__header {
  margin: 0;
  padding: 10px 48px 10px 14px;
  background: var(--neutral-2);
  border-bottom: 1px solid var(--neutral-4);
  box-sizing: border-box;
}

.crypto-create-group-dialog .el-dialog__headerbtn {
  top: 6px;
  right: 8px;
  width: 40px;
  height: 40px;
}

.crypto-create-group-dialog .el-dialog__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--neutral-10);
}

.crypto-create-group-dialog .el-dialog__body {
  padding: 10px 14px 8px;
}

.crypto-create-group-dialog .el-dialog__footer {
  padding: 8px 14px 12px;
  border-top: 1px solid var(--neutral-4);
}

.crypto-create-group-dialog .device-group-create-form .el-input,
.crypto-create-group-dialog .device-group-create-form .el-select {
  width: 100%;
  max-width: 100%;
}

.crypto-create-group-dialog .device-group-create-form .el-form-item__label,
.crypto-create-group-dialog .device-group-create-form .el-input__inner,
.crypto-create-group-dialog .device-group-create-form .el-select__placeholder,
.crypto-create-group-dialog .device-group-create-form .el-select__selected-item {
  font-size: 12px;
}
</style>

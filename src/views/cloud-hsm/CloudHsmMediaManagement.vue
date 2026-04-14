<template>
  <div class="page-container">
    <div class="breadcrumb">
      <span class="crumb-segment">云密码机管理</span>
      <el-icon class="crumb-sep"><span class="slash">/</span></el-icon>
      <span class="crumb-segment">影像管理</span>
      <el-icon class="crumb-sep"><span class="slash">/</span></el-icon>
      <span class="crumb-leaf">{{ currentCrumbLeaf }}</span>
    </div>
    <h1 class="page-title">{{ currentCrumbLeaf }}</h1>

    <div class="content-module tabs-card">
      <el-tabs v-model="activeTab" class="media-tabs">
        <el-tab-pane label="宿主机备份管理" name="host-backup" />
        <el-tab-pane label="宿主机影像管理" name="host-image" />
        <el-tab-pane label="虚拟机影像管理" name="vm-image" />
        <el-tab-pane label="宿主机升级管理" name="host-upgrade" />
      </el-tabs>
    </div>

    <template v-if="activeTab === 'vm-image'">
      <div class="filter-strip">
        <el-form :inline="true" :model="query" class="filter-form" label-width="auto" @submit.prevent>
          <el-form-item label="影像名称" class="filter-form__item">
            <el-input v-model="query.imageName" placeholder="请输入影像名称" clearable class="filter-input" />
          </el-form-item>
          <el-form-item label="虚拟密码机名称" class="filter-form__item">
            <el-input v-model="query.vmName" placeholder="请输入虚拟密码机名称" clearable class="filter-input wide" />
          </el-form-item>
          <el-form-item class="filter-form__item filter-form__actions">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button class="btn-reset-outline" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="content-module table-card">
        <div class="table-card__toolbar">
          <el-button type="primary" @click="onUpload">上传影像</el-button>
        </div>
        <div class="table-card__sheet">
          <el-table :data="pagedRows" class="vsm-table" style="width: 100%" row-key="id">
            <el-table-column prop="imageName" label="影像名称" min-width="140" show-overflow-tooltip />
            <el-table-column label="虚拟密码机名称" min-width="280" class-name="col-wrap">
              <template #default="{ row }">
                <span class="cell-multiline">{{ row.vmCryptoName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="120" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.remark ? row.remark : '—' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <span class="status-cell">
                  <span class="status-dot" :class="statusMeta(row.status).dotClass" aria-hidden="true" />
                  <span>{{ statusMeta(row.status).label }}</span>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" width="168" />
            <el-table-column label="操作" fixed="right" width="160">
              <template #default="{ row }">
                <div class="ops-row">
                  <el-button type="primary" link class="ops-link" @click="onImport(row)">导入影像</el-button>
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
        v-model="importVmVisible"
        title="导入虚拟机影像"
        width="560px"
        align-center
        destroy-on-close
        class="import-vm-dialog"
        @closed="onImportVmDialogClosed"
      >
        <el-form label-width="96px" class="import-vm-form">
          <el-form-item label="虚拟机" required>
            <el-select
              v-model="importVmId"
              placeholder="请选择虚拟机"
              filterable
              class="import-vm-select"
            >
              <el-option v-for="opt in vmSelectOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="分组名称" :required="importVmResourceOnShelf">
            <el-select
              v-model="importGroupId"
              placeholder="请选择分组"
              filterable
              :disabled="importGroupOrgDisabled"
              class="import-vm-select"
            >
              <el-option v-for="opt in groupSelectOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="机构名称" :required="importVmResourceOnShelf">
            <el-select
              v-model="importOrgId"
              placeholder="请选择机构"
              filterable
              :disabled="importGroupOrgDisabled || !importGroupId || !orgSelectOptions.length"
              class="import-vm-select"
            >
              <el-option v-for="opt in orgSelectOptions" :key="opt.id" :label="opt.label" :value="opt.id" />
            </el-select>
            <!--             <p v-if="importVmResourceOnShelf" class="import-field-hint">
              分组由密码设备资源管理中该虚拟机 IP 所属分组决定；机构须为该分组已授权且与「机构管理」中机构代号一致、状态为启用的机构（多机构时择一）。
            </p> -->
          </el-form-item>
          <div v-if="importVmId && !importVmResourceOnShelf" class="import-shelf-tip-wrap">
            <p class="import-shelf-tip">系统未上架，无需选择密码资源分组</p>
          </div>
        </el-form>
        <template #footer>
          <el-button @click="importVmVisible = false">取消</el-button>
          <el-button type="primary" @click="onImportVmConfirm">确定</el-button>
        </template>
      </el-dialog>
    </template>

    <div v-else class="content-module placeholder-card">
      <p class="placeholder-text">{{ currentCrumbLeaf }}为原型占位，后续接入接口与完整流程。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VM_IMAGE_ROWS, VM_IMAGE_STATUS_META } from '../../mock/vmImageMock.js'
import { VIRTUAL_HSM_ROWS } from '../../mock/virtualHsmMock.js'
import { findGroupById } from '../../mock/cryptoDeviceResourceMock.js'
import {
  getVmGroupId,
  groupHasAtLeastOneControlVsm,
  isVmImportEligible,
  isOrgAuthorizedAndManaged,
  listAuthorizedOrgSelectOptions
} from '../../mock/importVmDialogScopeMock.js'

const TAB_LABELS = {
  'host-backup': '宿主机备份管理',
  'host-image': '宿主机影像管理',
  'vm-image': '虚拟机影像管理',
  'host-upgrade': '宿主机升级管理'
}

const route = useRoute()
const router = useRouter()

const activeTab = ref('vm-image')
const query = reactive({ imageName: '', vmName: '' })
const applied = reactive({ ...query })
const rows = ref(VM_IMAGE_ROWS.map((r) => ({ ...r })))
const page = ref(1)
const pageSize = ref(10)

const importVmVisible = ref(false)
const importOrgId = ref('')
const importGroupId = ref('')
const importVmId = ref('')
const importImageRow = ref(null)

const selectedImportVm = computed(() => VIRTUAL_HSM_ROWS.find((r) => r.id === importVmId.value) ?? null)

/** 已上架至密码资源：未上架则分组/机构不可选 */
const importVmResourceOnShelf = computed(() => {
  const row = selectedImportVm.value
  if (!row) return false
  return row.resourceOnShelf !== false
})

/** 仅展示在密码设备资源中已登记、且所属资源分组满足受控 VSM 条件的虚拟机 */
const vmSelectOptions = computed(() =>
  VIRTUAL_HSM_ROWS.filter((r) => isVmImportEligible(r.id)).map((r) => ({
    id: r.id,
    label: `${r.name} (IP: ${r.ipv4 || '—'})${r.resourceOnShelf === false ? '（未上架）' : ''}`
  }))
)

/**
 * 分组：与密码设备资源管理中该虚拟机 IP 对应设备所在分组一致（findGroupById）；
 * 未上架时不展示可选分组。
 */
const groupSelectOptions = computed(() => {
  if (!importVmId.value) return []
  const row = selectedImportVm.value
  if (!row || row.resourceOnShelf === false) return []
  const gid = getVmGroupId(importVmId.value)
  if (!gid || !groupHasAtLeastOneControlVsm(gid)) return []
  const g = findGroupById(gid)
  return g ? [{ id: g.id, label: g.name }] : []
})

/** 机构：该分组在资源管理中 authorizedByGroupId 的授权列表（与授权页同源） */
const orgSelectOptions = computed(() => {
  if (!importGroupId.value) return []
  const row = selectedImportVm.value
  if (row && row.resourceOnShelf === false) return []
  return listAuthorizedOrgSelectOptions(importGroupId.value)
})

/** 未选虚拟机或未上架时，分组、机构均不可操作 */
const importGroupOrgDisabled = computed(
  () => !importVmId.value || !importVmResourceOnShelf.value || !groupSelectOptions.value.length
)

function syncGroupFromVm() {
  const row = selectedImportVm.value
  if (!row || row.resourceOnShelf === false) {
    importGroupId.value = ''
    return
  }
  const gid = getVmGroupId(importVmId.value)
  if (gid && groupHasAtLeastOneControlVsm(gid)) {
    importGroupId.value = gid
  } else {
    importGroupId.value = ''
  }
}

function syncOrgFromGroup() {
  const opts = orgSelectOptions.value
  if (!opts.some((o) => o.id === importOrgId.value)) {
    importOrgId.value = opts[0]?.id ?? ''
  }
}

function resetImportDialogSelection() {
  const first = VIRTUAL_HSM_ROWS.find((r) => isVmImportEligible(r.id))
  importVmId.value = first?.id ?? ''
  syncGroupFromVm()
  syncOrgFromGroup()
}

watch(importVmId, (id) => {
  if (!id) {
    importGroupId.value = ''
    importOrgId.value = ''
    return
  }
  syncGroupFromVm()
  syncOrgFromGroup()
})

watch(importGroupId, () => {
  syncOrgFromGroup()
})

const currentCrumbLeaf = computed(() => TAB_LABELS[activeTab.value] || '影像管理')

function statusMeta(key) {
  return VM_IMAGE_STATUS_META[key] || { label: '--', dotClass: 'status-dot--muted' }
}

function syncTabFromRoute() {
  const q = route.query.tab
  if (typeof q === 'string' && TAB_LABELS[q]) {
    activeTab.value = q
  }
}

syncTabFromRoute()

watch(
  () => route.query.tab,
  () => {
    syncTabFromRoute()
  }
)

watch(
  activeTab,
  (name) => {
    const nextQ = { ...route.query }
    if (name === 'vm-image') {
      delete nextQ.tab
    } else {
      nextQ.tab = name
    }
    const same =
      JSON.stringify({ ...nextQ }) ===
      JSON.stringify({ ...route.query })
    if (!same) {
      router.replace({ path: route.path, query: nextQ })
    }
  },
  { immediate: true }
)

watch(pageSize, () => {
  page.value = 1
})

function handleSearch() {
  Object.assign(applied, query)
  page.value = 1
}

function handleReset() {
  query.imageName = ''
  query.vmName = ''
  Object.assign(applied, query)
  page.value = 1
}

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    if (applied.imageName && !row.imageName.includes(applied.imageName)) return false
    if (applied.vmName && !row.vmCryptoName.includes(applied.vmName)) return false
    return true
  })
})

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

watch(filteredRows, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / pageSize.value) || 1)
  if (page.value > maxPage) page.value = maxPage
})

function onUpload() {
  ElMessage.info('上传影像为占位能力，后续接入接口。')
}

function onImport(row) {
  importImageRow.value = row
  ElMessageBox.confirm(
    '导入影像前请确认原虚拟机密钥信息为空，不为空可能导入不成功！',
    '温馨提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'vm-image-import-tip-box',
      distinguishCancelAndClose: true
    }
  )
    .then(() => {
      resetImportDialogSelection()
      importVmVisible.value = true
    })
    .catch(() => {
      importImageRow.value = null
    })
}

function onImportVmDialogClosed() {
  importOrgId.value = ''
  importGroupId.value = ''
  importVmId.value = ''
  importImageRow.value = null
}

function onImportVmConfirm() {
  if (!importVmId.value) {
    ElMessage.warning('请选择虚拟机')
    return
  }
  if (!isVmImportEligible(importVmId.value)) {
    ElMessage.warning('所选虚拟机所属分组不满足「至少 1 台受控 VSM」条件')
    return
  }
  const img = importImageRow.value?.imageName ?? ''
  const vm = vmSelectOptions.value.find((o) => o.id === importVmId.value)

  if (selectedImportVm.value && selectedImportVm.value.resourceOnShelf === false) {
    importVmVisible.value = false
    ElMessage.success(`已提交导入：${img} → ${vm?.label ?? ''}（系统未上架，未选分组/机构）（原型）`)
    return
  }

  const scopeGid = getVmGroupId(importVmId.value)
  if (!importGroupId.value || importGroupId.value !== scopeGid) {
    ElMessage.warning('所选分组须与密码设备资源管理中该虚拟机 IP 所属分组一致')
    return
  }
  if (!groupHasAtLeastOneControlVsm(importGroupId.value)) {
    ElMessage.warning('该分组内无受控 VSM，无法提交')
    return
  }
  if (!importOrgId.value) {
    ElMessage.warning('请选择机构')
    return
  }
  if (!isOrgAuthorizedAndManaged(scopeGid, importOrgId.value)) {
    ElMessage.warning('所选机构须为该分组已授权且在机构管理中为启用状态')
    return
  }
  const grp = groupSelectOptions.value.find((o) => o.id === importGroupId.value)
  const org = orgSelectOptions.value.find((o) => o.id === importOrgId.value)
  importVmVisible.value = false
  ElMessage.success(
    `已提交导入：${img} → ${vm?.label ?? ''} / ${grp?.label ?? ''} / ${org?.label ?? ''}（原型）`
  )
}

function onDelete(row) {
  ElMessageBox.confirm(`确定删除影像「${row.imageName}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => {
      rows.value = rows.value.filter((r) => r.id !== row.id)
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

.crumb-segment {
  color: var(--neutral-10);
  font-weight: 500;
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

.tabs-card {
  margin-bottom: 12px;
  padding-top: 4px;
}

.media-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.media-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--neutral-4);
}

.media-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  padding: 0 20px;
}

.media-tabs :deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
}

.media-tabs :deep(.el-tabs__active-bar) {
  height: 2px;
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
  margin-bottom: 0;
  margin-right: 0;
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

.filter-input.wide {
  width: 280px;
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

.vsm-table :deep(td.col-wrap .cell) {
  white-space: normal;
  word-break: break-all;
  line-height: 1.45;
}

.cell-multiline {
  display: block;
  font-size: 12px;
  color: var(--neutral-10);
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

.status-dot--warning {
  background: var(--el-color-warning);
}

.status-dot--danger {
  background: var(--el-color-danger);
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

.placeholder-card {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  margin: 0;
  font-size: 14px;
  color: var(--neutral-8);
}

.import-vm-form {
  padding-top: 4px;
}

.import-vm-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.import-vm-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.import-vm-form :deep(.import-vm-select) {
  width: 100%;
  min-width: 0;
}

.import-field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--neutral-8);
}

.import-shelf-tip-wrap {
  margin: -4px 0 4px;
  padding: 0 0 0 96px;
}

.import-shelf-tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--neutral-8);
}
</style>

<style>
/* 挂载到 body：温馨提示 MessageBox */
.vm-image-import-tip-box.el-message-box {
  border-radius: 4px;
}

.vm-image-import-tip-box .el-message-box__title {
  font-weight: 500;
}

/* 导入虚拟机影像：顶栏浅灰、与稿一致 */
.import-vm-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.import-vm-dialog .el-dialog__header {
  margin: 0;
  padding: 12px 16px;
  background: #e8edf3;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.import-vm-dialog .el-dialog__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.import-vm-dialog .el-dialog__headerbtn {
  top: 10px;
  right: 12px;
}

.import-vm-dialog .el-dialog__body {
  padding: 20px 16px 12px;
}

.import-vm-dialog .el-dialog__footer {
  padding: 8px 16px 16px;
}

.import-vm-dialog .import-vm-form .el-form-item__label,
.import-vm-dialog .import-vm-form .el-input__inner,
.import-vm-dialog .import-vm-form .el-select__placeholder,
.import-vm-dialog .import-vm-form .el-select__selected-item {
  font-size: 12px;
}
</style>

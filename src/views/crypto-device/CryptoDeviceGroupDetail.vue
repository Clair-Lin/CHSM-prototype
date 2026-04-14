<template>
  <div v-if="group" class="page-container">
    <div class="breadcrumb">
      <span class="crumb-leaf">密码资源管理详情</span>
    </div>
    <h1 class="page-title">密码资源管理详情</h1>

    <div class="detail-main-board">
      <div class="detail-main-board__subhead pad-x broad-bottom">
        <el-button class="back-btn" text @click="goBack" aria-label="返回">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="group-name-quoted">"{{ group.name }}"</span>
      </div>

      <div class="detail-main-board__section pad-x broad-bottom">
        <h2 class="section-title section-title--accent">
          <span class="section-title__bar" aria-hidden="true" />
          分组信息
        </h2>
        <div class="info-row info-row--single-line">
          <div class="info-item">
            <span class="label">分组名称</span><span class="info-value">{{ group.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">分组类型</span><span class="info-value">{{ group.groupType }}</span>
          </div>
          <div class="info-item">
            <span class="label">设备能力</span><span class="info-value">{{ formatDash(group.deviceCapability) }}</span>
          </div>
          <div class="info-item">
            <span class="label">设备数量</span><span class="info-value">{{ groupDeviceCount }}</span>
          </div>
          <div class="info-item">
            <span class="label">设备类型</span><span class="info-value">{{ formatDash(group.deviceType) }}</span>
          </div>
          <div class="info-item">
            <span class="label">厂商</span><span class="info-value">{{ formatDash(group.manufacturer) }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间</span><span class="info-value">{{ group.createdAt }}</span>
          </div>
        </div>
      </div>

      <div class="detail-main-board__section">
        <div class="pad-x broad-bottom">
          <h2 class="section-title section-title--accent">
            <span class="section-title__bar" aria-hidden="true" />
            密码设备信息
          </h2>
          <el-form
            :inline="true"
            :model="query"
            class="filter-form device-filter-form"
            label-width="auto"
            @submit.prevent
          >
            <el-form-item label="密码设备名称" class="device-filter-form__item">
              <el-input v-model="query.name" placeholder="请输入密码设备名称" clearable class="device-filter-input" />
            </el-form-item>
            <el-form-item label="IP地址" class="device-filter-form__item">
              <el-input v-model="query.ip" placeholder="请输入IP地址" clearable class="device-filter-input" />
            </el-form-item>
            <el-form-item label="厂商" class="device-filter-form__item">
              <el-select v-model="query.manufacturer" placeholder="请选择厂商" clearable class="device-filter-select">
                <el-option v-for="o in MANUFACTURER_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
            </el-form-item>
            <el-form-item class="device-filter-form__item device-filter-form__actions">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="detail-main-board__sheet">
          <el-table :data="pagedDevices" class="device-table" row-key="id" style="width: 100%">
            <el-table-column type="expand" width="44">
              <template #default="{ row }">
                <div v-if="row.expandColumns?.length" class="expand-grid-sys">
                  <div
                    v-for="(col, ci) in row.expandColumns"
                    :key="ci"
                    class="expand-grid-sys__col"
                  >
                    <p
                      v-for="(cell, ii) in col"
                      :key="ii"
                      class="expand-grid-sys__line"
                    >
                      <span class="expand-grid-sys__label">{{ cell.label }}：</span>{{ cell.value }}
                    </p>
                  </div>
                </div>
                <div v-else class="expand-inner">更多设备属性（占位）</div>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="密码设备名称" min-width="100" show-overflow-tooltip />
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="cryptoType" label="密码设备类型" min-width="120" show-overflow-tooltip />
            <el-table-column prop="model" label="密码设备型号" width="120" show-overflow-tooltip />
            <el-table-column prop="manufacturer" label="厂商" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <span class="status-dot" :class="row.status === '已上架' ? 'success' : 'muted'" />
                {{ row.status }}
              </template>
            </el-table-column>
            <el-table-column label="资源状态" width="110">
              <template #default="{ row }">
                <span
                  class="status-dot"
                  :class="row.resourceStatus === '资源可用' ? 'success' : 'muted'"
                />
                {{ row.resourceStatus }}
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" class-name="ops-cell" min-width="240" width="260">
              <template #default="{ row }">
                <div class="ops-row">
                  <el-button type="primary" link @click="removeFromGroup(row)">移出分组</el-button>
                  <el-button type="primary" link @click="onRunningOverview(row)">运行概况</el-button>
                  <el-dropdown trigger="click" @command="onShelfCommand">
                    <span class="dropdown-link">
                      设备操作
                      <el-icon class="caret"><ArrowDown /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-if="row.status === '已上架'"
                          :command="{ row, onShelf: false }"
                        >
                          下架
                        </el-dropdown-item>
                        <el-dropdown-item v-else :command="{ row, onShelf: true }">上架</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pager-wrap pad-x broad-top">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            class="resource-pager"
            :total="filteredDevices.length"
            :page-sizes="[10, 20, 30, 50, 100]"
            layout="total, prev, pager, next, sizes"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MANUFACTURER_OPTIONS,
  findGroupById,
  listDevicesForGroup,
  removeDeviceFromGroup,
  setDeviceShelfStatus,
  countDevicesInGroup
} from '../../mock/cryptoDeviceResourceMock.js'

const route = useRoute()
const router = useRouter()

const group = computed(() => findGroupById(route.params.groupId))

const groupDeviceCount = computed(() => countDevicesInGroup(route.params.groupId))

watch(
  () => route.params.groupId,
  (id) => {
    if (!findGroupById(id)) router.replace({ name: 'CryptoDeviceResources' })
  },
  { immediate: true }
)

function formatDash(val) {
  return val == null || val === '' ? '--' : val
}

function goBack() {
  router.push({ name: 'CryptoDeviceResources' })
}

const query = reactive({ name: '', ip: '', manufacturer: '' })
const applied = reactive({ ...query })

function handleSearch() {
  Object.assign(applied, query)
  page.value = 1
}

function handleReset() {
  query.name = ''
  query.ip = ''
  query.manufacturer = ''
  Object.assign(applied, query)
  page.value = 1
}

const devices = computed(() => listDevicesForGroup(route.params.groupId))

const filteredDevices = computed(() => {
  return devices.value.filter((d) => {
    if (applied.name && !d.name.includes(applied.name)) return false
    if (applied.ip && !d.ip.includes(applied.ip)) return false
    if (applied.manufacturer && d.manufacturer !== applied.manufacturer) return false
    return true
  })
})

const page = ref(1)
const pageSize = ref(10)

const pagedDevices = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredDevices.value.slice(start, start + pageSize.value)
})

watch([devices, () => route.params.groupId], () => {
  page.value = 1
})

function removeFromGroup(row) {
  ElMessageBox.confirm(`将设备「${row.name}」移出当前分组？`, '提示', {
    type: 'warning'
  })
    .then(() => {
      removeDeviceFromGroup(route.params.groupId, row.id)
      ElMessage.success('已移出分组（原型数据）')
    })
    .catch(() => {})
}

function onRunningOverview(row) {
  ElMessage.info(`运行概况：${row.name}（占位）`)
}

function onShelfCommand(cmd) {
  if (!cmd?.row) return
  const { row, onShelf } = cmd
  if (setDeviceShelfStatus(route.params.groupId, row.id, onShelf)) {
    ElMessage.success(onShelf ? '已上架（原型数据）' : '已下架（原型数据）')
  }
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
  color: var(--neutral-9);
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

.detail-main-board {
  background: var(--neutral-0);
  box-shadow: var(--shadow-1);
  overflow: hidden;
}

.pad-x {
  padding-left: 12px;
  padding-right: 16px;
}

.broad-bottom {
  border-bottom: 1px solid var(--neutral-4);
}

.broad-top {
  border-top: 1px solid var(--neutral-4);
}

.detail-main-board__subhead {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.detail-main-board__section {
  padding-top: 12px;
  padding-bottom: 12px;
}

.detail-main-board__section:last-child {
  padding-bottom: 2px;
}

.detail-main-board__section > .pad-x {
  padding-top: 4px;
  padding-bottom: 12px;
}

.back-btn {
  padding: 2px 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-10);
  border: 1px solid var(--neutral-4);
}

.group-name-quoted {
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-10);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-10);
  margin: 0 0 12px;
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

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 32px;
  font-size: 12px;
  color: var(--neutral-9);
}

.info-row--single-line {
  flex-wrap: nowrap;
  align-items: center;
  gap: 20px 28px;
  overflow-x: auto;
  padding-bottom: 2px;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.info-row--single-line .info-item {
  flex: 0 0 auto;
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  white-space: nowrap;
}

.info-item .label {
  color: var(--neutral-8);
  margin-right: 8px;
  flex-shrink: 0;
}

.info-value {
  color: var(--neutral-10);
}

.device-filter-form {
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

.device-filter-form :deep(.el-form-item) {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  margin: 0;
  margin-bottom: 0;
  margin-right: 0;
}

.device-filter-form :deep(.el-form-item__label-wrap) {
  margin: 0 !important;
}

.device-filter-form :deep(.el-form-item__label) {
  float: none;
  height: 32px;
  line-height: 32px;
  padding: 0 4px 0 0;
  flex-shrink: 0;
  white-space: nowrap;
}

.device-filter-form :deep(.el-form-item__content) {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-left: 0 !important;
  line-height: 32px;
}

.device-filter-input {
  width: 180px;
}

.device-filter-select {
  width: 140px;
}

.device-filter-form__actions :deep(.el-form-item__content) {
  gap: 6px;
}


.detail-main-board__sheet {
  width: 100%;
}

.device-table {
  font-size: 12px;
  color: var(--neutral-9);
  --el-table-border-color: transparent;
  --el-table-border: none;
}

.device-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.device-table :deep(.el-table__border-left-patch),
.device-table :deep(.el-table__border-right-patch) {
  display: none;
}

.device-table :deep(thead .el-table__cell) {
  background-color: #f5f5f5 !important;
  color: var(--neutral-10) !important;
  border-right: none !important;
  border-left: none !important;
  border-top: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.device-table :deep(tbody .el-table__cell) {
  background-color: #ffffff !important;
  border-right: none !important;
  border-left: none !important;
  border-bottom: 1px solid var(--neutral-4) !important;
}

.device-table :deep(tbody tr:hover > td.el-table__cell) {
  background-color: #ffffff !important;
}

.device-table :deep(.el-table__fixed-right::before) {
  background-color: transparent;
}

.device-table :deep(.el-table__fixed-right) {
  box-shadow: -8px 0 12px -8px rgba(0, 0, 0, 0.06);
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

.ops-row {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.ops-row :deep(.el-button.is-link) {
  margin-right: 0;
}

.device-table :deep(td.ops-cell .cell) {
  white-space: nowrap;
}

.dropdown-link {
  color: var(--brand-6);
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.dropdown-link .caret {
  font-size: 12px;
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

.expand-inner {
  padding: 8px 40px 8px 56px;
  font-size: 12px;
  color: var(--neutral-8);
}

.expand-grid-sys {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px 20px;
  padding: 12px 16px 16px 48px;
  font-size: 12px;
  color: var(--neutral-9);
  line-height: 1.6;
  background: var(--neutral-1);
}

.expand-grid-sys__line {
  margin: 0 0 6px;
}

.expand-grid-sys__line:last-child {
  margin-bottom: 0;
}

.expand-grid-sys__label {
  color: var(--neutral-8);
}

@media (max-width: 1200px) {
  .expand-grid-sys {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .expand-grid-sys {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-left: 24px;
  }
}
</style>

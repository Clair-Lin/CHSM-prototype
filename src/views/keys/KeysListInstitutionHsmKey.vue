<template>
  <div>
    <div class="filter-strip">
      <el-form :inline="true" :model="query" class="filter-form" label-width="auto" @submit.prevent>
        <el-form-item label="密钥ID">
          <el-input v-model="query.keyId" placeholder="请输入密钥ID" clearable class="filter-input" />
        </el-form-item>
        <el-form-item label="密钥名称">
          <el-input v-model="query.keyName" placeholder="请输入密钥名称" clearable class="filter-input" />
        </el-form-item>
        <el-form-item label="密钥类型">
          <el-select v-model="query.keyType" placeholder="全部" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option v-for="t in HSM_KEY_FILTER_OPTIONS.keyTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥用途">
          <el-select v-model="query.keyUsage" placeholder="全部" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option v-for="u in HSM_KEY_FILTER_OPTIONS.keyUsages" :key="u" :label="u" :value="u" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥来源">
          <el-select v-model="query.keySource" placeholder="全部" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option v-for="s in HSM_KEY_FILTER_OPTIONS.keySources" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option v-for="s in HSM_KEY_FILTER_OPTIONS.statuses" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属密码设备分组">
          <el-select v-model="query.deviceGroup" placeholder="全部" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option v-for="g in HSM_KEY_FILTER_OPTIONS.deviceGroups" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="添加时间">
          <el-date-picker
            v-model="query.addedRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="filter-input--wide"
          />
        </el-form-item>
        <el-form-item label="机构">
          <div style="display: inline-flex; align-items: center; gap: 0">
            <el-input v-model="query.orgKeyword" placeholder="请选择机构" readonly class="filter-input--org" />
            <el-button class="org-pick-suffix" @click="openOrgPicker">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
          </div>
        </el-form-item>
        <el-form-item class="filter-form__actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button class="btn-reset-outline" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-module table-card">
      <div class="table-card__toolbar">
        <el-button type="primary" @click="onRegister">密码机密钥登记</el-button>
      </div>
      <div class="table-card__sheet">
        <el-table :data="pagedRows" class="key-table" style="width: 100%" row-key="id">
          <el-table-column label="密钥名称/ID" min-width="168" class-name="col-wrap">
            <template #default="{ row }">
              <div class="cell-key-name">
                <span class="cell-key-name__title">{{ row.name }}</span>
                <span class="cell-key-name__id">{{ row.id }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="version" label="密钥版本" width="88" align="center" />
          <el-table-column label="密钥状态" width="100">
            <template #default="{ row }">
              <span class="status-cell">
                <span class="status-dot" :class="keyStatusMeta(row.status).dotClass" aria-hidden="true" />
                {{ keyStatusMeta(row.status).label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="密钥类型及用途" min-width="200" class-name="col-wrap">
            <template #default="{ row }">
              <div class="cell-type-purpose">
                <span class="cell-type-purpose__main">{{ row.typeLabel }}</span>
                <span class="cell-type-purpose__sub">{{ row.typeDesc }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="deviceGroup" label="所属密码设备分组" min-width="132" show-overflow-tooltip />
          <el-table-column label="副本状态" width="100" align="center">
            <template #default="{ row }">
              <span class="hint-with-icon">
                <el-tooltip content="已激活副本数 / 计划副本数（原型说明）" placement="top">
                  <el-icon :size="14"><InfoFilled /></el-icon>
                </el-tooltip>
                {{ row.replica }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="密钥来源" width="108" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="hint-with-icon">
                <el-tooltip content="登记来源说明（原型）" placement="top">
                  <el-icon :size="14"><InfoFilled /></el-icon>
                </el-tooltip>
                {{ row.source }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="orgName" label="所属机构" width="100" show-overflow-tooltip />
          <el-table-column prop="addedBy" label="添加人" width="100" show-overflow-tooltip />
          <el-table-column prop="addedAt" label="添加时间" width="156" />
          <el-table-column prop="effectiveAt" label="生效时间" width="156" />
          <el-table-column prop="expireAt" label="失效时间" width="100" show-overflow-tooltip />
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <div class="ops-row">
                <el-button type="primary" link class="ops-link" @click="onDetail(row)">详情</el-button>
                <el-dropdown trigger="click" popper-class="key-more-dropdown" @command="(cmd) => onKeyOp(cmd, row)">
                  <span class="ops-more-trigger" role="button" tabindex="0">
                    密钥操作
                    <el-icon class="ops-more-icon"><ArrowDown /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="replica">启用副本</el-dropdown-item>
                      <el-dropdown-item command="export">导出密钥</el-dropdown-item>
                      <el-dropdown-item command="import">导入密钥</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
  </div>
</template>

<script setup>
import { computed, inject, reactive, ref, watch } from 'vue'
import { ArrowDown, InfoFilled, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { HSM_KEY_FILTER_OPTIONS, INSTITUTION_HSM_KEY_ROWS } from '../../mock/keyListMock.js'
import { inDateTimeRange, keyStatusMeta } from './keyListUtils.js'

const openExportKeyFlow = inject('openExportKeyFlow', null)
const openImportRecoverFlow = inject('openImportRecoverFlow', null)

const rows = INSTITUTION_HSM_KEY_ROWS

const query = reactive({
  keyId: '',
  keyName: '',
  keyType: '',
  keyUsage: '',
  keySource: '',
  status: '',
  deviceGroup: '',
  addedRange: null,
  orgKeyword: ''
})
const applied = reactive({ ...query })

const page = ref(1)
const pageSize = ref(10)

function handleSearch() {
  Object.assign(applied, query)
  page.value = 1
}

function handleReset() {
  query.keyId = ''
  query.keyName = ''
  query.keyType = ''
  query.keyUsage = ''
  query.keySource = ''
  query.status = ''
  query.deviceGroup = ''
  query.addedRange = null
  query.orgKeyword = ''
  Object.assign(applied, query)
  page.value = 1
}

function rowMatchesUsage(row) {
  if (!applied.keyUsage) return true
  return (row.typeDesc && row.typeDesc.includes(applied.keyUsage)) || row.typeLabel.includes(applied.keyUsage)
}

const filteredRows = computed(() => {
  return rows.filter((row) => {
    if (applied.keyId && !String(row.id).includes(applied.keyId)) return false
    if (applied.keyName && !row.name.includes(applied.keyName)) return false
    if (applied.keyType && row.typeLabel !== applied.keyType) return false
    if (!rowMatchesUsage(row)) return false
    if (applied.keySource && row.source !== applied.keySource) return false
    if (applied.status) {
      const label = keyStatusMeta(row.status).label
      if (label !== applied.status) return false
    }
    if (applied.deviceGroup && row.deviceGroup !== applied.deviceGroup) return false
    if (applied.orgKeyword && !row.orgName.includes(applied.orgKeyword)) return false
    if (applied.addedRange && applied.addedRange.length === 2) {
      const [a, b] = applied.addedRange
      if (!inDateTimeRange(row.addedAt, a, b)) return false
    }
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

function openOrgPicker() {
  ElMessage.info('机构选择树为占位能力，后续接入接口。')
}

function onRegister() {
  ElMessage.info('密码机密钥登记为占位能力，后续接入接口。')
}

function onDetail(row) {
  ElMessage.info(`查看密钥详情「${row.name}」为占位能力。`)
}

function onKeyOp(cmd, row) {
  const map = {
    replica: '启用副本',
    export: '导出密钥',
    import: '导入密钥'
  }
  if (cmd === 'export' && openExportKeyFlow) {
    openExportKeyFlow(row)
    return
  }
  if (cmd === 'import' && openImportRecoverFlow) {
    openImportRecoverFlow(row)
    return
  }
  ElMessage.info(`${map[cmd]}「${row.name}」为占位能力。`)
}
</script>

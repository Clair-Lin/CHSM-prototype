<template>
  <div>
    <div class="filter-strip">
      <el-form :inline="true" :model="query" class="filter-form" label-width="auto" @submit.prevent>
        <el-form-item label="密钥名称/ID">
          <el-input v-model="query.nameOrId" placeholder="请输入密钥名称/ID" clearable class="filter-input--wide" />
        </el-form-item>
        <el-form-item label="密钥状态">
          <el-select v-model="query.status" placeholder="全部" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option v-for="s in LIB_KEY_FILTER_OPTIONS.statuses" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥类型">
          <el-select v-model="query.keyType" placeholder="全部" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option v-for="t in LIB_KEY_FILTER_OPTIONS.keyTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥用途">
          <el-select v-model="query.keyUsage" placeholder="全部" clearable class="filter-select">
            <el-option label="全部" value="" />
            <el-option v-for="u in LIB_KEY_FILTER_OPTIONS.keyUsages" :key="u" :label="u" :value="u" />
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
        <el-form-item class="filter-form__actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button class="btn-reset-outline" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-module table-card">
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
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { INSTITUTION_LIBRARY_KEY_ROWS, LIB_KEY_FILTER_OPTIONS } from '../../mock/keyListMock.js'
import { inDateTimeRange, keyStatusMeta } from './keyListUtils.js'

const openExportKeyFlow = inject('openExportKeyFlow', null)
const openImportRecoverFlow = inject('openImportRecoverFlow', null)

const rows = INSTITUTION_LIBRARY_KEY_ROWS

const query = reactive({
  nameOrId: '',
  status: '',
  keyType: '',
  keyUsage: '',
  addedRange: null
})
const applied = reactive({ ...query })

const page = ref(1)
const pageSize = ref(10)

function handleSearch() {
  Object.assign(applied, query)
  page.value = 1
}

function handleReset() {
  query.nameOrId = ''
  query.status = ''
  query.keyType = ''
  query.keyUsage = ''
  query.addedRange = null
  Object.assign(applied, query)
  page.value = 1
}

function rowMatchesUsage(row) {
  if (!applied.keyUsage) return true
  return (row.typeDesc && row.typeDesc.includes(applied.keyUsage)) || row.typeLabel.includes(applied.keyUsage)
}

const filteredRows = computed(() => {
  return rows.filter((row) => {
    if (applied.nameOrId) {
      const q = applied.nameOrId
      if (!row.name.includes(q) && !String(row.id).includes(q)) return false
    }
    if (applied.status) {
      if (keyStatusMeta(row.status).label !== applied.status) return false
    }
    if (applied.keyType && row.typeLabel !== applied.keyType) return false
    if (!rowMatchesUsage(row)) return false
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

function onDetail(row) {
  ElMessage.info(`查看密钥详情「${row.name}」为占位能力。`)
}

function onKeyOp(cmd, row) {
  const map = { export: '导出密钥', import: '导入密钥' }
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

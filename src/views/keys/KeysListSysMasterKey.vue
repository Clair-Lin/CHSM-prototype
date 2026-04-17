<template>
  <div>
    <div class="content-module table-card">
      <div class="table-card__toolbar key-sys-toolbar">
        <el-button type="primary" @click="onCreate">创建系统管理主密钥</el-button>
        <el-button class="btn-make-export-key" @click="onMakeExportKey">制作密钥导出key</el-button>
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
          <el-table-column prop="deviceGroup" label="所属密码设备分组" min-width="120" show-overflow-tooltip />
          <el-table-column prop="replica" label="副本状态" width="88" align="center" />
          <el-table-column prop="source" label="密钥来源" width="100" show-overflow-tooltip />
          <el-table-column prop="activator" label="激活人" min-width="140" show-overflow-tooltip />
          <el-table-column prop="activatedAt" label="激活时间" width="156" />
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
                      <el-dropdown-item command="delete">删除</el-dropdown-item>
                      <el-dropdown-item command="detect">检测</el-dropdown-item>
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
import { computed, inject, ref, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SYS_MASTER_KEY_ROWS } from '../../mock/keyListMock.js'
import { keyStatusMeta } from './keyListUtils.js'

const openExportKeyFlow = inject('openExportKeyFlow', null)
const openMakeExportKeyDialog = inject('openMakeExportKeyDialog', null)
const openImportRecoverFlow = inject('openImportRecoverFlow', null)

const rows = SYS_MASTER_KEY_ROWS

const page = ref(1)
const pageSize = ref(10)

const filteredRows = computed(() => {
  return rows.filter(() => true)
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

function onCreate() {
  ElMessage.info('创建系统管理主密钥为占位能力，后续接入接口。')
}

function onMakeExportKey() {
  const row = pagedRows.value[0] ?? rows[0]
  openMakeExportKeyDialog?.(row)
}

function onDetail(row) {
  ElMessage.info(`查看密钥详情「${row.name}」为占位能力。`)
}

function onKeyOp(cmd, row) {
  const map = {
    delete: '删除',
    detect: '检测',
    export: '导出密钥',
    import: '导入密钥'
  }
  if (cmd === 'delete') {
    ElMessageBox.confirm(`确定删除密钥「${row.name}」吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
      .then(() => ElMessage.success('已提交删除（原型）'))
      .catch(() => {})
    return
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

<style scoped>
.key-sys-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.btn-make-export-key {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: var(--neutral-0);
}

.btn-make-export-key:hover {
  border-color: var(--el-color-primary-light-3);
  color: var(--el-color-primary-light-3);
  background: var(--el-color-primary-light-9);
}
</style>

<template>
  <div class="page-container">
    <div class="search-card">
      <el-form :inline="true" :model="query" label-position="left" class="search-form" @submit.prevent>
        <el-form-item label="密钥ID">
          <el-input v-model="query.keyId" placeholder="请输入密钥ID" clearable />
        </el-form-item>
        <el-form-item label="密钥名称">
          <el-input v-model="query.keyName" placeholder="请输入密钥名称" clearable />
        </el-form-item>
        <el-form-item label="密钥版本">
          <el-input v-model="query.keyVersion" placeholder="请输入密钥版本" clearable />
        </el-form-item>
        <el-form-item label="密钥用途">
          <el-select v-model="query.usage" placeholder="请选择密钥用途" clearable>
            <el-option label="加密" value="加密" />
            <el-option label="解密" value="解密" />
            <el-option label="签名" value="签名" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥类型" required>
          <el-select v-model="query.type" placeholder="请选择密钥类型" clearable>
            <el-option label="SM2密钥_256" value="SM2密钥_256" />
            <el-option label="SM4_128" value="SM4_128" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="请选择状态" clearable>
            <el-option label="已激活" value="已激活" />
            <el-option label="已归档" value="已归档" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属密码设备分组">
          <el-select v-model="query.group" placeholder="请选择所属密码设备分组" clearable>
            <el-option label="系统分组" value="系统分组" />
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
          />
        </el-form-item>
        <el-form-item class="actions">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <div class="toolbar">
        <el-button type="primary" @click="openAddKeyDialog">添加密钥（新）</el-button>
        <el-button>导入密钥</el-button>
        <el-button disabled>挂起</el-button>
        <el-button disabled>解挂</el-button>
      </div>
      <el-table :data="pagedRows" row-key="id" style="width: 100%">
        <el-table-column type="selection" width="36" />
        <el-table-column label="密钥名称/ID" min-width="180">
          <template #default="{ row }">
            <div class="name-cell">
              <div>{{ row.name }}</div>
              <div class="sub-text">{{ row.id }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="密钥版本" width="80" />
        <el-table-column label="密钥状态" width="92">
          <template #default="{ row }">
            <span class="status-cell"><span class="dot" />{{ row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="密钥类型及用途" min-width="170">
          <template #default="{ row }">
            <div class="name-cell">
              <div>{{ row.typeLabel }}</div>
              <div class="sub-text">{{ row.typeDesc }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="所属密码设备分组" min-width="130" />
        <el-table-column label="副本状态" width="90" align="center">
          <template #default="{ row }">
            <span>{{ row.replica }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="密钥来源" width="90" />
        <el-table-column prop="addedBy" label="添加人" width="110" />
        <el-table-column prop="addedAt" label="添加时间" width="160" />
        <el-table-column prop="effectiveAt" label="生效时间" width="160" />
        <el-table-column prop="expireAt" label="失效时间" width="90" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <div class="ops">
              <el-button type="primary" link>详情</el-button>
              <el-button type="primary" link>挂起</el-button>
              <el-button type="primary" link>密钥操作</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30]"
          :total="filteredRows.length"
          layout="total, prev, pager, next, sizes"
        />
      </div>
    </div>

    <el-dialog
      v-model="addKeyDialogVisible"
      title="添加密钥"
      width="800px"
      class="add-key-dialog"
      destroy-on-close
      align-center
    >
      <el-form :model="addKeyForm" label-width="150px" class="add-key-form">
        <el-form-item label="密钥类型">
          <el-select v-model="addKeyForm.keyType" class="add-key-field" popper-class="key-type-select-dropdown">
            <el-option-group
              v-for="group in KEY_TYPE_GROUPS"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="连接类型" required>
          <el-select v-model="addKeyForm.connectionType" class="add-key-field">
            <el-option label="长连接" value="长连接" />
            <el-option label="短连接" value="短连接" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥名称" required>
          <el-input v-model="addKeyForm.keyName" class="add-key-field" placeholder="请输入密钥名称" />
        </el-form-item>
        <el-form-item label="密钥长度" required>
          <el-select
            v-model="addKeyForm.keyLength"
            class="add-key-field"
            :disabled="['Ed25519', 'SM9主密钥'].includes(addKeyForm.keyType)"
          >
            <el-option
              v-for="len in addKeyLengthOptions"
              :key="len"
              :label="len"
              :value="len"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥用途" required>
          <template v-if="isSignVerifyOnlyType">
            <el-checkbox-group v-model="addKeyForm.keyUsages" class="add-key-usages add-key-usages--disabled" disabled>
              <el-checkbox label="签名验签" />
            </el-checkbox-group>
          </template>
          <template v-else>
            <el-checkbox-group v-model="addKeyForm.keyUsages" class="add-key-usages">
              <el-checkbox label="加密解密" />
              <el-checkbox label="签名验签" />
            </el-checkbox-group>
          </template>
        </el-form-item>
        <el-form-item label="密钥设备分组类型">
          <el-radio-group v-model="addKeyForm.groupType">
            <el-radio label="订阅密钥机分组" />
            <el-radio label="单体密码机分组" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="密钥机分组">
          <el-select v-model="addKeyForm.deviceGroup" class="add-key-field">
            <el-option label="系统分组" value="系统分组" />
          </el-select>
        </el-form-item>
        <el-form-item label="密钥索引">
          <el-input v-model="addKeyForm.keyIndex" class="add-key-field" placeholder="请输入密钥索引" />
        </el-form-item>
        <el-form-item label="生效时间">
          <div class="datetime-row">
            <el-date-picker
              v-model="addKeyForm.effectiveAt"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="add-key-field"
              :disabled="addKeyForm.effectiveNow"
              placeholder="请选择生效时间"
            />
            <el-checkbox v-model="addKeyForm.effectiveNow">立即生效</el-checkbox>
          </div>
        </el-form-item>
        <el-form-item label="失效时间">
          <div class="datetime-row">
            <el-date-picker
              v-model="addKeyForm.expireAt"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="add-key-field"
              :disabled="addKeyForm.longTermValid"
              placeholder="请选择失效时间"
            />
            <el-checkbox v-model="addKeyForm.longTermValid">长期有效</el-checkbox>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addKeyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddKey">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const initialRows = [
  {
    id: '1747377955573801',
    name: 'MAK',
    version: '01',
    status: '已激活',
    typeLabel: 'SM2密钥_256',
    typeDesc: '加密密钥,签名校验',
    group: '系统分组',
    replica: '1 / 1',
    source: '本地创建',
    addedBy: 'mail_super_admin',
    addedAt: '2025-05-16 14:45:56',
    effectiveAt: '2025-05-16 14:45:56',
    expireAt: '长期有效'
  }
]

const query = reactive({
  keyId: '',
  keyName: '',
  keyVersion: '',
  usage: '',
  type: '',
  status: '',
  group: '',
  addedRange: null
})

const appliedQuery = reactive({ ...query })
const page = ref(1)
const pageSize = ref(10)
const addKeyDialogVisible = ref(false)
const KEY_TYPE_GROUPS = [
  {
    label: 'PKI体系密钥',
    options: [
      { label: 'DSA', value: 'DSA' },
      { label: 'Ed25519', value: 'Ed25519' }
    ]
  },
  {
    // label: 'IBC体系密钥',
    // options: [{ label: 'SM9主密钥', value: 'SM9主密钥' }]
  }
]
const addKeyForm = reactive({
  keyType: 'DSA',
  connectionType: '长连接',
  keyName: '',
  keyUsages: ['加密解密', '签名验签'],
  keyLength: '2048',
  groupType: '单体密码机分组',
  deviceGroup: '',
  keyIndex: '',
  effectiveAt: '',
  expireAt: '',
  effectiveNow: true,
  longTermValid: true
})

const ADD_KEY_LENGTH_MAP = {
  DSA: ['2048', '3072'],
  Ed25519: ['256'],
  SM9主密钥: ['256']
}

const addKeyLengthOptions = computed(() => ADD_KEY_LENGTH_MAP[addKeyForm.keyType] || ['2048'])
const isSignVerifyOnlyType = computed(() => ['DSA', 'Ed25519'].includes(addKeyForm.keyType))

function handleSearch() {
  Object.assign(appliedQuery, query)
  page.value = 1
}

function handleReset() {
  query.keyId = ''
  query.keyName = ''
  query.keyVersion = ''
  query.usage = ''
  query.type = ''
  query.status = ''
  query.group = ''
  query.addedRange = null
  Object.assign(appliedQuery, query)
  page.value = 1
}

const filteredRows = computed(() =>
  initialRows.filter((row) => {
    if (appliedQuery.keyId && !row.id.includes(appliedQuery.keyId)) return false
    if (appliedQuery.keyName && !row.name.includes(appliedQuery.keyName)) return false
    if (appliedQuery.keyVersion && !row.version.includes(appliedQuery.keyVersion)) return false
    if (appliedQuery.usage && !row.typeDesc.includes(appliedQuery.usage)) return false
    if (appliedQuery.type && row.typeLabel !== appliedQuery.type) return false
    if (appliedQuery.status && row.status !== appliedQuery.status) return false
    if (appliedQuery.group && row.group !== appliedQuery.group) return false
    return true
  })
)

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

watch(pageSize, () => {
  page.value = 1
})

watch(
  () => addKeyForm.keyType,
  (type) => {
    if (['DSA', 'Ed25519'].includes(type)) {
      addKeyForm.keyUsages = ['签名验签']
    } else if (!addKeyForm.keyUsages.length) {
      addKeyForm.keyUsages = ['加密解密']
    }
    if (type === 'Ed25519' || type === 'SM9主密钥') {
      addKeyForm.keyLength = '256'
    } else {
      if (!ADD_KEY_LENGTH_MAP.DSA.includes(addKeyForm.keyLength)) {
        addKeyForm.keyLength = '2048'
      }
    }
  },
  { immediate: true }
)

function openAddKeyDialog() {
  addKeyDialogVisible.value = true
}

function submitAddKey() {
  if (!addKeyForm.keyType) {
    ElMessage.warning('请选择密钥类型')
    return
  }
  if (!addKeyForm.connectionType) {
    ElMessage.warning('请选择连接类型')
    return
  }
  if (!addKeyForm.keyName.trim()) {
    ElMessage.warning('请输入密钥名称')
    return
  }
  if (!addKeyForm.keyLength) {
    ElMessage.warning('请选择密钥长度')
    return
  }
  if (!addKeyForm.keyUsages.length) {
    ElMessage.warning('请选择密钥用途')
    return
  }
  addKeyDialogVisible.value = false
  ElMessage.success('添加密钥成功（原型）')
}
</script>

<style scoped>
.page-container {
  padding: 16px;
  min-height: 100%;
  font-size: 12px;
}

.search-card {
  background: #fff;
  border: 1px solid var(--neutral-4);
  padding: 10px;
}

.search-form :deep(.el-form-item) {
  margin-right: 8px;
  margin-bottom: 8px;
}

.search-form :deep(.el-form-item__label),
.search-form :deep(.el-input__inner),
.search-form :deep(.el-select__placeholder),
.search-form :deep(.el-range-input),
.search-form :deep(.el-button) {
  font-size: 12px;
}

.search-form :deep(.el-form-item__label) {
  width: auto !important;
  min-width: 0 !important;
  text-align: left;
  justify-content: flex-start;
  white-space: nowrap;
  padding-right: 6px;
}

.actions {
  margin-left: 0;
}

.table-card {
  margin-top: 12px;
  background: #fff;
  border: 1px solid var(--neutral-4);
}

.toolbar {
  padding: 10px 12px;
  border-bottom: 1px solid var(--neutral-4);
}

.name-cell {
  line-height: 1.4;
}

.sub-text {
  color: var(--neutral-9);
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success-6);
}

.ops {
  display: inline-flex;
  gap: 8px;
  white-space: nowrap;
}

.pager-wrap {
  padding: 10px 12px;
}

.table-card :deep(.el-table),
.table-card :deep(.el-table th),
.table-card :deep(.el-table td),
.table-card :deep(.el-button) {
  font-size: 12px !important;
}

.add-key-form :deep(.el-form-item__label),
.add-key-form :deep(.el-input__inner),
.add-key-form :deep(.el-select__placeholder),
.add-key-form :deep(.el-checkbox__label),
.add-key-form :deep(.el-radio__label),
.add-key-form :deep(.el-button),
.add-key-form :deep(.el-date-editor .el-input__inner) {
  font-size: 12px;
}

.add-key-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.add-key-field {
  width: 520px;
}

.datetime-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.datetime-row .add-key-field {
  width: 520px;
}

.datetime-row :deep(.el-date-editor.el-input),
.datetime-row :deep(.el-date-editor.el-input__wrapper) {
  width: 420px;
}

.add-key-usages {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 16px;
}

.add-key-usages--disabled :deep(.el-checkbox__label) {
  color: var(--neutral-7) !important;
}

.add-key-usages--disabled :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner) {
  background-color: var(--neutral-3) !important;
  border-color: var(--neutral-4) !important;
}

.add-key-usages--disabled :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after) {
  border-color: var(--neutral-7) !important;
}

.add-key-usages--disabled :deep(.el-checkbox__input.is-disabled .el-checkbox__inner) {
  background-color: var(--neutral-3) !important;
  border-color: var(--neutral-4) !important;
}
</style>

<style>
.add-key-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.add-key-dialog .el-dialog__header {
  margin: 0;
  padding: 10px 14px;
  background: var(--neutral-2);
  border-bottom: 1px solid var(--neutral-4);
}

.add-key-dialog .el-dialog__body {
  padding: 16px 14px 8px;
}

.add-key-dialog .el-dialog__footer {
  padding: 8px 14px 12px;
  border-top: 1px solid var(--neutral-4);
}

.key-type-select-dropdown .el-select-group__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.key-type-select-dropdown .el-select-group__title::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 1px;
  background: var(--brand-6);
  flex: 0 0 auto;
}

.key-type-select-dropdown .el-select-group__wrap:nth-of-type(2) .el-select-group__title::before {
  background: var(--success-6);
}
</style>

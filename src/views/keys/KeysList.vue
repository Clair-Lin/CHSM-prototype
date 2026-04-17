<template>
  <div class="page-container keys-list-page">
    <div class="breadcrumb">
      <span class="crumb-segment">密钥信息</span>
      <el-icon class="crumb-sep"><span class="slash">/</span></el-icon>
      <span class="crumb-segment">密钥列表</span>
      <el-icon class="crumb-sep"><span class="slash">/</span></el-icon>
      <span class="crumb-leaf">{{ currentLeaf }}</span>
    </div>
    <h1 class="page-title">{{ currentLeaf }}</h1>

    <div class="content-module tabs-card">
      <el-tabs v-model="activeTab" class="key-list-tabs">
        <el-tab-pane label="系统管理主密钥" name="sys" />
        <el-tab-pane label="机构-密码机密钥" name="hsm" />
        <el-tab-pane label="机构-库内密钥" name="lib" />
      </el-tabs>
    </div>

    <KeysListSysMasterKey v-if="activeTab === 'sys'" />
    <KeysListInstitutionHsmKey v-else-if="activeTab === 'hsm'" />
    <KeysListInstitutionLibraryKey v-else />

    <MakeExportKeyDialog ref="makeExportKeyDialogRef" @make-completed="onMakeExportCompleted" />
    <ImportRecoverDialog ref="importRecoverDialogRef" />
    <ExportKeyFlowDialog ref="exportKeyFlowRef" />
  </div>
</template>

<script setup>
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KeysListSysMasterKey from './KeysListSysMasterKey.vue'
import KeysListInstitutionHsmKey from './KeysListInstitutionHsmKey.vue'
import KeysListInstitutionLibraryKey from './KeysListInstitutionLibraryKey.vue'
import ExportKeyFlowDialog from './ExportKeyFlowDialog.vue'
import MakeExportKeyDialog from './MakeExportKeyDialog.vue'
import ImportRecoverDialog from './ImportRecoverDialog.vue'
import { hasMadeExportKeyOnce } from './exportKeyFlowPreference.js'
import './keyListCommon.css'

const exportKeyFlowRef = ref(null)
const makeExportKeyDialogRef = ref(null)
const importRecoverDialogRef = ref(null)
function openExportKeyFlowOrchestrated(row) {
  exportKeyFlowRef.value?.open(row, { hasMadeBefore: hasMadeExportKeyOnce() })
}

function onMakeExportCompleted(row) {
  exportKeyFlowRef.value?.open(row, { hasMadeBefore: true, resumeStep2: true })
}

function openMakeExportKeyDialog(row, opts = {}) {
  makeExportKeyDialogRef.value?.open(row, { chainAfter: false, ...opts })
}

function openImportRecoverFlow(row) {
  importRecoverDialogRef.value?.open(row)
}

provide('openExportKeyFlow', openExportKeyFlowOrchestrated)
provide('openMakeExportKeyDialog', openMakeExportKeyDialog)
provide('openImportRecoverFlow', openImportRecoverFlow)

const route = useRoute()
const router = useRouter()

const activeTab = ref('sys')

const TAB_META = {
  sys: '系统管理主密钥',
  hsm: '机构-密码机密钥',
  lib: '机构-库内密钥'
}

const currentLeaf = computed(() => TAB_META[activeTab.value] || TAB_META.sys)

function normalizeTab(raw) {
  if (raw === 'hsm' || raw === 'lib' || raw === 'sys') return raw
  return 'sys'
}

onMounted(() => {
  activeTab.value = normalizeTab(route.query.tab)
})

watch(
  () => route.query.tab,
  (t) => {
    const n = normalizeTab(t)
    if (activeTab.value !== n) activeTab.value = n
  }
)

watch(activeTab, (name) => {
  if (normalizeTab(route.query.tab) !== name) {
    router.replace({ path: route.path, query: { ...route.query, tab: name } })
  }
})
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
  box-shadow: var(--shadow-1);
}
</style>

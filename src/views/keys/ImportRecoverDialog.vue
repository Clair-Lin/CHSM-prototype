<template>
  <el-dialog
    v-model="visible"
    :width="dialogWidth"
    align-center
    destroy-on-close
    class="import-recover-dialog"
    :show-close="true"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <template #header>
      <span class="import-recover-dialog__title">密钥恢复</span>
    </template>

    <div class="import-recover-body">
      <p v-if="keyRow && step !== 'upload'" class="import-recover-ctx">
        当前密钥：{{ keyRow.name }}（{{ keyRow.id }}）
      </p>
      <el-steps :active="stepActive" finish-status="success" align-center class="import-recover-steps">
        <el-step title="上传密钥备份文件" />
        <el-step title="导入保护密钥" />
        <el-step title="密钥恢复" />
      </el-steps>

      <template v-if="step === 'upload'">
        <div class="upload-board" @click="triggerPickFile">
          <el-icon class="upload-board__icon"><Upload /></el-icon>
          <p class="upload-board__text">
            {{ uploadFileName || '将密钥备份文件拖到此处，或点击上传，支持格式：.enc' }}
          </p>
          <input
            ref="fileInputRef"
            type="file"
            accept=".enc"
            class="upload-board__input"
            @change="onFilePicked"
          />
        </div>
      </template>

      <template v-else-if="step === 'verify'">
        <p class="import-verify-lead import-verify-lead--strong">请准备 3 个带有保护密钥的 UKEY，依次插入</p>
        <div class="import-backup-checklist">
          <div class="import-backup-checklist__item">
            <el-icon
              v-if="precheckControlState === 'loading'"
              class="import-backup-checklist__icon import-backup-checklist__icon--spin"
              :size="22"
            >
              <Loading />
            </el-icon>
            <el-icon v-else class="import-backup-checklist__icon import-backup-checklist__icon--success" :size="22">
              <CircleCheck />
            </el-icon>
            <div class="import-backup-checklist__body">
              <div class="import-backup-checklist__title">启动安全控件</div>
              <p class="import-backup-checklist__desc">
                绑定 UKey 前，请确保您的电脑中安装并启动了「身份认证客户端」软件，如无安装，请点击
                <a href="javascript:void(0)" class="import-backup-checklist__link" @click.prevent="onDownloadControl">
                  下载安全控件
                </a>
                进行下载；
              </p>
            </div>
          </div>
          <div class="import-backup-checklist__item">
            <el-icon
              v-if="precheckInsertState === 'loading'"
              class="import-backup-checklist__icon import-backup-checklist__icon--spin"
              :size="22"
            >
              <Loading />
            </el-icon>
            <el-icon
              v-else-if="precheckInsertState === 'success'"
              class="import-backup-checklist__icon import-backup-checklist__icon--success"
              :size="22"
            >
              <CircleCheck />
            </el-icon>
            <span v-else class="import-backup-checklist__icon-wrap import-backup-checklist__icon-wrap--error" aria-hidden="true">
              <el-icon class="import-backup-checklist__icon-inner" :size="14"><Close /></el-icon>
            </span>
            <div class="import-backup-checklist__body">
              <div class="import-backup-checklist__title">插入 UKEY</div>
              <p class="import-backup-checklist__desc">
                请插入 UKey，若未检测到 UKey，请重新插入 UKey 或
                <a href="javascript:void(0)" class="import-backup-checklist__link" @click.prevent="onRefreshUkey">刷新</a>
              </p>
            </div>
          </div>
        </div>

        <template v-if="verifyUkeyCardsVisible">
          <div class="import-ukey-cards" role="list">
            <div
              v-for="slot in displaySlots"
              :key="slot.id"
              class="import-ukey-card"
              :class="{ 'import-ukey-card--active': slot.active, 'import-ukey-card--done': slot.done }"
              role="listitem"
            >
              <el-icon class="import-ukey-card__icon" :size="36"><Key /></el-icon>
              <div class="import-ukey-card__label">{{ slot.label }}</div>
              <div class="import-ukey-card__sub">{{ slot.sub }}</div>
            </div>
          </div>
        </template>
      </template>

      <template v-else>
        <div class="recover-ready">
          <div class="recover-ready__icon-wrap">
            <el-icon class="recover-ready__icon"><Upload /></el-icon>
          </div>
          <p class="recover-ready__text">准备就绪，点击下方按钮开始恢复密钥</p>
          <el-button type="primary" class="recover-ready__btn" @click="onStartRecover">开始恢复</el-button>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="import-recover-footer">
        <el-button class="btn-outline" @click="close">取消</el-button>
        <template v-if="step === 'upload'">
          <el-button type="primary" :disabled="!uploadFileName" @click="goUploadNext">下一步</el-button>
        </template>
        <template v-else-if="step === 'verify'">
          <el-button class="btn-outline" @click="onRefreshUkey">刷新 UKEY</el-button>
          <el-button class="btn-outline" @click="goVerifyPrev">上一步</el-button>
          <el-button type="primary" :disabled="!allPinsDone" @click="goVerifyNext">下一步</el-button>
        </template>
        <template v-else>
          <el-button class="btn-outline" @click="goRecoverPrev">上一步</el-button>
        </template>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="pinVisible"
    title="输入PIN码"
    width="420px"
    align-center
    append-to-body
    destroy-on-close
    class="export-pin-dialog"
    :close-on-click-modal="false"
    @closed="onPinDialogClosed"
  >
    <p v-if="pinTargetLabel" class="pin-dialog-hint">正在为 {{ pinTargetLabel }} 校验 PIN</p>
    <el-form ref="pinFormRef" :model="pinForm" :rules="pinRules" label-width="88px" class="pin-form">
      <el-form-item label="容器" prop="container">
        <el-select v-model="pinForm.container" placeholder="请选择容器" clearable style="width: 100%">
          <el-option v-for="opt in containerOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="PIN码" prop="pin">
        <el-input v-model="pinForm.pin" type="password" show-password placeholder="请输入 UKEY 的 PIN 码" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="pinVisible = false">取消</el-button>
      <el-button type="primary" @click="onPinConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { CircleCheck, Close, Key, Loading, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const keyRow = ref(null)
const step = ref('upload')
const uploadFileName = ref('')
const fileInputRef = ref(null)

const currentSlotIndex = ref(0)
const insertDetected = ref(false)
const precheckControlState = ref('loading')
const precheckInsertState = ref('loading')
/** 首次识别到 UKEY 后再展示三卡片区（图2） */
const verifyUkeyCardsVisible = ref(false)
let precheckTimer = null

const ukeySlots = ref([
  { id: '1', label: 'UKEY_1', done: false },
  { id: '2', label: 'UKEY_2', done: false },
  { id: '3', label: 'UKEY_3', done: false }
])

const pinVisible = ref(false)
const pinFormRef = ref(null)
const pinForm = reactive({ container: '', pin: '' })
const pinRules = {
  container: [{ required: true, message: '请选择容器', trigger: 'change' }],
  pin: [{ required: true, message: '请输入 PIN 码', trigger: 'blur' }]
}

const stepActive = computed(() => (step.value === 'upload' ? 0 : step.value === 'verify' ? 1 : 2))
const dialogWidth = computed(() => {
  if (step.value === 'recover') return '640px'
  if (step.value === 'verify') return verifyUkeyCardsVisible.value ? '760px' : '680px'
  return '820px'
})
const allPinsDone = computed(() => ukeySlots.value.every((s) => s.done))
const pinTargetLabel = computed(() => ukeySlots.value[currentSlotIndex.value]?.label ?? '')
const containerOptions = computed(() => {
  const n = currentSlotIndex.value + 1
  return [
    { label: `UKEY_${n} 默认容器`, value: `ukey${n}-default` },
    { label: `UKEY_${n} 备用容器`, value: `ukey${n}-alt` }
  ]
})

function slotSubtext(i, done) {
  if (done) return 'PIN 已验证'
  if (i < currentSlotIndex.value) return '—'
  if (i === currentSlotIndex.value) {
    return insertDetected.value ? '已识别 UKEY，请输入 PIN' : '请插入 UKEY，插入后点击「刷新 UKEY」'
  }
  return '等待依次插入'
}

const displaySlots = computed(() =>
  ukeySlots.value.map((s, i) => ({
    ...s,
    active: !s.done && i === currentSlotIndex.value,
    sub: slotSubtext(i, s.done)
  }))
)

function clearPrecheckTimer() {
  if (precheckTimer != null) {
    clearTimeout(precheckTimer)
    precheckTimer = null
  }
}

function startPrecheckStatusLoading() {
  precheckControlState.value = 'loading'
  precheckInsertState.value = 'loading'
  clearPrecheckTimer()
  precheckTimer = window.setTimeout(() => {
    precheckControlState.value = 'success'
    precheckInsertState.value = 'error'
    precheckTimer = null
  }, 850)
}

function resetVerifyFlow() {
  verifyUkeyCardsVisible.value = false
  currentSlotIndex.value = 0
  insertDetected.value = false
  ukeySlots.value = [
    { id: '1', label: 'UKEY_1', done: false },
    { id: '2', label: 'UKEY_2', done: false },
    { id: '3', label: 'UKEY_3', done: false }
  ]
  pinVisible.value = false
  pinForm.container = ''
  pinForm.pin = ''
  pinFormRef.value?.resetFields?.()
  startPrecheckStatusLoading()
}

function open(row) {
  keyRow.value = row && typeof row === 'object' ? row : null
  uploadFileName.value = ''
  step.value = 'upload'
  resetVerifyFlow()
  visible.value = true
}

function close() {
  visible.value = false
}

function onClosed() {
  clearPrecheckTimer()
  pinVisible.value = false
  keyRow.value = null
}

function triggerPickFile() {
  fileInputRef.value?.click()
}

function onFilePicked(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.enc')) {
    ElMessage.error('仅支持 .enc 格式文件')
    event.target.value = ''
    return
  }
  uploadFileName.value = file.name
}

function goUploadNext() {
  step.value = 'verify'
  resetVerifyFlow()
}

function goVerifyPrev() {
  step.value = 'upload'
}

function goVerifyNext() {
  step.value = 'recover'
}

function goRecoverPrev() {
  step.value = 'verify'
}

function onDownloadControl() {
  ElMessage.info('下载安全控件为占位能力，后续接入下载地址。')
}

async function openPinDialog() {
  pinForm.container = ''
  pinForm.pin = ''
  pinFormRef.value?.resetFields?.()
  await nextTick()
  pinVisible.value = true
}

async function onRefreshUkey() {
  if (step.value !== 'verify') return
  if (allPinsDone.value) {
    ElMessage.info('全部 UKEY 已验证，无需再刷新。')
    return
  }
  if (pinVisible.value) {
    ElMessage.info('请先完成或关闭当前 PIN 输入框。')
    return
  }
  if (insertDetected.value) {
    await openPinDialog()
    ElMessage.info('已重新打开 PIN 输入。')
    return
  }
  insertDetected.value = true
  verifyUkeyCardsVisible.value = true
  precheckInsertState.value = 'success'
  const s = ukeySlots.value[currentSlotIndex.value]
  ElMessage.success(`已检测到 ${s.label}（原型），正在打开 PIN 输入…`)
  await nextTick()
  await openPinDialog()
}

function onPinDialogClosed() {
  pinForm.container = ''
  pinForm.pin = ''
}

function onPinConfirm() {
  pinFormRef.value?.validate((ok) => {
    if (!ok) return
    pinVisible.value = false
    const idx = currentSlotIndex.value
    ukeySlots.value[idx] = { ...ukeySlots.value[idx], done: true }
    if (idx < 2) {
      currentSlotIndex.value = idx + 1
      insertDetected.value = false
      ElMessage.success(`${ukeySlots.value[idx].label} PIN 验证通过，请插入下一支 UKEY，插入后点击「刷新 UKEY」。`)
    } else {
      ElMessage.success('三支 UKEY 均已验证，请点击「下一步」继续。')
    }
  })
}

function onStartRecover() {
  ElMessage.success('已开始恢复密钥（原型），后续接入接口。')
}

defineExpose({ open, close })
</script>

<style scoped>
.import-recover-body { padding: 8px 8px 12px; }
.import-recover-steps { margin-bottom: 22px; }
.import-recover-steps :deep(.el-step__title) { font-size: 12px; line-height: 1.4; max-width: 180px; }

.upload-board {
  border: 1px dashed var(--brand-4);
  border-radius: 6px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fafbfc;
}
.upload-board__icon { font-size: 48px; color: var(--neutral-6); margin-bottom: 14px; }
.upload-board__text { font-size: 14px; color: var(--neutral-7); }
.upload-board__input { display: none; }

.import-verify-lead {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--neutral-10);
  line-height: 1.5;
}
.import-verify-lead--strong {
  font-weight: 600;
  margin-bottom: 16px;
}

.import-backup-checklist {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 4px 0 12px;
}
.import-backup-checklist__item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.import-backup-checklist__icon--success {
  flex-shrink: 0;
  color: var(--el-color-success);
  margin-top: 2px;
}
.import-backup-checklist__icon--spin {
  flex-shrink: 0;
  color: var(--brand-6);
  margin-top: 2px;
  animation: import-precheck-spin 1s linear infinite;
}
@keyframes import-precheck-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.import-backup-checklist__icon-wrap {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.import-backup-checklist__icon-wrap--error {
  background: var(--error-6);
  color: #fff;
}
.import-backup-checklist__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--neutral-10);
  margin-bottom: 6px;
}
.import-backup-checklist__desc {
  margin: 0;
  font-size: 12px;
  color: var(--neutral-8);
  line-height: 1.55;
}
.import-backup-checklist__link {
  color: var(--brand-6);
  cursor: pointer;
  text-decoration: none;
}
.import-backup-checklist__link:hover {
  color: var(--brand-5);
  text-decoration: underline;
}

.import-ukey-cards {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 18px;
  padding: 4px 0 8px;
}
.import-ukey-card {
  flex: 1;
  min-width: 200px;
  max-width: 220px;
  border: 1px solid var(--neutral-4);
  border-radius: 4px;
  padding: 20px 16px 16px;
  text-align: center;
  background: var(--neutral-2);
  transition:
    border-color 0.2s,
    background 0.2s;
}
.import-ukey-card__icon {
  color: var(--neutral-6);
  margin-bottom: 10px;
}
.import-ukey-card__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-8);
  margin-bottom: 8px;
}
.import-ukey-card__sub {
  font-size: 12px;
  color: var(--neutral-7);
  line-height: 1.45;
}
.import-ukey-card--active {
  border-color: var(--brand-6);
  background: var(--neutral-0);
  box-shadow: 0 0 0 1px var(--brand-6);
}
.import-ukey-card--active .import-ukey-card__icon {
  color: var(--brand-6);
}
.import-ukey-card--active .import-ukey-card__label {
  color: var(--neutral-10);
}
.import-ukey-card--active .import-ukey-card__sub {
  color: var(--neutral-9);
}
.import-ukey-card--done {
  border-color: var(--el-color-success);
  background: var(--neutral-0);
  box-shadow: 0 0 0 1px var(--el-color-success);
}
.import-ukey-card--done .import-ukey-card__icon {
  color: var(--el-color-success);
}

.recover-ready { text-align: center; padding: 24px 20px 32px; }
.recover-ready__icon-wrap { width: 96px; height: 96px; margin: 0 auto 18px; border-radius: 50%; background: var(--el-color-success); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(48, 179, 70, 0.32); }
.recover-ready__icon { font-size: 52px; color: #fff; }
.recover-ready__text { margin: 0 0 24px; font-size: 14px; color: var(--neutral-10); }
.recover-ready__btn { min-width: 160px; }

.pin-dialog-hint { margin: 0 0 12px; font-size: 12px; color: var(--neutral-8); }
.pin-form :deep(.el-form-item) { margin-bottom: 16px; }

.import-recover-footer { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
.btn-outline { border-color: var(--neutral-5); color: var(--neutral-10); background: var(--neutral-0); }
.btn-outline:hover { border-color: var(--brand-4); color: var(--brand-6); background: var(--brand-1); }
</style>

<style>
.import-recover-dialog.el-dialog,
.export-pin-dialog.el-dialog { padding: 0; overflow: hidden; }

.import-recover-dialog .el-dialog__header,
.export-pin-dialog .el-dialog__header {
  margin: 0;
  padding: 12px 16px;
  background: var(--neutral-3);
  border-bottom: 1px solid var(--neutral-4);
}
.import-recover-dialog__title { font-size: 15px; font-weight: 600; color: var(--neutral-10); }
.import-recover-dialog .el-dialog__headerbtn,
.export-pin-dialog .el-dialog__headerbtn { top: 12px; }

.import-recover-dialog .el-dialog__body { padding: 0 16px; }
.import-recover-dialog .el-dialog__footer,
.export-pin-dialog .el-dialog__footer { padding: 12px 16px 16px; border-top: 1px solid var(--neutral-4); }
.export-pin-dialog .el-dialog__body { padding: 20px 16px 8px; }
</style>

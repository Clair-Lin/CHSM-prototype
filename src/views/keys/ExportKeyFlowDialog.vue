<template>
  <el-dialog
    v-model="visible"
    :width="dialogBodyWidth"
    align-center
    destroy-on-close
    class="export-key-flow-dialog"
    :show-close="true"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <template #header>
      <span class="export-key-flow-dialog__title">密钥备份</span>
    </template>

    <div class="phase-backup">
      <p v-if="keyRow" class="phase-backup__ctx">当前密钥：{{ keyRow.name }}（{{ keyRow.id }}）</p>
      <el-steps :active="backupStepsActive" finish-status="success" align-center class="export-backup-steps">
        <el-step title="导出保护密钥" />
        <el-step title="插入密钥保护KEY" />
        <el-step title="下载密钥备份文件" />
      </el-steps>

      <template v-if="backupSubPhase === 'setup'">
        <p class="setup-headline">保护密钥存储于 UKEY 中，用于加密下载的密钥备份文件。</p>
        <p class="setup-desc">
          您可以选择使用 UKEY 中的现有保护密钥，或重新导出保护密钥到 UKEY。若选择重新导出则历史保护密钥将不可恢复。
        </p>

        
          <button
            type="button"
            class="use-option-btn"
            :class="{ 'setup-option-btn--active': setupDecision === 'reuse', 'setup-option-btn--disabled': !canReuseProtectKey }"
            :disabled="!canReuseProtectKey"
            @click="setupDecision = 'reuse'"
          >
            使用 UKEY 中现有保护密钥
          </button>

          <button
            type="button"
            class="setup-option-btn"
            :class="{ 'setup-option-btn--active': setupDecision === 'remake' }"
            @click="setupDecision = 'remake'"
          >
            重新导出保护密钥到 UKEY
          </button>

        <p class="setup-tip">
          （注意：重新导出保护密钥时新 UKEY 保护密钥将覆盖 UKEY 中原来的保存密钥，之前的密钥备份文件将无法恢复。）
        </p>
      </template>

      <template v-else-if="backupSubPhase === 'precheck'">
        <p class="phase-backup__lead phase-backup__lead--strong">
          请准备 3 个带有保护密钥的 UKEY，依次插入
        </p>
        <div class="backup-checklist">
          <div class="backup-checklist__item backup-checklist__item--ok">
            <el-icon
              v-if="precheckControlState === 'loading'"
              class="backup-checklist__icon backup-checklist__icon--spin"
              :size="22"
            >
              <Loading />
            </el-icon>
            <el-icon v-else class="backup-checklist__icon backup-checklist__icon--success" :size="22">
              <CircleCheck />
            </el-icon>
            <div class="backup-checklist__body">
              <div class="backup-checklist__title">启动安全控件</div>
              <p class="backup-checklist__desc">
                绑定 UKey 前，请确保您的电脑中安装并启动了「身份认证客户端」软件，如无安装，请点击
                <a href="javascript:void(0)" class="backup-checklist__link" @click.prevent="onDownloadControl">
                  下载安全控件
                </a>
                进行下载；
              </p>
            </div>
          </div>
          <div class="backup-checklist__item backup-checklist__item--err">
            <el-icon
              v-if="precheckInsertState === 'loading'"
              class="backup-checklist__icon backup-checklist__icon--spin"
              :size="22"
            >
              <Loading />
            </el-icon>
            <span v-else class="backup-checklist__icon-wrap backup-checklist__icon-wrap--error" aria-hidden="true">
              <el-icon class="backup-checklist__icon-inner" :size="14"><Close /></el-icon>
            </span>
            <div class="backup-checklist__body">
              <div class="backup-checklist__title">插入 UKEY</div>
              <p class="backup-checklist__desc">
                请插入 UKey，若未检测到 UKey，请重新插入 UKey 或
                <a href="javascript:void(0)" class="backup-checklist__link" @click.prevent="onRefreshUkey">刷新</a>
              </p>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="backupSubPhase === 'ukeys'">
        <p class="phase-backup__lead">
          请准备 3 个带有保护密钥的 UKEY，依次插入；每插入一支后点击「刷新 UKEY」检测，识别成功后将自动弹出 PIN 输入。
        </p>

        <div class="ukey-cards" role="list">
          <div
            v-for="slot in displaySlots"
            :key="slot.id"
            class="ukey-card"
            :class="{ 'ukey-card--active': slot.active, 'ukey-card--done': slot.done }"
            role="listitem"
          >
            <el-icon class="ukey-card__icon" :size="36"><Key /></el-icon>
            <div class="ukey-card__label">{{ slot.label }}</div>
            <div class="ukey-card__sub">{{ slot.sub }}</div>
          </div>
        </div>
      </template>

      <div v-else-if="backupSubPhase === 'download'" class="phase-download">
        <div class="phase-download__icon-wrap" aria-hidden="true">
          <el-icon class="phase-download__icon"><Upload /></el-icon>
        </div>
        <p class="phase-download__text">密钥备份文件已生成，请点击下方按钮下载</p>
        <el-button type="primary" class="phase-download__btn" @click="onDownloadBackupFile">下载备份文件</el-button>
      </div>
    </div>

    <template #footer>
      <div
        v-if="backupSubPhase === 'download'"
        class="export-key-flow-dialog__footer export-key-flow-dialog__footer--download"
      >
        <el-button class="btn-footer-outline" @click="close">取消</el-button>
        <el-button class="btn-footer-outline" @click="onDownloadStepPrev">上一步</el-button>
      </div>
      <div
        v-else-if="backupSubPhase === 'setup'"
        class="export-key-flow-dialog__footer export-key-flow-dialog__footer--setup"
      >
        <el-button class="btn-footer-outline" @click="close">取消导出</el-button>
        <el-button class="btn-footer-outline" @click="onRefreshUkey">刷新UKEY</el-button>
        <el-button type="primary" @click="onSetupNext">下一步</el-button>
      </div>
      <div
        v-else-if="backupSubPhase === 'precheck'"
        class="export-key-flow-dialog__footer export-key-flow-dialog__footer--precheck"
      >
        <el-button class="btn-footer-outline" @click="close">取消</el-button>
        <el-button class="btn-footer-outline" @click="onRefreshUkey">刷新 UKEY</el-button>
        <el-button type="primary" @click="onBackupPrev">上一步</el-button>
        <el-button type="primary" disabled class="btn-select-key-precheck">选择密钥</el-button>
      </div>
      <div v-else class="export-key-flow-dialog__footer export-key-flow-dialog__footer--backup">
        <el-button @click="close">取消</el-button>
        <el-button @click="onRefreshUkey">刷新 UKEY</el-button>
        <el-button type="primary" @click="onBackupPrev">上一步</el-button>
        <el-button v-if="allPinsDone" type="primary" @click="onGoDownloadStep">下一步</el-button>
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
        <el-input
          v-model="pinForm.pin"
          type="password"
          show-password
          placeholder="请输入 UKEY 的 PIN 码"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closePinOnly">取消</el-button>
      <el-button type="primary" @click="onPinConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, inject, nextTick, reactive, ref } from 'vue'
import { CircleCheck, Close, Key, Loading, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const keyRow = ref(null)
const openMakeExportKeyDialog = inject('openMakeExportKeyDialog', null)

/** 当前待验证的 UKEY 下标 0..2 */
const currentSlotIndex = ref(0)
/** 当前支是否已通过「刷新 UKEY」检测到已插入 */
const insertDetected = ref(false)
/** 备份主流程：预检（未插第一把）/ UKEY 卡片与 PIN / 下载 */
const backupSubPhase = ref('setup')
/** 第一步模式：首次制作 / 非首次选择 */
const setupMode = ref('make')
const setupDecision = ref('reuse')
const precheckControlState = ref('loading')
const precheckInsertState = ref('loading')
const canReuseProtectKey = computed(() => setupMode.value === 'choose')

const pinVisible = ref(false)
const pinFormRef = ref(null)
const pinForm = reactive({
  container: '',
  pin: ''
})

const pinRules = {
  container: [{ required: true, message: '请选择容器', trigger: 'change' }],
  pin: [{ required: true, message: '请输入 PIN 码', trigger: 'blur' }]
}

const ukeySlots = ref([
  { id: '1', label: 'UKEY_1', done: false },
  { id: '2', label: 'UKEY_2', done: false },
  { id: '3', label: 'UKEY_3', done: false }
])

const allPinsDone = computed(() => ukeySlots.value.every((s) => s.done))

/** 三步流程：0-导出密钥制作步骤 1-插入保护key 2-下载备份 */
const backupStepsActive = computed(() => {
  if (backupSubPhase.value === 'setup') return 0
  if (backupSubPhase.value === 'download') return 2
  return 1
})

const dialogBodyWidth = computed(() => {
  if (backupSubPhase.value === 'download') return '640px'
  if (backupSubPhase.value === 'precheck' || backupSubPhase.value === 'setup') return '680px'
  return '760px'
})

const pinTargetLabel = computed(() => {
  const s = ukeySlots.value[currentSlotIndex.value]
  return s?.label ?? ''
})

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

let precheckTimer = null

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

function resetBackupFlow() {
  backupSubPhase.value = 'setup'
  setupMode.value = 'make'
  setupDecision.value = 'reuse'
  clearPrecheckTimer()
  precheckControlState.value = 'loading'
  precheckInsertState.value = 'loading'
  currentSlotIndex.value = 0
  insertDetected.value = false
  ukeySlots.value = [
    { id: '1', label: 'UKEY_1', done: false },
    { id: '2', label: 'UKEY_2', done: false },
    { id: '3', label: 'UKEY_3', done: false }
  ]
}

function resetPinForm() {
  pinForm.container = ''
  pinForm.pin = ''
  pinFormRef.value?.resetFields?.()
}

async function openPinDialog() {
  resetPinForm()
  await nextTick()
  pinVisible.value = true
}

function open(row, opts = {}) {
  keyRow.value = row
  setupMode.value = opts.hasMadeBefore ? 'choose' : 'make'
  setupDecision.value = opts.hasMadeBefore ? 'reuse' : 'remake'
  pinVisible.value = false
  resetBackupFlow()
  setupMode.value = opts.hasMadeBefore ? 'choose' : 'make'
  if (opts.resumeStep2) {
    backupSubPhase.value = 'precheck'
    startPrecheckStatusLoading()
  }
  visible.value = true
}

function close() {
  pinVisible.value = false
  visible.value = false
}

function onClosed() {
  clearPrecheckTimer()
  keyRow.value = null
  pinVisible.value = false
  resetBackupFlow()
  resetPinForm()
}

function onPinDialogClosed() {
  resetPinForm()
}

function closePinOnly() {
  pinVisible.value = false
}

function onPinConfirm() {
  pinFormRef.value?.validate((ok) => {
    if (!ok) return
    pinVisible.value = false
    const idx = currentSlotIndex.value
    ukeySlots.value[idx] = { ...ukeySlots.value[idx], done: true }

    const finishedLabel = ukeySlots.value[idx].label
    if (idx < 2) {
      currentSlotIndex.value = idx + 1
      insertDetected.value = false
      ElMessage.success(`${finishedLabel} PIN 验证通过，请插入下一支 UKEY，插入后点击「刷新 UKEY」。`)
    } else {
      ElMessage.success('三支 UKEY 均已验证，请点击「下一步」继续。')
    }
  })
}

function onBackupPrev() {
  backupSubPhase.value = 'setup'
}

function onGoDownloadStep() {
  backupSubPhase.value = 'download'
}

function onSetupNext() {
  if (setupDecision.value === 'reuse') {
    backupSubPhase.value = 'precheck'
    startPrecheckStatusLoading()
    return
  }

  // 选择「重新导出保护密钥」时，进入制作密钥导出 key 界面
  openMakeExportKeyDialog?.(keyRow.value, { chainAfter: true, fromExportStep1: true })
  close()
}

function onDownloadStepPrev() {
  backupSubPhase.value = 'ukeys'
}

function onDownloadBackupFile() {
  ElMessage.success('开始下载密钥备份文件（原型，后续接入真实下载）。')
}

function onDownloadControl() {
  ElMessage.info('下载安全控件为占位能力，后续接入下载地址。')
}

async function onRefreshUkey() {
  if (backupSubPhase.value === 'precheck') {
    if (pinVisible.value) {
      ElMessage.info('请先完成或关闭当前 PIN 输入框。')
      return
    }
    backupSubPhase.value = 'ukeys'
    insertDetected.value = true
    const s = ukeySlots.value[currentSlotIndex.value]
    ElMessage.success(`已检测到 ${s.label}（原型），正在打开 PIN 输入…`)
    await nextTick()
    await openPinDialog()
    return
  }
  if (backupSubPhase.value !== 'ukeys') return
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
  const s = ukeySlots.value[currentSlotIndex.value]
  ElMessage.success(`已检测到 ${s.label}（原型），正在打开 PIN 输入…`)
  await nextTick()
  await openPinDialog()
}

defineExpose({ open, close })
</script>

<style scoped>
.pin-dialog-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--neutral-8);
}

.phase-detect {
  min-height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.phase-detect__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.phase-detect__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--brand-6);
  animation: export-detect-pulse 1s ease-in-out infinite;
}

@keyframes export-detect-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.85);
  }
}

.phase-detect__text {
  margin: 0;
  font-size: 14px;
  color: var(--brand-6);
}

.phase-backup {
  padding: 8px 8px 16px;
}

.phase-backup__ctx {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--neutral-8);
}

.export-backup-steps {
  margin-bottom: 20px;
}

.export-backup-steps :deep(.el-step__title) {
  font-size: 12px;
  line-height: 1.4;
  max-width: 200px;
}

.phase-backup__lead {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--neutral-10);
  line-height: 1.5;
}

.phase-backup__lead--strong {
  font-weight: 600;
  margin-bottom: 16px;
}

.setup-choice {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.setup-warn {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--warning-7);
}

.setup-headline {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-10);
}

.setup-desc {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--neutral-8);
}

.use-option-btn {
  border: 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--brand-6);
  box-shadow: 1px 1px 1px 1px var(--brand-6);
  background: var(--brand-6);
  color: var(--neutral-0);
  font-size: 12px;
  text-align: left;
  padding: 8px 12px;
  cursor: pointer;
  min-width: 260px;
  margin-bottom: 10px;
}

.setup-option-btn {
  border: 0;
  display: flex;
  border-bottom: 1px solid var(--neutral-0);
  background: var(--neutral-0);
  box-shadow: 1px 1px 1px 1PX var(--neutral-6);
  color: var(--neutral-10);
  font-size: 12px;
  text-align: left;
  padding: 8px 12px;
  cursor: pointer;
  min-width: 260px;
  margin-bottom: 10px;
}

.setup-option-btn:last-child {
  border-bottom: 0;
}

.setup-option-btn--active {
  background: var(--brand-6);
  color: #fff;
}

.setup-option-btn--disabled {
  background: var(--neutral-2);
  color: var(--neutral-7);
  cursor: not-allowed;
}

.setup-tip {
  margin: 0;
  font-size: 12px;
  color: #f0a000;
  line-height: 1.55;
}

.backup-checklist {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 4px 0 12px;
}

.backup-checklist__item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.backup-checklist__icon--success {
  flex-shrink: 0;
  color: var(--el-color-success);
  margin-top: 2px;
}

.backup-checklist__icon--spin {
  flex-shrink: 0;
  color: var(--brand-6);
  margin-top: 2px;
  animation: precheck-spin 1s linear infinite;
}

@keyframes precheck-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.backup-checklist__icon-wrap {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.backup-checklist__icon-wrap--error {
  background: var(--error-6);
  color: #fff;
}

.backup-checklist__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--neutral-10);
  margin-bottom: 6px;
}

.backup-checklist__desc {
  margin: 0;
  font-size: 12px;
  color: var(--neutral-8);
  line-height: 1.55;
}

.backup-checklist__link {
  color: var(--brand-6);
  cursor: pointer;
  text-decoration: none;
}

.backup-checklist__link:hover {
  color: var(--brand-5);
  text-decoration: underline;
}

.export-key-flow-dialog__footer--precheck {
  gap: 8px;
}

.export-key-flow-dialog__footer--setup {
  gap: 8px;
}

.btn-select-key-precheck:disabled {
  opacity: 0.55;
}

.ukey-cards {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 4px 0 8px;
}

.ukey-card {
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

.ukey-card__icon {
  color: var(--neutral-6);
  margin-bottom: 10px;
}

.ukey-card__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-8);
  margin-bottom: 8px;
}

.ukey-card__sub {
  font-size: 12px;
  color: var(--neutral-7);
  line-height: 1.45;
}

.ukey-card--active {
  border-color: var(--brand-6);
  background: var(--neutral-0);
  box-shadow: 0 0 0 1px var(--brand-6);
}

.ukey-card--active .ukey-card__icon {
  color: var(--brand-6);
}

.ukey-card--active .ukey-card__label {
  color: var(--neutral-10);
}

.ukey-card--active .ukey-card__sub {
  color: var(--neutral-9);
}

.ukey-card--done {
  border-color: var(--el-color-success);
  background: var(--neutral-0);
  box-shadow: 0 0 0 1px var(--el-color-success);
}

.ukey-card--done .ukey-card__icon {
  color: var(--el-color-success);
}

.pin-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.export-key-flow-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.export-key-flow-dialog__footer--backup {
  gap: 8px;
}

.phase-download {
  text-align: center;
  padding: 28px 24px 36px;
}

.phase-download__icon-wrap {
  width: 96px;
  height: 96px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: var(--el-color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(48, 179, 70, 0.32);
}

.phase-download__icon {
  font-size: 52px;
  color: #fff;
}

.phase-download__text {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--neutral-10);
  line-height: 1.65;
}

.phase-download__btn {
  min-width: 200px;
  height: 42px;
  font-size: 14px;
  padding: 0 28px;
}

.export-key-flow-dialog__footer--download {
  justify-content: flex-end;
}

.btn-footer-outline {
  border-color: var(--neutral-5);
  color: var(--neutral-10);
  background: var(--neutral-0);
}

.btn-footer-outline:hover {
  border-color: var(--brand-4);
  color: var(--brand-6);
  background: var(--brand-1);
}
</style>

<style>
.export-key-flow-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.export-key-flow-dialog .el-dialog__header {
  margin: 0;
  padding: 12px 16px;
  background: var(--neutral-3);
  border-bottom: 1px solid var(--neutral-4);
}

.export-key-flow-dialog__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-10);
}

.export-key-flow-dialog .el-dialog__headerbtn {
  top: 12px;
}

.export-key-flow-dialog .el-dialog__body {
  padding: 0 16px;
}

.export-key-flow-dialog .el-dialog__footer {
  padding: 12px 16px 16px;
  border-top: 1px solid var(--neutral-4);
}

.export-backup-steps .el-step__head.is-success .el-step__line {
  background-color: var(--brand-4);
}

.export-backup-steps .el-step__head.is-process .el-step__icon.is-text {
  background: var(--brand-6);
  border-color: var(--brand-6);
  color: #fff;
}

.export-pin-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.export-pin-dialog .el-dialog__header {
  margin: 0;
  padding: 12px 16px;
  background: var(--neutral-3);
  border-bottom: 1px solid var(--neutral-4);
}

.export-pin-dialog .el-dialog__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--neutral-10);
}

.export-pin-dialog .el-dialog__body {
  padding: 20px 16px 8px;
}

.export-pin-dialog .el-dialog__footer {
  padding: 8px 16px 16px;
  border-top: 1px solid var(--neutral-4);
}
</style>

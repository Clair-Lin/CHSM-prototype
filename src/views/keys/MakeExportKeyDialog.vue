<template>
  <el-dialog
    v-model="visible"
    :width="dialogWidth"
    align-center
    destroy-on-close
    class="make-export-key-dialog"
    :show-close="true"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <template #header>
      <span class="make-export-key-dialog__title">制作密钥导出key</span>
    </template>

    <div class="make-export-body">
      <template v-if="firstStepMode === 'choose'">
        <p class="make-export-lead">
          已识别到历史密钥导出 key，请选择是否重新制作导出密钥 key。
        </p>
        <el-radio-group v-model="repeatDecision" class="make-export-choice">
          <el-radio value="reuse">不制作，直接进入密钥导出流程</el-radio>
          <el-radio value="remake">制作新的导出密钥 key</el-radio>
        </el-radio-group>
        <p v-if="repeatDecision === 'remake'" class="make-export-warn">
          提示：若制作，则无法再恢复历史导出密钥。
        </p>
      </template>

      <template v-else-if="uiMode === 'checklist'">
        <p class="make-export-lead">
          请准备 5 个备份的 UKEY，依次插入每一把 UKEY 进行密钥导出 key 制作操作！
        </p>

        <div class="make-export-checklist">
          <div class="make-export-checklist__item make-export-checklist__item--ok">
            <el-icon class="make-export-checklist__icon make-export-checklist__icon--success" :size="22">
              <CircleCheck />
            </el-icon>
            <div class="make-export-checklist__body">
              <div class="make-export-checklist__title">启动安全控件</div>
              <p class="make-export-checklist__desc">
                绑定 UKey 前，请确保您的电脑中安装并启动了「身份认证客户端」软件，如无安装，请点击
                <a href="javascript:void(0)" class="make-export-checklist__link" @click.prevent="onDownloadControl">
                  下载安全控件
                </a>
                进行下载；
              </p>
            </div>
          </div>

          <div class="make-export-checklist__item">
            <el-icon
              v-if="allPinsDone"
              class="make-export-checklist__icon make-export-checklist__icon--success"
              :size="22"
            >
              <CircleCheck />
            </el-icon>
            <el-icon v-else class="make-export-checklist__icon make-export-checklist__icon--spin" :size="22">
              <Loading />
            </el-icon>
            <div class="make-export-checklist__body">
              <div class="make-export-checklist__title">插入 UKEY</div>
              <p class="make-export-checklist__desc">
                请插入 UKey，若未检测到 UKey，请重新插入 UKey 或
                <a href="javascript:void(0)" class="make-export-checklist__link" @click.prevent="onRefreshUkey">刷新</a>
              </p>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <p v-if="keyRow" class="make-export-ctx">当前密钥：{{ keyRow.name }}（{{ keyRow.id }}）</p>
        <el-steps
          :active="backupStepsActive"
          finish-status="success"
          align-center
          class="make-export-slots-steps"
        >
          <el-step title="插入密钥保护KEY" />
          <el-step title="下载密钥备份文件" />
        </el-steps>

        <p class="make-export-slots-lead">
          请准备 5 个带有保护密钥的 UKEY，依次插入；每插入一支后点击「刷新 UKEY」检测，识别成功后将自动弹出 PIN 输入。
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
    </div>

    <template #footer>
      <div v-if="firstStepMode === 'choose'" class="make-export-key-dialog__footer">
        <el-button class="btn-make-outline" @click="close">取消</el-button>
        <el-button type="primary" @click="onChooseNext">下一步</el-button>
      </div>
      <div v-else-if="uiMode === 'checklist'" class="make-export-key-dialog__footer">
        <el-button class="btn-make-outline" @click="close">取消</el-button>
        <el-button class="btn-make-outline" @click="onRefreshUkey">刷新 UKEY</el-button>
        <el-button type="primary" :disabled="!allPinsDone" class="btn-start-make" @click="onStartMake">
          开始制作
        </el-button>
      </div>
      <div v-else class="make-export-key-dialog__footer make-export-key-dialog__footer--slots">
        <el-button class="btn-make-outline" @click="close">取消</el-button>
        <el-button class="btn-make-outline" @click="onRefreshUkey">刷新 UKEY</el-button>
        <el-button type="primary" @click="onSlotsPrev">上一步</el-button>
        <el-button type="primary" :disabled="!allPinsDone" class="btn-start-make" @click="onStartMake">
          开始制作
        </el-button>
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
import { computed, nextTick, reactive, ref } from 'vue'
import { CircleCheck, Key, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { markMakeExportKeyCompletedOnce } from './exportKeyFlowPreference.js'

const emit = defineEmits(['make-completed', 'skip-to-export'])

const UKEY_COUNT = 5

const visible = ref(false)
/** 制作完成后是否继续打开密钥导出流程 */
const chainAfterExport = ref(false)
/** 首屏模式：制作流程 / 非首次的选择流程 */
const firstStepMode = ref('make')
const repeatDecision = ref('reuse')
/** 首屏清单 / 识别后 UKEY 卡片与步骤条 */
const uiMode = ref('checklist')
const keyRow = ref(null)

const currentSlotIndex = ref(0)
const insertDetected = ref(false)

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

function buildSlots() {
  return Array.from({ length: UKEY_COUNT }, (_, i) => ({
    id: String(i + 1),
    label: `UKEY_${i + 1}`,
    done: false
  }))
}

const ukeySlots = ref(buildSlots())

const allPinsDone = computed(() => ukeySlots.value.every((s) => s.done))

const backupStepsActive = computed(() => (allPinsDone.value ? 1 : 0))

const dialogWidth = computed(() => (uiMode.value === 'slots' ? '760px' : '680px'))

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

function resetFlow() {
  uiMode.value = 'checklist'
  firstStepMode.value = 'make'
  repeatDecision.value = 'reuse'
  currentSlotIndex.value = 0
  insertDetected.value = false
  ukeySlots.value = buildSlots()
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
  chainAfterExport.value = Boolean(opts.chainAfter)
  firstStepMode.value = opts.mode === 'choose' ? 'choose' : 'make'
  repeatDecision.value = 'reuse'
  keyRow.value = row && typeof row === 'object' ? row : null
  pinVisible.value = false
  resetFlow()
  firstStepMode.value = opts.mode === 'choose' ? 'choose' : 'make'
  resetPinForm()
  visible.value = true
}

function close() {
  pinVisible.value = false
  visible.value = false
}

function onClosed() {
  pinVisible.value = false
  chainAfterExport.value = false
  keyRow.value = null
  resetFlow()
  resetPinForm()
}

function onPinDialogClosed() {
  resetPinForm()
}

function closePinOnly() {
  pinVisible.value = false
}

function onDownloadControl() {
  ElMessage.info('下载安全控件为占位能力，后续接入下载地址。')
}

function onSlotsPrev() {
  ElMessage.info('上一步为占位能力，后续可返回清单或关闭向导。')
}

function onChooseNext() {
  if (repeatDecision.value === 'reuse') {
    if (chainAfterExport.value) emit('skip-to-export', keyRow.value)
    close()
    return
  }
  ElMessage.warning('若制作，则无法再恢复历史导出密钥。')
  firstStepMode.value = 'make'
  uiMode.value = 'checklist'
}

function onPinConfirm() {
  pinFormRef.value?.validate((ok) => {
    if (!ok) return
    pinVisible.value = false
    const idx = currentSlotIndex.value
    ukeySlots.value[idx] = { ...ukeySlots.value[idx], done: true }
    const finishedLabel = ukeySlots.value[idx].label
    if (idx < UKEY_COUNT - 1) {
      currentSlotIndex.value = idx + 1
      insertDetected.value = false
      ElMessage.success(`${finishedLabel} PIN 验证通过，请插入下一支 UKEY，插入后点击「刷新 UKEY」。`)
    } else {
      ElMessage.success('5 支 UKEY 均已验证，可点击「开始制作」完成制作。')
    }
  })
}

async function onRefreshUkey() {
  if (!visible.value) return
  if (allPinsDone.value) {
    ElMessage.info('全部 UKEY 已验证，无需再刷新。')
    return
  }
  if (pinVisible.value) {
    ElMessage.info('请先完成或关闭当前 PIN 输入框。')
    return
  }
  if (uiMode.value === 'checklist') {
    uiMode.value = 'slots'
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

function onStartMake() {
  if (!allPinsDone.value) return
  markMakeExportKeyCompletedOnce()
  ElMessage.success('密钥导出 key 制作已提交（原型），后续接入接口。')
  const row = keyRow.value
  const chain = chainAfterExport.value
  if (chain) emit('make-completed', row)
  close()
}

defineExpose({ open, close })
</script>

<style scoped>
.pin-dialog-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--neutral-8);
}

.make-export-body {
  padding: 8px 8px 4px;
}

.make-export-ctx {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--neutral-8);
}

.make-export-slots-steps {
  margin-bottom: 20px;
}

.make-export-slots-steps :deep(.el-step__title) {
  font-size: 12px;
  line-height: 1.4;
  max-width: 200px;
}

.make-export-slots-lead {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--neutral-10);
  line-height: 1.5;
}

.make-export-lead {
  margin: 0 0 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--neutral-10);
  line-height: 1.55;
}

.make-export-choice {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  margin-bottom: 12px;
}

.make-export-warn {
  margin: 0;
  font-size: 12px;
  color: var(--warning-7);
}

.make-export-checklist {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.make-export-checklist__item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.make-export-checklist__item--ok {
  align-items: flex-start;
}

.make-export-checklist__icon--success {
  flex-shrink: 0;
  color: var(--el-color-success);
  margin-top: 2px;
}

.make-export-checklist__icon--spin {
  flex-shrink: 0;
  color: var(--brand-6);
  margin-top: 2px;
  animation: make-export-spin 1s linear infinite;
}

@keyframes make-export-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.make-export-checklist__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--neutral-10);
  margin-bottom: 6px;
}

.make-export-checklist__desc {
  margin: 0;
  font-size: 12px;
  color: var(--neutral-8);
  line-height: 1.55;
}

.make-export-checklist__link {
  color: var(--brand-6);
  cursor: pointer;
  text-decoration: none;
}

.make-export-checklist__link:hover {
  color: var(--brand-5);
  text-decoration: underline;
}

.ukey-cards {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 4px 0 12px;
}

.ukey-card {
  flex: 1;
  min-width: 128px;
  max-width: 140px;
  border: 1px solid var(--neutral-4);
  border-radius: 4px;
  padding: 16px 10px 12px;
  text-align: center;
  background: var(--neutral-2);
  transition:
    border-color 0.2s,
    background 0.2s;
}

.ukey-card__icon {
  color: var(--neutral-6);
  margin-bottom: 8px;
}

.ukey-card__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--neutral-8);
  margin-bottom: 6px;
}

.ukey-card__sub {
  font-size: 11px;
  color: var(--neutral-7);
  line-height: 1.4;
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

.make-export-key-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.make-export-key-dialog__footer--slots {
  gap: 8px;
}

.btn-make-outline {
  border-color: var(--neutral-5);
  color: var(--neutral-10);
  background: var(--neutral-0);
}

.btn-make-outline:hover {
  border-color: var(--brand-4);
  color: var(--brand-6);
  background: var(--brand-1);
}

.btn-start-make:disabled {
  opacity: 0.55;
}
</style>

<style>
.make-export-key-dialog.el-dialog {
  padding: 0;
  overflow: hidden;
}

.make-export-key-dialog .el-dialog__header {
  margin: 0;
  padding: 12px 16px;
  background: var(--neutral-3);
  border-bottom: 1px solid var(--neutral-4);
}

.make-export-key-dialog__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--neutral-10);
}

.make-export-key-dialog .el-dialog__headerbtn {
  top: 12px;
}

.make-export-key-dialog .el-dialog__body {
  padding: 0 16px;
}

.make-export-key-dialog .el-dialog__footer {
  padding: 12px 16px 16px;
  border-top: 1px solid var(--neutral-4);
}

.make-export-slots-steps .el-step__head.is-success .el-step__line {
  background-color: var(--brand-4);
}

.make-export-slots-steps .el-step__head.is-process .el-step__icon.is-text {
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

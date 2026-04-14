<template>
  <div v-if="group" class="page-container">
    <div class="breadcrumb">
      <span class="crumb-segment">密码设备资源管理</span>
      <el-icon class="crumb-sep"><span class="slash">/</span></el-icon>
      <span class="crumb-leaf">密码资源授权机构</span>
    </div>
    <h1 class="page-title">密码资源授权机构</h1>

    <div class="detail-main-board">
      <div class="detail-main-board__subhead pad-x broad-bottom">
        <el-button class="back-btn" text @click="goBack" aria-label="返回">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="group-name-quoted">「{{ group.name }}」分组授权机构</span>
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
        <GroupAuthorizeEmbed :group-id="route.params.groupId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { findGroupById, countDevicesInGroup } from '../../mock/cryptoDeviceResourceMock.js'
import GroupAuthorizeEmbed from '../../components/GroupAuthorizeEmbed.vue'

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

function goBack() {
  router.push({ name: 'CryptoDeviceResources' })
}

function formatDash(val) {
  return val == null || val === '' ? '--' : val
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
  padding-left: 16px;
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

.back-btn {
  padding: 4px;
  font-size: 18px;
  color: var(--neutral-10);
}

.group-name-quoted {
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-10);
}

.detail-main-board__section {
  padding-top: 12px;
  padding-bottom: 12px;
}

.detail-main-board__section:last-child {
  padding-bottom: 0;
}

.detail-main-board__section > .pad-x {
  padding-top: 4px;
  padding-bottom: 12px;
}

.section-title {
  font-size: 14px;
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
</style>

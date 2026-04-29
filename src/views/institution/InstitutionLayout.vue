<template>
  <div class="institution-layout">
    <header class="header">
      <div class="header-left">
        <router-link to="/institution/keys/hsm" class="logo-block" title="机构端首页">
          <span class="platform-logo" aria-hidden="true">
            <img src="../../access/img/logo.png" alt="密钥管理服务" class="platform-logo" />
          </span>
          <h1 class="platform-title-name">密钥管理服务</h1>
        </router-link>
        <span class="platform-version-badge" title="版本">1.0</span>
      </div>
      <div class="header-right">
        <button type="button" class="header-tool" @click="goManagementHome">管理中心</button>
        <button type="button" class="header-tool" @click="toggleFullscreen">
          <el-icon><FullScreen /></el-icon>
          <span>全屏</span>
        </button>
        <el-dropdown trigger="click" placement="bottom-end">
          <span class="user-entry">
            <el-icon class="user-avatar-icon"><UserFilled /></el-icon>
            <span class="username">mail_super_admin</span>
            <el-icon class="chevron"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>个人中心（占位）</el-dropdown-item>
              <el-dropdown-item divided>退出登录（占位）</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="main-wrapper">
      <aside class="sidebar">
        <div class="sidebar-title">密码设备管理</div>
        <nav class="nav-menu">
          <div v-for="group in institutionMenu" :key="group.key" class="menu-group">
            <div
              class="parent-item"
              role="button"
              tabindex="0"
              @click="toggleGroup(group.key)"
              @keydown.enter.prevent="toggleGroup(group.key)"
            >
              <el-icon class="parent-icon"><component :is="group.icon" /></el-icon>
              <span class="parent-title">{{ group.title }}</span>
              <el-icon class="parent-arrow" :class="{ expanded: expandedGroups[group.key] }"><ArrowDown /></el-icon>
            </div>

            <div v-show="expandedGroups[group.key]" class="sub-items">
              <div
                v-for="child in group.children"
                :key="child.path"
                class="sub-item"
                :class="{ active: route.path === child.path }"
                role="link"
                tabindex="0"
                @click="go(child.path)"
                @keydown.enter.prevent="go(child.path)"
              >
                {{ child.title }}
              </div>
            </div>
          </div>
        </nav>
      </aside>
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, Document, FullScreen, Key, Lock, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const institutionMenu = [
  {
    key: 'key-management',
    title: '密钥管理',
    icon: Key,
    children: [
      { title: '密码机密钥（新）', path: '/institution/keys/hsm' },
      { title: '库内密钥', path: '/institution/keys/library' }
    ]
  },
  {
    key: 'key-application',
    title: '密码应用',
    icon: Lock,
    children: [
      { title: '机构应用', path: '/institution/apps/org' },
      { title: '默认应用', path: '/institution/apps/default' }
    ]
  },
  {
    key: 'logs',
    title: '日志管理',
    icon: Document,
    children: [{ title: '密码服务日志', path: '/institution/logs/service' }]
  }
]

const expandedGroups = reactive(
  Object.fromEntries(institutionMenu.map((item) => [item.key, false]))
)

function go(path) {
  if (route.path !== path) {
    router.push(path)
  }
}

function toggleGroup(key) {
  expandedGroups[key] = !expandedGroups[key]
}

function goManagementHome() {
  router.push('/welcome')
}

function toggleFullscreen() {
  const el = document.documentElement
  if (!document.fullscreenElement) {
    void el.requestFullscreen?.()
  } else {
    void document.exitFullscreen?.()
  }
}

watch(
  () => route.path,
  (path) => {
    institutionMenu.forEach((group) => {
      expandedGroups[group.key] = group.children.some((child) => child.path === path)
    })
  },
  { immediate: true }
)
</script>

<style scoped>
.institution-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--neutral-2);
}

.header {
  height: 50px;
  background: var(--brand-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  color: var(--neutral-0);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-block {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.platform-logo {
  display: inline-block;
  width: 46px;
}

.platform-title-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--neutral-0);
}

.platform-version-badge {
  border: 1px solid hsla(0, 0%, 100%, 0.53);
  border-radius: 3px 6px 6px 6px;
  color: hsla(0, 0%, 100%, 0.53);
  display: inline-block;
  font-size: 12px;
  margin-left: 6px;
  padding: 0 5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-tool {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--neutral-0);
  cursor: pointer;
  font-size: 12px;
}

.header-tool:hover {
  opacity: 0.88;
}

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.user-avatar-icon {
  font-size: 22px;
}

.username {
  font-size: 14px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  font-size: 12px;
}

.main-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: var(--neutral-1);
  border-right: 1px solid var(--neutral-4);
  overflow-y: auto;
}

.sidebar-title {
  padding: 14px 16px 12px;
  color: var(--neutral-10);
  font-size: 14px;
  font-weight: 500;
}

.nav-menu {
  padding: 6px 0 12px;
}

.menu-group + .menu-group {
  margin-top: 2px;
}

.parent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  color: var(--neutral-10);
  font-size: 14px;
}

.parent-item:hover {
  background: var(--neutral-3);
}

.parent-icon {
  font-size: 14px;
  color: var(--neutral-8);
}

.parent-title {
  flex: 1;
  font-size: 14px;
}

.parent-arrow {
  font-size: 12px;
  color: var(--neutral-8);
  transition: transform 0.2s ease;
}

.parent-arrow.expanded {
  transform: rotate(180deg);
}

.sub-items {
  padding-bottom: 4px;
}

.sub-item {
  padding: 10px 20px 10px 42px;
  cursor: pointer;
  color: var(--neutral-10);
  font-size: 14px;
  border-left: 3px solid transparent;
}

.sub-item:hover {
  color: var(--brand-6);
  background: var(--brand-1);
}

.sub-item.active {
  background: var(--brand-8);
  color: var(--brand-6);
  border-left: 3px solid var(--brand-6);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--neutral-2);
}
</style>

<template>
  <div class="layout-container">
    <header class="header">
      <div class="header-left">
        <router-link to="/welcome" class="logo-block" title="返回首页">
          <span class="platform-logo" aria-hidden="true">
           <img src="../access/img/logo.png" alt="云服务器密码机" class="platform-logo">
          </span>
          <h1 class="platform-title-name">云服务器密码机</h1>
        </router-link>
        <span class="platform-version-badge" title="版本">1.5.0</span>
      </div>
      <div class="header-right">
        <button type="button" class="header-tool" @click="toggleFullscreen">
          <el-icon><FullScreen /></el-icon>
          <span>全屏</span>
        </button>
        <el-dropdown trigger="click" placement="bottom-end">
          <span class="user-entry">
            <el-icon class="user-avatar-icon"><UserFilled /></el-icon>
            <span class="username">init_system@myibc.net</span>
            <el-icon class="chevron"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>个人中心（占位）</el-dropdown-item>
              <el-dropdown-item divided @click="logoutPlaceholder">退出登录（占位）</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="main-wrapper">
      <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">
        <nav class="nav-menu">
          <template v-for="item in sidebarMenu" :key="item.path || item.key">
            <div
              v-if="item.type === 'link'"
              class="nav-item"
              :class="{ active: isPathActive(item.path) }"
              role="link"
              tabindex="0"
              @click="go(item.path)"
              @keydown.enter.prevent="go(item.path)"
            >
              <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
              <span v-show="!sidebarCollapsed" class="nav-text">{{ item.title }}</span>
            </div>

            <div v-else class="nav-item-group">
              <div
                class="nav-item"
                :class="{ expanded: expanded[item.key], active: isGroupActive(item) }"
                role="button"
                tabindex="0"
                @click="toggleGroup(item.key)"
                @keydown.enter.prevent="toggleGroup(item.key)"
              >
                <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
                <span v-show="!sidebarCollapsed" class="nav-text">{{ item.title }}</span>
                <el-icon v-show="!sidebarCollapsed" class="arrow-icon" :class="{ rotated: expanded[item.key] }">
                  <ArrowDown />
                </el-icon>
              </div>
              <div v-show="!sidebarCollapsed && expanded[item.key]" class="nav-sub-items">
                <div
                  v-for="sub in item.children"
                  :key="sub.path"
                  class="nav-sub-item"
                  :class="{ active: currentPath === sub.path }"
                  role="link"
                  tabindex="0"
                  @click="go(sub.path)"
                  @keydown.enter.prevent="go(sub.path)"
                >
                  {{ sub.title }}
                </div>
              </div>
            </div>
          </template>
        </nav>
        <div
          class="collapse-nav"
          role="button"
          tabindex="0"
          @click="toggleSidebarCollapsed"
          @keydown.enter.prevent="toggleSidebarCollapsed"
        >
          <el-icon class="nav-icon"><Fold v-if="!sidebarCollapsed" /><Expand v-else /></el-icon>
          <span v-show="!sidebarCollapsed">收起菜单</span>
        </div>
      </aside>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FullScreen, UserFilled, ArrowDown, Fold, Expand } from '@element-plus/icons-vue'
import { sidebarMenu } from '../config/menu.js'

const route = useRoute()
const router = useRouter()
const currentPath = computed(() => route.path)

const expanded = reactive(
  Object.fromEntries(sidebarMenu.filter((i) => i.type === 'group').map((i) => [i.key, false]))
)

const sidebarCollapsed = ref(false)

function go(path) {
  router.push(path)
}

function isPathActive(path) {
  if (path === '/crypto-device/resources') {
    return (
      currentPath.value === path || currentPath.value.startsWith(`${path}/`)
    )
  }
  return currentPath.value === path
}

function isGroupActive(item) {
  return item.children?.some((c) => c.path === currentPath.value)
}

function toggleGroup(key) {
  if (sidebarCollapsed.value) {
    sidebarCollapsed.value = false
  }
  expanded[key] = !expanded[key]
}

function syncExpandedWithRoute(path) {
  for (const item of sidebarMenu) {
    if (item.type !== 'group') continue
    const hit = item.children?.some((c) => path === c.path || path.startsWith(c.path + '/'))
    expanded[item.key] = Boolean(hit)
  }
}

watch(
  currentPath,
  (path) => {
    syncExpandedWithRoute(path)
  },
  { immediate: true }
)

function toggleSidebarCollapsed() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  if (sidebarCollapsed.value) {
    for (const key of Object.keys(expanded)) {
      expanded[key] = false
    }
  }
}

function toggleFullscreen() {
  const el = document.documentElement
  if (!document.fullscreenElement) {
    void el.requestFullscreen?.()
  } else {
    void document.exitFullscreen?.()
  }
}

function logoutPlaceholder() {
  router.push('/institution')
}
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--neutral-2);
}

.header {
  height: 50px;
  background: var(--brand-2);
  /* box-shadow: 0 4px 5px 0 rgba(21, 91, 212, 0.2); */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  color: var(--neutral-0);
  font-family: var(--font-family);
}

.header-left {
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
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
    margin: 0;
    overflow: hidden;
    vertical-align: middle;
    width: 46px;
}

.platform-title-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--neutral-0);
}

.platform-version-badge {
  border: 1px solid hsla(0, 0%, 100%, .53);
  border-radius: 3px 6px 6px 6px;
  color: hsla(0, 0%, 100%, .53);
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
  font-family: var(--font-family);
  transition: opacity 0.2s;
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
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: var(--neutral-1);
  border-right: 1px solid var(--neutral-4);
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-family: var(--font-family);
  overflow: hidden;
  transition: width 0.2s ease;
}

.sidebar--collapsed {
  width: 64px;
}

.sidebar:hover .nav-menu {
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-menu {
  flex: 1;
  padding: 0px 0;
  overflow-y: hidden;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  margin-left: 2px;
  gap: 8px;
  padding: 10px 18px;
  /* margin-bottom: 4px; */
  cursor: pointer;
  color: var(--neutral-10);
  transition: color 0.2s, background-color 0.2s;
  position: relative;
}

.nav-text {
  flex: 1;
  min-width: 0;
}

.nav-icon {
  font-size: 18px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: inherit;
}

/* 仅菜单区：自定义 SVG 与文字同色（不收起区 Fold/Expand，避免误改描边型图标） */
.nav-menu .nav-icon :deep(svg),
.nav-menu .nav-icon :deep(path) {
  fill: currentColor;
}

.sidebar--collapsed .nav-item {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.nav-item:hover {
  color: var(--neutral-10);
  background: var(--brand-1);
}

.nav-item.active {
  color: var(--brand-4);
  background: var(--brand-8);
}

.nav-item.expanded {
  color: var(--brand-6);
}

.arrow-icon {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.3s;
}

.arrow-icon.rotated {
  transform: rotate(180deg);
}

.nav-item-group .nav-item.active {
  color: var(--brand-6);
  background: transparent;
}

.nav-item-group .nav-item.expanded {
  background: var(--neutral-3);
}

.nav-sub-items {
  padding-left: 10px;
}

.nav-sub-item {
  padding: 10px 20px;
  padding-left: 40px;
  margin-bottom: 8px;
  cursor: pointer;
  color: var(--neutral-10);
  transition: color 0.2s, background-color 0.2s;
  font-size: 14px;
}

.nav-sub-item:hover {
  color: var(--brand-6);
  background: var(--brand-1);
}

.nav-sub-item.active {
  color: var(--brand-6);
  font-weight: 500;
  background: var(--brand-1);
}

.collapse-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid var(--neutral-4);
  cursor: pointer;
  color: var(--neutral-10);
  transition: color 0.2s, background-color 0.2s;
}

.sidebar--collapsed .collapse-nav {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.collapse-nav:hover {
  color: var(--brand-6);
  background: var(--neutral-3);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--neutral-2);
}
</style>

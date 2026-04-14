<template>
  <div class="welcome-page">
    <div class="welcome-bg" aria-hidden="true">
      <span class="cube c1" />
      <span class="cube c2" />
      <span class="cube c3" />
    </div>
    <div class="welcome-illustration" aria-hidden="true">
      <img src="../access/img/image.png" alt="欢迎使用云服务器密码机" />
    </div>
    <p class="welcome-cn">欢迎使用云服务器密码机</p>
  </div>
</template>

<script setup></script>

<style scoped>
.welcome-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px 64px;
  position: relative;
  background: var(--neutral-0);
  overflow: hidden;
}

.welcome-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cube {
  position: absolute;
  width: 120px;
  height: 120px;
  border: 1px solid var(--neutral-4);
  opacity: 0.35;
  transform: rotate(12deg);
}

.c1 {
  top: -24px;
  right: -32px;
}

.c2 {
  bottom: 12%;
  left: -40px;
  transform: rotate(-8deg);
}

.c3 {
  bottom: -28px;
  right: 8%;
  width: 80px;
  height: 80px;
  opacity: 0.25;
}

.welcome-illustration {
  margin-bottom: 32px;
  z-index: 1;
}

.desk-svg {
  width: min(360px, 88vw);
  height: auto;
  display: block;
}

.welcome-en {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--neutral-10);
  margin: 0 0 12px;
  z-index: 1;
}

.welcome-cn {
  font-size: 16px;
  font-weight: 500;
  color: var(--brand-6);
  margin: 0;
  z-index: 1;
}
</style>

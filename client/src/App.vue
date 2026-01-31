<template>
  <div id="app">
    <Navbar v-if="userStore.isLoggedIn" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from './stores/user'
import Navbar from './components/Navbar.vue'

const userStore = useUserStore()
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  padding-top: 80px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    padding-top: 68px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 8px;
    padding-top: 58px;
  }
}
</style>

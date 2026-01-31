<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="logo">🌾 开心农场</router-link>
    </div>
    
    <div class="navbar-user">
      <div class="user-stats">
        <span class="stat">💰 {{ userStore.user?.coins || 0 }}</span>
        <span class="stat">⭐ Lv.{{ userStore.user?.level || 1 }}</span>
        <span class="stat exp-bar">
          EXP: {{ userStore.user?.exp || 0 }}
        </span>
      </div>
      
      <div class="user-info">
        <span class="username">{{ userStore.user?.username }}</span>
        <button @click="handleLogout" class="btn-logout">退出</button>
      </div>
    </div>
    
    <div class="navbar-menu">
      <router-link to="/" class="nav-item" active-class="active">
        🏠 我的农场
      </router-link>
      <router-link to="/friends" class="nav-item" active-class="active">
        👥 好友
      </router-link>
      <router-link to="/shop" class="nav-item" active-class="active">
        🏪 商店
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.navbar-brand .logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-stats {
  display: flex;
  gap: 16px;
}

.stat {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  color: #ffd700;
  font-weight: 600;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.navbar-menu {
  display: flex;
  gap: 8px;
}

.nav-item {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}
</style>

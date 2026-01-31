<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>🌾 开心农场</h1>
        <p>种菜、收菜、偷菜，快乐每一天！</p>
      </div>
      
      <div class="login-tabs">
        <button 
          :class="['tab', { active: mode === 'login' }]"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button 
          :class="['tab', { active: mode === 'register' }]"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码"
            required
          />
        </div>
        
        <p v-if="error" class="error">{{ error }}</p>
        
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? '请稍候...' : (mode === 'login' ? '登录' : '注册') }}
        </button>
      </form>
      
      <div class="login-tips">
        <p>🌱 新用户注册即送 100 金币和 6 块农田</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const mode = ref('login')
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  
  try {
    if (mode.value === 'login') {
      await userStore.login(username.value, password.value)
    } else {
      await userStore.register(username.value, password.value)
    }
    router.push('/')
  } catch (err) {
    error.value = err.error || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 2.5rem;
  color: #2d5016;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 1rem;
}

.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: #e8f5e9;
  color: #2d5016;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: #4a7c23;
  color: #fff;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #4a7c23;
  box-shadow: 0 0 0 3px rgba(74, 124, 35, 0.1);
}

.error {
  color: #d32f2f;
  text-align: center;
  font-size: 0.9rem;
}

.btn-submit {
  padding: 16px;
  background: linear-gradient(135deg, #4a7c23 0%, #6b9b3a 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 124, 35, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-tips {
  margin-top: 24px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .login-page {
    padding: 12px;
    min-height: calc(100vh - 60px);
  }

  .login-container {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .login-header {
    margin-bottom: 20px;
  }

  .login-header h1 {
    font-size: 2rem;
  }

  .login-header p {
    font-size: 0.9rem;
  }

  .login-tabs {
    margin-bottom: 20px;
  }

  .tab {
    padding: 10px;
    font-size: 0.95rem;
  }

  .login-form {
    gap: 16px;
  }

  .form-group input {
    padding: 12px 14px;
  }

  .btn-submit {
    padding: 14px;
    font-size: 1rem;
  }

  .login-tips {
    margin-top: 20px;
    font-size: 0.85rem;
  }
}
</style>

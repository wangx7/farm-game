<template>
  <div class="friends-page">
    <div class="friends-header">
      <h2>👥 好友列表</h2>
    </div>
    
    <!-- 搜索添加好友 -->
    <div class="search-section">
      <div class="search-box">
        <input 
          v-model="searchKeyword" 
          @input="handleSearch"
          type="text" 
          placeholder="搜索用户名添加好友..."
        />
        <span class="search-icon">🔍</span>
      </div>
      
      <div v-if="friendsStore.searchResults.length" class="search-results">
        <div 
          v-for="user in friendsStore.searchResults" 
          :key="user.id"
          class="search-item"
        >
          <div class="user-info">
            <span class="avatar">👤</span>
            <span class="name">{{ user.username }}</span>
            <span class="level">Lv.{{ user.level }}</span>
          </div>
          <button 
            v-if="!user.isFriend"
            @click="addFriend(user.id)"
            class="btn-add"
          >
            ➕ 添加
          </button>
          <span v-else class="already-friend">已是好友</span>
        </div>
      </div>
    </div>
    
    <!-- 好友列表 -->
    <div class="friends-list">
      <div v-if="friendsStore.loading" class="loading">加载中...</div>
      
      <div v-else-if="friendsStore.friends.length === 0" class="empty">
        <p>还没有好友，快去搜索添加吧！</p>
      </div>
      
      <div 
        v-for="friend in friendsStore.friends" 
        :key="friend.id"
        class="friend-card"
      >
        <div class="friend-info">
          <span class="avatar">👤</span>
          <div class="friend-details">
            <span class="name">{{ friend.username }}</span>
            <span class="level">Lv.{{ friend.level }}</span>
          </div>
        </div>
        
        <div class="friend-actions">
          <router-link :to="`/visit/${friend.id}`" class="btn-visit">
            🌾 访问农场
          </router-link>
          <button @click="removeFriend(friend.id)" class="btn-remove">
            ❌
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFriendsStore } from '../stores/friends'

const friendsStore = useFriendsStore()
const searchKeyword = ref('')
let searchTimer = null

onMounted(() => {
  friendsStore.fetchFriends()
})

function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    friendsStore.searchUsers(searchKeyword.value)
  }, 300)
}

async function addFriend(friendId) {
  try {
    await friendsStore.addFriend(friendId)
    await friendsStore.searchUsers(searchKeyword.value)
  } catch (err) {
    alert(err.error || '添加失败')
  }
}

async function removeFriend(friendId) {
  if (!confirm('确定要删除这个好友吗？')) return
  
  try {
    await friendsStore.removeFriend(friendId)
  } catch (err) {
    alert(err.error || '删除失败')
  }
}
</script>

<style scoped>
.friends-page {
  max-width: 600px;
  margin: 0 auto;
}

.friends-header {
  margin-bottom: 24px;
}

.friends-header h2 {
  color: #2d5016;
  font-size: 1.8rem;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 32px;
}

.search-box {
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #4a7c23;
  box-shadow: 0 0 0 3px rgba(74, 124, 35, 0.1);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.search-results {
  margin-top: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.search-item:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  font-size: 1.5rem;
}

.name {
  font-weight: 600;
  color: #333;
}

.level {
  color: #666;
  font-size: 0.9rem;
}

.btn-add {
  background: #4a7c23;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #3a6c18;
}

.already-friend {
  color: #999;
  font-size: 0.9rem;
}

/* 好友列表 */
.friends-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

.friend-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.friend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.friend-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.friend-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-visit {
  background: linear-gradient(135deg, #4a7c23, #6b9b3a);
  color: #fff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-visit:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(74, 124, 35, 0.4);
}

.btn-remove {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.btn-remove:hover {
  opacity: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .friends-page {
    padding: 0 4px;
  }

  .friends-header h2 {
    font-size: 1.5rem;
  }

  .search-section {
    margin-bottom: 24px;
  }

  .search-box input {
    padding: 12px 16px 12px 44px;
    font-size: 0.95rem;
  }

  .search-icon {
    left: 14px;
    font-size: 1.1rem;
  }

  .search-item {
    padding: 12px 16px;
  }

  .avatar {
    font-size: 1.3rem;
  }

  .name {
    font-size: 0.95rem;
  }

  .level {
    font-size: 0.85rem;
  }

  .btn-add {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .friend-card {
    padding: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .friend-info {
    gap: 12px;
  }

  .friend-actions {
    width: 100%;
    justify-content: flex-end;
    gap: 10px;
  }

  .btn-visit {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .friends-header h2 {
    font-size: 1.3rem;
  }

  .search-box input {
    padding: 10px 14px 10px 40px;
    font-size: 0.9rem;
  }

  .friend-card {
    padding: 14px;
    border-radius: 12px;
  }

  .friend-details .name {
    font-size: 0.9rem;
  }

  .friend-details .level {
    font-size: 0.8rem;
  }

  .btn-visit {
    padding: 8px 14px;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  .btn-remove {
    font-size: 1rem;
  }
}
</style>

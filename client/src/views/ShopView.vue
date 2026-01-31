<template>
  <div class="shop-page">
    <div class="shop-header">
      <h2>🏪 种子商店</h2>
      <div class="my-coins">
        💰 我的金币: <strong>{{ userStore.user?.coins || 0 }}</strong>
      </div>
    </div>
    
    <div class="seeds-grid">
      <div 
        v-for="seed in seeds" 
        :key="seed.type"
        class="seed-card"
        :class="{ affordable: userStore.user?.coins >= seed.price }"
      >
        <div class="seed-icon">{{ seed.icon }}</div>
        <div class="seed-info">
          <h3>{{ seed.name }}</h3>
          <div class="seed-stats">
            <span class="stat">⏱️ 生长: {{ formatTime(seed.growTime) }}</span>
            <span class="stat">💰 收获: +{{ seed.harvest }}</span>
            <span class="stat">⭐ 经验: +{{ seed.exp }}</span>
          </div>
        </div>
        <div class="seed-price">
          <span class="price">💰 {{ seed.price }}</span>
        </div>
      </div>
    </div>
    
    <div class="shop-tip">
      <p>💡 提示：在农场页面点击空地块即可种植种子</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import api from '../api'

const userStore = useUserStore()
const seeds = ref([])

onMounted(async () => {
  const res = await api.get('/shop/seeds')
  seeds.value = res.seeds
})

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes}分钟`
  return `${Math.floor(minutes / 60)}小时${minutes % 60}分`
}
</script>

<style scoped>
.shop-page {
  max-width: 800px;
  margin: 0 auto;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.shop-header h2 {
  color: #2d5016;
  font-size: 1.8rem;
}

.my-coins {
  background: linear-gradient(135deg, #ffd700, #ffeb3b);
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.my-coins strong {
  font-size: 1.3rem;
}

.seeds-grid {
  display: grid;
  gap: 20px;
}

.seed-card {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  border: 3px solid transparent;
}

.seed-card.affordable {
  border-color: #e8f5e9;
}

.seed-card.affordable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #4a7c23;
}

.seed-icon {
  font-size: 4rem;
  text-align: center;
}

.seed-info h3 {
  font-size: 1.3rem;
  color: #2d5016;
  margin-bottom: 12px;
}

.seed-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stat {
  color: #666;
  font-size: 0.95rem;
}

.seed-price {
  text-align: center;
}

.price {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ff9800;
}

.shop-tip {
  margin-top: 32px;
  text-align: center;
  padding: 20px;
  background: #e8f5e9;
  border-radius: 12px;
  color: #2d5016;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .shop-page {
    padding: 0 4px;
  }

  .shop-header {
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
  }

  .shop-header h2 {
    font-size: 1.5rem;
  }

  .my-coins {
    padding: 8px 16px;
    font-size: 0.95rem;
  }

  .my-coins strong {
    font-size: 1.1rem;
  }

  .seed-card {
    grid-template-columns: 60px 1fr;
    gap: 16px;
    padding: 16px;
    border-radius: 16px;
  }

  .seed-icon {
    font-size: 3rem;
  }

  .seed-info h3 {
    font-size: 1.1rem;
    margin-bottom: 8px;
  }

  .seed-stats {
    gap: 8px;
  }

  .stat {
    font-size: 0.85rem;
  }

  .seed-price {
    position: absolute;
    right: 16px;
    top: 16px;
  }

  .seed-card {
    position: relative;
  }

  .price {
    font-size: 1.1rem;
  }

  .shop-tip {
    margin-top: 24px;
    padding: 16px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .shop-header h2 {
    font-size: 1.3rem;
    width: 100%;
  }

  .seed-card {
    grid-template-columns: 50px 1fr;
    gap: 12px;
    padding: 14px;
  }

  .seed-icon {
    font-size: 2.5rem;
  }

  .seed-info h3 {
    font-size: 1rem;
  }

  .seed-stats {
    flex-direction: column;
    gap: 4px;
  }

  .stat {
    font-size: 0.8rem;
  }

  .price {
    font-size: 1rem;
  }
}
</style>

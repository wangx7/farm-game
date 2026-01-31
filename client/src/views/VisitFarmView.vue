<template>
  <div class="visit-page">
    <div class="visit-header">
      <router-link to="/friends" class="btn-back">← 返回</router-link>
      <h2>🌾 {{ friendInfo?.username }}的农场</h2>
      <span class="friend-level">Lv.{{ friendInfo?.level }}</span>
    </div>
    
    <!-- 农场地块 -->
    <div class="farm-grid">
      <div 
        v-for="plot in plots" 
        :key="plot.id"
        class="plot"
        :class="getPlotClass(plot)"
        @click="handlePlotClick(plot)"
      >
        <div class="plot-content">
          <template v-if="plot.crop_type">
            <span class="crop-display">{{ getCropIcon(plot) }}</span>
            <div class="crop-info">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: plot.progress + '%' }"></div>
              </div>
              <span class="stage-text">{{ getStageText(plot) }}</span>
            </div>
            <!-- 偷菜标记 -->
            <span v-if="canSteal(plot)" class="steal-badge">🥷 可偷</span>
            <span v-else-if="hasStolen(plot)" class="stolen-badge">已偷过</span>
          </template>
          <template v-else>
            <span class="empty-plot">🌱</span>
            <span class="empty-text">空地</span>
          </template>
        </div>
      </div>
    </div>
    
    <!-- 偷菜提示 -->
    <div v-if="stealMessage" class="steal-toast">
      {{ stealMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import api from '../api'

const route = useRoute()
const userStore = useUserStore()

const friendInfo = ref(null)
const plots = ref([])
const crops = ref([])
const stealMessage = ref('')
const loading = ref(false)

const friendId = computed(() => parseInt(route.params.userId))

onMounted(async () => {
  await fetchFriendFarm()
})

async function fetchFriendFarm() {
  loading.value = true
  try {
    const res = await api.get(`/farm/visit/${friendId.value}`)
    friendInfo.value = res.user
    plots.value = res.plots
    
    // 获取作物配置
    const shopRes = await api.get('/shop/seeds')
    crops.value = shopRes.seeds
  } catch (err) {
    alert(err.error || '无法访问该农场')
  } finally {
    loading.value = false
  }
}

function getCropIcon(plot) {
  const crop = crops.value.find(c => c.type === plot.crop_type)
  if (!crop) return '🌱'
  
  if (plot.stage <= 1) return '🌱'
  if (plot.stage === 2) return '🌿'
  if (plot.stage === 3) return '🪴'
  return crop.icon
}

function getPlotClass(plot) {
  if (!plot.crop_type) return 'empty'
  if (plot.isReady) return 'ready'
  return 'growing'
}

function getStageText(plot) {
  if (plot.isReady) return '已成熟'
  return `生长中 ${plot.progress}%`
}

function canSteal(plot) {
  if (!plot.isReady) return false
  const stolenBy = plot.stolenBy || []
  const myId = Number(userStore.user?.id)
  // 确保数字类型比较
  return !stolenBy.some(id => Number(id) === myId)
}

function hasStolen(plot) {
  const stolenBy = plot.stolenBy || []
  const myId = Number(userStore.user?.id)
  return stolenBy.some(id => Number(id) === myId)
}

async function handlePlotClick(plot) {
  console.log('点击地块:', plot)
  console.log('canSteal:', canSteal(plot))
  
  if (!canSteal(plot)) {
    console.log('不能偷：作物未成熟或已偷过')
    return
  }
  
  if (!confirm('确定要偷这块地的菜吗？')) return
  
  try {
    console.log('发起偷菜请求:', { friendId: friendId.value, plotIndex: plot.plot_index })
    const res = await api.post('/farm/steal', {
      friendId: friendId.value,
      plotIndex: plot.plot_index
    })
    
    showStealMessage(res.message)
    userStore.updateUser(res.user)
    await fetchFriendFarm()
  } catch (err) {
    console.error('偷菜错误:', err)
    alert(err.error || '偷菜失败')
  }
}

function showStealMessage(msg) {
  stealMessage.value = msg
  setTimeout(() => {
    stealMessage.value = ''
  }, 3000)
}
</script>

<style scoped>
.visit-page {
  max-width: 900px;
  margin: 0 auto;
}

.visit-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.btn-back {
  color: #4a7c23;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  background: #e8f5e9;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #c8e6c9;
}

.visit-header h2 {
  color: #2d5016;
  font-size: 1.6rem;
  flex: 1;
}

.friend-level {
  color: #666;
  font-size: 1rem;
}

/* 农场地块网格 */
.farm-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.plot {
  aspect-ratio: 1;
  background: linear-gradient(145deg, #654321 0%, #8B4513 100%);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 4px solid #3e2723;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.plot::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #228B22 0%, #32CD32 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.plot.growing::before,
.plot.ready::before {
  opacity: 1;
}

.plot.ready:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.plot-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.crop-display {
  font-size: 3rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.crop-info {
  text-align: center;
}

.progress-bar {
  width: 80px;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffeb3b);
  transition: width 0.3s;
}

.stage-text {
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.steal-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff5722;
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.stolen-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.empty-plot {
  font-size: 2.5rem;
  opacity: 0.5;
}

.empty-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

/* 偷菜提示 */
.steal-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff5722, #ff7043);
  color: #fff;
  padding: 16px 32px;
  border-radius: 30px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .visit-page {
    padding: 0 4px;
  }

  .visit-header {
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }

  .btn-back {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .visit-header h2 {
    font-size: 1.3rem;
    flex: auto;
    width: 100%;
    order: -1;
  }

  .friend-level {
    font-size: 0.9rem;
  }

  .farm-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
    border-radius: 16px;
  }

  .plot {
    border-radius: 12px;
    border-width: 3px;
  }

  .crop-display {
    font-size: 2.5rem;
  }

  .progress-bar {
    width: 60px;
    height: 6px;
  }

  .stage-text {
    font-size: 0.7rem;
  }

  .steal-badge,
  .stolen-badge {
    top: 4px;
    right: 4px;
    padding: 3px 6px;
    font-size: 0.65rem;
  }

  .empty-plot {
    font-size: 2rem;
  }

  .empty-text {
    font-size: 0.75rem;
  }

  .steal-toast {
    bottom: 80px;
    padding: 12px 24px;
    font-size: 0.9rem;
    border-radius: 20px;
  }
}

@media (max-width: 480px) {
  .visit-header h2 {
    font-size: 1.2rem;
  }

  .btn-back {
    padding: 5px 10px;
    font-size: 0.85rem;
  }

  .farm-grid {
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
  }

  .plot {
    border-radius: 10px;
    border-width: 2px;
  }

  .crop-display {
    font-size: 2rem;
  }

  .progress-bar {
    width: 50px;
    height: 5px;
  }

  .steal-badge,
  .stolen-badge {
    top: 2px;
    right: 2px;
    padding: 2px 5px;
    font-size: 0.6rem;
  }

  .empty-plot {
    font-size: 1.5rem;
  }
}
</style>

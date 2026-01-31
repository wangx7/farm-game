<template>
  <div class="farm-page">
    <div class="farm-header">
      <h2>🏠 我的农场</h2>
      <button @click="refreshFarm" class="btn-refresh" :disabled="farmStore.loading">
        🔄 刷新
      </button>
    </div>
    
    <!-- 作物选择弹窗 -->
    <div v-if="showCropSelector" class="modal-overlay" @click="closeCropSelector">
      <div class="crop-selector" @click.stop>
        <h3>选择种子</h3>
        <div class="crop-list">
          <div 
            v-for="crop in farmStore.crops" 
            :key="crop.type"
            class="crop-item"
            :class="{ disabled: userStore.user?.coins < crop.price }"
            @click="selectCrop(crop)"
          >
            <span class="crop-icon">{{ crop.icon }}</span>
            <span class="crop-name">{{ crop.name }}</span>
            <span class="crop-price">💰 {{ crop.price }}</span>
            <span class="crop-time">⏱️ {{ formatTime(crop.growTime) }}</span>
            <span class="crop-harvest">收获: +{{ crop.harvest }}</span>
          </div>
        </div>
        <button @click="closeCropSelector" class="btn-cancel">取消</button>
      </div>
    </div>
    
    <!-- 农场地块 -->
    <div class="farm-grid">
      <div 
        v-for="plot in farmStore.plots" 
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
          </template>
          <template v-else>
            <span class="empty-plot">➕</span>
            <span class="empty-text">点击种植</span>
          </template>
        </div>
      </div>
    </div>
    
    <!-- 收获提示 -->
    <div v-if="harvestMessage" class="harvest-toast">
      {{ harvestMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useFarmStore } from '../stores/farm'
import { useUserStore } from '../stores/user'

const farmStore = useFarmStore()
const userStore = useUserStore()

const showCropSelector = ref(false)
const selectedPlotIndex = ref(null)
const harvestMessage = ref('')
let refreshTimer = null

onMounted(() => {
  farmStore.fetchFarm()
  // 每10秒自动刷新
  refreshTimer = setInterval(() => {
    farmStore.fetchFarm()
  }, 10000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

function refreshFarm() {
  farmStore.fetchFarm()
}

function getCropIcon(plot) {
  const crop = farmStore.crops.find(c => c.type === plot.crop_type)
  if (!crop) return '🌱'
  
  // 根据生长阶段显示不同图标
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
  if (plot.isReady) return '可收获！'
  return `生长中 ${plot.progress}%`
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes}分钟`
  return `${Math.floor(minutes / 60)}小时${minutes % 60}分`
}

function handlePlotClick(plot) {
  if (!plot.crop_type) {
    // 空地块，打开种植选择
    selectedPlotIndex.value = plot.plot_index
    showCropSelector.value = true
  } else if (plot.isReady) {
    // 成熟，收获
    harvestCrop(plot.plot_index)
  }
}

function closeCropSelector() {
  showCropSelector.value = false
  selectedPlotIndex.value = null
}

async function selectCrop(crop) {
  if (userStore.user?.coins < crop.price) {
    alert('金币不足！')
    return
  }
  
  try {
    await farmStore.plant(selectedPlotIndex.value, crop.type)
    closeCropSelector()
  } catch (err) {
    alert(err.error || '种植失败')
  }
}

async function harvestCrop(plotIndex) {
  try {
    const res = await farmStore.harvest(plotIndex)
    showHarvestMessage(`收获成功！获得 ${res.harvest} 金币，${res.exp} 经验`)
    await farmStore.fetchFarm()
  } catch (err) {
    alert(err.error || '收获失败')
  }
}

function showHarvestMessage(msg) {
  harvestMessage.value = msg
  setTimeout(() => {
    harvestMessage.value = ''
  }, 3000)
}
</script>

<style scoped>
.farm-page {
  max-width: 900px;
  margin: 0 auto;
}

.farm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.farm-header h2 {
  color: #2d5016;
  font-size: 1.8rem;
}

.btn-refresh {
  background: #4a7c23;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #3a6c18;
  transform: scale(1.02);
}

.btn-refresh:disabled {
  opacity: 0.6;
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

.plot:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.plot.empty:hover::before {
  opacity: 0.3;
}

.plot.ready {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.2); }
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

.empty-plot {
  font-size: 2.5rem;
  opacity: 0.5;
}

.empty-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

/* 作物选择弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.crop-selector {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.crop-selector h3 {
  text-align: center;
  color: #2d5016;
  margin-bottom: 20px;
  font-size: 1.4rem;
}

.crop-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crop-item {
  display: grid;
  grid-template-columns: 50px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.crop-item:hover:not(.disabled) {
  background: #e8f5e9;
  transform: translateX(4px);
}

.crop-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.crop-icon {
  font-size: 2rem;
  text-align: center;
}

.crop-name {
  font-weight: 600;
  color: #333;
}

.crop-price, .crop-time, .crop-harvest {
  font-size: 0.85rem;
  color: #666;
}

.btn-cancel {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: #e0e0e0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

/* 收获提示 */
.harvest-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #4a7c23, #6b9b3a);
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
</style>

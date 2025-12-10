<template>
  <div class="nav-panel">
    <h3>🗺️ 区域移动</h3>
    
    <div v-if="gameStore.transferStatus === 1" class="transfer-progress-container">
      <div class="progress-label">正在传送... {{ transferCountdown.toFixed(1) }}s</div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <div v-else-if="linkedMaps.length > 0" class="map-links-grid">
      <button
        v-for="map in linkedMaps"
        :key="map.map_id"
        class="map-link-btn"
        @click="handleTransfer(map.map_id)"
      >
        {{ map.map_name }}
      </button>
    </div>
    <div v-else class="no-maps">暂无可传送区域</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { socketService } from '@/services/socket'

const gameStore = useGameStore()
const transferCountdown = ref(0)
const initialTime = ref(0)

const linkedMaps = computed(() => {
  return gameStore.currentMap?.linked_maps || []
})

const progressPercent = computed(() => {
  if (initialTime.value <= 0) return 0
  return ((initialTime.value - transferCountdown.value) / initialTime.value) * 100
})

// 监听传送状态，开始倒计时
watch(() => gameStore.transferStatus, (newStatus) => {
  if (newStatus === 1) {
    startTransfer(gameStore.transferTime)
  }
})

function startTransfer(time: number) {
  initialTime.value = time
  transferCountdown.value = time
  
  const timer = setInterval(() => {
    transferCountdown.value -= 0.1
    if (transferCountdown.value <= 0) {
      clearInterval(timer)
      completeTransfer()
    }
  }, 100)
}

function completeTransfer() {
  if (!gameStore.currentRoleId) return
  socketService.emit('rolecontrol', {
    type: 'completeTransfer',
    roleId: gameStore.currentRoleId
  })
}

function handleTransfer(mapId: string) {
  if (!gameStore.currentRoleId || gameStore.transferStatus === 1) return

  socketService.emit('rolecontrol', {
    type: 'startTransfer',
    roleId: gameStore.currentRoleId,
    targetMapId: mapId,
  })
}
</script>

<style scoped>
.nav-panel {
  background: var(--bg-panel);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 15px;
}
.nav-panel h3 {
  color: var(--accent-gold); font-size: 14px; border-bottom: 1px solid #333;
  padding-bottom: 5px; margin: 0 0 15px 0;
}
.map-links-grid { display: grid; gap: 10px; }
.map-link-btn {
  width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.3); border: 1px solid #333;
  color: var(--accent-gold); border-radius: 4px; cursor: pointer; transition: all 0.2s;
  text-align: left; font-size: 13px;
}
.map-link-btn:hover:not(:disabled) { border-color: var(--accent-gold); background: rgba(197, 160, 89, 0.1); }
.no-maps { color: #666; text-align: center; padding: 20px; font-size: 12px; }

.transfer-progress-container { margin-bottom: 15px; text-align: center; }
.progress-label { color: #aaa; font-size: 12px; margin-bottom: 5px; }
.progress-bar-bg { height: 8px; background: #333; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: var(--accent-gold); transition: width 0.1s linear; }
</style>
<template>
  <div class="stage-header">
    <div class="map-info">
      <h2>{{ currentMapName }}</h2>
      <span class="map-type" :class="mapTypeClass">{{ currentMapType }}</span>
    </div>
    <div class="stage-state">{{ gameStateText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const currentMapName = computed(() => {
  return gameStore.currentMap?.map_name || gameStore.currentRole?._temp_inMapName || '未知区域'
})

const currentMapType = computed(() => {
  // 核心修复：检查 is_safe 字段 (兼容 1/0 和 true/false)
  const isSafeMap = gameStore.currentMap?.is_safe
  const isRoleSafe = gameStore.currentRole?._temp_inMapSafe
  
  // 只要任意一个指示安全，就认为是安全区
  if (isSafeMap || isRoleSafe) {
    return '安全区'
  }
  return '危险区'
})

const mapTypeClass = computed(() => {
  return currentMapType.value === '安全区' ? 'safe' : 'danger'
})

const gameStateText = computed(() => {
  if (gameStore.inBattle) return '战斗中'
  if (gameStore.transferStatus === 1) return `传送中... ${gameStore.transferTime.toFixed(1)}s`
  return '准备就绪'
})
</script>

<style scoped>
.stage-header {
  display: flex; justify-content: space-between; align-items: center; padding: 15px 20px;
  border-bottom: 1px solid #333; background: rgba(0, 0, 0, 0.2);
}
.map-info { display: flex; align-items: center; gap: 15px; }
.map-info h2 { margin: 0; color: var(--accent-gold); font-size: 20px; }
.map-type { padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.map-type.safe { background: rgba(45, 107, 54, 0.3); color: var(--accent-green); border: 1px solid var(--accent-green); }
.map-type.danger { background: rgba(138, 28, 28, 0.3); color: #ff6b6b; border: 1px solid #ff6b6b; }
.stage-state { color: #aaa; font-size: 14px; }
</style>
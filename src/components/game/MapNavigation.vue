<template>
  <div class="nav-panel">
    <h3>🗺️ 区域移动</h3>
    <div v-if="linkedMaps.length > 0" class="map-links-grid">
      <button
        v-for="map in linkedMaps"
        :key="map.map_id"
        class="map-link-btn"
        @click="handleTransfer(map.map_id)"
        :disabled="gameStore.transferStatus === 1"
      >
        {{ map.map_name }}
      </button>
    </div>
    <div v-else class="no-maps">暂无可传送区域</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { socketService } from '@/services/socket'

const gameStore = useGameStore()

const linkedMaps = computed(() => {
  return gameStore.currentMap?.linked_maps || []
})

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
  color: var(--accent-gold);
  font-size: 14px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
  margin: 0 0 15px 0;
}

.map-links-grid {
  display: grid;
  gap: 10px;
}

.map-link-btn {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  color: var(--accent-gold);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 13px;
}

.map-link-btn:hover:not(:disabled) {
  border-color: var(--accent-gold);
  background: rgba(197, 160, 89, 0.1);
}

.map-link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-maps {
  color: #666;
  text-align: center;
  padding: 20px;
  font-size: 12px;
}
</style>


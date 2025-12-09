<template>
  <div class="combat-log-container" ref="logContainer">
    <div v-if="gameStore.gameLogs.length === 0" class="empty-log">
      游戏日志将显示在这里...
    </div>
    <div
      v-for="(log, index) in gameStore.gameLogs"
      :key="index"
      class="log-entry"
    >
      {{ log }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const logContainer = ref<HTMLElement | null>(null)

// 自动滚动到底部
watch(
  () => gameStore.gameLogs.length,
  () => {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    })
  }
)
</script>

<style scoped>
.combat-log-container {
  height: 150px;
  overflow-y: auto;
  padding: 10px;
  border-top: 1px solid #333;
  font-size: 12px;
  color: #888;
  background: rgba(0, 0, 0, 0.2);
}

.empty-log {
  color: #666;
  text-align: center;
  padding-top: 50px;
}

.log-entry {
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-entry:last-child {
  border-bottom: none;
}
</style>


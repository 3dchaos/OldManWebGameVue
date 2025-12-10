<template>
  <div class="action-menu">
    <button class="btn-menu" @click="showAttributePanel">
      📋 属性详情 (Stats)
    </button>
    <button class="btn-menu" @click="showBag">
      🎒 背包物品 (Bag)
    </button>
    <button class="btn-menu" @click="showSkills">
      ⚡ 技能法术 (Skills)
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

// 定义事件
const emit = defineEmits<{
  (e: 'show-attribute'): void
}>()

function showAttributePanel() {
  emit('show-attribute') // 发送事件
  gameStore.addGameLog('打开属性面板')
}

function showBag() {
  gameStore.addGameLog('背包功能开发中')
}

function showSkills() {
  gameStore.addGameLog('技能功能开发中')
}
</script>

<style scoped>
.action-menu { display: flex; flex-direction: column; gap: 10px; }
.btn-menu {
  width: 100%; padding: 12px; background: var(--bg-panel); border: 1px solid #333;
  color: var(--accent-gold); border-radius: 4px; cursor: pointer; text-align: left;
  transition: all 0.2s; font-size: 14px;
}
.btn-menu:hover { border-color: var(--accent-gold); background: rgba(197, 160, 89, 0.1); }
</style>
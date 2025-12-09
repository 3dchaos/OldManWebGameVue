<template>
  <div class="main-display">
    <!-- 战斗场景 -->
    <div v-if="gameStore.inBattle" class="combat-scene">
      <h3>⚔️ 遭遇战斗！</h3>
      <div class="monsters-list">
        <div
          v-for="(monster, index) in gameStore.encounteredMonsters"
          :key="index"
          class="monster-item"
        >
          {{ monster.name }} Lv.{{ monster.level }}
        </div>
      </div>
      <button class="btn btn-danger" @click="handleEscape">🏃 逃跑</button>
    </div>

    <!-- 探索场景 -->
    <div v-else class="roam-scene">
      <p class="scene-text">你正在此处探索...</p>
      <div
        v-if="gameStore.currentMap?.encounterable_monsters?.length"
        class="encounterable-monsters-hint"
      >
        <p>⚠️ 本区域可能遭遇的怪物：</p>
        <div class="monsters-list">
          <span
            v-for="(monster, index) in gameStore.currentMap.encounterable_monsters"
            :key="index"
            class="monster-tag"
          >
            {{ monster.name }} (Lv.{{ monster.level }})
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { socketService } from '@/services/socket'

const gameStore = useGameStore()

function handleEscape() {
  if (!gameStore.currentRoleId) return

  socketService.emit('rolecontrol', {
    type: 'escapeFromBattle',
    roleId: gameStore.currentRoleId,
  })
}
</script>

<style scoped>
.main-display {
  flex: 1;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.combat-scene {
  text-align: center;
  width: 100%;
}

.combat-scene h3 {
  color: #ff6b6b;
  margin-bottom: 20px;
  font-size: 24px;
}

.monsters-list {
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.monster-item {
  padding: 8px 16px;
  background: rgba(138, 28, 28, 0.3);
  border: 1px solid #8a1c1c;
  border-radius: 4px;
  color: #ff6b6b;
}

.roam-scene {
  text-align: center;
  width: 100%;
}

.scene-text {
  font-size: 18px;
  color: #888;
  margin-bottom: 20px;
}

.encounterable-monsters-hint {
  margin-top: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.encounterable-monsters-hint p {
  font-size: 14px;
  color: #ffa500;
  margin-bottom: 10px;
}

.monster-tag {
  display: inline-block;
  padding: 4px 8px;
  margin: 4px;
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 4px;
  font-size: 12px;
  color: #ffa500;
}
</style>


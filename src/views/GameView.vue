<template>
  <div class="game-view">
    <div class="game-container">
      <div class="game-sidebar left-sidebar">
        <CharacterCard />
        <ActionMenu @show-attribute="showAttributePanel = true" />
      </div>

      <div class="game-stage">
        <StageHeader />
        <MainDisplay />
        <CombatLog />
      </div>

      <div class="game-sidebar right-sidebar">
        <MapNavigation />
        <ControlPanel />
      </div>
    </div>

    <RoleAttributePanel v-if="showAttributePanel" @close="showAttributePanel = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { socketService } from '@/services/socket'
import { useRouter } from 'vue-router'
import CharacterCard from '@/components/game/CharacterCard.vue'
import ActionMenu from '@/components/game/ActionMenu.vue'
import StageHeader from '@/components/game/StageHeader.vue'
import MainDisplay from '@/components/game/MainDisplay.vue'
import CombatLog from '@/components/game/CombatLog.vue'
import MapNavigation from '@/components/game/MapNavigation.vue'
import ControlPanel from '@/components/game/ControlPanel.vue'
import RoleAttributePanel from '@/components/game/RoleAttributePanel.vue'

const gameStore = useGameStore()
const router = useRouter()
const showAttributePanel = ref(false)

onMounted(() => {
  if (!gameStore.currentRole || !gameStore.currentRoleId) {
    router.push({ name: 'select-role' })
    return
  }

  if (!socketService.connected) socketService.connect()

  // 初始化请求数据
  socketService.emit('rolecontrol', { type: 'getRoleData', roleId: gameStore.currentRoleId })
  socketService.emit('rolecontrol', { type: 'getCurrentMapData', roleId: gameStore.currentRoleId })
})
</script>

<style scoped>
/* 保持原有样式 */
.game-view { min-height: 100vh; background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%); padding: 20px; }
.game-container { display: grid; grid-template-columns: 280px 1fr 280px; gap: 20px; max-width: 1800px; margin: 0 auto; min-height: calc(100vh - 40px); }
.game-sidebar { display: flex; flex-direction: column; gap: 20px; }
.game-stage { display: flex; flex-direction: column; background: var(--bg-panel); border: 1px solid #333; border-radius: 8px; overflow: hidden; }
@media (max-width: 1400px) { .game-container { grid-template-columns: 250px 1fr 250px; } }
@media (max-width: 1200px) { .game-container { grid-template-columns: 1fr; } .game-sidebar { order: 2; } .game-stage { order: 1; } }
</style>
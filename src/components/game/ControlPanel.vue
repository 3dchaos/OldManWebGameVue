<template>
  <div class="control-panel">
    <div class="btn-grid">
      <button class="btn btn-danger" @click="handleLogout">🚪 退出世界</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { socketService } from '@/services/socket'

const gameStore = useGameStore()

function handleLogout() {
  if (!gameStore.currentRoleId) return

  if (!confirm('确定要退出游戏世界吗？')) {
    return
  }

  socketService.emit('rolecontrol', {
    type: 'logoutRole',
    roleId: gameStore.currentRoleId,
  })

  // 监听退出成功
  socketService.on('rolecontrol', (data: any) => {
    if (data.type === 'logoutRole' && data.success) {
      gameStore.setView('select-role')
    }
  })
}
</script>

<style scoped>
.control-panel {
  background: var(--bg-panel);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 15px;
}

.btn-grid {
  display: grid;
  gap: 10px;
}

.btn {
  width: 100%;
  padding: 12px;
  background: var(--accent-gold-dim);
  border: none;
  color: #000;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--accent-gold);
}

.btn-danger {
  background: #8a1c1c;
  color: #fff;
}

.btn-danger:hover {
  background: #a02020;
}
</style>


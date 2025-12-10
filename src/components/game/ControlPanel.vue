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
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const gameStore = useGameStore()
const router = useRouter()

function handleLogout() {
  if (!gameStore.currentRoleId) return

  // 核心修复：使用 SweetAlert2 替代原生 confirm
  Swal.fire({
    title: '退出世界',
    text: "确定要返回角色选择界面吗？",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    background: '#1a1a2e',
    color: '#fff',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
  }).then((result) => {
    if (result.isConfirmed) {
      socketService.emit('rolecontrol', {
        type: 'logoutRole',
        roleId: gameStore.currentRoleId,
      })
    }
  })

  // 核心修复：退出角色时立即重置战斗状态和传送状态，避免状态残留
  gameStore.setBattleStatus(false)
  gameStore.setTransferStatus(0)
  gameStore.setCurrentMap(null)

  // 监听退出成功
  const logoutHandler = (data: any) => {
    if (data.type === 'logoutRole' && data.success) {
      // 核心修复：退出角色时，清理所有游戏状态
      gameStore.setBattleStatus(false)
      gameStore.setTransferStatus(0)
      gameStore.setCurrentMap(null)
      gameStore.setCurrentRole(null)
      // 清空遭遇的怪物列表
      gameStore.encounteredMonsters = []
      // 移除监听器，避免重复监听
      socketService.off('rolecontrol', logoutHandler)
      router.push({ name: 'select-role' })
    }
  }
  socketService.on('rolecontrol', logoutHandler)
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
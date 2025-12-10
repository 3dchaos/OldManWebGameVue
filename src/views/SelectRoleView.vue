<template>
  <div class="select-role-view">
    <h1>选择你的英雄</h1>

    <div class="role-cards-container">
      <RoleCard
        v-for="(role, index) in roleSlots"
        :key="index"
        :role="role"
        :slot-index="index + 1"
        @select="handleSelectRole"
        @create="handleCreateRole"
        @delete="handleDeleteRole"
      />
    </div>

    <div class="action-buttons">
      <button class="btn" :disabled="!selectedRoleId" @click="handleStartGame">进入世界</button>
      <button class="btn btn-danger" @click="handleLogout">退出账号</button>
    </div>

    <CreateRolePanel
      v-if="showCreatePanel"
      :slot-index="createSlotIndex"
      @close="showCreatePanel = false"
      @created="handleRoleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { socketService } from '@/services/socket'
import { useRouter } from 'vue-router'
import RoleCard from '@/components/RoleCard.vue'
import CreateRolePanel from '@/components/CreateRolePanel.vue'
import Swal from 'sweetalert2'
import type { Role } from '@/stores/game'

const gameStore = useGameStore()
const router = useRouter()

const selectedRoleId = ref<number | null>(null)
const showCreatePanel = ref(false)
const createSlotIndex = ref(1)

// 自动计算插槽，确保响应式更新
const roleSlots = computed(() => {
  const slots: (Role | null)[] = [null, null]
  if (!gameStore.roleList) return slots;
  
  gameStore.roleList.forEach((role) => {
    if (role) {
      const slotIndex = role.slot ? role.slot - 1 : 0;
      if (slotIndex >= 0 && slotIndex < slots.length) {
        slots[slotIndex] = role
      }
    }
  })
  return slots
})

onMounted(() => {
  if (!gameStore.username || !gameStore.isLoggedIn) {
    router.push({ name: 'login' })
    return
  }
  // 每次进入页面尝试刷新一次列表
  socketService.emit('message', { type: 'login', name: gameStore.username, password: '' })
  
  // 监听角色控制响应
  socketService.on('rolecontrol', handleRoleControlResponse)
  
  // 监听通用响应（用于刷新角色列表）
  socketService.on('response', handleResponse)
})

// 处理通用响应，主要用于刷新角色列表
function handleResponse(data: any) {
  if (data.type === 'login' && data.success && data.roleList) {
    // 登录响应中包含角色列表，更新 store
    gameStore.setRoleList(data.roleList)
  }
}

function handleRoleControlResponse(data: any) {
  if (data.type === 'loginRole') {
    if (data.success && data.roleData) {
      gameStore.setCurrentRole(data.roleData)
      router.push({ name: 'game' })
    } else {
      Swal.fire({
        icon: 'error',
        title: '进入失败',
        text: data.content,
        background: '#1a1a2e',
        color: '#fff'
      })
    }
  } else if (data.type === 'createRole') {
    // 创建角色成功后刷新列表
    if (data.success) {
      // 延迟一下确保后端处理完成
      setTimeout(() => {
        socketService.emit('message', { 
          type: 'login', 
          name: gameStore.username, 
          password: '' 
        })
      }, 300)
    }
  } else if (data.type === 'deleteRole') {
    // 删除角色成功后刷新列表
    if (data.success) {
      selectedRoleId.value = null
      // 延迟一下确保后端处理完成
      setTimeout(() => {
        socketService.emit('message', { 
          type: 'login', 
          name: gameStore.username, 
          password: '' 
        })
      }, 300)
    }
  }
}

function handleSelectRole(roleId: number) {
  selectedRoleId.value = roleId
}

function handleCreateRole(slotIndex: number) {
  createSlotIndex.value = slotIndex
  showCreatePanel.value = true
}

function handleDeleteRole(roleId: number) {
  Swal.fire({
    title: '确定要删除吗？',
    text: "角色删除后将无法恢复！",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    background: '#1a1a2e',
    color: '#fff'
  }).then((result) => {
    if (result.isConfirmed) {
      socketService.emit('rolecontrol', { type: 'deleteRole', roleId: roleId })
      selectedRoleId.value = null
    }
  })
}

function handleStartGame() {
  if (!selectedRoleId.value) return
  socketService.emit('rolecontrol', { type: 'loginRole', roleId: selectedRoleId.value })
}

function handleLogout() {
  Swal.fire({
    title: '退出登录',
    text: "确定要返回登录界面吗？",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    background: '#1a1a2e',
    color: '#fff'
  }).then((result) => {
    if (result.isConfirmed) {
      socketService.emit('message', { type: 'logout' })
      gameStore.reset()
      router.push({ name: 'login' })
    }
  })
}

function handleRoleCreated() {
  showCreatePanel.value = false
}
</script>

<style scoped>
.select-role-view {
  min-height: 100vh; padding: 40px; background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%); text-align: center;
}
.select-role-view h1 { color: var(--accent-gold); margin-bottom: 40px; font-size: 36px; }
.role-cards-container { display: flex; gap: 30px; justify-content: center; margin-bottom: 40px; flex-wrap: wrap; }
.action-buttons { display: flex; gap: 15px; justify-content: center; align-items: center; }
.btn {
  padding: 15px 30px; background: var(--accent-gold-dim); border: none; color: #000;
  border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 18px; transition: all 0.2s;
}
.btn:hover:not(:disabled) { background: var(--accent-gold); transform: translateY(-2px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { background: #8a1c1c; color: #fff; font-size: 16px; }
.btn-danger:hover { background: #a02020; }
</style>
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
      <button
        class="btn"
        :disabled="!selectedRoleId"
        @click="handleStartGame"
      >
        进入世界
      </button>
      <button class="btn btn-danger" @click="handleLogout">退出账号</button>
    </div>

    <!-- 创建角色面板 -->
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
import type { Role } from '@/stores/game'

const gameStore = useGameStore()
const router = useRouter()

const selectedRoleId = ref<number | null>(null)
const showCreatePanel = ref(false)
const createSlotIndex = ref(1)

// 角色槽位（最多2个）
const roleSlots = computed(() => {
  const slots: (Role | null)[] = [null, null]
  
  // 增加对空数组的保护
  if (!gameStore.roleList) return slots;

  gameStore.roleList.forEach((role) => {
    // 1. [关键修复] 检查 role 是否为 null
    if (role) {
      // 2. [关键修复] 使用 role.slot 字段 (后端已提供 1 或 2)，注意数组下标是 0 和 1
      // 如果后端传回的 slot 可能是字符串，建议转一下类型: Number(role.slot)
      // 如果你的 Role 接口没有定义 slot，可能需要临时加一下或者用 any
      const slotIndex = (role as any).slot ? (role as any).slot - 1 : 0;
      
      // 只有当下标合法时才赋值
      if (slotIndex >= 0 && slotIndex < slots.length) {
        slots[slotIndex] = role
      }
    }
  })
  return slots
})

onMounted(() => {
  // 检查登录状态，如果未登录则切换到登录视图
  if (!gameStore.username || !gameStore.isLoggedIn) {
    router.push({ name: 'login' })
    return
  }

  // 确保连接
  if (!socketService.connected) {
    socketService.connect()
  }

  // 加载角色列表
  loadRoleList()

  // 监听响应事件
  socketService.on('response', handleResponse)

  // 监听角色控制响应
  socketService.on('rolecontrol', handleRoleControlResponse)
})

function loadRoleList() {
  // 如果已有角色列表，直接使用
  if (gameStore.roleList.length > 0) {
    console.log('Role list already loaded:', gameStore.roleList.length)
    return
  }

  // 如果没有角色列表，需要重新登录获取
  // 注意：刷新页面时 store 会丢失，所以需要重新登录
  if (gameStore.username) {
    console.log('Loading role list for user:', gameStore.username)
    // 这里不能直接获取，因为密码不在 store 中
    // 所以刷新页面时应该跳转到登录页（路由守卫会处理）
    // 但如果是正常跳转过来的，数据应该已经在 store 中
    // 如果数据丢失，说明是刷新页面，应该由路由守卫处理
  }
}

function handleResponse(data: any) {
  if (data.type === 'login' && data.success) {
    if (data.roleList) {
      gameStore.setRoleList(data.roleList)
    }
    // 如果登录失败（可能是密码错误），跳转到登录页
    if (!data.success && data.content) {
      alert(data.content)
      router.push({ name: 'login' })
    }
  }
}

function handleRoleControlResponse(data: any) {
  if (data.type === 'createRole') {
    if (data.success) {
      // 刷新角色列表
      socketService.emit('message', {
        type: 'login',
        name: gameStore.username,
        password: '',
      })
      showCreatePanel.value = false
      handleRoleCreated()
    } else {
      alert(data.content || '创建角色失败')
    }
  } else if (data.type === 'deleteRole') {
    if (data.success) {
      // 刷新角色列表
      socketService.emit('message', {
        type: 'login',
        name: gameStore.username,
        password: '',
      })
      selectedRoleId.value = null
    } else {
      alert(data.content || '删除角色失败')
    }
  } else if (data.type === 'loginRole') {
    if (data.success && data.roleData) {
      gameStore.setCurrentRole(data.roleData)
      router.push({ name: 'game' })
    } else {
      alert(data.content || '进入游戏失败')
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
  if (!confirm('确定要删除这个角色吗？')) {
    return
  }

  socketService.emit('rolecontrol', {
    type: 'deleteRole',
    roleId: roleId,
  })
}

function handleStartGame() {
  if (!selectedRoleId.value) return

  if (!socketService.connected) {
    alert('未连接到服务器，请稍候再试')
    return
  }

  socketService.emit('rolecontrol', {
    type: 'loginRole',
    roleId: selectedRoleId.value,
  })
  
  // 响应会在 handleRoleControlResponse 中处理
}

function handleLogout() {
  socketService.emit('message', { type: 'logout' })
  gameStore.reset()
  router.push({ name: 'login' })
}

function handleRoleCreated() {
  showCreatePanel.value = false
  // 角色列表会自动刷新
}
</script>

<style scoped>
.select-role-view {
  min-height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  text-align: center;
}

.select-role-view h1 {
  color: var(--accent-gold);
  margin-bottom: 40px;
  font-size: 36px;
}

.role-cards-container {
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.btn {
  padding: 15px 30px;
  background: var(--accent-gold-dim);
  border: none;
  color: #000;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 18px;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background: var(--accent-gold);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: #8a1c1c;
  color: #fff;
  font-size: 16px;
}

.btn-danger:hover {
  background: #a02020;
}
</style>


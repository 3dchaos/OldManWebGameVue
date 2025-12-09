<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import LoginView from './views/LoginView.vue'
import SelectRoleView from './views/SelectRoleView.vue'
import GameView from './views/GameView.vue'
import AdminView from './views/AdminView.vue'

const gameStore = useGameStore()

// 根据当前视图状态显示对应组件
const currentComponent = computed(() => {
  switch (gameStore.currentView) {
    case 'login':
      return LoginView
    case 'select-role':
      return SelectRoleView
    case 'game':
      return GameView
    case 'admin':
      return AdminView
    default:
      return LoginView
  }
})
</script>

<template>
  <component :is="currentComponent" />
</template>

<style scoped>
</style>

import { createRouter, createWebHistory } from 'vue-router'
import { useGameStore } from '@/stores/game'
import LoginView from '../views/LoginView.vue'
import SelectRoleView from '../views/SelectRoleView.vue'
import GameView from '../views/GameView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/select-role',
      name: 'select-role',
      component: SelectRoleView,
      meta: { requiresAuth: true },
    },
    {
      path: '/game',
      name: 'game',
      component: GameView,
      meta: { requiresAuth: true, requiresRole: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
  ],
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const gameStore = useGameStore()

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    // 检查是否已登录
    if (!gameStore.isLoggedIn || !gameStore.username) {
      // 未登录，跳转到登录页
      next({ name: 'login' })
      return
    }
  }

  // 需要角色的页面（游戏界面）
  if (to.meta.requiresRole) {
    if (!gameStore.currentRole) {
      // 没有角色，跳转到角色选择页
      next({ name: 'select-role' })
      return
    }
  }

  next()
})

export default router

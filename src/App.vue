<script setup lang="ts">
  import { useGameStore } from '@/stores/game'
  import { useRouter } from 'vue-router'
  import { onMounted } from 'vue'
  
  const gameStore = useGameStore()
  const router = useRouter()
  
  onMounted(() => {
    // 简单的路由守卫补充：如果刷新页面且没有登录，去登录页
    if (!gameStore.isLoggedIn && router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' })
    }
  })
  </script>
  
  <template>
    <router-view />
  
    <div v-if="!gameStore.isConnected" class="disconnect-overlay">
      <div class="disconnect-box">
        <div class="spinner"></div>
        <h2>与服务器断开连接</h2>
        <p>正在尝试重新连接...</p>
      </div>
    </div>
  </template>
  
  <style scoped>
  .disconnect-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
  }
  
  .disconnect-box {
    text-align: center;
    color: #ff6b6b;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(255, 255, 255, 0.1);
    border-top: 5px solid #ff6b6b;
    border-radius: 50%;
    margin: 0 auto 20px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
<template>
  <div class="login-view">
    <div class="connection-status" :class="{ connected: gameStore.isConnected }">
      {{ gameStore.connectionStatus }}
    </div>

    <div class="login-container">
      <h1>{{ gameName }}</h1>
      <div class="version">Version: {{ version }}</div>

      <div class="login-register">
        <div class="input-group">
          <input v-model="account" type="text" placeholder="账号 ACCOUNT" @keyup.enter="handleLogin" />
        </div>
        <div class="input-group">
          <input v-model="password" type="password" placeholder="密码 PASSWORD" @keyup.enter="handleLogin" />
        </div>
        <div class="input-group" v-if="isRegisterMode">
          <input v-model="email" type="email" placeholder="邮箱 E-MAIL" @keyup.enter="handleRegister" />
        </div>
      </div>

      <div class="button-group">
        <button class="btn" @click="handleLogin" :disabled="loading">⚔️ 登 录</button>
        <button class="btn" @click="toggleRegisterMode" :disabled="loading">{{ isRegisterMode ? '返回登录' : '注 册' }}</button>
        <button v-if="isRegisterMode" class="btn" @click="handleRegister" :disabled="loading">确认注册</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { socketService } from '@/services/socket'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const gameStore = useGameStore()
const router = useRouter()

const account = ref('')
const password = ref('')
const email = ref('')
const isRegisterMode = ref(false)
const loading = ref(false)
const version = ref('v1.0.1')
const gameName = ref('老登传奇')

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/config')
    const config = await response.json()
    if (config.success) {
      gameName.value = config.gameName || '老登传奇'
      version.value = config.version || 'v1.0.1'
    }
  } catch (error) {
    console.warn('Config fetch failed, using default')
  }

  socketService.connect()
  socketService.on('response', handleServerResponse)
})

onUnmounted(() => {
  socketService.off('response', handleServerResponse)
})

function handleServerResponse(data: any) {
  loading.value = false
  
  if (data.type === 'login') {
    if (data.success && data.roleList) {
      gameStore.setLoggedIn(true, account.value)
      gameStore.setRoleList(data.roleList)
      Swal.fire({
        icon: 'success',
        title: '登录成功',
        timer: 1500,
        showConfirmButton: false,
        background: '#1a1a2e',
        color: '#fff'
      })
      router.push({ name: 'select-role' })
    } else {
      Swal.fire({
        icon: 'error',
        title: '登录失败',
        text: data.content,
        background: '#1a1a2e',
        color: '#fff'
      })
    }
  } else if (data.type === 'register') {
    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: '注册成功',
        text: '请直接登录',
        background: '#1a1a2e',
        color: '#fff'
      })
      isRegisterMode.value = false
      password.value = ''
    } else {
      Swal.fire({
        icon: 'error',
        title: '注册失败',
        text: data.content,
        background: '#1a1a2e',
        color: '#fff'
      })
    }
  }
}

function toggleRegisterMode() {
  isRegisterMode.value = !isRegisterMode.value
  email.value = ''
}

function handleLogin() {
  if (!account.value || !password.value) return Swal.fire('提示', '请输入账号密码', 'warning')
  loading.value = true
  socketService.emit('message', { type: 'login', name: account.value, password: password.value })
}

function handleRegister() {
  if (!account.value || !password.value) return Swal.fire('提示', '请输入完整信息', 'warning')
  loading.value = true
  socketService.emit('message', { type: 'register', name: account.value, password: password.value, email: email.value })
}
</script>

<style scoped>
/* 保持原有样式 */
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  position: relative;
}
.connection-status {
  position: fixed;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  font-size: 12px;
  opacity: 0.5;
  z-index: 9999;
  color: #8a1c1c;
}
.connection-status.connected { color: #2d6b36; }
.login-container {
  background: var(--bg-panel);
  padding: 40px;
  border: 2px solid var(--accent-gold-dim);
  border-radius: 8px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
  text-align: center;
  min-width: 400px;
}
.login-container h1 { color: var(--accent-gold); margin-bottom: 10px; font-size: 32px; }
.version { color: #666; margin-bottom: 30px; font-size: 12px; }
.login-register { margin-bottom: 30px; }
.input-group { margin-bottom: 15px; }
.input-group input {
  width: 100%; padding: 12px; background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333; border-radius: 4px; color: #fff; font-size: 16px; box-sizing: border-box;
}
.input-group input:focus { outline: none; border-color: var(--accent-gold); }
.button-group { display: flex; gap: 15px; justify-content: center; }
.btn {
  padding: 12px 24px; background: var(--accent-gold-dim); border: none; color: #000;
  border-radius: 4px; cursor: pointer; font-weight: bold; transition: all 0.2s; font-size: 16px;
}
.btn:hover:not(:disabled) { background: var(--accent-gold); transform: translateY(-2px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
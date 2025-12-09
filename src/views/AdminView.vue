<template>
  <div class="admin-view">
    <div class="connection-status" :class="{ connected: isConnected }">
      {{ connectionStatus }}
    </div>

    <!-- 登录界面 -->
    <div v-if="!isAdminLoggedIn" class="admin-login">
      <h1>🛡️ 管理员鉴权</h1>
      <input
        v-model="adminName"
        type="text"
        placeholder="管理员账号"
        @keyup.enter="handleAdminLogin"
      />
      <input
        v-model="adminPassword"
        type="password"
        placeholder="鉴权密钥"
        @keyup.enter="handleAdminLogin"
      />
      <button class="btn" @click="handleAdminLogin">接入控制台</button>
    </div>

    <!-- 控制台界面 -->
    <div v-else class="admin-console">
      <h1>⚙️ 核心控制台</h1>

      <div class="admin-toolbar">
        <div class="stat-box">
          当前在线: <span>{{ onlineUserNumber }}</span>
        </div>
        <div class="divider"></div>
        <button class="btn" @click="refreshOnlineUserNumber">🔄 刷新人数</button>
        <button class="btn" @click="refreshOnlineUserTable">👥 玩家列表</button>
        <button class="btn" @click="refreshMapTable">🗺️ 地图监控</button>
        <button class="btn" @click="refreshMonsterTable">👹 怪物图鉴</button>
        <button class="btn btn-danger" @click="handleClearDb">⚠️ 清空数据</button>
        <div style="flex: 1;"></div>
        <button class="btn" @click="handleAdminLogout">🔌 断开连接</button>
      </div>

      <!-- 在线用户列表 -->
      <div v-if="showOnlineUsers" class="admin-section">
        <h2>在线角色列表</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>角色名</th>
                <th>账号</th>
                <th>Lv</th>
                <th>职业</th>
                <th>地图</th>
                <th>HP/MP</th>
                <th>金/钻</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in onlineUserTable" :key="user.role_id">
                <td>{{ user.role_id }}</td>
                <td>{{ user.role_name }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.level }}</td>
                <td>{{ user.role_class }}</td>
                <td>{{ user.current_map_name || '-' }}</td>
                <td>{{ user.hp }}/{{ user.mp }}</td>
                <td>{{ user.gold }}/{{ user.diamond }}</td>
                <td>
                  <button
                    class="btn btn-small"
                    @click="kickRole(user.role_id)"
                  >
                    踢出
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 地图监控 -->
      <div v-if="showMaps" class="admin-section">
        <h2>地图数据监控</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>名称</th>
                <th>类型</th>
                <th>传送CD</th>
                <th>连接点</th>
                <th>生态 (怪/人)</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="map in mapTable" :key="map.map_id">
                <td>{{ map.map_id }}</td>
                <td>{{ map.map_name }}</td>
                <td>{{ map.map_type }}</td>
                <td>{{ map.transfer_cd || '-' }}</td>
                <td>{{ map.linked_maps?.length || 0 }}</td>
                <td>{{ map.monster_count || 0 }}/{{ map.player_count || 0 }}</td>
                <td>
                  <button
                    class="btn btn-small"
                    @click="refreshMonsters(map.map_id)"
                  >
                    刷怪
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 怪物图鉴 -->
      <div v-if="showMonsters" class="admin-section">
        <h2>怪物生态数据</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>名称</th>
                <th>数量</th>
                <th>Lv/HP</th>
                <th>攻/防</th>
                <th>金币掉落</th>
                <th>分布区域</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="monster in monsterTable" :key="monster.monster_id">
                <td>{{ monster.monster_id }}</td>
                <td>{{ monster.name }}</td>
                <td>{{ monster.count || 0 }}</td>
                <td>{{ monster.level }}/{{ monster.hp }}</td>
                <td>{{ monster.attack }}/{{ monster.defense }}</td>
                <td>{{ monster.gold_drop || 0 }}</td>
                <td>{{ monster.maps?.join(', ') || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { socketService } from '@/services/socket'

const isConnected = ref(false)
const connectionStatus = ref('连接中...')
const isAdminLoggedIn = ref(false)
const adminName = ref('')
const adminPassword = ref('')

const onlineUserNumber = ref(0)
const onlineUserTable = ref<any[]>([])
const mapTable = ref<any[]>([])
const monsterTable = ref<any[]>([])

const showOnlineUsers = ref(false)
const showMaps = ref(false)
const showMonsters = ref(false)

onMounted(() => {
  socketService.connect()

  socketService.on('connect', () => {
    isConnected.value = true
    connectionStatus.value = 'Console Connected'
  })

  socketService.on('disconnect', () => {
    isConnected.value = false
    connectionStatus.value = 'Disconnected'
  })

  socketService.on('admincontrol', (data: any) => {
    handleAdminResponse(data)
  })
})

function handleAdminResponse(data: any) {
  const { type, success, content } = data

  switch (type) {
    case 'adminLogin':
      if (success) {
        isAdminLoggedIn.value = true
      } else {
        alert(content || '登录失败')
      }
      break

    case 'refreshOnlineUserNumber':
      if (success && data.onlineUserNumber !== undefined) {
        onlineUserNumber.value = data.onlineUserNumber
      }
      break

    case 'refreshOnlineUserTable':
      if (success && data.onlineUserTable) {
        onlineUserTable.value = data.onlineUserTable
        showOnlineUsers.value = true
        showMaps.value = false
        showMonsters.value = false
      }
      break

    case 'refreshMapTable':
      if (success && data.mapTable) {
        mapTable.value = data.mapTable
        showMaps.value = true
        showOnlineUsers.value = false
        showMonsters.value = false
      }
      break

    case 'refreshMonsterTable':
      if (success && data.monsterTable) {
        monsterTable.value = data.monsterTable
        showMonsters.value = true
        showOnlineUsers.value = false
        showMaps.value = false
      }
      break

    case 'clearDb':
      if (success) {
        alert('数据库已清空')
      } else {
        alert(content || '操作失败')
      }
      break

    case 'kickRole':
      if (success) {
        alert('角色已踢出')
        refreshOnlineUserTable()
      } else {
        alert(content || '操作失败')
      }
      break
  }
}

function handleAdminLogin() {
  socketService.emit('admincontrol', {
    type: 'adminLogin',
    name: adminName.value,
    password: adminPassword.value,
  })
}

function handleAdminLogout() {
  socketService.emit('admincontrol', {
    type: 'logout',
    name: adminName.value,
  })
  isAdminLoggedIn.value = false
  adminName.value = ''
  adminPassword.value = ''
}

function refreshOnlineUserNumber() {
  socketService.emit('admincontrol', {
    type: 'refreshOnlineUserNumber',
    name: adminName.value,
  })
}

function refreshOnlineUserTable() {
  socketService.emit('admincontrol', {
    type: 'refreshOnlineUserTable',
    name: adminName.value,
  })
}

function refreshMapTable() {
  socketService.emit('admincontrol', {
    type: 'refreshMapTable',
    name: adminName.value,
  })
}

function refreshMonsterTable() {
  socketService.emit('admincontrol', {
    type: 'refreshMonsterTable',
    name: adminName.value,
  })
}

function handleClearDb() {
  if (!confirm('确定要清空数据库吗？此操作不可恢复！')) {
    return
  }
  socketService.emit('admincontrol', {
    type: 'clearDb',
    name: adminName.value,
  })
}

function kickRole(roleId: number) {
  if (!confirm('确定要踢出该角色吗？')) {
    return
  }
  socketService.emit('admincontrol', {
    type: 'kickRole',
    name: adminName.value,
    role_id: roleId,
  })
}

function refreshMonsters(mapId?: string) {
  socketService.emit('admincontrol', {
    type: 'refreshMonsters',
    name: adminName.value,
    map_id: mapId,
  })
}
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  padding: 20px;
  background: #111;
  color: var(--text-main);
}

.connection-status {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  font-size: 12px;
  opacity: 0.6;
  color: #8a1c1c;
}

.connection-status.connected {
  color: #2d6b36;
}

.admin-login {
  max-width: 400px;
  margin: 50px auto;
  background: var(--bg-panel);
  padding: 40px;
  border: 2px solid var(--accent-gold-dim);
  text-align: center;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
}

.admin-login h1 {
  color: var(--accent-gold);
  margin-bottom: 30px;
}

.admin-login input {
  width: 100%;
  margin-bottom: 15px;
}

.admin-console h1 {
  color: var(--accent-gold);
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.admin-toolbar {
  background: #16181d;
  padding: 15px;
  border: 1px solid #333;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.stat-box {
  color: #aaa;
  margin-right: 20px;
  font-size: 14px;
}

.stat-box span {
  color: var(--accent-green);
  font-weight: bold;
  font-size: 18px;
  margin-left: 5px;
}

.divider {
  width: 1px;
  height: 30px;
  background: #333;
  margin-right: 20px;
}

.admin-section {
  margin-top: 20px;
}

.admin-section h2 {
  color: var(--accent-gold);
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #333;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #0f1014;
  font-size: 13px;
}

th {
  background: #1a1d24;
  color: var(--accent-gold);
  padding: 12px;
  border: 1px solid #333;
  text-align: left;
}

td {
  border: 1px solid #333;
  padding: 10px;
  color: #ccc;
}

tr:hover {
  background: #222;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
  min-width: auto;
}
</style>


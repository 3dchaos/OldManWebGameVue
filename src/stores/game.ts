import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Role {
  role_id: number
  role_name: string
  role_class: string
  role_gender: string
  level: number
  hp: number
  max_hp: number
  mp: number
  max_mp: number
  exp: number
  max_exp: number
  gold: number
  diamond: number
  dc: [number, number]
  mc: [number, number]
  sc: [number, number]
  ac: [number, number]
  mac: [number, number]
  current_map_id?: string
  current_map_name?: string
  current_map_safe?: boolean
}

export interface MapData {
  map_id: string
  map_name: string
  map_type: string
  linked_maps: Array<{ map_id: string; map_name: string }>
  encounterable_monsters?: Array<{ name: string; level: number }>
}

export const useGameStore = defineStore('game', () => {
  // 连接状态
  const isConnected = ref(false)
  const connectionStatus = ref('连接中...')

  // 用户状态
  const isLoggedIn = ref(false)
  const username = ref('')
  const roleList = ref<Role[]>([])

  // 当前角色
  const currentRole = ref<Role | null>(null)
  const currentRoleId = ref<number | null>(null)

  // 当前视图状态：'login' | 'select-role' | 'game' | 'admin'
  const currentView = ref<'login' | 'select-role' | 'game' | 'admin'>('login')

  // 地图数据
  const currentMap = ref<MapData | null>(null)

  // 战斗状态
  const inBattle = ref(false)
  const encounteredMonsters = ref<any[]>([])

  // 传送状态
  const transferStatus = ref(0) // 0: 无, 1: 传送中, 2: 传送完成
  const transferTime = ref(0)
  const transferMapId = ref<string | null>(null)

  // 游戏日志
  const gameLogs = ref<string[]>([])

  // Computed
  const selectedRole = computed(() => {
    if (!currentRoleId.value) return null
    return roleList.value.find(r => r.role_id === currentRoleId.value)
  })

  const hpPercentage = computed(() => {
    if (!currentRole.value) return 0
    return (currentRole.value.hp / currentRole.value.max_hp) * 100
  })

  const mpPercentage = computed(() => {
    if (!currentRole.value) return 0
    return (currentRole.value.mp / currentRole.value.max_mp) * 100
  })

  // Actions
  function setConnected(status: boolean) {
    isConnected.value = status
    connectionStatus.value = status ? '已连接' : '连接断开'
  }

  function setLoggedIn(loggedIn: boolean, user?: string) {
    isLoggedIn.value = loggedIn
    if (user) username.value = user
    if (!loggedIn) {
      username.value = ''
      roleList.value = []
      currentRole.value = null
      currentRoleId.value = null
    }
  }

  function setRoleList(roles: Role[]) {
    roleList.value = roles
  }

  function setCurrentRole(role: Role | null) {
    currentRole.value = role
    if (role) {
      currentRoleId.value = role.role_id
    } else {
      currentRoleId.value = null
    }
  }

  function updateRoleData(roleData: Partial<Role>) {
    if (currentRole.value) {
      currentRole.value = { ...currentRole.value, ...roleData }
    }
  }

  function setCurrentMap(map: MapData | null) {
    currentMap.value = map
  }

  function setBattleStatus(inBattleStatus: boolean, monsters: any[] = []) {
    inBattle.value = inBattleStatus
    encounteredMonsters.value = monsters
  }

  function setTransferStatus(status: number, time: number = 0, mapId: string | null = null) {
    transferStatus.value = status
    transferTime.value = time
    transferMapId.value = mapId
  }

  function addGameLog(message: string) {
    gameLogs.value.push(message)
    // 限制日志数量
    if (gameLogs.value.length > 100) {
      gameLogs.value.shift()
    }
  }

  function clearGameLogs() {
    gameLogs.value = []
  }

  function setView(view: 'login' | 'select-role' | 'game' | 'admin') {
    currentView.value = view
  }

  function reset() {
    isLoggedIn.value = false
    username.value = ''
    roleList.value = []
    currentRole.value = null
    currentRoleId.value = null
    currentMap.value = null
    inBattle.value = false
    encounteredMonsters.value = []
    transferStatus.value = 0
    transferTime.value = 0
    transferMapId.value = null
    gameLogs.value = []
    currentView.value = 'login'
  }

  return {
    // State
    isConnected,
    connectionStatus,
    isLoggedIn,
    username,
    roleList,
    currentRole,
    currentRoleId,
    currentMap,
    inBattle,
    encounteredMonsters,
    transferStatus,
    transferTime,
    transferMapId,
    gameLogs,
    currentView,
    // Computed
    selectedRole,
    hpPercentage,
    mpPercentage,
    // Actions
    setConnected,
    setLoggedIn,
    setRoleList,
    setCurrentRole,
    updateRoleData,
    setCurrentMap,
    setBattleStatus,
    setTransferStatus,
    addGameLog,
    clearGameLogs,
    setView,
    reset,
  }
})


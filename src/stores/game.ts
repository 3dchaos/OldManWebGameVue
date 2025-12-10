import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Role {
  role_id: number
  role_name: string
  role_class: string
  role_gender: string
  level: number
  hp: number
  mp: number
  exp: number
  // 兼容 ExpPoint 字段
  ExpPoint?: number
  gold: number
  diamond: number
  // 后端返回的临时属性 (带 _temp 前缀)
  _temp_maxhp?: number
  _temp_maxmp?: number
  _temp_UpLeverNeedExp?: number // 升级所需经验
  _temp_inMapName?: string
  _temp_inMapSafe?: number // 0 or 1
  _temp_ac_min?: number
  _temp_ac_max?: number
  _temp_mac_min?: number
  _temp_mac_max?: number
  _temp_dc_min?: number
  _temp_dc_max?: number
  _temp_mc_min?: number
  _temp_mc_max?: number
  _temp_sc_min?: number
  _temp_sc_max?: number
  // 兼容旧字段名 (可选)
  max_hp?: number
  max_mp?: number
  max_exp?: number
  slot?: number
}

export interface MapData {
  map_id: string
  map_name: string
  map_type: string
  is_safe?: number | boolean // 后端返回 0/1 或 true/false
  linked_maps: Array<{ map_id: string; map_name: string }>
  encounterable_monsters?: Array<{ monster_name: string; monster_level: number }>
  roamSceneText?: string
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

  // 地图数据
  const currentMap = ref<MapData | null>(null)

  // 战斗状态
  const inBattle = ref(false)
  const encounteredMonsters = ref<any[]>([])

  // 传送状态
  const transferStatus = ref(0)
  const transferTime = ref(0)
  const transferMapId = ref<string | null>(null)

  // 游戏日志
  const gameLogs = ref<string[]>([])

  // Computed
  const selectedRole = computed(() => {
    if (!currentRoleId.value) return null
    return roleList.value.find(r => r.role_id === currentRoleId.value)
  })

  // 修复：优先读取后端返回的 _temp_maxhp
  const maxHp = computed(() => {
    if (!currentRole.value) return 1
    return currentRole.value._temp_maxhp || currentRole.value.max_hp || 1
  })

  const maxMp = computed(() => {
    if (!currentRole.value) return 1
    return currentRole.value._temp_maxmp || currentRole.value.max_mp || 1
  })

  const currentExp = computed(() => {
    if (!currentRole.value) return 0
    return currentRole.value.ExpPoint ?? currentRole.value.exp ?? 0
  })

  const maxExp = computed(() => {
    if (!currentRole.value) return 1
    return currentRole.value._temp_UpLeverNeedExp || currentRole.value.max_exp || 1
  })

  const hpPercentage = computed(() => {
    if (!currentRole.value) return 0
    return Math.min(100, (currentRole.value.hp / maxHp.value) * 100)
  })

  const mpPercentage = computed(() => {
    if (!currentRole.value) return 0
    return Math.min(100, (currentRole.value.mp / maxMp.value) * 100)
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
    // 过滤掉 null 值
    roleList.value = roles.filter(r => r !== null)
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
    const time = new Date().toLocaleTimeString()
    gameLogs.value.push(`[${time}] ${message}`)
    if (gameLogs.value.length > 100) {
      gameLogs.value.shift()
    }
  }

  function clearGameLogs() {
    gameLogs.value = []
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
  }

  return {
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
    selectedRole,
    maxHp,
    maxMp,
    currentExp,
    maxExp,
    hpPercentage,
    mpPercentage,
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
    reset,
  }
})
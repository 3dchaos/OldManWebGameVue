import { io, Socket } from 'socket.io-client'
import { useGameStore } from '@/stores/game'
import Swal from 'sweetalert2'

class SocketService {
  private socket: Socket | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private pendingListeners: Array<{ event: string, callback: (...args: any[]) => void }> = []

  private get gameStore() {
    return useGameStore()
  }

  connect(url: string = 'http://localhost:5000') {
    if (this.socket?.connected) return

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })

    this.setupEventHandlers()
    this.startHeartbeat()
    
    this.socket.on('connect', () => {
      this.pendingListeners.forEach(({ event, callback }) => {
        this.socket?.on(event, callback)
      })
      this.pendingListeners = []
    })
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected')
      this.gameStore.setConnected(true)
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
      this.gameStore.setConnected(false)
    })

    this.socket.on('connection_status', (data: { status: string }) => {
      if (data.status === 'connected') this.gameStore.setConnected(true)
    })

    this.socket.on('heartbeat_ack', () => {})

    // 处理通用响应 (如登录/刷新列表)
    this.socket.on('response', (data: any) => {
      if (data.type === 'login' && data.success && data.roleList) {
        console.log('Auto updating role list from socket response')
        this.gameStore.setRoleList(data.roleList)
      }
    })

    // 处理角色控制事件
    this.socket.on('rolecontrol', (data: any) => {
      this.handleRoleControl(data)
    })
  }

  private handleRoleControl(data: any) {
    const { type, success, content, roleData, mapData, monsters } = data

    // 处理错误提示 (如果有)
    if (!success && content) {
      this.gameStore.addGameLog(`错误: ${content}`)
      // 如果是在选择角色界面，显示弹窗
      if (['createRole', 'deleteRole'].includes(type)) {
        Swal.fire({
          icon: 'error',
          title: '操作失败',
          text: content,
          background: '#1a1a2e',
          color: '#fff'
        })
      }
      return
    }

    switch (type) {
      case 'createRole':
        Swal.fire({
          icon: 'success',
          title: '创建成功',
          timer: 1500,
          showConfirmButton: false,
          background: '#1a1a2e',
          color: '#fff'
        })
        // 刷新列表
        this.emit('message', { type: 'login', name: this.gameStore.username, password: '' })
        break

      case 'deleteRole':
        Swal.fire({
          icon: 'success',
          title: '删除成功',
          timer: 1500,
          showConfirmButton: false,
          background: '#1a1a2e',
          color: '#fff'
        })
        this.emit('message', { type: 'login', name: this.gameStore.username, password: '' })
        break

      case 'loginRole':
        if (roleData) {
          this.gameStore.setCurrentRole(roleData)
          this.gameStore.addGameLog('进入游戏世界')
        }
        break

      case 'logoutRole':
        this.gameStore.setCurrentRole(null)
        this.gameStore.addGameLog('退出游戏世界')
        break

      case 'roleDataUpdate':
        if (roleData) {
          this.gameStore.updateRoleData(roleData)
        }
        break

      case 'getCurrentMapData':
        if (mapData) {
          this.gameStore.setCurrentMap(mapData)
        }
        break

      case 'getRoleData':
        if (roleData) {
          this.gameStore.updateRoleData(roleData)
        }
        break

      case 'startTransfer':
        this.gameStore.setTransferStatus(1, data.transfer_time || 3, data.target_map_id)
        this.gameStore.addGameLog(`开始传送...`)
        break

      case 'completeTransfer':
        this.gameStore.setTransferStatus(0)
        this.gameStore.addGameLog('传送完成')
        if (mapData) this.gameStore.setCurrentMap(mapData)
        break

      case 'encounter': // [新增] 遭遇怪物
        this.gameStore.setBattleStatus(true, monsters || [])
        this.gameStore.addGameLog('遭遇敌人！')
        break

      case 'escapeFromBattle':
        this.gameStore.setBattleStatus(false)
        this.gameStore.addGameLog('成功逃离战斗')
        break
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.emit('heartbeat', {})
      }
    }, 25000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    } else {
      this.pendingListeners.push({ event, callback })
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback)
  }

  get connected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
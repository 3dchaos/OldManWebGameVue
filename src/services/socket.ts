import { io, Socket } from 'socket.io-client'
import { useGameStore } from '@/stores/game'
import Swal from 'sweetalert2'

class SocketService {
  private socket: Socket | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
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
        // 核心修复：删除成功后，请求最新的角色列表
        this.emit('message', { type: 'login', name: this.gameStore.username, password: '' })
        break

      case 'loginRole':
        if (roleData) {
          // 核心修复：登录角色时重置战斗状态和传送状态，避免状态残留
          this.gameStore.setBattleStatus(false)
          this.gameStore.setTransferStatus(0)
          this.gameStore.setCurrentRole(roleData)
          this.gameStore.addGameLog('进入游戏世界')
        }
        break

      case 'logoutRole':
        // 核心修复：退出角色时重置所有游戏状态
        this.gameStore.setBattleStatus(false)
        this.gameStore.setTransferStatus(0)
        this.gameStore.setCurrentMap(null)
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
        // 核心修复：传送完成后，强制退出战斗状态
        this.gameStore.setBattleStatus(false)
        this.gameStore.addGameLog('传送完成')
        
        // 核心修复：优先使用返回的 mapData，如果没有则重新获取
        if (mapData) {
          this.gameStore.setCurrentMap(mapData)
        }
        
        // 核心修复：传送完成后，重新获取角色数据和地图数据，确保安全区/危险区显示正确
        // 使用 setTimeout 确保后端处理完成后再请求
        if (this.gameStore.currentRoleId) {
          setTimeout(() => {
            this.emit('rolecontrol', { 
              type: 'getRoleData', 
              roleId: this.gameStore.currentRoleId 
            })
            this.emit('rolecontrol', { 
              type: 'getCurrentMapData', 
              roleId: this.gameStore.currentRoleId 
            })
          }, 200)
        }
        break

      case 'encounter': 
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
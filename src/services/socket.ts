import { io, Socket } from 'socket.io-client'
import { useGameStore } from '@/stores/game'

class SocketService {
  private socket: Socket | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null

  // 延迟获取 store，避免在 Pinia 初始化前调用
  private get gameStore() {
    return useGameStore()
  }

  connect(url: string = 'http://localhost:5000') {
    if (this.socket?.connected) {
      return
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    this.setupEventHandlers()
    this.startHeartbeat()
    
    // 在连接建立后注册待处理的监听器
    this.socket.on('connect', () => {
      this.pendingListeners.forEach(({ event, callback }) => {
        if (this.socket) {
          this.socket.on(event, callback)
        }
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

    // 连接事件
    this.socket.on('connect', () => {
      console.log('Socket connected')
      this.gameStore.setConnected(true)
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
      this.gameStore.setConnected(false)
    })

    this.socket.on('connection_status', (data: { status: string }) => {
      if (data.status === 'connected') {
        this.gameStore.setConnected(true)
      }
    })

    // 心跳响应
    this.socket.on('heartbeat_ack', () => {
      // 心跳确认，保持连接
    })

    // 账户操作响应 - 不在这里处理，让组件自己处理
    // 组件可以通过 socketService.on('response', ...) 监听

    // 角色控制响应
    this.socket.on('rolecontrol', (data: any) => {
      this.handleRoleControl(data)
    })
  }

  private handleRoleControl(data: any) {
    const { type, success, content, roleData, mapData, roleList } = data

    switch (type) {
      case 'createRole':
        if (success) {
          this.gameStore.addGameLog('角色创建成功')
          // 刷新角色列表
          this.emit('message', { type: 'login', name: this.gameStore.username, password: '' })
        } else {
          this.gameStore.addGameLog(`创建失败: ${content}`)
        }
        break

      case 'deleteRole':
        if (success) {
          this.gameStore.addGameLog('角色删除成功')
          // 刷新角色列表
          this.emit('message', { type: 'login', name: this.gameStore.username, password: '' })
        }
        break

      case 'loginRole':
        if (success && roleData) {
          this.gameStore.setCurrentRole(roleData)
          this.gameStore.addGameLog('进入游戏世界')
        }
        break

      case 'logoutRole':
        if (success) {
          this.gameStore.setCurrentRole(null)
          this.gameStore.addGameLog('退出游戏世界')
        }
        break

      case 'roleDataUpdate':
        if (success && roleData) {
          this.gameStore.updateRoleData(roleData)
        }
        break

      case 'getCurrentMapData':
        if (success && mapData) {
          this.gameStore.setCurrentMap(mapData)
        }
        break

      case 'getRoleData':
        if (success && roleData) {
          this.gameStore.updateRoleData(roleData)
        }
        break

      case 'startTransfer':
        if (success) {
          this.gameStore.setTransferStatus(1, data.transferTime || 0, data.targetMapId)
          this.gameStore.addGameLog(`开始传送到 ${data.targetMapName || ''}`)
        }
        break

      case 'completeTransfer':
        if (success) {
          this.gameStore.setTransferStatus(0)
          this.gameStore.addGameLog('传送完成')
        }
        break

      case 'escapeFromBattle':
        if (success) {
          this.gameStore.setBattleStatus(false)
          this.gameStore.addGameLog('成功逃离战斗')
        }
        break
    }

    if (content && !success) {
      this.gameStore.addGameLog(`错误: ${content}`)
    }
  }

  // 心跳机制
  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.emit('heartbeat', {})
      }
    }, 25000) // 25秒发送一次心跳
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 发送消息
  emit(event: string, data: any) {
    if (this.socket?.connected) {
      console.log('Emitting:', event, data)
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit:', event, data)
    }
  }

  // 监听事件
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      // Socket 已连接，直接注册
      this.socket.on(event, callback)
    } else {
      // Socket 未连接，保存监听器，连接后注册
      this.pendingListeners.push({ event, callback })
    }
  }

  // 移除监听
  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback)
  }

  get connected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()


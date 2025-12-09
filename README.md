# 老登传奇 - Vue 前端项目

基于 Vue 3 + TypeScript + Pinia 重构的游戏前端项目。

## 技术栈

- **Vue 3.5+** - 渐进式 JavaScript 框架
- **TypeScript 5.9+** - 类型安全的 JavaScript
- **Pinia 2.1+** - 状态管理
- **Vue Router 4.6+** - 路由管理
- **Socket.IO Client 4.7+** - WebSocket 通信
- **Vite 7.2+** - 构建工具

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 通用组件
│   └── game/        # 游戏相关组件
├── services/        # 服务层（WebSocket等）
├── stores/          # Pinia 状态管理
├── views/           # 页面组件
├── router/          # 路由配置
└── main.ts          # 应用入口
```

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

访问 `http://localhost:5173`

## 构建

```bash
npm run build
```

## 类型检查

```bash
npm run type-check
```

## 功能模块

### 1. 登录注册 (`/`)
- 用户登录
- 用户注册
- 连接状态显示

### 2. 角色选择 (`/select-role`)
- 角色列表展示
- 创建新角色
- 删除角色
- 选择角色进入游戏

### 3. 游戏主界面 (`/game`)
- 角色信息卡片
- 地图导航
- 战斗系统
- 游戏日志
- 属性面板

### 4. 管理员控制台 (`/admin`)
- 管理员登录
- 在线用户监控
- 地图数据监控
- 怪物数据监控
- 数据管理操作

## 核心特性

### Vue 3 Composition API
- 使用 `<script setup>` 语法
- 响应式数据管理
- 计算属性自动缓存

### Pinia 状态管理
- 集中式状态管理
- TypeScript 类型支持
- 开发工具支持

### WebSocket 服务
- 自动重连机制
- 心跳保活
- 事件统一处理

### 组件化设计
- 可复用组件
- Props 类型安全
- 事件通信

## 开发说明

### 添加新组件

1. 在 `src/components/` 创建组件文件
2. 使用 `<script setup lang="ts">` 语法
3. 定义 Props 和 Emits 类型
4. 导入到需要的页面

### 添加新页面

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.ts` 添加路由
3. 配置路由守卫（如需要）

### 状态管理

1. 在 `src/stores/` 创建或扩展 Store
2. 使用 `defineStore` 定义 Store
3. 在组件中使用 `useStore()` 访问

### WebSocket 通信

1. 在 `src/services/socket.ts` 添加事件处理
2. 使用 `socketService.emit()` 发送消息
3. 使用 `socketService.on()` 监听事件

## 注意事项

1. **后端服务地址**：默认连接 `http://localhost:5000`，可在 `src/services/socket.ts` 修改
2. **静态资源**：图片等静态资源需要放在后端 `static/` 目录
3. **类型定义**：所有接口数据需要在 Store 中定义类型
4. **路由守卫**：可根据需要添加路由守卫进行权限控制

## 重构报告

详细的重构说明请查看 [REFACTORING_REPORT.md](./REFACTORING_REPORT.md)

## 许可证

MIT


# 安装依赖说明

## 问题
项目缺少必要的依赖包：`pinia`、`socket.io-client`、`@vueuse/core`

## 解决方案

### 方法 1：使用 CMD（推荐）

1. 打开 **命令提示符 (CMD)**（不是 PowerShell）
2. 切换到项目目录：
   ```cmd
   cd D:\vue_project\web_game_vue
   ```
3. 安装依赖：
   ```cmd
   npm install
   ```

### 方法 2：修改 PowerShell 执行策略（临时）

在 PowerShell 中运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
然后运行：
```powershell
cd D:\vue_project\web_game_vue
npm install
```

### 方法 3：使用 npx（如果 npm 可用）

```cmd
cd D:\vue_project\web_game_vue
npx npm install
```

## 验证安装

安装完成后，运行：
```cmd
npm run dev
```

如果看到以下输出，说明安装成功：
```
VITE v7.2.7  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## 注意事项

1. **静态资源代理**：已配置 Vite 代理，`/static/` 路径会自动代理到后端服务器 `http://localhost:5000`
2. **后端服务**：确保后端 Flask 服务运行在 `http://localhost:5000`
3. **WebSocket 连接**：默认连接到 `http://localhost:5000`，可在 `src/services/socket.ts` 中修改


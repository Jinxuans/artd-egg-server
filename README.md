# Admin Backend Framework

基于 Egg.js 的中后台服务端骨架，提供用户/角色/权限、文件、菜单等核心能力，便于快速搭建管理后台。

## 功能特点
- 用户认证：JWT，登录/注册/密码找回
- 权限管理：RBAC 角色、菜单/按钮权限
- 系统配置与数据字典
- 文件管理：上传、存储、访问控制
- 实时通信：Socket.io

## 技术栈
- 框架：Egg.js 3.x
- 数据库：MongoDB + Mongoose
- 缓存：Redis
- 认证：JWT
- 实时通信：Socket.io

## 快速开始
### 安装依赖
```bash
npm install
```

### 配置环境
```bash
cp config/config.default.js config/config.local.js
```
按需修改 `config.local.js`（Mongo、Redis、密钥等），也可通过环境变量 `MONGO_URI` 覆盖 Mongo 连接串。

### 初始化数据库和菜单（推荐一键）
```bash
npm run init-all -- --force-clean
```
- 默认使用 `config/config.default.js` 中的 Mongo 配置；设置 `MONGO_URI` 可覆盖。
- `--force-clean`：清空 SysMenu/UserRole 后重建；不加则安全 upsert。
- `--dry-run`：仅打印计划，不写数据库。

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```
构建输出位于 `out/egg-js/`。

### 启动/停止生产服务
```bash
npm start
npm stop
```

## 项目结构（摘要）
```
app/               # 控制器、服务、模型、中间件等
config/            # 配置文件
scripts/           # 初始化与运维脚本
run/ logs/         # 运行期输出
```

## 部署
### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 7001
CMD ["npm", "start"]
```

### PM2
```bash
pm2 start app.js --name admin-backend
```

## 许可证
MIT License

## 贡献
欢迎提交 Issue 或 PR。

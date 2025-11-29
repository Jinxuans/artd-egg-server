# Admin Backend Framework

基于Egg.js的中后台系统服务端框架，提供完整的用户管理、权限管理、文件管理等核心功能。

## 功能特性

- 🔐 **用户认证**: JWT token认证，支持登录、注册、密码管理
- 👥 **用户管理**: 用户CRUD、角色分配、权限控制
- 📁 **文件管理**: 文件上传、存储、访问控制
- 🎯 **权限系统**: 基于角色的权限控制(RBAC)
- 📊 **系统管理**: 系统配置、字典管理、菜单管理
- 🛡️ **安全防护**: 验证码、API日志、数据验证
- 📝 **通知系统**: 系统通知功能
- 💬 **实时通信**: Socket.io支持

## 技术栈

- **框架**: Egg.js 3.x
- **数据库**: MongoDB + Mongoose
- **缓存**: Redis
- **认证**: JWT
- **实时通信**: Socket.io
- **文件存储**: 本地存储
- **验证**: Egg-validate

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境

复制并修改配置文件：

```bash
cp config/config.default.js config/config.local.js
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建后的代码会输出到 `out/egg-js/` 目录，包含混淆后的JavaScript文件。

### 启动生产服务器

```bash
npm start
```

### 停止服务器

```bash
npm stop
```

## 项目结构

```
app/
├── controller/          # 控制器
│   ├── api/
│   │   └── v1/        # API v1 控制器
│   ├── core.js         # 核心控制器
│   └── home.js         # 首页控制器
├── service/            # 服务层
│   ├── api/
│   │   └── v1/        # API v1 服务
│   └── home.js         # 首页服务
├── model/              # 数据模型
├── middleware/         # 中间件
├── core/               # 核心功能
├── extend/             # 扩展
├── io/                 # Socket.io
└── router.js           # 路由配置
config/                 # 配置文件
```

## API文档

### 用户认证

#### 用户登录
```
POST /api/v1/userAuths/login
```

#### 用户注册
```
POST /api/v1/userAuths/register
```

#### 刷新Token
```
POST /api/v1/token/refreshUserToken
```

### 用户管理

#### 获取用户列表
```
GET /api/v1/user
```

#### 获取用户信息
```
GET /api/v1/user/userInfo
```

#### 创建用户
```
POST /api/v1/user/createUserByPwd
```

### 系统管理

#### 系统配置
```
GET /api/v1/system/showOne
GET /api/v1/system
```

#### 菜单管理
```
GET /api/v1/sysMenu/findTree
GET /api/v1/sysMenu
```

#### 字典管理
```
GET /api/v1/sysDictionaries
```

### 文件管理

#### 文件上传
```
POST /api/v1/sysFile/createStreamFile
POST /api/v1/sysFile/getClientUploadUrl
```

#### 文件访问
```
GET /api/v1/sysFile/showByHash/:hash
GET /api/v1/sysFile
```

## 核心功能模块

### 1. 用户认证模块
- JWT token认证
- 密码加密存储
- 登录状态管理
- 权限验证中间件

### 2. 用户管理模块
- 用户CRUD操作
- 用户角色分配
- 用户信息管理
- 批量导入用户

### 3. 权限管理模块
- 基于角色的权限控制
- 菜单权限管理
- API权限控制
- 动态权限验证

### 4. 文件管理模块
- 文件上传下载
- 文件类型验证
- 文件大小限制
- 文件访问控制

### 5. 系统管理模块
- 系统配置管理
- 数据字典管理
- 系统监控
- 操作日志

## 开发指南

### 添加新的API

1. 在 `app/controller/api/v1/` 下创建控制器
2. 在 `app/service/api/v1/` 下创建服务
3. 在 `app/model/` 下创建数据模型
4. 在 `app/router.js` 中添加路由

### 中间件使用

```javascript
// 在config/config.default.js中配置
config.middleware = ['auth'];
```

### 数据库连接

```javascript
// 在config/config.default.js中配置
config.mongoose = {
  url: 'mongodb://localhost:27017/admin_framework',
  options: {},
};
```

## 部署

### Docker部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 7001
CMD ["npm", "start"]
```

### PM2部署

```bash
pm2 start app.js --name admin-backend
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License

## 支持

如有问题，请提交 Issue 或联系维护者。
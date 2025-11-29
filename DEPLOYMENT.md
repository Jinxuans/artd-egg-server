# 部署指南

## 首次部署步骤

### 1. 环境准备

```bash
# 安装依赖
npm install

# 复制配置文件
cp config/config.default.js config/config.local.js
```

### 2. 数据库初始化

#### 方式一：手动初始化（推荐）
```bash
# 运行数据库初始化脚本
npm run init-db
```

#### 方式二：自动初始化（弃用）
启动应用后会自动检查并初始化基础数据（通过定时任务）

### 3. 配置修改

修改 `config/config.local.js` 中的以下配置：

```javascript
// 数据库配置
config.mongoose = {
  url: 'mongodb://用户名:密码@主机:端口/数据库名',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: '认证数据库',
  },
};

// Redis配置
config.redis = {
  client: {
    port: Redis端口,
    host: Redis主机,
    password: 'Redis密码',
    db: 数据库编号,
  },
};

// JWT密钥（必须修改！）
config.jwt = { secret: '你的安全密钥' };
```

### 4. 启动应用

```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

## 默认账户信息

初始化完成后，系统会创建默认管理员账户：

- **用户名**: `admin`
- **密码**: `admin123456`
- **角色**: 超级管理员

⚠️ **重要**: 首次登录后请立即修改默认密码！

## 初始化数据说明

系统会自动创建以下基础数据：

### 1. 系统配置
- 注册开关设置
- 验证码配置
- 站点基本信息

### 2. 菜单权限
- 仪表盘
- 系统管理
  - 用户管理
  - 角色管理
  - 菜单管理

### 3. 角色体系
- 超级管理员（拥有所有权限）

### 4. 数据字典
- 用户状态（正常/禁用）
- 用户性别（男/女/保密）

## 生产环境注意事项

### 1. 安全配置
```javascript
// 必须修改的安全配置
config.keys = '你的应用密钥';
config.jwt = { secret: '你的JWT密钥' };

// 启用CSRF保护
config.security = {
  csrf: { enable: true }
};

// 限制跨域域名
config.security = {
  domainWhiteList: ['你的域名']
};
```

### 2. 环境变量
创建 `.env` 文件：
```env
NODE_ENV=production
DB_URL=mongodb://...
REDIS_PASSWORD=...
JWT_SECRET=...
```

### 3. 日志配置
```javascript
// config/config.prod.js
config.logger = {
  level: 'INFO',
  dir: '/var/log/egg-app',
};
```

## 故障排除

### 1. 数据库连接失败
- 检查MongoDB服务是否启动
- 验证连接字符串和认证信息
- 确认网络连通性

### 2. Redis连接失败
- 检查Redis服务状态
- 验证密码和端口配置
- 检查防火墙设置

### 3. 初始化失败
- 查看应用日志：`tail -f logs/egg-app.log`
- 手动运行初始化脚本：`npm run init-db`
- 检查数据库权限

### 4. 权限问题
- 确认管理员账户已创建
- 检查角色权限分配
- 验证菜单权限配置

## 监控和维护

### 1. 健康检查
```bash
# 检查应用状态
curl http://localhost:7011/

# 检查数据库连接
curl http://localhost:7011/api/v1/system/showOne
```

### 2. 日志监控
```bash
# 应用日志
tail -f logs/egg-app.log

# 错误日志
tail -f logs/common-error.log
```

### 3. 数据备份
```bash
# MongoDB备份
mongodump --host 主机:端口 --db 数据库名 --out /backup/

# Redis备份
redis-cli --rdb /backup/redis-backup.rdb
```

## 性能优化

### 1. 数据库优化
- 创建必要的索引
- 定期清理过期数据
- 监控慢查询

### 2. 缓存策略
- 合理设置Redis缓存
- 使用CDN加速静态资源
- 启用Gzip压缩

### 3. 集群部署
```bash
# 使用PM2集群模式
pm2 start app.js -i max --name admin-backend

# 或使用Egg.js内置集群
npm start --workers=4
```

## 安全建议

1. **定期更新依赖包**
2. **使用HTTPS**
3. **设置防火墙规则**
4. **定期备份数据**
5. **监控异常访问**
6. **实施访问控制策略**

## 技术支持

如遇到部署问题，请：
1. 查看应用日志
2. 检查配置文件
3. 验证环境依赖
4. 提交Issue到项目仓库
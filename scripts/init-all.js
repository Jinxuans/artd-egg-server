'use strict'

/**
 * 一次性初始化：基础数据 + 菜单权限
 * 运行：
 *   node scripts/init-all.js [--force-clean] [--dry-run]
 *
 * 选项：
 *   --force-clean  清空 SysMenu/UserRole 后重建
 *   --dry-run      仅打印计划，不写数据库
 */

const mongoose = require('mongoose')
const md5 = require('md5')
const { runtimeConfig } = require('../config/config.default')

// ------------------ Menu Seed (from frontend tree) ------------------------
const menuSeed = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: '/index/index',
    meta: { title: 'menus.dashboard.title', icon: 'ri:dashboard-line' },
    children: [
      {
        path: 'console',
        name: 'Console',
        component: '/dashboard/console',
        meta: { title: 'menus.dashboard.console', keepAlive: false, fixedTab: true }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    component: '/index/index',
    meta: { title: 'menus.system.title', icon: 'ri:settings-3-line' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: '/system/user',
        meta: { title: 'menus.system.user', keepAlive: true }
      },
      {
        path: 'role',
        name: 'Role',
        component: '/system/role',
        meta: { title: 'menus.system.role', keepAlive: true }
      },
      {
        path: 'menu',
        name: 'Menus',
        component: '/system/menu',
        meta: {
          title: 'menus.system.menu',
          keepAlive: true,
          authList: [
            { title: '新增', authMark: 'add' },
            { title: '编辑', authMark: 'edit' },
            { title: '删除', authMark: 'delete' }
          ]
        }
      },
      {
        path: 'user-center',
        name: 'UserCenter',
        component: '/system/user-center',
        meta: { title: 'menus.system.userCenter', isHide: true, keepAlive: true, isHideTab: true }
      }
    ]
  },
  {
    path: '/result',
    name: 'Result',
    component: '/index/index',
    meta: { title: 'menus.result.title', icon: 'ri:checkbox-circle-line' },
    children: [
      { path: 'success', name: 'ResultSuccess', component: '/result/success', meta: { title: 'menus.result.success', keepAlive: true } },
      { path: 'fail', name: 'ResultFail', component: '/result/fail', meta: { title: 'menus.result.fail', keepAlive: true } }
    ]
  },
  {
    path: '/exception',
    name: 'Exception',
    component: '/index/index',
    meta: { title: 'menus.exception.title', icon: 'ri:alarm-warning-line' },
    children: [
      { path: '403', name: '403', component: '/exception/403', meta: { title: 'menus.exception.forbidden', keepAlive: true, isFullPage: true } },
      { path: '404', name: '404', component: '/exception/404', meta: { title: 'menus.exception.notFound', keepAlive: true, isFullPage: true } },
      { path: '500', name: '500', component: '/exception/500', meta: { title: 'menus.exception.serverError', keepAlive: true, isFullPage: true } }
    ]
  }
]

// ------------------ Helpers ------------------------
function normalizePath(path, hasParent = false) {
  if (!path) return ''
  let p = path.replace(/\.vue$/i, '')
  if (!hasParent && !p.startsWith('/')) p = `/${p}`
  if (hasParent && p.startsWith('/')) p = p.slice(1)
  return p
}

function flattenMenus(menus, parent = []) {
  const list = []
  for (const item of menus) {
    const { children = [], ...rest } = item
    const doc = {
      ...rest,
      path: rest.path ? normalizePath(rest.path, parent.length > 0) : rest.path,
      component: rest.component ? normalizePath(rest.component) : rest.component,
      menuSuperior: parent,
      menuType: rest.btnPower ? 'button' : 'menu'
    }
    list.push(doc)
    if (children.length) {
      const nextParent = rest.path ? [...parent, normalizePath(rest.path, parent.length > 0)] : parent
      list.push(...flattenMenus(children, nextParent))
    }
  }
  return list
}

function creatSaltPwd(pwd, uid) {
  return md5(md5(pwd) + uid)
}

function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// ------------------ Schemas ------------------------
const UserSchema = new mongoose.Schema({
  username: String,
  isSystem: Boolean,
  state: Number,
  userRoleIds: [mongoose.Schema.Types.ObjectId],
  userOrganIdArr: [String],
  isRobot: Boolean,
  isOpenGAuthenticator: Boolean,
  isDelete: Boolean,
  uid: { type: String, unique: true },
  lastLoginTime: { type: Date, default: Date.now }
}, { timestamps: true })

const UserAuthsSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  identifier: String,
  credential: String,
  openid: String,
  unionid: String,
  otherObj: mongoose.Schema.Types.Mixed,
  state: Number,
  isDelete: Boolean
}, { timestamps: true })

const UserInfoSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  nickname: String,
  avatar: String,
  email: String,
  phone: String,
  sex: Number,
  birthday: Date,
  address: String,
  isDelete: Boolean
}, { timestamps: true })

const UserRoleSchema = new mongoose.Schema({
  code: { type: String, index: true, unique: true },
  name: String,
  description: String,
  sysMenuIds: [{ type: mongoose.Schema.Types.ObjectId, index: 1 }],
  orderNum: { type: Number, default: 0, index: 1 },
  state: { type: Number, default: 1, index: 1 },
  isSystem: { type: Boolean, default: false },
  createUserId: { type: mongoose.Schema.Types.ObjectId, default: null },
  userOrganId: { type: mongoose.Schema.Types.ObjectId, default: null },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true })

const SysMenuSchema = new mongoose.Schema({
  name: String,
  path: String,
  component: String,
  menuType: { type: String, default: 'menu' },
  menuSuperior: [String],
  meta: mongoose.Schema.Types.Mixed,
  routerName: String,
  redirect: String,
  btnPower: String,
  servicePath: String,
  servicePathType: String,
  menuSort: { type: Number, default: 0 },
  state: { type: Number, default: 1 },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true })

const SysAppConfigSchema = new mongoose.Schema({
  isOpenRegisters: Boolean,
  isAdminRegisters: Boolean,
  isOpenVerificationCode: Boolean,
  webSiteName: String,
  logoHash: String,
  mubiaoStr: String,
  mubiaoStr2: String,
  isDelete: Boolean
}, { timestamps: true })

const SysDictionariesSchema = new mongoose.Schema({
  str: String,
  code: String,
  other: String,
  type: String,
  orderNum: Number,
  isDelete: Boolean
}, { timestamps: true })

// ------------------ Seed Data ------------------------
const initData = {
  sysAppConfig: {
    isOpenRegisters: true,
    isAdminRegisters: false,
    isOpenVerificationCode: false,
    webSiteName: '管理后台',
    logoHash: null,
    mubiaoStr: '',
    mubiaoStr2: '',
    isDelete: false
  },
  adminUser: {
    username: 'admin',
    isSystem: true,
    state: 1,
    userRoleIds: [],
    userOrganIdArr: [],
    isRobot: false,
    isOpenGAuthenticator: false,
    isDelete: false
  },
  adminAuth: {
    identifier: 'password',
    credential: '',
    openid: null,
    unionid: null,
    otherObj: null,
    state: 1,
    isDelete: false
  },
  adminInfo: {
    nickname: '系统管理员',
    avatar: '',
    email: 'admin@example.com',
    phone: '',
    sex: 1,
    birthday: null,
    address: '',
    isDelete: false
  },
  adminRole: {
    code: 'R_SUPER',
    name: '超级管理员',
    description: '系统超级管理员，拥有所有权限',
    sysMenuIds: [],
    orderNum: 0,
    state: 1,
    isSystem: true,
    isDelete: false
  },
  dictionaries: [
    { code: 'USER_STATE', type: 'user_state', str: '正常', other: '1', orderNum: 1, isDelete: false },
    { code: 'USER_STATE', type: 'user_state', str: '禁用', other: '0', orderNum: 2, isDelete: false },
    { code: 'USER_SEX', type: 'user_sex', str: '男', other: '1', orderNum: 1, isDelete: false },
    { code: 'USER_SEX', type: 'user_sex', str: '女', other: '2', orderNum: 2, isDelete: false },
    { code: 'USER_SEX', type: 'user_sex', str: '保密', other: '0', orderNum: 3, isDelete: false }
  ]
}

// ------------------ Main init ------------------------
async function initAll(options = {}) {
  const { forceClean = false, dryRun = false, skipMenus = false } = options

  const cfg = runtimeConfig()
  const DB_CONFIG = {
    url: process.env.MONGO_URI || (cfg.mongo && cfg.mongo.url),
    options: (cfg.mongo && cfg.mongo.options) || { useNewUrlParser: true, useUnifiedTopology: true }
  }
  const DEFAULT_ADMIN_PWD = cfg.defaultAdminPassword || 'admin123456'

  if (!DB_CONFIG.url || DB_CONFIG.url.trim() === '') {
    console.error('Missing Mongo connection string. Set MONGO_URI or config/config.default.js mongoose.url')
    process.exit(1)
  }

  if (dryRun) {
    console.log('[dry-run] will initialize admin + config + dictionaries + menus')
    return
  }

  await mongoose.connect(DB_CONFIG.url, DB_CONFIG.options)
  const User = mongoose.model('User', UserSchema, 'User')
  const UserAuths = mongoose.model('UserAuths', UserAuthsSchema, 'UserAuths')
  const UserInfo = mongoose.model('UserInfo', UserInfoSchema, 'UserInfo')
  const UserRole = mongoose.model('UserRole', UserRoleSchema, 'UserRole')
  const SysMenu = mongoose.model('SysMenu', SysMenuSchema, 'SysMenu')
  const SysAppConfig = mongoose.model('SysAppConfig', SysAppConfigSchema, 'SysAppConfig')
  const SysDictionaries = mongoose.model('SysDictionaries', SysDictionariesSchema, 'SysDictionaries')

  try {
    console.log('🚀 开始初始化...')

    const existingAdmin = await User.findOne({ username: 'admin' })
    if (existingAdmin) {
      console.log('⚠️ 检测到管理员账户已存在，跳过基础数据创建')
    } else {
      const sysConfig = await SysAppConfig.create(initData.sysAppConfig)
      console.log('✅ 系统配置创建完成', sysConfig._id.toString())

      // 角色
      const adminRole = await UserRole.create(initData.adminRole)
      console.log('✅ 超级管理员角色创建完成，ID:', adminRole._id.toString())

      // 用户
      const adminUid = generateUid()
      const adminUser = await User.create({ ...initData.adminUser, userRoleIds: [adminRole._id], uid: adminUid })
      console.log('✅ 管理员用户创建完成，ID:', adminUser._id.toString(), 'UID:', adminUid)

      const hashedPassword = creatSaltPwd(DEFAULT_ADMIN_PWD, adminUid)
      await UserAuths.create({ ...initData.adminAuth, userId: adminUser._id, credential: hashedPassword })
      await UserInfo.create({ ...initData.adminInfo, userId: adminUser._id })
      console.log('✅ 管理员认证与信息创建完成')

      await SysDictionaries.insertMany(initData.dictionaries)
      console.log('✅ 字典数据创建完成')
    }

    if (!skipMenus) {
      const docs = flattenMenus(menuSeed)
      if (forceClean) {
        console.log('Force clean: clearing SysMenu & UserRole...')
        await SysMenu.deleteMany({})
        // 保留用户角色，只清 role 表？为了安全：只清菜单和绑定，role 用 upsert
      }

      console.log(`Upserting ${docs.length} menu records...`)
      let touched = 0
      for (const doc of docs) {
        const res = await SysMenu.updateOne(
          { name: doc.name, path: doc.path },
          { $set: doc },
          { upsert: true }
        )
        if (res.upsertedCount || res.modifiedCount) touched += 1
      }
      console.log(`✅ 菜单 upsert 完成，变更 ${touched} 条`)

      const allMenus = await SysMenu.find({})
      const superRole = {
        ...initData.adminRole,
        sysMenuIds: allMenus.map((m) => m._id)
      }
      const roleResult = await UserRole.updateOne({ code: 'R_SUPER' }, { $set: superRole }, { upsert: true })
      console.log(`✅ 超级管理员角色绑定菜单完成（更新/插入：${roleResult.upsertedCount || roleResult.modifiedCount || 0}）`)
    } else {
      console.log('⏩ 已跳过菜单处理（skipMenus=true）')
    }

    console.log('🎉 初始化完成')
    console.log('📜 登录信息：用户名 admin  密码', DEFAULT_ADMIN_PWD)
  } catch (err) {
    console.error('❌ 初始化失败:', err)
    throw err
  } finally {
    await mongoose.disconnect()
  }
}

if (require.main === module) {
  const forceClean = process.argv.includes('--force-clean') || process.argv.includes('--force')
  const dryRun = process.argv.includes('--dry-run')
  initAll({ forceClean, dryRun }).catch(() => process.exit(1))
}

module.exports = { initAll, initData, menuSeed }

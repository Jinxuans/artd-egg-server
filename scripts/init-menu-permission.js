'use strict'

/**
 * Init SysMenu collection from a static seed that matches the frontend menu tree.
 *
 * Required env:
 *   MONGO_URI = mongodb://user:pass@host:27017/db
 *
 * Run:
 *   MONGO_URI="mongodb://user:pass@localhost:27017/test" node scripts/init-menu-permission.js
 */

const mongoose = require('mongoose')

// Load Mongo URI: prefer env MONGO_URI, otherwise reuse Egg config (config/config.default.js)
let MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  try {
    const appInfo = { name: 'artd-egg-server' }
    // config.default exports a factory fn
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const configFactory = require('../config/config.default')
    const cfg = configFactory(appInfo)
    MONGO_URI = cfg.mongoose && cfg.mongoose.url
  } catch (e) {
    // ignore, will handle below
  }
}
if (!MONGO_URI) {
  console.error('Missing Mongo URI. Set MONGO_URI env or config/config.default.js mongoose.url')
  process.exit(1)
}

// ---- Seed data (aligned to existing frontend views only) -----------------
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

// ---- Schema --------------------------------------------------------------
const SysMenuSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
)

const UserRoleSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
)

// ---- Helpers -------------------------------------------------------------
function normalizePath(path, hasParent = false) {
  if (!path) return ''
  let p = path.replace(/\\.vue$/i, '')
  // 一级菜单保持绝对路径，子级使用相对路径，避免前端校验报错
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
      const nextParent = rest.path
        ? [...parent, normalizePath(rest.path, parent.length > 0)]
        : parent
      list.push(...flattenMenus(children, nextParent))
    }
  }
  return list
}

// ---- Main ---------------------------------------------------------------
async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  const SysMenu = mongoose.model('SysMenu', SysMenuSchema, 'SysMenu')
  const UserRole = mongoose.model('UserRole', UserRoleSchema, 'UserRole')

  console.log('Clearing SysMenu...')
  await SysMenu.deleteMany({})
  console.log('Clearing UserRole...')
  await UserRole.deleteMany({})

  const docs = flattenMenus(menuSeed)
  console.log(`Inserting ${docs.length} menu records...`)
  const inserted = await SysMenu.insertMany(docs)

  // seed one super role bound to all menus
  const superRole = {
    code: 'R_SUPER',
    name: '超级管理员',
    description: 'Super administrator',
    sysMenuIds: inserted.map((m) => m._id),
    orderNum: 1,
    state: 1,
    isSystem: true
  }
  await UserRole.create(superRole)

  console.log('Done.')
  await mongoose.disconnect()
}

seed().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect()
  process.exit(1)
})

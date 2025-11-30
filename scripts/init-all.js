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
    "name": "Dashboard",
    "path": "/dashboard",
    "component": "/index/index",
    "meta": {
      "title": "menus.dashboard.title",
      "icon": "ri:pie-chart-line"
    },
    "children": [
      {
        "path": "console",
        "name": "Console",
        "component": "/dashboard/console",
        "meta": {
          "title": "menus.dashboard.console",
          "icon": "ri:home-smile-2-line",
          "keepAlive": false,
          "fixedTab": true
        }
      },
      {
        "path": "analysis",
        "name": "Analysis",
        "component": "/dashboard/analysis",
        "meta": {
          "title": "menus.dashboard.analysis",
          "icon": "ri:align-item-bottom-line",
          "keepAlive": false
        }
      },
      {
        "path": "ecommerce",
        "name": "Ecommerce",
        "component": "/dashboard/ecommerce",
        "meta": {
          "title": "menus.dashboard.ecommerce",
          "icon": "ri:bar-chart-box-line",
          "keepAlive": false
        }
      }
    ]
  },
  {
    "path": "/template",
    "name": "Template",
    "component": "/index/index",
    "meta": {
      "title": "menus.template.title",
      "icon": "ri:apps-2-line"
    },
    "children": [
      {
        "path": "cards",
        "name": "Cards",
        "component": "/template/cards",
        "meta": {
          "title": "menus.template.cards",
          "icon": "ri:wallet-line",
          "keepAlive": false
        }
      },
      {
        "path": "banners",
        "name": "Banners",
        "component": "/template/banners",
        "meta": {
          "title": "menus.template.banners",
          "icon": "ri:rectangle-line",
          "keepAlive": false
        }
      },
      {
        "path": "charts",
        "name": "Charts",
        "component": "/template/charts",
        "meta": {
          "title": "menus.template.charts",
          "icon": "ri:bar-chart-box-line",
          "keepAlive": false
        }
      },
      {
        "path": "map",
        "name": "Map",
        "component": "/template/map",
        "meta": {
          "title": "menus.template.map",
          "icon": "ri:map-pin-line",
          "keepAlive": true
        }
      },
      {
        "path": "chat",
        "name": "Chat",
        "component": "/template/chat",
        "meta": {
          "title": "menus.template.chat",
          "icon": "ri:message-3-line",
          "keepAlive": true
        }
      },
      {
        "path": "calendar",
        "name": "Calendar",
        "component": "/template/calendar",
        "meta": {
          "title": "menus.template.calendar",
          "icon": "ri:calendar-2-line",
          "keepAlive": true
        }
      },
      {
        "path": "pricing",
        "name": "Pricing",
        "component": "/template/pricing",
        "meta": {
          "title": "menus.template.pricing",
          "icon": "ri:money-cny-box-line",
          "keepAlive": true,
          "isFullPage": true
        }
      }
    ]
  },
  {
    "path": "/widgets",
    "name": "Widgets",
    "component": "/index/index",
    "meta": {
      "title": "menus.widgets.title",
      "icon": "ri:apps-2-add-line"
    },
    "children": [
      {
        "path": "icon",
        "name": "Icon",
        "component": "/widgets/icon",
        "meta": {
          "title": "menus.widgets.icon",
          "icon": "ri:palette-line",
          "keepAlive": true
        }
      },
      {
        "path": "image-crop",
        "name": "ImageCrop",
        "component": "/widgets/image-crop",
        "meta": {
          "title": "menus.widgets.imageCrop",
          "icon": "ri:screenshot-line",
          "keepAlive": true
        }
      },
      {
        "path": "excel",
        "name": "Excel",
        "component": "/widgets/excel",
        "meta": {
          "title": "menus.widgets.excel",
          "icon": "ri:download-2-line",
          "keepAlive": true
        }
      },
      {
        "path": "video",
        "name": "Video",
        "component": "/widgets/video",
        "meta": {
          "title": "menus.widgets.video",
          "icon": "ri:vidicon-line",
          "keepAlive": true
        }
      },
      {
        "path": "count-to",
        "name": "CountTo",
        "component": "/widgets/count-to",
        "meta": {
          "title": "menus.widgets.countTo",
          "icon": "ri:anthropic-line",
          "keepAlive": false
        }
      },
      {
        "path": "wang-editor",
        "name": "WangEditor",
        "component": "/widgets/wang-editor",
        "meta": {
          "title": "menus.widgets.wangEditor",
          "icon": "ri:t-box-line",
          "keepAlive": true
        }
      },
      {
        "path": "watermark",
        "name": "Watermark",
        "component": "/widgets/watermark",
        "meta": {
          "title": "menus.widgets.watermark",
          "icon": "ri:water-flash-line",
          "keepAlive": true
        }
      },
      {
        "path": "context-menu",
        "name": "ContextMenu",
        "component": "/widgets/context-menu",
        "meta": {
          "title": "menus.widgets.contextMenu",
          "icon": "ri:menu-2-line",
          "keepAlive": true
        }
      },
      {
        "path": "qrcode",
        "name": "Qrcode",
        "component": "/widgets/qrcode",
        "meta": {
          "title": "menus.widgets.qrcode",
          "icon": "ri:qr-code-line",
          "keepAlive": true
        }
      },
      {
        "path": "drag",
        "name": "Drag",
        "component": "/widgets/drag",
        "meta": {
          "title": "menus.widgets.drag",
          "icon": "ri:drag-move-fill",
          "keepAlive": true
        }
      },
      {
        "path": "text-scroll",
        "name": "TextScroll",
        "component": "/widgets/text-scroll",
        "meta": {
          "title": "menus.widgets.textScroll",
          "icon": "ri:input-method-line",
          "keepAlive": true
        }
      },
      {
        "path": "fireworks",
        "name": "Fireworks",
        "component": "/widgets/fireworks",
        "meta": {
          "title": "menus.widgets.fireworks",
          "icon": "ri:magic-line",
          "keepAlive": true,
          "showTextBadge": "Hot"
        }
      },
      {
        "path": "/outside/iframe/elementui",
        "name": "ElementUI",
        "component": "",
        "meta": {
          "title": "menus.widgets.elementUI",
          "icon": "ri:apps-2-line",
          "keepAlive": false,
          "link": "https://element-plus.org/zh-CN/component/overview.html",
          "isIframe": true
        }
      }
    ]
  },
  {
    "path": "/examples",
    "name": "Examples",
    "component": "/index/index",
    "meta": {
      "title": "menus.examples.title",
      "icon": "ri:sparkling-line"
    },
    "children": [
      {
        "path": "permission",
        "name": "Permission",
        "component": "",
        "meta": {
          "title": "menus.examples.permission.title",
          "icon": "ri:fingerprint-line"
        },
        "children": [
          {
            "path": "switch-role",
            "name": "PermissionSwitchRole",
            "component": "/examples/permission/switch-role",
            "meta": {
              "title": "menus.examples.permission.switchRole",
              "icon": "ri:contacts-line",
              "keepAlive": true
            }
          },
          {
            "path": "button-auth",
            "name": "PermissionButtonAuth",
            "component": "/examples/permission/button-auth",
            "meta": {
              "title": "menus.examples.permission.buttonAuth",
              "icon": "ri:mouse-line",
              "keepAlive": true,
              "authList": [
                {
                  "title": "??",
                  "authMark": "add"
                },
                {
                  "title": "??",
                  "authMark": "edit"
                },
                {
                  "title": "??",
                  "authMark": "delete"
                },
                {
                  "title": "??",
                  "authMark": "export"
                },
                {
                  "title": "??",
                  "authMark": "view"
                },
                {
                  "title": "??",
                  "authMark": "publish"
                },
                {
                  "title": "??",
                  "authMark": "config"
                },
                {
                  "title": "??",
                  "authMark": "manage"
                }
              ]
            }
          },
          {
            "path": "page-visibility",
            "name": "PermissionPageVisibility",
            "component": "/examples/permission/page-visibility",
            "meta": {
              "title": "menus.examples.permission.pageVisibility",
              "icon": "ri:user-3-line",
              "keepAlive": true,
              "roles": [
                "R_SUPER"
              ]
            }
          }
        ]
      },
      {
        "path": "tabs",
        "name": "Tabs",
        "component": "/examples/tabs",
        "meta": {
          "title": "menus.examples.tabs",
          "icon": "ri:price-tag-line"
        }
      },
      {
        "path": "tables/basic",
        "name": "TablesBasic",
        "component": "/examples/tables/basic",
        "meta": {
          "title": "menus.examples.tablesBasic",
          "icon": "ri:layout-grid-line",
          "keepAlive": true
        }
      },
      {
        "path": "tables",
        "name": "Tables",
        "component": "/examples/tables",
        "meta": {
          "title": "menus.examples.tables",
          "icon": "ri:table-3",
          "keepAlive": true
        }
      },
      {
        "path": "forms",
        "name": "Forms",
        "component": "/examples/forms",
        "meta": {
          "title": "menus.examples.forms",
          "icon": "ri:table-view",
          "keepAlive": true
        }
      },
      {
        "path": "form/search-bar",
        "name": "SearchBar",
        "component": "/examples/forms/search-bar",
        "meta": {
          "title": "menus.examples.searchBar",
          "icon": "ri:table-line",
          "keepAlive": true
        }
      },
      {
        "path": "tables/tree",
        "name": "TablesTree",
        "component": "/examples/tables/tree",
        "meta": {
          "title": "menus.examples.tablesTree",
          "icon": "ri:layout-2-line",
          "keepAlive": true
        }
      },
      {
        "path": "socket-chat",
        "name": "SocketChat",
        "component": "/examples/socket-chat",
        "meta": {
          "title": "menus.examples.socketChat",
          "icon": "ri:shake-hands-line",
          "keepAlive": true,
          "showTextBadge": "New"
        }
      }
    ]
  },
  {
    "path": "/system",
    "name": "System",
    "component": "/index/index",
    "meta": {
      "title": "menus.system.title",
      "icon": "ri:user-3-line"
    },
    "children": [
      {
        "path": "user",
        "name": "User",
        "component": "/system/user",
        "meta": {
          "title": "menus.system.user",
          "icon": "ri:user-line",
          "keepAlive": true,
          "roles": [
            "R_SUPER",
            "R_ADMIN"
          ]
        }
      },
      {
        "path": "role",
        "name": "Role",
        "component": "/system/role",
        "meta": {
          "title": "menus.system.role",
          "icon": "ri:user-settings-line",
          "keepAlive": true,
          "roles": [
            "R_SUPER"
          ]
        }
      },
      {
        "path": "user-center",
        "name": "UserCenter",
        "component": "/system/user-center",
        "meta": {
          "title": "menus.system.userCenter",
          "icon": "ri:user-line",
          "isHide": true,
          "keepAlive": true,
          "isHideTab": true
        }
      },
      {
        "path": "menu",
        "name": "Menus",
        "component": "/system/menu",
        "meta": {
          "title": "menus.system.menu",
          "icon": "ri:menu-line",
          "keepAlive": true,
          "roles": [
            "R_SUPER"
          ],
          "authList": [
            {
              "title": "??",
              "authMark": "add"
            },
            {
              "title": "??",
              "authMark": "edit"
            },
            {
              "title": "??",
              "authMark": "delete"
            }
          ]
        }
      },
      {
        "path": "nested",
        "name": "Nested",
        "component": "",
        "meta": {
          "title": "menus.system.nested",
          "icon": "ri:menu-unfold-3-line",
          "keepAlive": true
        },
        "children": [
          {
            "path": "menu1",
            "name": "NestedMenu1",
            "component": "/system/nested/menu1",
            "meta": {
              "title": "menus.system.menu1",
              "icon": "ri:align-justify",
              "keepAlive": true
            }
          },
          {
            "path": "menu2",
            "name": "NestedMenu2",
            "component": "",
            "meta": {
              "title": "menus.system.menu2",
              "icon": "ri:align-justify",
              "keepAlive": true
            },
            "children": [
              {
                "path": "menu2-1",
                "name": "NestedMenu2-1",
                "component": "/system/nested/menu2",
                "meta": {
                  "title": "menus.system.menu21",
                  "icon": "ri:align-justify",
                  "keepAlive": true
                }
              }
            ]
          },
          {
            "path": "menu3",
            "name": "NestedMenu3",
            "component": "",
            "meta": {
              "title": "menus.system.menu3",
              "icon": "ri:align-justify",
              "keepAlive": true
            },
            "children": [
              {
                "path": "menu3-1",
                "name": "NestedMenu3-1",
                "component": "/system/nested/menu3",
                "meta": {
                  "title": "menus.system.menu31",
                  "keepAlive": true
                }
              },
              {
                "path": "menu3-2",
                "name": "NestedMenu3-2",
                "component": "",
                "meta": {
                  "title": "menus.system.menu32",
                  "keepAlive": true
                },
                "children": [
                  {
                    "path": "menu3-2-1",
                    "name": "NestedMenu3-2-1",
                    "component": "/system/nested/menu3/menu3-2",
                    "meta": {
                      "title": "menus.system.menu321",
                      "keepAlive": true
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "path": "/article",
    "name": "Article",
    "component": "/index/index",
    "meta": {
      "title": "menus.article.title",
      "icon": "ri:book-2-line"
    },
    "children": [
      {
        "path": "article-list",
        "name": "ArticleList",
        "component": "/article/list",
        "meta": {
          "title": "menus.article.articleList",
          "icon": "ri:article-line",
          "keepAlive": true,
          "authList": [
            {
              "title": "??",
              "authMark": "add"
            },
            {
              "title": "??",
              "authMark": "edit"
            }
          ]
        }
      },
      {
        "path": "detail/:id",
        "name": "ArticleDetail",
        "component": "/article/detail",
        "meta": {
          "title": "menus.article.articleDetail",
          "isHide": true,
          "keepAlive": true,
          "activePath": "/article/article-list"
        }
      },
      {
        "path": "comment",
        "name": "ArticleComment",
        "component": "/article/comment",
        "meta": {
          "title": "menus.article.comment",
          "icon": "ri:mail-line",
          "keepAlive": true
        }
      },
      {
        "path": "publish",
        "name": "ArticlePublish",
        "component": "/article/publish",
        "meta": {
          "title": "menus.article.articlePublish",
          "icon": "ri:telegram-2-line",
          "keepAlive": true,
          "authList": [
            {
              "title": "??",
              "authMark": "add"
            }
          ]
        }
      }
    ]
  },
  {
    "path": "/result",
    "name": "Result",
    "component": "/index/index",
    "meta": {
      "title": "menus.result.title",
      "icon": "ri:checkbox-circle-line"
    },
    "children": [
      {
        "path": "success",
        "name": "ResultSuccess",
        "component": "/result/success",
        "meta": {
          "title": "menus.result.success",
          "icon": "ri:checkbox-circle-line",
          "keepAlive": true
        }
      },
      {
        "path": "fail",
        "name": "ResultFail",
        "component": "/result/fail",
        "meta": {
          "title": "menus.result.fail",
          "icon": "ri:close-circle-line",
          "keepAlive": true
        }
      }
    ]
  },
  {
    "path": "/exception",
    "name": "Exception",
    "component": "/index/index",
    "meta": {
      "title": "menus.exception.title",
      "icon": "ri:error-warning-line"
    },
    "children": [
      {
        "path": "403",
        "name": "403",
        "component": "/exception/403",
        "meta": {
          "title": "menus.exception.forbidden",
          "keepAlive": true,
          "isFullPage": true
        }
      },
      {
        "path": "404",
        "name": "404",
        "component": "/exception/404",
        "meta": {
          "title": "menus.exception.notFound",
          "keepAlive": true,
          "isFullPage": true
        }
      },
      {
        "path": "500",
        "name": "500",
        "component": "/exception/500",
        "meta": {
          "title": "menus.exception.serverError",
          "keepAlive": true,
          "isFullPage": true
        }
      }
    ]
  },
  {
    "path": "/safeguard",
    "name": "Safeguard",
    "component": "/index/index",
    "meta": {
      "title": "menus.safeguard.title",
      "icon": "ri:shield-check-line",
      "keepAlive": false
    },
    "children": [
      {
        "path": "server",
        "name": "SafeguardServer",
        "component": "/safeguard/server",
        "meta": {
          "title": "menus.safeguard.server",
          "icon": "ri:hard-drive-3-line",
          "keepAlive": true
        }
      }
    ]
  },
  {
    "name": "Document",
    "path": "",
    "component": "",
    "meta": {
      "title": "menus.help.document",
      "icon": "ri:bill-line",
      "link": "https://www.artd.pro/docs/zh/",
      "isIframe": false,
      "keepAlive": false,
      "isFirstLevel": true
    }
  },
  {
    "name": "LiteVersion",
    "path": "",
    "component": "",
    "meta": {
      "title": "menus.help.liteVersion",
      "icon": "ri:bus-2-line",
      "link": "https://www.artd.pro/docs/zh/guide/lite-version.html",
      "isIframe": false,
      "keepAlive": false,
      "isFirstLevel": true
    }
  },
  {
    "name": "ChangeLog",
    "path": "/change/log",
    "component": "/change/log",
    "meta": {
      "title": "menus.plan.log",
      "icon": "ri:gamepad-line",
      "keepAlive": false,
      "isFirstLevel": true
    }
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
  userUser: {
    username: 'user',
    isSystem: false,
    state: 1,
    userRoleIds: [],
    userOrganIdArr: [],
    isRobot: false,
    isOpenGAuthenticator: false,
    isDelete: false
  },
  userAuth: {
    identifier: 'password',
    credential: '',
    openid: null,
    unionid: null,
    otherObj: null,
    state: 1,
    isDelete: false
  },
  userInfo: {
    nickname: '????',
    avatar: '',
    email: 'user@example.com',
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
  userRole: {
    code: 'R_USER',
    name: '????',
    description: '??????????',
    sysMenuIds: [],
    orderNum: 10,
    state: 1,
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
  const DEFAULT_USER_PWD = cfg.defaultUserPassword || '123456'

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

        // ??????
        const defaultRoleDoc = await UserRole.findOne({ code: 'R_USER', isDelete: false })
        const commonUid = generateUid()
        const commonUser = await User.create({ ...initData.userUser, userRoleIds: defaultRoleDoc ? [defaultRoleDoc._id] : [], uid: commonUid })
        const commonPassword = creatSaltPwd(DEFAULT_USER_PWD, commonUid)
        await UserAuths.create({ ...initData.userAuth, userId: commonUser._id, credential: commonPassword })
        await UserInfo.create({ ...initData.userInfo, userId: commonUser._id })
        console.log('默认用户创建完成，账号 user，密码', DEFAULT_USER_PWD)

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
      console.log(`超级管理员角色绑定菜单完成（更新/插入：${roleResult.upsertedCount || roleResult.modifiedCount || 0}）`)

      // 默认用户角色：绑定非管理员菜单，保证普通注册用户可见基础页面
      const commonRole = {
        ...initData.userRole,
        sysMenuIds: allMenus
          .filter((m) => !(Array.isArray(m.meta?.roles) && m.meta.roles.some((r) => ['R_SUPER', 'R_ADMIN'].includes(r))))
          .map((m) => m._id)
      }
      const commonRoleResult = await UserRole.updateOne(
        { code: 'R_USER' },
        { $set: commonRole },
        { upsert: true }
      )
      console.log('默认用户角色绑定菜单完成', commonRoleResult.upsertedCount || commonRoleResult.modifiedCount || 0)

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

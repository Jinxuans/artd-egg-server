'use strict';

/**
 * 数据库初始化脚本
 * 首次部署时运行：node scripts/init-database.js
 */

const mongoose = require('mongoose');
const md5 = require('md5');

// 生成加盐密码的函数，与注册逻辑保持一致
function creatSaltPwd(pwd, uid) {
  return md5(md5(pwd) + uid);
}

// 生成唯一ID的函数
function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 数据库连接配置
const DB_CONFIG = {
  url: 'mongodb://test:Sd3LrKBP65aFPrHj@43.130.231.27:27017/test',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: 'test',
  }
};

// 初始化数据
const initData = {
  // 系统配置
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

  // 管理员用户
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

  // 管理员认证信息（密码将在创建用户后动态生成）
  adminAuth: {
    identifier: 'password',
    credential: '', // 将在创建用户后动态生成
    openid: null,
    unionid: null,
    otherObj: null,
    state: 1,
    isDelete: false
  },

  // 管理员详细信息
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

  // 超级管理员角色
  adminRole: {
    name: '超级管理员',
    description: '系统超级管理员，拥有所有权限',
    sysMenuIds: [],
    orderNum: 0,
    state: 1,
    isSystem: true,
    isDelete: false
  },

  // 基础菜单数据
  menus: [
    {
      name: 'dashboard',
      title: '仪表盘',
      path: '/dashboard',
      component: 'dashboard/index',
      menuType: 'menu',
      servicePath: '/api/v1/dashboard',
      servicePathType: 'GET',
      menuSuperior: [],
      meta: {
        title: '仪表盘',
        isLink: '',
        isHide: false,
        isKeepAlive: true,
        isAffix: true,
        isIframe: false,
        icon: 'dashboard'
      },
      routerName: 'dashboard',
      menuSort: 0,
      state: 1,
      isDelete: false
    },
    {
      name: 'system',
      title: '系统管理',
      path: '/system',
      component: '',
      menuType: 'menu',
      servicePath: '',
      servicePathType: '',
      menuSuperior: [],
      meta: {
        title: '系统管理',
        isLink: '',
        isHide: false,
        isKeepAlive: false,
        isAffix: false,
        isIframe: false,
        icon: 'system'
      },
      routerName: 'system',
      menuSort: 1,
      state: 1,
      isDelete: false
    },
    {
      name: 'user',
      title: '用户管理',
      path: '/system/user',
      component: 'system/user/index',
      menuType: 'menu',
      servicePath: '/api/v1/user',
      servicePathType: 'GET',
      menuSuperior: ['system'],
      meta: {
        title: '用户管理',
        isLink: '',
        isHide: false,
        isKeepAlive: true,
        isAffix: false,
        isIframe: false,
        icon: 'user'
      },
      routerName: 'systemUser',
      menuSort: 1,
      state: 1,
      isDelete: false
    },
    {
      name: 'role',
      title: '角色管理',
      path: '/system/role',
      component: 'system/role/index',
      menuType: 'menu',
      servicePath: '/api/v1/userRole',
      servicePathType: 'GET',
      menuSuperior: ['system'],
      meta: {
        title: '角色管理',
        isLink: '',
        isHide: false,
        isKeepAlive: true,
        isAffix: false,
        isIframe: false,
        icon: 'role'
      },
      routerName: 'systemRole',
      menuSort: 2,
      state: 1,
      isDelete: false
    },
    {
      name: 'menu',
      title: '菜单管理',
      path: '/system/menu',
      component: 'system/menu/index',
      menuType: 'menu',
      servicePath: '/api/v1/sysMenu',
      servicePathType: 'GET',
      menuSuperior: ['system'],
      meta: {
        title: '菜单管理',
        isLink: '',
        isHide: false,
        isKeepAlive: true,
        isAffix: false,
        isIframe: false,
        icon: 'menu'
      },
      routerName: 'systemMenu',
      menuSort: 3,
      state: 1,
      isDelete: false
    }
  ],

  // 基础字典数据
  dictionaries: [
    {
      code: 'USER_STATE',
      type: 'user_state',
      str: '正常',
      other: '1',
      orderNum: 1,
      isDelete: false
    },
    {
      code: 'USER_STATE',
      type: 'user_state', 
      str: '禁用',
      other: '0',
      orderNum: 2,
      isDelete: false
    },
    {
      code: 'USER_SEX',
      type: 'user_sex',
      str: '男',
      other: '1',
      orderNum: 1,
      isDelete: false
    },
    {
      code: 'USER_SEX',
      type: 'user_sex',
      str: '女', 
      other: '2',
      orderNum: 2,
      isDelete: false
    },
    {
      code: 'USER_SEX',
      type: 'user_sex',
      str: '保密',
      other: '0',
      orderNum: 3,
      isDelete: false
    }
  ]
};

// Schema 定义（简化版）
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
}, { timestamps: true });

const UserAuthsSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  identifier: String,
  credential: String,
  openid: String,
  unionid: String,
  otherObj: mongoose.Schema.Types.Mixed,
  state: Number,
  isDelete: Boolean
}, { timestamps: true });

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
}, { timestamps: true });

const UserRoleSchema = new mongoose.Schema({
  name: String,
  description: String,
  sysMenuIds: [mongoose.Schema.Types.ObjectId],
  orderNum: Number,
  state: Number,
  isSystem: Boolean,
  createUserId: mongoose.Schema.Types.ObjectId,
  userOrganId: mongoose.Schema.Types.ObjectId,
  isDelete: Boolean
}, { timestamps: true });

const SysMenuSchema = new mongoose.Schema({
  name: String,
  title: String,
  path: String,
  component: String,
  menuType: String,
  servicePath: String,
  servicePathType: String,
  menuSuperior: [String],
  meta: mongoose.Schema.Types.Mixed,
  routerName: String,
  menuSort: Number,
  state: Number,
  createUserId: mongoose.Schema.Types.ObjectId,
  isDelete: Boolean
}, { timestamps: true });

const SysAppConfigSchema = new mongoose.Schema({
  isOpenRegisters: Boolean,
  isAdminRegisters: Boolean,
  isOpenVerificationCode: Boolean,
  webSiteName: String,
  logoHash: String,
  mubiaoStr: String,
  mubiaoStr2: String,
  isDelete: Boolean
}, { timestamps: true });

const SysDictionariesSchema = new mongoose.Schema({
  str: String,
  code: String,
  other: String,
  type: String,
  orderNum: Number,
  isDelete: Boolean
}, { timestamps: true });

async function initDatabase() {
  try {
    console.log('🚀 开始初始化数据库...');
    
    // 连接数据库
    await mongoose.connect(DB_CONFIG.url, DB_CONFIG.options);
    console.log('✅ 数据库连接成功');

    // 定义模型（使用与app/model中一致的表名）
    const User = mongoose.model('User', UserSchema, 'User');
    const UserAuths = mongoose.model('UserAuths', UserAuthsSchema, 'UserAuths');
    const UserInfo = mongoose.model('UserInfo', UserInfoSchema, 'UserInfo');
    const UserRole = mongoose.model('UserRole', UserRoleSchema, 'UserRole');
    const SysMenu = mongoose.model('SysMenu', SysMenuSchema, 'SysMenu');
    const SysAppConfig = mongoose.model('SysAppConfig', SysAppConfigSchema, 'SysAppConfig');
    const SysDictionaries = mongoose.model('SysDictionaries', SysDictionariesSchema, 'SysDictionaries');

    // 检查是否已初始化
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  检测到管理员账户已存在，跳过初始化');
      // console.log(existingAdmin);
      await mongoose.disconnect();
      return;
    }

    console.log('📝 开始创建基础数据...');

    // 1. 创建系统配置
    const sysConfig = await SysAppConfig.create(initData.sysAppConfig);
    console.log('✅ 系统配置创建完成');

    // 2. 创建菜单
    const menus = await SysMenu.insertMany(initData.menus);
    console.log('✅ 菜单数据创建完成');

    // 3. 创建超级管理员角色
    const adminRoleData = {
      ...initData.adminRole,
      sysMenuIds: menus.map(menu => menu._id)
    };
    const adminRole = await UserRole.create(adminRoleData);
    console.log('✅ 超级管理员角色创建完成，ID:', adminRole._id);

    // 4. 创建管理员用户（先生成UID）
    const adminUid = generateUid();
    const adminUserData = {
      ...initData.adminUser,
      userRoleIds: [adminRole._id],
      uid: adminUid
    };
    const adminUser = await User.create(adminUserData);
    console.log('✅ 管理员用户创建完成，ID:', adminUser._id, 'UID:', adminUid);

    // 5. 创建管理员认证信息（使用加盐密码）
    const defaultPassword = 'admin123456';
    const hashedPassword = creatSaltPwd(defaultPassword, adminUid);
    const adminAuthData = {
      ...initData.adminAuth,
      userId: adminUser._id,
      credential: hashedPassword
    };
    await UserAuths.create(adminAuthData);
    console.log('✅ 管理员认证信息创建完成，密码已加盐处理');

    // 6. 创建管理员详细信息
    const adminInfoData = {
      ...initData.adminInfo,
      userId: adminUser._id
    };
    console.log('准备创建用户信息，数据:', adminInfoData);
    await UserInfo.create(adminInfoData);
    console.log('✅ 管理员详细信息创建完成');

    // 7. 创建字典数据
    await SysDictionaries.insertMany(initData.dictionaries);
    console.log('✅ 字典数据创建完成');

    console.log('🎉 数据库初始化完成！');
    console.log('📋 登录信息：');
    console.log('   用户名：admin');
    console.log('   密码：admin123456');
    console.log('⚠️  请及时修改默认密码！');

  } catch (error) {
    console.error('❌ 数据库初始化失败：', error);
  } finally {
    await mongoose.disconnect();
  }
}

// 运行初始化
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase, initData };
/**
 * 菜单权限测试脚本
 * 用于验证前后端菜单权限数据结构的一致性
 */

const testMenuData = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: '@/views/dashboard/console/index',
    meta: {
      title: '仪表盘',
      icon: 'dashboard',
      isHide: false,
      isKeepAlive: true,
      isAffix: true,
      isIframe: false,
      showBadge: false,
      showTextBadge: '',
      isHideTab: false,
      link: '',
      keepAlive: true,
      authList: [],
      isFirstLevel: true,
      roles: ['admin', 'user'],
      fixedTab: false,
      activePath: '',
      isFullPage: false,
      isAuthButton: false,
      authMark: '',
      parentPath: ''
    },
    redirect: '',
    routerName: 'Dashboard'
  },
  {
    path: '/system',
    name: 'System',
    component: 'Layout',
    meta: {
      title: '系统管理',
      icon: 'system',
      isHide: false,
      isKeepAlive: false,
      isAffix: false,
      isIframe: false,
      showBadge: false,
      showTextBadge: '',
      isHideTab: false,
      link: '',
      keepAlive: false,
      authList: [],
      isFirstLevel: true,
      roles: ['admin'],
      fixedTab: false,
      activePath: '',
      isFullPage: false,
      isAuthButton: false,
      authMark: '',
      parentPath: ''
    },
    redirect: '/system/user',
    routerName: 'System',
    children: [
      {
        path: '/system/user',
        name: 'SystemUser',
        component: '@/views/system/user/index',
        meta: {
          title: '用户管理',
          icon: 'user',
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          showBadge: false,
          showTextBadge: '',
          isHideTab: false,
          link: '',
          keepAlive: true,
          authList: [
            { title: '新增用户', authMark: 'add:user' },
            { title: '编辑用户', authMark: 'edit:user' },
            { title: '删除用户', authMark: 'delete:user' }
          ],
          isFirstLevel: false,
          roles: ['admin'],
          fixedTab: false,
          activePath: '',
          isFullPage: false,
          isAuthButton: false,
          authMark: '',
          parentPath: '/system'
        },
        redirect: '',
        routerName: 'SystemUser'
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        component: '@/views/system/role/index',
        meta: {
          title: '角色管理',
          icon: 'role',
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          showBadge: false,
          showTextBadge: '',
          isHideTab: false,
          link: '',
          keepAlive: true,
          authList: [
            { title: '新增角色', authMark: 'add:role' },
            { title: '编辑角色', authMark: 'edit:role' },
            { title: '删除角色', authMark: 'delete:role' }
          ],
          isFirstLevel: false,
          roles: ['admin'],
          fixedTab: false,
          activePath: '',
          isFullPage: false,
          isAuthButton: false,
          authMark: '',
          parentPath: '/system'
        },
        redirect: '',
        routerName: 'SystemRole'
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        component: '@/views/system/menu/index',
        meta: {
          title: '菜单管理',
          icon: 'menu',
          isHide: false,
          isKeepAlive: true,
          isAffix: false,
          isIframe: false,
          showBadge: false,
          showTextBadge: '',
          isHideTab: false,
          link: '',
          keepAlive: true,
          authList: [
            { title: '新增菜单', authMark: 'add:menu' },
            { title: '编辑菜单', authMark: 'edit:menu' },
            { title: '删除菜单', authMark: 'delete:menu' }
          ],
          isFirstLevel: false,
          roles: ['admin'],
          fixedTab: false,
          activePath: '',
          isFullPage: false,
          isAuthButton: false,
          authMark: '',
          parentPath: '/system'
        },
        redirect: '',
        routerName: 'SystemMenu'
      }
    ]
  }
];

// 按钮权限测试数据
const testButtonData = [
  {
    path: '',
    name: 'AddUserBtn',
    component: '',
    menuType: 'button',
    btnPower: 'add:user',
    meta: {
      title: '新增用户',
      isAuthButton: true,
      authMark: 'add:user',
      parentPath: '/system/user'
    }
  },
  {
    path: '',
    name: 'EditUserBtn',
    component: '',
    menuType: 'button',
    btnPower: 'edit:user',
    meta: {
      title: '编辑用户',
      isAuthButton: true,
      authMark: 'edit:user',
      parentPath: '/system/user'
    }
  },
  {
    path: '',
    name: 'DeleteUserBtn',
    component: '',
    menuType: 'button',
    btnPower: 'delete:user',
    meta: {
      title: '删除用户',
      isAuthButton: true,
      authMark: 'delete:user',
      parentPath: '/system/user'
    }
  }
];

console.log('菜单权限测试数据准备完成');
console.log('菜单数据结构:', JSON.stringify(testMenuData, null, 2));
console.log('按钮权限数据结构:', JSON.stringify(testButtonData, null, 2));

module.exports = {
  testMenuData,
  testButtonData
};
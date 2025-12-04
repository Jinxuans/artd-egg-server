'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, io } = app;
  const v1 = '/api/v1';

  router.get('/', controller.home.index);
  router.get('/ceshi', controller.home.ceshi);

  // 前端动态菜单（全量，优先于 system 资源路由）
  router.get(`${v1}/system/menus`, controller.api.v1.sysMenu.getSimpleMenus);

  // 系统文件
  router.resources('sysFile', `${v1}/sysFile`, controller.api.v1.sysFile);
  // 系统配置
  router.get(`${v1}/system/showOne`, controller.api.v1.system.showOne);
  router.resources('system', `${v1}/system`, controller.api.v1.system);


  router.get(`${v1}/sysAppConfig/showOne`, controller.api.v1.sysAppConfig.showOne);
  router.resources('sysAppConfig', `${v1}/sysAppConfig`, controller.api.v1.sysAppConfig);
  router.resources('sysTenants', `${v1}/sysTenants`, controller.api.v1.sysTenants);

  // 系统文件管理
  router.get(`${v1}/sysFile/showByHash/:hash`, controller.api.v1.sysFile.showByHash);
  router.post(`${v1}/sysFile/createStreamFile`, controller.api.v1.sysFile.createStreamFile);
  router.post(`${v1}/sysFile/getClientUploadUrl`, controller.api.v1.sysFile.getClientUploadUrl);
  router.resources('sysFile', `${v1}/sysFile`, controller.api.v1.sysFile);
  // 系统字典
  router.resources('sysDictionaries', `${v1}/sysDictionaries`, controller.api.v1.sysDictionaries);

  // 用户 - 具体路由必须在 resources 之前，避免冲突
  router.get(`${v1}/user/info`, controller.api.v1.user.userInfo);
  router.get(`${v1}/user/userInfo`, controller.api.v1.user.userInfo);
  router.get('/api/user/info', controller.api.v1.user.userInfo); // 前端适配
  router.get(`${v1}/user/:id/userInfo`, controller.api.v1.user.userInfoById);
  router.post(`${v1}/user/createUserByPwd`, controller.api.v1.user.createUserByPwd);
  router.post(`${v1}/user/importUser`, controller.api.v1.user.importUser);
  // 修改密码
  router.put(`${v1}/user/:id/changePwdByAdmin`, controller.api.v1.user.changePwdByAdmin);
  // 修改用户资料
  router.put(`${v1}/user/:id/changeUserInfoByAdmin`, controller.api.v1.user.changeUserInfoByAdmin);
  router.put(`${v1}/user/changeUserInfo`, controller.api.v1.user.changeUserInfo);
  // 前端用户列表（分页）统一为 v1 前缀
  router.get(`${v1}/user/list`, controller.api.v1.user.list);

  // RESTful 资源路由（必须放在具体路由之后）
  router.resources('user', `${v1}/user`, controller.api.v1.user);
  // 验证码
  router.post(`${v1}/sysCaptcha/createCaptcha`, controller.api.v1.sysCaptcha.createCaptcha);


  // 刷新token
  router.post(`${v1}/token/refreshUserToken`, controller.api.v1.token.refreshUserToken);

  // 用户注册
  router.post(`${v1}/userAuths/register`, controller.api.v1.userAuths.register);
  router.post(`${v1}/userAuths/login`, controller.api.v1.userAuths.login);
  // 前端适配登录/注册/登出
  router.post('/api/auth/login', controller.api.v1.userAuths.frontendLogin);
  router.post('/api/auth/register', controller.api.v1.userAuths.register);
  // 用户退出登录
  router.post(`${v1}/userAuths/loginOut`, controller.api.v1.userAuths.loginOut);

  router.post(`${v1}/userAuths/getMobileByCode`, controller.api.v1.userAuths.getMobileByCode);

  router.resources('userAuths', `${v1}/userAuths`, controller.api.v1.userAuths);


  // 用户信息 - 具体路由必须在 resources 之前
  
  router.resources('userInfo', `${v1}/userInfo`, controller.api.v1.userInfo);

  // 用户菜单
  router.get(`${v1}/sysMenu/findTree`, controller.api.v1.sysMenu.findTree);
  router.resources('sysMenu', `${v1}/sysMenu`, controller.api.v1.sysMenu);

  // 角色
  router.resources('userRole', `${v1}/userRole`, controller.api.v1.userRole);

  // 通知
  router.resources('notice', `${v1}/notice`, controller.api.v1.notice);


  io.route('join', io.controller.chat.join);
  io.route('leave', io.controller.chat.leave);
  io.route('linUp', io.controller.linUp.index);


  io.route('sendMsg', app.io.controller.chat.ping);
  io.route('disconnect', app.io.controller.chat.disconnect);
};

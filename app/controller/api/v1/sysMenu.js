
'use strict';
const Controller = require('../../../core/base_controller');

class SysMenuController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'sysMenu';
  }

  /**
   * 根据用户的部门id获取他下级部门信息
   */
  async findTree() {
    const { ctx } = this;

    // 组装参数
    const payload = ctx.query;

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.sysMenu.findTree(payload, {});
    this.jsonSuccess(res);
  }

  /**
   * 获取简化菜单列表（适配前端）
   */
  async getSimpleMenus() {
    const { ctx } = this;

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.sysMenu.getSimpleMenus();
    this.jsonSuccess(res);
  }


}

module.exports = SysMenuController;

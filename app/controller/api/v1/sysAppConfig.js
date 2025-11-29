
'use strict';
const Controller = require('../../../core/base_controller');

class SysAppConfigController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'sysAppConfig';
  }

  async showOne() {
    const { ctx } = this;
    const res = await ctx.service.api.v1.sysAppConfig.showOne();
    this.jsonSuccess(res);
  }

}

module.exports = SysAppConfigController;

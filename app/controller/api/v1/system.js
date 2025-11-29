
'use strict';
const Controller = require('../../../core/base_controller');

class SystemController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'system';
  }

  async showOne() {
    const { ctx } = this;
    const res = await ctx.service.api.v1.system.showOne();
    this.jsonSuccess(res);
  }

}

module.exports = SystemController;
